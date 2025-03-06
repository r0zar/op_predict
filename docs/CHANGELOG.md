# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### SDK and Server Refactoring (2025-03-05)
- Migrated MCP Server to its own repository (`wisdom-mcp`)
  - Detailed changelog for this migration is kept in the wisdom-mcp repository
  - Replaced local code with dependency on the external package
- Created STATUS.md and NEXT_STEPS.md documents
  - Added project status tracking and roadmap
  - Documented current progress and upcoming tasks
  - Added development checklist for SDK integration

## [1.0.0] - 2025-03-04
### Migration from @op-predict/lib to wisdom-sdk
- Successfully migrated from local library package to external npm package
- Created `/lib/utils.ts` to maintain utilities not part of the SDK
- Fixed type imports across the codebase
- Updated all import paths from `@/lib/src/...` to `wisdom-sdk` or `@/lib/utils`
- Created and ran scripts to update imports across the codebase
- Confirmed build success with no more references to @op-predict/lib
- Verified MCP server already using wisdom-sdk
- Ensured all components are properly typed

## External Dependencies

This project now relies on two external packages, developed and maintained separately:

1. **wisdom-sdk**: Core SDK for accessing prediction market data
   - Repository: https://github.com/charisma-labs/wisdom-sdk
   - Provides data access layer and business logic

2. **wisdom-mcp**: Model Context Protocol server 
   - Repository: https://github.com/charisma-labs/wisdom-mcp
   - Provides AI integration via MCP protocol