import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteName = "Floss & Gloss Dentistry";
const description =
  "Family-friendly dentist in Mississauga near Streetsville — preventive care, cosmetic options, and a calm, consult-first experience. Queen St S location.";

export const metadata: Metadata = {
  title: `${siteName} | Mississauga Dentist`,
  description,
  keywords: [
    "Mississauga dentist",
    "Streetsville dentist",
    "family dentistry Mississauga",
    "cosmetic dentist",
    "Queen Street South dental",
  ],
  openGraph: {
    title: siteName,
    description,
    locale: "en_CA",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
