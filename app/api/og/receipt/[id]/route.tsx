import { NextRequest } from 'next/server';
import { marketStore, predictionStore } from 'wisdom-sdk';

export const runtime = 'edge';

// Disable caching to ensure fresh content on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Use a generic type approach to avoid conflicts with imported types
interface BasicNFTReceipt {
    id: string;
    predictionId: string;
    userId: string;
    createdAt: string | number;
    tokenId?: string;
    transactionHash?: string;
    // Optional fields that might exist in some receipts
    image?: string;
    marketName?: string;
    outcomeName?: string;
    amount?: number;
}

// Extended prediction type with NFT info - avoiding intersection with imported types
type PredictionWithNFT = {
    id: string;
    marketId: string;
    userId: string;
    outcomeId: number | string;
    amount: number | string;
    createdAt: number | string;
    // Include any other prediction fields we might need
    odds?: number | string;
    potentialPayout?: number;
    status?: string;
    // NFT receipt info
    nftReceipt?: Record<string, any>;
};

// Simple QR code generator (without external libs)
function generateQRCodeSVG(url: string, size = 100): string {
    // For simplicity, we'll create a simple grid-based QR code pattern
    // In production, you'd use a proper QR library
    
    const hash = simpleHash(url);
    const cellSize = size / 21; // Standard QR code is 21x21 cells minimum
    
    // Create grid of cells
    let cells = '';
    
    // Fixed pattern for QR code position markers (top-left, top-right, bottom-left corners)
    // These are standard in QR codes
    
    // Generate a semi-random pattern based on URL hash
    for (let y = 0; y < 21; y++) {
        for (let x = 0; x < 21; x++) {
            // Add fixed position detection patterns
            if ((x < 7 && y < 7) || // top-left
                (x > 13 && y < 7) || // top-right
                (x < 7 && y > 13)) { // bottom-left
                
                // Outer square
                if (x === 0 || x === 6 || x === 14 || x === 20 || 
                    y === 0 || y === 6 || y === 14 || y === 20) {
                    cells += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black" />`;
                } 
                // Inner square
                else if (x === 2 || x === 3 || x === 4 || x === 16 || x === 17 || x === 18 || 
                         y === 2 || y === 3 || y === 4 || y === 16 || y === 17 || y === 18) {
                    cells += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black" />`;
                }
                
                continue;
            }
            
            // Timing patterns (alternating black/white pattern)
            if (y === 6 || x === 6) {
                if ((x + y) % 2 === 0) {
                    cells += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black" />`;
                }
                continue;
            }
            
            // For the data area, create a semi-random pattern based on URL
            // This won't actually work as a real QR code, but visually looks like one
            if ((hash + x * y + x + y) % 3 === 0) {
                cells += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black" />`;
            }
        }
    }
    
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="${size}" height="${size}" fill="white"/>
            ${cells}
        </svg>
    `;
}

// Simple hash function for the URL
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) {
            return new Response('Prediction ID is required', { status: 400 });
        }

        // Debug logging
        console.log(`[SVG Receipt] Processing receipt for ID: ${id}`);

        // First determine if the ID is for a prediction or NFT receipt
        let prediction: any = null;
        let nftReceipt: any = null;

        // Try to fetch as a prediction first using wisdom-sdk
        try {
            prediction = await predictionStore.getPrediction(id);
            console.log(`[SVG Receipt] Direct prediction lookup result: ${prediction ? 'found' : 'not found'}`);
        } catch (err) {
            console.log(`[SVG Receipt] Error fetching prediction: ${err}`);
        }

        // If not found, try to see if it's an NFT receipt ID
        if (!prediction) {
            console.log(`[SVG Receipt] Looking up as NFT receipt`);
            try {
                nftReceipt = await predictionStore.getNFTReceipt(id);
                console.log(`[SVG Receipt] NFT receipt lookup result: ${nftReceipt ? 'found' : 'not found'}`);

                // If we found an NFT receipt, get the associated prediction
                if (nftReceipt && nftReceipt.predictionId) {
                    console.log(`[SVG Receipt] Found NFT with prediction ID: ${nftReceipt.predictionId}`);
                    // Get the prediction using the predictionId from the receipt
                    prediction = await predictionStore.getPrediction(nftReceipt.predictionId);
                    console.log(`[SVG Receipt] Prediction from NFT lookup: ${prediction ? 'found' : 'not found'}`);

                    // Add the NFT receipt to the prediction
                    if (prediction) {
                        prediction.nftReceipt = nftReceipt;
                    }
                }
            } catch (err) {
                console.log(`[SVG Receipt] Error fetching NFT receipt: ${err}`);
            }
        }
        // If ID is a prediction but it might have an NFT receipt, check for that
        else if (prediction) {
            // Try to find an NFT receipt for this prediction
            try {
                const nftId = prediction.id;
                const receipt = await predictionStore.getNFTReceipt(nftId);
                if (receipt) {
                    console.log(`[SVG Receipt] Found matching NFT receipt for prediction`);
                    prediction.nftReceipt = receipt;
                    nftReceipt = receipt;
                }
            } catch (err) {
                console.log(`[SVG Receipt] Error fetching NFT receipt for prediction: ${err}`);
            }
        }

        // If still no prediction found
        if (!prediction) {
            console.log(`[SVG Receipt] All lookups failed, returning 404`);
            return new Response('Prediction not found', { status: 404 });
        }

        // Fetch the market using wisdom-sdk
        console.log(`[SVG Receipt] Looking up market with ID: ${prediction.marketId}`);
        let market: any = null;
        
        try {
            if (prediction.marketId) {
                market = await marketStore.getMarket(prediction.marketId);
            }
            console.log(`[SVG Receipt] Market lookup result: ${market ? 'found' : 'not found'}`);
        } catch (err) {
            console.log(`[SVG Receipt] Error fetching market: ${err}`);
        }

        if (!market) {
            console.log(`[SVG Receipt] Market not found for prediction with ID: ${id}, returning 404`);
            return new Response('Market not found for this prediction', { status: 404 });
        }

        // Extract data with type safety
        console.log(`[SVG Receipt] Generating receipt with market name: ${market.name}`);
        const marketName = market.name;
        const isResolved = market.status === 'resolved';

        const selectedOutcomeId = typeof prediction.outcomeId === 'number'
            ? prediction.outcomeId
            : Number(prediction.outcomeId);

        const amount = typeof prediction.amount === 'number'
            ? prediction.amount
            : Number(prediction.amount || 0);

        // Find the selected outcome
        const outcomes = Array.isArray(market.outcomes)
            ? market.outcomes
            : JSON.parse(typeof market.outcomes === 'string' ? market.outcomes : '[]');

        const selectedOutcome = outcomes.find((o: any) => o.id === selectedOutcomeId) || { name: 'Unknown' };
        const outcomeName = selectedOutcome.name;

        // Calculate the odds based on market state - similar to how it's calculated elsewhere
        // First get the total amount staked on all outcomes
        const totalPredictions = outcomes.reduce((total: number, outcome: any) => {
            const outcomeTotal = typeof outcome.total === 'number'
                ? outcome.total
                : Number(outcome.total || 0);
            return total + outcomeTotal;
        }, 0);
        
        // Then calculate the odds for the selected outcome
        const selectedOutcomeTotal = selectedOutcome && typeof selectedOutcome.total === 'number'
            ? selectedOutcome.total
            : Number(selectedOutcome?.total || 0);
            
        // Calculate odds using the parimutuel formula with house edge
        const houseEdge = 0.95; // 5% house edge
        
        // If we have meaningful data, calculate odds properly, otherwise use odds from prediction or default to 2.0
        let odds: number;
        if (totalPredictions > 0 && selectedOutcomeTotal > 0) {
            odds = +((totalPredictions * houseEdge) / selectedOutcomeTotal).toFixed(2);
        } else if (typeof (prediction as any).odds === 'number') {
            odds = (prediction as any).odds;
        } else if (typeof (prediction as any).odds === 'string') {
            odds = Number((prediction as any).odds || 2.0);
        } else {
            odds = 2.0;  // Default odds if no data is available
        }
        
        console.log(`[SVG Receipt] Calculated odds for prediction: ${odds}`)

        // Format date/time
        const formatDate = (dateStr: string | number): string => {
            const date = new Date(dateStr);
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        };

        // Parse the created date
        const createdAt = formatDate(prediction.createdAt);

        // Create URL for QR code
        const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
        const predictionUrl = `${baseUrl}/prediction/${prediction.id}`;
        const qrCodeSvg = generateQRCodeSVG(predictionUrl);

        // Receipt unique identifier - use the tokenId if available, otherwise the prediction ID 
        const receiptId = (nftReceipt?.tokenId || prediction.nftReceipt?.tokenId || prediction.id).substring(0, 8);

        // Define colors based on the status
        const statusColor = isResolved 
            ? (prediction.status === 'won' ? '#10b981' : '#ef4444') 
            : '#3b82f6';
            
        const gradientStart = isResolved 
            ? (prediction.status === 'won' ? '#10b98150' : '#ef444450') 
            : '#3b82f650';
            
        const accentColor = isResolved 
            ? (prediction.status === 'won' ? '#059669' : '#dc2626') 
            : '#2563eb';
            
        // Generate a random holographic effect particle pattern
        let holoParticles = '';
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const x = 50 + Math.random() * 500;
            const y = 50 + Math.random() * 700;
            const size = 2 + Math.random() * 4;
            const opacity = 0.2 + Math.random() * 0.3;
            holoParticles += `<circle cx="${x}" cy="${y}" r="${size}" fill="${statusColor}" opacity="${opacity}" />`;
        }
        
        // Create a pattern for background texture
        const patternId = `grid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Generate SVG for receipt - ticket-style landscape design with all outcomes
        const svgContent = `
        <svg width="900" height="450" viewBox="0 0 900 450" xmlns="http://www.w3.org/2000/svg">
            <!-- Definitions -->
            <defs>
                <!-- Background gradient -->
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#0f172a" />
                </linearGradient>
                
                <!-- Ticket background with subtle gradient -->
                <linearGradient id="ticketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f8fafc" />
                    <stop offset="100%" stop-color="#f1f5f9" />
                </linearGradient>
                
                <!-- Status color gradient -->
                <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${statusColor}" />
                    <stop offset="100%" stop-color="${accentColor}" />
                </linearGradient>
                
                <!-- Holographic effect -->
                <linearGradient id="holoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${statusColor}30" />
                    <stop offset="50%" stop-color="${statusColor}10" />
                    <stop offset="100%" stop-color="${statusColor}30" />
                </linearGradient>
                
                <!-- Shimmer animation -->
                <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ffffff00">
                        <animate attributeName="offset" values="0;1" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="20%" stop-color="#ffffff60">
                        <animate attributeName="offset" values="0.2;1.2" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="40%" stop-color="#ffffff00">
                        <animate attributeName="offset" values="0.4;1.4" dur="3s" repeatCount="indefinite" />
                    </stop>
                </linearGradient>
                
                <!-- Ticket background pattern -->
                <pattern id="${patternId}" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="#00000003"/>
                    <path d="M 0,10 L 20,10 M 10,0 L 10,20" stroke="#00000008" stroke-width="0.5"/>
                </pattern>
                
                <!-- Paper texture -->
                <filter id="paper-texture" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch" result="noise"/>
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.05 0" in="noise" result="muted-noise"/>
                    <feComposite operator="in" in="SourceGraphic" in2="muted-noise" result="comp-noise"/>
                    <feBlend mode="multiply" in="comp-noise" in2="SourceGraphic" result="blend-noise"/>
                </filter>
                
                <!-- Shadow effect -->
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.2" flood-color="#000"/>
                </filter>
                
                <!-- Subtle emboss for text -->
                <filter id="emboss" x="-10%" y="-10%" width="120%" height="120%">
                    <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="1 1 1 1 -7 1 1 1 1"/>
                </filter>
                
                <!-- Circular cutout mask for ticket stub -->
                <clipPath id="stubCutout">
                    <path d="M 270,0 L 270,450 
                             M 250,30 C 260,30 260,50 250,50 
                             M 250,80 C 260,80 260,100 250,100
                             M 250,130 C 260,130 260,150 250,150
                             M 250,180 C 260,180 260,200 250,200
                             M 250,230 C 260,230 260,250 250,250
                             M 250,280 C 260,280 260,300 250,300
                             M 250,330 C 260,330 260,350 250,350
                             M 250,380 C 260,380 260,400 250,400" />
                </clipPath>
            </defs>
            
            <!-- Main Background -->
            <rect width="900" height="450" fill="url(#bgGradient)"/>
            
            <!-- Ticket Container - Main Section -->
            <rect x="50" y="50" width="800" height="350" rx="8" ry="8" fill="url(#ticketGradient)" filter="url(#shadow)" />
            <rect x="50" y="50" width="800" height="350" rx="8" ry="8" fill="url(#${patternId})" filter="url(#paper-texture)" />
            
            <!-- Ticket Stub Divider Line -->
            <path d="M 270,50 L 270,400 
                     M 250,80 C 260,80 260,100 250,100
                     M 250,130 C 260,130 260,150 250,150
                     M 250,180 C 260,180 260,200 250,200
                     M 250,230 C 260,230 260,250 250,250
                     M 250,280 C 260,280 260,300 250,300
                     M 250,330 C 260,330 260,350 250,350" 
                  stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,5" fill="none">
                <animate attributeName="stroke-dashoffset" values="0;20" dur="60s" repeatCount="indefinite" />
            </path>
            
            <!-- Holographic border effect -->
            <rect x="55" y="55" width="790" height="340" rx="6" ry="6" fill="none" stroke="url(#holoGradient)" stroke-width="2" opacity="0.7" />
            
            <!-- Ticket Stub - Left section -->
            <g>
                <!-- Logo -->
                <text x="160" y="90" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#0f172a">OP_PREDICT</text>
                <text x="160" y="91" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="${statusColor}" opacity="0.4">OP_PREDICT</text>
                
                <!-- QR Code -->
                <rect x="110" y="110" width="100" height="100" rx="4" ry="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
                <g transform="translate(110, 110)">
                    ${qrCodeSvg}
                </g>
                
                <!-- Status Badge -->
                <rect x="110" y="230" width="100" height="26" rx="13" ry="13" fill="url(#statusGradient)">
                    <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
                </rect>
                <text x="160" y="247" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white" letter-spacing="1">
                    ${isResolved ? (prediction.status === 'won' ? 'WON' : 'LOST') : 'ACTIVE'}
                </text>
                
                <!-- Receipt ID -->
                <text x="160" y="280" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="#64748b" letter-spacing="1">RECEIPT ID</text>
                <text x="160" y="300" font-size="11" font-family="monospace" text-anchor="middle" fill="#334155">#${receiptId}</text>
                
                <!-- Date -->
                <text x="160" y="330" font-family="Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle" fill="#64748b" letter-spacing="1">DATE</text>
                <text x="160" y="345" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#334155">${createdAt.split(' ')[0]}</text>
                <text x="160" y="360" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#334155">${createdAt.split(' ')[1]}</text>
            </g>
            
            <!-- Main Ticket Content - Right Section -->
            <g>
                <!-- Market Header -->
                <text x="290" y="85" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b" letter-spacing="1">MARKET</text>
                <foreignObject x="290" y="95" width="540" height="50">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; color: #0f172a; text-shadow: 0px 0.5px 0px rgba(0,0,0,0.1);">
                        ${marketName}
                    </div>
                </foreignObject>
                
                <!-- Ticket Details Section -->
                <rect x="290" y="155" width="540" height="185" rx="6" ry="6" fill="#f8fafc50" stroke="#e2e8f060" stroke-width="1" />
                
                <!-- Prediction Amount -->
                <text x="320" y="180" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b" letter-spacing="1">AMOUNT</text>
                <text x="320" y="200" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">$${amount.toFixed(2)}</text>
                
                <!-- Outcomes Header -->
                <text x="500" y="180" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b" letter-spacing="1">OUTCOMES</text>
                
                <!-- Generate outcome checkboxes -->
                ${outcomes.map((outcome: any, index: number) => {
                    const isSelected = outcome.id === selectedOutcomeId;
                    const yPos = 200 + (index * 30);
                    
                    return `
                    <g transform="translate(500, ${yPos})">
                        <!-- Checkbox -->
                        <rect x="0" y="-15" width="18" height="18" rx="3" ry="3" fill="${isSelected ? statusColor : 'white'}" stroke="#64748b" stroke-width="1" />
                        ${isSelected ? `
                        <path d="M 4,0 L 8,8 L 14,-5" stroke="white" stroke-width="2" fill="none" />
                        `: ''}
                        
                        <!-- Outcome Name -->
                        <text x="30" y="0" font-family="Arial, sans-serif" font-size="14" fill="#0f172a" ${isSelected ? 'font-weight="bold"' : ''}>
                            ${outcome.name}
                        </text>
                    </g>
                    `;
                }).join('')}
                
                <!-- Footer Elements -->
                <g transform="translate(550, 370)">
                    <!-- Validation Stamp -->
                    <g transform="translate(0, 0) rotate(-5)">
                        <circle cx="0" cy="0" r="25" fill="${statusColor}15" opacity="0.5">
                            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="5s" repeatCount="indefinite" />
                        </circle>
                        <text x="0" y="4" font-family="Arial, sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="${statusColor}80">VERIFIED</text>
                    </g>
                    
                    <!-- Serial Number -->
                    <text x="150" y="0" font-family="Arial, sans-serif" font-size="8" text-anchor="end" fill="#94a3b8" letter-spacing="1">
                        OP_PREDICT · ${new Date().toISOString().split('T')[0]} · #${receiptId.substring(0, 4)}
                    </text>
                </g>
                
                <!-- Subtle notice -->
                <text x="360" y="385" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="#64748b">
                    TESTNET ONLY · POWERED BY SIGNET · NO ACTUAL USD VALUE
                </text>
            </g>
        </svg>
        `;

        // Return the SVG with correct content type
        return new Response(svgContent, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error: any) {
        console.error('Error generating SVG receipt:', error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}