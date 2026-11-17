"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { logoutAction, sucursalAction } from "@/lib/actions";
import { Icon } from "./icons";

type Notif = { t: string; d: string; c: string };
type Props = {
  sucursal: string;
  opciones: { n: string; meta: string }[];
  notifs: Notif[];
  user: { nombre: string; iniciales: string; rol: string };
};

export function Topbar({ sucursal, opciones, notifs, user }: Props) {
  const [open, setOpen] = useState<"" | "suc" | "notif" | "user">("");
  const [, start] = useTransition();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const down = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(""); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(""); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, []);

  const toggle = (k: "suc" | "notif" | "user") => setOpen((o) => (o === k ? "" : k));

  return (
    <header ref={ref} className="sticky top-0 z-30 flex items-center gap-3 bg-bg/90 px-[22px] py-[11px] shadow-[inset_0_-1px_0_#262838] backdrop-blur-[6px]">
      <form action="/tickets" method="get" role="search" className="relative max-w-[420px] flex-1">
        <Icon name="search" size={15} className="absolute top-[11px] left-2.5 text-mute-2" />
        <input name="q" className="input !bg-panel pl-8" placeholder="Buscar ticket, tienda, serie o técnico…" aria-label="Buscar" maxLength={80} />
      </form>
      <div className="flex-1" />

      <div className="relative">
        <button type="button" onClick={() => toggle("suc")} className="btn btn-secondary !gap-2" aria-expanded={open === "suc"}>
          <Icon name="store" size={15} />{sucursal}<Icon name="caret" size={13} className="text-mute" />
        </button>
        {open === "suc" && (
          <div className="menu top-[42px] w-[266px]">
            {opciones.map((o) => (
              <button key={o.n} type="button" className="menu-item" onClick={() => { setOpen(""); start(() => sucursalAction(o.n)); }}>
                <span>{o.n}</span><span className="text-[11px] text-mute-2">{o.meta}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button type="button" onClick={() => toggle("notif")} className="btn btn-secondary btn-icon relative" aria-label="Notificaciones" aria-expanded={open === "notif"}>
          <Icon name="bell" size={17} />
          <span className="absolute top-1.5 right-[7px] size-[7px] rounded-full bg-bad shadow-[0_0_0_2px_#161826]" />
        </button>
        {open === "notif" && (
          <div className="menu top-[42px] !w-[340px] overflow-hidden !p-0">
            <div className="px-[13px] py-2.5 text-[11px] tracking-[.09em] text-mute-2 uppercase shadow-[inset_0_-1px_0_#3f424d]">Notificaciones</div>
            {notifs.map((n, i) => (
              <div key={i} className="flex gap-2.5 px-[13px] py-[11px] shadow-[inset_0_-1px_0_#2c2e3b]">
                <span className="mt-1.5 size-1.5 flex-none rounded-full" style={{ background: n.c }} />
                <div className="min-w-0"><div className="text-[13px] leading-snug">{n.t}</div><div className="mt-0.5 text-[11px] text-mute-2">{n.d}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button type="button" onClick={() => toggle("user")} aria-expanded={open === "user"}
          className="flex cursor-pointer items-center gap-[9px] rounded-[9px] border border-line-2 bg-transparent py-1 pr-2 pl-1 text-inherit">
          <span className="grid size-7 flex-none place-items-center rounded-[7px] bg-accent-800 text-xs font-medium text-[#e7e5fe]">{user.iniciales}</span>
          <span className="text-left leading-tight">
            <span className="block text-[12.5px]">{user.nombre}</span>
            <span className="block text-[10.5px] text-mute-2">{user.rol}</span>
          </span>
          <Icon name="caret" size={13} className="text-mute" />
        </button>
        {open === "user" && (
          <div className="menu top-[46px] w-[230px]">
            <Link href="/configuracion" onClick={() => setOpen("")} className="menu-item !text-ink">Mi perfil y notificaciones</Link>
            <Link href="/reportes" onClick={() => setOpen("")} className="menu-item !text-ink">Reportes de mi cuenta</Link>
            <div className="mx-1 my-[5px] h-px bg-line-3" />
            <form action={logoutAction}><button className="menu-item !text-accent-300">Cerrar sesión</button></form>
          </div>
        )}
      </div>
    </header>
  );
}
