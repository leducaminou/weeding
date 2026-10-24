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