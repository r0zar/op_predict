"use client";

import React, { useEffect, useState } from 'react';
import { PredictionMasonry } from './prediction-masonry';

export function UserPredictionsClientWrapper() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.predictions-container');
    if (container) {
      const predictionsData = container.getAttribute('data-predictions');
      const adminData = container.getAttribute('data-admin');
      
      if (predictionsData) {
        try {
          setPredictions(JSON.parse(predictionsData));
        } catch (error) {
          console.error('Error parsing predictions data:', error);
        }
      }
      
      setIsAdmin(adminData === 'true');
    }
  }, []);

  if (predictions.length === 0) {
    return <div>Loading predictions...</div>;
  }

  return <PredictionMasonry predictions={predictions} isAdmin={isAdmin} />;
}

export function AdminPredictionsClientWrapper() {
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    const container = document.querySelector('.predictions-container');
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
    return <div>Loading predictions...</div>;
  }

  return <PredictionMasonry predictions={predictions} isAdmin={true} />;
}