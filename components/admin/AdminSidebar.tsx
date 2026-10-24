"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BedDouble,
  Gift,
  Image as ImageIcon,
  MessageCircle,
  FileText,
  Menu,
  X,
  LogOut,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/invites", label: "Invités", icon: Users },
  { href: "/admin/events", label: "Programme", icon: Calendar },
  { href: "/admin/accommodations", label: "Hébergements", icon: BedDouble },
  { href: "/admin/wishlist", label: "Wishlist", icon: Gift },
  { href: "/admin/gallery", label: "Galerie", icon: ImageIcon },
  { href: "/admin/content", label: "Contenu", icon: FileText },
  { href: "/admin/settings/whatsapp", label: "WhatsApp", icon: MessageCircle },
] as const;

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const content = (
    <>
      <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
        <Heart size={18} className="text-amber-400" />
        <span className="font-semibold text-white text-sm tracking-wide">
          Loïca & Franck
        </span>
      </div>
      <nav className="flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-slate-400">Connecté en tant que</p>
          <p className="text-sm text-white font-medium truncate">{adminName}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-slate-900 z-40">
        {content}
      </aside>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 h-10 w-10 rounded-md bg-slate-900 text-white flex items-center justify-center shadow-lg"
        aria-label="Ouvrir le menu"
      >
        <Menu size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 flex flex-col"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}