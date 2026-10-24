import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/config/constants";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  console.log("[MW]", { pathname, hasToken: !!token });

  // Sécurité : si pas de token, rediriger vers /admin/login
  // (ce code ne s'exécute JAMAIS sur /admin/login grâce au matcher ci-dessous)
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    console.log("[MW] → REDIRECT", url.toString());
    return NextResponse.redirect(url);
  }

  console.log("[MW] → PASS");
  return NextResponse.next();
}

export const config = {
  /**
   * Matcher avec negative lookahead : protège toutes les routes /admin/*
   * SAUF /admin/login et ses sous-routes.
   *
   * Conséquence : le middleware ne s'exécute JAMAIS sur /admin/login
   * → impossible de boucler, quel que soit le contenu du middleware.
   */
  matcher: ["/admin/((?!login).*)"],
};