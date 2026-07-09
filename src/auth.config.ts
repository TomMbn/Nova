import type { NextAuthConfig } from "next-auth";

// Accessibles sans session : la connexion et tout le parcours d'inscription
// multi-étapes (choix du profil, spécialités, complétion du profil).
const PUBLIC_PATHS = ["/login", "/inscription"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      if (isPublicPath(nextUrl.pathname)) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
