[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/hilmyalfauzi665-droid/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/hilmyalfauzi665-droid/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, all single-player (no online trophies).

## What it does

- **Checklist** of every trophy with its official name, description and grade exactly as PlayStation publishes them. Tick a trophy when you earn it; progress is saved in `localStorage`.
- **A cited guide for every trophy**, written for this guide in its own words, with its sources named beside it (PowerPyx, Planet GTA 6, CryptoGames, The Gamers Hub, GTABase and others). Where a method is not yet confirmed by players — the cryptic one-line trophies such as #38, #44–#51 — the guide says so honestly instead of inventing steps.
- **Roadmap to platinum** in three ordered stages: story (60–80 hours), 100% completion and the big counts (~100 hours), then Strangers & Freaks and cleanup (~10 hours). About 200 hours total, difficulty about 4/10 (PowerPyx).
- **Missable flags**: only one trophy is flagged as possibly missable — #28 Positive Mental Attitude (meditate at every spot; do the first meditation in Chapter 1, Lucia on the balcony at Jason's house, to be safe — whether it is required is still unconfirmed). Every other trophy is finishable in post-story free-roam.
- **Filters** by kind (story, missable, collectibles, activities, online — the online filter shows an empty state explaining there are no online trophies), by grade, by earned/remaining, plus search.
- **Spoiler setting** that hides the names and descriptions of story trophies until you earn them.
- **Export progress** to a JSON file and **import** it back.
- **Deep links**: `#/trophy/28` opens a trophy's guide, `#/roadmap` shows the roadmap, `#/filter/missable` applies a filter.

## Run it

Serve `app/` with any static server — for example `node serve.ts`, then open http://localhost:8080 — and it works with the network off. It is plain static files with no build step and fetches nothing but its own `app/data/trophies.json`.

## Honesty note

The game released 19 Nov 2026. This guide is launch-era: figures come from PowerPyx's trophy guide and roadmap and the 100% completion checklists linked in the app, and unconfirmed details are labelled unconfirmed.

## Entry

Built for the [make.fun](https://make.fun) competition `gta6-trophy-guide-01`. `main.ts` copies `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

Unofficial fan guide. Not affiliated with Rockstar Games or PlayStation. No Rockstar logo or artwork is used.
