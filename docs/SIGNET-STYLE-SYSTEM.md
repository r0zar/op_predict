# Signet Design System Implementation

This document outlines how the Signet Design System has been implemented in the OP_PREDICT application, providing a futuristic, cyberpunk aesthetic.

## Core Components

### Theme Provider
- Implemented using `next-themes` for seamless theme switching
- Dark/light mode toggle with system preference detection
- Persistent theme choice using local storage

### Colors
- Cyberpunk-inspired color palette with neon accents
- HSL color definitions for easy manipulation of opacity and other properties
- Named color variables like `--cyber-blue`, `--neon-green`, `--neon-pink`

### Typography
- Primary font: Inter for UI text
- Monospace font: JetBrains Mono for technical data and code
- Text glow effects for important headings and values

### Special Effects
- 3D tilt effect on cards with `transform-style: preserve-3d`
- Scanline animation for retro-futuristic feel
- Glow effects on interactive elements
- Corner accents for panels to create a tech aesthetic

## Usage Guidelines

### Cards
The Card component now accepts additional props:
```tsx
<Card 
  variant="panel"      // "default" | "cyber" | "panel"
  tilt={true}          // Enable 3D hover effect
  glowHover={true}     // Enable glow effect on hover
  cornerAccents={true} // Add corner accents
>
  <CardTitle glow="cyber">Card Title</CardTitle>
</Card>
```

### Buttons
The Button component has new variants and a glow option:
```tsx
<Button variant="default" glow={true}>Cyber Button</Button>
<Button variant="success">Success Action</Button>
<Button variant="destructive">Destructive Action</Button>
<Button variant="warning">Warning Action</Button>
```

### Utility Classes
Several utility classes are available for adding Signet-style effects:
- `.text-glow` - Add a cyan text glow
- `.text-glow-purple` - Add a purple text glow
- `.text-glow-pink` - Add a pink text glow
- `.pulse-glow` - Animated pulsing glow effect
- `.bg-cyber-gradient` - Cyberpunk-inspired gradient background
- `.bg-panel-gradient` - Panel background with subtle gradient
- `.tilt-card` - Apply 3D tilt effect on hover
- `.corner-accents` - Add corner accents to create a tech frame

## Dark/Light Mode

The Signet theme system supports both dark and light modes with carefully chosen colors for each context:

### Dark Mode (Default)
- Deep, dark backgrounds with vibrant neon accents
- Full glow effects for maximum cyberpunk aesthetic

### Light Mode
- Clean white backgrounds with more subtle neon accents
- Reduced glow effects for better daylight readability

## Implementation Details

1. **CSS Variables**
   All colors and design tokens are defined as CSS variables in `globals.css`

2. **Tailwind Configuration**
   Extended Tailwind with custom colors, animations, and utilities

3. **Component Overrides**
   Enhanced core UI components with Signet design features

4. **Theme Integration**
   Used next-themes for theme management with system preference detection

## Future Improvements

1. **Component Consistency**
   - Continue updating all components to follow the Signet aesthetic
   - Create a comprehensive component showcase

2. **Animation Performance**
   - Optimize animations for better performance on mobile devices
   - Consider reduced motion preferences

3. **Accessibility**
   - Ensure all glow and animation effects respect reduced motion preferences
   - Maintain contrast ratios for text readability
   - Test with screen readers and keyboard navigation

4. **Additional Effects**
   - Implement holographic cards for premium content
   - Add circuit-board background patterns
   - Create more interactive hover states