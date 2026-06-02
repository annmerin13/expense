const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── DB helpers ──────────────────────────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ expenses: [] }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { expenses: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Validation ──────────────────────────────────────────────────────────────
const VALID_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

function validateExpense(body) {
  const errors = [];

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    errors.push("Title is required.");
  } else if (body.title.trim().length > 100) {
    errors.push("Title must be 100 characters or fewer.");
  }

  const amount = parseFloat(body.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push("Amount must be a positive number.");
  } else if (amount > 10_000_000) {
    errors.push("Amount seems unrealistically large.");
  }

  if (!VALID_CATEGORIES.includes(body.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }

  if (!body.date || isNaN(Date.parse(body.date))) {
    errors.push("Date is required and must be a valid date (YYYY-MM-DD).");
  }

  if (body.note && body.note.length > 500) {
    errors.push("Note must be 500 characters or fewer.");
  }

  return errors;
}

// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/expenses — list all, with optional filters
// Query params: category, from, to, title
app.get("/api/expenses", (req, res) => {
  const { category, from, to, title } = req.query;
  const db = readDB();
  let expenses = db.expenses;

  if (category && VALID_CATEGORIES.includes(category)) {
    expenses = expenses.filter((e) => e.category === category);
  }

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate)) {
      expenses = expenses.filter((e) => new Date(e.date) >= fromDate);
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate)) {
      // Include the full "to" day
      toDate.setHours(23, 59, 59, 999);
      expenses = expenses.filter((e) => new Date(e.date) <= toDate);
    }
  }

  if (title) {
    const q = title.toLowerCase();
    expenses = expenses.filter((e) => e.title.toLowerCase().includes(q));
  }

  // Sort: most recent date first, then by createdAt descending
  expenses.sort((a, b) => {
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json(expenses);
});

// GET /api/expenses/summary — monthly summary for current month
app.get("/api/expenses/summary", (req, res) => {
  const db = readDB();
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth() + 1; // 1-indexed

  const monthExpenses = db.expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const breakdown = {};
  for (const cat of VALID_CATEGORIES) breakdown[cat] = 0;
  for (const e of monthExpenses) {
    breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
  }

  res.json({
    year,
    month,
    total: parseFloat(total.toFixed(2)),
    breakdown: Object.fromEntries(
      Object.entries(breakdown).map(([k, v]) => [k, parseFloat(v.toFixed(2))])
    ),
    count: monthExpenses.length,
  });
});

// POST /api/expenses — create
app.post("/api/expenses", (req, res) => {
  const errors = validateExpense(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const db = readDB();
  const expense = {
    id: uuidv4(),
    title: req.body.title.trim(),
    amount: parseFloat(parseFloat(req.body.amount).toFixed(2)),
    category: req.body.category,
    date: req.body.date,
    note: req.body.note ? req.body.note.trim() : "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.expenses.push(expense);
  writeDB(db);
  res.status(201).json(expense);
});

// PUT /api/expenses/:id — update
app.put("/api/expenses/:id", (req, res) => {
  const errors = validateExpense(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const db = readDB();
  const idx = db.expenses.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ errors: ["Expense not found."] });

  db.expenses[idx] = {
    ...db.expenses[idx],
    title: req.body.title.trim(),
    amount: parseFloat(parseFloat(req.body.amount).toFixed(2)),
    category: req.body.category,
    date: req.body.date,
    note: req.body.note ? req.body.note.trim() : "",
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.expenses[idx]);
});

// DELETE /api/expenses/:id — delete
app.delete("/api/expenses/:id", (req, res) => {
  const db = readDB();
  const idx = db.expenses.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ errors: ["Expense not found."] });

  db.expenses.splice(idx, 1);
  writeDB(db);
  res.status(204).send();
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Expense Tracker running at http://localhost:${PORT}\n`);
});
