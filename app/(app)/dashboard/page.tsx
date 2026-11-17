import type { Metadata } from "next";
import Link from "next/link";
import { ChartBarras, ChartDona, ChartLinea } from "@/components/charts";
import { EmptyState, ErrorState, EstadoTag, NuevaBtn, PrioDot, Sk } from "@/components/ui";
import { AHORA, RANKING, SLA_HORAS, TIPOS_FALLA } from "@/lib/data";
import { abierto, dur, slaInfo } from "@/lib/format";
import { listarTickets } from "@/lib/repo";
import { getSucursal } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const { vista = "datos" } = await searchParams;
  const sucursal = await getSucursal();
  const todos = listarTickets();
  const tickets = sucursal === "Todas las tiendas" ? todos : todos.filter((t) => t.tiendaN === sucursal);
  const abiertos = tickets.filter(abierto);
  const antiguo = [...abiertos].sort((a, b) => b.hrs - a.hrs)[0] ?? tickets[0];
  const reciente = [...tickets].sort((a, b) => a.hrs - b.hrs)[0];
  const totTipos = TIPOS_FALLA.reduce((a, b) => a + b[1], 0);
  const maxRank = RANKING[0][1];

  const kpis = [
    { t: "Tickets vigentes", v: String(abiertos.length), u: "abiertos", delta: "12%", fl: "▲", dc: "#efcd97" },
    { t: "Con técnico asignado", v: String(tickets.filter((t) => t.est === "Asignado" || t.est === "En terreno").length), u: "en atención", delta: "8%", fl: "▲", dc: "#a8dcbd" },
    { t: "Resueltos este mes", v: String(tickets.filter((t) => !abierto(t)).length), u: "ago 2026", delta: "15%", fl: "▲", dc: "#a8dcbd" },
    { t: "Tiempo promedio de resolución", v: "2d 6h", u: "", delta: "9%", fl: "▼", dc: "#a8dcbd" },
    { t: "Más antiguo sin resolver", v: antiguo ? dur(antiguo.hrs) : "—", u: antiguo?.id ?? "", delta: "SLA vencido", fl: "!", dc: "#f2b5b0", bad: true },
    { t: "Último ticket ingresado", v: reciente ? dur(reciente.hrs) : "—", u: "atrás", delta: reciente?.id ?? "", fl: "•", dc: "#9397ab", sinVs: true },
  ];

  return (
    <>
      <div className="mb-[18px] flex items-end justify-between gap-4">
        <div><div className="kicker">Panel de operación · {sucursal}</div><h3 className="page-title">Estado del servicio EAS</h3></div>
        <div className="flex items-center gap-2"><span className="text-xs text-mute-2">Actualizado {AHORA}</span><NuevaBtn /></div>
      </div>

      {vista === "error" && (
        <ErrorState titulo="No pudimos cargar los indicadores" texto="La conexión con eas-data.net (puerto 8810) no respondió. Los datos mostrados pueden estar desactualizados. Código de error:" codigo="EAS-GW-504" retry="/dashboard" />
      )}

      {vista === "cargando" && (
        <>
          <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(178px,1fr))] gap-3">{[1, 2, 3, 4, 5, 6].map((i) => <Sk key={i} className="panel !rounded-[10px]" style={{ height: 104 }} />)}</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(430px,100%),1fr))] gap-3">{[1, 2, 3, 4].map((i) => <Sk key={i} className="panel !rounded-[10px]" style={{ height: 262 }} />)}</div>
        </>
      )}

      {vista === "vacio" && (
        <EmptyState icon="ticket" titulo="Sin tickets en el periodo" texto="Ninguna de tus tiendas ha reportado fallas en los últimos 30 días. Cuando ingreses una solicitud, verás aquí los indicadores de atención." cta="Ingresar la primera solicitud" href="/tickets/nueva" />
      )}

      {vista !== "error" && vista !== "cargando" && vista !== "vacio" && (
        <>
          <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(178px,1fr))] gap-3">
            {kpis.map((k) => (
              <div key={k.t} className="panel flex flex-col gap-1.5 px-3.5 py-[13px]" style={k.bad ? { boxShadow: "inset 0 0 0 1px #4d2731" } : undefined}>
                <div className="min-h-[26px] text-[10.5px] leading-[1.3] tracking-[.06em] text-mute-2 uppercase">{k.t}</div>
                <div className="text-[27px] leading-[1.1] font-medium tracking-[-.02em] whitespace-nowrap" style={{ color: k.bad ? "#f2b5b0" : "#e9e9ed" }}>{k.v}</div>
                <div className="truncate text-[11px] text-mute-2">{k.u || " "}</div>
                <div className="flex items-center gap-[5px] text-[11px] whitespace-nowrap" style={{ color: k.dc }}>
                  <span>{k.fl}</span><span>{k.delta}</span>{!k.sinVs && !k.bad && <span className="truncate text-mute-3">vs. mes anterior</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(430px,100%),1fr))] gap-3">
            <section className="panel px-4 pt-3.5 pb-2">
              <div className="mb-2.5 flex items-center justify-between">
                <h5 className="sec-title">Tickets creados vs. resueltos</h5>
                <div className="flex gap-3 text-[11px] text-mute">
                  <span className="flex items-center gap-[5px]"><span className="size-[9px] rounded-sm bg-[#595d6c]" />Creados</span>
                  <span className="flex items-center gap-[5px]"><span className="size-[9px] rounded-sm bg-accent" />Resueltos</span>
                </div>
              </div>
              <ChartBarras />
              <div className="pb-1.5 text-[11px] text-mute-3">Últimos 12 meses · sep 2025 a ago 2026</div>
            </section>

            <section className="panel px-4 py-3.5">
              <h5 className="sec-title mb-2.5">Distribución por tipo de falla</h5>
              <div className="flex items-center gap-[18px]">
                <ChartDona />
                <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
                  {TIPOS_FALLA.map((p) => (
                    <div key={p[0]} className="flex items-center gap-2 text-[12.5px]">
                      <span className="size-[9px] flex-none rounded-sm" style={{ background: p[2] }} />
                      <span className="min-w-0 flex-1 truncate text-ink-2">{p[0]}</span>
                      <span>{p[1]}</span>
                      <span className="w-[38px] text-right text-mute-3">{Math.round((100 * p[1]) / totTipos)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel px-4 pt-3.5 pb-2">
              <div className="mb-2.5 flex items-center justify-between"><h5 className="sec-title">Tiempo promedio de resolución</h5><span className="text-[11px] text-mute">Semanal · últimas 12 semanas</span></div>
              <ChartLinea />
              <div className="pb-1.5 text-[11px] text-mute-3">La línea roja marca el SLA comprometido de {SLA_HORAS} h.</div>
            </section>

            <section className="panel px-4 py-3.5">
              <div className="mb-3 flex items-center justify-between"><h5 className="sec-title">Tiendas con más incidencias</h5><span className="text-[11px] text-mute">Top 8 · 12 meses</span></div>
              <div className="flex flex-col gap-[9px]">
                {RANKING.map(([n, v]) => (
                  <div key={n} className="grid grid-cols-[172px_1fr_30px] items-center gap-2.5 text-[12.5px]">
                    <span className="truncate text-ink-2">{n}</span>
                    <span className="h-[9px] overflow-hidden rounded-[3px] bg-surface"><span className="block h-[9px] rounded-[3px] bg-accent-600" style={{ width: `${Math.round((100 * v) / maxRank)}%` }} /></span>
                    <span className="text-right">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-[13px]"><h5 className="sec-title">Últimos tickets</h5><Link href="/tickets" className="btn btn-ghost">Ver todos los tickets →</Link></div>
            <div className="overflow-x-auto">
              <table className="table text-[13px]">
                <thead><tr><th className="!pl-4">N° ticket</th><th>Estado</th><th>Prioridad</th><th>Tienda</th><th>Tipo de falla</th><th>Antigüedad</th><th className="!pr-4">Técnico</th></tr></thead>
                <tbody>
                  {[...tickets].sort((a, b) => a.hrs - b.hrs).slice(0, 6).map((t) => (
                    <tr key={t.id}>
                      <td className="!pl-4 tabular-nums"><Link href={`/tickets/${t.id}`} className="text-accent-300">{t.id}</Link></td>
                      <td><EstadoTag est={t.est} /></td>
                      <td><PrioDot prio={t.prio} /></td>
                      <td className="text-ink-2">{t.tiendaN}</td>
                      <td className="text-ink-3">{t.tipo}</td>
                      <td className="tabular-nums" style={{ color: slaInfo(t).fg }}>{t.antig}</td>
                      <td className="!pr-4 text-ink-3">{t.tec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
