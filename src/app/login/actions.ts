"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { setPendingSignup } from "@/lib/pending-signup";

export type LoginState = {
  error?: string;
};

export async function loginOrSignup(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Adresse e-mail et mot de passe requis." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    await setPendingSignup({ email, password });
    redirect("/inscription");
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
