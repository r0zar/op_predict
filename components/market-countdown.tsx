"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/src/utils";

export function MarketCountdown({ endDate }: { endDate: string }) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    
    const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'soon' | 'urgent' | 'imminent'>('normal');
    
    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(endDate).getTime() - new Date().getTime();
            
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }
            
            // Set urgency levels at different thresholds
            if (difference < 1 * 60 * 60 * 1000) { // Less than 1 hour
                setUrgencyLevel('imminent');
            } else if (difference < 6 * 60 * 60 * 1000) { // Less than 6 hours
                setUrgencyLevel('urgent');
            } else if (difference < 24 * 60 * 60 * 1000) { // Less than 24 hours
                setUrgencyLevel('soon');
            } else {
                setUrgencyLevel('normal');
            }
            
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };
        
        // Initial calculation
        setTimeLeft(calculateTimeLeft());
        
        // Update every second
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        
        // Cleanup
        return () => clearInterval(timer);
    }, [endDate]);
    
    return (
        <span className={cn(
            "font-mono transition-colors duration-300",
            urgencyLevel === 'normal' && "text-blue-700 dark:text-blue-400",
            urgencyLevel === 'soon' && "text-amber-600 dark:text-amber-400 font-semibold",
            urgencyLevel === 'urgent' && "text-orange-600 dark:text-orange-400 font-bold",
            urgencyLevel === 'imminent' && "text-red-600 dark:text-red-400 font-bold animate-pulse"
        )}>
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours.toString().padStart(2, '0')}h:{timeLeft.minutes.toString().padStart(2, '0')}m:{timeLeft.seconds.toString().padStart(2, '0')}s
            {urgencyLevel === 'imminent' ? ' closing soon!' : ' remaining'}
        </span>
    );
}