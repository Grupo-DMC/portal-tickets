import { z } from "zod";
import { ESTADOS, PRIORIDADES, TIPOS_FALLA } from "./data";

const tipos = TIPOS_FALLA.map((t) => t[0]) as [string, ...string[]];
const texto = (max: number) => z.string().trim().max(max);

export const LoginSchema = z.object({
  mail: z.string().trim().toLowerCase().max(120).pipe(z.email()),
  pass: z.string().min(1).max(128),
  recordar: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

export const MAX_ARCHIVOS = 6;
export const MAX_BYTES = 25 * 1024 * 1024;
export const TIPOS_ARCHIVO = ["image/jpeg", "image/png", "video/mp4"];

export const NuevaSolicitudSchema = z.object({
  tienda: texto(80).min(1, "Selecciona la tienda afectada"),
  equipo: texto(40).min(1, "Selecciona el equipo instalado"),
  tipo: z.enum(tipos, { error: "Selecciona el tipo de falla" }),
  sub: texto(60).optional().default(""),
  prio: z.enum(PRIORIDADES).default("Media"),
  desc: texto(2000).min(12, "La descripción debe tener al menos 12 caracteres"),
  enciende: z.enum(["", "Sí", "No", "Intermitente"]).default(""),
  alarma: z.enum(["", "Sí", "No", "Solo en horario punta"]).default(""),
  reinicio: z.enum(["", "Sí, sin cambios", "Sí, mejoró un rato", "No"]).default(""),
  obras: z.enum(["", "Sí", "No", "Hubo corte de energía"]).default(""),
  cnombre: texto(80).default(""),
  ccargo: texto(80).default(""),
  ctel: texto(30).default(""),
  chorario: texto(60).default(""),
});

export const ComentarioSchema = z.object({ texto: texto(2000).min(1, "Escribe un comentario") });
export const EstadoSchema = z.enum(ESTADOS);
export const ValoracionSchema = z.number().int().min(1).max(5);
export const IdTicketSchema = z.string().regex(/^TKT-\d{4}-\d{4}$/);
