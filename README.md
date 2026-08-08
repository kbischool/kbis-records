# KBIS Schools — Student Records

A mobile-first, installable (PWA) student records & billing app for KBIS
Schools. Browse every student, see which sessions and terms they've been
enrolled for, and open a full itemised account breakdown for any term —
built from your own FEE workbooks and INVOICE.xlsx.

Works offline once installed, and re-syncs automatically whenever the phone
or PC is back online and a new version of the data has been published.

---

## 1. What's in this folder

```
kbis-records/
├── source/                  ← put your FEE / INVOICE workbooks here
│   ├── 2022-2023 FEE.xlsx
│   ├── 2023-2024 FEE.xlsx
│   ├── 2024-2025 FEE.xlsx
│   ├── 2025 - 2026 FEE.xlsx
│   ├── 2026 - 2027 FEE.xlsx
│   └── INVOICE.xlsx
├── build_data.py            ← run this after editing any workbook above
├── requirements.txt
└── docs/                    ← this is what you deploy to GitHub Pages
    ├── index.html
    ├── manifest.json
    ├── service-worker.js
    ├── css/styles.css
    ├── js/config.js         ← passphrase + branding settings live here
    ├── js/app.js
    ├── img/logo.png
    ├── icons/                ← app icons (generated from your crest)
    └── data/                 ← students.json / invoice.json / meta.json
```

Everything the website reads lives in `docs/data/*.json`. `build_data.py`
is the only thing that writes those files — it reads your Excel workbooks
and regenerates them. **You never hand-edit the JSON.**

---

## 2. Publishing it on GitHub Pages (one-time setup)

1. Create a new **private** GitHub repository (e.g. `kbis-records`).
   > A private repo keeps the URL from being indexed by search engines, but
   > note GitHub Pages on a private repo needs GitHub Pro/Team/Enterprise.
   > On a free plan, the repo (and therefore the site) will be public —
   > see the security note in section 5 before you decide.
2. Upload the entire contents of this folder to the repo (keep the folder
   structure).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**,
   branch `main`, folder **`/docs`** — then Save.
5. GitHub will give you a URL like
   `https://yourusername.github.io/kbis-records/`. That's your live site.
6. Open it on a phone: Chrome/Safari will offer **"Add to Home Screen"**
   (or an install icon in the address bar on desktop Chrome/Edge). Once
   installed it behaves like a normal app — its own icon, no browser bar,
   works offline.

---

## 3. Updating the data (every new term / new student / new session)

1. Edit the actual workbook in `source/` the way you always have —
   add a row for a new student, update a balance, adjust `INVOICE.xlsx`
   for a sessional fee change, etc.
2. **Starting a brand-new session** (e.g. 2027-2028)? Drop the new
   `20XX - 20XX FEE.xlsx` file into `source/`, then add one entry for it
   near the top of `build_data.py` in the `SESSION_SOURCES` list — copy
   the pattern already used for 2026-2027 and update the sheet names to
   match your new workbook's tab names.
3. From a terminal, inside this folder, run:
   ```bash
   pip install -r requirements.txt
   python3 build_data.py
   ```
   You'll see a short summary (`students: 253 (active: 120, ...)`).
4. Commit and push:
   ```bash
   git add docs/data
   git commit -m "Update term 2 2026-2027 balances"
   git push
   ```
5. Within a minute GitHub Pages redeploys. Every phone/PC with the app
   installed will pick up the change automatically next time it's online
   — a small "Records updated" toast appears, or check `Sync → Check for
   updates now`.

No spreadsheet formatting requirements beyond what you already use — the
script recognises columns by name (`TOTAL FEE`, `BALANCE`, `DISCOUNT`,
`TUITION`, etc.), so reordering or adding new fee-item columns is fine.
If you rename a column entirely, open `build_data.py` and add the new
name to the relevant set near the top (`TOTAL_COLS`, `BALANCE_COLS`, …).

---

## 4. Who can open it

You chose **shared staff access**: everyone who has both the site URL and
the passphrase can view it. There's no per-person login — it's one shared
passphrase for you and your staff.

- Default passphrase: **`kbis2026`**
- To change it, open `docs/js/config.js`, follow the short instructions in
  the comment at the top (generate a SHA-256 hash in the browser console
  and paste it in), and re-deploy.
- "Keep me signed in on this device" stores the unlock in the browser
  permanently; unchecking it forgets on tab close. Staff can sign out
  anytime from **Sync → Sign out of this device**.

---

## 5. A honest note on security

This is a static site (no server, no real backend) — that's what makes it
free to host and simple to update from a spreadsheet. The passphrase gate
is a **deterrent**, not real security: the app's source code (including
the passphrase hash) is technically visible to anyone who opens their
browser's developer tools, and on a public repo/site anyone with the link
could reach the gate screen. For a family/small-school billing tool this
is a reasonable trade-off, but don't treat it as bank-grade protection.
If real per-user authentication ever becomes necessary, that requires
introducing an actual backend (e.g. Firebase Auth) — a bigger step up in
complexity than this "edit a spreadsheet, push, done" workflow.

---

## 6. Offline behaviour

- First time the app is opened it needs an internet connection to load.
- After that, the app shell **and the last-synced data** are cached on
  the device — students, sessions, terms, balances, the fee structure —
  all fully browsable with no signal.
- Whenever the device is online again, it quietly checks for a newer
  version of the data in the background and offers to refresh the view.
- The **Sync** tab always shows when the data was last generated and when
  this device last synced it, plus a manual "Check for updates now"
  button.

---

## 7. Known data quirks worth knowing about

- Students are matched across sessions by their **exact** name as typed
  in the spreadsheet (last name + first name). If the same child was
  typed slightly differently in two different terms (e.g. a spelling
  slip like "Suitan" vs "Sultan"), they'll show up as two separate
  student cards. The fix is a spreadsheet clean-up, not a code one —
  make the spelling consistent in the source workbook and re-run
  `build_data.py`; the records will merge automatically next build.
- "1st/2nd/3rd Term" account breakdowns reflect exactly what's in the
  relevant TERM sheet for that session — the PAYMENT SHEET / LOG / REMIT
  tabs (itemised transaction history) aren't pulled in yet; the app shows
  the term's charge/paid/balance summary and item breakdown only.

---

## 8. Customising the look

- Colours, fonts, spacing: `docs/css/styles.css` — all brand colours are
  CSS variables at the top of the file (`--sky`, `--pink`, `--amber`, …).
- Fee-item display names (e.g. "AD_FORM" → "Admission Form"): the
  `LABELS` object near the top of `docs/js/app.js`.
- School name / tagline / default session behaviour:
  `docs/js/config.js`.
