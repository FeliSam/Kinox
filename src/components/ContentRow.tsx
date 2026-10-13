"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play as PlayIcon } from "lucide-react";
import ContentCard from "./ContentCard";

interface ContentRowProps {
  title: string;
  items: any[];
  onOpenDetails: (title: any) => void;
  aspectRatio?: "poster" | "landscape";
  autoScrollConfig?: boolean;
  userAutoScrollPreference?: boolean;
  myListIds?: Set<string>;
  onToggleMyList?: (titleId: string) => Promise<boolean>;
}

export default function ContentRow({
  title,
  items,
  onOpenDetails,
  aspectRatio = "poster",
  autoScrollConfig = false,
  userAutoScrollPreference = false,
  myListIds = new Set(),
  onToggleMyList,
}: ContentRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // États de pause du défilement automatique
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isVisibleOnScreen, setIsVisibleOnScreen] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Défilement automatique actif uniquement si autorisé globalement ET par préférence utilisateur
  const isAutoScrollActive =
    (autoScrollConfig || userAutoScrollPreference) &&
    !reducedMotion &&
    !isHovered &&
    !isFocused &&
    !isTouching &&
    !isInteracting &&
    isVisibleOnScreen &&
    isTabActive;

  // Détection prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Détection de visibilité d'onglet (document.hidden)
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Détection si la rangée est hors de l'écran avec IntersectionObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisibleOnScreen(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Mettre à jour les indicateurs de défilement (flèches et barre)
  const updateScrollIndicators = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
    setScrollProgress(maxScroll > 0 ? (el.scrollLeft / maxScroll) * 100 : 0);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollIndicators, { passive: true });
    updateScrollIndicators();
    return () => el.removeEventListener("scroll", updateScrollIndicators);
  }, [updateScrollIndicators, items]);

  // Boucle de défilement automatique lent (25 pixels/sec) par requestAnimationFrame
  useEffect(() => {
    if (!isAutoScrollActive) return;

    let lastTime: number | null = null;
    let animationFrameId: number;
    const speedPixelsPerSecond = 25; // Défilement lent et cinématographique

    const step = (now: number) => {
      if (!lastTime) lastTime = now;
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const el = containerRef.current;
      if (el) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 2) {
          // Boucle douce au début sans à-coup
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += speedPixelsPerSecond * delta;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoScrollActive]);

  // Commandes de défilement manuel fluide
  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    // Pause temporaire de sécurité de 3 secondes suite à une interaction explicite
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 3000);

    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className="relative my-6 sm:my-8 group select-none"
      aria-label={`Rangée : ${title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={() => setIsTouching(true)}
      onTouchEnd={() => {
        setIsTouching(false);
        setIsInteracting(true);
        setTimeout(() => setIsInteracting(false), 2500);
      }}
    >
      {/* En-tête de la rangée avec indicateur discret de progression */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
            {title}
          </h2>

          {/* Indicateur d'état du défilement automatique */}
          {(autoScrollConfig || userAutoScrollPreference) && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border transition-colors ${
                isAutoScrollActive
                  ? "bg-red-950/40 border-red-600/50 text-red-400"
                  : "bg-gray-800/60 border-gray-700 text-gray-400"
              }`}
              title={
                isAutoScrollActive
                  ? "Défilement automatique actif"
                  : "Défilement en pause (survol, focus ou toucher)"
              }
            >
              {isAutoScrollActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  Auto-scroll
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5 text-gray-400" />
                  En pause
                </>
              )}
            </span>
          )}
        </div>

        {/* Indicateur de défilement horizontal discret */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-200"
              style={{ width: `${Math.max(15, scrollProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bouton Précédent */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-[58%] -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/80 hover:bg-black text-white border border-gray-700/80 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100"
          aria-label={`Faire défiler vers la gauche : ${title}`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Conteneur défilant des cartes */}
      <div
        ref={containerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-8 py-2 focus:outline-none"
        tabIndex={0}
        aria-label={`Contenus de la rangée ${title}`}
      >
        {items.map((item) => (
          <ContentCard
            key={item.id}
            title={item}
            onOpenDetails={onOpenDetails}
            aspectRatio={aspectRatio}
            isInMyList={myListIds.has(item.id)}
            onToggleMyList={onToggleMyList}
          />
        ))}
      </div>

      {/* Bouton Suivant */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-[58%] -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/80 hover:bg-black text-white border border-gray-700/80 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100"
          aria-label={`Faire défiler vers la droite : ${title}`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </section>
  );
}
