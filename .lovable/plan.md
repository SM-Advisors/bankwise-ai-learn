

# Deploy Edge Functions and Add npm Dependency

## Steps

### 1. Deploy edge functions
Deploy `trainer_chat` and `submission_review` edge functions to make the latest code changes live.

### 2. Add `rehype-raw` npm dependency
Install `rehype-raw` package, which is used for rendering raw HTML within rehype/markdown pipelines.

### Technical Details
- Edge functions: `trainer_chat`, `submission_review` — both previously had TypeScript fixes applied (casting `.rpc()` calls with `as any`)
- `rehype-raw`: An npm package that allows raw HTML to pass through rehype processing, commonly used with `react-markdown` or similar renderers

### Files Modified
- `package.json` / `bun.lock` — add `rehype-raw`
- No edge function code changes needed (already fixed in prior sessions)

