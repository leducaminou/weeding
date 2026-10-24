"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { AdminCard } from "./AdminCard";

interface Item {
  key: string;
  label: string;
  hint: string;
  multiline: boolean;
  value: string;
}

export function ContentManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [values, setValues] = useState(
    Object.fromEntries(items.map((i) => [i.key, i.value]))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(key: string) {
    setBusy(key);
    setSaved(null);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: values[key] }),
      });
      setSaved(key);
      router.refresh();
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setBusy(null);
    }
  }

  const inputCls =
    "mt-1 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400";

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <AdminCard key={item.key} className="p-5">
          <label className="text-xs text-slate-500 uppercase tracking-wide">
            {item.label}
          </label>
          <p className="text-xs text-slate-400 mt-0.5">{item.hint}</p>
          {item.multiline ? (
            <textarea
              value={values[item.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [item.key]: e.target.value }))
              }
              rows={5}
              className={inputCls}
            />
          ) : (
            <input
              value={values[item.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [item.key]: e.target.value }))
              }
              className={inputCls}
            />
          )}
          <div className="flex items-center justify-end gap-3 mt-3">
            {saved === item.key && (
              <span className="text-xs text-emerald-600 inline-flex items-center gap-1">
                <CheckCircle2 size={12} />
                Enregistré
              </span>
            )}
            <button
              onClick={() => save(item.key)}
              disabled={busy === item.key}
              className="h-9 px-4 bg-slate-900 text-white text-xs rounded-md hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {busy === item.key && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Enregistrer
            </button>
          </div>
        </AdminCard>
      ))}
    </div>
  );
}