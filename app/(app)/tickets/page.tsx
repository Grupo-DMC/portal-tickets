import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { TicketFilters } from "@/components/ticket-filters";
import { TicketsTable, type Fila } from "@/components/tickets-table";
import { EmptyState, ErrorState, NuevaBtn, PageHead, Sk } from "@/components/ui";
import { filtrarTickets, parseFiltros, type SP } from "@/lib/filtros";
import { slaInfo } from "@/lib/format";
import { listarTickets } from "@/lib/repo";
import { getSucursal } from "@/lib/session";

export const metadata: Metadata = { title: "Tickets" };

const POR_PAG = 8;
const MOSTRAR_SLA = true;
const FILTRO_KEYS = ["q", "estado", "prio", "tienda", "tipo", "tec", "modelo", "desde", "hasta", "orden"];

export default async function Tickets({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const vista = (Array.isArray(sp.vista) ? sp.vista[0] : sp.vista) ?? "datos";
  const f = parseFiltros(sp);
  const sucursal = await getSucursal();
  const filt = filtrarTickets(listarTickets(), f, sucursal);
  const totalPag = Math.max(1, Math.ceil(filt.length / POR_PAG));
  const page = Math.min(f.page, totalPag);
  const filas: Fila[] = filt.slice((page - 1) * POR_PAG, page * POR_PAG).map((t) => {
    const s = slaInfo(t);
    return { id: t.id, tiendaN: t.tiendaN, modelo: t.modelo, ubic: t.ubic, tipo: t.tipo, prio: t.prio, est: t.est, cre: t.cre, antig: t.antig, slaTxt: s.txt, slaFg: s.fg, slaBg: s.bg, act: t.act, tec: t.tec };
  });

  const base = new URLSearchParams();
  for (const k of FILTRO_KEYS) { const v = sp[k]; const s = Array.isArray(v) ? v[0] : v; if (s) base.set(k, s); }
  const qs = base.toString() ? `&${base}` : "";
  const pageHref = (p: number) => { const q = new URLSearchParams(base); if (vista !== "datos") q.set("vista", vista); q.set("page", String(p)); return `/tickets?${q}`; };
  const efectivo = vista === "datos" && filt.length === 0 ? "vacio-filtros" : vista;

  return (
    <>
      <PageHead kicker={`Tickets · ${sucursal}`} title="Listado de tickets">
        <a href={`/tickets/export?formato=csv${qs}`} download className="btn btn-secondary"><Icon name="download" size={15} />Excel</a>
        <a href={`/tickets/export?formato=pdf${qs}`} target="_blank" rel="noopener" className="btn btn-secondary">PDF</a>
        <NuevaBtn />
      </PageHead>

      <TicketFilters f={f} />

      {efectivo === "cargando" && (
        <div className="panel p-3.5">
          <Sk className="mb-4 h-[13px] w-[180px]" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-[110px_1fr_90px_110px_90px_80px] gap-3.5 border-b border-surface py-[11px]">
              {[1, 2, 3, 4, 5, 6].map((j) => <Sk key={j} className="h-[11px]" />)}
            </div>
          ))}
        </div>
      )}
      {efectivo === "error" && (
        <ErrorState titulo="No pudimos cargar el listado" texto="Se perdió la sesión con el servicio de tickets. Reintenta en unos segundos; si el problema persiste, avisa a la mesa de ayuda indicando el código" codigo="EAS-TK-503" retry="/tickets"
          extra={<button className="btn btn-secondary">Contactar mesa de ayuda</button>} />
      )}
      {(efectivo === "vacio" || efectivo === "vacio-filtros") && (
        <EmptyState icon="search" titulo="Ningún ticket coincide con los filtros" texto="Prueba ampliando el rango de fechas o quitando el filtro de prioridad. También puedes revisar los tickets cerrados del último trimestre." cta="Limpiar filtros" href="/tickets" />
      )}
      {efectivo === "datos" && (
        <section className="panel overflow-hidden">
          <TicketsTable filas={filas} mostrarSLA={MOSTRAR_SLA} qs={qs} />
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-[11px]">
            <span className="text-xs text-mute-2">Mostrando {(page - 1) * POR_PAG + 1}–{Math.min(page * POR_PAG, filt.length)} de {filt.length} tickets</span>
            <div className="flex items-center gap-[7px]">
              {page > 1 ? <Link href={pageHref(page - 1)} className="btn btn-secondary !text-[12.5px]">← Anterior</Link> : <span className="btn btn-secondary !text-[12.5px] opacity-45">← Anterior</span>}
              <span className="text-[12.5px] text-ink-3">Página {page} de {totalPag}</span>
              {page < totalPag ? <Link href={pageHref(page + 1)} className="btn btn-secondary !text-[12.5px]">Siguiente →</Link> : <span className="btn btn-secondary !text-[12.5px] opacity-45">Siguiente →</span>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
