import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/audit";
import { getSession } from "@/lib/auth/session";
import { GuestAdminService } from "@/services/GuestAdminService";
import { getWedding } from "@/services/WeddingService";
import { cameroonPhoneSchema } from "@/validations/cameroon-phone.schema";

export const dynamic = "force-dynamic";

const guestSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le nom affiché doit contenir au moins 2 caractères")
    .max(60, "Le nom affiché est trop long"),
  lastName: z.string().trim().max(60, "Le nom est trop long").default(""),
  phone: cameroonPhoneSchema,
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = guestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const wedding = await getWedding();
  if (!wedding) {
    return NextResponse.json({ error: "Mariage introuvable" }, { status: 500 });
  }

  const guest = await GuestAdminService.create({
    weddingId: wedding.id,
    ...parsed.data,
  });
  await audit({
    action: "GUEST_CREATED",
    adminId: session.adminId,
    entity: "Guest",
    entityId: guest.id,
    metadata: { identifier: guest.invitation.identifier },
  });

  return NextResponse.json(
    {
      ok: true,
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        identifier: guest.invitation.identifier,
      },
    },
    { status: 201 }
  );
}
