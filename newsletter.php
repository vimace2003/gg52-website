<?php
// Newsletter Subscribe Handler
// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('X-Content-Type-Options: nosniff');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Rate limiting (max 5 requests per IP per minute)
$rate_limit_file = __DIR__ . '/.rate_limit';
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = time();

if (file_exists($rate_limit_file)) {
    $limits = json_decode(file_get_contents($rate_limit_file), true) ?: [];
} else {
    $limits = [];
}

// Clean old entries (older than 1 minute)
$limits = array_filter($limits, fn($t) => ($now - $t) < 60);

if (isset($limits[$ip])) {
    if ($limits[$ip] >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please try again later.']);
        exit;
    }
    $limits[$ip]++;
} else {
    $limits[$ip] = 1;
}
file_put_contents($rate_limit_file, json_encode($limits));

// Get and validate email
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit;
}

// Prevent common spam patterns
if (preg_match('/\.(tk|ml|ga|cf)$/', $email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email não permitido']);
    exit;
}

// File paths
$newsletter_file = __DIR__ . '/subscribers.txt';
$log_file = __DIR__ . '/.newsletter_log';

// Read existing emails
$existing_emails = [];
if (file_exists($newsletter_file)) {
    $lines = file($newsletter_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $parts = explode('|', $line);
        if (!empty($parts[0])) {
            $existing_emails[] = trim($parts[0]);
        }
    }
}

// Check if email already exists
if (in_array($email, $existing_emails)) {
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => 'Este email já está inscrito']);
    exit;
}

// Add new email with timestamp
$timestamp = date('Y-m-d H:i:s');
$entry = $email . '|' . $timestamp . '|' . $ip . "\n";

// Append to file
if (file_put_contents($newsletter_file, $entry, FILE_APPEND | LOCK_EX)) {
    // Log subscription
    $log_entry = "[$timestamp] Email added: $email from IP: $ip\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Inscrito com sucesso! Obrigado.']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar. Tente novamente.']);
}
exit;
?>
