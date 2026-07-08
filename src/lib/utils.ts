import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convertit récursivement les BigInt en string pour la sérialisation JSON
// (nécessaire quand on passe des données Prisma à des Client Components)
export function serializeBigInt<T>(value: T): T {
  if (typeof value === "bigint") return String(value) as T;
  if (Array.isArray(value)) return value.map(serializeBigInt) as T;
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeBigInt(v)])
    ) as T;
  }
  return value;
}
