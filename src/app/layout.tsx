import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KINOX — Plateforme de streaming cinématographique",
  description:
    "Découvrez le catalogue KINOX : films exclusifs, séries originales, documentaires en Ultra HD 4K avec défilement fluide et reprise de lecture.",
  keywords: ["streaming", "films", "séries", "KINOX", "cinéma", "vidéo", "4K"],
  openGraph: {
    title: "KINOX — Streaming Haute Fidélité",
    description: "Films et séries en haute résolution avec expérience immersive.",
    type: "website",
    locale: "fr_FR",
    siteName: "KINOX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark bg-[#08090C] text-gray-100">
      <body className="min-h-screen flex flex-col bg-[#08090C] antialiased">
        {children}
      </body>
    </html>
  );
}
