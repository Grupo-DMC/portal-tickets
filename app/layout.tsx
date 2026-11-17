import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Soporte EAS · Grupo DMC", template: "%s · Soporte EAS" },
  description: "Plataforma de soporte técnico EAS de Grupo DMC: reporta fallas, sigue la visita del técnico y revisa el historial de tus equipos.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
