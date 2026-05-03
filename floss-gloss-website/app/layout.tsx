import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteName = "Floss & Gloss Dentistry";
const description =
  "Trusted Mississauga dentist near Streetsville — family, cosmetic, and restorative care in a calm, consult-first setting. Queen St S.";

export const metadata: Metadata = {
  title: `Dentist in Mississauga, ON | ${siteName}`,
  description,
  keywords: [
    "Mississauga dentist",
    "Streetsville dentist",
    "family dentistry Mississauga",
    "cosmetic dentist",
    "Queen Street South dental",
  ],
  openGraph: {
    title: `${siteName} | Mississauga`,
    description,
    locale: "en_CA",
    type: "website",
  },
  robots: "index, follow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${sans.variable}`}>
      <body
        className={`min-h-screen bg-paper text-ink antialiased ${sans.className}`}
        style={{
          minHeight: "100vh",
          margin: 0,
          background: "#f7f5f2",
          color: "#0d1a1f",
        }}
      >
        <div className="site-page">{children}</div>
      </body>
    </html>
  );
}
