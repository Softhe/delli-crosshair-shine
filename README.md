# CS2 Crosshair Studio

CS2 Crosshair Studio is a private, browser-based workspace for importing, editing, previewing, sharing, and exporting Counter-Strike 2 crosshairs. The application is built with React, TypeScript, Vite, and Tailwind CSS and is published at [delli.cc](https://delli.cc/).

## Features

- Import and validate CS2 `CSGO-...` crosshair share codes.
- Start from a preset and edit length, gap, thickness, color, opacity, outline, center dot, and T style.
- Preview changes immediately and generate a new share code from the edited values.
- Copy a console command, share code, or canonical share link, or download a `.cfg` file.
- Optionally generate a safe config filename and console alias.
- Keep up to 20 recently loaded or exported crosshairs and 50 favorites in browser storage.
- Search and rename saved crosshairs, or export/import a local JSON backup.
- Restore the latest draft after a refresh and reset it when needed.
- Use `Ctrl+Enter` or `Cmd+Enter` to copy the current console command.
- On mobile, keep export actions within reach while preview and optional autoexec details stay collapsible.
- Report bugs and suggest improvements through the project's [GitHub Issues](https://github.com/Softhe/delli-crosshair-shine/issues/new/choose) page.

All decoding, editing, persistence, and file generation happen in the browser. The live preview is an approximation; resolution and in-game rendering can produce small visual differences.

## Routes and links

| Route | Purpose |
| --- | --- |
| `/` | Unified studio. With no URL code, it restores the local draft or opens the default crosshair. |
| `/?code=CSGO-...` | Canonical share link. |
| `/?crosshair=CSGO-...` | Supported compatibility query. |
| `/custom` | Compatibility route that redirects to `/` while preserving its query string and hash. |
| `/CSGO-...` | Legacy path-based share link. Valid codes still open in the studio. |
| Any other path | Not-found page. |

Use query-based share links for new links. On GitHub Pages, a legacy path can be served through `404.html`, so the app can load it even though the initial document response may retain a 404 status.

## Development

Requirements:

- Node.js 20 or newer
- pnpm 11.9.0 (the version pinned in `package.json`)

```sh
corepack enable
pnpm install
pnpm dev
```

Vite prints the local development URL, normally `http://localhost:5173` or the next available port.

Useful commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server. |
| `pnpm lint` | Run ESLint. |
| `pnpm typecheck` | Type-check the application and Vite configuration. |
| `pnpm test` | Run the Vitest unit and component suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |
| `pnpm test:utils` | Verify share-code and preview utility invariants. |
| `pnpm test:e2e` | Build the site, then run the Playwright smoke tests at desktop and mobile widths. |
| `pnpm build` | Build `dist/`, prepare compatibility pages, and verify the production artifacts. |
| `pnpm preview` | Serve the production build locally. |
| `pnpm verify:build` | Verify the files and metadata in an existing `dist/`. |
| `pnpm smoke:production` | Probe the deployed `https://delli.cc` routes and metadata. |
| `pnpm check` | Run the required local release gate. |

## Project structure

```text
src/pages/                 Route-level studio and not-found pages
src/components/            Preview, history, FAQ, and reusable UI
src/lib/                   Share-code, output, URL, storage, and preview logic
src/**/*.test.{ts,tsx}     Unit and component tests
e2e/                       Production-browser smoke tests
scripts/                   Utility checks and static-page preparation
public/                    Metadata, icons, crawler files, and CNAME
.github/workflows/         Continuous integration and GitHub Pages deployment
```

See [Architecture](docs/ARCHITECTURE.md), [Testing](docs/TESTING.md), and [Release and deployment](docs/RELEASE.md) for the maintained project documentation.

## Deployment

Pull requests and pushes to `main` run the main gate and Playwright smoke suite. A push to `main` also deploys the verified `dist/` artifact to GitHub Pages and probes the live site afterward. The build includes the `delli.cc` custom-domain declaration, crawler metadata, optimized `og-image.jpg`, `/custom` compatibility files, and a `404.html` app fallback for legacy share-code paths.

Run `pnpm check` and `pnpm test:e2e` before merging. After deployment, follow the production smoke checklist in [docs/RELEASE.md](docs/RELEASE.md).

## License

Built by delli.cc. No separate open-source license is declared in this repository.
