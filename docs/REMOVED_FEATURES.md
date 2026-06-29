# Restored Quick Actions Documentation

## Overview

The CS2 Crosshair Config Generator includes Paste and Share actions in the Quick Actions bar. This document supersedes the older removal note for those controls.

**Version**: 2.0.0  
**Status**: Current

---

## Restored Features

### Paste Button

**Location**: Quick Actions bar below the share code input.

**Behavior**:
- Reads text from the clipboard when browser permissions allow it
- Validates that the clipboard content is a CS2 share code
- Populates the share-code input on success
- Shows a toast for success, invalid content, or permission/browser failures

Users can still paste manually with `Ctrl+V` or `Cmd+V`.

### Share Button

**Location**: Quick Actions bar below the share code input.

**Behavior**:
- Uses the Web Share API when available
- Falls back to copying the current tool URL to the clipboard
- Ignores user-cancelled native share dialogs
- Shows an error toast if neither sharing nor copying succeeds

---

## Current Quick Actions

1. **Try Example** - Load a random example share code
2. **Paste** - Read and validate a share code from the clipboard
3. **Favorite** - Add or remove the current crosshair from favorites
4. **Share** - Share the tool URL or copy it to the clipboard
5. **Shortcuts** - Open the keyboard shortcuts modal

---

## Related Files

- `src/components/CS2ConfigGenerator.tsx`
- `src/lib/clipboard.ts`
- `docs/CLIPBOARD_FIX.md`
