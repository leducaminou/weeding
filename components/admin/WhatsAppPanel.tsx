"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  Send,
  Smartphone,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";

interface Status {
  adminPhone: string | null;
  isConnected: boolean;
  connectionStatus: string;
  connectedPhone: string | null;
  qr: string | null;
  lastConnectedAt: Date | string | null;
  lastError: string | null;
  workerOnline: boolean;
}

function toLocalPhone(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return digits.startsWith("237") ? digits.slice(3) : digits;
}

export function WhatsAppPanel({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus);
  const [phone, setPhone] = useState(toLocalPhone(initialStatus.adminPhone));
  const [savingPhone, setSavingPhone] = useState(false);
  const [savedPhone, setSavedPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [startingConnection, setStartingConnection] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    message: string;
    ok: boolean;
  } | null>(null);

  async function refresh() {
    setRefreshing(true);
    setStatusError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      if (!res.ok) {
        setStatusError("Impossible de récupérer l’état de la connexion.");
        return;
      }
      const data: Status = await res.json();
      setStatus(data);
    } catch {
      setStatusError("Connexion au serveur impossible. Réessayez.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (
      status.isConnected ||
      (status.connectionStatus !== "CONNECTING" &&
        status.connectionStatus !== "QR_PENDING")
    ) {
      return;
    }
    const id = setInterval(() => {
      void refresh();
    }, 3000);
    return () => clearInterval(id);
  }, [status.isConnected, status.connectionStatus]);

  async function connectWhatsApp() {
    setStartingConnection(true);
    setStatusError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatusError(data.error ?? "Impossible de démarrer WhatsApp.");
        return;
      }
      await refresh();
    } catch {
      setStatusError("Connexion au serveur impossible. Réessayez.");
    } finally {
      setStartingConnection(false);
    }
  }

  async function savePhone() {
    setSavingPhone(true);
    setSavedPhone(false);
    setPhoneError(null);
    try {
      const res = await fetch("/api/admin/whatsapp/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhoneError(data.error ?? "Impossible d’enregistrer ce numéro.");
        return;
      }
      setStatus((current) => ({ ...current, adminPhone: data.phone }));
      setSavedPhone(true);
      window.setTimeout(() => setSavedPhone(false), 2500);
    } catch {
      setPhoneError("Connexion au serveur impossible. Réessayez.");
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
      setTestResult({
        ok: res.ok && data.ok,
        message: data.ok
          ? "Message de test envoyé au numéro administrateur."
          : data.error ?? "Échec de l’envoi. Vérifiez la connexion WhatsApp.",
      });
    } catch {
      setTestResult({
        ok: false,
        message: "Connexion au serveur impossible. Réessayez.",
      });
    } finally {
      setTesting(false);
    }
  }

  const connectionState = status.isConnected
    ? {
        label: "Connecté",
        description: "WhatsApp est prêt à envoyer les notifications.",
        className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
        icon: <CheckCircle2 size={17} />,
      }
    : !status.workerOnline
      ? {
          label: "Service indisponible",
          description: "Le daemon WhatsApp Vercel n’est pas actif.",
          className: "bg-red-50 text-red-800 ring-red-200",
          icon: <AlertTriangle size={17} />,
        }
      : status.qr
      ? {
          label: "À connecter",
          description: "Scannez le QR code pour relier le téléphone.",
          className: "bg-amber-50 text-amber-800 ring-amber-200",
          icon: <QrCode size={17} />,
        }
      : status.connectionStatus === "CONNECTING"
        ? {
            label: "Connexion en cours",
            description: "Le service prépare un QR code.",
            className: "bg-slate-100 text-slate-700 ring-slate-200",
            icon: <Clock3 size={17} />,
          }
      : {
          label: "Non connecté",
          description: "Démarrez la connexion pour générer un QR code.",
          className: "bg-slate-100 text-slate-700 ring-slate-200",
          icon: <Clock3 size={17} />,
        };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <AdminCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <MessageCircle size={21} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Connexion WhatsApp
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${connectionState.className}`}
              >
                {connectionState.icon}
                {connectionState.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {connectionState.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!status.isConnected && (
            <button
              type="button"
              onClick={connectWhatsApp}
              disabled={
                !status.workerOnline ||
                startingConnection ||
                status.connectionStatus === "CONNECTING" ||
                status.connectionStatus === "QR_PENDING"
              }
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {startingConnection || status.connectionStatus === "CONNECTING" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <QrCode size={15} />
              )}
              {status.connectionStatus === "QR_PENDING"
                ? "QR affiché"
                : "Générer le QR"}
            </button>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </AdminCard>

      {statusError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {statusError}
        </div>
      )}

      {!status.workerOnline && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Service WhatsApp arrêté</p>
            <p className="mt-1 text-sm leading-relaxed">
              Le daemon Vercel doit être actif pour générer le QR et envoyer
              les messages. Vérifiez le déploiement du service WhatsApp.
            </p>
          </div>
        </div>
      )}
      {status.lastError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {status.lastError}
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <AdminCard className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Étape 1
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Relier le téléphone du mariage
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Utilisez un téléphone dédié qui restera connecté à WhatsApp.
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[240px_minmax(0,1fr)]">
            <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-4">
              {status.isConnected ? (
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-emerald-800">
                    Téléphone connecté
                  </p>
                  {status.connectedPhone && (
                    <p className="mt-1 text-sm text-slate-600">
                      {status.connectedPhone}
                    </p>
                  )}
                  {status.lastConnectedAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      Connecté depuis{" "}
                      {new Date(status.lastConnectedAt).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
              ) : status.qr ? (
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={status.qr}
                    alt="QR code de connexion WhatsApp"
                    width={208}
                    height={208}
                    className="mx-auto block rounded bg-white"
                  />
                  <p className="mt-2 text-xs font-medium text-amber-800">
                    Ce code expire. Scannez-le maintenant.
                  </p>
                </div>
              ) : status.connectionStatus === "CONNECTING" ? (
                <div className="px-4 text-center">
                  <Loader2
                    size={30}
                    className="mx-auto animate-spin text-slate-400"
                  />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Préparation du QR code
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Le daemon Vercel prépare la connexion.
                  </p>
                </div>
              ) : (
                <div className="px-4 text-center">
                  <QrCode size={30} className="mx-auto text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-700">
                    Aucun QR code actif
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Cliquez sur « Générer le QR » pour démarrer la connexion.
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Comment connecter WhatsApp
              </h3>
              <ol className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    1
                  </span>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Ouvrez <strong>WhatsApp</strong> sur le téléphone à relier.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    2
                  </span>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Allez dans <strong>Appareils connectés</strong>, puis
                    touchez <strong>Connecter un appareil</strong>.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    3
                  </span>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Scannez le QR code affiché ici et attendez le statut
                    « Connecté ».
                  </p>
                </li>
              </ol>
              <div className="mt-5 flex items-start gap-2 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                <Smartphone size={15} className="mt-0.5 shrink-0 text-slate-500" />
                <p>
                  Cette connexion sert à envoyer les QR d’invitation et les
                  notifications. Elle ne modifie pas le WhatsApp personnel de
                  vos invités.
                </p>
              </div>
            </div>
          </div>
        </AdminCard>

        <div className="space-y-5">
          <AdminCard className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Étape 2
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Destinataire des alertes
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Ce numéro reçoit un message lorsqu’un invité confirme sa
              présence.
            </p>

            <div className="mt-5">
              <label
                htmlFor="admin-whatsapp-phone"
                className="text-sm font-medium text-slate-700"
              >
                Numéro WhatsApp de l’administrateur
              </label>
              <div className="mt-2 flex items-center rounded-md border border-slate-200 bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/10">
                <span className="border-r border-slate-200 px-3 text-sm font-medium text-slate-500">
                  +237
                </span>
                <input
                  id="admin-whatsapp-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setSavedPhone(false);
                    setPhoneError(null);
                  }}
                  placeholder="6XX XXX XXX"
                  className="h-11 min-w-0 flex-1 rounded-r-md px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Entrez les 9 chiffres camerounais, sans indicatif. +237 est
                ajouté automatiquement.
              </p>
            </div>

            {phoneError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {phoneError}
              </p>
            )}
            {savedPhone && (
              <p role="status" className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle2 size={15} />
                Numéro enregistré.
              </p>
            )}

            <button
              type="button"
              onClick={savePhone}
              disabled={savingPhone}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPhone && <Loader2 size={15} className="animate-spin" />}
              Enregistrer le numéro
            </button>
          </AdminCard>

          <AdminCard className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vérification
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Tester l’envoi
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Envoyez un message de test au numéro administrateur enregistré.
            </p>
            <button
              type="button"
              onClick={testSend}
              disabled={testing || !status.isConnected || !status.adminPhone}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {testing ? "Envoi en cours..." : "Envoyer un message de test"}
            </button>
            {!status.isConnected && (
              <p className="mt-2 text-xs text-slate-500">
                Connectez d’abord le téléphone WhatsApp à l’étape 1.
              </p>
            )}
            {status.isConnected && !status.adminPhone && (
              <p className="mt-2 text-xs text-slate-500">
                Enregistrez d’abord le numéro administrateur à l’étape 2.
              </p>
            )}
            {testResult && (
              <p
                role="status"
                className={`mt-3 rounded-md p-3 text-sm ${
                  testResult.ok
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {testResult.message}
              </p>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
