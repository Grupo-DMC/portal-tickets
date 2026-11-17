import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AHORA } from "@/lib/data";
import { filtrarTickets, parseFiltros } from "@/lib/filtros";
import { listarTickets } from "@/lib/repo";
import { getSession, getSucursal } from "@/lib/session";

/* Exporta el listado filtrado: CSV (abre en Excel) o PDF. Valida sesión y
   sanea celdas para evitar inyección de fórmulas en planillas. */
const celda = (v: string | number) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await getSession())) return new NextResponse("No autorizado", { status: 401 });
  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const ids = (sp.ids ?? "").split(",").filter((x) => /^TKT-\d{4}-\d{4}$/.test(x));
  const sucursal = await getSucursal();
  let filas = filtrarTickets(listarTickets(), parseFiltros(sp), sucursal);
  if (ids.length) filas = filas.filter((t) => ids.includes(t.id));

  if (sp.formato === "pdf") {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([842, 595]), y = 540;
    const head = (p: typeof page) => {
      p.drawText("Grupo DMC · Soporte EAS", { x: 40, y: 560, size: 9, font, color: rgb(0.45, 0.47, 0.55) });
      p.drawText(`Reporte de tickets · ${filas.length} registros · ${AHORA}`, { x: 40, y: 544, size: 13, font: bold });
    };
    head(page); y = 516;
    const cols: [string, number, (t: (typeof filas)[number]) => string][] = [
      ["N° ticket", 40, (t) => t.id], ["Tienda", 130, (t) => t.tiendaN], ["Tipo de falla", 290, (t) => t.tipo], ["Prioridad", 410, (t) => t.prio],
      ["Estado", 470, (t) => t.est], ["Creación", 570, (t) => t.cre], ["Técnico", 670, (t) => t.tec],
    ];
    const fila = (cells: string[], f: typeof font) => cols.forEach((c, i) => page.drawText(cells[i].slice(0, 28), { x: c[1], y, size: 8.5, font: f }));
    fila(cols.map((c) => c[0]), bold); y -= 16;
    for (const t of filas) {
      if (y < 40) { page = pdf.addPage([842, 595]); head(page); y = 516; }
      fila(cols.map((c) => c[2](t)), font); y -= 14;
    }
    return new NextResponse(Buffer.from(await pdf.save()), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="tickets-dmc.pdf"', "Cache-Control": "no-store" } });
  }

  const cab = ["N° ticket", "Tienda", "Equipo", "Serie", "Tipo de falla", "Prioridad", "Estado", "Creación", "Antigüedad", "Últ. actualización", "Técnico"];
  const body = filas.map((t) => [t.id, t.tiendaN, `${t.modelo} · ${t.ubic}`, t.eq, t.tipo, t.prio, t.est, t.cre, t.antig, t.act, t.tec].map(celda).join(";"));
  const csv = "﻿" + [cab.map(celda).join(";"), ...body].join("\r\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="tickets-dmc.csv"', "Cache-Control": "no-store" } });
}
