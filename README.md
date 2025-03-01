# OP_PREDICT

## Overview

OP_PREDICT is a decentralized prediction market platform built on blockchain technology. It allows users to bet on real-world events and earn rewards through a transparent and community-driven ecosystem.

## Features

- **Prediction Vaults**: Create and manage prediction vaults as an administrator
- **Market Creation**: Establish prediction markets for various events and outcomes
- **Token Wagering**: Place predictions using tokens and receive NFT receipts
- **Community Trust**: Choose vaults hosted by trusted community members
- **Fair Payouts**: 95% to winning participants, 5% to vault administrators
- **Interactive UI**: Modern, responsive interface with intuitive navigation

## The Prediction Process

1. **Create a Prediction Vault**: Become a vault administrator
2. **Create Prediction Markets**: Set up markets for various events
3. **Place Predictions**: Wager tokens on predicted outcomes
4. **Receive Prediction Receipt NFTs**: Get proof of participation
5. **Market Resolution**: Administrator resolves the market based on real-world outcomes
6. **Claim Winnings**: Winners redeem their Receipt NFTs for rewards

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/op_predict.git
   cd op_predict
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

To create a production build:

```bash
pnpm run build
```

To start the production server:

```bash
pnpm start
```

## Project Structure

- `/app`: Next.js app router pages and layouts
- `/components`: Reusable UI components
  - `explore-content.tsx`: Content exploration and filtering
  - `prediction-process-timeline.tsx`: Timeline visualization
  - `how-it-works-content.tsx`: Educational content about the platform
  - `market-card.tsx`: Card component for prediction markets
- `/lib`: Utility functions and shared code
- `/public`: Static assets

## Key Pages

- **Home**: Introduction to the platform with featured markets
- **Explore**: Browse and filter prediction markets
- **How It Works**: Educational content about prediction markets
- **Leaderboard**: Top performing vaults and users

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.