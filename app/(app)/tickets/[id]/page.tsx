import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icons";
import { EstadoTag, PrioDot } from "@/components/ui";
import { SLA_HORAS } from "@/lib/data";
import { slaInfo, iniciales } from "@/lib/format";
import { comentariosDe, lineaTiempoDe, listarTickets, ticketPorId } from "@/lib/repo";
import { IdTicketSchema } from "@/lib/schemas";
import { Comentarios, EstadoSelect, Valoracion } from "./cliente";

const COL_TL = { crea: "#9184d9", asig: "#5a92c9", nota: "#9397ab", visita: "#d99b45", est: "#d99b45", res: "#58b483", cierre: "#75798c" };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: (await params).id };
}

export default async function Detalle({ params }: { params: Promise<{ id: string }> }) {
  const id = IdTicketSchema.safeParse((await params).id);
  const t = id.success ? ticketPorId(id.data) : null;
  if (!t) notFound();

  const s = slaInfo(t);
  const tl = lineaTiempoDe(t);
  const co = comentariosDe(t);
  const previas = listarTickets().filter((x) => x.eq === t.eq && x.id !== t.id);
  const e = t.equipo;
  const cerrado = t.est === "Resuelto" || t.est === "Cerrado";
  const T = t.tienda;

  return (
    <>
      <Link href="/tickets" className="btn btn-ghost mb-2.5 !pl-0">← Volver al listado de tickets</Link>
      <div className="panel mb-3 flex items-start justify-between gap-[18px] px-[18px] py-4 max-[900px]:flex-col">
        <div className="min-w-0">
          <div className="mb-[7px] flex flex-wrap items-center gap-[9px]">
            <h3 className="m-0 text-[23px] tabular-nums">{t.id}</h3>
            <EstadoTag est={t.est} />
            <PrioDot prio={t.prio} label={`Prioridad ${t.prio}`} />
          </div>
          <div className="text-[13.5px] text-ink-3">{t.tipo} · {t.tiendaN} · {t.modelo} en {t.ubic}</div>
          <div className="mt-1 text-xs text-mute-3">Creado el {t.cre} · última actualización {t.act} · técnico {t.tec}</div>
        </div>
        <div className="w-[238px] flex-none">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[10.5px] tracking-[.08em] text-mute-2 uppercase">SLA de respuesta</span>
            <span className="text-[12.5px]" style={{ color: s.fg }}>{s.txt}</span>
          </div>
          <div className="h-[7px] overflow-hidden rounded bg-surface"><span className="block h-[7px] rounded" style={{ background: s.fg, width: `${s.pct}%` }} /></div>
          <div className="mt-1.5 text-[11px] text-mute-3">Ventana comprometida de {SLA_HORAS} h · antigüedad {t.antig}</div>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_336px] items-start gap-3 max-[1100px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <section className="panel px-[18px] py-4">
            <h5 className="sec-title mb-3.5">Línea de tiempo</h5>
            <div className="flex flex-col">
              {tl.map((ev, i) => (
                <div key={i} className="grid grid-cols-[20px_1fr] gap-[11px]">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 size-2.5 rounded-full" style={{ background: COL_TL[ev.k], boxShadow: `0 0 0 3px color-mix(in srgb, ${COL_TL[ev.k]} 22%, transparent)` }} />
                    <span className="my-1 w-px flex-1 bg-line-2" />
                  </div>
                  <div className="pb-[15px]"><div className="text-[13.5px]">{ev.t}</div><div className="mt-0.5 text-[11.5px] text-mute-2">{ev.a} · {ev.d}</div></div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel px-[18px] py-4">
            <h5 className="sec-title mb-3.5">Conversación con soporte</h5>
            <div className="mb-3.5 flex flex-col gap-[11px]">
              {co.map((c, i) => {
                const cli = c.r === "Cliente";
                return (
                  <div key={i} className="flex gap-[11px]">
                    <span className="grid size-[30px] flex-none place-items-center rounded-lg text-[11.5px] text-[#e7e5fe]" style={{ background: cli ? "#3f424d" : "#423a6a" }}>{iniciales(c.a)}</span>
                    <div className="min-w-0 flex-1 rounded-[9px] px-[13px] py-[11px]" style={{ background: cli ? "#232532" : "#1f2133", boxShadow: `inset 0 0 0 1px ${cli ? "#3f424d" : "#423a6a"}` }}>
                      <div className="mb-[5px] flex items-center gap-2">
                        <span className="text-[12.5px]">{c.a}</span><span className="tag tag-neutral !text-[10px]">{c.r}</span>
                        <span className="ml-auto text-[11px] text-mute-3">{c.d}</span>
                      </div>
                      <p className="m-0 text-[13px] leading-normal whitespace-pre-line text-ink-2">{c.x}</p>
                      {!!c.adj?.length && (
                        <div className="mt-[9px] flex flex-wrap gap-1.5">
                          {c.adj.map((a) => <span key={a} className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-2 py-1 text-[11.5px] text-ink-3 shadow-[inset_0_0_0_1px_#3f424d]"><Icon name="image" size={12} className="text-accent" />{a}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Comentarios id={t.id} />
          </section>

          {cerrado && (
            <section className="panel px-[18px] py-4 !shadow-[inset_0_0_0_1px_#2c4a3a]">
              <h5 className="sec-title mb-[5px]">¿Cómo fue la atención?</h5>
              <p className="mb-3 text-[12.5px] text-mute">Tu valoración se comparte con el técnico asignado y con el supervisor de servicio.</p>
              <Valoracion id={t.id} inicial={t.valoracion ?? 0} />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <section className="panel px-4 py-[15px]">
            <h6 className="mb-[11px] text-mute-2">Tienda</h6>
            <div className="mb-[3px] text-sm">{T.n}</div>
            <div className="text-[12.5px] leading-normal text-mute">{T.dir}<br />{T.com}, Región Metropolitana</div>
            <div className="my-3 h-px bg-line" />
            <div className="dl"><span>Contacto</span><span>{T.cont}</span><span>Cargo</span><span>{T.cargo}</span><span>Teléfono</span><span>{T.tel}</span><span>Horario</span><span>{T.hor}</span></div>
          </section>
          <section className="panel px-4 py-[15px]">
            <h6 className="mb-[11px] text-mute-2">Información técnica del equipo</h6>
            <div className="dl"><span>Modelo</span><span className="!text-ink">{e?.m ?? "—"}</span><span>N° de serie</span><span className="tabular-nums">{t.eq}</span><span>Ubicación</span><span>{e?.u ?? "—"}</span><span>Instalación</span><span>{e?.inst ?? "—"}</span><span>Última mantención</span><span>{e?.mant ?? "—"}</span><span>Última señal</span><span>{e?.sig ?? "—"}</span></div>
          </section>
          <section className="panel px-4 py-[15px]">
            <h6 className="mb-[11px] text-mute-2">Fallas previas de este equipo</h6>
            {previas.length ? (
              <div className="flex flex-col gap-[9px]">
                {previas.map((p) => (
                  <Link key={p.id} href={`/tickets/${p.id}`} className="flex flex-col gap-[3px] rounded-lg bg-panel-2 px-2.5 py-[9px] text-ink shadow-[inset_0_0_0_1px_#262838]">
                    <span className="flex items-center gap-[7px] text-[12.5px]"><span className="tabular-nums text-accent-300">{p.id}</span><EstadoTag est={p.est} small /></span>
                    <span className="text-[11.5px] text-mute">{p.tipo} · {p.cre}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="m-0 text-[12.5px] text-mute-3">Sin fallas registradas antes de este ticket.</p>}
          </section>
          <section className="panel px-4 py-[15px]">
            <h6 className="mb-[11px] text-mute-2">Gestión · administrador de cuenta</h6>
            <EstadoSelect id={t.id} actual={t.est} />
            <a href={`/tickets/${t.id}/acta`} target="_blank" rel="noopener" className="btn btn-secondary btn-block">Descargar acta en PDF</a>
          </section>
        </aside>
      </div>
    </>
  );
}
