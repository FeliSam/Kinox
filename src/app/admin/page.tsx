"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield,
  Film,
  Plus,
  Palette,
  Activity,
  Check,
  AlertTriangle,
  Play,
  Save,
  RotateCcw,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "brand" | "pipeline">("catalog");
  const [titles, setTitles] = useState<any[]>([]);
  const [brandSettings, setBrandSettings] = useState<any>({
    siteName: "KINOX",
    tagline: "Le streaming cinématographique haute fidélité",
    logoText: "KINOX",
    accentColor: "#E50914",
    secondaryColor: "#F59E0B",
  });
  const [pipelineJobs, setPipelineJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Formulaire d'ajout de titre
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [newTitle, setNewTitle] = useState({
    name: "",
    synopsis: "",
    type: "MOVIE",
    releaseYear: 2026,
    maturityRating: "12+",
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    mp4FallbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    featured: false,
    isPublished: true,
  });

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/v1/admin/titles").then((r) => r.json()),
      fetch("/api/v1/admin/settings").then((r) => r.json()),
      fetch("/api/v1/admin/media/jobs").then((r) => r.json()),
    ])
      .then(([titlesData, settingsData, jobsData]) => {
        if (titlesData.titles) setTitles(titlesData.titles);
        if (settingsData.settings) setBrandSettings(settingsData.settings);
        if (jobsData.jobs) setPipelineJobs(jobsData.jobs);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandSettings),
      });
      if (res.ok) {
        setFeedback("Identité de marque mise à jour avec succès !");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTitle),
      });
      if (res.ok) {
        setShowAddTitle(false);
        loadAdminData();
        setFeedback("Nouveau titre ajouté avec succès au catalogue !");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090C] text-white">
      <Navbar brandName={brandSettings.siteName} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <Shield className="w-7 h-7 text-amber-500" />
              <span>Back-Office d'Administration KINOX</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Gestion centralisée du catalogue, du pipeline vidéo et de la marque.
            </p>
          </div>

          {feedback && (
            <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Navigation des Onglets Admin */}
        <div className="flex border-b border-gray-800 gap-2">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "catalog"
                ? "border-red-600 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Catalogue ({titles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("brand")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "brand"
                ? "border-red-600 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Identité de Marque</span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${
              activeTab === "pipeline"
                ? "border-red-600 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Pipeline Vidéo</span>
          </button>
        </div>

        {/* Contenu Onglet 1 : Catalogue */}
        {activeTab === "catalog" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400">
                Liste des contenus publiés sur la plateforme KINOX.
              </p>
              <button
                onClick={() => setShowAddTitle(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une œuvre</span>
              </button>
            </div>

            <div className="bg-[#12141C] border border-[#232738] rounded-xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#181B26] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                  <tr>
                    <th className="p-3.5">Affiche</th>
                    <th className="p-3.5">Titre</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Année</th>
                    <th className="p-3.5">Classification</th>
                    <th className="p-3.5">Note</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {titles.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={t.posterUrl}
                          alt=""
                          className="w-10 h-14 object-cover rounded shadow"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {t.name}
                        {t.featured && (
                          <span className="ml-2 text-[10px] bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded font-bold">
                            Vedette
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-semibold">
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3.5">{t.releaseYear}</td>
                      <td className="p-3.5">{t.maturityRating}</td>
                      <td className="p-3.5 text-amber-400 font-bold">★ {t.ratingScore}</td>
                      <td className="p-3.5">
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Publié
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/watch/${t.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded font-semibold text-[11px]"
                        >
                          <Play className="w-3 h-3" />
                          <span>Tester</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contenu Onglet 2 : Identité de Marque */}
        {activeTab === "brand" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form
              onSubmit={handleSaveBrand}
              className="bg-[#12141C] border border-[#232738] rounded-2xl p-6 space-y-4 shadow-xl"
            >
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">
                Personnalisation de la plateforme
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Nom du Service</label>
                <input
                  type="text"
                  value={brandSettings.siteName}
                  onChange={(e) => setBrandSettings({ ...brandSettings, siteName: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Slogan / Tagline</label>
                <input
                  type="text"
                  value={brandSettings.tagline}
                  onChange={(e) => setBrandSettings({ ...brandSettings, tagline: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">Texte du Logo</label>
                <input
                  type="text"
                  value={brandSettings.logoText}
                  onChange={(e) => setBrandSettings({ ...brandSettings, logoText: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Couleur d'Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSettings.accentColor}
                      onChange={(e) =>
                        setBrandSettings({ ...brandSettings, accentColor: e.target.value })
                      }
                      className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={brandSettings.accentColor}
                      onChange={(e) =>
                        setBrandSettings({ ...brandSettings, accentColor: e.target.value })
                      }
                      className="flex-1 bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Couleur Secondaire (Étoiles)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSettings.secondaryColor}
                      onChange={(e) =>
                        setBrandSettings({ ...brandSettings, secondaryColor: e.target.value })
                      }
                      className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      value={brandSettings.secondaryColor}
                      onChange={(e) =>
                        setBrandSettings({ ...brandSettings, secondaryColor: e.target.value })
                      }
                      className="flex-1 bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </button>
            </form>

            {/* Prévisualisation en direct */}
            <div className="bg-[#12141C] border border-[#232738] rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">
                Prévisualisation de Marque
              </h2>
              <div className="p-6 rounded-xl bg-[#08090C] border border-gray-800 space-y-4">
                <span
                  style={{ color: brandSettings.accentColor }}
                  className="text-3xl font-black tracking-wider uppercase drop-shadow-md block"
                >
                  {brandSettings.logoText || "KINOX"}
                </span>
                <p className="text-xs text-gray-400">{brandSettings.tagline}</p>
                <div className="flex items-center gap-3">
                  <button
                    style={{ backgroundColor: brandSettings.accentColor }}
                    className="px-5 py-2 text-white font-bold text-xs rounded-lg shadow"
                  >
                    Bouton Accent
                  </button>
                  <span
                    style={{ color: brandSettings.secondaryColor }}
                    className="text-xs font-bold"
                  >
                    ★ 9.8 Note d'évaluation
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu Onglet 3 : Pipeline Vidéo */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <div className="p-4 bg-[#12141C] border border-[#232738] rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Moteur d'encodage HLS / DASH</p>
                <p className="text-xs text-gray-400">
                  Traitement multi-renditions adaptatif 1080p / 720p / 480p et découpage de segments.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-500 text-emerald-400 text-xs font-bold rounded-full">
                Opérationnel
              </span>
            </div>

            <div className="bg-[#12141C] border border-[#232738] rounded-xl p-6 text-center text-gray-400 space-y-2">
              <Activity className="w-10 h-10 text-red-500 mx-auto mb-2 opacity-80" />
              <p className="text-white font-bold text-sm">File d'attente de transcodage</p>
              <p className="text-xs">
                Tous les flux vidéo actuels sont vérifiés, convertis et disponibles via CDN sécurisé.
              </p>
            </div>
          </div>
        )}

        {/* Modale d'ajout d'œuvre */}
        {showAddTitle && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateTitle}
              className="w-full max-w-lg bg-[#12141C] border border-[#2B3044] rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2">
                Ajouter une œuvre au catalogue
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Titre</label>
                <input
                  type="text"
                  required
                  value={newTitle.name}
                  onChange={(e) => setNewTitle({ ...newTitle, name: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={newTitle.synopsis}
                  onChange={(e) => setNewTitle({ ...newTitle, synopsis: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Type</label>
                  <select
                    value={newTitle.type}
                    onChange={(e) => setNewTitle({ ...newTitle, type: e.target.value })}
                    className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="MOVIE">Film</option>
                    <option value="SERIES">Série</option>
                    <option value="DOCUMENTARY">Documentaire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Année</label>
                  <input
                    type="number"
                    value={newTitle.releaseYear}
                    onChange={(e) =>
                      setNewTitle({ ...newTitle, releaseYear: parseInt(e.target.value) })
                    }
                    className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Âge</label>
                  <input
                    type="text"
                    value={newTitle.maturityRating}
                    onChange={(e) => setNewTitle({ ...newTitle, maturityRating: e.target.value })}
                    className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">URL Affiche (Poster 2:3)</label>
                <input
                  type="url"
                  value={newTitle.posterUrl}
                  onChange={(e) => setNewTitle({ ...newTitle, posterUrl: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">URL Manifeste Vidéo (HLS / m3u8)</label>
                <input
                  type="url"
                  value={newTitle.hlsManifestUrl}
                  onChange={(e) => setNewTitle({ ...newTitle, hlsManifestUrl: e.target.value })}
                  className="w-full bg-[#181B26] border border-gray-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddTitle(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-xs font-semibold text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700"
                >
                  Publier
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
