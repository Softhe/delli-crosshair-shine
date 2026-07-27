# Preview calibration

The browser preview is useful for editing, while CS2 remains the rendering authority. This workflow turns that caveat into a repeatable comparison instead of an informal visual check.

## Reference matrix

Capture each scenario from `docs/preview-reference-matrix.json` in CS2 at:

- 1920×1080, UI scale 100%
- 2560×1440, UI scale 100%
- 1280×960 stretched, UI scale 100%

Use a static wall, stand still, disable weapon spread, and keep the same map position and brightness. Save images under `docs/preview-references/<scenario>/<resolution>-cs2.png`. Browser captures belong beside them as `<resolution>-browser.png`.

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

## Release rule

Changes to `src/lib/crosshair-preview.ts`, `CrosshairShape`, codec values, or preview scaling require:

1. unit fixture verification;
2. regenerated browser captures;
3. review of at least the compact, dot, outlined, T-style, and partial-alpha scenarios;
4. a matrix note when an intentional discrepancy remains.
