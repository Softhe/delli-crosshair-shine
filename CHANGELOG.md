# Changelog

Notable changes to CS2 Crosshair Studio are recorded here. Dates and version numbers are added when a release is tagged; untagged work remains under **Unreleased**.

## Unreleased

### Added

- A unified studio for importing, creating, editing, previewing, sharing, and exporting a crosshair from one page.
- Crosshair presets and controls for length, gap, thickness, color, opacity, outline, center dot, and T style.
- Live generation of share codes, console commands, config files, share links, and optional aliases.
- Draft persistence plus recent-history and favorites storage in the browser.
- Canonical query-based share links using `/?code=CSGO-...`.
- Automated type checking and production-browser smoke coverage in the release gate.
- Build-artifact verification and a post-deployment production route smoke test.

### Changed

- `/custom` is now a compatibility redirect to the unified root studio and preserves query strings and hashes.
- Only valid legacy `/:shareCode` paths open the studio; unrelated single-segment paths show the not-found page.
- The social preview image is now an optimized JPEG referenced consistently by page metadata and build verification.
- Project documentation now describes the current studio architecture, tests, compatibility routes, and GitHub Pages release process.

### Removed

- The legacy share-code-only generator, its tests, and its obsolete implementation documentation.
- Unused UI modules left by the earlier generator interface.

## 2.0.0

### Added

- Local recent-history and favorites lists.
- Clipboard output and share-link actions.
- Keyboard shortcuts, inline validation, an FAQ, and responsive layouts.
- Versioned import and export support in the browser-storage utilities.

### Changed

- Expanded the original converter into a more guided, mobile-friendly workflow.
- Improved error messages, focus behavior, and action feedback.
- Added clipboard fallbacks and corrected preview geometry for compact crosshairs and negative gaps.

## 1.0.0

### Added

- CS2 crosshair share-code validation and decoding.
- Config-file and console-command generation.
- A browser-rendered crosshair preview.
- Alias support and basic responsive styling.
