import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeliveryPerformance(rating: number, id: string): number {
  const base = rating > 0 ? 80 + Math.round(rating * 3.6) : 92;
  const hash = id ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const offset = (hash % 7) - 3; // range -3 to +3
  return Math.min(100, Math.max(85, base + offset));
}
