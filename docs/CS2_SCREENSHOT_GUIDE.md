# CS2 preview reference screenshot guide

Use this guide to capture the 15 real Counter-Strike 2 screenshots required for preview calibration. CS2 is the rendering authority. Do not recreate, resize, crop, sharpen, or otherwise edit these images after capture.

## What to deliver

Capture each of the five crosshairs at all three resolutions:

| Scenario | CS2 share code | Important settings |
| --- | --- | --- |
| `compact` | `CSGO-nryuF-rpzQT-MEqX7-sAJcL-nvHCF` | Style 4, length 2, thickness 1, gap -2, cyan, alpha 255, no outline, no dot |
| `dot` | `CSGO-zDZH2-jXXvr-yFaQu-OjXPS-G8sdA` | Style 4, length 0, thickness 1, gap -5, cyan, alpha 255, outline 1, center dot on |
| `outlined` | `CSGO-nScTp-Aecqc-QomZa-s8QuY-ALUSH` | Style 4, length 3.5, thickness 1.5, gap -1, yellow, alpha 255, outline 1 |
| `classic` | `CSGO-LMehF-ufEnH-ZzA4H-aXQLm-uQzfF` | Style 4, length 2.5, thickness 1, gap -3, green, alpha 255, center dot on, no outline |
| `partial-alpha` | `CSGO-RBZih-6Hynp-ieuGe-tTkVz-9PqNO` | Style 4, length 1, thickness 1, gap -3.5, custom RGB 0/255/255, alpha 200, no outline or dot |

Import the share code in **Settings → Game → Crosshair → Share or Import**. After importing, compare the visible CS2 settings with the table before taking the screenshot.

## One-time capture setup

1. Start an offline Practice match on any map with a plain, evenly lit wall. Use the same map and game session for all 15 images.
2. Choose a wall without decals, strong shadows, animated props, particles, smoke, fire, or bright bloom directly behind the crosshair.
3. Stand still and aim at one recognizable point on the wall. Do not move the mouse, player, or camera between captures.
4. Do not fire, scope, switch spectator modes, open menus, or enable follow-recoil while capturing.
5. Use fullscreen display mode. Keep the same graphics, brightness, HUD, monitor, and capture-tool settings for the entire set.
6. Set the CS2 HUD scale to its default/full value (`hud_scaling 1`) and disable crosshair follow recoil (`cl_crosshair_recoil 0`). The imported crosshairs use static style 4.
7. Hide unrelated overlays and notifications: Steam overlay popups, FPS counters, recording indicators, Discord overlays, GPU overlays, and Windows notifications.
8. Configure the screenshot tool to capture the complete game frame as lossless PNG. Do not use JPEG.

Windows display scaling does not need to be changed if the capture tool records the game framebuffer at its real pixel dimensions. Verify the saved PNG dimensions after every resolution change.

## Resolution passes

Complete all five scenarios before changing to the next resolution:

1. **1920×1080 native**
   - CS2 aspect ratio: 16:9
   - Resolution: 1920×1080
   - Saved PNG must be exactly 1920×1080 pixels.
2. **2560×1440 native**
   - CS2 aspect ratio: 16:9
   - Resolution: 2560×1440
   - Saved PNG must be exactly 2560×1440 pixels.
3. **1280×960 stretched**
   - CS2 aspect ratio: 4:3
   - Resolution: 1280×960
   - GPU/display scaling must stretch the 4:3 game image to fill the screen; do not use black bars.
   - The captured framebuffer file must still be exactly 1280×960 pixels.

After changing resolution, confirm that the view still points at the same wall position. Do not compensate for perceived crosshair size by zooming, cropping, or changing view distance.

## Capture procedure

For each resolution:

1. Import the scenario share code.
2. Close Settings and wait until the game view is completely static.
3. Verify the crosshair color, outline, dot, and opacity against the scenario table.
4. Capture the complete game frame.
5. Save it directly to `artifacts/preview-calibration/` with the exact filename below.
6. Open the saved file and verify its pixel dimensions, PNG format, and that the crosshair is centered and unobstructed.
7. Continue with the next scenario without moving the player or camera.

## Required filenames

### 1920×1080

- `compact-1920x1080-cs2.png`
- `dot-1920x1080-cs2.png`
- `outlined-1920x1080-cs2.png`
- `classic-1920x1080-cs2.png`
- `partial-alpha-1920x1080-cs2.png`

### 2560×1440

- `compact-2560x1440-cs2.png`
- `dot-2560x1440-cs2.png`
- `outlined-2560x1440-cs2.png`
- `classic-2560x1440-cs2.png`
- `partial-alpha-2560x1440-cs2.png`

### 1280×960 stretched

- `compact-1280x960-stretched-cs2.png`
- `dot-1280x960-stretched-cs2.png`
- `outlined-1280x960-stretched-cs2.png`
- `classic-1280x960-stretched-cs2.png`
- `partial-alpha-1280x960-stretched-cs2.png`

## Final validation

Before handing off the captures:

- Confirm there are exactly 15 new `*-cs2.png` files.
- Confirm every file is a lossless PNG at the resolution encoded in its filename.
- Confirm each resolution uses one unchanged wall, position, camera angle, brightness, and graphics setup.
- Confirm no image was cropped, resized, recompressed, or edited.
- Run `pnpm report:preview` and open `artifacts/preview-calibration/report.html`.
- Check that each card shows Browser, CS2 reference, and the 50% overlay.
- Run `pnpm verify:release-readiness`. The calibration portion should stop reporting missing captures; the command will still fail until the five-player playtest is complete and the manifest status has been reviewed.

If a capture is questionable, recapture it instead of correcting it in an image editor.
