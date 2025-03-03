"use client";

import { useEffect, useState } from 'react';
import { getMarket, getMarketPredictions } from '@/app/actions/prediction-actions';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Dynamically import the PredictionChart component to avoid server-side rendering issues with Chart.js
const PredictionChart = dynamic(
  () => import('./prediction-chart').then(mod => mod.PredictionChart),
  { ssr: false, loading: () => <ChartLoadingPlaceholder /> }
);

function ChartLoadingPlaceholder() {
  return (
    <div className="h-72 w-full flex items-center justify-center">
      <div className="animate-pulse h-8 w-8 rounded-full bg-muted"></div>
      <p className="ml-2 text-muted-foreground">Loading chart...</p>
    </div>
  );
}

function EmptyChartPlaceholder() {
  return (
    <div className="h-72 w-full flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p className="mb-2">Not enough prediction data yet to show trends.</p>
        <p>Make a prediction to see how the odds change over time.</p>
      </div>
    </div>
  );
}

function ErrorPlaceholder({ error }: { error: string }) {
  return (
    <div className="h-72 w-full flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <p>Unable to load prediction trend data.</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
}

interface MarketPredictionsChartProps {
  marketId: string;
}

export function MarketPredictionsChart({ marketId }: MarketPredictionsChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [outcomes, setOutcomes] = useState<any[]>([]);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Get the predictions for this market
        const predictionsResult = await getMarketPredictions(marketId);
        if (!predictionsResult.success || !predictionsResult.predictions) {
          throw new Error("Failed to load predictions");
        }
        
        // Get the market for outcomes
        const market = await getMarket(marketId);
        if (!market) {
          throw new Error("Failed to load market");
        }
        
        // Map outcomes and assign colors based on market type
        const mappedOutcomes = market.outcomes.map((outcome, index) => {
          let color;
          // Assign different colors for binary markets
          if (market.type === 'binary') {
            if (outcome.name === 'Yes') {
              color = 'rgba(16, 185, 129, 0.7)'; // green
            } else if (outcome.name === 'No') {
              color = 'rgba(239, 68, 68, 0.7)'; // red
            }
          }
          return {
            ...outcome,
            percentage: 0, // Initial percentage will be calculated by the chart
            color
          };
        });
        
        // Set the state with our loaded data
        setPredictions(predictionsResult.predictions);
        setOutcomes(mappedOutcomes);
        setError(null);
      } catch (err) {
        console.error("Error loading chart data:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };
    
    loadChartData();
  }, [marketId]);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="text-center text-sm text-muted-foreground mb-4">
          Chart showing how predictions have changed over time
        </div>
        
        {loading && <ChartLoadingPlaceholder />}
        
        {!loading && error && <ErrorPlaceholder error={error} />}
        
        {!loading && !error && predictions.length === 0 && <EmptyChartPlaceholder />}
        
        {!loading && !error && predictions.length > 0 && (
          <div className="h-72">
            <PredictionChart 
              predictions={predictions}
              outcomes={outcomes}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}