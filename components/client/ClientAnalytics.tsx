'use client';

import { ClientOnly } from './ClientOnly';
import { ClientCurrency } from './ClientCurrency';
import { ClientNumber } from './ClientNumber';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Market } from 'wisdom-sdk';
import { useRouter } from 'next/navigation';

interface MarketStats {
  totalPoolAmount: number;
  totalParticipants: number;
  averagePoolPerMarket: number;
  averageParticipantsPerMarket: number;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  typesDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

interface ClientAnalyticsProps {
  marketStats: MarketStats;
  topMarkets: Market[];
}

export function ClientAnalytics({ marketStats, topMarkets }: ClientAnalyticsProps) {
  const router = useRouter();
  
  return (
    <ClientOnly fallback={<div className="py-10 text-center">Loading analytics...</div>}>
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Markets Card */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--neon-purple)/20)] shadow-md group hover:shadow-[0_0_15px_rgba(189,147,249,0.2)] transition-all duration-300">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[hsl(var(--neon-purple)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[hsl(var(--neon-purple)/60)]"></span>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
              style={{ boxShadow: 'inset 0 0 15px rgba(189,147,249,0.15)' }}></div>
              
            <div className="p-6 relative z-10">
              <div className="text-3xl font-mono font-bold text-[hsl(var(--neon-purple))] text-glow-purple mb-1">
                {marketStats.totalPoolAmount.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                TOTAL_MARKETS
              </div>
            </div>
          </div>
          
          {/* Total Pool Amount Card */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--cyber-blue)/20)] shadow-md group hover:shadow-[0_0_15px_rgba(125,249,255,0.2)] transition-all duration-300">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[hsl(var(--cyber-blue)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[hsl(var(--cyber-blue)/60)]"></span>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
              style={{ boxShadow: 'inset 0 0 15px rgba(125,249,255,0.15)' }}></div>
              
            <div className="p-6 relative z-10">
              <div className="text-3xl font-mono font-bold text-[hsl(var(--cyber-blue))] text-glow mb-1">
                <ClientCurrency amount={marketStats.totalPoolAmount} />
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                TOTAL_POOL_AMOUNT
              </div>
            </div>
          </div>
          
          {/* Total Participants Card */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--neon-green)/20)] shadow-md group hover:shadow-[0_0_15px_rgba(135,219,165,0.2)] transition-all duration-300">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[hsl(var(--neon-green)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[hsl(var(--neon-green)/60)]"></span>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
              style={{ boxShadow: 'inset 0 0 15px rgba(135,219,165,0.15)' }}></div>
              
            <div className="p-6 relative z-10">
              <div className="text-3xl font-mono font-bold text-[hsl(var(--neon-green))] text-glow mb-1">
                <ClientNumber value={marketStats.totalParticipants} />
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                TOTAL_PARTICIPANTS
              </div>
            </div>
          </div>
          
          {/* Average Pool Card */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--neon-pink)/20)] shadow-md group hover:shadow-[0_0_15px_rgba(255,121,198,0.2)] transition-all duration-300">
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[hsl(var(--neon-pink)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[hsl(var(--neon-pink)/60)]"></span>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
              style={{ boxShadow: 'inset 0 0 15px rgba(255,121,198,0.15)' }}></div>
              
            <div className="p-6 relative z-10">
              <div className="text-3xl font-mono font-bold text-[hsl(var(--neon-pink))] text-glow-pink mb-1">
                <ClientCurrency amount={marketStats.averagePoolPerMarket} />
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                AVG_POOL_PER_MARKET
              </div>
            </div>
          </div>
        </div>
        
        {/* Distribution charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Category distribution */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--cyber-blue)/20)] shadow-md p-6">
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(var(--cyber-blue)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(var(--cyber-blue)/60)]"></span>
            
            <h3 className="text-lg font-mono text-glow mb-6 flex items-center">
              <span className="text-[hsl(var(--cyber-blue))]">•</span>
              <span className="ml-2">CATEGORY_DISTRIBUTION</span>
            </h3>
            
            <div className="space-y-4">
              {marketStats.categoryDistribution.map(({ category, count, percentage }) => (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="capitalize text-[hsl(var(--cyber-blue))]">{category}</span>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--space-void))] rounded-sm overflow-hidden border border-[hsl(var(--dark-steel))]">
                    <div 
                      className="h-full bg-gradient-to-r from-[hsl(var(--cyber-blue)/50)] to-[hsl(var(--cyber-blue)/80)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Status distribution */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--neon-purple)/20)] shadow-md p-6">
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(var(--neon-purple)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(var(--neon-purple)/60)]"></span>
            
            <h3 className="text-lg font-mono text-glow-purple mb-6 flex items-center">
              <span className="text-[hsl(var(--neon-purple))]">•</span>
              <span className="ml-2">STATUS_DISTRIBUTION</span>
            </h3>
            
            <div className="space-y-4">
              {marketStats.statusDistribution.map(({ status, count, percentage }) => (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="capitalize text-[hsl(var(--neon-purple))]">{status}</span>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--space-void))] rounded-sm overflow-hidden border border-[hsl(var(--dark-steel))]">
                    <div 
                      className={`h-full ${
                        status === 'active' ? 'bg-gradient-to-r from-[hsl(var(--neon-green)/50)] to-[hsl(var(--neon-green)/80)]' : 
                        status === 'resolved' ? 'bg-gradient-to-r from-[hsl(var(--cyber-blue)/50)] to-[hsl(var(--cyber-blue)/80)]' : 
                        'bg-gradient-to-r from-[hsl(var(--neon-red)/50)] to-[hsl(var(--neon-red)/80)]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Type distribution */}
          <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--neon-pink)/20)] shadow-md p-6">
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(var(--neon-pink)/60)]"></span>
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(var(--neon-pink)/60)]"></span>
            
            <h3 className="text-lg font-mono text-glow-pink mb-6 flex items-center">
              <span className="text-[hsl(var(--neon-pink))]">•</span>
              <span className="ml-2">MARKET_TYPE_DISTRIBUTION</span>
            </h3>
            
            <div className="space-y-4">
              {marketStats.typesDistribution.map(({ type, count, percentage }) => (
                <div key={type} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="capitalize text-[hsl(var(--neon-pink))]">{type}</span>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-[hsl(var(--space-void))] rounded-sm overflow-hidden border border-[hsl(var(--dark-steel))]">
                    <div 
                      className="h-full bg-gradient-to-r from-[hsl(var(--neon-pink)/50)] to-[hsl(var(--neon-pink)/80)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Top markets table */}
        <div className="relative rounded-md overflow-hidden bg-panel-gradient border border-[hsl(var(--cyber-blue)/20)] shadow-md">
          <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[hsl(var(--cyber-blue)/60)]"></span>
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[hsl(var(--cyber-blue)/60)]"></span>
          
          <div className="p-6">
            <h3 className="text-lg font-mono text-glow mb-6 flex items-center">
              <span className="text-[hsl(var(--cyber-blue))]">•</span>
              <span className="ml-2">TOP_MARKETS_BY_POOL_SIZE</span>
            </h3>
            
            <div className="overflow-hidden rounded-md border border-[hsl(var(--cyber-blue)/30)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[hsl(var(--cyber-blue)/20)] bg-[hsl(var(--muted)/70)]">
                    <TableHead className="font-mono text-sm text-glow">MARKET_NAME</TableHead>
                    <TableHead className="font-mono text-sm text-glow">POOL_SIZE</TableHead>
                    <TableHead className="font-mono text-sm text-glow">PARTICIPANTS</TableHead>
                    <TableHead className="font-mono text-sm text-glow">CATEGORY</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMarkets.map((market) => (
                    <TableRow 
                      key={market.id} 
                      className="group relative cursor-pointer border-b border-[hsl(var(--cyber-blue)/10)] hover:bg-[hsl(var(--cyber-blue)/5)] transition-colors duration-150"
                      onClick={() => router.push(`/markets/${market.id}`)}
                    >
                      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[hsl(var(--cyber-blue))] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      
                      <TableCell>
                        <div className="font-semibold group-hover:text-[hsl(var(--cyber-blue))] transition-colors duration-150">
                          {market.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[hsl(var(--neon-green))]">
                        <ClientCurrency amount={market.poolAmount} />
                      </TableCell>
                      <TableCell className="font-mono">
                        <ClientNumber value={market.participants} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize border-[hsl(var(--cyber-blue)/20)] bg-muted/20">
                          {market.category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}