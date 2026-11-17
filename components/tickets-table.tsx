"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EstadoTag, PrioDot } from "./ui";
import { useToast } from "./toast";

export type Fila = {
  id: string; tiendaN: string; modelo: string; ubic: string; tipo: string; prio: string; est: string; cre: string; antig: string;
  slaTxt: string; slaFg: string; slaBg: string; act: string; tec: string;
};

export function TicketsTable({ filas, mostrarSLA, qs }: { filas: Fila[]; mostrarSLA: boolean; qs: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const aviso = useToast();
  const [marcados, setMarcados] = useState<string[]>([]);
  const toggle = (id: string) => setMarcados((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));
  const todos = marcados.length === filas.length && filas.length > 0;

  const ordenar = (v: string) => { const p = new URLSearchParams(sp.toString()); p.set("orden", v); p.delete("page"); router.replace(`${path}?${p}`); };
  const ordBtn = "cursor-pointer border-0 bg-transparent p-0 font-[inherit] [letter-spacing:inherit] text-[inherit] [text-transform:inherit]";
  const exportar = marcados.length ? `/tickets/export?formato=csv&ids=${marcados.join(",")}` : `/tickets/export?formato=csv${qs}`;

  return (
    <>
      {marcados.length > 0 && (
        <div className="mb-2.5 flex items-center gap-2.5 rounded-[9px] bg-[#221f36] px-3.5 py-[9px] shadow-[inset_0_0_0_1px_#423a6a]">
          <span className="text-[13px] text-accent-300">{marcados.length} ticket(s) seleccionados</span>
          <div className="ml-auto flex gap-[7px]">
            <button className="btn btn-secondary !text-[12.5px]" onClick={() => { aviso(`${marcados.length} ticket(s) enviados a la mesa de ayuda para reasignación`); setMarcados([]); }}>Solicitar reasignación</button>
            <button className="btn btn-secondary !text-[12.5px]" onClick={() => { aviso(`${marcados.length} ticket(s) marcados para cierre`); setMarcados([]); }}>Marcar para cierre</button>
            <a className="btn btn-secondary !text-[12.5px]" href={exportar} download>Exportar selección</a>
            <button className="btn btn-ghost !text-[12.5px]" onClick={() => setMarcados([])}>Quitar selección</button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table min-w-[1180px] text-[12.5px]">
          <thead>
            <tr>
              <th className="!w-[34px] !pl-3.5"><input type="checkbox" checked={todos} onChange={() => setMarcados(todos ? [] : filas.map((f) => f.id))} aria-label="Seleccionar todo" /></th>
              <th><button className={ordBtn} onClick={() => ordenar(sp.get("orden") === "nuevo" ? "antig" : "nuevo")}>N° ticket ↕</button></th>
              <th>Tienda</th><th>Equipo</th><th>Tipo de falla</th>
              <th><button className={ordBtn} onClick={() => ordenar("prio")}>Prioridad ↕</button></th>
              <th>Estado</th><th>Creación</th>
              <th><button className={ordBtn} onClick={() => ordenar("antig")}>Antigüedad ↕</button></th>
              {mostrarSLA && <th>SLA</th>}
              <th>Últ. actualización</th><th className="!pr-3.5">Técnico</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((t) => (
              <tr key={t.id} data-click onClick={() => router.push(`/tickets/${t.id}`)}>
                <td className="!pl-3.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={marcados.includes(t.id)} onChange={() => toggle(t.id)} aria-label={`Seleccionar ${t.id}`} /></td>
                <td className="whitespace-nowrap tabular-nums"><Link href={`/tickets/${t.id}`} onClick={(e) => e.stopPropagation()} className="text-accent-300">{t.id}</Link></td>
                <td className="whitespace-nowrap text-ink-2">{t.tiendaN}</td>
                <td className="whitespace-nowrap text-mute">{t.modelo} · {t.ubic}</td>
                <td className="whitespace-nowrap text-ink-3">{t.tipo}</td>
                <td><PrioDot prio={t.prio} /></td>
                <td><EstadoTag est={t.est} /></td>
                <td className="whitespace-nowrap text-mute tabular-nums">{t.cre}</td>
                <td className="tabular-nums text-ink-2">{t.antig}</td>
                {mostrarSLA && <td><span className="tag" style={{ background: t.slaBg, color: t.slaFg }}>{t.slaTxt}</span></td>}
                <td className="whitespace-nowrap text-mute tabular-nums">{t.act}</td>
                <td className="!pr-3.5 whitespace-nowrap text-ink-3">{t.tec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
