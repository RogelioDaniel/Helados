import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Helado artesanal a domicilio en CDMX | Helado Nube",
  description:
    "Helado artesanal mexicano en lotes pequeños. Elige sabores de origen y confirma entrega refrigerada en CDMX por WhatsApp.",
  applicationName: "Helado Nube",
  keywords: [
    "helado artesanal CDMX",
    "helado a domicilio CDMX",
    "helado mexicano",
    "vainilla de Papantla",
    "pistache",
    "chocolate oaxaqueño",
  ],
  authors: [{ name: "Helado Nube" }],
  creator: "Helado Nube",
  alternates: { canonical: "/" },
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  openGraph: {
    title: "Helado Nube | El lujo está en hacerlo despacio",
    description: "Helado artesanal mexicano, batido en lotes pequeños y entregado con cadena de frío cuidada.",
    siteName: "Helado Nube",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "/img/og-helado-nube.jpg",
        width: 1200,
        height: 630,
        alt: "Selección editorial de helado artesanal Helado Nube",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helado Nube | Helado artesanal en CDMX",
    description: "Sabores de origen, lotes pequeños y entrega refrigerada.",
    images: ["/img/og-helado-nube.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${fraunces.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
