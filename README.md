#  Personal Expense Tracker


---

## Running it

You need Node.js v18+. Check with `node --version`.

```bash
git clone https://github.com/annmerin13/expense.git
cd expense
npm install
npm start
```

Open http://localhost:3000. 

The database is a `db.json` file that gets created automatically the first time you run the server. 



---

## Stack

**Node + Express** for the backend. Straightforward REST API, easy to read through.

**JSON file** as the database. 

** HTML/CSS/JS** for the frontend. No build step. You start the server and the app is there. 

---

## What's built

- Add, edit, delete expenses — title, amount, category, date, optional note
- List sorted by date (newest first)
- Monthly summary with a per-category breakdown and a small bar chart; navigate months with the arrows
- Filters: search by title (partial match, searches as you type), filter by category, filter by date range
- Validation on both ends: the server rejects bad data explicitly, the UI shows the errors in the form
- Empty states for both "no expenses yet" and "nothing matches your filters"
- Delete asks for confirmation before doing anything
- Escape key closes modals

**Date range edge case:** if you pick a "To" date that's earlier than your "From" date, the field clears and shows an error. The "To" input also gets a `min` attribute set dynamically when you pick "From", so the date picker itself won't let you select an invalid range in the first place. Two layers the picker blocks it, and the change handler catches anything that slips through.

---

## What's not built

- Auth / multi-user — out of scope
- Pagination — for a personal expense tracker, all expenses fit comfortably in one list; adding pagination would complicate the UX.
- Fancy charts — the category breakdown in the summary panel is enough

---

## Rough edges

- The JSON read-modify-write isn't atomic. Two simultaneous saves could theoretically race. Not a real problem for a single-user local app.


---

## Structure

```
expense/
├── server.js        
├── public/
│   └── index.html   
├── package.json
├── .gitignore
└── README.md
```

`db.json` is gitignored — everyone who clones this starts fresh.