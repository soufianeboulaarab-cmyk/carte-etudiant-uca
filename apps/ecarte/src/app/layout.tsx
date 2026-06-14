import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Carte UCA",
  description: "Carte étudiante numérique UCA",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#102447",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
