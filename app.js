const STORAGE_KEY = "flowledger_web_v1";

const categories = ["Housing", "Utilities", "Insurance", "Transportation", "Food", "Entertainment", "Health", "Education", "Savings", "Debt", "Shopping", "Other"];
const catColors = { Housing: "#61e6bd", Utilities: "#f4be5b", Insurance: "#a695ff", Transportation: "#f27eb2", Food: "#f08a5d", Entertainment: "#b883ff", Health: "#ff7a7a", Education: "#6ca8ff", Savings: "#64dca6", Debt: "#ff7185", Shopping: "#d7a2ff", Other: "#95aaa3" };
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortMonths = monthNames.map((m) => m.slice(0, 3));

const seed = {
  bills: [
    { id: "b1", name: "Rent", amount: 1200, category: "Housing", dueDay: 1, recurring: true, frequency: "monthly", debt: false, balance: 0, apr: 0 },
    { id: "b2", name: "Electric", amount: 95, category: "Utilities", dueDay: 10, recurring: true, frequency: "monthly", debt: false, balance: 0, apr: 0 },
    { id: "b3", name: "Internet", amount: 60, category: "Utilities", dueDay: 15, recurring: true, frequency: "monthly", debt: false, balance: 0, apr: 0 },
    { id: "b4", name: "Car loan", amount: 350, category: "Debt", dueDay: 20, recurring: true, frequency: "monthly", debt: true, balance: 4200, apr: 6.5 },
    { id: "b5", name: "Credit card", amount: 120, category: "Debt", dueDay: 25, recurring: true, frequency: "monthly", debt: true, balance: 1850, apr: 22.9 },
    { id: "b6", name: "Medical bill", amount: 75, category: "Debt", dueDay: 5, recurring: true, frequency: "monthly", debt: true, balance: 650, apr: 0 },
    { id: "b7", name: "Groceries", amount: 100, category: "Food", dueDay: 6, recurring: true, frequency: "weekly", debt: false, balance: 0, apr: 0 },
    { id: "b8", name: "Car insurance", amount: 180, category: "Insurance", dueDay: 8, recurring: true, frequency: "monthly", debt: false, balance: 0, apr: 0 }
  ],
  incomes: [{ id: "i1", name: "Primary job", amount: 4500, frequency: "monthly", payDay: 1 }],
  goals: [{ id: "g1", name: "Emergency fund", target: 6000, current: 1850, date: `${new Date().getFullYear() + 1}-03-01` }],
  transactions: [],
  payments: {},
  settings: { method: "snowball", carryover: true, startingBalance: 850, startingDate: new Date().toISOString().slice(0, 10), theme: "dark" },
  categories
};

let state = loadState();
let ui = { page: "dashboard", month: new Date().getMonth(), year: new Date().getFullYear(), billFilter: "all", search: "" };

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...clone(seed), ...saved, settings: { ...seed.settings, ...saved.settings } } : clone(seed);
  } catch { return clone(seed); }
}
function saveState(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) toast(message);
}
function id(prefix) { return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }
function money(value, decimals = 0) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: decimals }).format(Number(value) || 0); }
function esc(value = "") { return String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
function key(billId, month = ui.month, year = ui.year) { return `${year}-${month}-${billId}`; }
function occurrences(bill, month = ui.month, year = ui.year) {
  if (!bill.recurring) return 1;
  if (bill.frequency !== "weekly") return 1;
  const days = new Date(year, month + 1, 0).getDate();
  return Math.ceil(Math.max(0, days - bill.dueDay + 1) / 7);
}
function billTotal(bill, month = ui.month, year = ui.year) { return bill.amount * occurrences(bill, month, year); }
function paid(bill, month = ui.month, year = ui.year) { return Number(state.payments[key(bill.id, month, year)] || 0); }
function monthlyIncome(month = ui.month, year = ui.year) {
  return state.incomes.reduce((sum, income) => sum + income.amount * (income.frequency === "weekly" ? 4.33 : income.frequency === "biweekly" ? 2.17 : 1), 0);
}
function monthBillsTotal(month = ui.month, year = ui.year) { return state.bills.reduce((sum, bill) => sum + billTotal(bill, month, year), 0); }
function monthTransactions(month = ui.month, year = ui.year) {
  return state.transactions.filter((t) => { const d = new Date(`${t.date}T00:00:00`); return d.getMonth() === month && d.getFullYear() === year; });
}
function cashFlow(month = ui.month, year = ui.year) {
  const income = monthlyIncome(month, year);
  const bills = monthBillsTotal(month, year);
  const transactions = monthTransactions(month, year).reduce((sum, t) => sum + Number(t.amount), 0);
  return { income, bills, transactions, remaining: income - bills + transactions };
}
function icon(name) {
  const paths = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    bills: '<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    debt: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H3v-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.1A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 21 10h.1v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.more}</svg>`;
}

function navButton(page, label) { return `<button class="nav-btn ${ui.page === page ? "active" : ""}" data-page="${page}">${icon(page)}<span>${label}</span></button>`; }
function mobileNav(page, label) { return `<button class="mobile-nav ${ui.page === page ? "active" : ""}" data-page="${page}">${icon(page)}<span>${label}</span></button>`; }

function layout(content) {
  const titles = { dashboard: "Overview", bills: "Bill manager", calendar: "Monthly plan", debt: "Debt payoff", settings: "Settings" };
  return `<div class="shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">${icon("arrow")}</div><div><div class="brand-name">FlowLedger</div><div class="brand-tag">Money, made visible.</div></div></div>
      <nav class="nav">${navButton("dashboard", "Dashboard")}${navButton("bills", "Bills")}${navButton("calendar", "Monthly")}${navButton("debt", "Debt plan")}${navButton("settings", "Settings")}</nav>
      <div class="sidebar-foot"><div class="privacy-note"><strong>Private by design</strong>Your data is stored only in this browser. Export a backup before switching devices.</div></div>
    </aside>
    <main class="main"><header class="topbar"><div class="topbar-title">${titles[ui.page]}</div><div class="top-actions"><button class="btn icon-btn ghost" data-action="theme" aria-label="Toggle theme">${icon(state.settings.theme === "dark" ? "sun" : "moon")}</button><button class="btn primary" data-action="quick-add">${icon("plus")}<span>Add bill</span></button></div></header><div class="content">${content}</div></main>
    <nav class="mobile-bar">${mobileNav("dashboard", "Home")}${mobileNav("bills", "Bills")}${mobileNav("calendar", "Monthly")}${mobileNav("debt", "Debt")}${mobileNav("settings", "More")}</nav>
  </div>`;
}

function pageHead(eyebrow, title, lead, action = "") { return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="lead">${lead}</p></div>${action}</div>`; }

function statCard(label, value, meta, tone, glyph) {
  return `<article class="stat-card" style="--tone:${tone}"><div class="stat-icon">${glyph}</div><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-meta">${meta}</div></article>`;
}

function render() {
  document.documentElement.dataset.theme = state.settings.theme;
  const pages = { dashboard: dashboardView, bills: billsView, calendar: calendarView, debt: debtView, settings: settingsView };
  document.querySelector("#app").innerHTML = layout((pages[ui.page] || dashboardView)());
}

function dashboardView() {
  const flow = cashFlow();
  const total = monthBillsTotal();
  const totalPaid = state.bills.reduce((sum, bill) => sum + Math.min(paid(bill), billTotal(bill)), 0);
  const debts = state.bills.filter((bill) => bill.debt);
  const debtTotal = debts.reduce((sum, bill) => sum + bill.balance, 0);
  const paidCount = state.bills.filter((bill) => paid(bill) >= billTotal(bill)).length;
  const today = new Date().getDate();
  const upcoming = state.bills.filter((bill) => bill.dueDay >= today && bill.dueDay <= today + 7).sort((a, b) => a.dueDay - b.dueDay).slice(0, 5);
  const monthTotals = shortMonths.map((_, month) => monthBillsTotal(month, ui.year));
  const maxMonth = Math.max(...monthTotals, 1);
  const catMap = {};
  state.bills.forEach((bill) => { catMap[bill.category] = (catMap[bill.category] || 0) + billTotal(bill); });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  let degree = 0;
  const gradient = catEntries.map(([cat, value]) => { const start = degree; degree += (value / Math.max(total, 1)) * 360; return `${catColors[cat] || catColors.Other} ${start}deg ${degree}deg`; }).join(",");
  const progress = total ? Math.min(100, totalPaid / total * 100) : 0;

  return `${pageHead("Your financial command center", `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.`, `${monthNames[ui.month]} ${ui.year} at a glance â€” what came in, what is committed, and what remains.`)}
    <section class="grid stats">
      ${statCard("Monthly bills", money(total), `${state.bills.length} active bills`, "var(--primary)", icon("bills"))}
      ${statCard("Paid so far", money(totalPaid), `${paidCount} of ${state.bills.length} complete`, "var(--success)", "âœ“")}
      ${statCard("Available cash", money(flow.remaining), `${money(flow.income)} income`, flow.remaining >= 0 ? "var(--accent)" : "var(--danger)", "â†—")}
      ${statCard("Total debt", money(debtTotal), `${debts.length} open accounts`, "var(--danger)", icon("debt"))}
    </section>
    <section class="grid dashboard-grid">
      <div class="stack">
        <article class="card cash-hero"><div class="cash-row"><div><div class="eyebrow">Expected month end</div><div class="big-money ${flow.remaining >= 0 ? "money-positive" : "money-negative"}">${money(flow.remaining)}</div><div class="muted small">after planned bills and recorded transactions</div></div><button class="btn" data-page="calendar">Open monthly plan ${icon("arrow")}</button></div><div class="cash-breakdown"><div class="cash-item"><span>Income</span><strong>${money(flow.income)}</strong></div><div class="cash-item"><span>Committed</span><strong>${money(flow.bills)}</strong></div><div class="cash-item"><span>Transactions</span><strong>${flow.transactions >= 0 ? "+" : ""}${money(flow.transactions)}</strong></div></div></article>
        <article class="card"><div class="card-head"><div><h2>Yearly bill rhythm</h2><div class="muted small">Projected recurring expenses in ${ui.year}</div></div></div><div class="bars">${monthTotals.map((value, i) => `<div class="bar-wrap" title="${shortMonths[i]}: ${money(value)}"><div class="bar" style="height:${Math.max(3, value / maxMonth * 100)}%"></div><div class="bar-label">${shortMonths[i]}</div></div>`).join("")}</div></article>
        <article class="card"><div class="card-head"><div><h2>Monthly progress</h2><div class="muted small">Payments recorded against planned bills</div></div><strong>${Math.round(progress)}%</strong></div><div class="split-meta"><span>${money(totalPaid)} paid</span><span>${money(Math.max(0, total - totalPaid))} remaining</span></div><div class="progress"><span style="width:${progress}%"></span></div></article>
      </div>
      <div class="stack">
        <article class="card"><div class="card-head"><div><h2>Spending mix</h2><div class="muted small">Planned bills by category</div></div></div><div class="donut-wrap"><div class="donut" style="background:conic-gradient(${gradient || "var(--panel-2) 0 360deg"})"></div><div class="legend">${catEntries.slice(0, 6).map(([cat, value]) => `<div class="legend-row"><i class="legend-dot" style="background:${catColors[cat] || catColors.Other}"></i><span>${esc(cat)}</span><strong>${money(value)}</strong></div>`).join("")}</div></div></article>
        <article class="card"><div class="card-head"><div><h2>Coming up</h2><div class="muted small">Bills due in the next seven days</div></div><button class="btn ghost" data-page="bills">View all</button></div>${upcoming.length ? `<div class="bill-list">${upcoming.map((bill) => compactBill(bill)).join("")}</div>` : `<div class="empty-state"><div class="empty-icon">âœ“</div><strong>No bills due soon</strong><p class="small">A quiet week. Enjoy it.</p></div>`}</article>
        <article class="card"><div class="card-head"><div><h2>Savings goals</h2><div class="muted small">Make the future less abstract</div></div><button class="btn ghost" data-action="add-goal">${icon("plus")} Add</button></div>${state.goals.length ? state.goals.map(goalRow).join("") : `<div class="empty-state"><p>No goals yet.</p></div>`}</article>
      </div>
    </section>`;
}

function compactBill(bill) {
  const isPaid = paid(bill) >= billTotal(bill);
  return `<div class="bill-row" style="grid-template-columns:40px 1fr auto"><div class="bill-icon" style="--cat:${catColors[bill.category] || catColors.Other}">${esc(bill.name.slice(0, 1))}</div><div><div class="bill-name">${esc(bill.name)}</div><div class="bill-sub">Due day ${bill.dueDay} Â· ${esc(bill.category)}</div></div><div><div class="bill-amount">${money(billTotal(bill))}</div><span class="status ${isPaid ? "paid" : "due"}">${isPaid ? "Paid" : "Upcoming"}</span></div></div>`;
}

function goalRow(goal) {
  const pct = Math.min(100, goal.current / Math.max(1, goal.target) * 100);
  return `<button class="setting-row" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;text-align:left;cursor:pointer" data-action="edit-goal" data-id="${goal.id}"><div style="flex:1"><div class="setting-title">${esc(goal.name)}</div><div class="setting-desc">${money(goal.current)} of ${money(goal.target)} Â· ${Math.round(pct)}%</div><div class="progress" style="margin-top:9px"><span style="width:${pct}%;background:var(--purple)"></span></div></div><strong>${money(goal.target - goal.current)} left</strong></button>`;
}

function billsView() {
  const filtered = state.bills.filter((bill) => {
    const filterMatch = ui.billFilter === "all" || (ui.billFilter === "recurring" && bill.recurring) || (ui.billFilter === "once" && !bill.recurring);
    const searchMatch = `${bill.name} ${bill.category}`.toLowerCase().includes(ui.search.toLowerCase());
    return filterMatch && searchMatch;
  });
  return `${pageHead("Your commitments", "Bills", "Keep recurring expenses, one-time payments, and due dates in one calm, searchable place.", `<button class="btn primary" data-action="add-bill">${icon("plus")} Add bill</button>`)}
    <div class="toolbar"><div class="tabs">${[["all","All"],["recurring","Recurring"],["once","One-time"]].map(([value,label]) => `<button class="tab ${ui.billFilter === value ? "active" : ""}" data-filter="${value}">${label}</button>`).join("")}</div><input class="field" style="max-width:280px" data-search placeholder="Search billsâ€¦" value="${esc(ui.search)}" /></div>
    <article class="card"><div class="card-head"><div><h2>${filtered.length} ${filtered.length === 1 ? "bill" : "bills"}</h2><div class="muted small">${money(filtered.reduce((sum, bill) => sum + billTotal(bill), 0))} planned this month</div></div></div>${filtered.length ? `<div class="bill-list">${filtered.map(billRow).join("")}</div>` : `<div class="empty-state"><div class="empty-icon">${icon("bills")}</div><h3>No matching bills</h3><p>Adjust your search or add a new bill.</p></div>`}</article>`;
}

function billRow(bill) {
  const total = billTotal(bill);
  const amountPaid = paid(bill);
  const isPaid = amountPaid >= total;
  return `<div class="bill-row"><div class="bill-icon" style="--cat:${catColors[bill.category] || catColors.Other}">${esc(bill.name.slice(0, 1))}</div><div><div class="bill-name">${esc(bill.name)}</div><div class="bill-sub">${esc(bill.category)} Â· ${bill.frequency === "weekly" ? `weekly from day ${bill.dueDay}` : `due day ${bill.dueDay}`}</div></div><span class="status ${bill.debt ? "debt" : isPaid ? "paid" : "due"}">${bill.debt ? "Debt" : isPaid ? "Paid" : "Due"}</span><div class="muted small">${bill.recurring ? "Recurring" : "One-time"}</div><div class="bill-amount">${money(total)}</div><button class="btn icon-btn ghost" data-action="edit-bill" data-id="${bill.id}" aria-label="Edit ${esc(bill.name)}">${icon("more")}</button></div>`;
}

function calendarView() {
  const total = monthBillsTotal();
  const totalPaid = state.bills.reduce((sum, bill) => sum + Math.min(paid(bill), billTotal(bill)), 0);
  const flow = cashFlow();
  const first = new Date(ui.year, ui.month, 1).getDay();
  const days = new Date(ui.year, ui.month + 1, 0).getDate();
  let running = state.settings.startingBalance || 0;
  const cells = Array.from({ length: first }, () => `<div class="day empty"></div>`);
  for (let day = 1; day <= days; day++) {
    const dayBills = state.bills.filter((bill) => bill.frequency === "weekly" ? day >= bill.dueDay && (day - bill.dueDay) % 7 === 0 : bill.dueDay === day);
    const income = state.incomes.filter((item) => (item.payDay || 1) === day).reduce((sum, item) => sum + item.amount, 0);
    const tx = monthTransactions().filter((item) => Number(item.date.slice(8, 10)) === day).reduce((sum, item) => sum + Number(item.amount), 0);
    const outgoing = dayBills.reduce((sum, bill) => sum + bill.amount, 0);
    running += income + tx - outgoing;
    cells.push(`<div class="day"><div class="day-num">${day}</div><div class="day-events">${income ? `<i class="event-dot" style="background:var(--success)" title="Income"></i>` : ""}${outgoing ? `<i class="event-dot" style="background:var(--accent)" title="Bills"></i>` : ""}${tx ? `<i class="event-dot" style="background:var(--purple)" title="Transaction"></i>` : ""}</div><div class="day-balance ${running < 0 ? "money-negative" : ""}">${money(running)}</div></div>`);
  }
  return `${pageHead("Plan the month", "Monthly view", "Record payments and see how income, bills, and transactions move your daily running balance.", `<button class="btn" data-action="add-transaction">${icon("plus")} Transaction</button>`)}
    <div class="toolbar"><div class="tabs"><button class="tab" data-ac…774 tokens truncated…erest exposure", "var(--purple)", "%")}${statCard("Est. runway", minimums ? `${Math.ceil(total / minimums)} mo` : "â€”", "before interest", "var(--primary)", "âŒ")}</section>
    <div class="toolbar"><div class="tabs"><button class="tab ${state.settings.method === "snowball" ? "active" : ""}" data-method="snowball">Snowball</button><button class="tab ${state.settings.method === "avalanche" ? "active" : ""}" data-method="avalanche">Avalanche</button></div></div>
    ${sorted.length ? `<section class="grid debt-grid">${sorted.map((bill, index) => { const original = seed.bills.find((b) => b.id === bill.id)?.balance || bill.balance; const pct = Math.max(0, Math.min(100, (1 - bill.balance / Math.max(original, bill.balance)) * 100)); return `<article class="card debt-card"><div class="debt-rank">Priority ${index + 1}</div><h2 style="margin:8px 0 0">${esc(bill.name)}</h2><div class="balance">${money(bill.balance)}</div><div class="muted small">remaining balance</div><div class="debt-details"><span>${bill.apr}% APR</span><span>${money(bill.amount)}/mo</span></div><div class="progress"><span style="width:${pct}%;background:var(--danger)"></span></div><button class="btn ghost" style="width:100%;margin-top:16px" data-action="edit-bill" data-id="${bill.id}">Edit account</button></article>`; }).join("")}</section>` : `<article class="card empty-state"><div class="empty-icon">âœ“</div><h2>Debt free</h2><p>No open debt accounts. That is a very good empty state.</p></article>`}`;
}

function settingsView() {
  const totalMonthly = monthlyIncome();
  return `${pageHead("Make it yours", "Settings", "Tune the plan, manage income and categories, or move your data safely between devices.")}
    <section class="grid settings-grid"><div class="stack">
      <article class="card"><div class="card-head"><div><h2>Income sources</h2><div class="muted small">${money(totalMonthly)} estimated monthly</div></div><button class="btn ghost" data-action="add-income">${icon("plus")} Add</button></div>${state.incomes.map((income) => `<button class="setting-row" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;text-align:left;cursor:pointer" data-action="edit-income" data-id="${income.id}"><div><div class="setting-title">${esc(income.name)}</div><div class="setting-desc">${esc(income.frequency)} Â· paid day ${income.payDay || 1}</div></div><strong class="money-positive">${money(income.amount)}</strong></button>`).join("")}</article>
      <article class="card"><div class="card-head"><div><h2>Debt strategy</h2><div class="muted small">Choose how extra money is assigned</div></div></div><div class="tabs"><button class="tab ${state.settings.method === "snowball" ? "active" : ""}" data-method="snowball">Snowball</button><button class="tab ${state.settings.method === "avalanche" ? "active" : ""}" data-method="avalanche">Avalanche</button></div><p class="setting-desc" style="margin-top:14px">${state.settings.method === "snowball" ? "Smallest balances first for faster psychological wins." : "Highest interest rates first to minimize total interest."}</p></article>
      <article class="card"><div class="card-head"><div><h2>Categories</h2><div class="muted small">Used to group planned spending</div></div></div><div class="chip-list">${state.categories.map((cat) => `<span class="chip">${esc(cat)}</span>`).join("")}</div><button class="btn ghost" style="margin-top:16px" data-action="add-category">${icon("plus")} Add category</button></article>
    </div><div class="stack">
      <article class="card"><div class="card-head"><div><h2>Balance behavior</h2><div class="muted small">Seed the daily projection</div></div></div><div class="setting-row"><div><div class="setting-title">Carry balances forward</div><div class="setting-desc">Use the prior month ending balance</div></div><button class="switch ${state.settings.carryover ? "on" : ""}" data-action="carryover" aria-label="Toggle carryover"><span></span></button></div><div class="form-grid" style="margin-top:16px"><div class="field-group"><label>Starting balance</label><input class="field" data-setting="startingBalance" type="number" step="0.01" value="${state.settings.startingBalance}" /></div><div class="field-group"><label>As of date</label><input class="field" data-setting="startingDate" type="date" value="${state.settings.startingDate || ""}" /></div></div></article>
      <article class="card"><div class="card-head"><div><h2>Your data</h2><div class="muted small">Local, portable, and under your control</div></div>${icon("shield")}</div><div class="setting-row"><div><div class="setting-title">Export backup</div><div class="setting-desc">Download all FlowLedger data as JSON</div></div><button class="btn" data-action="export">${icon("download")} Export</button></div><div class="setting-row"><div><div class="setting-title">Restore backup</div><div class="setting-desc">Import a previous FlowLedger JSON file</div></div><button class="btn" data-action="import">${icon("upload")} Import</button></div><div class="setting-row"><div><div class="setting-title">Export bills CSV</div><div class="setting-desc">Spreadsheet-friendly bill list</div></div><button class="btn" data-action="export-csv">CSV</button></div><input type="file" id="backup-input" accept="application/json" hidden /></article>
      <article class="card"><div class="card-head"><div><h2>Fresh start</h2><div class="muted small">Restore the sample data</div></div></div><button class="btn danger" data-action="reset">Reset FlowLedger</button></article>
    </div></section>`;
}

function modal(title, body, submitLabel, formId, destructive = "") {
  document.querySelector("#modal-root").innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="event.stopPropagation()"><div class="modal-head"><h2 id="modal-title">${title}</h2><button class="btn icon-btn ghost" data-action="close-modal" aria-label="Close">${icon("close")}</button></div><form id="${formId}">${body}<div class="modal-actions">${destructive}<button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn primary" type="submit">${submitLabel}</button></div></form></section></div>`;
  document.querySelector(".modal input")?.focus();
}
function closeModal() { document.querySelector("#modal-root").innerHTML = ""; }
function formValue(form, name) { return new FormData(form).get(name)?.toString().trim() || ""; }

function billModal(existing) {
  const bill = existing || { name: "", amount: "", category: state.categories[0], dueDay: 1, recurring: true, frequency: "monthly", debt: false, balance: 0, apr: 0 };
  modal(existing ? "Edit bill" : "Add a bill", `<div class="form-grid">
    <div class="field-group full"><label>Bill name</label><input class="field" name="name" required value="${esc(bill.name)}" placeholder="e.g. Internet" /></div>
    <div class="field-group"><label>Amount</label><input class="field" name="amount" type="number" min="0" step="0.01" required value="${bill.amount}" /></div>
    <div class="field-group"><label>Category</label><select name="category">${state.categories.map((cat) => `<option ${cat === bill.category ? "selected" : ""}>${esc(cat)}</option>`).join("")}</select></div>
    <div class="field-group"><label>Due day / first weekly day</label><input class="field" name="dueDay" type="number" min="1" max="31" required value="${bill.dueDay}" /></div>
    <div class="field-group"><label>Frequency</label><select name="frequency"><option value="monthly" ${bill.frequency === "monthly" ? "selected" : ""}>Monthly</option><option value="weekly" ${bill.frequency === "weekly" ? "selected" : ""}>Weekly</option><option value="once" ${!bill.recurring ? "selected" : ""}>One-time</option></select></div>
    <div class="field-group"><label>Account type</label><select name="debt"><option value="false" ${!bill.debt ? "selected" : ""}>Regular bill</option><option value="true" ${bill.debt ? "selected" : ""}>Debt</option></select></div>
    <div class="field-group"><label>Debt balance</label><input class="field" name="balance" type="number" min="0" step="0.01" value="${bill.balance || 0}" /></div>
    <div class="field-group"><label>APR %</label><input class="field" name="apr" type="number" min="0" step="0.1" value="${bill.apr || 0}" /></div>
  </div>`, existing ? "Save changes" : "Add bill", "bill-form", existing ? `<button type="button" class="btn danger" data-action="delete-bill" data-id="${existing.id}">Delete</button>` : "");
  document.querySelector("#bill-form").dataset.id = existing?.id || "";
}

function incomeModal(existing) {
  const income = existing || { name: "", amount: "", frequency: "monthly", payDay: 1 };
  modal(existing ? "Edit income" : "Add income", `<div class="form-grid"><div class="field-group full"><label>Source name</label><input class="field" name="name" required value="${esc(income.name)}" placeholder="e.g. Primary job" /></div><div class="field-group"><label>Amount per payment</label><input class="field" name="amount" type="number" min="0" step="0.01" required value="${income.amount}" /></div><div class="field-group"><label>Frequency</label><select name="frequency"><option ${income.frequency === "monthly" ? "selected" : ""}>monthly</option><option ${income.frequency === "biweekly" ? "selected" : ""}>biweekly</option><option ${income.frequency === "weekly" ? "selected" : ""}>weekly</option></select></div><div class="field-group"><label>Next / monthly pay day</label><input class="field" name="payDay" type="number" min="1" max="31" value="${income.payDay || 1}" /></div></div>`, existing ? "Save changes" : "Add income", "income-form", existing ? `<button type="button" class="btn danger" data-action="delete-income" data-id="${existing.id}">Delete</button>` : "");
  document.querySelector("#income-form").dataset.id = existing?.id || "";
}

function goalModal(existing) {
  const goal = existing || { name: "", target: "", current: 0, date: `${new Date().getFullYear() + 1}-01-01` };
  modal(existing ? "Edit savings goal" : "Add savings goal", `<div class="form-grid"><div class="field-group full"><label>Goal name</label><input class="field" name="name" required value="${esc(goal.name)}" placeholder="e.g. Emergency fund" /></div><div class="field-group"><label>Target amount</label><input class="field" name="target" type="number" min="1" step="0.01" required value="${goal.target}" /></div><div class="field-group"><label>Saved so far</label><input class="field" name="current" type="number" min="0" step="0.01" value="${goal.current}" /></div><div class="field-group full"><label>Target date</label><input class="field" name="date" type="date" required value="${goal.date}" /></div></div>`, existing ? "Save goal" : "Add goal", "goal-form", existing ? `<button type="button" class="btn danger" data-action="delete-goal" data-id="${existing.id}">Delete</button>` : "");
  document.querySelector("#goal-form").dataset.id = existing?.id || "";
}

function transactionModal() {
  modal("Add a transaction", `<div class="form-grid"><div class="field-group"><label>Date</label><input class="field" name="date" type="date" required value="${ui.year}-${String(ui.month + 1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}" /></div><div class="field-group"><label>Amount</label><input class="field" name="amount" type="number" step="0.01" required placeholder="Use - for expenses" /></div><div class="field-group"><label>Category</label><select name="category">${state.categories.map((cat) => `<option>${esc(cat)}</option>`).join("")}</select></div><div class="field-group"><label>Note</label><input class="field" name="note" placeholder="What was this for?" /></div></div>`, "Add transaction", "transaction-form");
}

function extraPaymentModal() {
  const debts = state.bills.filter((bill) => bill.debt && bill.balance > 0).sort(state.settings.method === "snowball" ? (a,b) => a.balance-b.balance : (a,b) => b.apr-a.apr);
  modal("Plan an extra payment", `<div class="field-group"><label>Extra amount</label><input class="field" name="amount" type="number" min="1" step="0.01" required placeholder="250" /></div><div style="margin-top:18px"><div class="setting-title">Current ${state.settings.method} order</div>${debts.map((bill, i) => `<div class="setting-row"><span>${i+1}. ${esc(bill.name)}</span><strong>${money(bill.balance)}</strong></div>`).join("")}</div>`, "Apply payment", "extra-form");
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.querySelector("#toast-root").append(node);
  setTimeout(() => node.remove(), 2600);
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button,[data-action],[data-page]");
  if (!target) return;
  const page = target.dataset.page;
  if (page) { ui.page = page; render(); window.scrollTo({ top: 0 }); return; }
  if (target.dataset.filter) { ui.billFilter = target.dataset.filter; render(); return; }
  if (target.dataset.method) { state.settings.method = target.dataset.method; saveState("Payoff strategy updated"); render(); return; }
  const action = target.dataset.action;
  if (!action) return;
  const existingBill = state.bills.find((bill) => bill.id === target.dataset.id);
  if (action === "theme") { state.settings.theme = state.settings.theme === "dark" ? "light" : "dark"; saveState(); render(); }
  if (action === "quick-add" || action === "add-bill") billModal();
  if (action === "edit-bill") billModal(existingBill);
  if (action === "close-modal") closeModal();
  if (action === "delete-bill") { state.bills = state.bills.filter((bill) => bill.id !== target.dataset.id); saveState("Bill deleted"); closeModal(); render(); }
  if (action === "pay-full" && existingBill) { state.payments[key(existingBill.id)] = billTotal(existingBill); saveState("Bill marked paid"); render(); }
  if (action === "prev-month" || action === "next-month") { const delta = action === "next-month" ? 1 : -1; const date = new Date(ui.year, ui.month + delta, 1); ui.month = date.getMonth(); ui.year = date.getFullYear(); render(); }
  if (action === "add-income") incomeModal();
  if (action === "edit-income") incomeModal(state.incomes.find((item) => item.id === target.dataset.id));
  if (action === "delete-income") { state.incomes = state.incomes.filter((item) => item.id !== target.dataset.id); saveState("Income source deleted"); closeModal(); render(); }
  if (action === "add-goal") goalModal();
  if (action === "edit-goal") goalModal(state.goals.find((item) => item.id === target.dataset.id));
  if (action === "delete-goal") { state.goals = state.goals.filter((item) => item.id !== target.dataset.id); saveState("Goal deleted"); closeModal(); render(); }
  if (action === "add-transaction") transactionModal();
  if (action === "extra-payment") extraPaymentModal();
  if (action === "carryover") { state.settings.carryover = !state.settings.carryover; saveState("Balance behavior updated"); render(); }
  if (action === "add-category") { const value = prompt("New category name"); if (value?.trim() && !state.categories.includes(value.trim())) { state.categories.push(value.trim()); saveState("Category added"); render(); } }
  if (action === "export") download(`flowledger-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(state, null, 2), "application/json");
  if (action === "import") document.querySelector("#backup-input")?.click();
  if (action === "export-csv") { const rows = [["Name","Amount","Category","Due Day","Frequency","Debt","Balance","APR"], ...state.bills.map((b) => [b.name,b.amount,b.category,b.dueDay,b.frequency,b.debt,b.balance,b.apr])]; download("flowledger-bills.csv", rows.map((r) => r.map((v) => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n"), "text/csv"); }
  if (action === "reset" && confirm("Reset FlowLedger to the sample data? This cannot be undone unless you exported a backup.")) { state = clone(seed); saveState("FlowLedger reset"); render(); }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target.matches("[data-search]")) { ui.search = target.value; render(); document.querySelector("[data-search]")?.focus(); }
  if (target.matches("[data-payment]")) { state.payments[key(target.dataset.payment)] = Number(target.value) || 0; saveState(); }
});

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (target.matches("[data-setting]")) { state.settings[target.dataset.setting] = target.type === "number" ? Number(target.value) : target.value; saveState("Starting balance updated"); }
  if (target.id === "backup-input" && target.files?.[0]) {
    try { const parsed = JSON.parse(await target.files[0].text()); if (!parsed.bills || !parsed.settings) throw new Error("Invalid backup"); state = { ...clone(seed), ...parsed, settings: { ...seed.settings, ...parsed.settings } }; saveState("Backup restored"); render(); } catch { toast("That file is not a valid FlowLedger backup"); }
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === "bill-form") {
    const frequency = formValue(form, "frequency");
    const bill = { id: form.dataset.id || id("b"), name: formValue(form,"name"), amount: Number(formValue(form,"amount")), category: formValue(form,"category"), dueDay: Number(formValue(form,"dueDay")), frequency: frequency === "once" ? "monthly" : frequency, recurring: frequency !== "once", debt: formValue(form,"debt") === "true", balance: Number(formValue(form,"balance")), apr: Number(formValue(form,"apr")) };
    const index = state.bills.findIndex((item) => item.id === bill.id); if (index >= 0) state.bills[index] = bill; else state.bills.push(bill); saveState(index >= 0 ? "Bill updated" : "Bill added");
  }
  if (form.id === "income-form") {
    const income = { id: form.dataset.id || id("i"), name: formValue(form,"name"), amount: Number(formValue(form,"amount")), frequency: formValue(form,"frequency"), payDay: Number(formValue(form,"payDay")) || 1 };
    const index = state.incomes.findIndex((item) => item.id === income.id); if (index >= 0) state.incomes[index] = income; else state.incomes.push(income); saveState(index >= 0 ? "Income updated" : "Income added");
  }
  if (form.id === "goal-form") {
    const goal = { id: form.dataset.id || id("g"), name: formValue(form,"name"), target: Number(formValue(form,"target")), current: Number(formValue(form,"current")), date: formValue(form,"date") };
    const index = state.goals.findIndex((item) => item.id === goal.id); if (index >= 0) state.goals[index] = goal; else state.goals.push(goal); saveState(index >= 0 ? "Goal updated" : "Goal added");
  }
  if (form.id === "transaction-form") { state.transactions.push({ id: id("t"), date: formValue(form,"date"), amount: Number(formValue(form,"amount")), category: formValue(form,"category"), note: formValue(form,"note") }); saveState("Transaction added"); }
  if (form.id === "extra-form") {
    let amount = Number(formValue(form,"amount"));
    const debts = state.bills.filter((bill) => bill.debt && bill.balance > 0).sort(state.settings.method === "snowball" ? (a,b) => a.balance-b.balance : (a,b) => b.apr-a.apr);
    debts.forEach((bill) => { if (amount <= 0) return; const payment = Math.min(amount, bill.balance); bill.balance -= payment; amount -= payment; }); saveState("Extra payment applied to the debt plan");
  }
  closeModal(); render();
});

document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
render();

