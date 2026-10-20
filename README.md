# MilkTracker — Frontend

React + Vite frontend. Font: **Plus Jakarta Sans** (loaded in `index.html`).

## Run
```bash
npm install
cp .env.example .env     # set VITE_API_URL if your backend is not on :8081
npm run dev
```

## Structure
```
src/
  App.jsx                 routes (/, /purchases, /payments, /profile, /settings, /login ...)
  config.js               API base URL (VITE_API_URL)
  lib/                    api client, formatting, month stats, theme
  context/                Auth, Toast, Data (month + CRUD), Editors (drawers/delete)
  components/             RouteMap, DailyChart, StatCards, BalanceCard, forms, shell...
  pages/                  Dashboard, Purchases, Payments, Profile, Settings, auth pages
  styles/ + index.css     design tokens (light/dark) and per-area styles
```

## Notes
- Weight scale (400/500/600/700) is defined at the end of `src/index.css`; animations live in `src/styles/motion.css` and respect `prefers-reduced-motion`.
- Dark mode keeps the same `milkTrackerDarkMode` key and `body.dark-mode` class as before.
- Backend endpoints are unchanged. Notification endpoints assumed:
  `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all`
  - adjust in `context/DataProvider.jsx` if yours differ.
