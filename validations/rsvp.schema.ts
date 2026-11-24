import { z } from "zod";
import { cameroonPhoneSchema } from "@/validations/cameroon-phone.schema";

export const rsvpSchema = z.object({
  guestId: z.string().trim().min(1, "Sélectionnez votre nom dans la liste"),
  phone: cameroonPhoneSchema,
});

export type RsvpConfirmationInput = z.infer<typeof rsvpSchema>;