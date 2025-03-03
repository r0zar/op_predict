#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
    try {
        // Create MCP server
        const { server, cleanup } = await createServer();

        // Set up stdio transport
        const transport = new StdioServerTransport();
        await server.connect(transport);

        // Handle cleanup on process exit
        process.on('SIGINT', async () => {
            console.log('\nReceived SIGINT. Cleaning up...');
            await cleanup();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\nReceived SIGTERM. Cleaning up...');
            await cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
    }
}

main(); 