import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s | Admin — Loïca & Franck",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // ⚠️ AUCUN redirect() ici.
  //
  // Le middleware protège déjà toutes les routes /admin/* SAUF /admin/login
  // (grâce au matcher "/admin/((?!login).*)").
  //
  // Si on redirigeait ici quand session est null, on bouclerait sur
  // /admin/login (car ce layout s'applique aussi à /admin/login, et
  // /admin/login n'a évidemment pas de session).
  //
  // Deux cas :
  //   - Pas de session → on rend les enfants sans chrome (c'est /admin/login)
  //   - Session → on rend les enfants avec sidebar/topbar (c'est /admin/*)

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100svh] bg-slate-50 text-slate-900">
      <div className="flex">
        <AdminSidebar adminName={session.name} />
        <div className="flex-1 min-w-0 lg:pl-64">
          <AdminTopbar adminName={session.name} adminEmail={session.email} />
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}