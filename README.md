# LT Line Safety Monitor

**Smart LT Line Break Detection & Automatic Shutdown System** — software-only SIH prototype with animated field visualization and a control-room dashboard.

> This is a **simulation**. No real electrical hardware or mains switching is involved.

## What it demonstrates

When an LT overhead conductor breaks and falls, residual current may be too low for a conventional overcurrent breaker to trip. This app shows how software can:

1. Stream multi-parameter sensor readings (voltage, current, frequency, phase, continuity)
2. Run a **rule-based detection engine**
3. Verify the condition over a hold window
4. Raise a **high-priority control-room alert**
5. Request **remote isolation** (simulated certified switching gateway)
6. Track the full **incident lifecycle** through repair and restore

**Pitch line:** *Our system is a software-based intelligent detection and remote isolation layer that works alongside existing electrical protection equipment.*

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

Click **Simulate Line Break** to run the full animated scenario on Feeder 03.

## Features

| Area | Demo |
|------|------|
| Field view | Animated poles, live conductor, break fall, sparks, isolation |
| Detection engine | Step-by-step rule pipeline + verification progress |
| Dashboard | Normal / Warning / Critical / Isolated counts |
| Feeders | Six simulated feeders with live telemetry jitter |
| Map | Schematic zone map with status colors |
| Charts | Voltage & current history (Recharts) |
| Alerts | Acknowledge, isolate, dispatch, complete repair |
| SIH tab | Architecture strip + breaker comparison table |

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Recharts
- Lucide icons

## Project layout

```
src/
  App.jsx                 # Shell + tabs
  hooks/useSimulation.js  # Demo state machine
  data/feeders.js         # Seed data + detection steps
  components/             # Dashboard UI + LineAnimation
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Safety note

Do **not** claim this software replaces circuit breakers or directly controls live LT lines. Real isolation must use certified equipment installed by qualified professionals under applicable electrical standards.
