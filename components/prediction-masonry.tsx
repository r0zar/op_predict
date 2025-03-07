"use client";

import React from 'react';
import Masonry from 'react-masonry-css';
import { PredictionCard } from "@/components/prediction-card";

interface PredictionMasonryProps {
  predictions: any[];
  isAdmin?: boolean;
}

export function PredictionMasonry({ predictions, isAdmin = false }: PredictionMasonryProps) {
  // Sort predictions by both size and shape to optimize packing
  const sortedPredictions = [...predictions].sort((a, b) => {
    // First by amount (descending)
    const amountDiff = b.amount - a.amount;
    if (Math.abs(amountDiff) > 5) return amountDiff;
    
    // Then by aspect ratio for better packing of similar sized items
    // This helps group similar shapes together
    const aRatio = a.id.charCodeAt(0) % 3;
    const bRatio = b.id.charCodeAt(0) % 3;
    return aRatio - bRatio;
  });

  return (
    <div className="prediction-mosaic" style={{ margin: 0, padding: 0 }}>
      <Masonry
        breakpointCols={{
          default: 20,  // Many more columns for tighter packing
          1920: 16,
          1536: 14,
          1280: 12,
          1024: 10,
          768: 8,
          640: 6,
          480: 4
        }}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
        style={{ margin: 0, padding: 0, gap: 0 }}
      >
        {sortedPredictions.map((prediction) => (
          <div key={prediction.id} style={{ padding: 0, margin: 0, marginBottom: '1px' }}>
            <PredictionCard
              prediction={prediction}
              isAdmin={isAdmin}
              marketOdds={{
                [prediction.outcomeId]: prediction.outcomeName === 'Yes' ? 65 :
                  prediction.outcomeName === 'No' ? 35 : 50
              }}
              creatorName={prediction.creatorName}
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
}