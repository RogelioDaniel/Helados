import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helado Nube — Helado artesanal que se derrite despacito",
  description: "Helado artesanal hecho a mano, lento y con nube. Cada bola se derrite despacito, como debe ser. Ordena ahora tu helado cremosito.",
  keywords: ["helado artesanal", "helado mexicano", "Helado Nube", "helado de fresa", "vainilla de Papantla", "pistache", "chocolate oaxaqueño"],
  authors: [{ name: "Helado Nube" }],
  openGraph: {
    title: "Helado Nube — Helado artesanal",
    description: "Helado artesanal hecho a mano, lento y con nube.",
    siteName: "Helado Nube",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
