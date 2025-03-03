"use client";

import { useEffect, useState } from 'react';
import { PredictionChart } from './prediction-chart';
import { getMarket, getMarketPredictions } from '@/app/actions/prediction-actions';

interface PredictionChartLoaderProps {
  marketId: string;
}

export function PredictionChartLoader({ marketId }: PredictionChartLoaderProps) {
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
  
  if (loading) {
    return (
      <div className="h-72 w-full flex items-center justify-center">
        <div className="animate-pulse h-8 w-8 rounded-full bg-muted"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-72 w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Unable to load prediction trend data.</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!predictions.length) {
    return (
      <div className="h-72 w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Not enough prediction data yet to show trends.</p>
          <p>Make a prediction to see how the odds change over time.</p>
        </div>
      </div>
    );
  }
  
  return (
    <PredictionChart
      predictions={predictions}
      outcomes={outcomes}
    />
  );
}