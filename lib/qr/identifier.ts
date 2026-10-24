import { prisma } from "@/lib/prisma";
import {
  IDENTIFIER_LETTERS,
  IDENTIFIER_MAX_ATTEMPTS,
  IDENTIFIER_REGEX,
} from "@/config/constants";

export async function generateUniqueIdentifier(): Promise<string> {
  for (let attempt = 0; attempt < IDENTIFIER_MAX_ATTEMPTS; attempt++) {
    const letters =
      IDENTIFIER_LETTERS[Math.floor(Math.random() * IDENTIFIER_LETTERS.length)] +
      IDENTIFIER_LETTERS[Math.floor(Math.random() * IDENTIFIER_LETTERS.length)];
    const digits = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    const candidate = `${letters}${digits}`;

    const exists = await prisma.invitation.findUnique({
      where: { identifier: candidate },
      select: { id: true },
    });

    if (!exists) return candidate;
  }

  throw new Error(
    "Impossible de générer un identifiant unique après plusieurs tentatives."
  );
}

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_REGEX.test(value);
}