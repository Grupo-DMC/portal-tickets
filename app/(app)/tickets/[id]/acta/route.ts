import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { SLA_HORAS } from "@/lib/data";
import { slaInfo } from "@/lib/format";
import { comentariosDe, lineaTiempoDe, ticketPorId } from "@/lib/repo";
import { IdTicketSchema } from "@/lib/schemas";
import { getSession } from "@/lib/session";

/* Acta / ficha del ticket en PDF (pdf-lib). */
function envolver(txt: string, font: PDFFont, size: number, ancho: number) {
  const out: string[] = [];
  for (const parr of txt.split("\n")) {
    let linea = "";
    for (const w of parr.split(" ")) {
      const prueba = linea ? `${linea} ${w}` : w;
      if (font.widthOfTextAtSize(prueba, size) > ancho && linea) { out.push(linea); linea = w; } else linea = prueba;
    }
    out.push(linea);
  }
  return out;
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) return new NextResponse("No autorizado", { status: 401 });
  const id = IdTicketSchema.safeParse((await ctx.params).id);
  const t = id.success ? ticketPorId(id.data) : null;
  if (!t) return new NextResponse("Ticket no encontrado", { status: 404 });

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595, M = 44, ANCHO = W - M * 2;
  let page: PDFPage = pdf.addPage([W, 842]), y = 800;
  const nueva = () => { page = pdf.addPage([W, 842]); y = 800; };
  const asegura = (h: number) => { if (y - h < 50) nueva(); };
  const texto = (s: string, o: { size?: number; f?: PDFFont; color?: [number, number, number]; x?: number } = {}) => {
    const size = o.size ?? 10, f = o.f ?? font;
    for (const l of envolver(s, f, size, ANCHO - ((o.x ?? M) - M))) { asegura(size + 4); page.drawText(l, { x: o.x ?? M, y, size, font: f, color: rgb(...(o.color ?? [0.1, 0.1, 0.14])) }); y -= size + 4; }
  };
  const seccion = (s: string) => { y -= 8; asegura(30); page.drawRectangle({ x: M, y: y - 4, width: ANCHO, height: 18, color: rgb(0.93, 0.92, 0.98) }); page.drawText(s, { x: M + 6, y, size: 10.5, font: bold, color: rgb(0.26, 0.23, 0.42) }); y -= 22; };

  try {
    const logo = await pdf.embedPng(await readFile(path.join(process.cwd(), "public", "dmc-logo.png")));
    const d = logo.scale(28 / logo.height);
    page.drawImage(logo, { x: M, y: y - 8, width: d.width, height: d.height });
  } catch { page.drawText("GRUPO DMC", { x: M, y, size: 14, font: bold }); }
  page.drawText("Acta de atención · Soporte técnico EAS", { x: W - M - 230, y: y + 4, size: 10, font, color: rgb(0.45, 0.47, 0.55) });
  y -= 44;
  texto(`Ticket ${t.id}`, { size: 20, f: bold });
  texto(`${t.tipo} · ${t.tiendaN}`, { size: 11, color: [0.35, 0.37, 0.45] });

  const s = slaInfo(t);
  seccion("Resumen");
  for (const [k, v] of [["Estado", t.est], ["Prioridad", t.prio], ["Creado", t.cre], ["Última actualización", t.act], ["Técnico", t.tec], ["SLA", `${s.txt} (ventana de ${SLA_HORAS} h)`]]) {
    asegura(14); page.drawText(k, { x: M, y, size: 9.5, font, color: rgb(0.45, 0.47, 0.55) }); page.drawText(v, { x: M + 130, y, size: 9.5, font: bold }); y -= 14;
  }
  seccion("Tienda");
  texto(`${t.tienda.n} — ${t.tienda.dir}, ${t.tienda.com}`);
  texto(`Contacto: ${t.tienda.cont} (${t.tienda.cargo}) · ${t.tienda.tel} · ${t.tienda.hor}`, { color: [0.35, 0.37, 0.45] });
  seccion("Equipo");
  texto(`${t.modelo} · N° de serie ${t.eq}`);
  if (t.equipo) texto(`Ubicación: ${t.equipo.u} · Instalación ${t.equipo.inst} · Última mantención ${t.equipo.mant}`, { color: [0.35, 0.37, 0.45] });
  seccion("Descripción de la falla");
  texto(t.desc);
  seccion("Línea de tiempo");
  for (const e of lineaTiempoDe(t)) { texto(`• ${e.t}`, { f: bold, size: 9.5 }); texto(`${e.a} · ${e.d}`, { size: 8.5, color: [0.45, 0.47, 0.55], x: M + 10 }); }
  seccion("Conversación con soporte");
  for (const c of comentariosDe(t)) { texto(`${c.a} (${c.r}) · ${c.d}`, { f: bold, size: 9 }); texto(c.x, { size: 9.5, x: M + 10 }); y -= 4; }
  seccion("Conformidad");
  y -= 24;
  asegura(40);
  page.drawLine({ start: { x: M, y }, end: { x: M + 200, y }, thickness: 0.6, color: rgb(0.5, 0.5, 0.55) });
  page.drawLine({ start: { x: W - M - 200, y }, end: { x: W - M, y }, thickness: 0.6, color: rgb(0.5, 0.5, 0.55) });
  y -= 12;
  page.drawText("Técnico DMC", { x: M, y, size: 8.5, font, color: rgb(0.45, 0.47, 0.55) });
  page.drawText("Encargado del local", { x: W - M - 200, y, size: 8.5, font, color: rgb(0.45, 0.47, 0.55) });

  return new NextResponse(Buffer.from(await pdf.save()), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="acta-${t.id}.pdf"`, "Cache-Control": "no-store" } });
}
