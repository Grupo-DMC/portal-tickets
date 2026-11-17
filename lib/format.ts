import { SLA_HORAS, type Estado, type Prioridad, type Ticket } from "./data";

export const dur = (h: number) => {
  const d = Math.floor(h / 24), r = h % 24;
  return d ? `${d}d ${r}h` : `${r}h`;
};

export const abierto = (t: Pick<Ticket, "est">) => t.est !== "Resuelto" && t.est !== "Cerrado";

const EST: Record<Estado, [string, string]> = {
  Nuevo: ["#423a6a", "#e7e5fe"],
  Asignado: ["#2c3a52", "#a9c8ea"],
  "En terreno": ["#4d3a22", "#efcd97"],
  "En espera cliente": ["#3f424d", "#cfd3e5"],
  Resuelto: ["#23402f", "#a8dcbd"],
  Cerrado: ["#292b31", "#9397ab"],
};
export const estColor = (e: string): [string, string] => EST[e as Estado] ?? EST.Nuevo;

const PRIO: Record<Prioridad, [string, string]> = {
  Crítica: ["#f2b5b0", "#e0645e"],
  Alta: ["#efcd97", "#d99b45"],
  Media: ["#a9c8ea", "#5a92c9"],
  Baja: ["#b2b6ca", "#75798c"],
};
export const prioColor = (p: string): [string, string] => PRIO[p as Prioridad] ?? PRIO.Media;
export const pesoPrio = (p: string) => ({ Crítica: 4, Alta: 3, Media: 2, Baja: 1 })[p as Prioridad] ?? 0;

export type SlaInfo = { txt: string; fg: string; bg: string; pct: number };
export function slaInfo(t: Pick<Ticket, "est" | "hrs">, sla = SLA_HORAS): SlaInfo {
  if (!abierto(t)) return { txt: "Cumplido", fg: "#a8dcbd", bg: "#23402f", pct: 100 };
  const rest = sla - t.hrs;
  if (rest <= 0) return { txt: `Vencido hace ${dur(-rest)}`, fg: "#f2b5b0", bg: "#4d2731", pct: 100 };
  const warn = rest < 12;
  return { txt: `${dur(rest)} restantes`, fg: warn ? "#efcd97" : "#cfd3e5", bg: warn ? "#4d3a22" : "#3f424d", pct: Math.round(100 * (1 - rest / sla)) };
}

export const iniciales = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2);
