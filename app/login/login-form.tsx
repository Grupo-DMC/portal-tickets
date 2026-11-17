"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="w-full max-w-[372px]" noValidate>
      <h3 className="mb-1.5 text-[25px]">Ingresar a la plataforma</h3>
      <p className="mb-6 text-[13.5px] text-mute">Usa las credenciales entregadas por tu ejecutivo de cuenta.</p>

      {state.error && (
        <div role="alert" className="mb-4 flex gap-[9px] rounded-[9px] bg-[#2c1e24] px-[13px] py-[11px] shadow-[inset_0_0_0_1px_#6b3540]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f2b5b0" strokeWidth="1.7" strokeLinecap="round" className="mt-px flex-none" aria-hidden>
            <circle cx="12" cy="12" r="8.8" /><path d="M12 7.8v5.4" /><circle cx="12" cy="16.4" r=".9" fill="#f2b5b0" stroke="none" />
          </svg>
          <div className="text-[12.5px] leading-[1.45] text-[#f2b5b0]">{state.error}</div>
        </div>
      )}

      <div className="field mb-3.5">
        <label htmlFor="mail">Correo corporativo</label>
        <input id="mail" name="mail" type="email" autoComplete="username" required maxLength={120} className="input !min-h-10" placeholder="nombre@empresa.cl" defaultValue="m.ortiz@falabella.cl" />
      </div>
      <div className="field mb-3.5">
        <label htmlFor="pass">Contraseña</label>
        <input id="pass" name="pass" type="password" autoComplete="current-password" required maxLength={128} className="input !min-h-10" placeholder="••••••••" />
      </div>
      <div className="mb-[22px] flex items-center justify-between gap-3">
        <label className="radio !text-[13px] text-ink-2">
          <input type="checkbox" name="recordar" defaultChecked />
          <span className="dot !rounded" />
          Recordarme en este equipo
        </label>
        <a href="#recuperar" className="text-[13px]">¿Olvidaste tu contraseña?</a>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary btn-block !mt-0 !min-h-[42px]">{pending ? "Ingresando…" : "Ingresar"}</button>
      <div className="mt-[18px] border-t border-line pt-4 text-xs leading-[1.6] text-mute-3">
        Credenciales de demostración: <span className="text-ink-3">m.ortiz@falabella.cl</span> / <span className="text-ink-3">dmc2026</span>. Cualquier otra combinación muestra el estado de error.
      </div>
    </form>
  );
}
