# Grip — Brand Assets

**Version 1.0.0 · April 2026**

The canonical home for Grip's visual identity. Use these assets anywhere the brand shows up: app, website, social, print, clubhouse signage.

---

## What's here

```
brand/
├── tokens.css           — CSS custom properties + utility classes
├── tokens.json          — Same values, machine-readable
├── logo/
│   ├── grip-wordmark.svg          — Primary. Ink on cream.
│   ├── grip-wordmark-inverse.svg  — Cream on ink.
│   ├── grip-wordmark-mono.svg     — Single-color, uses currentColor.
│   ├── grip-icon.svg              — 512×512 app icon (Fairway).
│   ├── grip-icon-light.svg        — 512×512 app icon (Cream).
│   ├── grip-icon-dark.svg         — 512×512 app icon (Ink).
│   ├── grip-favicon.svg           — 96×96 favicon.
│   └── grip-lockup-tagline.svg    — Wordmark + "Find your fourth."
├── icons/
│   ├── ball · flag · pair · pin · calendar
│   ├── handshake · chat · arrow-right
│   └── check · plus
│         (80×80, currentColor fills)
└── patterns/
    └── dimples.svg       — Repeating dimple pattern.
```

Open `Grip Design System.html` for the live reference with every asset downloadable inline.

---

## Colors

| Token              | Hex       | Role                 |
|--------------------|-----------|----------------------|
| `--grip-fairway`   | `#2F5D4A` | Primary              |
| `--grip-cream`     | `#F4EEE0` | Background / ground  |
| `--grip-cream-deep`| `#EAE1CB` | Secondary surface    |
| `--grip-ink`       | `#1A1F1C` | Text, dark surface   |
| `--grip-sunset`    | `#C66B4A` | Accent — sparing     |
| `--grip-moss`      | `#7A8B6A` | Support              |

**Rule of thumb:** 70 cream · 20 fairway · 7 ink · 3 sunset.

## Fonts (all free)

- **Fraunces** — Display / headlines. Regular 400, italic 300.
- **DM Sans** — UI / body. Regular 400, Medium 500.
- **JetBrains Mono** — Labels, timestamps, data. Medium 500.

Loaded from Google Fonts — no licensing needed.

---

## Quick start

```html
<link rel="stylesheet" href="brand/tokens.css">
<link rel="icon" type="image/svg+xml" href="brand/logo/grip-favicon.svg">

<body class="grip-body">
  <h1 class="grip-h1">
    Find your <em class="grip-italic">fourth</em>.
  </h1>
  <button class="grip-btn grip-btn-primary">Say hello</button>
</body>
```

Available utility classes: `grip-body`, `grip-display`, `grip-h1`, `grip-h2`, `grip-h3`, `grip-lead`, `grip-body`, `grip-mono`, `grip-italic`, `grip-btn`, `grip-btn-primary`, `grip-btn-secondary`, `grip-btn-ghost`, `grip-tag`, `grip-tag-primary`, `grip-tag-accent`, `grip-card`, `grip-card-cream`, `grip-card-ink`, `grip-card-green`, `grip-input`, `grip-avatar`, `grip-rule`.

---

## Do / Don't

**Do**
- Let cream breathe — generous margins, lots of whitespace.
- Use the italic `i` treatment in `grip` only in the logo.
- Use the italic serif to emphasize one word per line — never two.

**Don't**
- Put the wordmark inside a rounded rectangle.
- Pair sunset with moss — they fight.
- Use Fraunces for body copy. DM Sans does that job.
- Add drop shadows, outer glows, or strokes to the logo.

---

## Voice — in one sentence

A friend who happens to golf, not a golfer who happens to have a friend.
