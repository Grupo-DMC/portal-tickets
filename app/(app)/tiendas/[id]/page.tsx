import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { EstadoTag } from "@/components/ui";
import { MESES, TIENDAS } from "@/lib/data";
import { abierto } from "@/lib/format";
import { listarTickets } from "@/lib/repo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: TIENDAS.find((t) => t.id === id)?.n ?? "Tienda" };
}

export default async function Tienda({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const td = TIENDAS.find((t) => t.id === id);
  if (!td) notFound();
  const tks = listarTickets().filter((t) => t.ti === td.id);
  const maxInc = Math.max(...td.inc, 1);

  return (
    <>
      <Link href="/tiendas" className="btn btn-ghost mb-2.5 !pl-0">← Volver a tiendas</Link>
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <div><div className="kicker">Ficha de tienda</div><h3 className="page-title">{td.n}</h3></div>
        <Link href={`/tickets/nueva?tienda=${td.id}`} className="btn btn-primary"><Icon name="plus" size={15} />Reportar falla en esta tienda</Link>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-3 max-[1100px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5"><h5 className="sec-title">Inventario de equipos instalados</h5><span className="text-xs text-mute-2">{td.eq.length} antenas</span></div>
            <div className="overflow-x-auto"><table className="table text-[12.5px]">
              <thead><tr><th className="!pl-4">Modelo</th><th>N° de serie</th><th>Ubicación en el local</th><th>Conectividad</th><th>Última señal</th><th className="!pr-4" /></tr></thead>
              <tbody>
                {td.eq.map((e) => (
                  <tr key={e.s}>
                    <td className="!pl-4 text-ink">{e.m}</td><td className="text-mute tabular-nums">{e.s}</td><td className="text-ink-2">{e.u}</td>
                    <td><span className="tag" style={e.on ? { background: "#23402f", color: "#a8dcbd" } : { background: "#4d2731", color: "#f2b5b0" }}>{e.on ? "En línea" : "Fuera de línea"}</span></td>
                    <td className="text-mute tabular-nums">{e.sig}</td>
                    <td className="!pr-4 text-right"><Link href={`/tickets/nueva?tienda=${td.id}&equipo=${e.s}`} className="btn btn-ghost !text-xs">Reportar falla</Link></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </section>
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5"><h5 className="sec-title">Historial de tickets de la tienda</h5><span className="text-xs text-mute-2">{tks.filter(abierto).length} abiertos</span></div>
            <div className="overflow-x-auto"><table className="table text-[12.5px]">
              <thead><tr><th className="!pl-4">N° ticket</th><th>Tipo de falla</th><th>Equipo</th><th>Estado</th><th>Creación</th><th className="!pr-4">Técnico</th></tr></thead>
              <tbody>
                {tks.map((t) => (
                  <tr key={t.id}>
                    <td className="!pl-4 tabular-nums"><Link href={`/tickets/${t.id}`} className="text-accent-300">{t.id}</Link></td>
                    <td className="text-ink-2">{t.tipo}</td><td className="text-mute">{t.modelo} · {t.ubic}</td><td><EstadoTag est={t.est} /></td>
                    <td className="text-mute tabular-nums">{t.cre}</td><td className="!pr-4 text-ink-3">{t.tec}</td>
                  </tr>
                ))}
                {!tks.length && <tr><td colSpan={6} className="!py-6 text-center text-mute-3">Sin tickets registrados.</td></tr>}
              </tbody>
            </table></div>
          </section>
        </div>
        <aside className="flex flex-col gap-3">
          <section className="panel px-4 py-[15px]">
            <h6 className="mb-[11px] text-mute-2">Datos del local</h6>
            <div className="mb-3 rounded-[9px] bg-panel-2 px-[13px] py-3 shadow-[inset_0_0_0_1px_#262838]">
              <div className="text-[12.5px] leading-normal text-ink-2">{td.dir}<br />{td.com}, Región Metropolitana</div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${td.dir}, ${td.com}, Chile`)}`} target="_blank" rel="noopener noreferrer" className="mt-[7px] inline-block text-xs">Ver en el mapa →</a>
            </div>
            <div className="dl"><span>Contacto</span><span>{td.cont}</span><span>Cargo</span><span>{td.cargo}</span><span>Teléfono</span><span>{td.tel}</span><span>Horario</span><span>{td.hor}</span></div>
          </section>
          <section className="panel px-4 py-[15px]">
            <h6 className="mb-3 text-mute-2">Incidencias por mes · 12 meses</h6>
            <div className="flex h-[74px] items-end gap-[5px]">
              {td.inc.map((v, i) => (
                <div key={i} className="flex h-[74px] flex-1 flex-col items-center justify-end gap-[5px]" title={`${MESES[i]}: ${v}`}>
                  <span className="min-h-0.5 w-full rounded-t-[3px] bg-accent-600" style={{ height: `${Math.round((100 * v) / maxInc)}%` }} />
                  <span className="text-[9.5px] text-mute-3">{MESES[i]}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
