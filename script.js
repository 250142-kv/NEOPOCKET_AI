/* =====================================================
   NEOPOCKET AI — script.js
   Full app logic: routing, CRUD, charts, AI advisor
   ===================================================== */
/* ── Auth guard & current user ── */
let currentUser = { name: 'User', email: '' };

function apiRequest(action, data = {}) {
  return fetch(`api.php?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(data)
  }).then(async response => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload && payload.error ? payload.error : response.statusText || 'Server error');
    }
    if (payload && payload.error) {
      throw new Error(payload.error);
    }
    return payload || {};
  });
}

function updateSidebarUser() {
  const nameEl = document.querySelector('.user-name');
  const avatarEl = document.querySelector('.user-avatar');
  if (nameEl) nameEl.textContent = currentUser.name || 'User';
  if (avatarEl) {
    const parts = (currentUser.name || 'User').trim().split(' ');
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (currentUser.name || 'User').slice(0, 2).toUpperCase();
    avatarEl.textContent = initials;
  }
}

'use strict';

/* ─────────────────────────────────────────────────────
   1. CONSTANTS & CONFIG
───────────────────────────────────────────────────── */

const DEFAULT_INCOME = 0;

const CATEGORIES = [
  { id: 'food',      label: 'Food',        emoji: '🍔', chartColor: '#f6ad55' },
  { id: 'transport', label: 'Transport',   emoji: '🚃', chartColor: '#63b3ed' },
  { id: 'shopping',  label: 'Shopping',    emoji: '🛍️', chartColor: '#9f7aea' },
  { id: 'health',    label: 'Health',      emoji: '💊', chartColor: '#68d391' },
  { id: 'entertain', label: 'Entertainment',emoji: '🎮', chartColor: '#f687b3' },
  { id: 'bills',     label: 'Bills',       emoji: '⚡', chartColor: '#fc8181' },
  { id: 'other',     label: 'Other',       emoji: '📦', chartColor: '#718096' },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

/* ─────────────────────────────────────────────────────
   2. STATE
───────────────────────────────────────────────────── */

let expenses  = [];
let incomeByMonth = {};    // { 'YYYY-MM': amount } — each month's income is set independently
let chartInstances = {};   // track Chart.js instances

/* ── AI Advisor state ── */
let currency      = 'JPY';                 // active display currency for the AI Advisor
let budgetLimits  = {};                    // { category: limitAmountJPY }
let savingsGoals  = [];                    // [{ id, name, target, current }]

/* ── Month-picker state (Dashboard / Analytics) ── */
let dashboardSelectedMonth = null;         // 'YYYY-MM', set on first renderDashboard() call
let analyticsSelectedMonth = null;         // 'YYYY-MM', set on first renderAnalytics() call

const CURRENCY_OPTIONS = [
  { code: 'JPY', label: '¥ JPY' }, { code: 'USD', label: '$ USD' },
  { code: 'EUR', label: '€ EUR' }, { code: 'GBP', label: '£ GBP' },
  { code: 'NPR', label: 'रु NPR' }, { code: 'INR', label: '₹ INR' },
  { code: 'CNY', label: '¥ CNY' },
];

/* ─────────────────────────────────────────────────────
   3. SERVER DATA
───────────────────────────────────────────────────── */

async function loadData() {
  const res = await apiRequest('get_data');
  currentUser = res.user || currentUser;
  expenses = Array.isArray(res.expenses) ? res.expenses : [];
  incomeByMonth = res.incomeByMonth && typeof res.incomeByMonth === 'object' ? res.incomeByMonth : {};
  currency = res.currency || 'JPY';
  budgetLimits = res.budgetLimits && typeof res.budgetLimits === 'object' ? res.budgetLimits : {};
  savingsGoals = Array.isArray(res.savingsGoals) ? res.savingsGoals : [];
  updateSidebarUser();
}

async function saveData() {
  try {
    const res = await apiRequest('save_data', { expenses, incomeByMonth, currency, budgetLimits, savingsGoals });
    if (!res.success) throw new Error(res.error || 'Save failed');
    return true;
  } catch (e) {
    showToast(t('toast_save_failed'), true);
    console.error(e);
    return false;
  }
}

/* ─────────────────────────────────────────────────────
   4. SAMPLE DATA (first load)
───────────────────────────────────────────────────── */

function getSampleExpenses() {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, '0');
  const pm  = String(now.getMonth()).padStart(2, '0') || '12';
  const py  = now.getMonth() === 0 ? y - 1 : y;

  return [
    { id: uid(), name: 'Starbucks',       amount: 1850,  cat: 'food',      date: `${y}-${m}-20`, note: '' },
    { id: uid(), name: 'Amazon Japan',    amount: 8900,  cat: 'shopping',  date: `${y}-${m}-18`, note: '' },
    { id: uid(), name: 'Suica (Train)',   amount: 3200,  cat: 'transport', date: `${y}-${m}-17`, note: '' },
    { id: uid(), name: 'Yoshinoya',       amount: 780,   cat: 'food',      date: `${y}-${m}-16`, note: '' },
    { id: uid(), name: 'Netflix',         amount: 1490,  cat: 'entertain', date: `${y}-${m}-15`, note: '' },
    { id: uid(), name: 'Seven-Eleven',    amount: 1230,  cat: 'food',      date: `${y}-${m}-14`, note: '' },
    { id: uid(), name: 'Uber Eats',       amount: 2840,  cat: 'food',      date: `${y}-${m}-13`, note: '' },
    { id: uid(), name: 'Uniqlo',          amount: 5490,  cat: 'shopping',  date: `${y}-${m}-12`, note: '' },
    { id: uid(), name: 'Gym Membership',  amount: 7500,  cat: 'health',    date: `${y}-${m}-01`, note: '' },
    { id: uid(), name: 'Electric Bill',   amount: 9200,  cat: 'bills',     date: `${y}-${m}-05`, note: '' },
    { id: uid(), name: 'Ramen shop',      amount: 950,   cat: 'food',      date: `${y}-${m}-08`, note: '' },
    { id: uid(), name: 'Movie tickets',   amount: 3600,  cat: 'entertain', date: `${y}-${m}-10`, note: '' },
    // previous month
    { id: uid(), name: 'Supermarket',     amount: 18000, cat: 'food',      date: `${py}-${pm}-25`, note: '' },
    { id: uid(), name: 'Bus pass',        amount: 5000,  cat: 'transport', date: `${py}-${pm}-01`, note: '' },
    { id: uid(), name: 'Amazon order',    amount: 12000, cat: 'shopping',  date: `${py}-${pm}-15`, note: '' },
    { id: uid(), name: 'Gas bill',        amount: 6800,  cat: 'bills',     date: `${py}-${pm}-08`, note: '' },
    { id: uid(), name: 'Coffee shop',     amount: 4200,  cat: 'food',      date: `${py}-${pm}-20`, note: '' },
    { id: uid(), name: 'Game purchase',   amount: 3300,  cat: 'entertain', date: `${py}-${pm}-18`, note: '' },
  ];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ─────────────────────────────────────────────────────
   5. HELPERS — CALCULATIONS
───────────────────────────────────────────────────── */

function currentMonthExpenses() {
  const now = new Date();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

function prevMonthExpenses() {
  const now  = new Date();
  const pm   = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const py   = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === py && d.getMonth() === pm;
  });
}

/* ── Generic "YYYY-MM" month-key helpers, used by the Dashboard and
   Analytics month pickers so either page can browse any past month,
   not just the current one. ── */
function monthKeyOf(y, mZeroBased) {
  return `${y}-${String(mZeroBased + 1).padStart(2, '0')}`;
}

function expensesForMonthKey(key) {
  const [y, m] = key.split('-').map(Number);
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === (m - 1);
  });
}

// Each month's income is independent: a month with no explicit entry falls
// back to DEFAULT_INCOME rather than inheriting a neighboring month's value,
// so setting this month's income never rewrites the past or the future.
function incomeForMonth(key) {
  return incomeByMonth[key] ?? DEFAULT_INCOME;
}

function prevMonthKeyOf(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 2, 1); // m is 1-based, so m-2 = one month before
  return monthKeyOf(d.getFullYear(), d.getMonth());
}

function monthKeyLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(localeCode(), { month: 'long', year: 'numeric' });
}

// Month options for the Dashboard / Analytics pickers: the last 12 months
// plus any older month that actually has recorded expenses, newest first.
function monthPickerOptions() {
  const keys = new Set();
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.add(monthKeyOf(d.getFullYear(), d.getMonth()));
  }
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (!isNaN(d)) keys.add(monthKeyOf(d.getFullYear(), d.getMonth()));
  });
  return [...keys].sort().reverse().map(k => ({ value: k, label: monthKeyLabel(k) }));
}

function totalSpent(list) {
  return list.reduce((s, e) => s + e.amount, 0);
}

// All-time net savings: total income ever recorded (across every month the
// user has set an income for) minus every expense ever logged — i.e. the
// full running total since the person started using the app, not just the
// currently viewed month.
function allTimeNetSavings() {
  const totalIncomeAllTime = Object.values(incomeByMonth).reduce((s, v) => s + (Number(v) || 0), 0);
  return totalIncomeAllTime - totalSpent(expenses);
}

function groupByCategory(list) {
  const map = {};
  CATEGORIES.forEach(c => { map[c.id] = 0; });
  list.forEach(e => { map[e.cat] = (map[e.cat] || 0) + e.amount; });
  return map;
}

function calcScore(curList, inc) {
  const spent   = totalSpent(curList);
  const ratio   = spent / inc;
  const catMap  = groupByCategory(curList);
  const foodPct = catMap['food'] / (spent || 1);

  let score = 100;
  score -= Math.round(ratio * 60);     // spending ratio penalty
  score -= foodPct > 0.4 ? 10 : 0;    // food overspend penalty
  score -= foodPct > 0.55 ? 8 : 0;
  score  = Math.max(10, Math.min(100, score));
  return score;
}

function scoreColor(s) {
  if (s >= 75) return '#68d391';
  if (s >= 50) return '#f6ad55';
  return '#fc8181';
}

function scoreLabel(s) {
  if (s >= 80) return t('score_excellent');
  if (s >= 65) return t('score_good_label');
  if (s >= 50) return t('score_fair');
  return t('score_needs_work');
}

function formatYen(n) {
  return '¥' + Math.round(n).toLocaleString();
}

const LOCALE_MAP = { en: 'en-GB', ja: 'ja-JP', ne: 'ne-NP', hi: 'hi-IN', es: 'es-ES', zh: 'zh-CN' };
function localeCode() {
  return LOCALE_MAP[typeof currentLang !== 'undefined' ? currentLang : 'en'] || 'en-GB';
}

function formatDate(str) {
  return new Date(str).toLocaleDateString(localeCode(), { day: 'numeric', month: 'short', year: 'numeric' });
}

function getLocalTimestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  // Expecting "YYYY-MM-DDTHH:MM:SS" — read the clock numbers directly,
  // never re-parse through `new Date()` (avoids browsers reinterpreting
  // a timezone-less string as UTC and shifting the displayed time).
  const match = timeStr.match(/[T ](\d{2}):(\d{2})/);
  if (!match) return '';
  return `${match[1]}:${match[2]}`;
}

// Sort key for ordering transactions newest-first. Using `date` alone ties
// every transaction from the same day together, and Array.sort's stable
// tie-breaking then falls back to insertion order — so a transaction just
// added today (appended to the end of the array) sorts *behind* every
// other transaction already logged today, and can silently fall off a
// sliced "recent 5" list. Falling back through time, then date, fixes that.
function txSortKey(e) {
  if (e.time) {
    const d = new Date(String(e.time).replace(' ', 'T'));
    if (!isNaN(d)) return d.getTime();
  }
  const d = new Date(e.date);
  return isNaN(d) ? 0 : d.getTime();
}

function currentMonthLabel() {
  return new Date().toLocaleDateString(localeCode(), { month: 'long', year: 'numeric' });
}

/* ─────────────────────────────────────────────────────
   6. CHART HELPERS
───────────────────────────────────────────────────── */

function destroyChart(key) {
  if (chartInstances[key]) {
    chartInstances[key].destroy();
    delete chartInstances[key];
  }
}

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

function darkGridScales(yLabel = 'Amount (¥)') {
  return {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#8892b0', font: { size: 11 } }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#8892b0', font: { size: 11 }, callback: v => '¥' + (v / 1000).toFixed(0) + 'k' },
    }
  };
}

/* ─────────────────────────────────────────────────────
   7. AI ADVISOR LOGIC
───────────────────────────────────────────────────── */

function generateAdvice(curList, inc) {
  const spent    = totalSpent(curList);
  const catMap   = groupByCategory(curList);
  const savings  = inc - spent;
  const savingsPct = Math.round((savings / inc) * 100);
  const advice   = [];

  /* Rule 1: Food > 40% */
  const foodPct = Math.round((catMap['food'] / (spent || 1)) * 100);
  if (foodPct > 40) {
    advice.push({
      type: 'danger',
      icon: '🍔',
      title: t('adv_food_high_title'),
      text: t('adv_food_high_text', { pct: foodPct, amt: Math.round(catMap['food'] * 0.3).toLocaleString() })
    });
  } else if (foodPct > 30) {
    advice.push({
      type: 'warning',
      icon: '🍱',
      title: t('adv_food_watch_title'),
      text: t('adv_food_watch_text', { pct: foodPct })
    });
  }

  /* Rule 2: Savings rate */
  if (savingsPct < 10) {
    advice.push({
      type: 'danger',
      icon: '💸',
      title: t('adv_savings_low_title'),
      text: t('adv_savings_low_text', { pct: savingsPct })
    });
  } else if (savingsPct < 20) {
    advice.push({
      type: 'warning',
      icon: '🪙',
      title: t('adv_savings_below_title'),
      text: t('adv_savings_below_text', {
        pct: savingsPct,
        amt: Math.round(inc * 0.05).toLocaleString(),
        amt2: Math.round(inc * 0.05 * 12).toLocaleString()
      })
    });
  } else {
    advice.push({
      type: 'success',
      icon: '🏆',
      title: t('adv_savings_great_title'),
      text: t('adv_savings_great_text', { pct: savingsPct, amt: Math.round(savings * 6).toLocaleString() })
    });
  }

  /* Rule 3: Entertainment */
  const entPct = Math.round((catMap['entertain'] / (spent || 1)) * 100);
  if (entPct > 15) {
    advice.push({
      type: 'warning',
      icon: '🎮',
      title: t('adv_entertain_title'),
      text: t('adv_entertain_text', { pct: entPct, amt: formatYen(catMap['entertain']) })
    });
  }

  /* Rule 4: Shopping */
  const shopPct = Math.round((catMap['shopping'] / (spent || 1)) * 100);
  if (shopPct > 25) {
    advice.push({
      type: 'warning',
      icon: '🛍️',
      title: t('adv_shopping_title'),
      text: t('adv_shopping_text', { amt: formatYen(catMap['shopping']), pct: shopPct })
    });
  }

  /* Rule 5: Bills */
  if (catMap['bills'] > 0) {
    advice.push({
      type: 'info',
      icon: '⚡',
      title: t('adv_bills_title'),
      text: t('adv_bills_text', { amt: formatYen(catMap['bills']) })
    });
  }

  /* Rule 6: General tip (always) */
  const tipKeys = ['tip_0', 'tip_1', 'tip_2', 'tip_3'];
  advice.push({
    type: 'info',
    icon: '🤖',
    title: t('adv_general_tip_title'),
    text: t(tipKeys[new Date().getDate() % tipKeys.length])
  });

  return advice;
}

/* ─────────────────────────────────────────────────────
   8. FORECAST LOGIC
───────────────────────────────────────────────────── */

function calcForecast(curList, inc) {
  const spent       = totalSpent(curList);
  const savingsNow  = Math.max(0, inc - spent);
  const avgSpend    = spent;                        // use this month as baseline
  const months      = [];
  const now         = new Date();

  for (let i = 1; i <= 3; i++) {
    const d     = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleDateString(localeCode(), { month: 'long', year: 'numeric' });

    // Simple trend: spending grows 2% per month, capped
    const estimatedSpend  = Math.round(avgSpend * Math.pow(1.02, i));
    const estimatedSavings = Math.max(0, inc - estimatedSpend);
    const status = estimatedSavings / inc >= 0.2 ? 'safe' : estimatedSavings > 0 ? 'warn' : 'danger';

    months.push({ label, estimatedSpend, estimatedSavings, status });
  }
  return months;
}

/* ─────────────────────────────────────────────────────
   9. PAGE RENDERERS
───────────────────────────────────────────────────── */

/* ── 9a. DASHBOARD ── */
function renderDashboard() {
  if (!dashboardSelectedMonth) dashboardSelectedMonth = currentYYYYMM();

  const cur  = expensesForMonthKey(dashboardSelectedMonth);
  const prev = expensesForMonthKey(prevMonthKeyOf(dashboardSelectedMonth));
  const monthIncome = incomeForMonth(dashboardSelectedMonth);
  const spent     = totalSpent(cur);
  const prevSpent = totalSpent(prev);
  const savings   = Math.max(0, monthIncome - spent);
  const allTimeNet = allTimeNetSavings();
  const score     = calcScore(cur, monthIncome);
  const sColor    = scoreColor(score);
  const sLabel    = scoreLabel(score);
  const spentDiff = spent - prevSpent;
  const spentSign = spentDiff >= 0 ? '▲' : '▼';
  const circumference = 2 * Math.PI * 44;
  const dash = (score / 100) * circumference;

  // Recent 5 transactions for the selected month
  const recent = [...cur]
    .sort((a, b) => txSortKey(b) - txSortKey(a))
    .slice(0, 5);

  const txRows = recent.length
    ? recent.map(e => txRowHTML(e)).join('')
    : `<div class="empty-state"><div class="icon">💳</div><p>${t('empty_tx')}</p></div>`;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">${t('dash_title')}</div>
        <div class="page-subtitle">${t('dash_welcome', { name: currentUser.name })}</div>
      </div>
      <select class="month-select-badge" id="dashboard-month-select" onchange="dashboardSelectedMonth=this.value; navigateTo('dashboard')">
        ${monthPickerOptions().map(o => `<option value="${o.value}" ${o.value === dashboardSelectedMonth ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>
    </div>

    <div class="metric-grid">
      <div class="metric-card" style="--grad: linear-gradient(135deg,#667eea,#764ba2);">
        <span class="metric-icon">💰</span>
        <div class="metric-label">${t('metric_income')}</div>
        <div class="metric-value">${formatYen(monthIncome)}</div>
        <div class="metric-sub metric-neutral">${t('metric_income_sub')}</div>
      </div>
      <div class="metric-card" style="--grad: linear-gradient(135deg,#f093fb,#f5576c);">
        <span class="metric-icon">💸</span>
        <div class="metric-label">${t('metric_spent')}</div>
        <div class="metric-value">${formatYen(spent)}</div>
        <div class="metric-sub ${spentDiff >= 0 ? 'metric-down' : 'metric-up'}">
          ${spentSign} ${formatYen(Math.abs(spentDiff))} ${t('metric_spent_vs')}
        </div>
      </div>
      <div class="metric-card" style="--grad: linear-gradient(135deg,#11998e,#38ef7d);">
        <span class="metric-icon">🏦</span>
        <div class="metric-label">${t('metric_savings')}</div>
        <div class="metric-value">${formatYen(savings)}</div>
        <div class="metric-sub ${savings >= monthIncome * 0.2 ? 'metric-up' : 'metric-down'}">
          ${t('metric_savings_pct', { pct: Math.round((savings / (monthIncome || 1)) * 100) })}
        </div>
      </div>
    </div>

    ${dashboardSelectedMonth === currentYYYYMM() ? `
    <div class="glass-card" style="margin-bottom:1.75rem;display:flex;align-items:center;gap:16px;--grad: linear-gradient(135deg,#0ea5e9,#22d3ee);">
      <div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#22d3ee);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">💎</div>
      <div style="flex:1;">
        <div class="section-label" style="margin-bottom:2px;">${t('alltime_savings_title')}</div>
        <div style="font-size:11px;color:var(--text-secondary);">${t('alltime_savings_hint')}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:22px;font-weight:800;color:${allTimeNet >= 0 ? '#68d391' : '#fc8181'};">${formatYen(allTimeNet)}</div>
      </div>
    </div>
    ` : ''}

    <div class="dash-grid">
      <div class="glass-card">
        <div class="section-label">${t('budget_progress')}</div>
        ${budgetProgressHTML(spent, monthIncome, cur)}
      </div>
      <div class="glass-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <div class="section-label" style="align-self:flex-start;">${t('financial_health')}</div>
        <div class="score-container">
          <div class="score-ring-wrap">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="${sColor}" stroke-width="8"
                stroke-dasharray="${dash.toFixed(1)} ${circumference.toFixed(1)}"
                stroke-linecap="round"/>
            </svg>
            <div class="score-center">
              <div class="score-num">${score}</div>
              <div class="score-max">/ 100</div>
            </div>
          </div>
          <div class="score-label" style="color:${sColor};">${sLabel}</div>
          <div style="font-size:11px;color:var(--text-secondary);text-align:center;max-width:160px;line-height:1.5;">
            ${score >= 70 ? t('score_msg_great') : score >= 50 ? t('score_msg_good') : t('score_msg_bad')}
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">${t('recent_tx')}</div>
      <div class="tx-list">${txRows}</div>
    </div>
  `;
}

function budgetProgressHTML(spent, inc, list) {
  const monthList = list || currentMonthExpenses();
  const pct = Math.min(Math.round((spent / inc) * 100), 100);
  const remaining = Math.max(0, inc - spent);
  const barColor = pct > 85 ? '#fc8181' : pct > 60 ? '#f6ad55' : '#68d391';
  return `
    <div style="margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;">
        <span style="color:var(--text-secondary);">${t('spent_colon', { amt: formatYen(spent) })}</span>
        <span style="color:var(--text-secondary);">${t('budget_colon', { amt: formatYen(inc) })}</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,0.06);border-radius:5px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:5px;transition:width 0.6s ease;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;">
        <span style="color:${barColor};">${t('used_suffix', { pct })}</span>
        <span style="color:var(--text-secondary);">${t('remaining_suffix', { amt: formatYen(remaining) })}</span>
      </div>
    </div>
    ${CATEGORIES.map(c => {
      const cur = monthList;
      const catMap = groupByCategory(cur);
      const val = catMap[c.id] || 0;
      if (!val) return '';
      const catPct = Math.round((val / (totalSpent(cur) || 1)) * 100);
      return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="font-size:16px;width:22px;">${c.emoji}</span>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
              <span style="color:var(--text-secondary);">${catLabel(c.id)}</span>
              <span style="color:var(--text-primary);font-weight:600;">${formatYen(val)} <span style="color:var(--text-muted);">(${catPct}%)</span></span>
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;">
              <div style="height:100%;width:${catPct}%;background:${c.chartColor};border-radius:2px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('')}
  `;
}

function txRowHTML(e) {
  const cat = CAT_MAP[e.cat] || CAT_MAP['other'];
  return `
    <div class="tx-row" id="tx-${e.id}">
      <div class="tx-icon c-${e.cat}">${cat.emoji}</div>
      <div class="tx-info">
        <div class="tx-name">${escHTML(e.name)}${e.isRecurring ? ` <span title="${escHTML(t('recurring_label'))}">🔁</span>` : ''}</div>
        <div class="tx-date">${formatDate(e.date)}${e.time ? ' · ' + formatTime(e.time) : ''}</div>
        ${e.note ? `<div class="tx-note">📝 ${escHTML(e.note)}</div>` : ''}
      </div>
      <div class="tx-right">
        <div class="tx-amount" style="color:var(--accent-red);">-${formatYen(e.amount)}</div>
        <span class="tx-cat c-${e.cat}">${catLabel(e.cat)}</span>
      </div>
      <div class="tx-actions">
        <button class="btn-icon" title="${t('edit_expense_title')}" onclick="openEditModal('${e.id}')">✏️</button>
        <button class="btn-icon danger" title="${t('confirm_delete_expense')}" onclick="deleteExpense('${e.id}')">🗑️</button>
      </div>
    </div>
  `;
}

/* ── 9b. ADD EXPENSE ── */
function renderAdd() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">${t('add_title')}</div>
        <div class="page-subtitle">${t('add_subtitle')}</div>
      </div>
    </div>

    <div class="glass-card" style="max-width:640px;margin-bottom:1.25rem;">
      <div class="section-label">${t('scan_receipt_title')}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">${t('scan_receipt_hint')}</div>

      <input type="file" id="receipt-file-input" accept="image/*" capture="environment" style="display:none;" onchange="handleReceiptFileSelected(this)" />

      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
        <button type="button" class="btn-secondary" onclick="document.getElementById('receipt-file-input').click()">
          📷 ${t('choose_photo_btn')}
        </button>
        <span id="receipt-file-name" style="font-size:12px;color:var(--text-secondary);"></span>
      </div>

      <div id="receipt-preview-wrap" style="margin-top:12px;display:none;">
        <img id="receipt-preview-img" style="max-width:100%;max-height:220px;border-radius:10px;border:1px solid var(--border);" />
      </div>

      <button type="button" class="btn-primary" id="scan-receipt-btn" style="margin-top:12px;display:none;" onclick="scanReceiptPhoto()">
        🔍 ${t('scan_receipt_btn')}
      </button>

      <div id="receipt-scan-results" style="margin-top:14px;"></div>
    </div>

    <div class="glass-card" style="max-width:640px;">
      <div class="section-label">${t('expense_details')}</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">${t('expense_name')}</label>
          <input class="form-input" id="f-name" type="text" placeholder="${t('expense_name_ph')}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('amount_label')}</label>
          <input class="form-input" id="f-amount" type="number" min="1" placeholder="${t('amount_ph')}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('date_label')}</label>
          <input class="form-input" id="f-date" type="date" value="${todayStr()}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('note_label')}</label>
          <input class="form-input" id="f-note" type="text" placeholder="${t('note_ph')}" />
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1.25rem;">
        <label class="form-label">${t('category_label')}</label>
        <div class="cat-grid" id="cat-grid">
          ${CATEGORIES.map(c => `
            <div class="cat-pill" data-cat="${c.id}" onclick="selectCat('${c.id}')">
              <span>${c.emoji}</span>${catLabel(c.id)}
            </div>
          `).join('')}
        </div>
        <input type="hidden" id="f-cat" value="" />
      </div>

      <label style="display:flex;align-items:center;gap:8px;margin-bottom:1.25rem;font-size:13px;color:var(--text-secondary);cursor:pointer;">
        <input type="checkbox" id="f-recurring" style="width:16px;height:16px;accent-color:#667eea;" />
        ${t('recurring_label')}
      </label>

      <button class="btn-primary" onclick="submitExpense()">
        ${t('save_expense_btn')}
      </button>
    </div>

    <div class="glass-card" style="max-width:640px;margin-top:1.25rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div class="section-label" style="margin:0;">${t('monthly_income_label')}</div>
        <div class="date-badge">${currentMonthLabel()}</div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-top:6px;">${t('income_month_hint')}</div>
      <div style="display:flex;gap:10px;margin-top:1rem;">
        <input class="form-input" id="income-input" type="number" value="${incomeForMonth(currentYYYYMM())}" style="max-width:220px;" />
        <button class="btn-secondary" onclick="updateIncome()">${t('update_income_btn')}</button>
      </div>
    </div>
  `;
}

/* ── 9b-1. RECEIPT PHOTO SCANNING (Gemini vision → structured line items) ──
   Two-step flow: (1) upload/snap a photo and let the AI extract candidate
   line items, (2) user reviews/edits/deselects items in the results panel,
   then confirms — only then are they pushed into `expenses` and saved.
   Nothing is written to the server until the user confirms, since OCR can
   misread amounts. */

let receiptImageBase64 = null;
let receiptImageMime = null;
let scannedReceiptItems = [];

function handleReceiptFileSelected(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  document.getElementById('receipt-file-name').textContent = file.name;
  document.getElementById('receipt-scan-results').innerHTML = '';
  scannedReceiptItems = [];

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result; // "data:image/jpeg;base64,AAAA..."
    const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.*)$/);
    if (!match) {
      showToast(t('toast_bad_image'), true);
      return;
    }
    receiptImageMime = match[1];
    receiptImageBase64 = match[2];

    const previewImg = document.getElementById('receipt-preview-img');
    previewImg.src = dataUrl;
    document.getElementById('receipt-preview-wrap').style.display = '';
    document.getElementById('scan-receipt-btn').style.display = '';
  };
  reader.readAsDataURL(file);
}

async function scanReceiptPhoto() {
  if (!receiptImageBase64) return;
  const btn = document.getElementById('scan-receipt-btn');
  const resultsEl = document.getElementById('receipt-scan-results');
  btn.disabled = true;
  btn.textContent = t('scanning_btn');
  resultsEl.innerHTML = '';

  try {
    const res = await apiRequest('scan_receipt', {
      image_base64: receiptImageBase64,
      mime_type: receiptImageMime,
    });

    if (!res.items || !res.items.length) {
      resultsEl.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);padding:8px 0;">${t('no_items_detected')}</div>`;
      return;
    }

    scannedReceiptItems = res.items.map(it => ({
      name: it.name, amount: it.amount, cat: it.cat, note: it.note || '',
      date: res.date || todayStr(), include: true,
    }));
    resultsEl.innerHTML = renderReceiptItemsHTML(res.store);
  } catch (err) {
    resultsEl.innerHTML = `<div style="font-size:12px;color:#fc8181;padding:8px 0;">⚠️ ${escHTML(err.message || t('ai_error'))}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = `🔍 ${t('scan_receipt_btn')}`;
  }
}

function renderReceiptItemsHTML(store) {
  const rows = scannedReceiptItems.map((it, i) => `
    <div class="budget-limit-row" style="align-items:center;">
      <input type="checkbox" ${it.include ? 'checked' : ''} onchange="scannedReceiptItems[${i}].include=this.checked" style="width:16px;height:16px;accent-color:#667eea;flex-shrink:0;" />
      <input class="form-input" type="text" value="${escHTML(it.name)}" style="flex:1;max-width:none;" oninput="scannedReceiptItems[${i}].name=this.value" placeholder="${t('item_name_ph')}" />
      <input class="form-input" type="number" value="${it.amount}" style="max-width:100px;" oninput="scannedReceiptItems[${i}].amount=parseFloat(this.value)||0" />
      <select class="form-input" style="max-width:130px;" onchange="scannedReceiptItems[${i}].cat=this.value">
        ${CATEGORIES.map(c => `<option value="${c.id}" ${c.id === it.cat ? 'selected' : ''}>${c.emoji} ${catLabel(c.id)}</option>`).join('')}
      </select>
    </div>
  `).join('');

  return `
    <div class="form-group" style="margin-bottom:10px;">
      <label class="form-label">${t('store_name_label')}</label>
      <input class="form-input" id="scanned-store-name" type="text" value="${escHTML(store || '')}" placeholder="${t('store_name_ph')}" />
    </div>
    <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">${t('scan_items_hint')}</div>
    ${rows}
    <button type="button" class="btn-primary" style="margin-top:12px;" onclick="confirmScannedExpenses()">
      ✅ ${t('add_scanned_btn')}
    </button>
  `;
}

async function confirmScannedExpenses() {
  const storeName = (document.getElementById('scanned-store-name')?.value || '').trim() || t('receipt_fallback_name');
  const chosen = scannedReceiptItems.filter(it => it.include && it.amount > 0 && it.name.trim());
  if (!chosen.length) return showToast(t('toast_select_at_least_one'), true);

  // One expense per category, headlined with the store name; the individual
  // item names + amounts become the note. (Previously each item became its
  // own expense named after the item, which buried the store name and left
  // the note field empty — this groups by category instead.)
  const byCat = {};
  chosen.forEach(it => {
    if (!byCat[it.cat]) byCat[it.cat] = { total: 0, parts: [], date: it.date };
    byCat[it.cat].total += it.amount;
    byCat[it.cat].parts.push(`${it.name.trim()} (${formatYen(it.amount)})`);
  });

  Object.entries(byCat).forEach(([cat, group]) => {
    expenses.push({
      id: uid(), name: storeName, amount: group.total, cat,
      date: group.date || todayStr(), note: group.parts.join(', '),
      time: getLocalTimestamp(), isRecurring: false,
    });
  });

  if (!await saveData()) return;
  showToast(t('toast_expense_added', { n: Object.keys(byCat).length }));

  scannedReceiptItems = [];
  receiptImageBase64 = null;
  receiptImageMime = null;
  navigateTo('dashboard');
}

function selectCat(id) {
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('selected'));
  const el = document.querySelector(`.cat-pill[data-cat="${id}"]`);
  if (el) el.classList.add('selected');
  document.getElementById('f-cat').value = id;
}

async function submitExpense() {
  const name   = document.getElementById('f-name').value.trim();
  const amount = parseFloat(document.getElementById('f-amount').value);
  const date   = document.getElementById('f-date').value;
  const note   = document.getElementById('f-note').value.trim();
  const cat    = document.getElementById('f-cat').value;
  const isRecurring = document.getElementById('f-recurring').checked;

  if (!name)         return showToast(t('toast_enter_name'), true);
  if (!amount || amount <= 0) return showToast(t('toast_enter_amount'), true);
  if (!date)         return showToast(t('toast_pick_date'), true);
  if (!cat)          return showToast(t('toast_select_category'), true);

  expenses.push({ id: uid(), name, amount, date, note, cat, time: getLocalTimestamp(), isRecurring });
  if (!await saveData()) return;
  showToast(t('toast_expense_saved'));
  navigateTo('dashboard');
}

async function updateIncome() {
  const val = parseFloat(document.getElementById('income-input').value);
  if (!val || val <= 0) return showToast(t('toast_enter_valid_income'), true);
  incomeByMonth = { ...incomeByMonth, [currentYYYYMM()]: val };
  if (!await saveData()) return;
  showToast(t('toast_income_updated'));
}

/* ── 9c. ANALYTICS ── */
function exportExpensesToExcel() {
  if (!expenses.length) {
    alert(t('no_export_alert'));
    return;
  }

  const rows = [...expenses]
    .sort((a, b) => txSortKey(b) - txSortKey(a))
    .map(e => ({
      Date: e.date,
      Time: formatTime(e.time),
      Name: e.name,
      Category: CAT_MAP[e.cat] ? catLabel(e.cat) : e.cat,
      'Amount (¥)': e.amount,
      Note: e.note || ''
    }));

  const total = rows.reduce((sum, r) => sum + r['Amount (¥)'], 0);
  rows.push({ Date: '', Name: '', Category: '', 'Amount (¥)': total, Note: 'TOTAL' });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 30 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `neopocket-expenses-${today}.xlsx`);
}

function renderAnalytics() {
  if (!analyticsSelectedMonth) analyticsSelectedMonth = currentYYYYMM();

  const cur   = expensesForMonthKey(analyticsSelectedMonth);
  const catMap = groupByCategory(cur);
  const spent  = totalSpent(cur);

  const legendHTML = CATEGORIES
    .filter(c => catMap[c.id] > 0)
    .map(c => {
      const pct = Math.round((catMap[c.id] / (spent || 1)) * 100);
      return `
        <div class="legend-item">
          <div class="legend-left">
            <div class="legend-dot" style="background:${c.chartColor};"></div>
            <span class="legend-name">${c.emoji} ${catLabel(c.id)}</span>
          </div>
          <span>
            <span class="legend-val">${formatYen(catMap[c.id])}</span>
            <span class="legend-pct">${pct}%</span>
          </span>
        </div>
      `;
    }).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">${t('analytics_title')}</div>
        <div class="page-subtitle">${t('analytics_subtitle')}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <select class="month-select-badge" id="analytics-month-select" onchange="analyticsSelectedMonth=this.value; navigateTo('analytics')">
          ${monthPickerOptions().map(o => `<option value="${o.value}" ${o.value === analyticsSelectedMonth ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <button onclick="exportExpensesToExcel()" class="login-btn" style="width:auto;padding:8px 16px;font-size:13px;">${t('export_excel_btn')}</button>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="glass-card">
        <div class="section-label">${t('category_breakdown')}</div>
        <div class="chart-wrap" style="height:240px;">
          <canvas id="pieChart" role="img" aria-label="Pie chart of spending by category">Category spending breakdown.</canvas>
        </div>
      </div>
      <div class="glass-card" style="display:flex;flex-direction:column;justify-content:center;">
        <div class="section-label">${t('legend_title')}</div>
        <div class="legend-list">${legendHTML || `<p style="color:var(--text-muted);font-size:13px;">${t('no_data_month')}</p>`}</div>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">${t('trend_6mo')}</div>
      <div class="chart-wrap" style="height:220px;">
        <canvas id="trendChart" role="img" aria-label="Bar chart of monthly spending over 6 months">Monthly spending trend.</canvas>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">${t('all_transactions')}</div>
      <div class="tx-list">
        ${[...cur].sort((a,b) => txSortKey(b) - txSortKey(a)).map(e => txRowHTML(e)).join('')
          || `<div class="empty-state"><div class="icon">📋</div><p>${t('empty_tx_all')}</p></div>`}
      </div>
    </div>
  `;
}

function renderAnalyticsCharts() {
  const selMonth = analyticsSelectedMonth || currentYYYYMM();

  // Pie
  const cur    = expensesForMonthKey(selMonth);
  const catMap = groupByCategory(cur);
  const cats   = CATEGORIES.filter(c => catMap[c.id] > 0);

  destroyChart('pie');
  const pieEl = document.getElementById('pieChart');
  if (pieEl && cats.length) {
    chartInstances['pie'] = new Chart(pieEl, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => catLabel(c.id)),
        datasets: [{
          data: cats.map(c => catMap[c.id]),
          backgroundColor: cats.map(c => c.chartColor),
          borderColor: '#060b18',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        ...CHART_DEFAULTS,
        cutout: '62%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatYen(ctx.parsed)}` } } },
      }
    });
  }

  // Trend bar (6 months ending on the selected month)
  destroyChart('trend');
  const trendEl = document.getElementById('trendChart');
  if (trendEl) {
    const months = [];
    const [selY, selM] = selMonth.split('-').map(Number); // selM is 1-based
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selY, (selM - 1) - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const total = expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
      }).reduce((s, e) => s + e.amount, 0);
      months.push({ label, total });
    }
    chartInstances['trend'] = new Chart(trendEl, {
      type: 'bar',
      data: {
        labels: months.map(m => m.label),
        datasets: [{
          label: 'Spending',
          data: months.map(m => m.total),
          backgroundColor: months.map((_, i) => i === 5 ? '#667eea' : 'rgba(102,126,234,0.35)'),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        ...CHART_DEFAULTS,
        scales: darkGridScales(),
        plugins: { ...CHART_DEFAULTS.plugins, tooltip: { callbacks: { label: ctx => formatYen(ctx.parsed.y) } } },
      }
    });
  }
}

/* ── 9d. AI ADVISOR ── */
function currentYYYYMM() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function renderAI() {
  const cur    = currentMonthExpenses();
  const advice = generateAdvice(cur, incomeForMonth(currentYYYYMM()));

  const typeLabel = { danger: t('ai_type_alert'), warning: t('ai_type_warning'), success: t('ai_type_success'), info: t('ai_type_info') };

  const adviceHTML = advice.map(a => `
    <div class="advice-item advice-${a.type}">
      <div class="advice-icon">${a.icon}</div>
      <div>
        <div class="advice-type">${typeLabel[a.type] || typeLabel.info}</div>
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:5px;">${a.title}</div>
        <div class="advice-text">${a.text}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">${t('ai_title')}</div>
        <div class="page-subtitle">${t('ai_subtitle')}</div>
      </div>
    </div>

    <div class="glass-card" style="margin-bottom:1.25rem;">
      <div class="ai-header">
        <div class="ai-avatar">🤖</div>
        <div>
          <div class="ai-title">${t('ai_coach')}</div>
          <div class="ai-subtitle">${t('ai_powered')}</div>
        </div>
      </div>
      <div style="padding:14px 16px;background:rgba(99,179,237,0.07);border:1px solid rgba(99,179,237,0.15);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.7;">
        ${t('ai_summary', { n: currentMonthExpenses().length })}
      </div>
    </div>

    <div class="advice-list">${adviceHTML}</div>

    <div class="glass-card" style="margin-top:1.25rem;">
      <div class="section-label">${t('ask_ai')}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">
        ${t('ask_ai_hint')}
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
        ${AI_QUICK_QUESTIONS.map((q, i) => `
          <button type="button" class="ai-quick-chip" onclick="askAiQuickQuestion(${i})">
            ${q.emoji} ${t('quick_q_' + i)}
          </button>
        `).join('')}
      </div>

      <div id="ai-chat-log" style="display:flex;flex-direction:column;gap:10px;max-height:420px;overflow-y:auto;margin-bottom:12px;padding-right:4px;"></div>

      <form id="ai-chat-form" style="display:flex;flex-direction:column;gap:10px;" onsubmit="handleAiChatSubmit(event)">
        <textarea
          id="ai-chat-input"
          class="form-textarea"
          placeholder="${t('chat_placeholder')}"
          rows="4"
          style="width:100%;font-size:16px;line-height:1.6;min-height:110px;resize:vertical;font-family:'Segoe UI','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,-apple-system,sans-serif;"
          onkeydown="handleAiChatKeydown(event)"
        ></textarea>
        <button type="submit" class="btn-primary" id="ai-chat-send-btn" style="align-self:flex-end;padding:11px 28px;">${t('send_btn')}</button>
      </form>
    </div>
  `;
}

/* ── 9d-2. AI ADVISOR CHAT (natural-language expense/receipt entry + Q&A) ──
   Calls the backend "ai_advisor" engine, which strictly filters to the
   selected month, checks budget alerts, mock-converts to the selected
   currency, tracks savings-goal runway, and flags recurring subscriptions —
   then narrates it all through Gemini in the app's persona. This is
   separate from generateAdvice() above (the rule-based cards), which is
   left untouched. */

const AI_QUICK_QUESTIONS = [
  { emoji: '📋', label: 'Full monthly briefing',
    question: 'Give me my full financial briefing for this month.' },
  { emoji: '🚨', label: 'Any budget alerts?',
    question: 'Am I close to or over any of my category budget limits this month?' },
  { emoji: '🔁', label: 'Subscription drainage check',
    question: 'How much am I losing every month to recurring subscriptions?' },
  { emoji: '🎯', label: 'Savings goal runway',
    question: 'At my current savings rate, how long until I hit my savings goals?' },
  { emoji: '🔍', label: 'Where am I overspending?',
    question: 'Looking at my expenses this month, which category am I overspending in the most, and by how much?' },
];

function askAiQuickQuestion(index) {
  const q = AI_QUICK_QUESTIONS[index];
  if (!q) return;
  const input = document.getElementById('ai-chat-input');
  if (input) input.value = q.question;
  sendAiChatMessage(q.question);
}

function appendAiChatBubble(text, who) {
  const log = document.getElementById('ai-chat-log');
  if (!log) return;
  const bubble = document.createElement('div');
  const isUser = who === 'user';
  bubble.style.cssText = `
    align-self:${isUser ? 'flex-end' : 'flex-start'};
    max-width:90%;
    padding:10px 13px;
    border-radius:12px;
    font-size:14px;
    line-height:1.6;
    font-family:'Segoe UI','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,-apple-system,sans-serif;
    background:${isUser ? 'var(--grad-blue)' : 'rgba(255,255,255,0.06)'};
    border:${isUser ? 'none' : '1px solid var(--border)'};
    color:${isUser ? '#fff' : 'var(--text-primary)'};
  `;
  if (isUser) {
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.textContent = text;
  } else {
    // AI replies are Markdown from the model; render safely (escape first, then a
    // small whitelist of Markdown features — see renderMarkdownLite()).
    bubble.innerHTML = renderMarkdownLite(text);
  }
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
}

function handleAiChatKeydown(e) {
  // Let Shift+Enter add a newline, and don't hijack Enter while the user
  // is still composing Japanese (or other IME) text — e.g. converting
  // kanji candidates. Only plain Enter submits the message.
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
    e.preventDefault();
    document.getElementById('ai-chat-form').requestSubmit();
  }
}

async function handleAiChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('ai-chat-input');
  const message = input.value.trim();
  if (!message) return;
  await sendAiChatMessage(message);
}

async function sendAiChatMessage(message) {
  const input = document.getElementById('ai-chat-input');
  const btn = document.getElementById('ai-chat-send-btn');
  if (!message) return;

  appendAiChatBubble(message, 'user');
  input.value = '';
  input.disabled = true;
  btn.disabled = true;
  btn.textContent = t('sending_btn');

  try {
    const res = await apiRequest('ai_advisor', {
      user_query: message,
      selected_month: currentYYYYMM(),
      currency_context: currency,
    });
    appendAiChatBubble(res.reply || '...', 'ai');

    if (res.intent === 'add_expense' && Array.isArray(res.expenses) && res.expenses.length) {
      // The backend already saved these rows directly to the DB, so just
      // refresh local state (expenses/income/etc.) from the server instead
      // of re-saving. We deliberately do NOT re-render the whole AI page
      // here, so the chat conversation stays visible; the refreshed
      // advice/rule cards show next time this page is opened.
      await loadData();
      showToast(t('toast_expense_added', { n: res.expenses.length }));
    }
  } catch (err) {
    appendAiChatBubble('⚠️ ' + (err.message || t('ai_error')), 'ai');
  } finally {
    input.disabled = false;
    btn.disabled = false;
    btn.textContent = t('send_btn');
    input.focus();
  }
}

/* ── 9e. FORECAST ── */
function renderForecast() {
  const forecast   = calcForecast(currentMonthExpenses(), incomeForMonth(currentYYYYMM()));
  const statusColor = { safe: '#68d391', warn: '#f6ad55', danger: '#fc8181' };
  const statusGrad  = {
    safe:   'linear-gradient(135deg,#11998e,#38ef7d)',
    warn:   'linear-gradient(135deg,#f7971e,#ffd200)',
    danger: 'linear-gradient(135deg,#f093fb,#f5576c)',
  };

  const forecastCards = forecast.map((f, i) => `
    <div class="forecast-card" style="--grad:${statusGrad[f.status]};">
      <div class="forecast-month">${f.label}</div>
      <div class="forecast-value" style="color:${statusColor[f.status]};">${formatYen(f.estimatedSavings)}</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">${t('est_savings')}</div>
      <div class="forecast-tag" style="background:${statusColor[f.status]}22;color:${statusColor[f.status]};">
        ${f.status === 'safe' ? t('status_on_track') : f.status === 'warn' ? t('status_watch') : t('status_at_risk')}
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">${t('forecast_title')}</div>
        <div class="page-subtitle">${t('forecast_subtitle')}</div>
      </div>
    </div>

    <div class="forecast-grid">${forecastCards}</div>

    <div class="glass-card" style="margin-bottom:1.25rem;">
      <div class="section-label">${t('projected_trend')}</div>
      <div class="chart-wrap" style="height:220px;">
        <canvas id="forecastChart" role="img" aria-label="Line chart of projected savings over 3 months">Balance forecast.</canvas>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">${t('prediction_basis')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">${t('current_month_spent')}</div>
          <div style="font-weight:700;">${formatYen(totalSpent(currentMonthExpenses()))}</div>
        </div>
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">${t('monthly_income_label2')}</div>
          <div style="font-weight:700;">${formatYen(incomeForMonth(currentYYYYMM()))}</div>
        </div>
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">${t('growth_assumption')}</div>
          <div style="font-weight:700;">${t('growth_value')}</div>
        </div>
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">${t('data_points')}</div>
          <div style="font-weight:700;">${expenses.length} ${t('transactions_word')}</div>
        </div>
      </div>
    </div>
  `;
}

function renderForecastChart() {
  destroyChart('forecast');
  const el = document.getElementById('forecastChart');
  if (!el) return;

  const cur      = currentMonthExpenses();
  const monthIncome = incomeForMonth(currentYYYYMM());
  const forecast = calcForecast(cur, monthIncome);
  const now      = new Date();
  const nowLabel = now.toLocaleDateString('en-US', { month: 'short' });
  const labels   = [nowLabel, ...forecast.map(f => f.label.split(' ')[0])];
  const data     = [Math.max(0, monthIncome - totalSpent(cur)), ...forecast.map(f => f.estimatedSavings)];

  chartInstances['forecast'] = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Projected Savings',
        data,
        borderColor: '#63b3ed',
        backgroundColor: 'rgba(99,179,237,0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: data.map(v => v >= monthIncome * 0.2 ? '#68d391' : '#f6ad55'),
        pointBorderColor: '#060b18',
        pointBorderWidth: 2,
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: darkGridScales(),
      plugins: { ...CHART_DEFAULTS.plugins, tooltip: { callbacks: { label: ctx => formatYen(ctx.parsed.y) } } },
    }
  });
}

/* ─────────────────────────────────────────────────────
   10. CRUD OPERATIONS
───────────────────────────────────────────────────── */

async function deleteExpense(id) {
  if (!confirm(t('confirm_delete_expense'))) return;
  expenses = expenses.filter(e => e.id !== id);
  if (!await saveData()) return;
  showToast(t('toast_expense_deleted'));
  navigateTo(currentPage);
}

function openEditModal(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  const cat = CAT_MAP[e.cat] || CAT_MAP['other'];

  const overlay = document.getElementById('edit-modal');
  overlay.classList.add('open');
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">${t('edit_expense_title')}</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">${t('expense_name')}</label>
          <input class="form-input" id="edit-name" value="${escHTML(e.name)}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('amount_label')}</label>
          <input class="form-input" id="edit-amount" type="number" value="${e.amount}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('date_label')}</label>
          <input class="form-input" id="edit-date" type="date" value="${e.date}" />
        </div>
        <div class="form-group">
          <label class="form-label">${t('note_label')}</label>
          <input class="form-input" id="edit-note" value="${escHTML(e.note || '')}" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom:1.25rem;">
        <label class="form-label">${t('category_label')}</label>
        <div class="cat-grid" id="edit-cat-grid">
          ${CATEGORIES.map(c => `
            <div class="cat-pill ${c.id === e.cat ? 'selected' : ''}" data-cat="${c.id}" onclick="editSelectCat('${c.id}')">
              <span>${c.emoji}</span>${catLabel(c.id)}
            </div>
          `).join('')}
        </div>
        <input type="hidden" id="edit-cat" value="${e.cat}" />
      </div>
      <label style="display:flex;align-items:center;gap:8px;margin-bottom:1.25rem;font-size:13px;color:var(--text-secondary);cursor:pointer;">
        <input type="checkbox" id="edit-recurring" style="width:16px;height:16px;accent-color:#667eea;" ${e.isRecurring ? 'checked' : ''} />
        ${t('recurring_label')}
      </label>
      <button class="btn-primary" onclick="saveEdit('${id}')">${t('save_changes_btn')}</button>
    </div>
  `;
}

function editSelectCat(id) {
  document.querySelectorAll('#edit-cat-grid .cat-pill').forEach(p => p.classList.remove('selected'));
  document.querySelector(`#edit-cat-grid .cat-pill[data-cat="${id}"]`)?.classList.add('selected');
  document.getElementById('edit-cat').value = id;
}

async function saveEdit(id) {
  const name   = document.getElementById('edit-name').value.trim();
  const amount = parseFloat(document.getElementById('edit-amount').value);
  const date   = document.getElementById('edit-date').value;
  const note   = document.getElementById('edit-note').value.trim();
  const cat    = document.getElementById('edit-cat').value;
  const isRecurring = document.getElementById('edit-recurring').checked;

  if (!name || !amount || !date || !cat) return showToast(t('toast_fill_fields'), true);

  const idx = expenses.findIndex(e => e.id === id);
  if (idx >= 0) {
    expenses[idx] = { ...expenses[idx], name, amount, date, note, cat, isRecurring };
    if (!await saveData()) return;
    showToast(t('toast_expense_updated'));
    closeModal();
    navigateTo(currentPage);
  }
}

function closeModal() {
  document.getElementById('edit-modal').classList.remove('open');
}

/* ─────────────────────────────────────────────────────
   11. ROUTING
───────────────────────────────────────────────────── */

let currentPage = 'dashboard';

const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  add:       renderAdd,
  analytics: renderAnalytics,
  ai:        renderAI,
  forecast:  renderForecast,
};

function navigateTo(page) {
  currentPage = page;

  // Update nav active state
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  // Render page
  const main = document.getElementById('main');
  main.innerHTML = PAGE_RENDERERS[page] ? PAGE_RENDERERS[page]() : '<p>Page not found</p>';

  // Trigger charts after DOM is ready
  requestAnimationFrame(() => {
    if (page === 'analytics') renderAnalyticsCharts();
    if (page === 'forecast')  renderForecastChart();
  });

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─────────────────────────────────────────────────────
   12. UI UTILITIES
───────────────────────────────────────────────────── */

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show' + (isError ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.classList.remove('show'); }, 3000);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/* Minimal, safe Markdown → HTML for AI Advisor replies. Escapes everything
   first (so the model can never inject raw HTML/script), then layers on
   just the handful of Markdown features the advisor prompt is asked to use:
   **bold**, "- " bullet lists, "---" rules, and simple "| a | b |" tables. */
function renderMarkdownLite(raw) {
  const lines = escHTML(raw || '').split(/\r?\n/);
  let html = '';
  let inList = false;
  let tableBuffer = [];

  const flushList = () => { if (inList) { html += '</ul>'; inList = false; } };
  const flushTable = () => {
    if (!tableBuffer.length) return;
    const rows = tableBuffer.filter(r => !/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(r));
    html += '<table class="md-table"><tbody>' + rows.map((r, i) => {
      const cells = r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${inlineMd(c)}</${tag}>`).join('')}</tr>`;
    }).join('') + '</tbody></table>';
    tableBuffer = [];
  };
  const inlineMd = s => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^\|.*\|$/.test(trimmed)) {
      flushList();
      tableBuffer.push(trimmed);
      return;
    }
    flushTable();

    if (/^---+$/.test(trimmed)) {
      flushList();
      html += '<hr class="md-hr" />';
    } else if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) { html += '<ul class="md-list">'; inList = true; }
      html += `<li>${inlineMd(trimmed.replace(/^[-*]\s+/, ''))}</li>`;
    } else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      html += `<p class="md-p">${inlineMd(trimmed)}</p>`;
    }
  });
  flushList();
  flushTable();
  return html;
}

function escHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─────────────────────────────────────────────────────
   13. LOGOUT
───────────────────────────────────────────────────── */

async function handleLogout() {
  if (confirm(t('logout_confirm'))) {
    try {
      await apiRequest('logout');
    } catch (e) {
      console.warn(e);
    }
    window.location.href = 'login.html';
  }
}

/* ─────────────────────────────────────────────────────
   14. INIT
───────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadData();
  } catch (err) {
    // Not logged in (or session expired) — send back to login page
    window.location.href = 'login.html';
    return;
  }

  // Insert modal root
  const modalDiv = document.createElement('div');
  modalDiv.className = 'modal-overlay';
  modalDiv.id = 'edit-modal';
  modalDiv.addEventListener('click', e => { if (e.target === modalDiv) closeModal(); });
  document.body.appendChild(modalDiv);

  // Nav click
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Hamburger (mobile)
  document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Boot
  navigateTo('dashboard');
});