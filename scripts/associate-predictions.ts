import { config } from 'dotenv';
import { resolve } from 'path';
import { marketStore, predictionStore } from 'wisdom-sdk';

// Load .env from project root
config({ path: resolve(__dirname, '../.env.local') });

// Add a 'noImplicitAny: false' comment to override strict checking in this file
// @ts-ignore
async function associatePredictions() {
    try {
        // Get all markets
        const markets = await marketStore.getMarkets();
        console.log(`Found ${markets.length} markets`);

        // Process each market
        for (const market of markets) {
            // Type assertion
            const m = market as any;
            console.log(`\nProcessing market: ${m?.name || 'Unknown'}`);

            // Reset market stats
            m.participants = 0;
            m.poolAmount = 0;
            (m.outcomes || []).forEach((outcome: any) => {
                outcome.votes = 0;
                outcome.amount = 0;
            });

            // Get all predictions for this market
            const predictions = await predictionStore.getMarketPredictions(m.id);
            console.log(`Found ${predictions.length} predictions`);

            // Update market stats for each prediction
            for (const prediction of predictions) {
                if (!prediction) continue; // Skip undefined predictions
                
                const predictionAmount = prediction?.amount || 0; // Safe access
                
                m.participants++;
                m.poolAmount = (m.poolAmount || 0) + predictionAmount;

                const predictionOutcomeId = prediction?.outcomeId;
                const outcome = (m.outcomes || []).find((o: any) => o?.id === predictionOutcomeId);
                if (outcome) {
                    outcome.votes = (outcome.votes || 0) + 1;
                    outcome.amount = (outcome.amount || 0) + predictionAmount;
                }
            }

            // Save updated market
            await marketStore.updateMarket(m.id, m);
            console.log(`Updated market stats:
                - Participants: ${m.participants}
                - Pool Amount: ${m.poolAmount}
                - Outcomes:
                    ${(m.outcomes || []).map((o: any) => `
                    ${o.name}: ${o.votes} votes, $${o.amount}`).join('')}
            `);
        }

        console.log('\nFinished associating all predictions with markets');
    } catch (error) {
        console.error('Error associating predictions:', error);
    }
}

// Run the script
associatePredictions();
