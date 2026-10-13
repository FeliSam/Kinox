import React from "react";
import Link from "next/link";

interface FooterProps {
  brandName?: string;
  links?: { label: string; url: string }[];
}

export default function Footer({
  brandName = "KINOX",
  links = [
    { label: "Centre d'aide", url: "/help" },
    { label: "Conditions d'utilisation", url: "/terms" },
    { label: "Confidentialité & Cookies", url: "/privacy" },
    { label: "Mentions légales", url: "/legal" },
    { label: "Contact", url: "/contact" },
  ],
}: FooterProps) {
  return (
    <footer className="w-full bg-[#050608] border-t border-[#161822] text-gray-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black text-red-600 tracking-wider uppercase">
            {brandName}
          </Link>
          <p className="text-xs text-gray-500">
            Plateforme de streaming cinématographique originale • Défilement fluide & adaptatif
          </p>
        </div>

        {/* Liens du footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {links.map((link, idx) => (
            <Link
              key={idx}
              href={link.url}
              className="hover:text-gray-200 transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mentions de conformité et droits */}
        <div className="pt-6 border-t border-[#161822] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-600">
          <p>© {new Date().getFullYear()} {brandName}. Tous droits réservés.</p>
          <p>
            Médias de démonstration sous licence libre et autorisée (Blender Open Projects Creative Commons).
          </p>
        </div>
      </div>
    </footer>
  );
}
