"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export type LoginState = {
  error?: string;
};

export async function loginOrSignup(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (!email || !password) {
    return { error: "Adresse e-mail et mot de passe requis." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    if (!name) {
      return { error: "Indiquez votre nom complet pour créer votre compte." };
    }

    const role = await prisma.role.findFirstOrThrow({
      where: { name: "Élève" },
    });
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, name, passwordHash, roleId: role.id },
    });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Adresse e-mail ou mot de passe incorrect." };
    }
    throw err;
  }

  return {};
}
