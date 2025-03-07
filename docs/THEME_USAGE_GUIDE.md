# Theme Usage Guide

This guide demonstrates how to implement and use the theming system in our application.

## Theme Structure

Our application supports multiple themes:
- **Cyberpunk**: A neon-colored, tech-noir aesthetic
- **Protoss Nexus**: A purple-gold theme inspired by StarCraft's Protoss civilization

## Implementation Approach

The theming system is built on several layers:

1. **CSS Variables**: Theme colors and properties are defined as CSS variables
2. **Theme-Specific CSS**: Each theme has its own CSS file with theme-specific styles
3. **Theme Components**: Helper components to make theme switching easier
4. **Tailwind Extensions**: Custom variants for applying theme-specific styles

## How to Use in Components

### 1. Basic Theme-Aware UI Elements

Use the CSS variables directly in your components:

```jsx
// CSS variables adapt automatically to the current theme
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Content</p>
</div>
```

### 2. Theme-Specific Class Names

We provide theme-specific utility classes:

```jsx
// These classes change appearance based on the active theme
<button className="theme-button theme-button-primary">
  Submit
</button>

<div className="theme-card crystal-accents">
  <div className="energy-wave"></div>
  <h2 className="text-primary">Card Title</h2>
</div>
```

### 3. Using Theme Context

Import the theme hook for conditional rendering:

```jsx
import { useTheme, ThemedContent } from '@/lib/hooks/use-theme';

function MyComponent() {
  const { isProtoss, isCyberpunk } = useTheme();
  
  return (
    <div>
      {isProtoss && <h1 className="font-mono-theme text-psi-gold">Protoss Header</h1>}
      {isCyberpunk && <h1 className="text-cyber-blue">Cyberpunk Header</h1>}
    </div>
  );
}
```

### 4. Using the ThemedContent Component

For cleaner conditional rendering:

```jsx
import { ThemedContent } from '@/lib/hooks/use-theme';

<ThemedContent
  protoss={
    <button className="psi-button">Protoss Button</button>
  }
  cyberpunk={
    <button className="cyber-button">Cyberpunk Button</button>
  }
/>
```

### 5. Using Tailwind Variants

Our custom Tailwind plugin adds theme variants:

```jsx
<div className="
  bg-card 
  text-sm 
  cyberpunk:text-cyan-400 
  protoss:text-psi-gold 
  cyberpunk:border-cyber-blue/50 
  protoss:border-psi-blade/50
">
  This text changes color based on theme
</div>
```

## Theme-Specific Components

For complex UI elements, we provide ready-made theme components:

```jsx
import { ThemeMarketCard } from '@/components/theme-market-card';

<ThemeMarketCard market={marketData} />
```

## Theme-Specific Fonts

Use the following classes for theme-specific fonts:

```jsx
<h1 className="font-display">
  This will be Inter in Cyberpunk theme and JetBrains Mono in Protoss theme
</h1>

<div className="font-theme">
  The primary font for the current theme
</div>

<code className="font-mono-theme">
  The monospace font for the current theme
</code>
```

## Implementing New Themes

To add a new theme:

1. Create a new CSS file in `/styles/your-theme.css`
2. Define theme variables and specific component styles
3. Import the theme file in `globals.css`
4. Add the theme variant to the Tailwind plugin
5. Update the theme context to include the new theme

## Best Practices

1. **Separate Theme-Specific Code**:
   - Put theme-specific styles in theme CSS files, not in globals.css

2. **Use the Theme Context**:
   - For conditional rendering based on the active theme

3. **Prefer Utility Classes**:
   - Use theme-button, theme-card, etc. instead of hardcoding styles

4. **Component-Level Themes**:
   - For complex components, create theme-specific versions

5. **Use Tailwind Theme Variants**:
   - For simple conditional styling based on theme