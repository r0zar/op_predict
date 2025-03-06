import { config } from 'dotenv';
import { resolve } from 'path';
import { marketStore, predictionStore } from 'wisdom-sdk';

// Load .env from project root
config({ path: resolve(__dirname, '../.env.local') });

async function associatePredictions() {
    try {
        // Get all markets
        const markets = await marketStore.getMarkets();
        console.log(`Found ${markets.length} markets`);

        // Process each market
        for (const market of markets) {
            console.log(`\nProcessing market: ${market.name}`);

            // Reset market stats
            market.participants = 0;
            market.poolAmount = 0;
            market.outcomes.forEach(outcome => {
                outcome.votes = 0;
                outcome.amount = 0;
            });

            // Get all predictions for this market
            const predictions = await predictionStore.getMarketPredictions(market.id);
            console.log(`Found ${predictions.length} predictions`);

            // Update market stats for each prediction
            for (const prediction of predictions) {
                market.participants++;
                market.poolAmount = (market.poolAmount || 0) + prediction.amount;

                const outcome = market.outcomes.find(o => o.id === prediction.outcomeId);
                if (outcome) {
                    outcome.votes = (outcome.votes || 0) + 1;
                    outcome.amount = (outcome.amount || 0) + prediction.amount;
                }
            }

            // Save updated market
            await marketStore.updateMarket(market.id, market);
            console.log(`Updated market stats:
                - Participants: ${market.participants}
                - Pool Amount: ${market.poolAmount}
                - Outcomes:
                    ${market.outcomes.map(o => `
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
