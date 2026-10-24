"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SITE } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || !isHome || open
          ? "bg-ivory-50/90 backdrop-blur-xl border-b border-gold-500/15 shadow-[0_1px_15px_rgba(201,160,67,0.06)]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className={cn(
              "font-serif text-lg sm:text-xl tracking-[0.15em] transition-colors",
              scrolled || !isHome ? "text-royal-700" : "text-ivory-50"
            )}
          >
            {SITE.couple.bride}{" "}
            <span className="gold-text">&</span>{" "}
            {SITE.couple.groom}
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-sm tracking-[0.1em] uppercase transition-colors py-1",
                    scrolled || !isHome
                      ? "text-royal-700 hover:text-gold-600"
                      : "text-ivory-100/90 hover:text-gold-300",
                    active && "text-gold-500"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                  )}
                </Link>
              );
            })}
            <ButtonLink href="/rsvp" size="md" variant="gold">
              Je serai là
            </ButtonLink>
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className={cn(
              "md:hidden p-2 -mr-2 transition-colors",
              scrolled || !isHome || open
                ? "text-royal-700"
                : "text-ivory-50"
            )}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-ivory-50 border-t border-gold-500/15"
          >
            <nav className="px-5 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "py-3 text-base border-b border-royal-100/60 transition-colors",
                      active
                        ? "text-gold-600 font-medium"
                        : "text-royal-800"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <ButtonLink
                href="/rsvp"
                variant="gold"
                size="lg"
                className="mt-4"
              >
                Je serai là
              </ButtonLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}