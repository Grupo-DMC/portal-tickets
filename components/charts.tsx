import { CREADOS, MESES, RESUELTOS, SEMANAS, SLA_HORAS, TIPOS_FALLA } from "@/lib/data";

const GRID = "#292b31", AXIS = "#5b5f70";

export function ChartBarras() {
  const W = 560, H = 200, L = 32, R = 8, T = 8, B = 24, pw = W - L - R, ph = H - T - B, max = 32, slot = pw / 12, bw = Math.min(11, slot / 2 - 3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block" role="img" aria-label="Tickets creados contra resueltos, últimos 12 meses">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = T + ph - (ph * i) / 4;
        return <g key={i}><line x1={L} x2={W - R} y1={y} y2={y} stroke={GRID} /><text x={L - 7} y={y + 3.5} textAnchor="end" fill={AXIS} fontSize={9.5}>{Math.round((max * i) / 4)}</text></g>;
      })}
      {MESES.map((m, i) => {
        const x = L + slot * i + slot / 2, hc = (ph * CREADOS[i]) / max, hr = (ph * RESUELTOS[i]) / max;
        return (
          <g key={m}>
            <rect x={x - bw - 1.5} y={T + ph - hc} width={bw} height={hc} rx={2} fill="#595d6c" />
            <rect x={x + 1.5} y={T + ph - hr} width={bw} height={hr} rx={2} fill="#9184d9" />
            <text x={x} y={H - 7} textAnchor="middle" fill={AXIS} fontSize={9.5}>{m}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ChartDona() {
  const C = 2 * Math.PI * 60, tot = TIPOS_FALLA.reduce((a, b) => a + b[1], 0);
  let acc = 0;
  return (
    <svg viewBox="0 0 160 160" width={160} height={160} className="flex-none" role="img" aria-label="Distribución por tipo de falla">
      <circle cx={80} cy={80} r={60} fill="none" stroke="#232532" strokeWidth={19} />
      {TIPOS_FALLA.map((s) => {
        const len = (C * s[1]) / tot, off = acc;
        acc += len;
        return <circle key={s[0]} cx={80} cy={80} r={60} fill="none" stroke={s[2]} strokeWidth={19} strokeDasharray={`${len - 2} ${C - len + 2}`} strokeDashoffset={-off} transform="rotate(-90 80 80)" />;
      })}
      <text x={80} y={76} textAnchor="middle" fill="#e9e9ed" fontSize={23} fontWeight={500}>{tot}</text>
      <text x={80} y={93} textAnchor="middle" fill={AXIS} fontSize={9} letterSpacing=".08em">FALLAS 12 M</text>
    </svg>
  );
}

export function ChartLinea() {
  const W = 560, H = 200, L = 32, R = 8, T = 10, B = 24, pw = W - L - R, ph = H - T - B, max = 72;
  const pts = SEMANAS.map((v, i) => [L + (pw * i) / (SEMANAS.length - 1), T + ph - (ph * v) / max]);
  const ys = T + ph - (ph * SLA_HORAS) / max;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="block" role="img" aria-label="Tiempo promedio de resolución semanal contra el SLA">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = T + ph - (ph * i) / 4;
        return <g key={i}><line x1={L} x2={W - R} y1={y} y2={y} stroke={GRID} /><text x={L - 7} y={y + 3.5} textAnchor="end" fill={AXIS} fontSize={9.5}>{Math.round((max * i) / 4)}h</text></g>;
      })}
      <line x1={L} x2={W - R} y1={ys} y2={ys} stroke="#e0645e" strokeWidth={1.4} strokeDasharray="5 4" />
      <text x={W - R} y={ys - 5} textAnchor="end" fill="#e0645e" fontSize={9.5}>SLA {SLA_HORAS} h</text>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#9184d9" strokeWidth={2} strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill="#161826" stroke="#9184d9" strokeWidth={1.5} />)}
      {SEMANAS.map((_, i) => i % 2 === 0 && <text key={i} x={pts[i][0]} y={H - 7} textAnchor="middle" fill={AXIS} fontSize={9.5}>S{i + 1}</text>)}
    </svg>
  );
}
