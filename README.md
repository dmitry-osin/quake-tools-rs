# Quake Tools

Desktop timing assistant for Quake Live and Quake Champions.

Quake Tools helps track item respawns with hotkeys, timer cards, visual alerts, training mode, and a built-in QL CVARs reference.

Important: this is not a cheat. It is an assistant app that helps players stay organized, calculate timings, and train timing memory.

## Demo

Demo of the application in action:

![Quake Tools Demo](./demo.gif)

## Features

- QL and QC game modes with independent map presets.
- Preset-based item pool and custom item selection.
- Timer cards for Red Armor, Yellow Armor, Green Armor, Mega Health, and Health.
- `Timers` page with two display modes: `Spawn Time` and `Time Remaining`.
- Game clock with start, pause, and reset.
- Global hotkeys with conflict detection and in-window fallback.
- Hook state panel on `Timers` page (status + quick toggle).
- Per-item alert configuration:
  - Stage 1 threshold and color
  - Stage 2 threshold and color
  - Per-item volume
- MP3 audio cues for item events (`taken`, `soon`, `go-to`, `ready`).
- Theme system (`Light`, `Dark`, `Neon`) and persistent settings.
- Trainer page for spawn-time calculation practice.
- QL CVARs section:
  - search while typing (from 3+ chars, debounced)
  - category filter
  - paginated results
  - details modal with copy/open actions, pro tip block, and first-open info modal
- About page with stack details, rules, map references, and credits.

## Technologies

- Rust 1.78+ and Tauri v2 (desktop runtime and commands)
- React 18 + Vite
- TypeScript 5
- Tailwind CSS 3
- Lucide React
- i18next + react-i18next (`public/locales/en.json`)
- Tauri global shortcut plugin
- SQLite (rusqlite) for local QL CVARs index/search
- JSON persistence in `~/.quake-tools/settings.json`

## Data Storage

- App settings are stored in `~/.quake-tools/settings.json`.
- QL CVARs source file is bundled from `src-tauri/assets/quake_cvars.json`.
- Local CVARs SQLite database is stored in `~/.quake-tools/cvars.db`.

## Local Setup and Build

### Prerequisites

- Node.js 20+
- pnpm 9+
- Rust toolchain (`stable`)
- Tauri prerequisites for your OS (WebView2 on Windows)

### Install dependencies

```bash
pnpm install
```

### Run in development

```bash
pnpm tauri dev
```

### Build frontend only

```bash
pnpm build
```

### Check Rust backend

```bash
cargo check --manifest-path src-tauri/Cargo.toml
```

### Build desktop bundle

```bash
pnpm tauri build
```

## How to Create a PR

1. Create a branch from `main`:

```bash
git checkout -b feature/short-name
```

2. Make your changes and run checks:

```bash
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

3. Commit with a clear message:

```bash
git add .
git commit -m "feat: short description"
```

4. Push the branch:

```bash
git push -u origin feature/short-name
```

5. Open a Pull Request to `main` and include:
- what changed
- why it changed
- how you tested it

## License

MIT - see `LICENSE`.

## Credits

- QL CVARs database source: https://quakeliveconfigeditor.com/cvars/
- Quake Live Config Editor: https://quakeliveconfigeditor.com/
- Special thanks: Ryan Bassett - https://bassettgraphics.com/
