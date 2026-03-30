

# Fix Type Errors and Deploy Edge Functions

## Problem
The `trainer_chat` and `submission_review` edge functions have TypeScript errors because the untyped Supabase client (`createClient` without generics) causes `.rpc("match_lesson_chunks", ...)` to resolve parameter types as `undefined`/`never`.

## Plan

### 1. Fix `retrieveLessonContext` type in both files
In both `trainer_chat/index.ts` and `submission_review/index.ts`, cast the `.rpc()` call to bypass the strict typing since these functions use `createClient` without database type generics (which is correct for edge functions).

**Change**: Cast the `supabase` parameter in `retrieveLessonContext` to `any`, or cast the `.rpc()` result:

```typescript
// Replace typed rpc call with:
const { data, error } = await (supabase as any).rpc("match_lesson_chunks", {
  query_embedding: JSON.stringify(queryEmbedding),
  match_count: topK,
  filter_lesson_id: lessonId,
  filter_module_id: moduleId || null,
  similarity_threshold: 0.3,
  // + filter_learning_style in trainer_chat
}) as { data: any; error: any };
```

This applies to:
- `supabase/functions/trainer_chat/index.ts` — lines ~401 and ~932 (the function signature and the call site)
- `supabase/functions/submission_review/index.ts` — lines ~185 and ~337

### 2. Redeploy `trainer_chat` (and `submission_review` since it also has errors)

Both functions will be redeployed after fixes.

### Files Modified
- `supabase/functions/trainer_chat/index.ts` (2 changes)
- `supabase/functions/submission_review/index.ts` (2 changes)

