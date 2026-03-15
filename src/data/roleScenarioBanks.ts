// Role-based scenario banks — DEPRECATED
// Banking-specific scenarios archived to docs/archived-banking-content/roleScenarioBanks.ts
// Scenarios are now generated per-industry by the generate-module-content edge function.

export interface RoleScenario {
  scenario: string;
  hints: string[];
}

// Empty — all scenarios now come from the generation pipeline
export const ROLE_SCENARIO_BANKS: Record<string, Record<string, RoleScenario>> = {};

/**
 * Helper: Get the role scenario for a module + LOB, or null if none exists.
 * Always returns null now — kept for backward compatibility with callers.
 */
export function getRoleScenario(moduleId: string, lineOfBusiness: string): RoleScenario | null {
  return ROLE_SCENARIO_BANKS[moduleId]?.[lineOfBusiness] ?? null;
}
