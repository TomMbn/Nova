"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  clearPendingSignup,
  getPendingSignup,
  setPendingSignup,
} from "@/lib/pending-signup";

export async function chooseRole(formData: FormData) {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");

  const roleId = String(formData.get("roleId") || "");
  if (!roleId) redirect("/inscription");

  await setPendingSignup({ ...pending, roleId });
  redirect("/inscription/specialites");
}

export async function chooseTopics(formData: FormData) {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");
  if (!pending.roleId) redirect("/inscription");

  const topicIds = formData.getAll("topicIds").map(String);
  await setPendingSignup({ ...pending, topicIds });
  redirect("/inscription/profil");
}

export async function skipTopics() {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");
  if (!pending.roleId) redirect("/inscription");

  await setPendingSignup({ ...pending, topicIds: [] });
  redirect("/inscription/profil");
}

export type CompleteProfileState = {
  error?: string;
};

export async function completeProfile(
  _prevState: CompleteProfileState,
  formData: FormData
): Promise<CompleteProfileState> {
  const pending = await getPendingSignup();
  if (!pending) redirect("/login");
  if (!pending.roleId) redirect("/inscription");

  const prenom = String(formData.get("prenom") || "").trim();
  const nom = String(formData.get("nom") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const skillsRaw = String(formData.get("skills") || "");
  const classId = String(formData.get("classId") || "");
  const company = String(formData.get("company") || "").trim();

  if (!prenom || !nom) {
    return { error: "Prénom et nom sont requis." };
  }

  const passwordHash = await bcrypt.hash(pending.password, 10);

  const user = await prisma.user.create({
    data: {
      email: pending.email,
      passwordHash,
      name: `${prenom} ${nom}`.trim(),
      bio: bio || null,
      roleId: BigInt(pending.roleId),
      currentClassId: classId ? BigInt(classId) : null,
    },
  });

  const topicIds = pending.topicIds ?? [];
  if (topicIds.length > 0) {
    await prisma.followedTopic.createMany({
      data: topicIds.map((id) => ({ userId: user.id, topicId: BigInt(id) })),
      skipDuplicates: true,
    });
  }

  const skillNames = [
    ...new Set(
      skillsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];
  for (const name of skillNames) {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: user.id, skillId: skill.id } },
      update: {},
      create: { userId: user.id, skillId: skill.id },
    });
  }

  if (company) {
    const companyRow = await prisma.company.upsert({
      where: { name: company },
      update: {},
      create: { name: company },
    });
    await prisma.experience.create({
      data: { userId: user.id, companyId: companyRow.id, isCurrent: true },
    });
  }

  await clearPendingSignup();

  try {
    await signIn("credentials", {
      email: pending.email,
      password: pending.password,
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        error:
          "Votre compte a été créé mais la connexion a échoué. Réessayez depuis la page de connexion.",
      };
    }
    throw err;
  }

  return {};
}
