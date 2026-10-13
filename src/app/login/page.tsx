"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Sparkles, User, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = isRegister ? "/api/v1/auth/register" : "/api/v1/auth/login";
    const body = isRegister ? { email, password, name } : { email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Échec de l'authentification.");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  // Remplissage rapide des comptes de test autorisés
  const fillCredentials = (userEmail: string, userPass: string) => {
    setIsRegister(false);
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#08090C] flex flex-col justify-between text-white relative overflow-hidden">
      {/* Fond Décoratif Sombre KINOX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-[#08090C] to-[#08090C] -z-10" />

      {/* En-tête avec Logo KINOX */}
      <header className="max-w-7xl mx-auto px-6 py-8 w-full flex items-center justify-between">
        <Link href="/" className="text-3xl font-black text-red-600 tracking-wider uppercase">
          KINOX
        </Link>
      </header>

      {/* Formulaire Central */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12141C] border border-[#232738] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white">
              {isRegister ? "Créer un compte KINOX" : "Bienvenue sur KINOX"}
            </h1>
            <p className="text-xs text-gray-400">
              {isRegister
                ? "Rejoignez l'expérience de streaming cinématographique"
                : "Connectez-vous pour reprendre vos films et séries"}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Nom du profil</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex"
                    className="w-full bg-[#181B26] border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 font-bold text-sm rounded-lg shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
            >
              <span>{loading ? "Chargement..." : isRegister ? "S'inscrire" : "Se connecter"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Raccourcis de connexion pour test rapide */}
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500 text-center">
              Comptes de test de démonstration
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials("demo@kinox.tv", "Kinox2026!")}
                className="p-2 rounded-lg bg-[#181B26] border border-gray-800 hover:border-red-600/50 hover:bg-[#202434] transition-all text-left"
              >
                <span className="font-bold text-white block">Spectateur Démo</span>
                <span className="text-[10px] text-gray-400">demo@kinox.tv</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("admin@kinox.tv", "Kinox2026!")}
                className="p-2 rounded-lg bg-[#181B26] border border-gray-800 hover:border-amber-500/50 hover:bg-[#202434] transition-all text-left"
              >
                <span className="font-bold text-amber-400 block flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
                <span className="text-[10px] text-gray-400">admin@kinox.tv</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400">
            {isRegister ? (
              <p>
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-red-500 hover:underline font-bold"
                >
                  Se connecter
                </button>
              </p>
            ) : (
              <p>
                Nouveau sur KINOX ?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-red-500 hover:underline font-bold"
                >
                  Créer un compte
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} KINOX Streaming. Sécurisé avec sessions chiffrées.
      </footer>
    </div>
  );
}
