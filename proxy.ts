import { NextResponse, type NextRequest } from "next/server";
import { decode, SESSION_COOKIE } from "@/lib/session";

/* Primera barrera: sin sesión firmada no se entra a la plataforma.
   El layout (app) vuelve a verificar (defensa en capas). */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login") return NextResponse.next();
  if (decode(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|dmc-logo.png).*)"] };
