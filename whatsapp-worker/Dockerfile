FROM node:22-bookworm-slim

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY whatsapp-worker/package.json whatsapp-worker/package.json
COPY prisma/schema.prisma prisma/schema.prisma
RUN pnpm install --filter @loicaetfranck/whatsapp-worker... --frozen-lockfile

COPY whatsapp-worker/ whatsapp-worker/
RUN pnpm --filter @loicaetfranck/whatsapp-worker exec prisma generate --schema ../prisma/schema.prisma
RUN pnpm --filter @loicaetfranck/whatsapp-worker build

CMD ["pnpm", "--filter", "@loicaetfranck/whatsapp-worker", "start"]
