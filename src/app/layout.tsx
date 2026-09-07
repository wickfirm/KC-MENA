import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KC MENA CMS",
  description: "Content management for Kasumigaseki Capital MENA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
