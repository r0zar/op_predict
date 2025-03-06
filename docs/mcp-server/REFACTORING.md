# MCP Server Refactoring Guide

This document outlines the process of refactoring the MCP server from its current implementation within the op-predict monorepo to a standalone package called `wisdom-mcp`.

## Motivation

Currently, the MCP server is integrated within the op-predict monorepo. Following the successful migration of `@op-predict/lib` to the standalone `wisdom-sdk` package, we are now planning to do the same for the MCP server. This will:

1. Make the MCP server independently versioned and deployable
2. Improve code organization through domain-based modularization
3. Allow for better testing and documentation
4. Make it easier for other projects to utilize the MCP server

## Current Architecture

The current MCP server consists of:

- `mcp-server/src/index.ts`: Entry point and initialization
- `mcp-server/src/server.ts`: Core server implementation (1800+ lines)
- `mcp-server/src/tools/index.ts`: Tool implementations (500+ lines)
- `mcp-server/src/tools/types.ts`: Schema definitions

Issues with the current implementation:

1. The server.ts file is monolithic and handles too many responsibilities
2. Tool handlers are mixed with schema definitions
3. There's significant code duplication
4. Error handling is inconsistent
5. Testing is difficult due to tight coupling

## New Architecture

The new architecture will:

1. Split functionality into domain-specific modules
2. Separate the core server from tool handlers
3. Provide consistent error handling and response formatting
4. Support better testing through dependency injection
5. Offer improved documentation

### Project Structure

```
wisdom-mcp/
├── src/
│   ├── index.ts                 # Entry point
│   ├── server.ts                # Core server (simplified)
│   ├── config.ts                # Configuration handling
│   ├── tools/
│   │   ├── index.ts             # Tool registry
│   │   ├── types.ts             # Common type definitions
│   │   ├── market-tools.ts      # Market-related tools
│   │   ├── prediction-tools.ts  # Prediction-related tools
│   │   ├── bug-tools.ts         # Bug report tools
│   │   ├── user-tools.ts        # User-related tools
│   ├── prompts/
│   │   ├── index.ts             # Prompt registry
│   │   ├── types.ts             # Prompt type definitions
│   │   ├── market-prompts.ts    # Market analysis prompts
│   ├── resources/
│   │   ├── index.ts             # Resource handlers
│   │   ├── types.ts             # Resource type definitions
│   ├── utils/
│   │   ├── error-handling.ts    # Error utilities
│   │   ├── logging.ts           # Logging utilities
│   ├── common/
│   │   ├── schema-registry.ts   # Schema management
```

## Implementation Plan

### Phase 1: Initial Setup

1. Initialize new repository
2. Set up TypeScript, ESLint, and Prettier
3. Configure package.json for ESM modules
4. Create basic project structure
5. Implement essential utility functions

### Phase 2: Core Server Implementation

1. Create simplified server.ts
2. Implement resource handling
3. Set up prompt management
4. Develop subscription management

### Phase 3: Tool Implementation

1. Create base tool registry
2. Implement market tools
3. Implement prediction tools
4. Implement bug report tools
5. Implement user tools

### Phase 4: Testing & Documentation

1. Set up Jest for testing
2. Write unit tests for each module
3. Create integration tests
4. Generate API documentation
5. Create usage examples

## Migration Strategy

1. Develop the new package alongside the existing implementation
2. Once complete, integrate in place of the current mcp-server
3. Run parallel testing to ensure identical functionality
4. Once verified, complete the transition

## API Changes

The new API will be backward compatible with the current implementation but will offer additional features:

1. Better error handling with detailed error types
2. Consistent response formats
3. Optional logging middleware
4. Configuration customization
5. Health check endpoints

## Dependencies

- wisdom-sdk: Core SDK for accessing prediction market data
- @modelcontextprotocol/sdk: MCP protocol implementation
- zod: Schema validation
- dotenv: Environment management
- pino: Improved logging (new)
- jest: Testing framework (new)

## Timeline

- Phase 1: 1 day
- Phase 2: 2-3 days
- Phase 3: 2-3 days
- Phase 4: 1-2 days

Total estimated time: 6-9 days