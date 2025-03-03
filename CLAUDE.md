# OP Predict Development Guide

## Build & Development Commands
- `pnpm dev` - Run Next.js development server
- `pnpm build` - Build for production (automatically builds lib package first)
- `pnpm lint` - Run ESLint
- `pnpm dev:all` - Run Next.js + MCP server with inspector
- `cd lib && pnpm build` - Build the lib package
- `cd mcp-server && pnpm build` - Build the MCP server

## Code Style Guidelines
- **Imports**: Group by external → internal, React/Next first, then UI components, utilities, local
- **Naming**: PascalCase for components/types/interfaces, camelCase for functions/variables
- **Types**: Define at top of file, use Zod for validation, prefer explicit type annotations
- **Error Handling**: Use try/catch with structured response objects `{success, error?, data?}`
- **Components**: Small, focused, with clear responsibility separation (UI vs. logic)
- **State**: Server actions for mutations, React hooks for local state, KV store for persistence
- **Styling**: Use Tailwind with `cn()` utility for conditional classes
- **Package Manager**: Use pnpm (workspace monorepo setup)