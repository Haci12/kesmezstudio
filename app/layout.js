import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// next/font lädt die Schriften beim Build und liefert sie von deiner eigenen Domain aus.
// Besucherinnen verbinden sich dadurch nicht mit Google-Servern.
const head = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-head" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export const metadata = {
  title: "Kesmez Studio – Webseiten für Praxen",
  description:
    "Kesmez Studio baut moderne Webseiten mit Online-Buchung für Praxen. Schnell, klar gestaltet und mit sorgfältigem Umgang mit Daten.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className={`${head.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
