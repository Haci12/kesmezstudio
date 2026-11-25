/**
 * @typedef {Object} PackageStep
 * @property {string} title
 * @property {string} text
 */

/**
 * @typedef {Object} StudioPackage
 * @property {string} slug
 * @property {string} name
 * @property {string} subtitle
 * @property {number} priceFrom
 * @property {string} priceNote
 * @property {string} maintenance
 * @property {boolean} highlighted
 * @property {string} [badge]
 * @property {string[]} features
 * @property {string} [includesFrom]
 * @property {PackageStep[]} steps
 * @property {string} audience
 */

/** @type {StudioPackage[]} */
export const packages = [
  {
    slug: "start",
    name: "Start",
    subtitle: "Die Basis für Ihre Praxis",
    priceFrom: 900,
    priceNote: "netto",
    maintenance: "Wartung optional ab 20 €/Monat",
    highlighted: false,
    features: [
       "Leistungen, Vita, Kontakt",
       "Kontakt per Telefon und E-Mail, Anfahrt ohne eingebettete Karte",
       "Impressum und Datenschutz",
      ],
    steps: [
      {
        title: "Erstgespräch",
        text: "Wir klären Ihr Angebot, Ihre Zielgruppe und was auf Ihrer Seite stehen soll. Gemeinsam entscheiden wir, ob Start das richtige Paket für Sie ist.",
      },
            {
        title: "Umsetzung",
        text: "Ich baue Ihre Seite mit Leistungen, Vita und Kontaktmöglichkeiten und zeige Ihnen früh einen Entwurf. Texte und Fotos bringen Sie mit, beim Strukturieren helfe ich Ihnen.",
      },
      {
        title: "Abnahme und Start",
        text: "Sie prüfen die Seite in Ruhe, wir setzen Ihre Änderungen um, und nach Ihrer Freigabe geht sie online. Impressum und Datenschutzerklärung binde ich ein, die Inhalte stimmen wir gemeinsam ab.",
      },
    ],
    audience:
      "Für Praxen, die online erst einmal gut gefunden werden möchten: Einzelpraxen, Neugründungen und alle, die Anfragen bisher nur per Telefon oder E-Mail erhalten.",
    maintenanceInfo: {
      text: "Ihre Seite läuft ohne eigenen Server, deshalb ist laufende Wartung bei Start optional. Wenn Sie möchten, kümmere ich mich um die Pflege Ihrer Seite. Alternativ rechne ich Änderungen bei Bedarf nach Aufwand ab.",
      included: [
        "Kleine Änderungen, zum Beispiel Öffnungszeiten oder Urlaubshinweise",
        "Software-Aktualisierungen der Seite",
        "Hilfe bei Rückfragen",
      ],
      note: "Hosting und Domain zahlen Sie direkt beim Anbieter, Sie bleiben Inhaberin aller Zugänge.",
    },
  },
  {
    slug: "buchung",
    name: "Buchung",
    subtitle: "Plus Online-Buchung",
    priceFrom: 1500,
    priceNote: "netto",
    maintenance: "Wartung empfohlen ab 40 €/Monat",
    highlighted: true,
    badge: "Beliebt",
    includesFrom: "Start",
    features: [
      "Buchung mit freien Zeiten",
      "Bestätigung und Erinnerung per Mail",
      "Absagen und Umbuchen",
    ],
    steps: [
      {
        title: "Erstgespräch und Datenschutz",
        text: "Wir besprechen Ihre Sprechzeiten, Terminarten und Pausen, damit die Buchung zu Ihrem Praxisalltag passt. Außerdem schließen wir die nötigen Verträge zum Datenschutz ab.",
      },
      {
        title: "Umsetzung",
        text: "Ich richte Ihre Webseite und die Online-Buchung ein: freie Zeiten, Bestätigung und Erinnerung per Mail sowie Absagen und Umbuchen. Es werden nur die Daten erfasst, die für den Termin nötig sind.",
      },
      {
        title: "Abnahme und Start",
        text: "Wir testen den kompletten Ablauf gemeinsam aus Sicht Ihrer Patientinnen. Nach Ihrer Freigabe geht die Buchung online, und ich bleibe für Rückfragen erreichbar.",
      },
    ],
        maintenanceInfo: {
      text: "Bei einer Online-Buchung laufen Software und Server, die regelmäßig aktualisiert werden sollten. Deshalb empfehle ich hier ein Wartungspaket.",
      included: [
        "Sicherheits- und Software-Updates",
        "Regelmäßige Datensicherung",
        "Überwachung der Erreichbarkeit",
        "Hilfe bei Fragen und kleine Änderungen",
      ],
      note: "Verzichten Sie auf Wartung, liegen Updates und Sicherheit nach der Übergabe bei Ihnen. Das halten wir schriftlich fest. Hosting und Domain zahlen Sie direkt beim Anbieter.",
    },
    audience:
      "Für Praxen, die Termine online anbieten möchten, damit weniger Zeit für Telefonate und Terminabsprachen verloren geht.",
  },
  {
    slug: "praxis-plus",
    name: "Praxis-Plus",
    subtitle: "Plus Buchungshistorie und Kontakte",
    priceFrom: 3500,
    priceNote: "netto",
    maintenance: "Wartung empfohlen ab 80 €/Monat",
    highlighted: false,
    includesFrom: "Buchung",
    features: [
      "Buchungs- und Kontaktdatenbank",
      "Export",
      "Löschkonzept",
    ],
    steps: [
      {
        title: "Erstgespräch und Konzept",
        text: "Wir klären, wer mit welchen Daten arbeitet, welche Kontakt- und Termininformationen gespeichert werden und wie lange. Daraus entsteht ein Konzept mit Löschfristen.",
      },
      {
        title: "Umsetzung",
        text: "Ich baue Webseite, Buchung und die Datenbank mit Export und richte Zugänge für Ihr Team ein. Wir testen alles zunächst mit Beispieldaten.",
      },
      {
        title: "Abnahme und Übergabe",
        text: "Nach Ihrer Abnahme erhalten Sie eine kurze Einweisung und eine Dokumentation. Danach geht das System live.",
      },
    ],
        maintenanceInfo: {
      text: "Mit Datenbank, Zugängen und Export ist regelmäßige Pflege besonders wichtig. Deshalb empfehle ich hier ausdrücklich ein Wartungspaket.",
      included: [
        "Sicherheits- und Software-Updates",
        "Datensicherung mit regelmäßiger Prüfung der Wiederherstellung",
        "Überwachung der Erreichbarkeit",
        "Pflege der Zugänge und der vereinbarten Löschfristen",
        "Hilfe bei Fragen und kleine Änderungen",
      ],
      note: "Verzichten Sie auf Wartung, liegen Updates und Sicherheit nach der Übergabe bei Ihnen. Das halten wir schriftlich fest. Hosting und Domain zahlen Sie direkt beim Anbieter.",
    },
    audience:
      "Für größere Praxen oder Praxen mit mehreren Behandlerinnen, die Termine und Kontakte an einem Ort verwalten und bei Bedarf exportieren möchten.",
  },
];
export function getPackageBySlug(slug) {
  return packages.find((studioPackage) => studioPackage.slug === slug);
}