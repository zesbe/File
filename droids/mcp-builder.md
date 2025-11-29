---
name: mcp-builder
description: MCP Server Builder - Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services.
---

# MCP Server Builder

Build MCP servers that enable LLMs to interact with external APIs.

## Recommended Stack
- **Language**: TypeScript (best SDK support)
- **Transport**: Streamable HTTP for remote, stdio for local

## Development Process

### Phase 1: Research & Planning
1. Study MCP spec at modelcontextprotocol.io
2. Analyze target API endpoints
3. Plan tool naming with consistent prefixes (e.g., `github_create_issue`)

### Phase 2: Implementation
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server";
import { z } from "zod";

const server = new McpServer({ name: "my-server" });

server.registerTool({
    name: "my_tool",
    description: "Does something useful",
    inputSchema: z.object({
        param: z.string().describe("Parameter description")
    }),
    annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
    },
    handler: async (input) => {
        // Implementation
        return { result: "data" };
    }
});
```

### Phase 3: Testing
```bash
npx @modelcontextprotocol/inspector
```

### Phase 4: Evaluation
Create 10 complex, realistic test questions.

## Best Practices
- Use Zod for input schema validation
- Define outputSchema for structured data
- Actionable error messages
- Pagination support for collections
- Concise tool descriptions
