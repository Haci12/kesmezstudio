import Link from "next/link";
import { packages } from "../lib/packages";

const EMAIL = "info@kesmezstudio.de"; // später durch deine echte Adresse ersetzen
const schritte = [
  {
    titel: "Erstgespräch",
    text: "Wir sprechen kostenlos und unverbindlich über Ihre Praxis, Ihre Wünsche und Ihr Budget. Gemeinsam entscheiden wir, welches Paket zu Ihnen passt, und legen Gestaltung, Inhalte und Aufbau Ihrer Seite fest.",
  },
  {
    titel: "Umsetzung und Abnahme",
    text: "Ich baue Ihre Webseite und zeige Ihnen früh einen Entwurf. Sie geben Rückmeldung, wir feilen nach, und erst wenn Sie zufrieden sind, geht die Seite online.",
  },
  {
    titel: "Betreuung",
    text: "Auch nach dem Start bleibe ich Ihre feste Ansprechperson. Auf Wunsch übernehme ich die laufende Pflege: Aktualisierungen, Datensicherung und kleine Änderungen.",
  },
];
export default function Home() {
  return (
    <>
      <header className="wrap nav">
        <Link href="/" className="logo">
          kesmez<span> studio</span>
          <i>.</i>
        </Link>
        <nav aria-label="Hauptnavigation">
          <Link href="#pakete">Pakete</Link>
          <Link href="#ablauf">Ablauf</Link>
          <Link href="#ueber-mich">Über mich</Link>
          <Link href="/terminbuchung/" className="pill dark">Erstgespräch</Link>
        </nav>
      </header>

      <main>
        <section className="wrap hero">
          <div className="hero-text">
            <p className="eyebrow">Webseiten für Praxen und mehr</p>
            <h1>Technik verstehen. Menschen erreichen.</h1>
            <p className="lead">
              Kesmez Studio baut moderne Webseiten mit Online-Buchung. Schnell, klar gestaltet und mit
              sorgfältigem Umgang mit Daten.
            </p>
            <div className="actions">
              <Link href="/terminbuchung/" className="pill accent">
                Kostenloses Erstgespräch
              </Link>
              <Link href="#pakete" className="pill outline">Pakete ansehen</Link>
            </div>
          </div>

          <div className="booking" aria-label="Informationen zum Erstgespräch">
            <p className="sample">Persönlich &amp; unverbindlich</p>
            <h2>45 Minuten</h2>
            <p className="muted-light">
              Wählen Sie direkt auf der Website eine passende Buchungszeit.
            </p>
            <Link className="booking-cta" href="/terminbuchung/">Termin auswählen</Link>
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
          <div className="cards package-cards">
            {packages.map((studioPackage) => (
              <article
                key={studioPackage.slug}
                className={
                  studioPackage.highlighted
                    ? "card package-card dark"
                    : "card package-card"
                }
              >
                <div className="package-card-heading">
                  <h3>{studioPackage.name}</h3>
                  {studioPackage.badge && (
                    <span className="package-badge">{studioPackage.badge}</span>
                  )}
                </div>
                <p className="card-lead">{studioPackage.subtitle}</p>
                <ul className="package-feature-list">
                  {studioPackage.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <div className="package-card-footer">
                  <p className="preis">
                    ab {studioPackage.priceFrom.toLocaleString("de-DE")} €
                  </p>
                  <p className="package-price-note">{studioPackage.priceNote}</p>
                  <p className="wartung">{studioPackage.maintenance}</p>
                  <Link className="pill accent package-card-cta" href="/terminbuchung/">
                    Erstgespräch buchen
                  </Link>
                  <Link className="package-details-link" href={`/pakete/${studioPackage.slug}/`}>
                    Details ansehen <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
        
        <section id="ablauf" className="wrap section">
          <h2 className="h2">In drei Schritten zu Ihrer Webseite.</h2>
          <ol className="steps">
            {schritte.map((s, i) => (
              <li key={s.titel} className="step">
                <span className="step-nr">{i + 1}</span>
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section id="ueber-mich" className="wrap about">
          <img className="foto" src="/images/hacer.png" alt="Hacer Kesmez" />
          <div>
            <h2 className="h2 small">Hallo, ich bin Hacer.</h2>
            <p className="lead narrow">
               Seit 2019 arbeite ich im Bereich Data Engineering und entwickle technische Lösungen,
  Datenmodelle und digitale Prozesse. Dieses Wissen bringe ich in Ihre Praxis-Webseite
               ein: klar aufgebaut, zuverlässig und mit einer Online-Buchung, die nur die Daten
  verarbeitet, die wirklich nötig sind. Bei mir haben Sie eine feste Ansprechperson. 
              
            </p>
          </div>
        </section>
      </main>

      <footer id="kontakt" className="contact">
        <div className="wrap">
          <h2>Lassen Sie uns sprechen.</h2>
          <Link href="/terminbuchung/" className="pill accent">
            Erstgespräch vereinbaren
          </Link>
          <div className="legal">
            <span>© Kesmez Studio</span>
            <Link href="/impressum/">Impressum</Link>
            <Link href="/datenschutz/">Datenschutz</Link>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
      </footer>
    </>
  );
}
