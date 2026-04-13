import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "Mapa Series Chile — Mea Culpa & El Dia Menos Pensado",
  description:
    "Explora en un mapa 3D interactivo las ubicaciones reales donde ocurrieron los capitulos de Mea Culpa y El Dia Menos Pensado. Un recorrido de norte a sur por Chile.",
  keywords: [
    "Mea Culpa",
    "El Dia Menos Pensado",
    "series chilenas",
    "mapa interactivo",
    "true crime Chile",
    "scrollytelling",
  ],
  openGraph: {
    title: "Mapa Series Chile",
    description:
      "Recorre Chile en 3D explorando las ubicaciones de Mea Culpa y El Dia Menos Pensado",
    type: "website",
    locale: "es_CL",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
