# FlowLedger

FlowLedger is a responsive, browser-first budget and debt planning app. It is a clean web remake of the original Expo application and is designed for zero-configuration deployment on Vercel.

## Features

- Monthly cash-flow dashboard with bill progress and category insights
- Recurring and one-time bills with monthly payment tracking
- Debt balances, APRs, and snowball or avalanche prioritization
- Income sources, savings goals, categories, and starting-balance settings
- Browser-local persistence with JSON backup/restore and CSV bill import/export
- Responsive desktop and mobile layouts with dark and light themes

## Run locally

Open `index.html` directly, or serve the directory with any static server.

```bash
npx serve .
```

## Deploy to Vercel

Import this repository in Vercel. No framework preset, build command, or environment variables are required; Vercel serves the static files directly.

## Data and privacy

Financial data stays in the current browser's `localStorage`. Use **Settings â†’ Export backup** before clearing browser data or moving to another device. No financial data from the original archive is committed to this repository.

