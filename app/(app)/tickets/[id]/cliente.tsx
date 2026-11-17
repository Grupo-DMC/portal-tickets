"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { comentarAction, estadoAction, valorarAction, type AccionTicket } from "@/lib/actions";
import { ESTADOS } from "@/lib/data";

export function Comentarios({ id }: { id: string }) {
  const aviso = useToast();
  const [r, action, pending] = useActionState<AccionTicket | null, FormData>(comentarAction.bind(null, id), null);
  const form = useRef<HTMLFormElement>(null);
  const [nArch, setNArch] = useState(0);
  useEffect(() => { if (r) { aviso(r.aviso); if (r.ok) setNArch(0); } }, [r, aviso]);
  return (
    <form ref={form} action={action}>
      <div className="field">
        <label htmlFor="texto">Agregar comentario</label>
        <textarea id="texto" name="texto" className="input !min-h-[82px]" maxLength={2000} placeholder="Escribe una actualización para el equipo de soporte…" />
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">{pending ? "Publicando…" : "Publicar comentario"}</button>
        <label className="btn btn-secondary cursor-pointer">
          <Icon name="paperclip" size={14} />Adjuntar evidencia{nArch > 0 && ` (${nArch})`}
          <input type="file" name="adjuntos" multiple accept="image/jpeg,image/png,video/mp4" className="hidden" onChange={(e) => setNArch(e.target.files?.length ?? 0)} />
        </label>
        <span className="ml-auto text-[11.5px] text-mute-3">Las respuestas de soporte llegan también a tu correo.</span>
      </div>
    </form>
  );
}

export function EstadoSelect({ id, actual }: { id: string; actual: string }) {
  const aviso = useToast();
  const [pending, start] = useTransition();
  return (
    <div className="field mb-3">
      <label htmlFor="estado">Cambiar estado del ticket</label>
      <select id="estado" className="input" value={actual} disabled={pending} onChange={(e) => start(async () => aviso((await estadoAction(id, e.target.value)).aviso))}>
        {ESTADOS.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function Valoracion({ id, inicial }: { id: string; inicial: number }) {
  const aviso = useToast();
  const [n, setN] = useState(inicial);
  const [, start] = useTransition();
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-[5px]" role="radiogroup" aria-label="Valoración">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={n === i} aria-label={`${i} de 5`} className="cursor-pointer border-0 bg-transparent p-0.5 leading-none"
            onClick={() => { setN(i); start(async () => aviso((await valorarAction(id, i)).aviso)); }}>
            <Icon name={n >= i ? "starFill" : "star"} size={23} style={{ color: n >= i ? "#d99b45" : "#75798c" }} />
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-secondary ml-auto" onClick={() => start(async () => aviso((await estadoAction(id, "Nuevo")).aviso))}>Reabrir ticket</button>
    </div>
  );
}
