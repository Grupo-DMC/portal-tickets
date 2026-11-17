import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/toast";
import { Topbar } from "@/components/topbar";
import { NOTIFICACIONES, SLA_HORAS, TIENDAS, USUARIO } from "@/lib/data";
import { abierto } from "@/lib/format";
import { listarTickets } from "@/lib/repo";
import { getSession, getSucursal } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSession())) redirect("/login");
  const sucursal = await getSucursal();
  const tickets = listarTickets();
  const abiertos = tickets.filter(abierto);
  const opciones = [
    { n: "Todas las tiendas", meta: `${TIENDAS.length} locales` },
    ...TIENDAS.map((t) => ({ n: t.n, meta: `${abiertos.filter((x) => x.tiendaN === t.n).length} abiertos` })),
  ];

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg text-ink">
        <Suspense fallback={<div className="w-[228px] bg-side max-[900px]:hidden" />}>
          <Sidebar nAbiertos={abiertos.length} nVencidos={abiertos.filter((t) => t.hrs > SLA_HORAS).length} sla={SLA_HORAS} />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar sucursal={sucursal} opciones={opciones} notifs={NOTIFICACIONES} user={{ nombre: USUARIO.nombre, iniciales: USUARIO.iniciales, rol: USUARIO.rol }} />
          <main className="min-w-0 flex-1 px-[22px] pt-[22px] pb-10">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
