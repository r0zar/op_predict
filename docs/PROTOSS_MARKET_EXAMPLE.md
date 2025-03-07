# Protoss Theme - Market Detail Page Examples

These examples show how to apply the Protoss Nexus theme to the market detail page in the OP Predict application.

## Main Layout Transformation

The main layout would change to use the Protoss color palette and styling features:

```jsx
<div className="container max-w-5xl xl:max-w-7xl py-10 space-y-8">
  {/* Back navigation with psionic styling */}
  <div className="flex items-center justify-between mb-4">
    <Link 
      href="/markets" 
      className="flex items-center text-khala-medium hover:text-khala-light transition-colors group"
    >
      <div className="relative mr-2 w-6 h-6 flex items-center justify-center overflow-hidden">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"></div>
      </div>
      <span className="font-mono tracking-wide">Return to Nexus</span>
    </Link>

    <div className="flex items-center space-x-2">
      <Badge
        variant={
          market.status === 'active'
            ? 'outline'
            : market.status === 'resolved'
              ? 'secondary'
              : 'destructive'
        }
        className="px-3 py-1 border-primary/40 text-primary font-mono uppercase text-xs tracking-wider"
      >
        {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
      </Badge>
    </div>
  </div>

  {/* Main market panel with crystal accents */}
  <div className="relative mb-12 overflow-hidden rounded-lg bg-psionic-panel crystal-accents">
    {/* Energy wave effect */}
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent bg-[length:200%_100%] animate-nav-shimmer"></div>
    
    {/* Rest of content remains structured the same but with Protoss styling */}
    {/* ... */}
  </div>
</div>
```

## Market Status Header

The market status header would be transformed to use crystal and psionic energy elements:

```jsx
<div className="px-6 pt-6 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Badge 
      variant={market.type === 'binary' ? 'secondary' : 'secondary'} 
      className="px-3 py-1 bg-void-void/70 backdrop-blur border border-psi-blade/30"
    >
      {market.type === 'binary' ? (
        <CheckCircle2 className="h-3 w-3 mr-1 text-psi-energy" />
      ) : (
        <ListFilter className="h-3 w-3 mr-1 text-psi-blade" />
      )}
      <span className="font-mono text-xs tracking-wide">
        {market.type === 'binary' ? 'Yes/No Question' : 'Multiple Choice'}
      </span>
    </Badge>

    <Badge
      variant={
        market.status === 'active'
          ? 'outline'
          : market.status === 'resolved'
            ? 'secondary'
            : 'destructive'
      }
      className="px-3 py-1 bg-void-void/70 backdrop-blur border-psi-gold/30 font-mono text-xs tracking-wide"
    >
      {!isMarketClosed && (
        <span className="mr-1.5 relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-psi-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-psi-gold"></span>
        </span>
      )}
      {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
    </Badge>
  </div>

  {/* Deadline timer with psionic styling */}
  <div className="bg-void-void/70 backdrop-blur rounded-lg px-4 py-1.5 border border-psi-gold/30">
    <div className="flex items-center text-xs">
      <Clock className="h-3.5 w-3.5 mr-2 text-psi-gold" />
      {!isMarketClosed ? (
        <span className="text-psi-gold font-mono text-psionic">
          <MarketCountdown endDate={market.endDate} />
        </span>
      ) : (
        <span className="text-khala-medium font-mono">
          Ended {new Date(market.endDate).toLocaleDateString()}
        </span>
      )}
    </div>
  </div>
</div>
```

## Market Title & Stats

The title section would incorporate crystalline elements and psionic styling:

```jsx
<div className="px-6 pt-4 pb-6">
  <h1 className="text-2xl font-display font-bold text-psi-gold text-psionic uppercase tracking-wider">
    {market.name}
  </h1>
  <div className="flex flex-wrap gap-4 mt-2 text-xs font-mono text-khala-medium">
    <div className="flex items-center">
      <Users className="h-3.5 w-3.5 mr-1 text-psi-blade" />
      <span>{market.participants || 0} participants</span>
    </div>
    <div className="flex items-center">
      <DollarSign className="h-3.5 w-3.5 mr-1 text-psi-blade" />
      <span>${market.poolAmount || 0} pool</span>
    </div>
    <div className="flex items-center">
      <Calendar className="h-3.5 w-3.5 mr-1 text-psi-blade" />
      <span>Created {new Date(market.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
</div>
```

## Status Notifications (Resolved Markets)

```jsx
{isMarketResolved && market.resolvedOutcomeId && (
  <div className="mx-6 mb-6 bg-void-void/50 border border-psi-energy/30 rounded-lg p-4 backdrop-blur">
    <div className="flex items-start">
      <Trophy className="h-5 w-5 text-psi-energy text-psionic-energy mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-display font-medium text-psi-energy mb-1 uppercase tracking-wide">
          Market Resolved
        </h3>
        <p className="text-sm text-khala-light">
          This market was resolved on {new Date(market.resolvedAt || '').toLocaleDateString()}.
          The winning outcome was <strong className="text-psi-energy">{market.outcomes.find((o: any) => o.id === market.resolvedOutcomeId)?.name}</strong>.
        </p>
      </div>
    </div>
  </div>
)}

{isMarketCancelled && (
  <div className="mx-6 mb-6 bg-void-void/50 border border-psi-storm/30 rounded-lg p-4 backdrop-blur">
    <div className="flex items-start">
      <AlertTriangle className="h-5 w-5 text-psi-storm text-psionic-blade mr-3 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-display font-medium text-psi-storm mb-1 uppercase tracking-wide">
          Market Cancelled
        </h3>
        <p className="text-sm text-khala-light">
          This market has been cancelled. Any funds committed to predictions have been returned to users.
        </p>
      </div>
    </div>
  </div>
)}
```

## Prediction Progress Bars & Visualization

The prediction visualization would be enhanced with crystalline energy effects:

```jsx
<div className="space-y-4">
  {sortedOutcomes.map((outcome) => (
    <div key={outcome.id} className="space-y-1">
      <div className="flex justify-between items-center">
        <span className={cn("font-display font-medium text-sm tracking-wide",
          isMarketResolved && market.resolvedOutcomeId === outcome.id 
            ? "text-psi-energy text-psionic-energy" 
            : "text-khala-light"
        )}>
          {outcome.name}
          {isMarketResolved && market.resolvedOutcomeId === outcome.id && (
            <Check className="inline h-4 w-4 ml-1" />
          )}
        </span>
        <span className="text-xs text-khala-medium font-mono">
          ${outcome.amount.toFixed(2)} ({outcome.percentage.toFixed(1)}%) · {outcome.votes} {outcome.votes === 1 ? 'vote' : 'votes'}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-void-void border border-khala-dark/30">
        <div
          className="h-full transition-all duration-200 relative"
          style={{
            width: `${outcome.percentage}%`,
            background: market.type === 'binary' && outcome.name === 'Yes'
              ? 'linear-gradient(90deg, hsl(167, 80%, 71%, 0.8), hsl(167, 80%, 71%, 0.4))'
              : market.type === 'binary' && outcome.name === 'No'
                ? 'linear-gradient(90deg, hsl(330, 100%, 74%, 0.8), hsl(330, 100%, 74%, 0.4))'
                : 'linear-gradient(90deg, hsl(265, 83%, 78%, 0.8), hsl(265, 83%, 78%, 0.4))'
          }}
        >
          {/* Subtle crystalline shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-shimmer"></div>
        </div>
      </div>
    </div>
  ))}
  {totalVotes === 0 && (
    <p className="text-xs text-khala-medium mt-2 italic font-mono">
      <Info className="inline h-3 w-3 mr-1 text-psi-blade" />
      No predictions yet. Showing equal distribution.
    </p>
  )}
</div>
```

## Prediction Form

The form would be styled with Protoss crystal aesthetics:

```jsx
<div className="mb-4">
  <h2 className="text-sm font-display font-medium text-psi-gold text-psionic uppercase tracking-wider mb-4">
    Make a Prediction
  </h2>
  
  {/* Modified version of PredictionForm that uses Protoss styling */}
  <div className="space-y-4 bg-void-medium/50 p-4 rounded-lg border border-psi-blade/30">
    <div>
      <label className="block text-xs font-mono text-khala-medium mb-2 uppercase tracking-wider">
        Select Outcome
      </label>
      {/* Styled radio buttons for outcomes */}
      <div className="space-y-2">
        {sortedOutcomes.map((outcome) => (
          <label key={outcome.id} className="flex items-center space-x-3 p-2 rounded border border-khala-dark/50 hover:border-psi-blade/50 transition-colors cursor-pointer bg-void-void/50">
            <div className="relative w-4 h-4 rounded-full border border-psi-blade/70 flex items-center justify-center overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-psi-blade transform scale-0 transition-transform"></div>
            </div>
            <span className="text-khala-light">{outcome.name}</span>
          </label>
        ))}
      </div>
    </div>
    
    <div>
      <label className="block text-xs font-mono text-khala-medium mb-2 uppercase tracking-wider">
        Amount
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-khala-medium">$</span>
        <input 
          type="number" 
          className="w-full bg-void-void border border-khala-dark rounded-md py-2 px-6 text-khala-light
                    focus:border-psi-blade focus:outline-none focus:ring-1 focus:ring-psi-blade/50 
                    transition-all duration-fast"
          placeholder="Enter amount"
        />
      </div>
      <p className="text-xs text-khala-medium mt-1 font-mono">
        Current balance: $100.00
      </p>
    </div>
    
    <button 
      type="submit" 
      className="psi-button w-full py-3 flex justify-center items-center group"
    >
      <span className="mr-2 uppercase tracking-wide font-mono text-sm">Submit Prediction</span>
      <div className="w-5 h-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-psi-blade/0 via-psi-blade/20 to-psi-blade/0"></div>
        <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" 
              viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  </div>
</div>
```

## Market Predictions Section

The predictions section would use crystal card styling:

```jsx
<div className="space-y-4">
  <h2 className="text-xl font-display font-bold text-psi-gold text-psionic uppercase flex items-center">
    <div className="w-6 h-6 mr-2">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    Recent Predictions
  </h2>
  
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {predictions.map((prediction) => (
      <div key={prediction.id} className="bg-psionic-panel rounded-lg overflow-hidden crystal-glow group">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-psi-blade text-psionic-blade text-sm truncate">
              {prediction.creatorName}
            </p>
            <p className="text-xs text-khala-medium font-mono">
              {new Date(prediction.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-void-void/50 p-2 rounded border border-khala-dark/30 mb-2">
            <p className="text-khala-light text-sm">
              {prediction.outcome?.name}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-psi-gold text-psionic font-medium">
              ${prediction.amount.toFixed(2)}
            </span>
            <span className="text-xs text-khala-medium font-mono">
              {outcomeOddsMap[prediction.outcomeId]?.toFixed(1)}% odds
            </span>
          </div>
        </div>
        
        {/* Subtle energy wave animation on hover */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-psi-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    ))}
  </div>
</div>
```

## Related Markets Section

Related markets would receive a complete Protoss styling overhaul:

```jsx
<div className="space-y-4 mt-10">
  <h2 className="text-xl font-display font-bold text-psi-gold text-psionic uppercase flex items-center">
    <div className="w-6 h-6 mr-2 text-psi-gold">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    Related Markets
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {relatedMarkets.map((market) => (
      <div key={market.id} className="bg-psionic-panel rounded-lg overflow-hidden crystal-glow group border border-khala-dark/30">
        <div className="p-4">
          <div className="flex justify-between items-start gap-2 mb-3">
            <h3 className="text-lg font-display text-psi-gold">{market.name}</h3>
            <Badge 
              variant={market.status === 'active' ? 'outline' : 'secondary'} 
              className="font-mono text-xs px-2 py-0.5 uppercase tracking-wide border-primary/40"
            >
              {market.status}
            </Badge>
          </div>
          
          <p className="text-sm text-khala-medium line-clamp-2 mb-3">
            {market.description}
          </p>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-khala-medium font-mono">Top Outcome:</span>
              <span className="font-medium text-psi-blade">{topOutcome.name}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-void-void border border-khala-dark/30">
              <div
                className="h-full relative"
                style={{
                  width: `${topOutcome.percentage}%`,
                  background: 'linear-gradient(90deg, hsl(265, 83%, 78%, 0.8), hsl(265, 83%, 78%, 0.4))'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-khala-medium">Odds:</span>
              <span className="text-psi-gold">{topOutcome.percentage.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-khala-medium">
              <Users className="h-4 w-4" />
              <span>{market.participants || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-khala-medium">
              <DollarSign className="h-4 w-4" />
              <span>${market.poolAmount || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <button className="psi-button w-full flex justify-center items-center group text-sm py-2">
            <span className="font-mono uppercase tracking-wide">View Market</span>
            <svg className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" 
                 viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Crystal corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-psi-gold/30"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-psi-gold/30"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-psi-gold/30"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-psi-gold/30"></div>
      </div>
    ))}
  </div>
</div>
```

These examples demonstrate how to transform the UI of the market detail page using the Protoss Nexus theme, incorporating the distinctive visuals of crystal accents, psionic energy effects, and the sophisticated color palette inspired by the Protoss civilization from StarCraft II.