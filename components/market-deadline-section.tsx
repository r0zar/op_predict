"use client";

import { Clock } from "lucide-react";
import { MarketCountdown } from "./market-countdown";
import { cn } from "@/lib/utils";

interface MarketDeadlineSectionProps {
    endDate: string;
    isMarketClosed: boolean;
}

export function MarketDeadlineSection({ endDate, isMarketClosed }: MarketDeadlineSectionProps) {
    return (
        <div className={cn(
            "flex items-center text-sm rounded-lg p-4 border",
            !isMarketClosed 
                ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" 
                : "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800"
        )}>
            <div className="mr-3 flex-shrink-0">
                <Clock className={cn(
                    "h-5 w-5",
                    !isMarketClosed 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 dark:text-gray-400"
                )} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className={cn(
                        "font-medium",
                        !isMarketClosed 
                            ? "text-blue-800 dark:text-blue-300" 
                            : "text-gray-700 dark:text-gray-300"
                    )}>
                        {!isMarketClosed ? "Voting Deadline" : "Voting Ended"}
                    </h3>
                    
                    {!isMarketClosed && (
                        <div className="ml-4">
                            <span className="text-sm font-medium whitespace-nowrap">
                                <MarketCountdown endDate={endDate} />
                            </span>
                        </div>
                    )}
                </div>
                
                {!isMarketClosed ? (
                    <p className="text-blue-700 dark:text-blue-400">
                        Predictions for this market will end on{' '}
                        <span className="font-medium">
                            {new Date(endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                            })}
                        </span>
                    </p>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                        Predictions for this market ended on{' '}
                        <span className="font-medium">
                            {new Date(endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZoneName: 'short'
                            })}
                        </span>
                    </p>
                )}
            </div>
        </div>
    );
}