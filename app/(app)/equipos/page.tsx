import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { MODELOS } from "@/lib/data";
import { listarEquipos } from "@/lib/repo";
import { getSucursal } from "@/lib/session";

export const metadata: Metadata = { title: "Equipos" };

type SP = { q?: string; modelo?: string; conn?: string };
const OPT_CONN = ["Todas", "En línea", "Fuera de línea"];

export default async function Equipos({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80).trim().toLowerCase();
  const modelo = MODELOS.includes(sp.modelo as never) ? sp.modelo! : "Todos";
  const conn = OPT_CONN.includes(sp.conn ?? "") ? sp.conn! : "Todas";
  const sucursal = await getSucursal();

  const eqs = listarEquipos().filter((e) => {
    if (modelo !== "Todos" && e.m !== modelo) return false;
    if (conn === "En línea" && !e.on) return false;
    if (conn === "Fuera de línea" && e.on) return false;
    if (sucursal !== "Todas las tiendas" && e.tienda !== sucursal) return false;
    return !q || `${e.s} ${e.tienda} ${e.u} ${e.m}`.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHead kicker={`Parque instalado · ${sucursal}`} title="Equipos">
        <span className="text-[12.5px] text-mute">Monitoreo vía eas-data.net · puerto 8810</span>
      </PageHead>
      <form method="get" className="panel mb-2.5 grid grid-cols-[minmax(240px,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-[9px] px-3.5 py-[13px] max-[900px]:grid-cols-1">
        <input name="q" className="input" defaultValue={sp.q ?? ""} placeholder="Buscar por serie, tienda o ubicación…" aria-label="Buscar" maxLength={80} />
        <select name="modelo" className="input" defaultValue={modelo} aria-label="Modelo">{["Todos", ...MODELOS].map((o) => <option key={o} value={o}>Modelo: {o}</option>)}</select>
        <select name="conn" className="input" defaultValue={conn} aria-label="Conectividad">{OPT_CONN.map((o) => <option key={o} value={o}>Conectividad: {o}</option>)}</select>
        <button className="btn btn-secondary">Filtrar</button>
      </form>
      <section className="panel overflow-hidden"><div className="overflow-x-auto">
        <table className="table text-[12.5px]">
          <thead><tr><th className="!pl-4">N° de serie</th><th>Modelo</th><th>Tienda</th><th>Ubicación</th><th>Conectividad</th><th>Última señal</th><th>Instalación</th><th>Últ. mantención</th><th>Abiertos</th><th className="!pr-4" /></tr></thead>
          <tbody>
            {eqs.map((e) => (
              <tr key={e.s}>
                <td className="!pl-4 text-ink tabular-nums">{e.s}</td><td className="text-ink-2">{e.m}</td><td className="text-ink-3">{e.tienda}</td><td className="text-mute">{e.u}</td>
                <td><span className="tag" style={e.on ? { background: "#23402f", color: "#a8dcbd" } : { background: "#4d2731", color: "#f2b5b0" }}>{e.on ? "En línea" : "Fuera de línea"}</span></td>
                <td className="text-mute tabular-nums">{e.sig}</td><td className="text-mute-2 tabular-nums">{e.inst}</td><td className="text-mute-2 tabular-nums">{e.mant}</td>
                <td className="text-ink-2 tabular-nums">{e.abiertos}</td>
                <td className="!pr-4 text-right"><Link href={`/tickets/nueva?tienda=${e.tid}&equipo=${e.s}`} className="btn btn-ghost !text-xs">Reportar falla</Link></td>
              </tr>
            ))}
            {!eqs.length && <tr><td colSpan={10} className="!py-8 text-center text-mute-3">Ningún equipo coincide con los filtros.</td></tr>}
          </tbody>
        </table>
      </div></section>
    </>
  );
}
