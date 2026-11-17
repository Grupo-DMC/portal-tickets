"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "./icons";

const NAV: { href: string; label: string; icon: IconName; match: (p: string) => boolean; badge?: true }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "gauge", match: (p) => p === "/dashboard" },
  { href: "/tickets", label: "Tickets", icon: "ticket", match: (p) => p === "/tickets" || (p.startsWith("/tickets/") && !p.startsWith("/tickets/nueva")), badge: true },
  { href: "/tickets/nueva", label: "Nueva solicitud", icon: "plus", match: (p) => p.startsWith("/tickets/nueva") },
  { href: "/tiendas", label: "Tiendas", icon: "store", match: (p) => p.startsWith("/tiendas") },
  { href: "/equipos", label: "Equipos", icon: "broadcast", match: (p) => p === "/equipos" },
  { href: "/reportes", label: "Reportes", icon: "chart", match: (p) => p === "/reportes" },
  { href: "/configuracion", label: "Configuración", icon: "gear", match: (p) => p === "/configuracion" },
];

const VISTAS = [["datos", "Datos"], ["cargando", "Cargando"], ["vacio", "Vacío"], ["error", "Error"]] as const;

export function Sidebar({ nAbiertos, nVencidos, sla }: { nAbiertos: number; nVencidos: number; sla: number }) {
  const path = usePathname();
  const sp = useSearchParams();
  const vista = sp.get("vista") ?? "datos";
  const conVista = path === "/dashboard" || path === "/tickets";
  const hrefVista = (v: string) => {
    const q = new URLSearchParams(sp.toString());
    if (v === "datos") q.delete("vista"); else q.set("vista", v);
    q.delete("page");
    const s = q.toString();
    return s ? `${path}?${s}` : path;
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[228px] flex-none flex-col gap-3.5 bg-side px-3 py-4 shadow-[inset_-1px_0_0_#292b31] max-[900px]:hidden">
      <div className="flex items-center gap-2.5 px-1.5 pt-0.5 pb-2.5">
        <Image src="/dmc-logo.png" alt="Grupo DMC" width={96} height={24} priority style={{ width: "auto", height: 24 }} className="opacity-[.92] [filter:brightness(0)_invert(1)]" />
        <span className="border-l border-line-3 pl-[9px] text-[10px] leading-tight tracking-[.1em] text-mute-2 uppercase">Soporte<br />EAS</span>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Principal">
        {NAV.map((n) => {
          const act = n.match(path);
          return (
            <Link key={n.href} href={n.href} className="nav-item" aria-current={act ? "page" : undefined}>
              <Icon name={n.icon} size={18} className="relative flex-none" />
              <span className="relative">{n.label}</span>
              {n.badge && <span className="relative ml-auto rounded-md bg-line-2 px-[7px] py-px text-[11px] text-ink-3">{nAbiertos}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2">
        <div className="rounded-lg bg-panel-2 px-[11px] py-2.5 shadow-[inset_0_0_0_1px_#292b31]">
          <div className="mb-1.5 text-[10px] tracking-[.09em] text-mute-2 uppercase">SLA de respuesta</div>
          <div className="flex items-baseline gap-1.5"><span className="text-[22px] font-medium">{sla}</span><span className="text-xs text-mute">horas por reporte</span></div>
          <div className="mt-1 text-[11px] text-mute-2">{nVencidos} ticket(s) fuera de ventana</div>
        </div>
        {conVista && (
          <div className="rounded-lg px-[11px] py-[9px] shadow-[inset_0_0_0_1px_#292b31]">
            <div className="mb-[7px] text-[10px] tracking-[.09em] text-mute-2 uppercase">Estados de demo</div>
            <div className="flex flex-wrap gap-1">
              {VISTAS.map(([v, l]) => (
                <Link key={v} href={hrefVista(v)} aria-current={vista === v ? "true" : undefined}
                  className={`rounded-md border px-2 py-[3px] text-[11px] ${vista === v ? "border-accent text-accent-300" : "border-line-2 text-ink-3"}`}>{l}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
