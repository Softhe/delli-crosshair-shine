# Preview calibration

The browser preview is useful for editing, while CS2 remains the rendering authority. This workflow turns that caveat into a repeatable comparison instead of an informal visual check.

## Reference matrix

Capture each scenario from `docs/preview-reference-matrix.json` in CS2 at:

- 1920×1080, UI scale 100%
- 2560×1440, UI scale 100%
- 1280×960 stretched, UI scale 100%

Use a static wall, stand still, disable weapon spread, and keep the same map position and brightness. Save supplied game references in `artifacts/preview-calibration/` as `{scenario}-{resolution}-cs2.png`. Browser captures use the matching `{scenario}-{resolution}-browser.png` name.

For each pair, record:

- arm length in pixels;
- thickness in pixels;
- center-to-arm gap in pixels;
- outline thickness;
- alpha and color differences.

The preview is calibrated when the median absolute difference is no more than one CSS pixel for length, thickness, and gap at the reference viewport. Any deliberate approximation must be recorded in the matrix notes.

## Browser capture

Build and serve the project, then run:

```sh
pnpm capture:preview
```

This creates the browser half of the matrix in `artifacts/preview-calibration/`. Real CS2 captures must be supplied by a player; they must never be fabricated from the browser rendering.

After adding the real CS2 references, run:

```sh
pnpm report:preview
```

Open `artifacts/preview-calibration/report.html` for side-by-side and 50% overlay comparisons. Set `REQUIRE_CS2_REFERENCES=1` when the command should fail if any of the 15 reference pairs is missing.

Record the measured browser-minus-CS2 pixel difference for every applicable check in the matrix notes, change `captureStatus` to `calibrated` only after review, and run `pnpm verify:release-readiness`. That final command also verifies that all 30 browser/CS2 image files are present locally.

## Release rule

Changes to `src/lib/crosshair-preview.ts`, `CrosshairShape`, codec values, or preview scaling require:

1. unit fixture verification;
2. regenerated browser captures;
3. review of at least the compact, dot, outlined, T-style, and partial-alpha scenarios;
4. a matrix note when an intentional discrepancy remains.
