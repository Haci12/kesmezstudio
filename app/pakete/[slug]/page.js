import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackageBySlug, packages } from "../../../lib/packages";

export function generateStaticParams() {
  return packages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const studioPackage = getPackageBySlug(slug);

  if (!studioPackage) return {};

  return {
    title: `Paket ${studioPackage.name} | Kesmez Studio`,
    description: `${studioPackage.subtitle}. Paket ${studioPackage.name} von Kesmez Studio ab ${studioPackage.priceFrom.toLocaleString("de-DE")} € ${studioPackage.priceNote}.`,
  };
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  const studioPackage = getPackageBySlug(slug);

  if (!studioPackage) notFound();

  return (
    <>
      <header className="wrap nav">
        <Link href="/" className="logo">
          kesmez<span> studio</span>
          <i>.</i>
        </Link>
        <nav aria-label="Hauptnavigation">
          <Link href="/#pakete">Pakete</Link>
          <Link href="/#ueber-mich">Über mich</Link>
          <Link href="/terminbuchung/" className="pill dark">
            Erstgespräch
          </Link>
        </nav>
      </header>

      <main className="package-detail-page wrap">
        <nav className="package-breadcrumb" aria-label="Brotkrumennavigation">
          <Link href="/#pakete">Pakete</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{studioPackage.name}</span>
        </nav>

        <header className="package-detail-heading">
          <p className="eyebrow">Paket {studioPackage.name}</p>
          <h1>{studioPackage.name}</h1>
          <p className="lead">{studioPackage.subtitle}</p>
        </header>

        <div className="package-detail-layout">
          <aside className="package-price-panel" aria-label={`Preis für ${studioPackage.name}`}>
            <p className="package-price-kicker">Einmalig</p>
            <p className="package-price">
              <span>ab </span>
              {studioPackage.priceFrom.toLocaleString("de-DE")} €
            </p>
            <p className="package-price-note">
              {studioPackage.priceNote} · {studioPackage.maintenance}
            </p>
            <Link className="pill accent package-price-cta" href="/terminbuchung/">
              Erstgespräch buchen
            </Link>
            <Link className="package-compare-link" href="/#pakete">
              Alle Pakete vergleichen
            </Link>
          </aside>

          <div className="package-detail-main">
            <nav className="package-tabs" aria-label="Pakete">
              {packages.map((item) => (
                <Link
                  key={item.slug}
                  href={`/pakete/${item.slug}/`}
                  className={item.slug === slug ? "package-tab active" : "package-tab"}
                  aria-current={item.slug === slug ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="package-detail-cards">
              <section className="package-info-card">
                <h2>Das ist enthalten</h2>
                {studioPackage.includesFrom && (
                  <p className="package-includes-note">
                    Alles aus dem Paket {studioPackage.includesFrom}
                  </p>
                )}
                <ul className="package-feature-list">
                  {studioPackage.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </section>

              <section className="package-info-card">
                <h2>So läuft es ab</h2>
                <ol className="package-steps">
                  {studioPackage.steps.map((step, index) => (
                    <li key={`${step.title}-${index}`}>
                      <span className="package-step-number" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div>
                        <h3>{step.title}</h3>
                        <p>{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
<section className="package-info-card">
  <h2>Wartung</h2>
  <p>{studioPackage.maintenanceInfo.text}</p>
  <ul className="package-feature-list">
    {studioPackage.maintenanceInfo.included.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
  <p className="maintenance-note">{studioPackage.maintenanceInfo.note}</p>
</section>
              <section className="package-info-card">
                <h2>Für wen passt das?</h2>
                <p>{studioPackage.audience}</p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
