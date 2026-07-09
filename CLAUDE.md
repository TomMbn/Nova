# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Réseau social communautaire de l'école — MVP workshop (2 jours, 7 devs, 2
UX/UI). Voir la fiche de cadrage produit pour le détail fonctionnel complet
(profils, catégories/thématiques de post, MVP vs V2). Points structurants à
connaître avant de toucher au domaine :

### Espace Formations

Deux types de formations totalement distincts (pas de table parente commune).
Chaque type porte une ou plusieurs thématiques (`Topic`) via des tables de
jointure dédiées (`formation_video_topic`, `formation_session_topic`).

- **FormationVideo** — catalogue de vidéos en accès libre pour tous les
  utilisateurs authentifiés. Pas d'abonnement, pas de paiement.

- **FormationSession** — sessions en présentiel, **réservées aux alumni**
  (guard `role.name === "Alumni"` dans l'action). L'inscription se fait via
  un bouton qui crée une `FormationRegistration` en base (`status = CONFIRMED`)
  et redirige l'utilisateur vers `FormationSession.cpfUrl` (fiche CPF externe).
  L'annulation suit le même principe : passage en `CANCELLED` + redirect CPF.

  Un utilisateur ne peut avoir qu'**une seule inscription par session**
  (contrainte `UNIQUE(userId, sessionId)` en base).

  Avis possibles pour tout utilisateur avec `status = CONFIRMED`,
  un seul avis par session (`UNIQUE(userId, sessionId)` sur `Review`).

Points de vigilance :
- `FormationRegistration.status` : `PENDING | CONFIRMED | CANCELLED`
- `FormationSession.status` : `OPEN | DONE | CANCELLED`
- Pas de système de paiement ni de crédits pour les formations.
- `registerForSession` charge le rôle via une requête séparée (`requireUser`
  ne retourne pas les relations).

- **Catégorie** qualifie un post, une seule par post (`post.category_id`).
- **Thématique** (`Topic`) qualifie un post, plusieurs possibles
  (`post_topic`). Sert aussi aux préférences de notif (`followed_topic`).
- **Compétence** (`Skill`) qualifie une personne (`user_skill`), plusieurs
  possibles. **Ce n'est pas la même notion que Thématique** — il n'existe pas
  de lien personne↔thématique en base ; la recherche de membres par domaine
  passe uniquement par les compétences.
- **Classe/promo** (`Class`) qualifie une personne, 0 ou 1, seulement
  pertinente pour un `role` "Élève actuel".

## Commands

```bash
nvm use              # aligne la version Node sur .nvmrc (22.23.1, voir engines dans package.json)
npm install           # postinstall lance automatiquement `prisma generate`
npm run dev           # serveur de dev (Turbopack)
npm run build         # build de prod
npm run lint          # eslint (config next/core-web-vitals + next/typescript)

npm run db:migrate    # prisma migrate dev — applique/crée une migration depuis prisma/schema.prisma
npm run db:seed       # reseed Role/Category/Topic (prisma/seed.ts)
npm run db:studio     # Prisma Studio
```

Il n'y a pas encore de suite de tests ni de CI configurée.

## Architecture

**Le schéma Prisma suit une base Neon déjà provisionnée, pas l'inverse.**
`prisma/schema.prisma` reprend le DDL d'un MCD externe : noms de table/colonne
en snake_case via `@map`/`@@map`, contraintes nommées explicitement
(`@unique(map: "xxx_unique")`, FK `map: "xxx_foreign"`) pour que
`prisma migrate diff` reste propre contre la base réelle. Toute évolution du
schéma doit préserver ce nommage plutôt que d'utiliser les conventions par
défaut de Prisma. Les CHECK constraints du MCD non représentables dans
Prisma (ex: `message.sender_id <> receiver_id`, `media.type IN (...)`) vivent
uniquement dans les fichiers SQL sous `prisma/migrations/` — les
appliquer/vérifier côté applicatif si besoin.

**Deux URLs de connexion distinctes** (voir `.env.example`) : `DATABASE_URL`
pointe sur le pooler Neon (pgbouncer) et sert au runtime de l'app ;
`DIRECT_URL` est une connexion directe utilisée uniquement par
`prisma migrate`, qui ne fonctionne pas à travers un pooler.

**Les ids sont des `BigInt`** (autoincrement) sur tous les modèles. `BigInt`
n'est pas sérialisable en JSON tel quel — convertir en `String`/`Number`
explicitement aux frontières (ex. `src/auth.ts` fait `String(user.id)` avant
de le mettre dans la session/JWT).

**Client Prisma généré à un emplacement custom, avec un point d'entrée
non standard.** Le générateur `prisma-client` (nouveau générateur ESM) sort
dans `src/generated/prisma/` sans `index.ts` : le point d'entrée est
`client.ts`, donc l'import correct est `@/generated/prisma/client` (voir
`src/lib/prisma.ts`), **pas** `@/generated/prisma`. Ce dossier est généré
(`postinstall`/`prisma generate`) — ne pas l'éditer à la main.

**Auth** : NextAuth v5 (beta) dans `src/auth.ts`, provider Credentials
uniquement, stratégie de session JWT (pas d'Account/Session en base malgré
`@auth/prisma-adapter` présent en dépendance — il n'est pas branché tant
qu'aucun provider OAuth n'est ajouté). Le handler API est un simple
re-export dans `src/app/api/auth/[...nextauth]/route.ts`. Le typage
`session.user.id` / `token.id` est ajouté via le module augmentation
`src/types/next-auth.d.ts`.

**PWA** : le manifest est généré via l'API Metadata de Next
(`src/app/manifest.ts`, route `/manifest.webmanifest`), pas un fichier
statique. Le service worker (`public/sw.js`, stratégie network-first) est
enregistré côté client par `src/components/service-worker-register.tsx`,
monté dans `src/app/layout.tsx` à l'intérieur de `src/components/providers.tsx`
(qui porte le `SessionProvider` NextAuth). Les icônes dans `public/icons/`
sont des placeholders générés — à remplacer par la charte graphique réelle.

**UI** : shadcn/ui initialisé (style `base-nova`, base color `neutral`,
`src/components/ui/*`). Seul un socle de composants est installé
(button, card, avatar, input, label, textarea, badge, dialog, dropdown-menu,
separator, tabs) — ajouter les suivants avec `npx shadcn@latest add <nom>`
plutôt que de les écrire à la main.

Path alias `@/*` → `src/*` (voir `tsconfig.json`).
