# WebGhost

A lightweight website change monitor. Capture a baseline of a public page, recapture it later, and inspect what changed.

## MVP

- Add a public URL
- Capture page content with Playwright
- Save a baseline snapshot
- Manually recapture the page
- Compare snapshots and show added, removed, and changed text

## Stack

- Node.js + Express
- Playwright
- Local JSON storage for the first version

## Quick start

```bash
npm install
npx playwright install chromium
npm run dev
```

## Scope

The first version intentionally skips scheduled crawling, email alerts, accounts, and distributed workers. Those can be added after the manual capture-and-diff workflow is validated.

## Project structure

```text
webghost/
  server/
    src/
      index.js
      services/
        capture.js
        diff.js
  data/
  package.json
```
