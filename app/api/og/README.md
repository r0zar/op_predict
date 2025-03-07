# OpenGraph Image API

This directory contains endpoints for generating dynamic OpenGraph images for social sharing.

## Endpoints

- `/api/og/prediction/[id]`: Generates OG image for a prediction/market showing the market question and outcome odds
- `/api/og/receipt/[id]`: Generates a ticket-style receipt image for a prediction
- `/api/og/debug`: Test endpoint for debugging OG image generation with query parameters

## Architecture

- Uses Next.js Edge API routes with `ImageResponse` from `next/og`
- Data is fetched from Vercel KV store
- SVG is used for complex visual elements in the receipt endpoint
- All routes have caching disabled with `dynamic = 'force-dynamic'` and `revalidate = 0`

## Important Gotchas with Next.js OG Image API

### 1. CSS & Styling Limitations

- **No CSS-in-JS libraries**: Only inline styles are supported
- **Limited CSS properties**: Many properties are unsupported
- **No `fit-content`**: Use fixed dimensions instead (e.g., `width: '200px'`)
- **No relative units**: Use pixel values instead of rem/em/% where possible
- **No custom fonts**: Limited to system fonts or pre-bundled fonts
- **Explicit display properties**: All divs with multiple children MUST have explicit `display: flex` or `display: none`

### 2. React Component Limitations

- **No client components**: Can only use server components
- **No hooks**: Cannot use React hooks (useState, useEffect, etc.)
- **No external components**: Cannot import and use UI libraries
- **Limited SVG support**: SVG attributes must use camelCase (strokeWidth vs stroke-width)

### 3. Value Types & Format Issues

- **zIndex must be unitless**: Use `zIndex: 1` not `zIndex: '1' or '1px'`
- **No string values for numeric properties**: Use numbers (`width: 200` not `width: '200px'`)
- **No CSS variables**: Cannot use CSS variables
- **No calc()**: Limited support for calculated values
- **SVG attributes**: Must use camelCase (React style) for SVG attributes

### 4. Performance & Size Limits

- **Size limit**: OG images have a maximum size (both dimensions and file size)
- **Execution time**: Limited to a few seconds in edge runtime
- **Keep it simple**: Complex layouts can cause failures or timeouts

### 5. Edge Runtime Limitations

- OG image endpoints run in the edge runtime and have restrictions
- Cannot use server-only libraries like `wisdom-sdk` that depend on Node.js modules
- Must use direct KV access with `@vercel/kv` instead of abstraction layers
- Cannot use modules that require `crypto` or other Node.js built-ins
- Always test OG image routes with the debug endpoint first

### 6. Caching Issues

- All OG image endpoints must disable caching to ensure fresh content
- Always include these exports in each route:
  ```tsx
  export const dynamic = 'force-dynamic';
  export const revalidate = 0;
  ```
- Without these, images may be cached by CDN/browsers and not update
- Social platforms may still cache images on their end - use unique URLs when possible

### 7. Debugging Tips

- Use the `/api/og/debug` endpoint to test with query parameters
- Add console.log statements (visible in server logs)
- Break down complex components into simpler parts to identify issues
- When an error occurs, check for:
  - Missing display properties on divs with multiple children
  - Unsupported CSS values or properties
  - SVG attribute format issues
  - zIndex values being strings instead of numbers
  - Unsupported CSS values like `fit-content`

## Example Usage

```tsx
// Basic ImageResponse example
return new ImageResponse(
  (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: '#fff',
      color: '#000',
      padding: '40px',
    }}>
      <h1 style={{ fontSize: '48px' }}>Hello World</h1>
    </div>
  ),
  {
    width: 1200,
    height: 630
  }
);
```

## Testing

Test the debug endpoint by navigating to:
`/api/og/debug?market=Your+market+name&outcome=Option&amount=100`