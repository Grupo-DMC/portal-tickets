"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { OPT_ESTADOS, OPT_MODELOS, OPT_ORDEN, OPT_PRIOS, OPT_TECS, OPT_TIENDAS, OPT_TIPOS, type Filtros } from "@/lib/filtros";
import { Icon } from "./icons";
import { useToast } from "./toast";

const CHIPS: [keyof Filtros, string, string][] = [
  ["q", "Texto", ""], ["estado", "Estado", "Todos"], ["prio", "Prioridad", "Todas"], ["tienda", "Tienda", "Todas"],
  ["tipo", "Tipo", "Todos"], ["tec", "Técnico", "Todos"], ["modelo", "Modelo", "Todos"], ["desde", "Desde", ""], ["hasta", "Hasta", ""],
];

export function TicketFilters({ f }: { f: Filtros }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const aviso = useToast();
  const [q, setQ] = useState(f.q);

  const push = (k: string, v: string) => {
    const p = new URLSearchParams(sp.toString());
    if (!v || v === "Todos" || v === "Todas" || (k === "orden" && v === "antig")) p.delete(k); else p.set(k, v);
    p.delete("page");
    const s = p.toString();
    router.replace(s ? `${path}?${s}` : path);
  };
  const quitar = (k: string) => {
    const p = new URLSearchParams(sp.toString());
    p.delete(k); p.delete("page");
    const s = p.toString();
    return s ? `${path}?${s}` : path;
  };
  const chips = CHIPS.filter(([k, , def]) => f[k] !== def).map(([k, l]) => ({ k, l: `${l}: ${k === "q" ? `“${f.q}”` : f[k]}` }));
  const keep = new URLSearchParams(); for (const k of ["vista"]) { const v = sp.get(k); if (v) keep.set(k, v); }

  const Sel = ({ k, opts, v }: { k: string; opts: string[]; v: string }) => (
    <select className="input" value={v} onChange={(e) => push(k, e.target.value)} aria-label={k}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
  );

  return (
    <div className="panel mb-2.5 px-3.5 py-[13px]">
      <div className="mb-[9px] grid grid-cols-[minmax(220px,1.6fr)_repeat(4,minmax(0,1fr))] gap-[9px] max-[1100px]:grid-cols-2">
        <div className="relative">
          <Icon name="search" size={14} className="absolute top-[11px] left-2.5 text-mute-2" />
          <input className="input pl-[31px]" value={q} placeholder="Buscar por N°, serie, falla, técnico…" aria-label="Buscar" maxLength={80}
            onChange={(e) => setQ(e.target.value)} onBlur={() => q !== f.q && push("q", q.trim())} onKeyDown={(e) => e.key === "Enter" && push("q", q.trim())} />
        </div>
        <Sel k="estado" opts={OPT_ESTADOS} v={f.estado} />
        <Sel k="prio" opts={OPT_PRIOS} v={f.prio} />
        <Sel k="tienda" opts={OPT_TIENDAS} v={f.tienda} />
        <Sel k="tipo" opts={OPT_TIPOS} v={f.tipo} />
      </div>
      <div className="grid grid-cols-[repeat(5,minmax(0,1fr))_auto] items-center gap-[9px] max-[1100px]:grid-cols-2">
        <Sel k="modelo" opts={OPT_MODELOS} v={f.modelo} />
        <Sel k="tec" opts={OPT_TECS} v={f.tec} />
        <input className="input" type="date" value={f.desde} onChange={(e) => push("desde", e.target.value)} aria-label="Desde" />
        <input className="input" type="date" value={f.hasta} onChange={(e) => push("hasta", e.target.value)} aria-label="Hasta" />
        <select className="input" value={f.orden} onChange={(e) => push("orden", e.target.value)} aria-label="Orden">
          {OPT_ORDEN.map((o) => <option key={o.v} value={o.v}>Ordenar: {o.l}</option>)}
        </select>
        <button type="button" className="btn btn-secondary whitespace-nowrap" onClick={() => aviso("Vista guardada como “Críticos sin resolver”")}><Icon name="bookmark" size={14} />Guardar vista</button>
      </div>
      {chips.length > 0 && (
        <div className="mt-[11px] flex flex-wrap items-center gap-1.5 border-t border-line pt-[11px]">
          <span className="mr-[3px] text-[11px] tracking-[.08em] text-mute-2 uppercase">Filtros activos</span>
          {chips.map((c) => (
            <Link key={c.k} href={quitar(c.k)} className="inline-flex items-center gap-1.5 rounded-md border border-accent-800 bg-[#221f36] py-[3px] pr-2 pl-2.5 text-[11.5px] text-accent-300">
              {c.l}<Icon name="x" size={11} />
            </Link>
          ))}
          <Link href={keep.toString() ? `${path}?${keep}` : path} className="btn btn-ghost !text-[11.5px]">Limpiar todo</Link>
        </div>
      )}
    </div>
  );
}
