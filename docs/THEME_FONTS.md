# Theme-Specific Font System

This document explains the typography system used in OP_PREDICT, including the theme-specific fonts and OpenType features.

## Font Selection Philosophy

Each theme has carefully selected fonts that reinforce the theme's aesthetic and enhance readability:

### Cyberpunk Theme

| Usage | Font | Rationale |
|-------|------|-----------|
| Primary Text | **Source Code Pro** | A monospaced font with excellent readability that reinforces the digital, technical feel of the Cyberpunk theme. Its clean lines and technical appearance evoke computer terminals and code displays. |
| Display/Headings | **Syncopate** | Angular and futuristic with strong, geometric shapes. Designed to stand out for headers and important UI elements with its distinctive digital aesthetic. |
| Monospace/Code | **JetBrains Mono** | Purpose-built for code with excellent ligatures and distinctly shaped characters that make code easier to read. Perfect for technical data displays. |

### Protoss Nexus Theme

| Usage | Font | Rationale |
|-------|------|-----------|
| Primary Text | **Exo 2** | A geometric sans-serif with alien undertones that balance readability with an otherworldly feel. Its subtle stylistic traits hint at non-human origins without sacrificing legibility. |
| Display/Headings | **Orbitron** | A geometric, sci-fi display font with distinctive angular characters that evoke an advanced alien civilization's writing system. |
| Monospace/Code | **Fira Code** | Modern monospace with excellent programming ligatures and a slightly mathematical feel that suggests advanced alien technology. |

## OpenType Features Implementation

We leverage various OpenType features to enhance both the aesthetics and readability of our text:

### Common Features Across Themes

- `calt` (Contextual Alternates): Adjusts letter shapes based on surrounding characters
- `liga` (Standard Ligatures): Combines common character sequences into single glyphs
- `kern` (Kerning): Adjusts spacing between specific letter pairs for better visual rhythm

### Cyberpunk Theme Features

```css
/* Primary text */
--font-feature-default: "calt" 1, "liga" 1, "clig" 1, "kern" 1;

/* Display text */
--font-feature-display: "calt" 1, "case" 1, "ss01" 1, "ss03" 1, "kern" 1;

/* Monospaced text */
--font-feature-mono: "calt" 1, "liga" 1, "zero" 1, "ss01" 1, "ss02" 1, "onum" 0, "tnum" 1;
```

- `clig` (Contextual Ligatures): More specialized ligatures that depend on context
- `case` (Case-Sensitive Forms): Optimized punctuation for all-caps text
- `ss01`, `ss02`, `ss03` (Stylistic Sets): Alternate character designs for a more digital look
- `zero` (Slashed Zero): Displays zeros with a slash for better distinction from the letter "O"
- `tnum` (Tabular Numbers): Monospaced numbers for better alignment in tables
- `onum` 0 (Oldstyle Figures): Disabled to maintain the technical, modern look

### Protoss Theme Features

```css
/* Primary text */
--font-feature-default: "calt" 1, "liga" 1, "salt" 1, "ss03" 1, "kern" 1;

/* Display text */
--font-feature-display: "case" 1, "salt" 1, "ss01" 1, "ss02" 1, "kern" 1, "cpsp" 1;

/* Monospaced text */
--font-feature-mono: "calt" 1, "liga" 1, "dlig" 1, "zero" 1, "ss01" 1, "ss04" 1, "tnum" 1;
```

- `salt` (Stylistic Alternates): Character alternatives that create a more alien appearance
- `cpsp` (Capital Spacing): Adds spacing between capitals for better legibility in headings
- `dlig` (Discretionary Ligatures): Decorative ligatures used sparingly for special emphasis

## Typography CSS Utility Classes

Use these classes to access specialized typographic features:

| Class | Purpose |
|-------|---------|
| `.font-theme` | Uses the theme's primary font with appropriate OpenType features |
| `.font-display` | Uses the theme's display font with appropriate OpenType features |
| `.font-mono-theme` | Uses the theme's monospaced font with coding ligatures |
| `.ligatures-on` | Explicitly enables standard, contextual, and discretionary ligatures |
| `.small-caps` | Converts text to small capitals |
| `.tabular-nums` | Forces monospaced number widths for tabular data |
| `.text-balance` | Uses CSS text-wrap:balance for better text wrapping |
| `.text-pretty` | Uses CSS text-wrap:pretty for improved paragraph layout |

## Theme-specific Custom Styling

Element-specific font styling is automatically applied based on the active theme:

### Automatically Styled Elements

- Headings (h1-h6)
- Buttons and interactive elements
- Form inputs
- Code blocks
- Navigation items

## Best Practices

1. Use the `.font-theme`, `.font-display`, and `.font-mono-theme` classes rather than hardcoding font-family values
2. For data displays and tables, use `.tabular-nums` for proper number alignment
3. Apply `.text-balance` to headings to improve line breaking
4. Apply `.text-pretty` to paragraphs to enhance readability
5. When displaying code, use the `.font-mono-theme` class to get correct ligatures and zero styling
6. For UI elements that should maintain theme consistency, rely on the theme's automatic styling