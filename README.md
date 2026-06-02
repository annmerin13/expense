# Ledger — Personal Expense Tracker

A clean, no-nonsense expense tracker. Runs entirely on your laptop with no external services required.

---

## How to Run

**Prerequisites:** Node.js v18+ (check with `node --version`)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker

# 2. Install dependencies (only express + uuid)
npm install

# 3. Start the server
npm start

# 4. Open in browser
# → http://localhost:3000
```

That's it. The database (`db.json`) is created automatically on first run in the project root. No setup, no migrations.

To use a different port:
```bash
PORT=4000 npm start
```

---

## Stack Choices & Tradeoffs

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Minimal setup, easy to read, zero config |
| Database | JSON file (`db.json`) | **Zero install friction** — interviewers don't need SQLite binaries, Postgres, or any native build step. Works everywhere Node runs. Tradeoff: not suitable for concurrent writes or large datasets, but fine for a local personal tool. |
| Frontend | Vanilla HTML/CSS/JS | No build step, no bundler, no framework overhead. Single file, opens instantly. |

**Why not SQLite?**  
SQLite requires a native addon (`better-sqlite3`) that needs `node-gyp` and platform-specific build tools (Xcode CLT on Mac, build-essential on Linux). That's a non-trivial ask for an interviewer just trying to run your project. A JSON file just works.

**Why not a React/Vue frontend?**  
No build step = the interviewer doesn't need to run `npm run build` or deal with Vite/webpack errors. The server starts and the app is immediately available.

---

## What's Done

- ✅ Add expense (title, amount, category, date, note)
- ✅ View all expenses, sorted by date descending
- ✅ Edit any expense (pre-filled modal)
- ✅ Delete any expense (with confirmation dialog)
- ✅ Monthly summary: total + per-category breakdown with bar chart
- ✅ Month navigation (prev/next arrows) in summary panel
- ✅ Filters: title search (partial match), category, date range (from/to)
- ✅ Input validation on both client (HTML constraints) and server (explicit checks)
- ✅ Empty states (no expenses, no filter results)
- ✅ Toast notifications for add/edit/delete
- ✅ Keyboard support (Escape closes modals)
- ✅ Currency set to INR (₹) — trivially changeable via the `CURRENCY` constant in `index.html`

## What's Skipped

- **Authentication / multi-user** — explicitly out of scope per the brief
- **Test suite** — explicitly out of scope per the brief
- **Pagination** — for a personal expense tracker, all expenses fit comfortably in one list; adding pagination would complicate the filter UX with no real benefit at this scale
- **Charts beyond the summary bar** — kept it focused; the monthly breakdown is the most useful view

---

## Known Rough Edges

- **Concurrent writes:** The JSON file approach does a read-modify-write cycle. Two simultaneous requests (basically impossible in solo use) could theoretically race. Non-issue for a single-user local tool.
- **Large datasets:** Beyond a few thousand expenses, the full-file read on every request would get slow. Again, not a concern for personal use over months/years.
- **Date stored as string:** Dates are stored as `YYYY-MM-DD` strings. Filtering is done by comparing `Date` objects constructed from these strings, which is reliable but timezone-sensitive — dates are treated as local dates on the server side.

---

## Project Structure

```
expense-tracker/
├── server.js          # Express server + all API routes
├── public/
│   └── index.html     # Full frontend (HTML + CSS + JS, single file)
├── package.json
├── .gitignore
└── README.md
```

`db.json` is created at runtime and gitignored — each user starts with a clean slate.
