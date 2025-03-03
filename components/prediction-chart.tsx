"use client";

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { cn } from '@/lib/src/utils';

// Register all Chart.js components
if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

interface Prediction {
  id: string;
  createdAt: string;
  outcomeId: number;
  // Other fields may be present but aren't needed for the chart
}

interface OutcomeWithPercentage {
  id: number;
  name: string;
  percentage: number;
  color?: string;
}

interface PredictionChartProps {
  predictions: Prediction[];
  outcomes: OutcomeWithPercentage[];
  className?: string;
}

const getDefaultColors = (index: number) => {
  const colors = [
    'rgba(59, 130, 246, 0.7)', // blue
    'rgba(16, 185, 129, 0.7)', // green
    'rgba(239, 68, 68, 0.7)',  // red
    'rgba(217, 119, 6, 0.7)',  // amber
    'rgba(124, 58, 237, 0.7)', // purple
    'rgba(236, 72, 153, 0.7)', // pink
  ];
  return colors[index % colors.length];
};

export function PredictionChart({ predictions, outcomes, className }: PredictionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !predictions.length || !outcomes.length) return;

    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Sort predictions by creation date
    const sortedPredictions = [...predictions].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Get unique dates, formatted as YYYY-MM-DD to group by day
    const uniqueDates = Array.from(
      new Set(
        sortedPredictions.map(p => 
          new Date(p.createdAt).toISOString().split('T')[0]
        )
      )
    ).sort();

    // Calculate percentages for each outcome over time
    const dataByOutcome = outcomes.map(outcome => {
      // Initialize with empty data for each date
      const data: {[date: string]: {count: number, total: number}} = {};
      uniqueDates.forEach(date => {
        data[date] = { count: 0, total: 0 };
      });

      // Count predictions for this outcome by date
      sortedPredictions.forEach(prediction => {
        const date = new Date(prediction.createdAt).toISOString().split('T')[0];
        if (data[date]) {
          data[date].total++;
          if (prediction.outcomeId === outcome.id) {
            data[date].count++;
          }
        }
      });

      // Calculate running percentages
      let runningCount = 0;
      let runningTotal = 0;
      const percentages = uniqueDates.map(date => {
        runningCount += data[date].count;
        runningTotal += data[date].total;
        return runningTotal > 0 ? (runningCount / runningTotal) * 100 : 0;
      });

      return {
        label: outcome.name,
        data: percentages,
        backgroundColor: outcome.color || getDefaultColors(outcomes.indexOf(outcome)),
        borderColor: outcome.color || getDefaultColors(outcomes.indexOf(outcome)),
        fill: false,
        tension: 0.2,
      };
    });

    // Format dates for display
    const formattedDates = uniqueDates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: formattedDates,
          datasets: dataByOutcome,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: {
                callback: (value) => `${value}%`,
              },
              title: {
                display: true,
                text: 'Prediction Percentage',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                },
              },
            },
            legend: {
              position: 'top',
              align: 'center',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [predictions, outcomes]);

  return (
    <div className={cn("w-full h-72", className)}>
      <canvas ref={chartRef} />
    </div>
  );
}