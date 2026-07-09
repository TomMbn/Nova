"use server";

import { redirect } from "next/navigation";

import { updateProfile } from "@/actions/profile";

export type EditProfileState = {
  error?: string;
};

export async function saveProfile(
  _prevState: EditProfileState,
  formData: FormData
): Promise<EditProfileState> {
  const result = await updateProfile(formData);
  if (!result.success) {
    return { error: result.error };
  }
  redirect("/profil");
}
