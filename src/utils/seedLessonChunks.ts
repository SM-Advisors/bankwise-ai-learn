/**
 * Seed Lesson Chunks Utility
 *
 * Calls the seed_lesson_chunks edge function with content from trainingContent.ts
 * to populate the lesson_content_chunks table for RAG retrieval.
 *
 * Usage (from browser console or admin page):
 *   import { seedAllLessonChunks } from '@/utils/seedLessonChunks';
 *   await seedAllLessonChunks();
 *
 * Or import specific sessions:
 *   await seedLessonChunks([2, 3]); // Only seed sessions 2 and 3
 */

import { supabase } from '@/integrations/supabase/client';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';

export async function seedLessonChunks(sessionIds?: number[]): Promise<{
  success: boolean;
  totalModules: number;
  totalChunks: number;
  sessions: Record<string, { modules: number; chunks: number }>;
  embeddings?: { embedded: number; errors?: string[] } | null;
  error?: string;
}> {
  const sessionsToSeed = sessionIds || Object.keys(ALL_SESSION_CONTENT).map(Number);

  // Build the sessions payload from trainingContent.ts
  const sessions: Record<number, { title: string; modules: Array<{
    id: string;
    title: string;
    type: string;
    content: {
      overview: string;
      keyPoints: string[];
      examples?: Array<{ title: string; good?: string; bad?: string; explanation: string }>;
      steps?: string[];
      practiceTask: {
        title: string;
        instructions: string;
        scenario: string;
        hints: string[];
        successCriteria: string[];
      };
    };
  }> }> = {};

  for (const sessionId of sessionsToSeed) {
    const sessionContent = ALL_SESSION_CONTENT[sessionId];
    if (!sessionContent) {
      console.warn(`Session ${sessionId} not found in ALL_SESSION_CONTENT, skipping`);
      continue;
    }

    sessions[sessionId] = {
      title: sessionContent.title,
      modules: sessionContent.modules.map(mod => ({
        id: mod.id,
        title: mod.title,
        type: mod.type,
        content: {
          overview: mod.content.overview,
          keyPoints: mod.content.keyPoints,
          examples: mod.content.examples,
          steps: mod.content.steps,
          practiceTask: mod.content.practiceTask,
        },
      })),
    };
  }

  console.log(`Seeding ${Object.keys(sessions).length} sessions...`);

  const { data, error } = await supabase.functions.invoke('seed_lesson_chunks', {
    body: { sessions },
  });

  if (error) {
    console.error('Seed error:', error);
    return {
      success: false,
      totalModules: 0,
      totalChunks: 0,
      sessions: {},
      error: error.message || 'Failed to seed lesson chunks',
    };
  }

  console.log('Seed result:', data);
  return data;
}

export async function seedAllLessonChunks() {
  return seedLessonChunks();
}
