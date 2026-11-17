import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { abierto } from "@/lib/format";
import { listarEquipos, listarTickets, listarTiendas } from "@/lib/repo";

export const metadata: Metadata = { title: "Tiendas" };

export default function Tiendas() {
  const tickets = listarTickets();
  const eqs = listarEquipos();
  const filas = listarTiendas().map((t) => {
    const tks = tickets.filter((x) => x.ti === t.id), ab = tks.filter(abierto).length;
    const ult = [...tks].sort((a, b) => a.hrs - b.hrs)[0];
    const off = t.eq.filter((e) => !e.on).length;
    return { t, ab, ult, off };
  });
  return (
    <>
      <PageHead kicker="Red de locales" title="Tiendas">
        <span className="text-[12.5px] text-mute">{eqs.length} antenas instaladas · {eqs.filter((e) => !e.on).length} fuera de línea</span>
      </PageHead>
      <section className="panel overflow-hidden"><div className="overflow-x-auto">
        <table className="table min-w-[1010px] text-[13px]">
          <thead><tr><th className="!pl-4">Tienda</th><th>Dirección</th><th>Comuna</th><th>Antenas</th><th>Conectividad</th><th>Tickets abiertos</th><th>Último incidente</th><th className="!pr-4" /></tr></thead>
          <tbody>
            {filas.map(({ t, ab, ult, off }) => (
              <tr key={t.id}>
                <td className="!pl-4 whitespace-nowrap"><Link href={`/tiendas/${t.id}`} className="text-ink">{t.n}</Link></td>
                <td className="whitespace-nowrap text-mute">{t.dir}</td>
                <td className="whitespace-nowrap text-ink-3">{t.com}</td>
                <td className="tabular-nums text-ink-2">{t.eq.length}</td>
                <td><span className="tag" style={off ? { background: "#4d2731", color: "#f2b5b0" } : { background: "#23402f", color: "#a8dcbd" }}>{off ? `${off} fuera de línea` : "Todo en línea"}</span></td>
                <td className="tabular-nums" style={{ color: ab ? "#efcd97" : "#75798c" }}>{ab}</td>
                <td className="whitespace-nowrap text-mute">{ult ? ult.tipo : "Sin incidentes"} · {ult ? ult.cre : "—"}</td>
                <td className="!pr-4 text-right"><Link href={`/tiendas/${t.id}`} className="text-[12.5px] whitespace-nowrap">Ver ficha →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></section>
    </>
  );
}
