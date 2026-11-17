import type { Metadata } from "next";
import { SLA_HORAS, USUARIO, USUARIOS_CUENTA } from "@/lib/data";

export const metadata: Metadata = { title: "Configuración" };

const AVISOS: [string, boolean][] = [
  ["Avisarme cuando se asigne un técnico", true],
  ["Avisarme al 75% de la ventana de respuesta", true],
  ["Avisarme cuando un equipo quede fuera de línea", true],
  ["Resumen semanal de incidencias por correo", false],
];

export default function Configuracion() {
  return (
    <>
      <div className="mb-4"><div className="kicker">Cuenta</div><h3 className="page-title">Configuración</h3></div>
      <div className="grid grid-cols-2 items-start gap-3 max-[1100px]:grid-cols-1">
        <section className="panel px-[18px] py-4">
          <h5 className="sec-title mb-3.5">Perfil</h5>
          <div className="grid grid-cols-2 gap-[11px] max-[700px]:grid-cols-1">
            <div className="field"><label htmlFor="p-n">Nombre</label><input id="p-n" className="input" defaultValue={USUARIO.nombre} /></div>
            <div className="field"><label htmlFor="p-c">Cargo</label><input id="p-c" className="input" defaultValue={USUARIO.cargo} /></div>
            <div className="field"><label htmlFor="p-m">Correo</label><input id="p-m" className="input" type="email" defaultValue={USUARIO.correo} /></div>
            <div className="field"><label htmlFor="p-t">Teléfono</label><input id="p-t" className="input" defaultValue={USUARIO.tel} /></div>
          </div>
          <div className="mt-3.5 flex gap-2"><button className="btn btn-primary">Guardar cambios</button><button className="btn btn-ghost">Cambiar contraseña</button></div>
        </section>
        <section className="panel px-[18px] py-4">
          <h5 className="sec-title mb-1.5">Avisos y SLA</h5>
          <p className="mb-[13px] text-[12.5px] text-mute">Ventana comprometida de respuesta: {SLA_HORAS} horas por reporte, con recordatorios a medida que se agota el tiempo.</p>
          <div className="flex flex-col gap-2.5">
            {AVISOS.map(([l, on]) => (
              <label key={l} className="radio"><input type="checkbox" defaultChecked={on} /><span className="dot !rounded" />{l}</label>
            ))}
          </div>
        </section>
        <section className="panel col-span-full overflow-hidden max-[1100px]:col-span-1">
          <div className="flex items-center justify-between px-4 py-3.5"><h5 className="sec-title">Usuarios de la cuenta</h5><button className="btn btn-secondary">Invitar usuario</button></div>
          <div className="overflow-x-auto"><table className="table text-[13px]">
            <thead><tr><th className="!pl-4">Nombre</th><th>Correo</th><th>Perfil</th><th>Tiendas asignadas</th><th className="!pr-4">Último ingreso</th></tr></thead>
            <tbody>
              {USUARIOS_CUENTA.map((u) => (
                <tr key={u.c}>
                  <td className="!pl-4 text-ink">{u.n}</td><td className="text-mute">{u.c}</td>
                  <td><span className={`tag ${u.acento ? "tag-accent" : "tag-neutral"}`}>{u.perfil}</span></td>
                  <td className="text-ink-2">{u.tiendas}</td><td className="!pr-4 text-mute">{u.ult}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </section>
      </div>
    </>
  );
}
