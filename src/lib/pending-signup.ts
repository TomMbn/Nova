import { cookies } from "next/headers";

// Le mot de passe est conservé en clair le temps du parcours d'inscription
// (jusqu'à la création du User à l'étape finale, où il est haché) : le cookie
// est httpOnly/secure et expire rapidement. Compromis simple pour un MVP
// workshop plutôt que de mettre en place un flux de vérification différée.
export type PendingSignup = {
  email: string;
  password: string;
  roleId?: string;
  topicIds?: string[];
};

const COOKIE_NAME = "nova_signup";
const MAX_AGE_SECONDS = 60 * 30;

export async function getPendingSignup(): Promise<PendingSignup | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingSignup;
  } catch {
    return null;
  }
}

export async function setPendingSignup(data: PendingSignup): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearPendingSignup(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
