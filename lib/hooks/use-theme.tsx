"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

type ThemeContextType = {
  currentTheme: string
  isProtoss: boolean
  isCyberpunk: boolean
  setTheme: (theme: string) => void
}

const defaultContext: ThemeContextType = {
  currentTheme: 'cyberpunk',
  isProtoss: false,
  isCyberpunk: true,
  setTheme: () => {}
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme()
  const [currentTheme, setCurrentTheme] = useState<string>('cyberpunk')
  
  useEffect(() => {
    setCurrentTheme(theme || 'cyberpunk')
  }, [theme])

  const contextValue: ThemeContextType = {
    currentTheme,
    isProtoss: currentTheme === 'protoss',
    isCyberpunk: currentTheme === 'cyberpunk',
    setTheme
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Component for conditionally rendering based on theme
export function ThemedContent({ 
  protoss, 
  cyberpunk,
  children 
}: { 
  protoss?: React.ReactNode
  cyberpunk?: React.ReactNode
  children?: React.ReactNode 
}) {
  const { isProtoss, isCyberpunk } = useTheme()
  
  if (isProtoss && protoss) return <>{protoss}</>
  if (isCyberpunk && cyberpunk) return <>{cyberpunk}</>
  return <>{children}</>
}