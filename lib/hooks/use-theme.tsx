"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

type ThemeContextType = {
  currentTheme: string
  isProtoss: boolean
  isCyberpunk: boolean
  isMatrix: boolean
  isBitcoin: boolean
  setTheme: (theme: string) => void
}

const defaultContext: ThemeContextType = {
  currentTheme: 'bitcoin',
  isProtoss: false,
  isCyberpunk: false,
  isMatrix: false,
  isBitcoin: true,
  setTheme: () => {}
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme()
  const [currentTheme, setCurrentTheme] = useState<string>('bitcoin')
  
  useEffect(() => {
    setCurrentTheme(theme || 'bitcoin')
  }, [theme])

  const contextValue: ThemeContextType = {
    currentTheme,
    isProtoss: currentTheme === 'protoss',
    isCyberpunk: currentTheme === 'cyberpunk',
    isMatrix: currentTheme === 'matrix',
    isBitcoin: currentTheme === 'bitcoin',
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
  matrix,
  bitcoin,
  children 
}: { 
  protoss?: React.ReactNode
  cyberpunk?: React.ReactNode
  matrix?: React.ReactNode
  bitcoin?: React.ReactNode
  children?: React.ReactNode 
}) {
  const { isProtoss, isCyberpunk, isMatrix, isBitcoin } = useTheme()
  
  if (isProtoss && protoss) return <>{protoss}</>
  if (isCyberpunk && cyberpunk) return <>{cyberpunk}</>
  if (isMatrix && matrix) return <>{matrix}</>
  if (isBitcoin && bitcoin) return <>{bitcoin}</>
  return <>{children}</>
}