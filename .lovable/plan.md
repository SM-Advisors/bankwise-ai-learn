

## Deploy seed_lesson_chunks and Fix Build Error

### Step 1 -- Deploy the edge function
The `supabase/functions/seed_lesson_chunks/index.ts` file is already written. It just needs to be deployed using the deploy tool. No code changes needed for the function itself.

### Step 2 -- Fix the build error in AdminDashboard.tsx
The `seedLessonChunks` return type doesn't include `embeddings`, but the edge function does return it. The fix is to add `embeddings` to the return type in `seedLessonChunks.ts`:

**File:** `src/utils/seedLessonChunks.ts` (line 18-24)
- Add `embeddings?: { embedded: number; errors?: string[] } | null;` to the return type.

This aligns the TypeScript type with what the edge function actually returns.

### Technical Details

**Return type change in `seedLessonChunks.ts`:**
```typescript
export async function seedLessonChunks(sessionIds?: number[]): Promise<{
  success: boolean;
  totalModules: number;
  totalChunks: number;
  sessions: Record<string, { modules: number; chunks: number }>;
  embeddings?: { embedded: number; errors?: string[] } | null;
  error?: string;
}>
```

No other files need changes.
