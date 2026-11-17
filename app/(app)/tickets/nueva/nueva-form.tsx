"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { crearSolicitudAction, type SolicitudState } from "@/lib/actions";
import { SUBCATEGORIAS, TIPOS_FALLA, type Tienda } from "@/lib/data";
import { MAX_ARCHIVOS } from "@/lib/schemas";

const PRIOS = [
  { v: "Baja", d: "Molestia menor, el equipo sigue operando.", c: "#75798c" },
  { v: "Media", d: "Falla parcial: detecta menos o alarma ocasional.", c: "#5a92c9" },
  { v: "Alta", d: "Equipo inoperante en un punto de control.", c: "#d99b45" },
  { v: "Crítica", d: "Tienda sin protección o alarma constante en sala.", c: "#e0645e" },
];
const PREGUNTAS: { name: string; label: string; opts: [string, string][] }[] = [
  { name: "enciende", label: "¿La antena enciende?", opts: [["Sí", "Sí"], ["No", "No"], ["Intermitente", "Intermitente"]] },
  { name: "alarma", label: "¿Emite alarma constante?", opts: [["Sí", "Sí"], ["No", "No"], ["Solo en horario punta", "Solo en punta"]] },
  { name: "reinicio", label: "¿Se reinició el equipo?", opts: [["Sí, sin cambios", "Sí, sin cambios"], ["Sí, mejoró un rato", "Sí, mejoró"], ["No", "No"]] },
  { name: "obras", label: "¿Hay obras o cambios recientes en el local?", opts: [["Sí", "Sí"], ["No", "No"], ["Hubo corte de energía", "Corte de energía"]] },
];

type Form = { tienda: string; equipo: string; tipo: string; sub: string; prio: string; desc: string; cnombre: string; ccargo: string; ctel: string; chorario: string; [k: string]: string };
const vacio = (): Form => ({ tienda: "", equipo: "", tipo: "", sub: "", prio: "Media", desc: "", enciende: "", alarma: "", reinicio: "", obras: "", cnombre: "", ccargo: "", ctel: "", chorario: "" });

const Sec = ({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) => (
  <section className="panel px-[18px] py-4">
    <div className="mb-3.5 flex items-center gap-[9px]">
      <span className="grid size-[22px] place-items-center rounded-md bg-accent-800 text-[11.5px] text-[#e7e5fe]">{n}</span>
      <h5 className="m-0 text-[15px]">{titulo}</h5>
    </div>
    {children}
  </section>
);

export function NuevaForm({ tiendas, sla, inicial }: { tiendas: Tienda[]; sla: number; inicial?: { tienda: string; equipo: string } }) {
  const [state, action, pending] = useActionState<SolicitudState, FormData>(crearSolicitudAction, {});
  const aviso = useToast();
  const [f, setF] = useState<Form>(() => {
    const t = tiendas.find((x) => x.n === inicial?.tienda);
    return { ...vacio(), ...(t ? { tienda: t.n, equipo: inicial!.equipo, cnombre: t.cont, ccargo: t.cargo, ctel: t.tel, chorario: t.hor } : {}) };
  });
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => { if (state.aviso && !state.id) aviso(state.aviso); }, [state, aviso]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const t = tiendas.find((x) => x.n === f.tienda);
  const err = state.errores ?? {};

  const syncInput = (list: File[]) => {
    const dt = new DataTransfer(); list.forEach((x) => dt.items.add(x));
    if (fileRef.current) fileRef.current.files = dt.files;
    setFiles(list);
  };
  const agregar = (nuevos: FileList | null) => { if (nuevos?.length) syncInput([...files, ...Array.from(nuevos)].slice(0, MAX_ARCHIVOS)); };

  if (state.id) {
    return (
      <div className="mx-auto my-10 flex max-w-[620px] flex-col items-start gap-4 rounded-xl bg-panel p-[34px] shadow-[inset_0_0_0_1px_#2c4a3a]">
        <span className="grid size-[46px] place-items-center rounded-[11px] bg-[#23402f] text-[#a8dcbd]"><Icon name="check" size={24} /></span>
        <div>
          <h4 className="mb-1.5 text-[21px]">Solicitud ingresada correctamente</h4>
          <p className="m-0 max-w-[470px] text-[13.5px] text-mute">Tu ticket <span className="text-accent-300">{state.id}</span> quedó en la cola de asignación. La mesa de ayuda asigna un técnico dentro de la ventana comprometida de {sla} horas y recibirás aviso por correo en cada cambio de estado.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tickets/${state.id}`} className="btn btn-primary">Ver el ticket</Link>
          <a href="/tickets/nueva" className="btn btn-secondary">Ingresar otra solicitud</a>
          <Link href="/tickets" className="btn btn-ghost">Volver al listado</Link>
        </div>
      </div>
    );
  }

  const resumen = [
    { l: "Tienda", v: f.tienda || "Sin seleccionar", ok: !!f.tienda },
    { l: "Equipo", v: f.equipo || "Sin seleccionar", ok: !!f.equipo },
    { l: "Tipo de falla", v: (f.tipo || "Sin seleccionar") + (f.sub ? ` · ${f.sub}` : ""), ok: !!f.tipo },
    { l: "Prioridad", v: f.prio, ok: true },
    { l: "Descripción", v: f.desc ? f.desc.slice(0, 90) + (f.desc.length > 90 ? "…" : "") : "Pendiente", ok: f.desc.trim().length >= 12 },
    { l: "Adjuntos", v: files.length ? `${files.length} archivo(s)` : "Sin adjuntos", ok: files.length > 0 },
    { l: "Contacto en terreno", v: f.cnombre ? f.cnombre + (f.ctel ? ` · ${f.ctel}` : "") : "Pendiente", ok: !!f.cnombre },
  ];
  const completado = Math.round((100 * [!!f.tienda, !!f.equipo, !!f.tipo, f.desc.trim().length >= 12, !!f.cnombre].filter(Boolean).length) / 5);
  const inv = (k: string) => (err[k] ? { "aria-invalid": true as const } : {});

  return (
    <form key={key} action={action} className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-3.5 max-[1100px]:grid-cols-1">
      <div className="flex flex-col gap-3">
        <Sec n={1} titulo="Tienda y equipo afectado">
          <div className="grid grid-cols-2 gap-[11px] max-[700px]:grid-cols-1">
            <div className="field">
              <label htmlFor="tienda">Tienda / local afectado</label>
              <select id="tienda" name="tienda" className="input" value={f.tienda} {...inv("tienda")}
                onChange={(e) => { const x = tiendas.find((y) => y.n === e.target.value); setF((p) => ({ ...p, tienda: e.target.value, equipo: "", cnombre: x?.cont ?? "", ccargo: x?.cargo ?? "", ctel: x?.tel ?? "", chorario: x?.hor ?? "" })); }}>
                <option value="">Buscar y seleccionar tienda…</option>
                {tiendas.map((x) => <option key={x.id}>{x.n}</option>)}
              </select>
              {err.tienda && <p className="mt-1 mb-0 text-[11.5px] text-[#f2b5b0]">{err.tienda}</p>}
            </div>
            <div className="field">
              <label htmlFor="equipo">Equipo instalado</label>
              <select id="equipo" name="equipo" className="input" value={f.equipo} onChange={(e) => set("equipo", e.target.value)} {...inv("equipo")}>
                <option value="">Selecciona la antena…</option>
                {(t?.eq ?? []).map((e) => <option key={e.s} value={e.s}>{e.m} · {e.u} · {e.s}</option>)}
              </select>
              {err.equipo && <p className="mt-1 mb-0 text-[11.5px] text-[#f2b5b0]">{err.equipo}</p>}
            </div>
          </div>
          <p className="mt-2.5 mb-0 text-[11.5px] text-mute-3">Si el equipo no aparece en la lista, indícalo en la descripción con su número de serie y ubicación dentro del local.</p>
        </Sec>

        <Sec n={2} titulo="Clasificación de la falla">
          <div className="mb-3.5 grid grid-cols-2 gap-[11px] max-[700px]:grid-cols-1">
            <div className="field">
              <label htmlFor="tipo">Tipo de falla</label>
              <select id="tipo" name="tipo" className="input" value={f.tipo} onChange={(e) => setF((p) => ({ ...p, tipo: e.target.value, sub: "" }))} {...inv("tipo")}>
                <option value="">Selecciona una categoría…</option>
                {TIPOS_FALLA.map((x) => <option key={x[0]}>{x[0]}</option>)}
              </select>
              {err.tipo && <p className="mt-1 mb-0 text-[11.5px] text-[#f2b5b0]">{err.tipo}</p>}
            </div>
            <div className="field">
              <label htmlFor="sub">Subcategoría</label>
              <select id="sub" name="sub" className="input" value={f.sub} onChange={(e) => set("sub", e.target.value)}>
                <option value="">Opcional · precisa el síntoma</option>
                {(SUBCATEGORIAS[f.tipo] ?? []).map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <span className="lbl block">Prioridad sugerida</span>
            <input type="hidden" name="prio" value={f.prio} />
            <div className="mt-0.5 grid grid-cols-4 gap-2 max-[700px]:grid-cols-2" role="radiogroup" aria-label="Prioridad sugerida">
              {PRIOS.map((p) => (
                <button key={p.v} type="button" role="radio" aria-checked={f.prio === p.v} onClick={() => set("prio", p.v)}
                  className="relative flex cursor-pointer flex-col gap-[5px] rounded-[9px] border border-line-2 bg-panel-2 px-[11px] py-2.5 text-left text-ink"
                  style={f.prio === p.v ? { borderColor: "#9184d9", background: "color-mix(in srgb, #9184d9 10%, #1a1c2b)" } : undefined}>
                  <span className="flex items-center gap-1.5 text-[13px]"><span className="size-2 rounded-full" style={{ background: p.c }} />{p.v}</span>
                  <span className="text-[11px] leading-[1.35] text-mute">{p.d}</span>
                </button>
              ))}
            </div>
          </div>
        </Sec>

        <Sec n={3} titulo="Descripción y contexto">
          <div className="field mb-3.5">
            <label htmlFor="desc">Descripción detallada del problema</label>
            <textarea id="desc" name="desc" className="input !min-h-[126px] leading-normal" value={f.desc} maxLength={2000} onChange={(e) => set("desc", e.target.value)} {...inv("desc")}
              placeholder="Cuéntanos desde cuándo ocurre, si es permanente o intermitente, si hubo corte de energía u obras en el local, y qué luces o indicadores muestra el equipo (por ejemplo: luz de red ámbar fija, pantalla apagada, pitido continuo)." />
            {err.desc && <p className="mt-1 mb-0 text-[11.5px] text-[#f2b5b0]">{err.desc}</p>}
          </div>
          <div className="grid grid-cols-2 gap-[13px] max-[700px]:grid-cols-1">
            {PREGUNTAS.map((q) => (
              <div key={q.name} className="field">
                <span className="lbl block">{q.label}</span>
                <div className="mt-[3px] flex flex-wrap gap-3.5">
                  {q.opts.map(([v, l]) => (
                    <label key={v} className="radio"><input type="radio" name={q.name} value={v} checked={f[q.name] === v} onChange={() => set(q.name, v)} /><span className="dot" />{l}</label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Sec>

        <Sec n={4} titulo="Evidencia adjunta">
          <label onDrop={(e) => { e.preventDefault(); agregar(e.dataTransfer.files); }} onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center gap-[7px] rounded-[10px] border-[1.5px] border-dashed border-line-3 bg-panel-2 p-[26px] text-center">
            <Icon name="upload" size={24} className="text-accent" />
            <span className="text-[13.5px] text-ink-2">Arrastra fotos o videos del equipo, o haz clic para seleccionar</span>
            <span className="text-[11.5px] text-mute-3">JPG, PNG o MP4 · hasta 25 MB por archivo · máximo {MAX_ARCHIVOS} archivos</span>
            <input ref={fileRef} type="file" name="adjuntos" multiple accept="image/jpeg,image/png,video/mp4" className="hidden" onChange={(e) => agregar(e.target.files)} />
          </label>
          {err.adj && <p className="mt-2 mb-0 text-[11.5px] text-[#f2b5b0]">{err.adj}</p>}
          <div className="mt-[11px] flex flex-wrap gap-[7px]">
            {files.map((a, i) => (
              <button key={a.name + i} type="button" onClick={() => syncInput(files.filter((_, j) => j !== i))}
                className="inline-flex cursor-pointer items-center gap-[7px] rounded-[7px] border border-line-2 bg-surface px-[9px] py-[5px] text-xs text-ink-2" aria-label={`Quitar ${a.name}`}>
                <Icon name="image" size={13} className="text-mute" />{a.name}<Icon name="x" size={11} className="text-mute-2" />
              </button>
            ))}
          </div>
        </Sec>

        <Sec n={5} titulo="Contacto en terreno">
          <div className="grid grid-cols-2 gap-[11px] max-[700px]:grid-cols-1">
            <div className="field"><label htmlFor="cnombre">Nombre de quien recibe al técnico</label><input id="cnombre" name="cnombre" className="input" value={f.cnombre} onChange={(e) => set("cnombre", e.target.value)} placeholder="Nombre y apellido" maxLength={80} /></div>
            <div className="field"><label htmlFor="ccargo">Cargo</label><input id="ccargo" name="ccargo" className="input" value={f.ccargo} onChange={(e) => set("ccargo", e.target.value)} placeholder="Jefe de local, prevención…" maxLength={80} /></div>
            <div className="field"><label htmlFor="ctel">Teléfono de contacto</label><input id="ctel" name="ctel" className="input" value={f.ctel} onChange={(e) => set("ctel", e.target.value)} placeholder="+56 9 ..." maxLength={30} inputMode="tel" /></div>
            <div className="field"><label htmlFor="chorario">Horario de atención del local</label><input id="chorario" name="chorario" className="input" value={f.chorario} onChange={(e) => set("chorario", e.target.value)} placeholder="Lun a Dom · 10:00 – 21:00" maxLength={60} /></div>
          </div>
        </Sec>
      </div>

      <aside className="panel sticky top-[74px] flex flex-col gap-3 p-4 max-[1100px]:static">
        <div>
          <div className="mb-2 flex items-baseline justify-between"><h5 className="sec-title m-0">Resumen de la solicitud</h5><span className="text-[11.5px] text-accent">{completado}%</span></div>
          <div className="h-[5px] overflow-hidden rounded-[3px] bg-surface"><span className="block h-[5px] rounded-[3px] bg-accent transition-[width]" style={{ width: `${completado}%` }} /></div>
        </div>
        <div className="flex flex-col gap-[9px]">
          {resumen.map((r) => (
            <div key={r.l} className="flex gap-[9px] border-b border-surface pb-[9px]">
              <span className="mt-1.5 size-1.5 flex-none rounded-full" style={{ background: r.ok ? "#58b483" : "#3f424d" }} />
              <div className="min-w-0"><div className="text-[10.5px] tracking-[.07em] text-mute-2 uppercase">{r.l}</div><div className="text-[12.5px] leading-[1.4] break-words text-ink-2">{r.v}</div></div>
            </div>
          ))}
        </div>
        <div className="text-[11.5px] leading-normal text-mute-3">Al enviar, la mesa de ayuda de Grupo DMC recibe el reporte y asigna un técnico dentro de la ventana de {sla} horas.</div>
        <button type="submit" disabled={pending} className="btn btn-primary btn-block !min-h-10">{pending ? "Enviando…" : "Enviar solicitud"}</button>
        <Link href="/tickets" className="btn btn-ghost self-start">Cancelar</Link>
      </aside>
    </form>
  );
}
