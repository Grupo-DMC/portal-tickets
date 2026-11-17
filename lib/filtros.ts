import { TIENDAS, TECNICOS, TIPOS_FALLA, ESTADOS, PRIORIDADES, MODELOS } from "./data";
import { pesoPrio } from "./format";
import type { TicketRow } from "./repo";

export type Filtros = {
  q: string; estado: string; prio: string; tienda: string; tipo: string; tec: string; modelo: string;
  desde: string; hasta: string; orden: string; page: number;
};
export type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const pick = (v: string, allowed: readonly string[], def: string) => (allowed.includes(v) ? v : def);
const fecha = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

export const OPT_ESTADOS = ["Todos", ...ESTADOS];
export const OPT_PRIOS = ["Todas", "Crítica", "Alta", "Media", "Baja"];
export const OPT_TIENDAS = ["Todas", ...TIENDAS.map((t) => t.n)];
export const OPT_TIPOS = ["Todos", ...TIPOS_FALLA.map((t) => t[0])];
export const OPT_TECS = ["Todos", ...TECNICOS];
export const OPT_MODELOS = ["Todos", ...MODELOS];
export const OPT_ORDEN = [
  { v: "antig", l: "Mayor antigüedad" }, { v: "nuevo", l: "Más recientes" },
  { v: "prio", l: "Mayor prioridad" }, { v: "sinresp", l: "Más tiempo sin respuesta" },
];

export function parseFiltros(sp: SP): Filtros {
  return {
    q: one(sp.q).slice(0, 80),
    estado: pick(one(sp.estado), OPT_ESTADOS, "Todos"),
    prio: pick(one(sp.prio), OPT_PRIOS, "Todas"),
    tienda: pick(one(sp.tienda), OPT_TIENDAS, "Todas"),
    tipo: pick(one(sp.tipo), OPT_TIPOS, "Todos"),
    tec: pick(one(sp.tec), OPT_TECS, "Todos"),
    modelo: pick(one(sp.modelo), OPT_MODELOS, "Todos"),
    desde: fecha(one(sp.desde)), hasta: fecha(one(sp.hasta)),
    orden: pick(one(sp.orden), OPT_ORDEN.map((o) => o.v), "antig"),
    page: Math.max(1, parseInt(one(sp.page), 10) || 1),
  };
}

/* "dd/mm/yyyy hh:mm" -> "yyyy-mm-dd" para comparar con los inputs de fecha. */
const iso = (cre: string) => `${cre.slice(6, 10)}-${cre.slice(3, 5)}-${cre.slice(0, 2)}`;

export function filtrarTickets(all: TicketRow[], f: Filtros, sucursal: string): TicketRow[] {
  const q = f.q.trim().toLowerCase();
  const r = all.filter((t) => {
    if (sucursal !== "Todas las tiendas" && t.tiendaN !== sucursal) return false;
    if (f.estado !== "Todos" && t.est !== f.estado) return false;
    if (f.prio !== "Todas" && t.prio !== f.prio) return false;
    if (f.tienda !== "Todas" && t.tiendaN !== f.tienda) return false;
    if (f.tipo !== "Todos" && t.tipo !== f.tipo) return false;
    if (f.tec !== "Todos" && t.tec !== f.tec) return false;
    if (f.modelo !== "Todos" && t.equipo?.m !== f.modelo) return false;
    if (f.desde && iso(t.cre) < f.desde) return false;
    if (f.hasta && iso(t.cre) > f.hasta) return false;
    if (q && !`${t.id} ${t.tiendaN} ${t.eq} ${t.tipo} ${t.tec} ${t.desc}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const ord: Record<string, (a: TicketRow, b: TicketRow) => number> = {
    antig: (a, b) => b.hrs - a.hrs, nuevo: (a, b) => a.hrs - b.hrs,
    prio: (a, b) => pesoPrio(b.prio) - pesoPrio(a.prio), sinresp: (a, b) => b.hrs - a.hrs,
  };
  return r.sort(ord[f.orden] ?? ord.antig);
}
