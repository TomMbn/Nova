# École Communauté — MVP Workshop

Réseau social communautaire de l'école (Next.js, PWA). Voir la fiche de
cadrage produit pour le détail fonctionnel (MVP vs V2).

## Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL
- NextAuth (credentials)
- PWA (manifest + service worker, `src/app/manifest.ts` / `public/sw.js`)

## Setup

0. Utiliser Node 22 LTS (version figée dans `.nvmrc`) :
   ```bash
   nvm use
   ```
1. Copier `.env.example` en `.env` et renseigner :
   - `DATABASE_URL` : connexion PostgreSQL (ex: Neon, ou `npx prisma dev` pour une DB locale)
   - `AUTH_SECRET` : générer avec `openssl rand -base64 32`
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Appliquer le schéma et seeder les listes extensibles (types de profil, thématiques) :
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Lancer le serveur de dev :
   ```bash
   npm run dev
   ```

## Ce qui est déjà en place (socle commun)

- `prisma/schema.prisma` : modèle de données complet (User, ProfileType,
  Theme, Post, Category, Like, Save, Poll...). Les types de profil et
  thématiques sont des tables (extensibles), seedées via `prisma/seed.ts`.
- `src/auth.ts` + `src/app/api/auth/[...nextauth]/route.ts` : NextAuth
  configuré en credentials (email/mot de passe), session JWT.
- `src/lib/prisma.ts` : client Prisma partagé.
- `src/components/ui/*` : composants shadcn/ui de base déjà ajoutés
  (button, card, input, label, textarea, badge, dialog, tabs...).
- PWA : manifest, service worker, icônes dans `public/icons/`.

Chaque sous-équipe construit ses pages et routes API sur cette base
(onboarding, feed, profil...).

## Commandes utiles

```bash
npm run db:studio   # explorer la base via Prisma Studio
npm run db:migrate  # appliquer une migration après modif du schéma
npm run db:seed     # reseeder les types de profil / thématiques
```
