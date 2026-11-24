# Loïca & Franck — Plateforme digitale de mariage

Site d'invitation et d'organisation pour le mariage de Loïca & Franck
(27 & 29 décembre 2026).

## Stack

- Next.js 15.5.23 (App Router, Turbopack)
- React 19, TypeScript strict
- Tailwind CSS v4
- Motion (Framer Motion)
- PostgreSQL + Prisma
- UploadThing
- Baileys (WhatsApp)

## Setup

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Pour synchroniser uniquement la liste des invités, sans relancer les autres
données de démonstration :

```bash
pnpm db:seed:guests
```

Cette synchronisation dédoublonne les noms identiques et conserve toutes les
invitations confirmées ou déjà utilisées.

Baileys stocke sa session dans `baileys_auth/` en local. En environnement
Vercel, le dossier `/tmp/baileys_auth` est utilisé par défaut pour éviter
l'écriture dans le bundle de l'application ; ce stockage est temporaire.
Pour conserver une session durable, configurez `WHATSAPP_AUTH_DIR` vers un
disque persistant sur un serveur Node.js toujours actif.