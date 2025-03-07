"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="container py-10 space-y-10">
      <h1 className="text-3xl font-bold font-display">Font Theme Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Test with HTML Elements</h2>
          
          <div className="p-4 border rounded-md">
            <h3 className="text-xl mb-2">Heading (h3)</h3>
            <p className="mb-4">This is regular paragraph text. It should use the theme's primary font.</p>
            <code className="block p-2 bg-muted mb-4">This is code text. It should use monospace.</code>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded">Button Element</button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Test with CSS Classes</h2>
          
          <div className="p-4 border rounded-md">
            <div className="text-xl font-display mb-2">Display Font (.font-display)</div>
            <div className="font-theme mb-4">Primary Theme Font (.font-theme)</div>
            <div className="font-mono-theme mb-4">Monospace Theme Font (.font-mono-theme)</div>
            <Button>UI Button Component</Button>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={() => setTheme('cyberpunk')} 
          className={`px-4 py-2 rounded ${theme === 'cyberpunk' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          Cyberpunk Theme
        </button>
        <button 
          onClick={() => setTheme('protoss')} 
          className={`px-4 py-2 rounded ${theme === 'protoss' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
        >
          Protoss Theme
        </button>
      </div>
      
      <div className="border p-6 rounded-md">
        <h2 className="text-2xl font-bold mb-4">Current Theme Font Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">CSS Variables</h3>
            <pre className="p-3 bg-muted rounded text-sm">
              {`--font-primary: var(--font-${theme === 'cyberpunk' ? 'source-code-pro' : 'exo-2'})
--font-display: var(--font-${theme === 'cyberpunk' ? 'syncopate' : 'orbitron'})
--font-mono: var(--font-${theme === 'cyberpunk' ? 'jetbrains-mono' : 'fira-code'})`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Font Families</h3>
            <div className="p-3 bg-muted rounded text-sm space-y-2">
              <div className="font-theme">This is primary theme font</div>
              <div className="font-display">This is display theme font</div>
              <div className="font-mono-theme">This is mono theme font</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}