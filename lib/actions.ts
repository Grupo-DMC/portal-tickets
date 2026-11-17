"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TIENDAS, USUARIO } from "./data";
import { agregarComentario, cambiarEstado, crearTicket, tiendaPorNombre, ticketPorId, valorarTicket } from "./repo";
import {
  ComentarioSchema, EstadoSchema, IdTicketSchema, LoginSchema, MAX_ARCHIVOS, MAX_BYTES, NuevaSolicitudSchema,
  TIPOS_ARCHIVO, ValoracionSchema,
} from "./schemas";
import { clearSession, getSession, setSession, setSucursal } from "./session";

const igual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/* Credenciales de demostración (hasta conectar SQL Server). */
const DEMO_MAIL = USUARIO.correo;
const DEMO_PASS = "dmc2026";
const MAX_INTENTOS = 3;
const intentos = new Map<string, number>();

export type LoginState = { error?: string };
export async function loginAction(_: LoginState, fd: FormData): Promise<LoginState> {
  const p = LoginSchema.safeParse({ mail: fd.get("mail"), pass: fd.get("pass"), recordar: fd.get("recordar") });
  const clave = p.success ? p.data.mail : "invalido";
  const usados = intentos.get(clave) ?? 0;
  if (usados >= MAX_INTENTOS) return { error: "Cuenta bloqueada por 15 minutos por exceso de intentos. Intenta más tarde o contacta a tu ejecutivo de cuenta." };
  if (!p.success || !igual(p.data.mail, DEMO_MAIL) || !igual(p.data.pass, DEMO_PASS)) {
    intentos.set(clave, usados + 1);
    setTimeout(() => intentos.delete(clave), 15 * 60 * 1000).unref?.();
    return { error: `Correo o contraseña incorrectos. Te quedan ${Math.max(0, MAX_INTENTOS - usados - 1)} intentos antes de que la cuenta se bloquee por 15 minutos.` };
  }
  intentos.delete(clave);
  await setSession(p.data.mail, p.data.recordar);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

async function exigirSesion() {
  if (!(await getSession())) redirect("/login");
}

export async function sucursalAction(nombre: string) {
  await exigirSesion();
  if (nombre !== "Todas las tiendas" && !TIENDAS.some((t) => t.n === nombre)) return;
  await setSucursal(nombre);
  revalidatePath("/", "layout");
}

export type SolicitudState = { errores?: Record<string, string>; aviso?: string; id?: string };
export async function crearSolicitudAction(_: SolicitudState, fd: FormData): Promise<SolicitudState> {
  await exigirSesion();
  const raw = Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));
  const p = NuevaSolicitudSchema.safeParse(raw);
  if (!p.success) {
    const errores: Record<string, string> = {};
    for (const i of p.error.issues) errores[String(i.path[0])] ??= i.message;
    return { errores, aviso: "Completa tienda, equipo, tipo de falla y una descripción de al menos 12 caracteres" };
  }
  const f = p.data;
  const tienda = tiendaPorNombre(f.tienda);
  if (!tienda || !tienda.eq.some((e) => e.s === f.equipo)) return { errores: { equipo: "El equipo no pertenece a la tienda" }, aviso: "El equipo no pertenece a la tienda" };

  const archivos = fd.getAll("adjuntos").filter((x): x is File => x instanceof File && x.size > 0);
  if (archivos.length > MAX_ARCHIVOS) return { errores: { adj: `Máximo ${MAX_ARCHIVOS} archivos` }, aviso: `Máximo ${MAX_ARCHIVOS} archivos` };
  for (const a of archivos) {
    if (a.size > MAX_BYTES) return { errores: { adj: `${a.name} supera los 25 MB` }, aviso: `${a.name} supera los 25 MB` };
    if (!TIPOS_ARCHIVO.includes(a.type)) return { errores: { adj: `${a.name}: solo JPG, PNG o MP4` }, aviso: `${a.name}: solo JPG, PNG o MP4` };
  }
  // Los archivos aún no se almacenan (sin base ni storage); se registra solo el nombre saneado.
  const adj = archivos.map((a) => a.name.replace(/[^\w.\- ]/g, "_").slice(0, 80));

  const contexto: string[] = [];
  if (f.enciende) contexto.push(`¿Enciende?: ${f.enciende}`);
  if (f.alarma) contexto.push(`Alarma constante: ${f.alarma}`);
  if (f.reinicio) contexto.push(`Equipo reiniciado: ${f.reinicio}`);
  if (f.obras) contexto.push(`Obras o cambios recientes: ${f.obras}`);

  const id = crearTicket({ tienda, equipo: f.equipo, tipo: f.tipo, prio: f.prio, desc: f.desc, adj, contexto, contacto: f.cnombre });
  revalidatePath("/", "layout");
  return { id };
}

export type AccionTicket = { ok: boolean; aviso: string };
export async function comentarAction(id: string, _: AccionTicket | null, fd: FormData): Promise<AccionTicket> {
  await exigirSesion();
  const tid = IdTicketSchema.safeParse(id);
  const p = ComentarioSchema.safeParse({ texto: fd.get("texto") });
  if (!tid.success || !p.success || !ticketPorId(tid.data)) return { ok: false, aviso: "Escribe un comentario antes de publicar" };
  const adj = fd.getAll("adjuntos").filter((x): x is File => x instanceof File && x.size > 0 && x.size <= MAX_BYTES && TIPOS_ARCHIVO.includes(x.type)).map((a) => a.name.replace(/[^\w.\- ]/g, "_").slice(0, 80));
  agregarComentario(tid.data, p.data.texto, adj);
  revalidatePath(`/tickets/${tid.data}`);
  return { ok: true, aviso: "Comentario publicado en el ticket" };
}

export async function estadoAction(id: string, estado: string): Promise<AccionTicket> {
  await exigirSesion();
  const tid = IdTicketSchema.safeParse(id), e = EstadoSchema.safeParse(estado);
  if (!tid.success || !e.success || !cambiarEstado(tid.data, e.data)) return { ok: false, aviso: "No se pudo actualizar el estado" };
  revalidatePath("/", "layout");
  return { ok: true, aviso: `Estado actualizado a ${e.data}` };
}

export async function valorarAction(id: string, n: number): Promise<AccionTicket> {
  await exigirSesion();
  const tid = IdTicketSchema.safeParse(id), v = ValoracionSchema.safeParse(n);
  if (!tid.success || !v.success || !valorarTicket(tid.data, v.data)) return { ok: false, aviso: "No se pudo registrar la valoración" };
  revalidatePath(`/tickets/${tid.data}`);
  return { ok: true, aviso: `Gracias, registramos tu valoración de ${v.data} de 5` };
}
