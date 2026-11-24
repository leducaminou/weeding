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

Baileys tourne dans un daemon Vercel distinct des fonctions Next.js. Le daemon
garde le socket actif et stocke la session, le QR et les commandes WhatsApp
dans PostgreSQL. `vercel.json` configure une seule instance dans la région
`cdg1` pour éviter que plusieurs sockets utilisent le même numéro.

Avant le déploiement, appliquez la migration :

```bash
pnpm exec prisma migrate deploy
```

Vérifiez que `DATABASE_URL` est défini pour les fonctions et le daemon. Les
daemons Vercel sont actuellement en bêta publique. En local, lancez
`pnpm --filter @loicaetfranck/whatsapp-worker dev` en plus de Next.js.