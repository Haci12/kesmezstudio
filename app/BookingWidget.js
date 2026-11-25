"use client";

import { useEffect, useState } from "react";

const TIME_ZONE = "Europe/Paris";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getCalendarDays(monthKey) {
  if (!monthKey) return [];

  const [year, month] = monthKey.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const emptyCells = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return [
    ...Array(emptyCells).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return `${year}-${String(month).padStart(2, "0")}-${day}`;
    }),
  ];
}

function formatDate(dateKey, options) {
  return new Intl.DateTimeFormat("de-DE", {
    ...options,
    timeZone: TIME_ZONE,
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

export default function BookingWidget() {
  const [todayKey, setTodayKey] = useState("");
  const [monthKey, setMonthKey] = useState("");
  const [availability, setAvailability] = useState({});
  const [availabilityStatus, setAvailabilityStatus] = useState("loading");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("");

  useEffect(() => {
    const today = getDateKey(new Date());
    setTodayKey(today);
    setMonthKey(today.slice(0, 7));

    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    setAvailabilityStatus("loading");

    try {
      const response = await fetch("/api/book.php?action=availability", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const result = await response.json();

      if (!response.ok || !result.availability) {
        throw new Error(result.message || "Verfügbarkeiten konnten nicht geladen werden.");
      }

      setAvailability(result.availability);
      setAvailabilityStatus("ready");
    } catch {
      setAvailabilityStatus("error");
    }
  }

  const currentMonthKey = todayKey.slice(0, 7);
  const lastAvailableDate = todayKey
    ? new Date(`${todayKey}T12:00:00Z`)
    : null;
  if (lastAvailableDate) {
    lastAvailableDate.setUTCDate(lastAvailableDate.getUTCDate() + 30);
  }
  const lastAvailableKey = lastAvailableDate ? getDateKey(lastAvailableDate) : "";
  const lastMonthKey = lastAvailableKey.slice(0, 7);
  const calendarDays = getCalendarDays(monthKey);
  const nextAvailableDate = calendarDays.find(
    (date) =>
      date &&
      todayKey &&
      date >= todayKey &&
      date <= lastAvailableKey &&
      (availability[date] || []).length > 0,
  );
  const times = selectedDate ? availability[selectedDate] || [] : [];
  const nextAvailableLabel = nextAvailableDate
    ? formatDate(nextAvailableDate, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  function moveMonth(offset) {
    if (!monthKey) return;

    const [year, month] = monthKey.split("-").map(Number);
    const nextMonth = new Date(Date.UTC(year, month - 1 + offset, 1));
    const nextMonthKey = `${nextMonth.getUTCFullYear()}-${String(
      nextMonth.getUTCMonth() + 1,
    ).padStart(2, "0")}`;

    if (nextMonthKey < currentMonthKey || nextMonthKey > lastMonthKey) return;

    setMonthKey(nextMonthKey);
    setSelectedDate("");
    setSelectedTime("");
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSubmissionStatus("pending");
    setSubmissionMessage("Buchung wird geprüft und in den Kalender eingetragen …");

    if (!selectedDate || !selectedTime || !privacyAccepted) {
      setSubmissionStatus("error");
      setSubmissionMessage("Bitte wählen Sie Tag und Uhrzeit aus und bestätigen Sie die Datenschutzerklärung.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);

    try {
      const response = await fetch("/api/book.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          date: selectedDate,
          time: selectedTime,
          privacyAccepted,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Die Buchung konnte nicht gespeichert werden.");
      }

      setSubmissionStatus("success");
      setSubmissionMessage(result.message || "Ihre Buchungsanfrage wurde gesendet.");
      setSelectedTime("");
      setPrivacyAccepted(false);
      form.reset();
      await fetchAvailability();
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionMessage(error.message || "Die Buchung konnte nicht gespeichert werden.");
    } finally {
      setSubmitting(false);
    }
  }

  const monthLabel = monthKey
    ? formatDate(`${monthKey}-01`, { month: "long", year: "numeric" })
    : "Kalender lädt …";

  return (
    <section id="buchung" className="booking-section wrap">
      <div className="booking-intro">
        <p className="eyebrow">Kostenlos und unverbindlich kennenlernen</p>
        <h1 className="h2">Lassen Sie uns sprechen.</h1>
        <p className="lead narrow">
          Wählen Sie eine passende Zeit für ein 45-minütiges Erstgespräch.
        </p>
      </div>

      <div className="booking-widget">
        <div className="booking-step calendar-step">
          <h3>1. Tag auswählen</h3>

          <div className="calendar-header">
            <button
              className="calendar-nav-button"
              type="button"
              aria-label="Vorheriger Monat"
              disabled={!monthKey || monthKey <= currentMonthKey}
              onClick={() => moveMonth(-1)}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <h4 className="calendar-month-label" aria-live="polite">
              {monthLabel}
            </h4>
            <button
              className="calendar-nav-button"
              type="button"
              aria-label="Nächster Monat"
              disabled={!monthKey || monthKey >= lastMonthKey}
              onClick={() => moveMonth(1)}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>

          <div className="calendar-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div
            className="calendar-grid"
            role="group"
            aria-label={`Tage im ${monthLabel}`}
          >
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <span
                    className="calendar-empty"
                    key={`empty-${index}`}
                    aria-hidden="true"
                  />
                );
              }

              const available =
                Boolean(todayKey) &&
                date >= todayKey &&
                date <= lastAvailableKey &&
                (availability[date] || []).length > 0;
              const isToday = date === todayKey;
              const isSelected = selectedDate === date;

              return (
                <button
                  key={date}
                  type="button"
                  className={[
                    "calendar-day",
                    available ? "available" : "",
                    isToday ? "today" : "",
                    isSelected ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={!available}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={formatDate(date, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime("");
                  }}
                >
                  <span className="calendar-day-number">
                    {Number(date.slice(-2))}
                  </span>
                  {isSelected && (
                    <span className="calendar-day-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="booking-step">
          <h3>2. Uhrzeit auswählen</h3>

          {selectedDate ? (
            <>
              <p className="booking-date-label">
                {formatDate(selectedDate, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              <div className="time-options" aria-label="Verfügbare Uhrzeiten">
                {times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={
                      selectedTime === time
                        ? "time-option selected"
                        : "time-option"
                    }
                    aria-pressed={selectedTime === time}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="booking-empty-state">
              <p className="booking-note">
                {availabilityStatus === "loading"
                  ? "Verfügbare Zeiten werden geladen …"
                  : availabilityStatus === "error"
                    ? "Die verfügbaren Zeiten konnten nicht geladen werden. Bitte laden Sie die Seite neu oder kontaktieren Sie uns."
                    : "Wählen Sie zuerst einen verfügbaren Tag."}
              </p>
              {availabilityStatus === "ready" && nextAvailableDate && (
                <button
                  className="next-available-button"
                  type="button"
                  aria-label={`Nächster freier Termin: ${nextAvailableLabel} auswählen`}
                  onClick={() => {
                    setSelectedDate(nextAvailableDate);
                    setSelectedTime("");
                  }}
                >
                  Nächster freier Termin: {nextAvailableLabel} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="booking-step booking-details">
          <h3>3. Kontaktdaten</h3>

          <form
            className="booking-details-form"
            onSubmit={submitBooking}
            onInvalidCapture={() => {
              setSubmissionStatus("error");
              setSubmissionMessage("Bitte prüfen Sie Name und E-Mail-Adresse und füllen Sie alle Pflichtfelder aus.");
            }}
          >
            <label>
              Name
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Ihr Name"
                minLength={2}
                maxLength={120}
                required
                disabled={!selectedTime || submitting}
              />
            </label>

            <label>
              E-Mail-Adresse
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@beispiel.de"
                maxLength={254}
                required
                disabled={!selectedTime || submitting}
              />
            </label>

            <div className="booking-consent">
              <input
                type="checkbox"
                id="privacy-consent"
                name="privacyAccepted"
                aria-label="Ich habe die Datenschutzerklärung gelesen."
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                disabled={!selectedTime || submitting}
                required
              />
              <label htmlFor="privacy-consent">Ich habe die</label>
              <a href="/datenschutz/">Datenschutzerklärung</a>
              <label htmlFor="privacy-consent">gelesen.</label>
            </div>

            <button
              className="pill accent booking-submit"
              type="submit"
              disabled={!selectedTime || !privacyAccepted || submitting}
            >
              {submitting ? "Buchung wird gesendet …" : "Erstgespräch buchen"}
            </button>

            {!selectedTime ? (
              <p className="booking-note booking-submit-hint">
                Wählen Sie zuerst einen Tag und eine Uhrzeit.
              </p>
            ) : !privacyAccepted ? (
              <p className="booking-note booking-submit-hint">
                Bitte bestätigen Sie die Datenschutzerklärung, um zu buchen.
              </p>
            ) : null}

            <p className="booking-note">
              Nach dem Absenden wird der Termin direkt in den Kalender eingetragen.
            </p>
            {submissionMessage && (
              <p
                className={`booking-feedback ${submissionStatus}`}
                role={submissionStatus === "error" ? "alert" : "status"}
                aria-live="polite"
                aria-atomic="true"
              >
                {submissionMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
