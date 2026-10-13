"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Plus, Check, Sliders, Shield, ArrowLeft } from "lucide-react";

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const loadProfiles = () => {
    setLoading(true);
    fetch("/api/v1/profiles")
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data.profiles || []);
        if (data.profiles?.length > 0 && !selectedProfile) {
          setSelectedProfile(data.profiles[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleUpdateProfile = async (updates: any) => {
    if (!selectedProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/profiles/${selectedProfile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedProfile(data.profile);
        setProfiles((prev) =>
          prev.map((p) => (p.id === data.profile.id ? data.profile : p))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      const res = await fetch("/api/v1/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName.trim(),
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        }),
      });
      if (res.ok) {
        setNewProfileName("");
        setShowCreateModal(false);
        loadProfiles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 w-full space-y-8">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-red-600" />
              <span>Gestion des Profils & Préférences</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Personnalisez votre expérience, la restriction d'âge et le comportement de défilement.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 font-bold text-xs sm:text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Profil</span>
          </button>
        </div>

        {/* Liste des Profils */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profiles.map((p) => {
            const isSelected = selectedProfile?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#181B26] border-red-600 shadow-lg shadow-red-600/20 scale-102"
                    : "bg-[#12141C] border-gray-800 hover:border-gray-700 hover:bg-[#151822]"
                }`}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover border border-gray-700"
                />
                <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Classification : {p.maturityRating}
                </span>
                {isSelected && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-wider">
                    <Check className="w-3 h-3" />
                    Sélectionné
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Préférences du Profil Sélectionné */}
        {selectedProfile && (
          <div className="bg-[#12141C] border border-[#232738] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Sliders className="w-5 h-5 text-red-500" />
              <span>Préférences pour {selectedProfile.name}</span>
            </h2>

            <div className="space-y-4 max-w-xl">
              {/* Option Défilement Horizontal Automatique */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#181B26] border border-gray-800">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Défilement horizontal automatique lent
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Fait défiler lentement les rangées d'accueil à l'écran. Se met immédiatement en pause lors du survol, du focus clavier ou du toucher.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProfile.autoScroll}
                  onChange={(e) => handleUpdateProfile({ autoScroll: e.target.checked })}
                  disabled={saving}
                  className="w-5 h-5 accent-red-600 mt-1 cursor-pointer"
                />
              </div>

              {/* Aperçu vidéo muet au survol */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#181B26] border border-gray-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Aperçus vidéo muets au survol</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Lance une courte bande-annonce muette après un temps d'arrêt de 600ms sur la carte ou le Hero.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProfile.autoPlayPreview}
                  onChange={(e) => handleUpdateProfile({ autoPlayPreview: e.target.checked })}
                  disabled={saving}
                  className="w-5 h-5 accent-red-600 mt-1 cursor-pointer"
                />
              </div>

              {/* Enchaînement automatique des épisodes */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#181B26] border border-gray-800">
                <div>
                  <h4 className="text-sm font-bold text-white">Lecture automatique de l'épisode suivant</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Affiche un compte à rebours de 10 secondes avec proposition de lancer l'épisode suivant à la fin.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProfile.autoPlayNext}
                  onChange={(e) => handleUpdateProfile({ autoPlayNext: e.target.checked })}
                  disabled={saving}
                  className="w-5 h-5 accent-red-600 mt-1 cursor-pointer"
                />
              </div>

              {/* Restriction d'âge */}
              <div className="p-4 rounded-xl bg-[#181B26] border border-gray-800 space-y-2">
                <h4 className="text-sm font-bold text-white">Contrôle parental / Classification d'âge</h4>
                <div className="flex gap-2">
                  {["Tous publics", "10+", "12+", "16+", "18+"].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleUpdateProfile({ maturityRating: rating })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        selectedProfile.maturityRating === rating
                          ? "bg-red-600 border-red-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale de création d'un profil */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateProfile}
              className="w-full max-w-sm bg-[#12141C] border border-[#2B3044] rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Nouveau Profil</h3>
              <input
                type="text"
                required
                placeholder="Nom du profil (ex: Marc)"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                autoFocus
                className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-600"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
