import BookingWidget from "../BookingWidget";

export const metadata = {
  title: "Erstgespräch anfragen | Kesmez Studio",
  description: "Wählen Sie direkt auf der Webseite ein unverbindliches Erstgespräch.",
};

export default function BookingRequestPage() {
  return (
    <>
      <header className="wrap nav">
        <a href="/" className="logo">
          kesmez<span> studio</span>
          <i>.</i>
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="/#pakete">Pakete</a>
        </nav>
      </header>

      <main>
        <BookingWidget />
      </main>
    </>
  );
}
