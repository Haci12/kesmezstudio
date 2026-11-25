<?php
declare(strict_types=1);

const BOOKING_TIME_ZONE = 'Europe/Paris';
const BOOKING_LENGTH_MINUTES = 45;
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');

class BookingApiException extends RuntimeException
{
    public $httpStatus;

    public function __construct(string $message, int $httpStatus)
    {
        parent::__construct($message);
        $this->httpStatus = $httpStatus;
    }
}

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function base64UrlEncode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function loadBookingConfig(): array
{
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';
    $resolvedDocumentRoot = $documentRoot !== '' ? realpath($documentRoot) : false;
    $directories = [dirname(__DIR__, 2)];

    if ($documentRoot !== '') {
        $directories[] = dirname($resolvedDocumentRoot !== false ? $resolvedDocumentRoot : $documentRoot);
    }

    $homeDirectory = getenv('HOME');
    if (is_string($homeDirectory) && $homeDirectory !== '') {
        $directories[] = $homeDirectory;
    }

    $accountDirectory = null;
    $credentialPath = null;
    foreach (array_unique($directories) as $directory) {
        $candidate = rtrim($directory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'calendar-service-account.json';
        if (is_file($candidate)) {
            if (!is_readable($candidate)) {
                throw new BookingApiException('Die Kalender-Schlüsseldatei ist vorhanden, aber für PHP nicht lesbar.', 503);
            }

            $accountDirectory = $directory;
            $credentialPath = $candidate;
            break;
        }
    }

    if ($accountDirectory === null || $credentialPath === null) {
        error_log('Kesmez Studio booking endpoint: calendar-service-account.json was not found in the account directory candidates.');
        throw new BookingApiException('Die Kalender-Schlüsseldatei wurde im Hetzner-Home-Verzeichnis nicht gefunden.', 503);
    }

    $settingsPath = rtrim($accountDirectory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'calendar-config.php';
    if (!is_file($settingsPath) || !is_readable($settingsPath)) {
        throw new BookingApiException('Die Kalenderverbindung ist noch nicht vollständig eingerichtet.', 503);
    }

    $credentials = json_decode((string) file_get_contents($credentialPath), true);
    $settings = require $settingsPath;

    if (
        !is_array($credentials) ||
        empty($credentials['client_email']) ||
        empty($credentials['private_key']) ||
        empty($credentials['token_uri']) ||
        !is_array($settings) ||
        empty($settings['calendar_id']) ||
        strpos((string) $settings['calendar_id'], 'PASTE_') === 0
    ) {
        throw new BookingApiException('Die Kalenderverbindung ist noch nicht vollständig eingerichtet.', 503);
    }

    return [$credentials, (string) $settings['calendar_id'], $accountDirectory];
}

function googleAccessToken(array $credentials): string
{
    static $cachedToken = null;
    static $cachedUntil = 0;

    if (is_string($cachedToken) && $cachedUntil > time() + 60) {
        return $cachedToken;
    }

    $now = time();
    $claims = [
        'iss' => $credentials['client_email'],
        'scope' => GOOGLE_CALENDAR_SCOPE,
        'aud' => $credentials['token_uri'],
        'iat' => $now,
        'exp' => $now + 3600,
    ];
    $unsignedToken = base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.' .
        base64UrlEncode(json_encode($claims));
    $signature = '';

    if (!openssl_sign($unsignedToken, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
        throw new RuntimeException('Could not sign the Google service account assertion.');
    }

    $assertion = $unsignedToken . '.' . base64UrlEncode($signature);
    $tokenResponse = httpRequest(
        'POST',
        $credentials['token_uri'],
        ['Content-Type: application/x-www-form-urlencoded'],
        http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $assertion,
        ])
    );

    if ($tokenResponse['status'] < 200 || $tokenResponse['status'] >= 300) {
        throw new RuntimeException('Google rejected the service account authentication.');
    }

    $tokenData = json_decode($tokenResponse['body'], true);
    if (empty($tokenData['access_token'])) {
        throw new RuntimeException('Google returned no access token.');
    }

    $cachedToken = (string) $tokenData['access_token'];
    $cachedUntil = $now + (int) ($tokenData['expires_in'] ?? 3600);

    return $cachedToken;
}

function httpRequest(string $method, string $url, array $headers, ?string $body = null): array
{
    if (!function_exists('curl_init')) {
        throw new RuntimeException('The PHP cURL extension is not available.');
    }

    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_POSTFIELDS => $body,
    ]);

    $responseBody = curl_exec($curl);
    $responseStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlError = curl_error($curl);
    curl_close($curl);

    if ($responseBody === false) {
        throw new RuntimeException('Google Calendar request failed: ' . $curlError);
    }

    return ['status' => $responseStatus, 'body' => (string) $responseBody];
}

function googleCalendarRequest(
    string $method,
    string $url,
    array $credentials,
    ?array $payload = null
): array {
    $headers = [
        'Authorization: Bearer ' . googleAccessToken($credentials),
        'Accept: application/json',
    ];
    $body = null;

    if ($payload !== null) {
        $headers[] = 'Content-Type: application/json';
        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    $response = httpRequest($method, $url, $headers, $body);
    $data = json_decode($response['body'], true);

    if ($response['status'] < 200 || $response['status'] >= 300 || !is_array($data)) {
        throw new RuntimeException('Google Calendar API returned HTTP ' . $response['status'] . '.');
    }

    return $data;
}

function getFreeBusy(string $calendarId, array $credentials, DateTimeImmutable $start, DateTimeImmutable $end): array
{
    $result = googleCalendarRequest(
        'POST',
        'https://www.googleapis.com/calendar/v3/freeBusy',
        $credentials,
        [
            'timeMin' => $start->format(DateTimeInterface::RFC3339),
            'timeMax' => $end->format(DateTimeInterface::RFC3339),
            'timeZone' => BOOKING_TIME_ZONE,
            'items' => [['id' => $calendarId]],
        ]
    );

    $calendar = $result['calendars'][$calendarId] ?? null;
    if (!is_array($calendar) || !empty($calendar['errors'])) {
        throw new RuntimeException('Google Calendar did not return availability for the configured calendar.');
    }

    return $calendar['busy'] ?? [];
}

function bookingWindow(DateTimeImmutable $date): ?array
{
    $windows = [
        1 => [16, 20],
        3 => [16, 20],
        5 => [16, 20],
        6 => [12, 18],
    ];

    return $windows[(int) $date->format('N')] ?? null;
}

function overlapsBusyTime(DateTimeImmutable $start, DateTimeImmutable $end, array $busyTimes): bool
{
    foreach ($busyTimes as $busy) {
        if (empty($busy['start']) || empty($busy['end'])) {
            continue;
        }

        $busyStart = new DateTimeImmutable($busy['start']);
        $busyEnd = new DateTimeImmutable($busy['end']);
        if ($start < $busyEnd && $end > $busyStart) {
            return true;
        }
    }

    return false;
}

function getAvailability(string $calendarId, array $credentials): array
{
    $zone = new DateTimeZone(BOOKING_TIME_ZONE);
    $today = new DateTimeImmutable('today', $zone);
    $lastDay = $today->modify('+30 days');
    $busyTimes = getFreeBusy($calendarId, $credentials, $today, $lastDay->modify('+1 day'));
    $now = new DateTimeImmutable('now', $zone);
    $availability = [];

    for ($date = $today; $date <= $lastDay; $date = $date->modify('+1 day')) {
        $window = bookingWindow($date);
        if ($window === null) {
            continue;
        }

        $slots = [];
        for ($minute = $window[0] * 60; $minute + BOOKING_LENGTH_MINUTES <= $window[1] * 60; $minute += BOOKING_LENGTH_MINUTES) {
            $start = $date->setTime(intdiv($minute, 60), $minute % 60);
            $end = $start->modify('+' . BOOKING_LENGTH_MINUTES . ' minutes');

            if ($start <= $now || overlapsBusyTime($start, $end, $busyTimes)) {
                continue;
            }

            $slots[] = $start->format('H:i');
        }

        if ($slots !== []) {
            $availability[$date->format('Y-m-d')] = $slots;
        }
    }

    return $availability;
}

function checkSameOrigin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }

    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $requestHost = preg_replace('/:\\d+$/', '', $requestHost);

    if ($originHost === '' || $originHost !== $requestHost) {
        throw new BookingApiException('Ungültige Anfrage.', 403);
    }
}

function createBooking(array $request, string $calendarId, array $credentials, string $accountDirectory): void
{
    $name = isset($request['name']) && is_string($request['name']) ? trim($request['name']) : '';
    $email = isset($request['email']) && is_string($request['email']) ? trim($request['email']) : '';
    $dateValue = isset($request['date']) && is_string($request['date']) ? $request['date'] : '';
    $timeValue = isset($request['time']) && is_string($request['time']) ? $request['time'] : '';

    if (
        strlen($name) < 2 || strlen($name) > 360 ||
        filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($email) > 254 ||
        ($request['privacyAccepted'] ?? false) !== true ||
        !preg_match('/^\\d{4}-\\d{2}-\\d{2}$/', $dateValue) ||
        !preg_match('/^\\d{2}:\\d{2}$/', $timeValue)
    ) {
        throw new BookingApiException('Bitte prüfen Sie Ihre Angaben und die Datenschutzeinwilligung.', 400);
    }

    $zone = new DateTimeZone(BOOKING_TIME_ZONE);
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $dateValue, $zone);
    $today = new DateTimeImmutable('today', $zone);
    $lastDay = $today->modify('+30 days');

    if ($date === false || $date->format('Y-m-d') !== $dateValue || $date < $today || $date > $lastDay) {
        throw new BookingApiException('Dieser Tag liegt nicht im Buchungszeitraum.', 400);
    }

    $window = bookingWindow($date);
    if ($window === null) {
        throw new BookingApiException('An diesem Tag werden keine Gespräche angeboten.', 400);
    }

    [$hour, $minute] = array_map('intval', explode(':', $timeValue));
    if ($hour > 23 || $minute > 59) {
        throw new BookingApiException('Diese Uhrzeit ist ungültig.', 400);
    }

    $start = $date->setTime($hour, $minute);
    $end = $start->modify('+' . BOOKING_LENGTH_MINUTES . ' minutes');
    $firstSlot = $date->setTime($window[0], 0);

    if (
        $start < $firstSlot ||
        ($hour * 60 + $minute - $window[0] * 60) % 45 !== 0 ||
        $end->format('Y-m-d') !== $dateValue ||
        ((int) $end->format('G') * 60 + (int) $end->format('i')) > $window[1] * 60 ||
        $start <= new DateTimeImmutable('now', $zone)
    ) {
        throw new BookingApiException('Diese Uhrzeit ist nicht mehr verfügbar.', 400);
    }

    $lock = fopen($accountDirectory . '/calendar-booking.lock', 'c');
    if ($lock === false || !flock($lock, LOCK_EX)) {
        throw new RuntimeException('Could not acquire the booking lock.');
    }

    try {
        $busyTimes = getFreeBusy($calendarId, $credentials, $start, $end);
        if (overlapsBusyTime($start, $end, $busyTimes)) {
            throw new BookingApiException('Dieser Termin wurde gerade vergeben. Bitte wählen Sie eine andere Uhrzeit.', 409);
        }

        $event = [
            'summary' => 'Erstgespräch – Kesmez Studio',
            'description' => "Online gebuchtes Erstgespräch.\nName: " . $name . "\nE-Mail: " . $email,
            'start' => [
                'dateTime' => $start->format(DateTimeInterface::RFC3339),
                'timeZone' => BOOKING_TIME_ZONE,
            ],
            'end' => [
                'dateTime' => $end->format(DateTimeInterface::RFC3339),
                'timeZone' => BOOKING_TIME_ZONE,
            ],
            'visibility' => 'private',
        ];
        $eventUrl = 'https://www.googleapis.com/calendar/v3/calendars/' . rawurlencode($calendarId) . '/events?sendUpdates=all';
        googleCalendarRequest('POST', $eventUrl, $credentials, $event);
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    [$credentials, $calendarId, $accountDirectory] = loadBookingConfig();

    if ($method === 'GET' && ($_GET['action'] ?? '') === 'availability') {
        respond(200, ['availability' => getAvailability($calendarId, $credentials)]);
    }

    if ($method !== 'POST') {
        respond(405, ['message' => 'Diese Anfrage wird nicht unterstützt.']);
    }

    checkSameOrigin();
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 10000) {
        throw new BookingApiException('Die Anfrage ist zu groß.', 413);
    }

    $request = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($request)) {
        throw new BookingApiException('Die Anfrage konnte nicht gelesen werden.', 400);
    }

    createBooking($request, $calendarId, $credentials, $accountDirectory);
    respond(201, ['message' => 'Der Termin wurde in den Kalender eingetragen.']);
} catch (BookingApiException $error) {
    respond($error->httpStatus, ['message' => $error->getMessage()]);
} catch (Throwable $error) {
    error_log('Kesmez Studio booking endpoint: ' . $error->getMessage());
    respond(503, ['message' => 'Die Buchung ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.']);
}
