# Quick Reference - CS2 Crosshair Generator UI/UX Enhancements

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## 📁 New Files

| File | Purpose |
|------|---------|
| `src/lib/storage.ts` | localStorage utilities |
| `src/components/CrosshairHistory.tsx` | History & Favorites UI |
| `src/components/FAQ.tsx` | FAQ accordion |
| `src/components/KeyboardShortcuts.tsx` | Shortcuts modal |

---

## 🔧 Key Functions (storage.ts)

```typescript
// Add to history
addToHistory({ shareCode, aliasName?, settings? })

// Get history
const history = getHistory() // Returns CrosshairData[]

// Toggle favorite
const isFav = toggleFavorite({ shareCode, aliasName?, settings? })

// Check if favorited
const isFav = isFavorited(shareCode)

// Get favorites
const favorites = getFavorites()

// Export/Import
const json = exportAllData()
importAllData(jsonString)
```

---

## 🎨 CSS Classes Added

```css
/* Gaming Utilities */
.card-gaming              /* Enhanced card style */
.btn-gaming-press         /* Button press animation */
.interactive-glow         /* Hover glow effect */
.interactive-scale        /* Hover scale effect */
.trust-badge              /* Trust indicator badge */
.help-trigger             /* Help icon button */

/* Layout */
.section-spacing          /* Vertical spacing (8-12 units) */
.card-spacing             /* Card padding (6-8 units) */

/* Animations */
@keyframes fade-in
@keyframes slide-in-up
@keyframes glow-pulse
```

---

## 🎯 Component Props

### CrosshairHistory
```typescript
interface CrosshairHistoryProps {
  onSelectCrosshair: (shareCode: string, aliasName?: string) => void;
}
```

### FAQ
```typescript
// No props - self-contained
<FAQ />
```

### KeyboardShortcuts
```typescript
// No props - modal trigger
<KeyboardShortcuts />
```

---

## 🎨 Color Variables

```css
--neon-cyan: 195 100% 50%        /* #00D4FF */
--neon-purple: 270 100% 60%      /* #9D00FF */
--tactical-blue: 220 50% 40%     /* #3366A6 */
--success: 120 60% 50%           /* #4CAF50 */
--destructive: 0 84% 60%         /* #F44336 */
```

Usage: `text-neon-cyan` or `bg-tactical-blue/30`

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + Enter` | Generate config |
| `Ctrl/Cmd + V` | Paste (input focused) |
| `Tab` | Next field |
| `Escape` | Close modals |

---

## 📱 Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices (sidebar appears) */
xl: 1280px  /* Extra large */
2xl: 1536px /* 2X large */
```

Layout changes at `lg` (1024px):
- Single column → Two columns
- Stacked history → Sticky sidebar

---

## 🔄 State Management

```typescript
// Main component state
const [shareCode, setShareCode] = useState('')
const [aliasName, setAliasName] = useState('')
const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle')
const [isFavorite, setIsFavorite] = useState(false)
const [historyKey, setHistoryKey] = useState(0) // Force refresh
```

---

## 🎭 Toast Messages

```typescript
toast({
  title: "Success!",
  description: "Config downloaded successfully",
  // variant: "default" | "destructive"
})
```

---

## 📊 Data Structure

```typescript
interface CrosshairData {
  id: string;
  shareCode: string;
  aliasName?: string;
  timestamp: number;
  isFavorite?: boolean;
  settings?: {
    style: number;
    length: number;
    thickness: number;
    gap: number;
    outline: number;
    outlineEnabled: boolean;
    centerDotEnabled: boolean;
    color: number;
    alpha: number;
    alphaEnabled: boolean;
  };
}
```

---

## 🔍 Common Patterns

### Adding to History
```typescript
addToHistory({
  shareCode,
  aliasName: aliasName || undefined,
  settings: { /* crosshair data */ }
})
setHistoryKey(prev => prev + 1) // Trigger refresh
```

### Toggle Favorite
```typescript
const newFavStatus = toggleFavorite({
  shareCode,
  aliasName: aliasName || undefined,
  settings: { /* crosshair data */ }
})
setIsFavorite(newFavStatus)
```

### Copy to Clipboard
```typescript
await navigator.clipboard.writeText(text)
toast({ title: "Copied!" })
```

---

## 🎨 Animation Delays

```css
Header:   0.0s
Card 1:   0.1s (animate-[slide-in-up_0.5s_ease-out_0.1s_both])
Card 2:   0.2s
Card 3:   0.3s
FAQ:      0.4s
Footer:   0.5s
```

---

## 🐛 Debugging

### Check localStorage
```javascript
localStorage.getItem('cs2_crosshair_history')
localStorage.getItem('cs2_crosshair_favorites')
```

### Clear storage
```javascript
localStorage.clear()
// Or use browser DevTools → Application → Storage
```

### Force history refresh
```typescript
setHistoryKey(prev => prev + 1)
```

---

## 📦 Dependencies

```json
{
  "@radix-ui/react-accordion": "^1.2.x",
  "@radix-ui/react-dialog": "^1.1.x",
  "@radix-ui/react-scroll-area": "^1.2.x",
  "@radix-ui/react-tabs": "^1.1.x",
  "lucide-react": "^0.462.x"
}
```

---

## 🔧 Customization

### Change max history items
```typescript
// In src/lib/storage.ts
const MAX_HISTORY_ITEMS = 20; // Change this
```

### Change max favorites
```typescript
const MAX_FAVORITE_ITEMS = 50; // Change this
```

### Modify animations
```css
/* In src/index.css */
@keyframes slide-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 🎯 Testing Checklist

- [ ] Generate crosshair → appears in history
- [ ] Star crosshair → appears in favorites
- [ ] Remove from history → disappears
- [ ] Load from history → populates inputs
- [ ] Copy to clipboard → shows success toast
- [ ] Keyboard shortcuts work
- [ ] FAQ expands/collapses
- [ ] Mobile layout responsive
- [ ] Validation shows correct states
- [ ] localStorage persists across refresh

---

## 📝 Code Snippets

### Add a new FAQ item
```typescript
// In src/components/FAQ.tsx
const faqs = [
  {
    question: "Your question?",
    answer: "Your detailed answer here..."
  },
  // ... existing items
]
```

### Add a new keyboard shortcut
```typescript
// In src/components/KeyboardShortcuts.tsx
{
  category: 'Your Category',
  items: [
    { keys: ['Ctrl', 'S'], description: 'Save something' }
  ]
}
```

### Add a new trust badge
```typescript
// In CS2ConfigGenerator.tsx header
<span className="trust-badge">
  <YourIcon className="w-3 h-3" />
  Your Text
</span>
```

---

## 🌐 Browser APIs Used

- `localStorage` - Data persistence
- `navigator.clipboard` - Copy functionality
- `navigator.share` - Web Share API
- `AudioContext` - Success sound
- `URL.createObjectURL` - File downloads

---

## 🔒 Security Notes

- All data stored locally (no server)
- No external API calls for crosshair data
- HTTPS required for clipboard API
- No cookies or tracking

---

## 📚 Documentation Files

- `ENHANCEMENTS_SUMMARY.md` - User-facing summary
- `UI_UX_ENHANCEMENTS.md` - Detailed technical docs
- `VISUAL_GUIDE.md` - Layout and design guide
- `QUICK_REFERENCE.md` - This file

---

## 🎨 Icon Reference

| Icon | Component | Usage |
|------|-----------|-------|
| `Crosshair` | Main logo | Header |
| `Star` | Favorites | Toggle favorite |
| `Clock` | Timestamp | History items |
| `Download` | Download | Config download |
| `ClipboardCopy` | Copy | Copy to clipboard |
| `Keyboard` | Shortcuts | Shortcuts modal |
| `HelpCircle` | Help | Tooltips |
| `Trash2` | Delete | Remove from history |
| `Check` | Success | Validation |
| `AlertCircle` | Error | Validation |
| `Shield` | Security | Privacy badge |

All from `lucide-react`

---

## 🚀 Performance Tips

1. **Debounce validation** (already implemented)
2. **Use React.memo** for heavy components
3. **Lazy load FAQ** for faster initial load
4. **Virtual scrolling** for large history lists
5. **Code splitting** for routes

---

## 📱 Mobile Gotchas

- Touch target min 44x44px ✅
- No hover on mobile (use active states)
- Viewport meta tag required ✅
- Test on real devices
- Consider swipe gestures for future

---

## 🔮 Future Enhancements Ideas

```typescript
// Potential additions:
- Crosshair comparison view
- Batch export multiple configs
- Import from file
- Search/filter history
- Tags for organization
- Cloud sync (optional)
- Dark mode toggle
- More preview backgrounds
```

---

## 🆘 Common Issues

**Issue**: History not updating
**Fix**: Force refresh with `setHistoryKey(prev => prev + 1)`

**Issue**: Clipboard not working
**Fix**: Ensure HTTPS or localhost, check browser permissions

**Issue**: localStorage full
**Fix**: Clear old data or increase MAX limits

**Issue**: Animations not smooth
**Fix**: Check for CSS conflicts, ensure `tailwindcss-animate` installed

---

**Version**: 2.0.0  
**Last Updated**: January 2024  
**Maintainer**: delli.cc