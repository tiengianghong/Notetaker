import { randomBytes } from "node:crypto";

export function newId(prefix?: string): string {
  const raw = randomBytes(12).toString("base64url");
  return prefix ? `${prefix}_${raw}` : raw;
}
