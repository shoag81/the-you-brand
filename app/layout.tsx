import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesque, Allura } from "next/font/google";
import "./globals.css";

// Display / headline voice — high-contrast editorial serif.
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body / UI voice — the warm grotesque workhorse.
const hanken = Hanken_Grotesque({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Accent / script voice — decorative only, never body or buttons.
const allura = Allura({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The You Brand — Discover. Define. Become.",
  description:
    "The most magnetic brands aren't created. They're uncovered. A personal branding studio, powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${hanken.variable} ${allura.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}