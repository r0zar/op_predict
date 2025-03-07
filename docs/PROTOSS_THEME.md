# Protoss Nexus Design System Style Guide

This comprehensive style guide outlines the design language, components, and principles of the Protoss Nexus theme. Drawing inspiration from the advanced Protoss civilization of StarCraft II, this theme embodies their sophisticated technology, psionic energy, and elegant crystalline structures.

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [UI Components](#ui-components)
5. [Animations and Interactions](#animations-and-interactions)
6. [Iconography](#iconography)
7. [Spacing and Layout](#spacing-and-layout)
8. [Implementation Guidelines](#implementation-guidelines)

---

## Brand Identity

### Core Values
- **Advanced Technology**: Sophisticated, highly evolved systems
- **Psionic Power**: Energy-based, luminous, ethereal
- **Unity**: Harmony, connection through the Khala
- **Precision**: Elegant craftsmanship, meticulous detail

### Personality
- Sophisticated and ancient
- Powerful yet elegant
- Mysterious but accessible
- Advanced without being overwhelming

### Voice
- **Formal**: Elevated, sophisticated language
- **Wise**: Insights from ancient knowledge
- **Direct**: Clear, purposeful communication
- **Harmonious**: Balance between assertiveness and wisdom

---

## Color System

### Primary Palette

| Color Name | Hex Code | HSL | Usage |
|------------|----------|-----|-------|
| Void Void | `#080216` | `260 80% 5%` | Primary background |
| Void Dark | `#100a25` | `260 60% 10%` | Secondary background, panels |
| Void Medium | `#1d1542` | `260 50% 17%` | Tertiary background, cards |
| Psi Gold | `#ffda7b` | `43 100% 74%` | Primary accent, highlights, glows |

### Secondary Palette

| Color Name | Hex Code | HSL | Usage |
|------------|----------|-----|-------|
| Psi Energy | `#7af0d5` | `167 80% 71%` | Success, approval, positive actions |
| Psi Blade | `#bd93f9` | `265 83% 78%` | Primary interaction, buttons, special accent |
| Psi Storm | `#ff79c6` | `330 100% 74%` | Destructive actions, warnings |
| Warp Field | `#56ffa4` | `150 100% 67%` | Temporal actions, processing |
| Shield Aura | `#7dacff` | `220 100% 74%` | Protection, security, safe zones |

### Neutrals

| Color Name | Hex Code | HSL | Usage |
|------------|----------|-----|-------|
| Khala Light | `#f8f8f2` | `60 30% 96%` | Text, icons on dark backgrounds |
| Khala Medium | `#a294d0` | `260 45% 70%` | Secondary text, disabled states |
| Khala Dark | `#4d4273` | `260 27% 35%` | Borders, dividers, inactive elements |

### Color Usage Guidelines

- Use color to establish hierarchy and create a sense of technology and energy
- Apply Psi Gold with restraint to highlight the most important elements
- Pair dark void backgrounds with luminous psionic accents
- Use color transparency to create depth (common values: 11%, 22%, 44%, 66%, 88%)
- Implement glowing effects on interactive elements using psionic colors

### Example Gradients

```css
/* Primary background gradient */
background: linear-gradient(180deg, #080216 0%, #100a25 100%);

/* Panel background gradient */
background: linear-gradient(160deg, #100a25 0%, #1d1542 100%);

/* Psi energy gradient */
background: linear-gradient(120deg, #ffda7b 0%, #bd93f9 100%);

/* Shield aura glow */
box-shadow: 0 0 15px rgba(125, 172, 255, 0.4), 0 0 30px rgba(125, 172, 255, 0.2);
```

---

## Typography

### Font Families

- **Primary Font**: Inter (UI text, body content)
- **Display Font**: JetBrains Mono (headers, feature text)
- **System Fallbacks**: -apple-system, system-ui, sans-serif

### Font Weights

- **Regular**: 400 (body text, general content)
- **Medium**: 500 (section headers, emphasized text)
- **Semi-Bold**: 600 (buttons, interactive elements)
- **Bold**: 700 (primary headers, important information)

### Type Scale

| Size Name | Size (px) | Line Height | Usage |
|-----------|-----------|-------------|-------|
| Micro | 10px | 14px | Legal text, footnotes, timestamps |
| Small | 12px | 16px | Secondary information, details |
| Body | 14px | 20px | Main body text, descriptions |
| UI | 16px | 24px | Buttons, inputs, navigation |
| Title | 18px | 28px | Section headings, card titles |
| Heading | 24px | 32px | Major section headings |
| Display | 32px | 40px | Page titles, main headings |

### Typography Examples

```css
/* Main heading */
font-family: 'JetBrains Mono', monospace;
font-weight: 700;
font-size: 24px;
letter-spacing: -0.02em;
color: #ffda7b;
text-transform: uppercase;

/* Body text */
font-family: 'Inter', -apple-system, system-ui, sans-serif;
font-weight: 400;
font-size: 14px;
line-height: 20px;
color: #f8f8f2;

/* Psionic data */
font-family: 'JetBrains Mono', monospace;
font-weight: 500;
font-size: 12px;
letter-spacing: 0.05em;
color: #7af0d5;
```

---

## UI Components

### Buttons

#### Primary Button
- Background: Psi Blade (#bd93f911 with border #bd93f966)
- Text: Psi Blade (#bd93f9)
- Font: Inter Semi-Bold, 12-14px, uppercase
- Hover: Scale 1.05, glow effect with psionic energy
- Active: Scale 0.95
- Border-radius: 4px
- Border: 1px solid rgba(189, 147, 249, 0.4)

#### Secondary Button
- Background: Transparent with border #4d427366
- Text: Khala Light (#f8f8f2)
- Font: Inter Medium, 12-14px, uppercase
- Hover: Scale 1.05, border color change to psionic energy
- Active: Scale 0.95
- Border-radius: 4px

#### Action Button Variants
- Approve/Confirm: Psi Energy (#7af0d5)
- Reject/Cancel: Psi Storm (#ff79c6)
- Processing/Loading: Warp Field (#56ffa4)
- Protection/Security: Shield Aura (#7dacff)

### Cards and Panels

#### Standard Panel
- Background: Linear gradient from Void Dark to Void Medium
- Border: 1px solid rgba(255, 218, 123, 0.3)
- Crystal Accents: Glowing highlights in corners resembling psionic crystals
- Box Shadow: 0 0 15px rgba(0, 0, 0, 0.7), 0 0 5px rgba(255, 218, 123, 0.13)
- Border-radius: 6px
- Padding: 16px

#### Notification Panel
- Features crystalline pattern header with status indicator
- Contains message content and actionable buttons
- Uses border glow with appropriate psionic energy color
- Implements subtle hover effect imitating psionic resonance

### Form Elements

#### Input Field
- Background: Void Medium (#1d1542)
- Border: 1px solid #4d4273
- Text: Khala Light (#f8f8f2)
- Focus: Border color Psi Blade (#bd93f966)
- Placeholder: Khala Medium (#a294d0)
- Border-radius: 4px
- Padding: 8px 12px

#### Toggle/Switch
- Off State: Khala Dark (#4d4273)
- On State: Psi Blade (#bd93f9)
- Knob: Khala Light (#f8f8f2)
- Transition: Smooth 0.2s with psionic glow when active

### Misc UI Elements

#### Dividers
- Color: Khala Dark (#4d427366)
- Optional gradient fade: transparent to Khala Dark to transparent
- Optional crystalline pattern for major section dividers

#### Progress Indicators
- Track: Khala Dark (#4d4273)
- Fill: Psi Energy to Psi Blade gradient with animated glow
- Pulsing animation for indeterminate state resembling psionic energy flow

---

## Animations and Interactions

### Principles
- **Purpose**: Animations should convey psionic energy and crystalline technology
- **Performance**: Optimize for performance, use GPU-accelerated properties
- **Elegance**: Effects should be smooth and sophisticated
- **Sci-Fi Feel**: Lean into Protoss technological aesthetic

### Duration Guidelines
- **Ultra Fast**: 100ms (state changes)
- **Fast**: 200-300ms (simple transitions)
- **Medium**: 300-500ms (emphasis transitions)
- **Slow**: 500-800ms (feature presentations)

### Standard Transitions

#### Hover Effects
```css
transition: all 0.2s cubic-bezier(0.43, 0.13, 0.23, 0.96);
transform: scale(1.05);
box-shadow: 0 0 15px rgba(255, 218, 123, 0.4);
```

#### Entry Animations
```css
/* For notifications, modals, panels */
@keyframes psionicFadeIn {
  from {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
    filter: blur(3px);
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
}
animation: psionicFadeIn 0.4s cubic-bezier(0.43, 0.13, 0.23, 0.96) forwards;
```

#### Exit Animations
```css
/* Psionic disintegration effect */
@keyframes psionicDissolve {
  to {
    opacity: 0;
    filter: blur(5px);
    transform: scale(1.1);
  }
}
animation: psionicDissolve 0.4s cubic-bezier(0.43, 0.13, 0.23, 0.96) forwards;
```

### Special Effects

#### Crystal Resonance
- Apply subtle rotation and scale oscillation to mimic crystal resonance
- Add perspective and transform-style: preserve-3d
- Use spring physics for natural movement

```javascript
// Example spring configuration
const resonanceConfig = {
  stiffness: 200,     // Balanced for crystal movement
  damping: 20,        // Higher for elegant movement
  mass: 0.8,          // Lower for responsive oscillation
};
```

#### Psionic Glow
```css
@keyframes psionicGlow {
  0% { box-shadow: 0 0 5px rgba(255, 218, 123, 0.4); }
  50% { box-shadow: 0 0 15px rgba(255, 218, 123, 0.7), 0 0 25px rgba(189, 147, 249, 0.3); }
  100% { box-shadow: 0 0 5px rgba(255, 218, 123, 0.4); }
}
animation: psionicGlow 3s infinite ease-in-out;
```

#### Energy Wave
```css
@keyframes energyWave {
  0% { transform: translateY(-100%) scaleX(0.8); opacity: 0.7; }
  50% { transform: translateY(0) scaleX(1); opacity: 1; }
  100% { transform: translateY(100%) scaleX(0.8); opacity: 0.7; }
}

.energy-wave {
  position: absolute;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 218, 123, 0.7), rgba(189, 147, 249, 0.7), transparent);
  animation: energyWave 3s infinite cubic-bezier(0.43, 0.13, 0.23, 0.96);
  pointer-events: none;
}
```

---

## Iconography

### Icon Style
- Line weight: 1.5-2px
- Corner radius: 1px
- Style: Crystalline, geometric, advanced
- Sizing: 16px, 20px, 24px (standard)
- Color: Typically Khala Light (#f8f8f2) or Psi Gold (#ffda7b)

### System Icons
Provide a consistent set of icons influenced by Protoss technology:
- Navigation: triangular arrows, energy menu, psionic close
- Actions: crystalline add, edit, delete, save
- Feedback: energy success, warning, error, info
- Media: Protoss-styled play, pause, volume, fullscreen
- Objects: pylon, nexus, crystal, settings

### Icon Guidelines
- Design icons with subtle crystalline or triangular elements
- Pair with text labels for clarity when appropriate
- Maintain consistent padding within the icon bounding box
- Consider slight energy glow effects for important interactive icons

---

## Spacing and Layout

### Spacing Scale
A consistent spacing scale based on 4px increments:

| Token | Size (px) | Usage |
|-------|-----------|-------|
| space-1 | 4px | Minimum spacing, tight grouping |
| space-2 | 8px | Default spacing between related items |
| space-3 | 16px | Standard spacing between components |
| space-4 | 24px | Spacing between sections |
| space-5 | 32px | Large spacing, page sections |
| space-6 | 64px | Major page divisions |

### Layout Guidelines
- Use triangular and hexagonal grids where appropriate for Protoss aesthetic
- Maintain consistent margins (typically 16px or 24px)
- Group related information with crystalline visual motifs
- Use negative space strategically to create focus on psionic elements
- Implement hierarchy through size, position, and psionic coloring

### Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Default content |
| Raised | 10 | Slightly elevated components |
| Navigation | 100 | Sticky headers, persistent navigation |
| Overlay | 1000 | Modals, overlays |
| Popover | 2000 | Tooltips, popovers |
| Notification | 9999 | Notifications, alerts |

---

## Implementation Guidelines

### CSS Variables

```css
:root {
  /* Colors */
  --void-void: #080216;
  --void-dark: #100a25;
  --void-medium: #1d1542;
  --psi-gold: #ffda7b;
  --psi-energy: #7af0d5;
  --psi-blade: #bd93f9;
  --psi-storm: #ff79c6;
  --warp-field: #56ffa4;
  --shield-aura: #7dacff;
  --khala-light: #f8f8f2;
  --khala-medium: #a294d0;
  --khala-dark: #4d4273;
  
  /* Tailwind CSS vars - mapping to Protoss Nexus colors */
  --background: 260 80% 5%;
  --foreground: 60 30% 96%;
  --card: 260 60% 10%;
  --card-foreground: 60 30% 96%;
  --popover: 260 60% 10%;
  --popover-foreground: 60 30% 96%;
  --primary: 265 83% 78%;
  --primary-foreground: 0 0% 0%;
  --secondary: 43 100% 74%;
  --secondary-foreground: 0 0% 0%;
  --accent: 167 80% 71%;
  --accent-foreground: 0 0% 0%;
  --muted: 260 50% 17%;
  --muted-foreground: 260 45% 70%;
  --destructive: 330 100% 74%;
  --destructive-foreground: 0 0% 100%;
  --border: 260 27% 35%;
  --input: 260 27% 35%;
  --ring: 265 83% 78%;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, system-ui, sans-serif;
  --font-display: 'JetBrains Mono', monospace;
  --font-micro: 10px;
  --font-small: 12px;
  --font-body: 14px;
  --font-ui: 16px;
  --font-title: 18px;
  --font-heading: 24px;
  --font-display-size: 32px;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 64px;
  
  /* Borders */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  
  /* Animation */
  --duration-fast: 0.2s;
  --duration-medium: 0.4s;
  --duration-slow: 0.8s;
  --ease-standard: cubic-bezier(0.36, 0.66, 0.04, 1);
  --ease-spring: cubic-bezier(0.43, 0.13, 0.23, 0.96);
}
```

### Protoss-Specific CSS Classes

```css
/* Crystal-inspired gradients */
.bg-crystal-gradient {
  @apply bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 
         border border-secondary/30;
}

.bg-psionic-panel {
  @apply bg-gradient-to-b from-card to-card/80
         border border-secondary/20;
}

/* Crystal glow effects */
.crystal-glow {
  @apply relative overflow-hidden;
}

.crystal-glow::before {
  content: "";
  @apply absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none;
  box-shadow: 0 0 15px theme('colors.secondary'), 0 0 30px theme('colors.primary/20');
}

.crystal-glow:hover::before {
  @apply opacity-100;
}

/* Protoss button variants */
.psi-button {
  @apply relative overflow-hidden bg-transparent text-primary font-medium
         border border-primary/50 px-4 py-2 rounded-md
         hover:shadow-md hover:shadow-primary/20
         transition-all duration-300 transform hover:scale-105 active:scale-95;
}

.psi-button-energy {
  @apply relative overflow-hidden bg-transparent text-accent font-medium
         border border-accent/50 px-4 py-2 rounded-md
         hover:shadow-md hover:shadow-accent/20
         transition-all duration-300 transform hover:scale-105 active:scale-95;
}

.psi-button-storm {
  @apply relative overflow-hidden bg-transparent text-destructive font-medium
         border border-destructive/50 px-4 py-2 rounded-md
         hover:shadow-md hover:shadow-destructive/20
         transition-all duration-300 transform hover:scale-105 active:scale-95;
}

/* Psionic text effects */
.text-psionic {
  text-shadow: 0 0 5px theme('colors.secondary/30'), 0 0 10px theme('colors.secondary/20');
}

.text-psionic-energy {
  text-shadow: 0 0 5px theme('colors.accent/30'), 0 0 10px theme('colors.accent/20');
}

.text-psionic-blade {
  text-shadow: 0 0 5px theme('colors.primary/30'), 0 0 10px theme('colors.primary/20');
}

/* Psionic pulse animation */
.pulse-psionic {
  animation: pulse-psionic 3s infinite ease-in-out;
}

@keyframes pulse-psionic {
  0% { box-shadow: 0 0 5px theme('colors.secondary/40'); }
  50% { box-shadow: 0 0 15px theme('colors.secondary/70'), 0 0 25px theme('colors.primary/30'); }
  100% { box-shadow: 0 0 5px theme('colors.secondary/40'); }
}

/* Crystal accents for panels */
.crystal-accents {
  @apply relative;
}

.crystal-accents::before,
.crystal-accents::after {
  content: "";
  @apply absolute w-4 h-4 border-secondary/50 pointer-events-none;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.crystal-accents::before {
  @apply top-0 left-0 border-t border-l;
}

.crystal-accents::after {
  @apply bottom-0 right-0 border-b border-r;
}
```

### Accessibility Considerations

- Maintain color contrast ratio of at least 4.5:1 for text
- Ensure interactive elements have appropriate focus states
- Provide alternative text for visual crystal elements
- Test all components with screen readers
- Support keyboard navigation for all interactive elements
- Include prefers-reduced-motion support for users sensitive to animations

---

## Practical Examples for Market Detail Page

### 1. Page Header Transformation

**Before:**
```jsx
<div className="bg-card rounded-lg p-4 mb-6">
  <h1 className="text-2xl font-bold mb-2">{market.title}</h1>
  <p className="text-muted-foreground">{market.description}</p>
</div>
```

**After:**
```jsx
<div className="bg-crystal-gradient rounded-lg p-4 mb-6 crystal-accents">
  <div className="energy-wave"></div>
  <h1 className="font-display text-2xl font-bold mb-2 text-secondary text-psionic uppercase">
    {market.title}
  </h1>
  <p className="text-khala-light">{market.description}</p>
</div>
```

### 2. Market Stats Panel

**Before:**
```jsx
<div className="grid grid-cols-3 gap-4 mb-6">
  <div className="bg-card p-3 rounded-md">
    <p className="text-sm text-muted-foreground">Total Volume</p>
    <p className="text-xl font-semibold">${market.volume}</p>
  </div>
  <div className="bg-card p-3 rounded-md">
    <p className="text-sm text-muted-foreground">Predictions</p>
    <p className="text-xl font-semibold">{market.predictionCount}</p>
  </div>
  <div className="bg-card p-3 rounded-md">
    <p className="text-sm text-muted-foreground">Time Left</p>
    <p className="text-xl font-semibold">{market.timeLeft}</p>
  </div>
</div>
```

**After:**
```jsx
<div className="grid grid-cols-3 gap-4 mb-6">
  <div className="bg-psionic-panel p-3 rounded-md crystal-glow">
    <p className="text-sm text-khala-medium font-mono">Total Volume</p>
    <p className="text-xl font-semibold text-psi-gold text-psionic">${market.volume}</p>
  </div>
  <div className="bg-psionic-panel p-3 rounded-md crystal-glow">
    <p className="text-sm text-khala-medium font-mono">Predictions</p>
    <p className="text-xl font-semibold text-psi-blade text-psionic-blade">{market.predictionCount}</p>
  </div>
  <div className="bg-psionic-panel p-3 rounded-md crystal-glow pulse-psionic">
    <p className="text-sm text-khala-medium font-mono">Time Left</p>
    <p className="text-xl font-semibold text-psi-energy text-psionic-energy">{market.timeLeft}</p>
  </div>
</div>
```

### 3. Prediction Form

**Before:**
```jsx
<div className="bg-card p-4 rounded-lg">
  <h2 className="text-lg font-semibold mb-4">Make Your Prediction</h2>
  <form>
    <div className="mb-4">
      <label className="block text-sm mb-1">Your Answer</label>
      <input type="text" className="w-full p-2 border rounded" />
    </div>
    <div className="mb-4">
      <label className="block text-sm mb-1">Amount</label>
      <input type="number" className="w-full p-2 border rounded" />
    </div>
    <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
      Submit Prediction
    </button>
  </form>
</div>
```

**After:**
```jsx
<div className="bg-psionic-panel p-4 rounded-lg crystal-accents">
  <h2 className="text-lg font-display text-secondary text-psionic uppercase mb-4">
    Make Your Prediction
  </h2>
  <form className="space-y-4">
    <div>
      <label className="block text-sm font-mono text-khala-medium mb-1">Your Answer</label>
      <input 
        type="text" 
        className="w-full p-2 bg-void-medium border border-khala-dark rounded-md text-khala-light
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 
                   transition-all duration-fast"
      />
    </div>
    <div>
      <label className="block text-sm font-mono text-khala-medium mb-1">Amount</label>
      <input 
        type="number" 
        className="w-full p-2 bg-void-medium border border-khala-dark rounded-md text-khala-light
                   focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50
                   transition-all duration-fast"
      />
    </div>
    <button 
      type="submit" 
      className="psi-button w-full py-3 flex justify-center items-center group"
    >
      <span className="mr-2">Submit Prediction</span>
      <svg className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
           viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </form>
</div>
```

### 4. Prediction History Section

**Before:**
```jsx
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">Recent Predictions</h2>
  <div className="divide-y">
    {predictions.map((prediction) => (
      <div key={prediction.id} className="py-3">
        <div className="flex justify-between">
          <p className="font-medium">{prediction.user}</p>
          <p className="text-sm text-muted-foreground">{prediction.date}</p>
        </div>
        <p>{prediction.answer}</p>
        <p className="text-sm font-medium">${prediction.amount}</p>
      </div>
    ))}
  </div>
</div>
```

**After:**
```jsx
<div className="mt-8">
  <h2 className="text-xl font-display font-bold text-secondary text-psionic uppercase mb-4 flex items-center">
    <div className="w-6 h-6 mr-2">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    Recent Predictions
  </h2>
  <div className="space-y-3">
    {predictions.map((prediction) => (
      <div 
        key={prediction.id} 
        className="bg-psionic-panel rounded-md p-3 crystal-glow transition-all duration-medium"
      >
        <div className="flex justify-between items-center mb-1">
          <p className="font-medium text-psi-blade">{prediction.user}</p>
          <p className="text-xs font-mono text-khala-medium">{prediction.date}</p>
        </div>
        <p className="text-khala-light mb-1">{prediction.answer}</p>
        <p className="text-sm font-medium text-psi-gold text-psionic">
          ${prediction.amount}
        </p>
      </div>
    ))}
  </div>
</div>
```

### 5. Market Resolution Status

**Before:**
```jsx
<div className={`px-4 py-2 rounded-md mb-6 ${
  market.status === 'open' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}`}>
  <p className="font-medium">
    Status: {market.status === 'open' ? 'Open for predictions' : 'Closed'}
  </p>
</div>
```

**After:**
```jsx
<div className={`px-4 py-3 rounded-md mb-6 relative overflow-hidden ${
  market.status === 'open' 
    ? 'border border-psi-energy/50' 
    : 'border border-psi-storm/50'
}`}>
  <div className={`absolute inset-0 opacity-10 ${
    market.status === 'open' 
      ? 'bg-psi-energy' 
      : 'bg-psi-storm'
  }`}></div>
  
  <div className="flex items-center">
    <div className={`w-3 h-3 rounded-full mr-2 ${
      market.status === 'open' 
        ? 'bg-psi-energy animate-pulse' 
        : 'bg-psi-storm'
    }`}></div>
    
    <p className={`font-display font-medium ${
      market.status === 'open' 
        ? 'text-psi-energy text-psionic-energy' 
        : 'text-psi-storm text-psionic-blade'
    }`}>
      Status: {market.status === 'open' ? 'Open for predictions' : 'Closed'}
    </p>
  </div>
</div>
```

These examples demonstrate how to apply the Protoss Nexus theme to transform the market detail page, incorporating the distinctive visuals of crystal accents, psionic energy effects, and the sophisticated color palette inspired by the Protoss civilization.

*This style guide is a living document that embodies the technological sophistication and psionic energy of the Protoss civilization while maintaining usability and accessibility for all users.*