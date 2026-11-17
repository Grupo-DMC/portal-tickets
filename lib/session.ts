import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* Sesión en cookie httpOnly firmada con HMAC-SHA256. Solo guarda la identidad;
   el resto de los datos se resuelve en el servidor en cada petición. */
export type Payload = { id: string; exp: number };

const DEV_SECRET = "dev-only-secret-change-me-dev-only-secret";
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET no configurado (mínimo 32 caracteres).");
  return DEV_SECRET;
}
const sign = (d: string) => createHmac("sha256", secret()).update(d).digest("base64url");

export const SESSION_COOKIE = "dmc_tk_session";
export const SUC_COOKIE = "dmc_tk_sucursal";

export function encode(p: Payload): string {
  const body = Buffer.from(JSON.stringify(p)).toString("base64url");
  return `${body}.${sign(body)}`;
}
export function decode(token: string | undefined): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const good = Buffer.from(sign(body)), got = Buffer.from(sig);
  if (good.length !== got.length || !timingSafeEqual(good, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}

const base = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export async function setSession(id: string, remember: boolean) {
  const ttl = remember ? 1000 * 60 * 60 * 24 * 14 : 1000 * 60 * 60 * 8;
  (await cookies()).set(SESSION_COOKIE, encode({ id, exp: Date.now() + ttl }), { ...base, ...(remember ? { maxAge: ttl / 1000 } : {}) });
}
export async function getSession(): Promise<Payload | null> {
  return decode((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(SUC_COOKIE);
}
export async function getSucursal(): Promise<string> {
  return (await cookies()).get(SUC_COOKIE)?.value ?? "Todas las tiendas";
}
export async function setSucursal(n: string) {
  (await cookies()).set(SUC_COOKIE, n, { ...base, maxAge: 60 * 60 * 24 * 30 });
}
