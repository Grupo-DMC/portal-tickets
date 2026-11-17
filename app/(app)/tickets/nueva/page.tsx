import type { Metadata } from "next";
import { SLA_HORAS, TIENDAS } from "@/lib/data";
import { NuevaForm } from "./nueva-form";

export const metadata: Metadata = { title: "Nueva solicitud" };

export default async function Nueva({ searchParams }: { searchParams: Promise<{ tienda?: string; equipo?: string }> }) {
  const { tienda: tid, equipo } = await searchParams;
  const t = TIENDAS.find((x) => x.id === tid);
  const inicial = t && t.eq.some((e) => e.s === equipo) ? { tienda: t.n, equipo: equipo! } : t ? { tienda: t.n, equipo: t.eq[0].s } : undefined;
  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><div className="kicker">Nueva solicitud de soporte</div><h3 className="page-title">Reportar una falla de antena EAS</h3></div>
        <span className="text-xs text-mute-2">Ventana de respuesta comprometida: {SLA_HORAS} horas</span>
      </div>
      <NuevaForm tiendas={TIENDAS} sla={SLA_HORAS} inicial={inicial} />
    </>
  );
}
