"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AdminTopbar({
  adminName,
  adminEmail,
}: {
  adminName: string;
  adminEmail: string;
}) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 pl-16 lg:pl-8">
      <div className="min-w-0">
        <p className="text-sm text-slate-500 truncate">Bienvenue,</p>
        <p className="text-sm font-medium text-slate-900 truncate">
          {adminName}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-xs text-slate-500">
          {adminEmail}
        </span>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
        >
          Voir le site
          <ExternalLink size={12} />
        </Link>
      </div>
    </header>
  );
}