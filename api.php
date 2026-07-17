<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
session_start();

const DB_HOST = '127.0.0.1';
const DB_NAME = 'neopocket_ai';
const DB_USER = 'root';
const DB_PASS = '';

// ── Gemini API config ──
// Get/rotate your key at https://aistudio.google.com/apikey
// NOTE: never commit a real key to a public repo. Consider loading this
// from an environment variable instead (getenv('GEMINI_API_KEY')).
const GEMINI_API_KEY = 'AQ.Ab8RN6JaMby_2p_C-iC3pN5Vmr9ojiSPxJLJwYoAgo8RtS_zDQ';
const GEMINI_MODEL   = 'gemini-2.5-flash'; // fast + cheap, good for this task

// ── AI Advisor: mock FX table (base = JPY, all app data is stored in JPY) ──
// These are illustrative/mock rates only, refreshed by hand occasionally.
// Real production use should call a live FX API instead.
const MOCK_FX_RATES = [
    'JPY' => 1.0,
    'USD' => 0.0067,
    'EUR' => 0.0062,
    'GBP' => 0.0053,
    'NPR' => 0.89,
    'INR' => 0.56,
    'CNY' => 0.048,
];

const VALID_CATEGORIES = ['food', 'transport', 'shopping', 'health', 'entertain', 'bills', 'other'];

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
        case 'ai_chat':
            handleAiChat($pdo, $body);
            break;
        case 'ai_advisor':
            handleAiAdvisor($pdo, $body);
            break;
        case 'scan_receipt':
            handleScanReceipt($pdo, $body);
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
  currency VARCHAR(8) NOT NULL DEFAULT 'JPY',
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
  is_recurring TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY u_user_expense (user_id, expense_id),
  KEY idx_user_id (user_id),
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS budget_limits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  category VARCHAR(32) NOT NULL,
  limit_amount DECIMAL(12,2) NOT NULL,
  UNIQUE KEY u_user_cat (user_id, category),
  CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS savings_goals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  goal_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY u_user_goal (user_id, goal_id),
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    // Per-month income: each month's income figure is stored independently,
    // so setting this month's income never rewrites a past month, and a
    // future month never silently inherits it — it just starts at 0 until
    // the user sets it explicitly.
    $pdo->exec(<<<'SQL'
CREATE TABLE IF NOT EXISTS incomes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  month CHAR(7) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  UNIQUE KEY u_user_month (user_id, month),
  CONSTRAINT fk_incomes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL
    );

    // ── Migrations for installs that already existed before these columns ──
    $col = $pdo->query("SHOW COLUMNS FROM expenses LIKE 'time'")->fetch();
    if (!$col) {
        $pdo->exec('ALTER TABLE expenses ADD COLUMN time DATETIME NULL AFTER date');
    }
    $col = $pdo->query("SHOW COLUMNS FROM expenses LIKE 'is_recurring'")->fetch();
    if (!$col) {
        $pdo->exec('ALTER TABLE expenses ADD COLUMN is_recurring TINYINT(1) NOT NULL DEFAULT 0 AFTER note');
    }
    $col = $pdo->query("SHOW COLUMNS FROM users LIKE 'currency'")->fetch();
    if (!$col) {
        $pdo->exec("ALTER TABLE users ADD COLUMN currency VARCHAR(8) NOT NULL DEFAULT 'JPY' AFTER income");
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

    $stmt = $pdo->prepare('SELECT id, name, email, income, currency FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        respondError('User session not found', 401);
    }

    $stmt = $pdo->prepare('SELECT expense_id AS id, name, amount, category AS cat, date, time, note, is_recurring FROM expenses WHERE user_id = ? ORDER BY date DESC, time DESC, id DESC');
    $stmt->execute([$userId]);
    $expenses = $stmt->fetchAll();

    $stmt = $pdo->prepare('SELECT category, limit_amount FROM budget_limits WHERE user_id = ?');
    $stmt->execute([$userId]);
    $budgetLimits = [];
    foreach ($stmt->fetchAll() as $row) {
        $budgetLimits[$row['category']] = (float)$row['limit_amount'];
    }

    $stmt = $pdo->prepare('SELECT goal_id AS id, name, target_amount AS target, current_amount AS current FROM savings_goals WHERE user_id = ? ORDER BY id ASC');
    $stmt->execute([$userId]);
    $savingsGoals = array_map(function ($g) {
        return [
            'id' => $g['id'], 'name' => $g['name'],
            'target' => (float)$g['target'], 'current' => (float)$g['current'],
        ];
    }, $stmt->fetchAll());

    $stmt = $pdo->prepare('SELECT month, amount FROM incomes WHERE user_id = ?');
    $stmt->execute([$userId]);
    $incomeByMonth = [];
    foreach ($stmt->fetchAll() as $row) {
        $incomeByMonth[$row['month']] = (float)$row['amount'];
    }

    // One-time migration: installs that predate per-month income only have
    // the legacy users.income column. Seed the current month with it so
    // existing users don't see their income drop to zero.
    if (empty($incomeByMonth) && (float)$user['income'] > 0) {
        $thisMonth = (new DateTime())->format('Y-m');
        $insert = $pdo->prepare('INSERT INTO incomes (user_id, month, amount) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)');
        $insert->execute([$userId, $thisMonth, (float)$user['income']]);
        $incomeByMonth[$thisMonth] = (float)$user['income'];
    }

    respondJson([
        'success' => true,
        'user' => ['name' => $user['name'], 'email' => $user['email']],
        'income' => (float)$user['income'],
        'incomeByMonth' => $incomeByMonth,
        'currency' => $user['currency'] ?: 'JPY',
        'expenses' => array_map('normalizeExpense', $expenses),
        'budgetLimits' => $budgetLimits,
        'savingsGoals' => $savingsGoals,
    ]);
}

function handleSaveData(PDO $pdo, array $data): void
{
    $userId = getSessionUserId();

    $expenses = is_array($data['expenses']) ? $data['expenses'] : [];
    $currency = strtoupper(trim((string)($data['currency'] ?? 'JPY'))) ?: 'JPY';
    if (!array_key_exists($currency, MOCK_FX_RATES)) {
        $currency = 'JPY';
    }
    $budgetLimits = is_array($data['budgetLimits'] ?? null) ? $data['budgetLimits'] : [];
    $savingsGoals = is_array($data['savingsGoals'] ?? null) ? $data['savingsGoals'] : [];
    $incomeByMonth = is_array($data['incomeByMonth'] ?? null) ? $data['incomeByMonth'] : [];

    // users.income (legacy single-value column, still read by the AI chat /
    // AI advisor prompts) always mirrors THIS server month's entry only —
    // never a neighboring month — so it starts back at 0 once a new month
    // begins until the user sets that month's income explicitly.
    $thisMonth = (new DateTime())->format('Y-m');
    $thisMonthIncome = isset($incomeByMonth[$thisMonth]) ? max(0, (float)$incomeByMonth[$thisMonth]) : 0.0;

    $pdo->beginTransaction();
    $stmt = $pdo->prepare('UPDATE users SET income = ?, currency = ? WHERE id = ?');
    $stmt->execute([$thisMonthIncome, $currency, $userId]);

    $stmt = $pdo->prepare('DELETE FROM expenses WHERE user_id = ?');
    $stmt->execute([$userId]);

    if (!empty($expenses)) {
        $insert = $pdo->prepare('INSERT INTO expenses (user_id, expense_id, name, amount, category, date, time, note, is_recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($expenses as $expense) {
            $expenseId = trim($expense['id'] ?? '') ?: bin2hex(random_bytes(8));
            $name = trim($expense['name'] ?? '');
            $amount = isset($expense['amount']) ? (float)$expense['amount'] : 0.0;
            $category = trim($expense['cat'] ?? 'other');
            $date = normalizeDate($expense['date'] ?? '');
            $time = normalizeDateTime($expense['time'] ?? '');
            $note = trim($expense['note'] ?? '');
            $isRecurring = !empty($expense['isRecurring']) ? 1 : 0;
            $insert->execute([$userId, $expenseId, $name, $amount, $category, $date, $time, $note, $isRecurring]);
        }
    }

    $stmt = $pdo->prepare('DELETE FROM budget_limits WHERE user_id = ?');
    $stmt->execute([$userId]);
    if (!empty($budgetLimits)) {
        $insert = $pdo->prepare('INSERT INTO budget_limits (user_id, category, limit_amount) VALUES (?, ?, ?)');
        foreach ($budgetLimits as $category => $limitAmount) {
            $category = trim((string)$category);
            $limitAmount = (float)$limitAmount;
            if (!in_array($category, VALID_CATEGORIES, true) || $limitAmount <= 0) {
                continue;
            }
            $insert->execute([$userId, $category, $limitAmount]);
        }
    }

    $stmt = $pdo->prepare('DELETE FROM savings_goals WHERE user_id = ?');
    $stmt->execute([$userId]);
    if (!empty($savingsGoals)) {
        $insert = $pdo->prepare('INSERT INTO savings_goals (user_id, goal_id, name, target_amount, current_amount) VALUES (?, ?, ?, ?, ?)');
        foreach ($savingsGoals as $goal) {
            $goalId = trim($goal['id'] ?? '') ?: bin2hex(random_bytes(8));
            $name = trim($goal['name'] ?? '');
            $target = isset($goal['target']) ? (float)$goal['target'] : 0.0;
            $current = isset($goal['current']) ? (float)$goal['current'] : 0.0;
            if ($name === '' || $target <= 0) {
                continue;
            }
            $insert->execute([$userId, $goalId, $name, $target, max(0, $current)]);
        }
    }

    $stmt = $pdo->prepare('DELETE FROM incomes WHERE user_id = ?');
    $stmt->execute([$userId]);
    if (!empty($incomeByMonth)) {
        $insert = $pdo->prepare('INSERT INTO incomes (user_id, month, amount) VALUES (?, ?, ?)');
        foreach ($incomeByMonth as $month => $amount) {
            $month = trim((string)$month);
            $amount = (float)$amount;
            if (!preg_match('/^\d{4}-\d{2}$/', $month) || $amount <= 0) {
                continue;
            }
            $insert->execute([$userId, $month, $amount]);
        }
    }

    $pdo->commit();
    respondJson(['success' => true]);
}

/**
 * Handles the "Ask NEOPOCKET AI" chat box.
 * Combines two features:
 *   1. Natural-language expense entry  -> parses the message into expense rows and saves them
 *   2. "Ask your money" Q&A            -> answers questions using the user's real data as context
 *
 * This is completely separate from generateAdvice() (the rule-based advisor in script.js),
 * which is left untouched.
 */
function handleAiChat(PDO $pdo, array $data): void
{
    $userId  = getSessionUserId();
    $message = trim($data['message'] ?? '');
    if (!$message) {
        respondError('Message is required', 400);
    }

    // Pull real context: income + current month's expenses, so the model can
    // answer questions and knows what "today" / recent spending looks like.
    $stmt = $pdo->prepare('SELECT name, income FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        respondError('User session not found', 401);
    }

    $stmt = $pdo->prepare(
        'SELECT expense_id AS id, name, amount, category AS cat, date, note
         FROM expenses
         WHERE user_id = ? AND date >= DATE_FORMAT(NOW(), \'%Y-%m-01\')
         ORDER BY date DESC, id DESC
         LIMIT 100'
    );
    $stmt->execute([$userId]);
    $currentMonthExpenses = $stmt->fetchAll();
    $expensesJson = json_encode($currentMonthExpenses, JSON_UNESCAPED_UNICODE);

    $today = (new DateTime())->format('Y-m-d');

    $systemPrompt = <<<PROMPT
You are the AI assistant embedded inside a personal finance app called NEOPOCKET AI.
The user will type a message that is either:
  (a) a description of one or more expenses they just made, or
  (b) a question about their finances (spending, savings, budget, etc).

Today's date is {$today}.
The user's monthly income is ¥{$user['income']}.
Their expenses so far this month (JSON) are:
{$expensesJson}

Valid expense categories are exactly: food, transport, shopping, health, entertain, bills, other.

Respond with ONLY a single valid JSON object, no markdown fences, no extra text, in this exact shape:
{
  "intent": "add_expense" | "answer",
  "expenses": [ { "name": string, "amount": number, "cat": string, "date": "YYYY-MM-DD", "note": string } ],
  "reply": string
}

Rules:
- If the message describes one or more purchases/spending, set intent to "add_expense", fill "expenses"
  with one object per purchase (use today's date if no date is mentioned), and write a short friendly
  confirmation in "reply" (in the same language the user wrote in).
- If the message is a question or does not describe a new expense, set intent to "answer", set
  "expenses" to an empty array, and put a helpful, specific answer (using the real numbers above) in "reply".
- Never invent data that isn't in the numbers provided above.
- Keep "reply" concise (2-4 sentences max).
PROMPT;

    $aiResult = callGemini($systemPrompt, $message);

    if ($aiResult === null) {
        respondError('AI service is unavailable right now. Please try again later.', 502);
    }

    $intent  = $aiResult['intent'] ?? 'answer';
    $reply   = $aiResult['reply'] ?? 'Sorry, I could not process that.';
    $newRows = [];

    if ($intent === 'add_expense' && !empty($aiResult['expenses']) && is_array($aiResult['expenses'])) {
        $validCats = ['food', 'transport', 'shopping', 'health', 'entertain', 'bills', 'other'];
        $insert = $pdo->prepare(
            'INSERT INTO expenses (user_id, expense_id, name, amount, category, date, time, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        foreach ($aiResult['expenses'] as $item) {
            $name   = trim((string)($item['name'] ?? 'Expense'));
            $amount = isset($item['amount']) ? (float)$item['amount'] : 0.0;
            $cat    = in_array($item['cat'] ?? '', $validCats, true) ? $item['cat'] : 'other';
            $date   = normalizeDate($item['date'] ?? $today);
            $note   = trim((string)($item['note'] ?? ''));
            $expenseId = bin2hex(random_bytes(8));

            if ($amount <= 0) {
                continue; // skip nonsense rows rather than saving junk
            }

            $insert->execute([$userId, $expenseId, $name, $amount, $cat, $date, null, $note]);
            $newRows[] = [
                'id' => $expenseId, 'name' => $name, 'amount' => $amount,
                'cat' => $cat, 'date' => $date, 'note' => $note,
            ];
        }
    }

    respondJson([
        'success'  => true,
        'intent'   => $intent,
        'reply'    => $reply,
        'expenses' => $newRows, // rows actually saved, so the frontend can refresh without a full reload
    ]);
}

/**
 * Bill/receipt PHOTO scanning (Idea 5, image variant). Accepts a base64
 * photo of a receipt, sends it to Gemini's vision input, and returns
 * structured line items for the user to review before saving — nothing is
 * written to the DB here, since OCR can misread amounts and the user
 * should confirm first (unlike the text-based receipt parsing in
 * handleAiAdvisor, which is typed by the user and saved directly).
 */
function handleScanReceipt(PDO $pdo, array $data): void
{
    $userId = getSessionUserId(); // just to enforce auth; not otherwise used here

    $imageBase64 = trim((string)($data['image_base64'] ?? ''));
    $mimeType    = trim((string)($data['mime_type'] ?? 'image/jpeg'));

    if ($imageBase64 === '') {
        respondError('No image provided', 400);
    }
    if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp', 'image/heic'], true)) {
        respondError('Unsupported image type', 400);
    }
    // Rough sanity limit: base64 is ~1.37x the original bytes; cap around 8MB source.
    if (strlen($imageBase64) > 11 * 1024 * 1024) {
        respondError('Image is too large', 400);
    }

    $today = (new DateTime())->format('Y-m-d');

    $systemPrompt = <<<PROMPT
You are an OCR + categorization engine inside NEOPOCKET AI, a personal finance app.
The attached image is a photo of a receipt or bill. Today's date is {$today}.

Extract every purchasable line item as a separate expense. If the receipt only
shows a single total with no itemized lines, return one expense for the total
using the store/vendor name.

Valid expense categories are exactly: food, transport, shopping, health, entertain, bills, other.
Pick the category per item based on what it is (e.g. groceries/restaurant -> food,
train/bus/taxi/fuel -> transport, clothing/electronics -> shopping,
pharmacy/clinic -> health, movies/games -> entertain, utility/rent -> bills).

If the receipt shows a date, use it (format YYYY-MM-DD); otherwise use today's date.
If the receipt is in a foreign currency, still return the numeric amount as printed
and mention the currency symbol/code in "note".
If the image is not a receipt/bill at all, or is unreadable, return an empty "items" array.

Respond with ONLY a single valid JSON object, no markdown fences, no extra text, in this exact shape:
{
  "store": string,
  "date": "YYYY-MM-DD",
  "items": [ { "name": string, "amount": number, "cat": string, "note": string } ],
  "confidence": "high" | "medium" | "low"
}
PROMPT;

    $aiResult = callGeminiVision($systemPrompt, 'Extract the line items from this receipt photo.', $imageBase64, $mimeType);
    if ($aiResult === null) {
        respondError('AI service is unavailable right now. Please try again later.', 502);
    }

    $items = [];
    if (!empty($aiResult['items']) && is_array($aiResult['items'])) {
        foreach ($aiResult['items'] as $item) {
            $name   = trim((string)($item['name'] ?? 'Item'));
            $amount = isset($item['amount']) ? (float)$item['amount'] : 0.0;
            $cat    = in_array($item['cat'] ?? '', VALID_CATEGORIES, true) ? $item['cat'] : 'other';
            $note   = trim((string)($item['note'] ?? ''));
            if ($amount <= 0) {
                continue;
            }
            $items[] = ['name' => $name, 'amount' => $amount, 'cat' => $cat, 'note' => $note];
        }
    }

    respondJson([
        'success'    => true,
        'store'      => trim((string)($aiResult['store'] ?? '')),
        'date'       => normalizeDate((string)($aiResult['date'] ?? $today)),
        'items'      => $items,
        'confidence' => $aiResult['confidence'] ?? 'medium',
    ]);
}

/**
 * "NEOPOCKET AI Engine" — the full financial-advisor endpoint.
 * Combines: strict month filtering, category budget alerts, a mock
 * multi-currency display layer, gamified savings-goal runway, a recurring-
 * subscription watchdog, and free-text receipt parsing — all in one call.
 *
 * All arithmetic (totals, percentages, runway, FX conversion) is computed
 * here in PHP from real DB data; Gemini is only asked to narrate those
 * pre-computed numbers in the app's Nepglish persona and to extract
 * structured line items when the user pastes unstructured receipt text.
 */
function handleAiAdvisor(PDO $pdo, array $data): void
{
    $userId = getSessionUserId();

    $selectedMonth = trim((string)($data['selected_month'] ?? ''));
    if (!preg_match('/^\d{4}-\d{2}$/', $selectedMonth)) {
        $selectedMonth = (new DateTime())->format('Y-m');
    }

    $stmt = $pdo->prepare('SELECT name, income, currency FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        respondError('User session not found', 401);
    }

    $currencyContext = strtoupper(trim((string)($data['currency_context'] ?? $user['currency'] ?? 'JPY')));
    if (!array_key_exists($currencyContext, MOCK_FX_RATES)) {
        $currencyContext = 'JPY';
    }

    $userQuery = trim((string)($data['user_query'] ?? ''));

    // ── Pull this month's expenses (strict month-wise filtering) ──
    $stmt = $pdo->prepare(
        "SELECT expense_id AS id, name, amount, category AS cat, date, note, is_recurring
         FROM expenses
         WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
         ORDER BY date DESC, id DESC"
    );
    $stmt->execute([$userId, $selectedMonth]);
    $monthExpenses = $stmt->fetchAll();

    $totalSpentJpy = 0.0;
    $categoryTotalsJpy = [];
    $recurringTotalJpy = 0.0;
    $recurringItems = [];
    foreach ($monthExpenses as $e) {
        $amt = (float)$e['amount'];
        $totalSpentJpy += $amt;
        $categoryTotalsJpy[$e['cat']] = ($categoryTotalsJpy[$e['cat']] ?? 0) + $amt;
        if (!empty($e['is_recurring'])) {
            $recurringTotalJpy += $amt;
            $recurringItems[] = ['name' => $e['name'], 'amount' => mockConvert($amt, $currencyContext)];
        }
    }

    // ── Budget limits & alert triggers ──
    $stmt = $pdo->prepare('SELECT category, limit_amount FROM budget_limits WHERE user_id = ?');
    $stmt->execute([$userId]);
    $budgetAlerts = [];
    foreach ($stmt->fetchAll() as $row) {
        $cat = $row['category'];
        $limitJpy = (float)$row['limit_amount'];
        $spentJpy = $categoryTotalsJpy[$cat] ?? 0;
        $pct = $limitJpy > 0 ? round(($spentJpy / $limitJpy) * 100, 1) : 0;
        $status = $pct >= 100 ? 'CRITICAL BREACH' : ($pct >= 80 ? 'WARNING' : 'OK');
        $budgetAlerts[] = [
            'category' => $cat,
            'limit' => mockConvert($limitJpy, $currencyContext),
            'spent' => mockConvert($spentJpy, $currencyContext),
            'pct' => $pct,
            'status' => $status,
        ];
    }

    // ── Savings goals runway (based on this month's net savings) ──
    $incomeJpy = (float)$user['income'];
    $netSavingsJpy = $incomeJpy - $totalSpentJpy;

    $stmt = $pdo->prepare('SELECT name, target_amount, current_amount FROM savings_goals WHERE user_id = ?');
    $stmt->execute([$userId]);
    $goals = [];
    foreach ($stmt->fetchAll() as $g) {
        $targetJpy = (float)$g['target_amount'];
        $currentJpy = (float)$g['current_amount'];
        $remainingJpy = max(0, $targetJpy - $currentJpy);
        $monthsToGoal = $netSavingsJpy > 0 ? (int)ceil($remainingJpy / $netSavingsJpy) : null;
        $goals[] = [
            'name' => $g['name'],
            'target' => mockConvert($targetJpy, $currencyContext),
            'current' => mockConvert($currentJpy, $currencyContext),
            'remaining' => mockConvert($remainingJpy, $currencyContext),
            'months_to_goal_at_current_rate' => $monthsToGoal,
        ];
    }

    $contextPayload = [
        'selected_month' => $selectedMonth,
        'currency_context' => $currencyContext,
        'fx_note' => $currencyContext === 'JPY' ? 'Base currency, no conversion applied.' : 'Mock rate: 1 JPY = ' . MOCK_FX_RATES[$currencyContext] . ' ' . $currencyContext,
        'income' => mockConvert($incomeJpy, $currencyContext),
        'total_spent' => mockConvert($totalSpentJpy, $currencyContext),
        'net_savings' => mockConvert($netSavingsJpy, $currencyContext),
        'category_breakdown' => array_map(fn($v) => mockConvert($v, $currencyContext), $categoryTotalsJpy),
        'budget_alerts' => $budgetAlerts,
        'subscription_overhead' => [
            'total' => mockConvert($recurringTotalJpy, $currencyContext),
            'items' => $recurringItems,
        ],
        'savings_goals' => $goals,
        'transaction_count' => count($monthExpenses),
    ];
    $contextJson = json_encode($contextPayload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    $today = (new DateTime())->format('Y-m-d');

    $systemPrompt = <<<PROMPT
You are the advanced intelligence engine for NEOPOCKET AI, a personal finance app.
The user's name is {$user['name']}. Today's date is {$today}.

All financial figures below have ALREADY been computed and converted into the
user's selected currency ({$currencyContext}) — do NOT recompute totals,
percentages, or conversions yourself, just narrate these real numbers:

{$contextJson}

Valid expense categories are exactly: food, transport, shopping, health, entertain, bills, other.

Your job:
1. Answer the user's message using ONLY the numbers above (never invent data).
2. If any entry in budget_alerts has status "WARNING" or "CRITICAL BREACH", call
   it out clearly and proactively even if the user didn't ask about budgets.
3. If savings_goals is non-empty, give a short motivational line about their
   runway (months_to_goal_at_current_rate), or note if savings are negative.
4. If subscription_overhead.total is meaningfully large relative to income,
   mention the "passive drainage" from recurring subscriptions.
5. If the user's message looks like unstructured receipt/bill text (e.g. a
   store name and a list of items with a total, not a question), extract it
   into structured line items instead of just answering — set intent to
   "add_expense" and fill "expenses".

Vibe: warm, supportive, adaptive tech-peer. Speak in fluent Romanized Nepali
mixed with English finance terms (Nepglish), professional but engaging.
Format "reply" using Markdown: tables for multi-category comparisons, bullet
points for lists, "---" to separate sections, and **bold** for key figures,
statuses (WARNING/CRITICAL BREACH), and action items. Keep it scannable, not
a wall of text.

Respond with ONLY a single valid JSON object, no markdown fences, no extra text, in this exact shape:
{
  "intent": "add_expense" | "answer",
  "expenses": [ { "name": string, "amount": number, "cat": string, "date": "YYYY-MM-DD", "note": string } ],
  "reply": string
}
PROMPT;

    $userMessage = $userQuery !== '' ? $userQuery : 'Give me my full monthly financial briefing for ' . $selectedMonth . '.';

    $aiResult = callGemini($systemPrompt, $userMessage);
    if ($aiResult === null) {
        respondError('AI service is unavailable right now. Please try again later.', 502);
    }

    $intent = $aiResult['intent'] ?? 'answer';
    $reply  = $aiResult['reply'] ?? 'Sorry, I could not process that.';
    $newRows = [];

    if ($intent === 'add_expense' && !empty($aiResult['expenses']) && is_array($aiResult['expenses'])) {
        $insert = $pdo->prepare(
            'INSERT INTO expenses (user_id, expense_id, name, amount, category, date, time, note, is_recurring)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)'
        );
        foreach ($aiResult['expenses'] as $item) {
            $name   = trim((string)($item['name'] ?? 'Expense'));
            $amount = isset($item['amount']) ? (float)$item['amount'] : 0.0;
            $cat    = in_array($item['cat'] ?? '', VALID_CATEGORIES, true) ? $item['cat'] : 'other';
            $date   = normalizeDate($item['date'] ?? $today);
            $note   = trim((string)($item['note'] ?? ''));
            $expenseId = bin2hex(random_bytes(8));

            if ($amount <= 0) {
                continue;
            }

            $insert->execute([$userId, $expenseId, $name, $amount, $cat, $date, null, $note]);
            $newRows[] = [
                'id' => $expenseId, 'name' => $name, 'amount' => $amount,
                'cat' => $cat, 'date' => $date, 'note' => $note, 'isRecurring' => false,
            ];
        }
    }

    respondJson([
        'success'  => true,
        'intent'   => $intent,
        'reply'    => $reply,
        'expenses' => $newRows,
        'context'  => $contextPayload, // lets the frontend render alert badges without re-deriving numbers
    ]);
}

/**
 * Same as callGemini() but attaches an image (receipt photo) alongside the
 * text prompt, using Gemini's multimodal input. Used by handleScanReceipt().
 */
function callGeminiVision(string $systemPrompt, string $userMessage, string $imageBase64, string $mimeType): ?array
{
    if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === '' || str_contains(GEMINI_API_KEY, 'REPLACE')) {
        error_log('GEMINI_API_KEY is not configured in api.php');
        return null;
    }

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL . ':generateContent';

    $payload = [
        'system_instruction' => [
            'parts' => [['text' => $systemPrompt]],
        ],
        'contents' => [
            ['role' => 'user', 'parts' => [
                ['text' => $userMessage],
                ['inline_data' => ['mime_type' => $mimeType, 'data' => $imageBase64]],
            ]],
        ],
        'generationConfig' => [
            'responseMimeType' => 'application/json',
        ],
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-goog-api-key: ' . GEMINI_API_KEY,
        ],
        CURLOPT_TIMEOUT        => 30,
    ]);

    $responseBody = curl_exec($ch);
    $httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError    = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false || $curlError) {
        error_log('Gemini Vision API curl error: ' . $curlError);
        return null;
    }
    if ($httpCode < 200 || $httpCode >= 300) {
        error_log('Gemini Vision API HTTP ' . $httpCode . ': ' . $responseBody);
        return null;
    }

    $decoded = json_decode($responseBody, true);
    $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
    if (!$text) {
        error_log('Gemini Vision API unexpected response shape: ' . $responseBody);
        return null;
    }

    $text = trim($text);
    $text = preg_replace('/^```json\s*|\s*```$/m', '', $text);

    $parsed = json_decode($text, true);
    return is_array($parsed) ? $parsed : null;
}

/**
 * Minimal wrapper around POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 * Returns the decoded JSON object the model replied with, or null on failure.
 */
function callGemini(string $systemPrompt, string $userMessage): ?array
{
    if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === '' || str_contains(GEMINI_API_KEY, 'REPLACE')) {
        error_log('GEMINI_API_KEY is not configured in api.php');
        return null;
    }

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . GEMINI_MODEL . ':generateContent';

    $payload = [
        'system_instruction' => [
            'parts' => [['text' => $systemPrompt]],
        ],
        'contents' => [
            ['role' => 'user', 'parts' => [['text' => $userMessage]]],
        ],
        // Ask Gemini to return raw JSON directly, no need to strip markdown fences
        'generationConfig' => [
            'responseMimeType' => 'application/json',
        ],
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-goog-api-key: ' . GEMINI_API_KEY,
        ],
        CURLOPT_TIMEOUT        => 20,
    ]);

    $responseBody = curl_exec($ch);
    $httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError    = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false || $curlError) {
        error_log('Gemini API curl error: ' . $curlError);
        return null;
    }
    if ($httpCode < 200 || $httpCode >= 300) {
        error_log('Gemini API HTTP ' . $httpCode . ': ' . $responseBody);
        return null;
    }

    $decoded = json_decode($responseBody, true);
    $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
    if (!$text) {
        error_log('Gemini API unexpected response shape: ' . $responseBody);
        return null;
    }

    $text = trim($text);
    // Defensive: strip markdown fences even though responseMimeType should prevent them
    $text = preg_replace('/^```json\s*|\s*```$/m', '', $text);

    $parsed = json_decode($text, true);
    return is_array($parsed) ? $parsed : null;
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
        'isRecurring' => !empty($expense['is_recurring']),
    ];
}

/**
 * Mock currency conversion. All amounts are stored in JPY (the app's base
 * currency); this converts a JPY amount into the requested display currency
 * using the static MOCK_FX_RATES table. Not a real-time rate.
 */
function mockConvert(float $amountJpy, string $targetCurrency): float
{
    $rate = MOCK_FX_RATES[$targetCurrency] ?? 1.0;
    return round($amountJpy * $rate, $targetCurrency === 'JPY' ? 0 : 2);
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
