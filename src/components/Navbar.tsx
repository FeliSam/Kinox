"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, User, Settings, Shield, LogOut, Sliders, Check } from "lucide-react";

interface NavbarProps {
  brandName?: string;
  user?: any;
  activeProfile?: any;
  onProfileChange?: (profile: any) => void;
  autoScrollPreference?: boolean;
  onToggleAutoScroll?: (enabled: boolean) => void;
  currentLang?: "fr-FR" | "en-US";
  onLanguageChange?: (lang: "fr-FR" | "en-US") => void;
}

export default function Navbar({
  brandName = "KINOX",
  user,
  activeProfile,
  onProfileChange,
  autoScrollPreference = false,
  onToggleAutoScroll,
  currentLang = "fr-FR",
  onLanguageChange,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Films", href: "/films" },
    { label: "Séries", href: "/series" },
    { label: "Catégories", href: "/categories" },
    { label: "Ma liste", href: "/my-list" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-[#08090C]/95 backdrop-blur-md border-b border-[#1E2232]/60 shadow-lg shadow-black/40"
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo & Navigation principale */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md p-1"
          >
            <span className="text-2xl sm:text-3xl font-black tracking-wider text-red-600 uppercase drop-shadow-[0_0_12px_rgba(229,9,20,0.6)] group-hover:scale-105 transition-transform duration-200">
              {brandName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    isActive ? "text-white font-semibold border-b-2 border-red-600 pb-1" : "text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sélecteur de Langue FR / EN */}
          {onLanguageChange && (
            <div className="flex items-center bg-[#12141C] border border-[#2B3044] rounded-full p-0.5 text-xs">
              <button
                onClick={() => onLanguageChange("fr-FR")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  currentLang === "fr-FR"
                    ? "bg-red-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Catalogue en Français"
              >
                FR
              </button>
              <button
                onClick={() => onLanguageChange("en-US")}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  currentLang === "en-US"
                    ? "bg-red-600 text-white shadow"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Catalog in English"
              >
                EN
              </button>
            </div>
          )}

          {/* Recherche */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Titres, genres, acteurs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-48 sm:w-64 bg-[#12141C] border border-[#2B3044] text-white text-xs sm:text-sm rounded-full py-1.5 pl-3 pr-8 focus:outline-none focus:border-red-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2.5 text-gray-400 hover:text-white"
                  aria-label="Fermer la recherche"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
                aria-label="Ouvrir la recherche"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Défilement Automatique Toggle Rapide */}
          {onToggleAutoScroll && (
            <button
              onClick={() => onToggleAutoScroll(!autoScrollPreference)}
              title={
                autoScrollPreference
                  ? "Défilement auto actif (cliquez pour désactiver)"
                  : "Activer le défilement horizontal automatique lent"
              }
              aria-label="Basculer le défilement automatique"
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                autoScrollPreference
                  ? "bg-red-950/40 border-red-500 text-red-300"
                  : "bg-[#12141C]/80 border-gray-700 text-gray-400 hover:text-gray-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Auto-scroll</span>
              {autoScrollPreference && <Check className="w-3 h-3 text-red-400" />}
            </button>
          )}

          {/* Profil & Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-red-600 transition-all focus-visible:outline-none"
              aria-expanded={profileMenuOpen}
              aria-label="Menu du profil"
            >
              {activeProfile?.avatar ? (
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name || "Profil"}
                  className="w-8 h-8 rounded-md object-cover border border-gray-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user?.email?.charAt(0).toUpperCase() || "K"}
                </div>
              )}
            </button>

            {/* Menu Déroulant Profil */}
            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-3 w-60 bg-[#12141C] border border-[#2B3044] rounded-lg shadow-2xl py-2 z-50 text-sm animate-fadeIn"
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-gray-800">
                  <p className="font-semibold text-white truncate">{activeProfile?.name || "Invité KINOX"}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || "Mode Découverte"}</p>
                </div>

                {/* Profils disponibles */}
                {user?.profiles && user.profiles.length > 0 && (
                  <div className="py-2 border-b border-gray-800">
                    <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                      Changer de profil
                    </p>
                    {user.profiles.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onProfileChange) onProfileChange(p);
                          setProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-1.5 text-left hover:bg-white/5 transition-colors ${
                          p.id === activeProfile?.id ? "text-red-400 font-medium" : "text-gray-300"
                        }`}
                      >
                        <img src={p.avatar} alt="" className="w-6 h-6 rounded object-cover" />
                        <span className="truncate">{p.name}</span>
                        {p.id === activeProfile?.id && <span className="ml-auto text-xs text-red-500">Actif</span>}
                      </button>
                    ))}
                  </div>
                )}

                <div className="py-1">
                  <Link
                    href="/profiles"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Gérer les profils</span>
                  </Link>

                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-amber-400 hover:bg-white/5"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Back-Office Administration</span>
                    </Link>
                  )}

                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-white/5 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-white bg-red-600/20 hover:bg-red-600/30 text-left font-medium"
                    >
                      <User className="w-4 h-4 text-red-400" />
                      <span>Connexion / Inscription</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Mobile */}
      <div className="md:hidden border-t border-[#1E2232]/80 bg-[#08090C]/90 px-4 py-2 flex items-center justify-around text-xs">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`py-1 ${isActive ? "text-red-500 font-bold" : "text-gray-400"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
