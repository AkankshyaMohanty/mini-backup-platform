# Vaultly — Frontend-only Backup Platform

A portfolio-ready cloud-backup management interface built using only:

- React
- Vite
- Tailwind CSS
- Browser `localStorage`

There is no backend and no external UI/component library.

## Features

- Backup operations dashboard
- Create backup jobs
- Search and filter jobs
- Simulate "Run now"
- Generate mock archive snapshots
- Search archives
- Simulate restores
- Activity/audit log
- Browser-persisted settings
- Responsive navigation
- Resettable demo data

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Frontend-only architecture

```text
React components
      |
      v
Application state
      |
      v
localStorage
```

`src/hooks/useLocalStorage.js` is the mock persistence layer. It can later be
replaced by real API calls without redesigning the UI.

## Suggested next milestones

1. Backup job details drawer
2. Multi-step job creation wizard
3. Calendar-based restore point selector
4. Failure and retry simulation
5. Role-based UI variants
6. Dark mode
7. Unit tests
8. Deploy to GitHub Pages, Netlify, or Vercel
