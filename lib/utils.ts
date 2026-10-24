import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateFR(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Douala",
  }).format(new Date(date));
}

export function formatDayNumber(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    timeZone: "Africa/Douala",
  }).format(new Date(date));
}

export function formatMonthFR(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    timeZone: "Africa/Douala",
  })
    .format(new Date(date))
    .toUpperCase();
}

export function daysUntil(target: Date | string): number {
  const diff = new Date(target).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}