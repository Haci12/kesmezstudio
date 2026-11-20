const EMAIL = "info@kesmezstudio.de"; // später durch deine echte Adresse ersetzen

const pakete = [
  {
    name: "Start",
    lead: "Webseiten für Praxen",
    punkte: ["Leistungen, Vita, Kontakt", "Anmeldeformular für Erstanfragen", "Impressum und Datenschutz"],
    preis: "ab 900 €",
    wartung: "Wartung ab 20 € im Monat",
  },
  {
    name: "Termin",
    lead: "Plus Online-Terminbuchung",
    punkte: ["Buchung mit freien Zeiten", "Bestätigung und Erinnerung per Mail", "Absagen und Umbuchen"],
    preis: "ab 1.500 €",
    wartung: "Wartung ab 40 € im Monat",
    dark: true,
  },
  {
    name: "Praxis-Plus",
    lead: "Plus Terminhistorie und Kontakte",
    punkte: ["Termin- und Kontaktdatenbank", "Export", "Löschkonzept"],
    preis: "ab 3.500 €",
    wartung: "Wartung ab 80 € im Monat",
  },
];

export default function Home() {
  return (
    <>
      <header className="wrap nav">
        <a href="#" className="logo">
          kesmez<span> studio</span>
          <i>.</i>
        </a>
        <nav aria-label="Hauptnavigation">
          <a href="#pakete">Pakete</a>
          <a href="#ueber-mich">Über mich</a>
          <a href="#kontakt" className="pill dark">Erstgespräch</a>
        </nav>
      </header>

      <main>
        <section className="wrap hero">
          <div className="hero-text">
            <p className="eyebrow">Webseiten für Praxen und mehr</p>
            <h1>Technik verstehen. Menschen erreichen.</h1>
            <p className="lead">
              Kesmez Studio baut moderne Webseiten mit Terminbuchung. Schnell, klar gestaltet und mit
              sorgfältigem Umgang mit Daten.
            </p>
            <div className="actions">
              <a href="#kontakt" className="pill accent">Kostenloses Erstgespräch</a>
              <a href="#pakete" className="pill outline">Pakete ansehen</a>
            </div>
          </div>

          <div className="booking" aria-label="Beispielansicht einer Terminbuchung">
            <p className="sample">Beispielansicht</p>
            <h2>Termin buchen</h2>
            <p className="muted-light">Erstgespräch, 50 Minuten</p>
            <div className="days">
              <span>Mo 12</span>
              <span className="on">Di 13</span>
              <span>Mi 14</span>
            </div>
            <div className="slots">
              <span>09:00</span>
              <span className="sel">10:30</span>
              <span>14:00</span>
              <span>15:30</span>
            </div>
            <span className="confirm">Termin bestätigen</span>
          </div>
        </section>

        <section className="band" aria-label="Zielgruppe">
          <div className="wrap">
            <span>Gebaut für Praxen.</span>
            <span>Offen für jedes Projekt.</span>
          </div>
        </section>

        <section id="pakete" className="wrap section">
          <h2 className="h2">Drei Pakete. Ein Prinzip.</h2>
          <p className="lead narrow">
            Jedes Paket baut auf dem vorherigen auf. Sie starten klein und wachsen, wenn Ihre Praxis es
            braucht.
          </p>
          <div className="cards">
            {pakete.map((p) => (
              <article key={p.name} className={p.dark ? "card dark" : "card"}>
                <h3>{p.name}</h3>
                <p className="card-lead">{p.lead}</p>
                <ul>
                  {p.punkte.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="preis">{p.preis}</p>
                <p className="wartung">{p.wartung}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="ueber-mich" className="wrap about">
          <img className="foto" src="/images/hacer.jpeg" alt="Hacer Kesmez" />
          <div>
            <h2 className="h2 small">Hallo, ich bin Hacer.</h2>
            <p className="lead narrow">
               Seit 2019 arbeite ich im Bereich Data Engineering und entwickle technische Lösungen,
  Datenmodelle und digitale Prozesse. Dieses Wissen bringe ich in Ihre Praxis-Webseite
  ein: klar aufgebaut, zuverlässig und mit einer Terminbuchung, die nur die Daten
  verarbeitet, die wirklich nötig sind. Bei mir haben Sie eine feste Ansprechperson. 
              
            </p>
          </div>
        </section>
      </main>

      <footer id="kontakt" className="contact">
        <div className="wrap">
          <h2>Lassen Sie uns sprechen.</h2>
          <a href={`mailto:${EMAIL}`} className="pill accent">Erstgespräch vereinbaren</a>
          <div className="legal">
            <span>© Kesmez Studio</span>
            <a href="/impressum/">Impressum</a>
            <a href="/datenschutz/">Datenschutz</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
      </footer>
    </>
  );
}