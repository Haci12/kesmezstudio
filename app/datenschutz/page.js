import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung | Kesmez Studio",
  description: "[TODO: Datenschutzerklärung ergänzen]",
};

export default function PrivacyPage() {
  return (
    <>
      <header className="wrap nav">
        <Link href="/" className="logo">
          kesmez<span> studio</span>
          <i>.</i>
        </Link>
        <nav aria-label="Hauptnavigation">
          <Link href="/#pakete">Pakete</Link>
          <Link href="/terminbuchung/">Erstgespräch</Link>
        </nav>
      </header>
      <main className="doc">
        <h1>Datenschutzerklärung</h1>
        <p>[TODO: Datenschutzerklärung ergänzen]</p>
      </main>
    </>
  );
}
