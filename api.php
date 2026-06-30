<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
session_start();

const DB_HOST = '127.0.0.1';
const DB_NAME = 'neopocket_ai';
const DB_USER = 'root';
const DB_PASS = '';

$action = $_GET['action'] ?? '';
$body = json_decode(file_get_contents('php://input'), true) ?: [];

try {
    $pdo = getDb();

    switch ($action) {
        case 'login':
            handleLogin($pdo, $body);
            break;
        case 'signup':
            handleSignup($pdo, $body);
            break;
        case 'logout':
            handleLogout();
            break;
        case 'get_data':
            handleGetData($pdo);
            break;
        case 'save_data':
            handleSaveData($pdo, $body);
            break;
        default:
            respondError('Invalid action', 400);
    }
} catch (Throwable $e) {
    respondError($e->getMessage(), 500);
}

function getDb(): PDO
{
    $dsn = 'mysql:host=' . DB_HOST . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    $pdo->exec('CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('USE `' . DB_NAME . '`');
    initializeSchema($pdo);
    return $pdo;
}

function initializeSchema(PDO $pdo): void
{
    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  income DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  expense_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(32) NOT NULL,
  date DATE NOT NULL,
  time DATETIME NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY u_user_expense (user_id, expense_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    // Migration: add `time` column if the table already existed without it
    $col = $pdo->query("SHOW COLUMNS FROM expenses LIKE 'time'")->fetch();
    if (!$col) {
        $pdo->exec('ALTER TABLE expenses ADD COLUMN time DATETIME NULL AFTER date');
    }
}

function handleLogin(PDO $pdo, array $data): void
{
    $email = trim(strtolower($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    if (!$email || !$password) {
        respondError('Email and password are required', 400);
    }

    $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        respondError('Invalid email or password', 401);
    }

    $_SESSION['user_id'] = (int)$user['id'];
    respondJson(['success' => true, 'user' => ['name' => $user['name'], 'email' => $user['email']]]);
}

function handleSignup(PDO $pdo, array $data): void
{
    $name = trim($data['name'] ?? '');
    $email = trim(strtolower($data['email'] ?? ''));
    $password = $data['password'] ?? '';
    if (!$name || !$email || !$password) {
        respondError('Name, email, and password are required', 400);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respondError('Invalid email address', 400);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        respondError('An account with this email already exists', 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $passwordHash]);

    $_SESSION['user_id'] = (int)$pdo->lastInsertId();
    respondJson(['success' => true, 'user' => ['name' => $name, 'email' => $email]]);
}

function handleLogout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'], $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    respondJson(['success' => true]);
}

function handleGetData(PDO $pdo): void
{
    $userId = getSessionUserId();

    $stmt = $pdo->prepare('SELECT id, name, email, income FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        respondError('User session not found', 401);
    }

    $stmt = $pdo->prepare('SELECT expense_id AS id, name, amount, category AS cat, date, time, note FROM expenses WHERE user_id = ? ORDER BY date DESC, time DESC, id DESC');
    $stmt->execute([$userId]);
    $expenses = $stmt->fetchAll();

    respondJson([
        'success' => true,
        'user' => ['name' => $user['name'], 'email' => $user['email']],
        'income' => (float)$user['income'],
        'expenses' => array_map('normalizeExpense', $expenses),
    ]);
}

function handleSaveData(PDO $pdo, array $data): void
{
    $userId = getSessionUserId();

    $income = isset($data['income']) ? (float)$data['income'] : 0.0;
    $income = max(0, $income);
    $expenses = is_array($data['expenses']) ? $data['expenses'] : [];

    $pdo->beginTransaction();
    $stmt = $pdo->prepare('UPDATE users SET income = ? WHERE id = ?');
    $stmt->execute([$income, $userId]);

    $stmt = $pdo->prepare('DELETE FROM expenses WHERE user_id = ?');
    $stmt->execute([$userId]);

    if (!empty($expenses)) {
        $insert = $pdo->prepare('INSERT INTO expenses (user_id, expense_id, name, amount, category, date, time, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($expenses as $expense) {
            $expenseId = trim($expense['id'] ?? '') ?: bin2hex(random_bytes(8));
            $name = trim($expense['name'] ?? '');
            $amount = isset($expense['amount']) ? (float)$expense['amount'] : 0.0;
            $category = trim($expense['cat'] ?? 'other');
            $date = normalizeDate($expense['date'] ?? '');
            $time = normalizeDateTime($expense['time'] ?? '');
            $note = trim($expense['note'] ?? '');
            $insert->execute([$userId, $expenseId, $name, $amount, $category, $date, $time, $note]);
        }
    }

    $pdo->commit();
    respondJson(['success' => true]);
}

function getSessionUserId(): int
{
    if (empty($_SESSION['user_id']) || !is_numeric($_SESSION['user_id'])) {
        respondError('Not authenticated', 401);
    }
    return (int)$_SESSION['user_id'];
}

function normalizeExpense(array $expense): array
{
    return [
        'id' => $expense['id'],
        'name' => $expense['name'],
        'amount' => (float)$expense['amount'],
        'cat' => $expense['cat'],
        'date' => $expense['date'],
        'time' => $expense['time'],
        'note' => $expense['note'] ?? '',
    ];
}

function normalizeDate(string $value): string
{
    $date = DateTime::createFromFormat('Y-m-d', $value);
    if ($date === false) {
        return (new DateTime())->format('Y-m-d');
    }
    return $date->format('Y-m-d');
}

function normalizeDateTime(?string $value): string
{
    if (!$value) {
        return (new DateTime())->format('Y-m-d H:i:s');
    }
    try {
        $dt = new DateTime($value);
        return $dt->format('Y-m-d H:i:s');
    } catch (Exception $e) {
        return (new DateTime())->format('Y-m-d H:i:s');
    }
}

function respondJson(array $payload): void
{
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function respondError(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
