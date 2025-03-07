"use client";

import React, { useEffect, useState } from 'react';
import { PredictionMasonry } from './prediction-masonry';

export function MarketPredictionsClientWrapper() {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    const container = document.querySelector('.market-predictions-container');
    if (container) {
      const predictionsData = container.getAttribute('data-predictions');
      
      if (predictionsData) {
        try {
          setPredictions(JSON.parse(predictionsData));
        } catch (error) {
          console.error('Error parsing predictions data:', error);
        }
      }
    }
  }, []);

  if (predictions.length === 0) {
    return <div>Loading market predictions...</div>;
  }

  return <PredictionMasonry predictions={predictions} />;
}