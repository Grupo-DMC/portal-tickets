import "server-only";
import {
  AHORA_ACCION, TICKETS_INICIALES, TIENDAS, USUARIO,
  type Comentario, type Equipo, type Estado, type Evento, type Ticket, type Tienda,
} from "./data";
import { abierto, dur } from "./format";

/* Repositorio de acceso a datos. Hoy lee/escribe en memoria (datos estáticos del
   diseño); al conectar SQL Server (paquete `mssql`) solo se reemplaza el cuerpo
   de estas funciones, manteniendo las firmas. */
const g = globalThis as unknown as { __tickets?: Ticket[] };
const store = () => (g.__tickets ??= structuredClone(TICKETS_INICIALES));

export type TicketRow = Ticket & {
  tienda: Tienda; equipo: Equipo | null; modelo: string; ubic: string; antig: string; tiendaN: string;
};

const enrich = (t: Ticket): TicketRow => {
  const tienda = tiendaPorId(t.ti);
  const equipo = equipoPorSerie(t.eq);
  return { ...t, tienda, tiendaN: tienda.n, equipo, modelo: equipo?.m ?? "—", ubic: equipo?.u ?? "—", antig: dur(t.hrs) };
};

export const listarTiendas = (): Tienda[] => TIENDAS;
export const tiendaPorId = (id: string): Tienda => TIENDAS.find((t) => t.id === id) ?? TIENDAS[0];
export const tiendaPorNombre = (n: string) => TIENDAS.find((t) => t.n === n);
export function equipoPorSerie(serie: string): Equipo | null {
  for (const t of TIENDAS) { const e = t.eq.find((x) => x.s === serie); if (e) return e; }
  return null;
}
export type EquipoRow = Equipo & { tienda: string; tid: string; com: string; abiertos: number };
export function listarEquipos(): EquipoRow[] {
  const tk = store();
  return TIENDAS.flatMap((t) =>
    t.eq.map((e) => ({ ...e, tienda: t.n, tid: t.id, com: t.com, abiertos: tk.filter((x) => x.eq === e.s && abierto(x)).length })),
  );
}

export const listarTickets = (): TicketRow[] => store().map(enrich);
export const ticketPorId = (id: string): TicketRow | null => {
  const t = store().find((x) => x.id === id);
  return t ? enrich(t) : null;
};

export function comentariosDe(t: Ticket): Comentario[] {
  return t.co ?? [{ a: tiendaPorId(t.ti).cont, r: "Cliente", d: t.cre, x: t.desc }];
}
export function lineaTiempoDe(t: Ticket): Evento[] {
  const ti = tiendaPorId(t.ti);
  const ev: Evento[] = t.tl ? [...t.tl] : [{ t: "Solicitud ingresada", a: `${ti.cont} · ${ti.n}`, d: t.cre, k: "crea" }];
  if (t.tl) return ev;
  if (t.est !== "Nuevo") ev.push({ t: `Ticket asignado a ${t.tec}`, a: "Mesa de ayuda DMC", d: t.cre, k: "asig" });
  if (t.est === "En espera cliente") ev.push({ t: "A la espera de confirmación del local", a: t.tec, d: t.act, k: "nota" });
  if (["En terreno", "Resuelto", "Cerrado"].includes(t.est)) ev.push({ t: "Visita en terreno registrada", a: t.tec, d: t.act, k: "visita" });
  if (t.est === "Resuelto" || t.est === "Cerrado") ev.push({ t: "Falla resuelta · equipo operativo", a: t.tec, d: t.act, k: "res" });
  if (t.est === "Cerrado") ev.push({ t: "Ticket cerrado", a: "Mesa de ayuda DMC", d: t.act, k: "cierre" });
  return ev;
}

export function agregarComentario(id: string, texto: string, adj: string[] = []) {
  const t = store().find((x) => x.id === id);
  if (!t) return false;
  t.co = [...comentariosDe(t), { a: USUARIO.nombre, r: "Cliente", d: AHORA_ACCION, x: texto, ...(adj.length ? { adj } : {}) }];
  t.act = AHORA_ACCION;
  return true;
}
export function cambiarEstado(id: string, est: Estado) {
  const t = store().find((x) => x.id === id);
  if (!t) return false;
  t.tl = [...lineaTiempoDe(t), { t: `Estado cambiado a ${est}`, a: `${USUARIO.nombre} · Cliente`, d: AHORA_ACCION, k: "est" }];
  t.est = est;
  t.act = AHORA_ACCION;
  return true;
}
export function valorarTicket(id: string, n: number) {
  const t = store().find((x) => x.id === id);
  if (!t) return false;
  t.valoracion = n;
  return true;
}
export function crearTicket(d: {
  tienda: Tienda; equipo: string; tipo: string; prio: Ticket["prio"]; desc: string; adj: string[]; contexto: string[]; contacto: string;
}): string {
  const s = store();
  const id = `TKT-2026-0${143 + s.filter((t) => t.hrs === 0).length}`;
  s.unshift({
    id, ti: d.tienda.id, eq: d.equipo, tipo: d.tipo, prio: d.prio, est: "Nuevo", cre: AHORA_ACCION, hrs: 0, act: AHORA_ACCION,
    tec: "Por asignar", desc: d.desc, adj: d.adj.length,
    tl: [{ t: "Solicitud ingresada", a: `${d.contacto || USUARIO.nombre} · ${d.tienda.n}`, d: AHORA_ACCION, k: "crea" }],
    co: [{ a: d.contacto || USUARIO.nombre, r: "Cliente", d: AHORA_ACCION, x: d.desc + (d.contexto.length ? `\n\nContexto: ${d.contexto.join(" · ")}` : ""), adj: d.adj }],
  });
  return id;
}
