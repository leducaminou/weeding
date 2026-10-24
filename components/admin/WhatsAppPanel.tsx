"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";


interface Status {
  adminPhone: string | null;
  isConnected: boolean;
  qr: string | null;
  lastConnectedAt: Date | null;
}

export function WhatsAppPanel({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus);
  const [phone, setPhone] = useState(status.adminPhone ?? "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [savedPhone, setSavedPhone] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      const data = await res.json();
      setStatus(data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (status.isConnected) return;
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [status.isConnected]);

  async function savePhone() {
    setSavingPhone(true);
    setSavedPhone(false);
    try {
      await fetch("/api/admin/whatsapp/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() || null }),
      });
      setSavedPhone(true);
      setTimeout(() => setSavedPhone(false), 2000);
    } finally {
      setSavingPhone(false);
    }
  }

  async function testSend() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/test", { method: "POST" });
      const data = await res.json();
      setTestResult(
        data.ok ? "Message de test envoyé." : data.error ?? "Échec."
      );
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AdminCard className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Connexion Baileys
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Scannez le QR avec WhatsApp sur le téléphone dédié.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="p-2 rounded hover:bg-slate-100 text-slate-500 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {status.isConnected ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-900">Connecté</p>
            {status.lastConnectedAt && (
              <p className="mt-1 text-xs text-slate-500">
                Depuis le{" "}
                {new Date(status.lastConnectedAt).toLocaleString("fr-FR")}
              </p>
            )}
          </div>
        ) : status.qr ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-xs text-slate-500 mb-3">
              Scannez ce QR avec WhatsApp
            </p>
            <div className="p-3 bg-white border border-slate-200 rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={status.qr}
                alt="QR Baileys"
                width={220}
                height={220}
                className="block"
              />
            </div>
            <p className="mt-3 text-xs text-amber-600">
              En attente de connexion...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-8">
            <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <XCircle size={24} />
            </div>
            <p className="mt-4 text-sm text-slate-600">Non connecté</p>
            <p className="mt-1 text-xs text-slate-400">
              Le QR apparaîtra dès que le client Baileys sera initialisé.
            </p>
          </div>
        )}
      </AdminCard>

      <AdminCard className="p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">
          Numéro administrateur
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Ce numéro reçoit une notification à chaque nouvelle confirmation.
        </p>

        <label className="text-xs text-slate-500 uppercase tracking-wide">
          Numéro (avec indicatif)
        </label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <Smartphone
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6 XX XX XX XX"
              className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>
          <button
            onClick={savePhone}
            disabled={savingPhone}
            className="h-10 px-4 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2 shrink-0"
          >
            {savingPhone && <Loader2 size={14} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
        {savedPhone && (
          <p className="mt-2 text-xs text-emerald-600 inline-flex items-center gap-1">
            <CheckCircle2 size={12} />
            Enregistré
          </p>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Test d'envoi
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Envoie un message de test au numéro administrateur.
          </p>
          <button
            onClick={testSend}
            disabled={testing || !status.isConnected || !phone}
            className="h-10 px-4 bg-white border border-slate-200 text-sm rounded-md hover:border-slate-300 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {testing && <Loader2 size={14} className="animate-spin" />}
            Envoyer un message de test
          </button>
          {testResult && (
            <p
              className={`mt-2 text-xs ${
                testResult.includes("envoyé")
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {testResult}
            </p>
          )}
        </div>
      </AdminCard>
    </div>
  );
}