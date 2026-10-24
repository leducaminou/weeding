import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
});

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  date: z.string().datetime(),
  time: z.string().trim().min(2).max(20),
  endTime: z.string().trim().max(20).optional().nullable(),
  location: z.string().trim().min(2).max(160),
  address: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  mapsUrl: z.string().url().optional().nullable().or(z.literal("")),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  dressCode: z.string().trim().max(80).optional().nullable(),
  dressCodeNote: z.string().trim().max(300).optional().nullable(),
  photoSession: z.string().trim().max(80).optional().nullable(),
});

export const accommodationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  address: z.string().trim().min(2).max(200),
  phones: z.array(z.string().trim().min(6).max(25)).default([]),
  image: z.string().url().optional().nullable().or(z.literal("")),
  link: z.string().url().optional().nullable().or(z.literal("")),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const wishlistSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  image: z.string().url().optional().nullable().or(z.literal("")),
  url: z.string().url().optional().nullable().or(z.literal("")),
  category: z.string().trim().max(60).optional().nullable(),
  priority: z.number().int().default(0),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const siteSettingSchema = z.object({
  key: z.string().trim().min(1).max(60),
  value: z.string().max(4000),
});