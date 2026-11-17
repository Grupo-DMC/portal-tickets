import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SLA_HORAS } from "@/lib/data";
import { getSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-bg text-ink max-[900px]:grid-cols-1">
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-[linear-gradient(160deg,#1b1d31_0%,#161826_58%,#12141f_100%)] px-[52px] py-11 shadow-[inset_-1px_0_0_#292b31] max-[900px]:hidden">
        <div className="absolute -top-[90px] -right-[120px] size-[420px] rounded-full bg-[radial-gradient(circle,rgba(145,132,217,.18),transparent_68%)]" />
        <div className="relative inline-flex items-center gap-3.5 self-start rounded-[10px] bg-[#f3f5fe] px-[18px] py-3.5">
          <Image src="/dmc-logo.png" alt="Grupo DMC — Ideas Tecnológicas de Seguridad" width={190} height={38} priority style={{ width: "auto", height: 38 }} />
        </div>
        <div className="relative max-w-[470px]">
          <div className="mb-3.5 text-[11px] tracking-[.11em] text-accent uppercase">Plataforma de soporte técnico EAS</div>
          <h2 className="mb-3.5 text-[33px] leading-[1.14]">Cada antena reportada, atendida dentro de la ventana comprometida.</h2>
          <p className="max-w-[420px] text-[15px] text-ink-3 [text-wrap:pretty]">
            Reporta fallas de tus pórticos SD-8088, SD-601, SD-602 y RF4210, sigue la visita del técnico en terreno y revisa el historial completo de cada equipo instalado.
          </p>
          <div className="mt-[26px] flex gap-7">
            {[[`${SLA_HORAS} h`, "Ventana de respuesta"], ["24/7", "Ingreso de solicitudes"], ["98,4%", "Equipos en línea"]].map(([v, l]) => (
              <div key={l}><div className="text-[22px] font-medium">{v}</div><div className="text-[11.5px] text-mute-2">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="relative text-[11.5px] text-mute-3">Grupo DMC · Ideas Tecnológicas de Seguridad · Santiago de Chile</div>
      </section>
      <div className="grid place-items-center p-11">
        <LoginForm />
      </div>
    </div>
  );
}
