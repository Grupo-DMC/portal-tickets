import type { Metadata } from "next";
import { ChartBarras, ChartLinea } from "@/components/charts";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/ui";
import { CUMPLIMIENTO_TIENDA, RANKING, TIEMPO_PROMEDIO_TIENDA } from "@/lib/data";

export const metadata: Metadata = { title: "Reportes" };

export default function Reportes() {
  return (
    <>
      <PageHead kicker="Reportes de servicio" title="Cumplimiento y volumen">
        <a href="/tickets/export?formato=csv" download className="btn btn-secondary"><Icon name="download" size={15} />Exportar Excel</a>
        <a href="/tickets/export?formato=pdf" target="_blank" rel="noopener" className="btn btn-primary">Generar informe PDF</a>
      </PageHead>
      <div className="mb-3 grid grid-cols-[repeat(auto-fit,minmax(min(430px,100%),1fr))] gap-3">
        <section className="panel px-4 pt-3.5 pb-2"><h5 className="sec-title mb-2.5">Volumen mensual</h5><ChartBarras /></section>
        <section className="panel px-4 pt-3.5 pb-2"><h5 className="sec-title mb-2.5">Tiempo de resolución vs. SLA</h5><ChartLinea /></section>
      </div>
      <section className="panel overflow-hidden">
        <div className="px-4 py-3.5"><h5 className="sec-title">Detalle por tienda · últimos 12 meses</h5></div>
        <div className="overflow-x-auto"><table className="table text-[13px]">
          <thead><tr><th className="!pl-4">Tienda</th><th>Tickets ingresados</th><th>Resueltos</th><th>Tiempo promedio</th><th className="!pr-4">Cumplimiento SLA</th></tr></thead>
          <tbody>
            {RANKING.map(([n, tot], i) => {
              const c = CUMPLIMIENTO_TIENDA[i];
              const [bg, fg] = c >= 95 ? ["#23402f", "#a8dcbd"] : c >= 88 ? ["#4d3a22", "#efcd97"] : ["#4d2731", "#f2b5b0"];
              return (
                <tr key={n}>
                  <td className="!pl-4 text-ink">{n}</td><td className="text-ink-2 tabular-nums">{tot}</td><td className="text-ink-2 tabular-nums">{tot - (i % 3)}</td>
                  <td className="text-ink-3 tabular-nums">{TIEMPO_PROMEDIO_TIENDA[i]}</td>
                  <td className="!pr-4"><span className="tag" style={{ background: bg, color: fg }}>{c}%</span></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>
    </>
  );
}
