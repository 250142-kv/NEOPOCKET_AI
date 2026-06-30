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
let income    = DEFAULT_INCOME;
let chartInstances = {};   // track Chart.js instances

/* ─────────────────────────────────────────────────────
   3. SERVER DATA
───────────────────────────────────────────────────── */

async function loadData() {
  const res = await apiRequest('get_data');
  currentUser = res.user || currentUser;
  expenses = Array.isArray(res.expenses) ? res.expenses : [];
  income = Number(res.income) || DEFAULT_INCOME;
  updateSidebarUser();
}

async function saveData() {
  try {
    const res = await apiRequest('save_data', { expenses, income });
    if (!res.success) throw new Error(res.error || 'Save failed');
    return true;
  } catch (e) {
    showToast('Failed to save data to server', true);
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

function totalSpent(list) {
  return list.reduce((s, e) => s + e.amount, 0);
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
  if (s >= 80) return 'Excellent';
  if (s >= 65) return 'Good';
  if (s >= 50) return 'Fair';
  return 'Needs Work';
}

function formatYen(n) {
  return '¥' + Math.round(n).toLocaleString();
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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

function currentMonthLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
      title: 'Food spending too high',
      text: `あなたのFood支出は今月の合計の ${foodPct}% を占めています。理想は30%以下です。自炊を増やすことで月 ¥${Math.round(catMap['food'] * 0.3).toLocaleString()} 節約できる可能性があります。`
    });
  } else if (foodPct > 30) {
    advice.push({
      type: 'warning',
      icon: '🍱',
      title: 'Food budget watch',
      text: `Food支出が ${foodPct}% です。少し高めですが、コンビニ利用を週2回減らすと月 ¥3,000〜5,000 の節約につながります。`
    });
  }

  /* Rule 2: Savings rate */
  if (savingsPct < 10) {
    advice.push({
      type: 'danger',
      icon: '💸',
      title: 'Very low savings rate',
      text: `今月の貯金率は ${savingsPct}% です。財務専門家は最低20%を推奨しています。大きな出費を見直し、サブスクを整理することをお勧めします。`
    });
  } else if (savingsPct < 20) {
    advice.push({
      type: 'warning',
      icon: '🪙',
      title: 'Savings below target',
      text: `貯金率 ${savingsPct}% — 目標の20%を下回っています。月 ¥${Math.round(inc * 0.05).toLocaleString()} を自動貯金に設定すると、年間で ¥${Math.round(inc * 0.05 * 12).toLocaleString()} 貯まります。`
    });
  } else {
    advice.push({
      type: 'success',
      icon: '🏆',
      title: 'Great savings rate!',
      text: `素晴らしい！貯金率 ${savingsPct}% は優秀です。このペースを維持すると、6ヶ月で ¥${Math.round(savings * 6).toLocaleString()} の貯金になります。`
    });
  }

  /* Rule 3: Entertainment */
  const entPct = Math.round((catMap['entertain'] / (spent || 1)) * 100);
  if (entPct > 15) {
    advice.push({
      type: 'warning',
      icon: '🎮',
      title: 'Entertainment spending high',
      text: `Entertainment費が ${entPct}% (${formatYen(catMap['entertain'])}) です。サブスクリプションを年払いに切り替えると最大20%の割引が受けられます。`
    });
  }

  /* Rule 4: Shopping */
  const shopPct = Math.round((catMap['shopping'] / (spent || 1)) * 100);
  if (shopPct > 25) {
    advice.push({
      type: 'warning',
      icon: '🛍️',
      title: 'Shopping over budget',
      text: `Shopping支出が ${formatYen(catMap['shopping'])} (${shopPct}%) です。購入前に24時間待つルールを試すと衝動買いが減ります。`
    });
  }

  /* Rule 5: Bills */
  if (catMap['bills'] > 0) {
    advice.push({
      type: 'info',
      icon: '⚡',
      title: 'Utility cost tip',
      text: `Bills費 ${formatYen(catMap['bills'])} — 電力会社の切り替えや省エネ設定で月 ¥1,000〜3,000 削減できる可能性があります。`
    });
  }

  /* Rule 6: General tip (always) */
  const tips = [
    '💡 収入の3〜6ヶ月分の緊急資金を確保することを目標にしましょう。',
    '📊 毎月の支出を3つの柱「必需品50%・ゴール20%・生活費30%」で管理するのがおすすめです。',
    '🔄 固定費（家賃・通信費・保険）は年1回見直すことで大幅な節約になります。',
    '📱 家計アプリでの定期的な支出レビューが資産形成の第一歩です。',
  ];
  advice.push({
    type: 'info',
    icon: '🤖',
    title: 'AI Financial tip',
    text: tips[new Date().getDate() % tips.length]
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
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
  const cur  = currentMonthExpenses();
  const prev = prevMonthExpenses();
  const spent     = totalSpent(cur);
  const prevSpent = totalSpent(prev);
  const savings   = Math.max(0, income - spent);
  const score     = calcScore(cur, income);
  const sColor    = scoreColor(score);
  const sLabel    = scoreLabel(score);
  const spentDiff = spent - prevSpent;
  const spentSign = spentDiff >= 0 ? '▲' : '▼';
  const circumference = 2 * Math.PI * 44;
  const dash = (score / 100) * circumference;

  // Recent 5 transactions
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const txRows = recent.length
    ? recent.map(e => txRowHTML(e)).join('')
    : `<div class="empty-state"><div class="icon">💳</div><p>No transactions yet</p></div>`;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-subtitle">Welcome back, ${currentUser.name} 👋</div>
      </div>
      <div class="date-badge">${currentMonthLabel()}</div>
    </div>

    <div class="metric-grid">
      <div class="metric-card" style="--grad: linear-gradient(135deg,#667eea,#764ba2);">
        <span class="metric-icon">💰</span>
        <div class="metric-label">Monthly Income</div>
        <div class="metric-value">${formatYen(income)}</div>
        <div class="metric-sub metric-neutral">Base salary</div>
      </div>
      <div class="metric-card" style="--grad: linear-gradient(135deg,#f093fb,#f5576c);">
        <span class="metric-icon">💸</span>
        <div class="metric-label">Total Spent</div>
        <div class="metric-value">${formatYen(spent)}</div>
        <div class="metric-sub ${spentDiff >= 0 ? 'metric-down' : 'metric-up'}">
          ${spentSign} ${formatYen(Math.abs(spentDiff))} vs last month
        </div>
      </div>
      <div class="metric-card" style="--grad: linear-gradient(135deg,#11998e,#38ef7d);">
        <span class="metric-icon">🏦</span>
        <div class="metric-label">Net Savings</div>
        <div class="metric-value">${formatYen(savings)}</div>
        <div class="metric-sub ${savings >= income * 0.2 ? 'metric-up' : 'metric-down'}">
          ${Math.round((savings / income) * 100)}% of income saved
        </div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="glass-card">
        <div class="section-label">Budget Progress</div>
        ${budgetProgressHTML(spent, income)}
      </div>
      <div class="glass-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;">
        <div class="section-label" style="align-self:flex-start;">Financial Health</div>
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
            ${score >= 70 ? 'Great job! Keep managing your spending.' : score >= 50 ? 'You can improve by reducing discretionary spending.' : 'Your expenses are very high this month.'}
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">Recent Transactions</div>
      <div class="tx-list">${txRows}</div>
    </div>
  `;
}

function budgetProgressHTML(spent, inc) {
  const pct = Math.min(Math.round((spent / inc) * 100), 100);
  const remaining = Math.max(0, inc - spent);
  const barColor = pct > 85 ? '#fc8181' : pct > 60 ? '#f6ad55' : '#68d391';
  return `
    <div style="margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:8px;">
        <span style="color:var(--text-secondary);">Spent: ${formatYen(spent)}</span>
        <span style="color:var(--text-secondary);">Budget: ${formatYen(inc)}</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,0.06);border-radius:5px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:5px;transition:width 0.6s ease;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;">
        <span style="color:${barColor};">${pct}% used</span>
        <span style="color:var(--text-secondary);">${formatYen(remaining)} remaining</span>
      </div>
    </div>
    ${CATEGORIES.map(c => {
      const cur = currentMonthExpenses();
      const catMap = groupByCategory(cur);
      const val = catMap[c.id] || 0;
      if (!val) return '';
      const catPct = Math.round((val / (totalSpent(cur) || 1)) * 100);
      return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="font-size:16px;width:22px;">${c.emoji}</span>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
              <span style="color:var(--text-secondary);">${c.label}</span>
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
        <div class="tx-name">${escHTML(e.name)}</div>
        <div class="tx-date">${formatDate(e.date)}${e.time ? ' · ' + formatTime(e.time) : ''}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount" style="color:var(--accent-red);">-${formatYen(e.amount)}</div>
        <span class="tx-cat c-${e.cat}">${cat.label}</span>
      </div>
      <div class="tx-actions">
        <button class="btn-icon" title="Edit" onclick="openEditModal('${e.id}')">✏️</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteExpense('${e.id}')">🗑️</button>
      </div>
    </div>
  `;
}

/* ── 9b. ADD EXPENSE ── */
function renderAdd() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">Add Expense</div>
        <div class="page-subtitle">Track a new expense</div>
      </div>
    </div>

    <div class="glass-card" style="max-width:640px;">
      <div class="section-label">Expense Details</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Expense Name</label>
          <input class="form-input" id="f-name" type="text" placeholder="e.g. Starbucks coffee" />
        </div>
        <div class="form-group">
          <label class="form-label">Amount (¥)</label>
          <input class="form-input" id="f-amount" type="number" min="1" placeholder="e.g. 1500" />
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input class="form-input" id="f-date" type="date" value="${todayStr()}" />
        </div>
        <div class="form-group">
          <label class="form-label">Note (optional)</label>
          <input class="form-input" id="f-note" type="text" placeholder="Any note..." />
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1.25rem;">
        <label class="form-label">Category</label>
        <div class="cat-grid" id="cat-grid">
          ${CATEGORIES.map(c => `
            <div class="cat-pill" data-cat="${c.id}" onclick="selectCat('${c.id}')">
              <span>${c.emoji}</span>${c.label}
            </div>
          `).join('')}
        </div>
        <input type="hidden" id="f-cat" value="" />
      </div>

      <button class="btn-primary" onclick="submitExpense()">
        ➕ Save Expense
      </button>
    </div>

    <div class="glass-card" style="max-width:640px;margin-top:1.25rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div class="section-label" style="margin:0;">Monthly Income</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:1rem;">
        <input class="form-input" id="income-input" type="number" value="${income}" style="max-width:220px;" />
        <button class="btn-secondary" onclick="updateIncome()">Update Income</button>
      </div>
    </div>
  `;
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

  if (!name)         return showToast('Please enter a name', true);
  if (!amount || amount <= 0) return showToast('Please enter a valid amount', true);
  if (!date)         return showToast('Please pick a date', true);
  if (!cat)          return showToast('Please select a category', true);

  expenses.push({ id: uid(), name, amount, date, note, cat, time: getLocalTimestamp() });
  if (!await saveData()) return;
  showToast('✅ Expense saved!');
  navigateTo('dashboard');
}

async function updateIncome() {
  const val = parseFloat(document.getElementById('income-input').value);
  if (!val || val <= 0) return showToast('Enter a valid income', true);
  income = val;
  if (!await saveData()) return;
  showToast('✅ Income updated!');
}

/* ── 9c. ANALYTICS ── */
function exportExpensesToExcel() {
  if (!expenses.length) {
    alert('No expenses to export yet.');
    return;
  }

  const rows = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => ({
      Date: e.date,
      Time: formatTime(e.time),
      Name: e.name,
      Category: CAT_MAP[e.cat] ? CAT_MAP[e.cat].label : e.cat,
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
  const cur   = currentMonthExpenses();
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
            <span class="legend-name">${c.emoji} ${c.label}</span>
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
        <div class="page-title">Analytics</div>
        <div class="page-subtitle">Spending breakdown & trends</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="date-badge">${currentMonthLabel()}</div>
        <button onclick="exportExpensesToExcel()" class="login-btn" style="width:auto;padding:8px 16px;font-size:13px;">⬇️ Export Excel</button>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="glass-card">
        <div class="section-label">Category Breakdown</div>
        <div class="chart-wrap" style="height:240px;">
          <canvas id="pieChart" role="img" aria-label="Pie chart of spending by category">Category spending breakdown.</canvas>
        </div>
      </div>
      <div class="glass-card" style="display:flex;flex-direction:column;justify-content:center;">
        <div class="section-label">Legend</div>
        <div class="legend-list">${legendHTML || '<p style="color:var(--text-muted);font-size:13px;">No data this month</p>'}</div>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">6-Month Trend</div>
      <div class="chart-wrap" style="height:220px;">
        <canvas id="trendChart" role="img" aria-label="Bar chart of monthly spending over 6 months">Monthly spending trend.</canvas>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">All Transactions</div>
      <div class="tx-list">
        ${[...expenses].sort((a,b) => new Date(b.date)-new Date(a.date)).map(e => txRowHTML(e)).join('')
          || '<div class="empty-state"><div class="icon">📋</div><p>No transactions yet</p></div>'}
      </div>
    </div>
  `;
}

function renderAnalyticsCharts() {
  // Pie
  const cur    = currentMonthExpenses();
  const catMap = groupByCategory(cur);
  const cats   = CATEGORIES.filter(c => catMap[c.id] > 0);

  destroyChart('pie');
  const pieEl = document.getElementById('pieChart');
  if (pieEl && cats.length) {
    chartInstances['pie'] = new Chart(pieEl, {
      type: 'doughnut',
      data: {
        labels: cats.map(c => c.label),
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

  // Trend bar (last 6 months)
  destroyChart('trend');
  const trendEl = document.getElementById('trendChart');
  if (trendEl) {
    const months = [];
    const now    = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
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
function renderAI() {
  const cur    = currentMonthExpenses();
  const advice = generateAdvice(cur, income);

  const adviceHTML = advice.map(a => `
    <div class="advice-item advice-${a.type}">
      <div class="advice-icon">${a.icon}</div>
      <div>
        <div class="advice-type">${a.type === 'danger' ? '⚠️ Alert' : a.type === 'warning' ? '⚡ Warning' : a.type === 'success' ? '✅ Great' : 'ℹ️ Tip'}</div>
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:5px;">${a.title}</div>
        <div class="advice-text">${a.text}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">AI Advisor</div>
        <div class="page-subtitle">Personalized financial advice</div>
      </div>
    </div>

    <div class="glass-card" style="margin-bottom:1.25rem;">
      <div class="ai-header">
        <div class="ai-avatar">🤖</div>
        <div>
          <div class="ai-title">NEOPOCKET AI Coach</div>
          <div class="ai-subtitle">Powered by smart spending analysis</div>
        </div>
      </div>
      <div style="padding:14px 16px;background:rgba(99,179,237,0.07);border:1px solid rgba(99,179,237,0.15);border-radius:10px;font-size:13px;color:var(--text-secondary);line-height:1.7;">
        今月の支出データを分析しました。${currentMonthExpenses().length}件の取引から、あなたへの最適なアドバイスを生成しました。
      </div>
    </div>

    <div class="advice-list">${adviceHTML}</div>
  `;
}

/* ── 9e. FORECAST ── */
function renderForecast() {
  const forecast   = calcForecast(currentMonthExpenses(), income);
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
      <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">est. savings</div>
      <div class="forecast-tag" style="background:${statusColor[f.status]}22;color:${statusColor[f.status]};">
        ${f.status === 'safe' ? '✅ On track' : f.status === 'warn' ? '⚠️ Watch' : '🚨 At risk'}
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Forecast</div>
        <div class="page-subtitle">Next 3-month balance prediction</div>
      </div>
    </div>

    <div class="forecast-grid">${forecastCards}</div>

    <div class="glass-card" style="margin-bottom:1.25rem;">
      <div class="section-label">Projected Balance Trend</div>
      <div class="chart-wrap" style="height:220px;">
        <canvas id="forecastChart" role="img" aria-label="Line chart of projected savings over 3 months">Balance forecast.</canvas>
      </div>
    </div>

    <div class="glass-card">
      <div class="section-label">Prediction Basis</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">Current month spent</div>
          <div style="font-weight:700;">${formatYen(totalSpent(currentMonthExpenses()))}</div>
        </div>
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">Monthly income</div>
          <div style="font-weight:700;">${formatYen(income)}</div>
        </div>
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">Growth assumption</div>
          <div style="font-weight:700;">+2% per month</div>
        </div>
        <div>
          <div style="color:var(--text-secondary);margin-bottom:4px;">Data points</div>
          <div style="font-weight:700;">${expenses.length} transactions</div>
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
  const forecast = calcForecast(cur, income);
  const now      = new Date();
  const nowLabel = now.toLocaleDateString('en-US', { month: 'short' });
  const labels   = [nowLabel, ...forecast.map(f => f.label.split(' ')[0])];
  const data     = [Math.max(0, income - totalSpent(cur)), ...forecast.map(f => f.estimatedSavings)];

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
        pointBackgroundColor: data.map(v => v >= income * 0.2 ? '#68d391' : '#f6ad55'),
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
  if (!confirm('Delete this expense?')) return;
  expenses = expenses.filter(e => e.id !== id);
  if (!await saveData()) return;
  showToast('🗑️ Expense deleted');
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
        <div class="modal-title">Edit Expense</div>
        <button class="modal-close" onclick="closeModal()">✕</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" id="edit-name" value="${escHTML(e.name)}" />
        </div>
        <div class="form-group">
          <label class="form-label">Amount (¥)</label>
          <input class="form-input" id="edit-amount" type="number" value="${e.amount}" />
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input class="form-input" id="edit-date" type="date" value="${e.date}" />
        </div>
        <div class="form-group">
          <label class="form-label">Note</label>
          <input class="form-input" id="edit-note" value="${escHTML(e.note || '')}" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom:1.25rem;">
        <label class="form-label">Category</label>
        <div class="cat-grid" id="edit-cat-grid">
          ${CATEGORIES.map(c => `
            <div class="cat-pill ${c.id === e.cat ? 'selected' : ''}" data-cat="${c.id}" onclick="editSelectCat('${c.id}')">
              <span>${c.emoji}</span>${c.label}
            </div>
          `).join('')}
        </div>
        <input type="hidden" id="edit-cat" value="${e.cat}" />
      </div>
      <button class="btn-primary" onclick="saveEdit('${id}')">💾 Save Changes</button>
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

  if (!name || !amount || !date || !cat) return showToast('Fill all fields', true);

  const idx = expenses.findIndex(e => e.id === id);
  if (idx >= 0) {
    expenses[idx] = { ...expenses[idx], name, amount, date, note, cat };
    if (!await saveData()) return;
    showToast('✅ Expense updated!');
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
  if (confirm('Log out of NEOPOCKET AI?')) {
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