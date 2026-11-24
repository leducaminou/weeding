import { z } from "zod";

export const cameroonPhoneSchema = z
  .string()
  .trim()
  .nullable()
  .optional()
  .transform((value) => value?.replace(/[\s().-]/g, "") || null)
  .refine(
    (value) => value === null || /^6\d{8}$/.test(value),
    "Saisissez les 9 chiffres du numéro camerounais sans indicatif."
  )
  .transform((value) => (value ? `+237${value}` : null));
