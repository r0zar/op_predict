import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="protoss"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        // Theme-specific font families
        theme: ["var(--font-primary)"],
        display: ["var(--font-display)"],
        "mono-theme": ["var(--font-mono)"],
      },
      colors: {
        // Standard Tailwind CSS variables
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // Cyberpunk Theme Colors
        'space-black': 'hsl(var(--space-black))',
        'space-dark': 'hsl(var(--space-dark))',
        'space-void': 'hsl(var(--space-void))',
        'cyber-blue': 'hsl(var(--cyber-blue))',
        'neon-green': 'hsl(var(--neon-green))',
        'neon-pink': 'hsl(var(--neon-pink))',
        'neon-red': 'hsl(var(--neon-red))',
        'neon-purple': 'hsl(var(--neon-purple))',
        'neon-orange': 'hsl(var(--neon-orange))',
        'steel': 'hsl(var(--steel))',
        'dark-steel': 'hsl(var(--dark-steel))',
        
        // Protoss Theme Colors
        'void-void': 'hsl(var(--void-void))',
        'void-dark': 'hsl(var(--void-dark))',
        'void-medium': 'hsl(var(--void-medium))',
        'psi-gold': 'hsl(var(--psi-gold))',
        'psi-energy': 'hsl(var(--psi-energy))',
        'psi-blade': 'hsl(var(--psi-blade))',
        'psi-storm': 'hsl(var(--psi-storm))',
        'warp-field': 'hsl(var(--warp-field))',
        'shield-aura': 'hsl(var(--shield-aura))',
        'khala-light': 'hsl(var(--khala-light))',
        'khala-medium': 'hsl(var(--khala-medium))',
        'khala-dark': 'hsl(var(--khala-dark))',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        DEFAULT: 'var(--radius)',
      },
      animation: {
        // UI Component animations
        'accordion-down': 'accordion-down var(--duration-fast) var(--ease-standard)',
        'accordion-up': 'accordion-up var(--duration-fast) var(--ease-standard)',
        
        // Cyberpunk effect animations
        'nav-shimmer': 'navShimmer 12s var(--ease-standard) infinite',
        'shimmer': 'shimmer 3s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'border-pulse': 'borderPulse 2s infinite',
        'neon-pulse': 'neonPulse 2s infinite',
        
        // Motion animations
        'fade-in': 'fadeIn var(--duration-medium) var(--ease-standard)',
        'slide-in-up': 'slideInUp var(--duration-medium) var(--ease-spring)',
        'float': 'float 6s var(--ease-spring) infinite',
        
        // Effect animations
        'shake': 'shake var(--duration-fast) var(--ease-standard)',
        'ping-slow': 'pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-slow': 'bounceSlow 2s infinite',
        'cyber-glitch': 'cyberGlitch 1s var(--ease-standard) infinite',
        'particle': 'particle 1s var(--ease-standard) forwards',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        navShimmer: {
          '0%': { 
            backgroundPosition: '-100% 0',
            opacity: '0',
          },
          '20%': { opacity: '0.6' },
          '80%': { opacity: '0.6' },
          '100%': { 
            backgroundPosition: '200% 0',
            opacity: '0',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideInUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        borderPulse: {
          '0%': { borderColor: 'hsl(var(--cyber-blue) / 0.3)' },
          '50%': { borderColor: 'hsl(var(--cyber-blue) / 0.8)' },
          '100%': { borderColor: 'hsl(var(--cyber-blue) / 0.3)' },
        },
        neonPulse: {
          '0%': {
            boxShadow: '0 0 5px hsl(var(--cyber-blue) / 0.7), 0 0 10px hsl(var(--cyber-blue) / 0.5), 0 0 15px hsl(var(--cyber-blue) / 0.3)'
          },
          '50%': {
            boxShadow: '0 0 10px hsl(var(--cyber-blue) / 0.8), 0 0 20px hsl(var(--cyber-blue) / 0.6), 0 0 30px hsl(var(--cyber-blue) / 0.4)'
          },
          '100%': {
            boxShadow: '0 0 5px hsl(var(--cyber-blue) / 0.7), 0 0 10px hsl(var(--cyber-blue) / 0.5), 0 0 15px hsl(var(--cyber-blue) / 0.3)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        cyberGlitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '10%': { transform: 'translate(-2px, 2px)' },
          '20%': { transform: 'translate(2px, -2px)' },
          '30%': { transform: 'translate(-2px, -2px)' },
          '40%': { transform: 'translate(2px, 2px)' },
          '50%': { transform: 'translate(-2px, 2px)' },
          '60%': { transform: 'translate(2px, -2px)' },
          '70%': { transform: 'translate(-2px, -2px)' },
          '80%': { transform: 'translate(2px, 2px)' },
          '90%': { transform: 'translate(-2px, 2px)' },
        },
        shake: {
          '0%': { transform: 'translate(1px, 1px) rotate(0deg)' },
          '10%': { transform: 'translate(-1px, -2px) rotate(-1deg)' },
          '20%': { transform: 'translate(-3px, 0px) rotate(1deg)' },
          '30%': { transform: 'translate(3px, 2px) rotate(0deg)' },
          '40%': { transform: 'translate(1px, -1px) rotate(1deg)' },
          '50%': { transform: 'translate(-1px, 2px) rotate(-1deg)' },
          '60%': { transform: 'translate(-3px, 1px) rotate(0deg)' },
          '70%': { transform: 'translate(3px, 1px) rotate(-1deg)' },
          '80%': { transform: 'translate(-1px, -1px) rotate(1deg)' },
          '90%': { transform: 'translate(1px, 2px) rotate(0deg)' },
          '100%': { transform: 'translate(1px, -2px) rotate(-1deg)' },
        },
        pingSlow: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        },
        particle: {
          '0%': { transform: 'translate(0, 0)', opacity: '1' },
          '100%': { transform: 'translate(var(--tw-translate-x), var(--tw-translate-y))', opacity: '0' },
        }
      },
      boxShadow: {
        // Cyberpunk theme shadows
        'cyber': '0 0 15px hsl(var(--cyber-blue) / 0.4), 0 0 30px hsl(var(--cyber-blue) / 0.2)',
        'cyber-sm': '0 0 5px hsl(var(--cyber-blue) / 0.3), 0 0 10px hsl(var(--cyber-blue) / 0.1)',
        'cyber-lg': '0 0 25px hsl(var(--cyber-blue) / 0.5), 0 0 50px hsl(var(--cyber-blue) / 0.3)',
        
        // Glow effects
        'glow': '0 0 15px hsl(var(--cyber-blue) / 0.7), 0 0 30px hsl(var(--cyber-blue) / 0.4)',
        'glow-sm': '0 0 10px hsl(var(--cyber-blue) / 0.5), 0 0 20px hsl(var(--cyber-blue) / 0.3)',
        
        // Neon effects
        'neon': '0 0 5px hsl(var(--cyber-blue) / 0.7), 0 0 10px hsl(var(--cyber-blue) / 0.5), 0 0 15px hsl(var(--cyber-blue) / 0.3)',
        'neon-strong': '0 0 10px hsl(var(--cyber-blue) / 0.8), 0 0 20px hsl(var(--cyber-blue) / 0.6), 0 0 30px hsl(var(--cyber-blue) / 0.4)',
        'inner-neon': 'inset 0 0 5px hsl(var(--cyber-blue) / 0.7), inset 0 0 10px hsl(var(--cyber-blue) / 0.3)',
        
        // Color variants
        'neon-purple': '0 0 5px hsl(var(--neon-purple) / 0.7), 0 0 10px hsl(var(--neon-purple) / 0.5), 0 0 15px hsl(var(--neon-purple) / 0.3)',
        'neon-pink': '0 0 5px hsl(var(--neon-pink) / 0.7), 0 0 10px hsl(var(--neon-pink) / 0.5), 0 0 15px hsl(var(--neon-pink) / 0.3)',
        'neon-green': '0 0 5px hsl(var(--neon-green) / 0.7), 0 0 10px hsl(var(--neon-green) / 0.5), 0 0 15px hsl(var(--neon-green) / 0.3)',
      },
      backgroundImage: {
        // Basic gradients
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(to bottom, hsl(var(--space-black)), hsl(var(--space-dark)))',
        
        // Cyberpunk-themed patterns
        'cyber-grid': 'linear-gradient(to right, hsl(var(--cyber-blue) / 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--cyber-blue) / 0.1) 1px, transparent 1px)',
        'cyber-glow': 'radial-gradient(circle at center, hsl(var(--cyber-blue) / 0.2) 0%, transparent 70%)',
        'cyber-lines': 'repeating-linear-gradient(90deg, hsl(var(--cyber-blue) / 0.03) 0px, hsl(var(--cyber-blue) / 0.03) 1px, transparent 1px, transparent 20px)',
        
        // Asset-based backgrounds
        'hero-pattern': "url('/hero-pattern.svg')",
        'blaze-pattern': "url('/images/blaze-pattern.jpg')",
      },
      
      // Transition durations using CSS variables
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'medium': 'var(--duration-medium)',
        'slow': 'var(--duration-slow)',
      },
      
      // Transition timing functions using CSS variables
      transitionTimingFunction: {
        'standard': 'var(--ease-standard)',
        'spring': 'var(--ease-spring)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("./lib/tailwind-theme-plugin"),
  ],
};

export default config;