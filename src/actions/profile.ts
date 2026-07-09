"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toBigInt, toBigIntList } from "@/lib/bigint";
import { ok, fail, type ActionResult } from "@/lib/action";

/**
 * Met à jour le profil de l'utilisateur courant : identité, classe,
 * spécialités (thématiques suivies), compétences et entreprise actuelle.
 *
 * Champs FormData :
 *  - name       (requis)    nom complet
 *  - bio        (optionnel)
 *  - classId    (optionnel) n'a de sens que pour le rôle "Élève actuel"
 *  - topicIds   (0..n)      remplace entièrement les thématiques suivies
 *  - skills     (optionnel) noms séparés par des virgules, remplace la liste
 *  - company    (optionnel) entreprise actuelle ; vide = retire l'expérience
 *                courante enregistrée depuis ce formulaire
 */
export async function updateProfile(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return fail("Le nom est requis.");

  const bio = String(formData.get("bio") ?? "").trim() || null;
  const classId = toBigInt(formData.get("classId"));
  const topicIds = toBigIntList(
    formData.getAll("topicIds").map((v) => String(v))
  );
  const skillNames = [
    ...new Set(
      String(formData.get("skills") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];
  const company = String(formData.get("company") ?? "").trim();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { name, bio, currentClassId: classId },
      });

      await tx.followedTopic.deleteMany({ where: { userId: user.id } });
      if (topicIds.length > 0) {
        await tx.followedTopic.createMany({
          data: topicIds.map((topicId) => ({ userId: user.id, topicId })),
        });
      }

      const skills = [];
      for (const name of skillNames) {
        skills.push(
          await tx.skill.upsert({ where: { name }, update: {}, create: { name } })
        );
      }
      await tx.userSkill.deleteMany({ where: { userId: user.id } });
      if (skills.length > 0) {
        await tx.userSkill.createMany({
          data: skills.map((skill) => ({
            userId: user.id,
            skillId: skill.id,
          })),
        });
      }

      // On ne gère qu'une seule "expérience actuelle" sans titre/dates depuis
      // ce formulaire ; les expériences détaillées restent gérées ailleurs.
      const currentExperience = await tx.experience.findFirst({
        where: { userId: user.id, isCurrent: true, title: null },
      });

      if (company) {
        const companyRow = await tx.company.upsert({
          where: { name: company },
          update: {},
          create: { name: company },
        });
        if (currentExperience) {
          await tx.experience.update({
            where: { id: currentExperience.id },
            data: { companyId: companyRow.id },
          });
        } else {
          await tx.experience.create({
            data: { userId: user.id, companyId: companyRow.id, isCurrent: true },
          });
        }
      } else if (currentExperience) {
        await tx.experience.delete({ where: { id: currentExperience.id } });
      }
    });

    return ok({ id: String(user.id) });
  } catch (e) {
    console.error("updateProfile failed:", e);
    return fail("Impossible de mettre à jour le profil.");
  }
}
