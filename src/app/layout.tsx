import type { Metadata } from "next";
import { Figtree, Noto_Serif } from "next/font/google";
import "./globals.css";

// Self-hosted webfonts (the delivered design's type pairing). next/font
// preloads and inlines them — no render-blocking Google Fonts request.
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});
const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KC MENA CMS",
  description: "Content management for Kasumigaseki Capital MENA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className={`${figtree.variable} ${notoSerif.variable}`}>{children}</body>
    </html>
  );
}
