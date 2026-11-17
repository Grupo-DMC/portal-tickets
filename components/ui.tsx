import Link from "next/link";
import { estColor, prioColor } from "@/lib/format";
import { Icon, type IconName } from "./icons";

export const EstadoTag = ({ est, small }: { est: string; small?: boolean }) => {
  const [bg, fg] = estColor(est);
  return <span className="tag" style={{ background: bg, color: fg, fontSize: small ? 10 : undefined }}>{est}</span>;
};

export const PrioDot = ({ prio, label }: { prio: string; label?: string }) => {
  const [fg, dot] = prioColor(prio);
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: fg }}>
      <span className="size-[7px] rounded-full" style={{ background: dot }} />{label ?? prio}
    </span>
  );
};

export const PageHead = ({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div><div className="kicker">{kicker}</div><h3 className="page-title">{title}</h3></div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

export const NuevaBtn = ({ href = "/tickets/nueva" }: { href?: string }) => (
  <Link href={href} className="btn btn-primary"><Icon name="plus" size={15} />Nueva solicitud</Link>
);

const IconBox = ({ name, tone }: { name: IconName; tone: "ok" | "bad" | "neutral" }) => {
  const t = { ok: ["#23402f", "#a8dcbd"], bad: ["#4d2731", "#f2b5b0"], neutral: ["#232532", "#9184d9"] }[tone];
  return <span className="grid size-[46px] place-items-center rounded-[11px]" style={{ background: t[0], color: t[1] }}><Icon name={name} size={tone === "bad" ? 22 : 26} /></span>;
};

export function ErrorState({ titulo, texto, codigo, retry, extra }: { titulo: string; texto: string; codigo: string; retry: string; extra?: React.ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl bg-panel p-10 shadow-[inset_0_0_0_1px_#4d2731]">
      <IconBox name="warning" tone="bad" />
      <h4 className="m-0">{titulo}</h4>
      <p className="m-0 max-w-[520px] text-[13.5px] text-mute">{texto} <span className="text-accent-300">{codigo}</span>.</p>
      <div className="flex gap-2"><Link href={retry} className="btn btn-primary">Reintentar</Link>{extra}</div>
    </div>
  );
}

export function EmptyState({ icon, titulo, texto, cta, href }: { icon: IconName; titulo: string; texto: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-xl bg-panel px-6 py-[72px] text-center shadow-[inset_0_0_0_1px_#262838]">
      <IconBox name={icon} tone="neutral" />
      <h4 className="m-0">{titulo}</h4>
      <p className="m-0 max-w-[430px] text-[13.5px] text-mute">{texto}</p>
      <Link href={href} className="btn btn-primary">{cta}</Link>
    </div>
  );
}

export const Sk = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => <div className={`skeleton rounded ${className}`} style={style} />;
