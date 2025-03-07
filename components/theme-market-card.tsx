"use client";

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Clock } from 'lucide-react';
import { useTheme, ThemedContent } from '@/lib/hooks/use-theme';
import { Progress } from '@/components/ui/progress';

interface Market {
  id: string;
  name: string;
  description: string;
  status: string;
  poolAmount: number;
  participants: number;
  endDate: string;
  topOutcome?: {
    name: string;
    percentage: number;
  };
}

interface ThemeMarketCardProps {
  market: Market;
}

export function ThemeMarketCard({ market }: ThemeMarketCardProps) {
  const { isProtoss, isCyberpunk } = useTheme();
  
  return (
    <div className="relative theme-card rounded-lg overflow-hidden">
      {/* Theme-specific top energy wave */}
      <div className="relative h-1 w-full overflow-hidden">
        <div className="energy-wave"></div>
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Header with themed badge */}
        <div className="flex items-start justify-between mb-4">
          <h3 className={`text-lg font-medium ${isProtoss ? 'font-display text-psi-gold text-psionic' : 'text-cyan-400 text-glow'}`}>
            {market.name}
          </h3>
          
          <ThemedContent
            protoss={
              <Badge 
                variant={market.status === 'active' ? 'outline' : 'secondary'}
                className="font-mono uppercase text-xs tracking-wider border-psi-blade/30"
              >
                {market.status}
              </Badge>
            }
            cyberpunk={
              <Badge 
                variant={market.status === 'active' ? 'outline' : 'secondary'}
                className="bg-black/50 backdrop-blur border-cyan-400/30"
              >
                {market.status}
              </Badge>
            }
          />
        </div>
        
        {/* Market description */}
        <p className="text-sm text-muted-foreground mb-4">
          {market.description}
        </p>
        
        {/* Outcome prediction */}
        {market.topOutcome && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isProtoss ? <span className="font-mono">Top Outcome:</span> : "Top Outcome:"}
              </span>
              <span className={`font-medium ${isProtoss ? 'text-psi-blade' : 'text-cyber-blue'}`}>
                {market.topOutcome.name}
              </span>
            </div>
            
            <ThemedContent
              protoss={
                <div className="h-2 rounded-full bg-void-void border border-khala-dark/30 overflow-hidden">
                  <div 
                    className="h-full relative theme-progress-primary"
                    style={{ width: `${market.topOutcome.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-shimmer"></div>
                  </div>
                </div>
              }
              cyberpunk={
                <Progress 
                  value={market.topOutcome.percentage} 
                  className="h-2 bg-muted"
                />
              }
            />
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {isProtoss && <span className="font-mono">Odds:</span>}
                {isCyberpunk && "Odds:"}
              </span>
              <span className={`font-medium ${isProtoss ? 'text-psi-gold' : 'text-cyan-400'}`}>
                {market.topOutcome.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Market stats */}
        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className={`h-4 w-4 ${isProtoss ? 'text-psi-blade' : 'text-cyber-blue'}`} />
            <span>{market.participants || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className={`h-4 w-4 ${isProtoss ? 'text-psi-blade' : 'text-cyber-blue'}`} />
            <span>${market.poolAmount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className={`h-4 w-4 ${isProtoss ? 'text-psi-blade' : 'text-cyber-blue'}`} />
            <span>{new Date(market.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Action button - theme-specific */}
        <Link href={`/markets/${market.id}`}>
          <ThemedContent
            protoss={
              <button className="theme-button theme-button-primary w-full">
                <span className="font-mono uppercase tracking-wide">View Market</span>
              </button>
            }
            cyberpunk={
              <button className="cyber-button w-full">
                View Market
              </button>
            }
          />
        </Link>
      </div>
      
      {/* Theme-specific decorations */}
      <ThemedContent
        protoss={
          <>
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-psi-gold/30"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-psi-gold/30"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-psi-gold/30"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-psi-gold/30"></div>
          </>
        }
        cyberpunk={
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/15 to-transparent"></div>
        }
      />
    </div>
  );
}