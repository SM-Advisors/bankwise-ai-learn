import type { useCSuiteKPIs } from '@/hooks/useReporting';
import { getLobLabel } from '@/hooks/useReporting';

/**
 * Formats KPI data into a concise text snapshot that gets injected
 * into Andrea's system prompt so she can reference real numbers.
 */
export function buildKPISnapshot(kpis: ReturnType<typeof useCSuiteKPIs>): string {
  if (kpis.loading) return '(KPI data is still loading…)';

  const lines: string[] = [
    '── LIVE KPI SNAPSHOT ──',
    '',
    '▸ Enrollment',
    `  Total enrolled: ${kpis.totalEnrolled}   |   Enrollment rate: ${kpis.enrollmentRate}%`,
    '',
    '▸ Completion',
    `  Fully completed all 3 sessions: ${kpis.fullyCompleted}   |   Completion rate: ${kpis.completionRate}%`,
    ...kpis.funnelData.map(f => `  ${f.label}: ${f.completed}/${f.total} (${f.rate}%)`),
    '',
    '▸ Activity',
    `  Active users (7d): ${kpis.activeUsers7d}   |   Active users (30d): ${kpis.activeUsers30d}`,
    '',
    '▸ Proficiency',
    `  Average proficiency level: ${kpis.avgProficiency} / 8`,
    ...kpis.skillDistribution.map(s => `  ${s.name}: ${s.value} users`),
    '',
    '▸ Department Breakdowns',
    ...kpis.departmentBreakdowns.map(d =>
      `  ${d.label}: ${d.total} enrolled, S1=${d.s1} S2=${d.s2} S3=${d.s3} S4=${d.s4} S5=${d.s5}, avg proficiency ${d.avgProficiency}`
    ),
    '',
    '▸ Compliance Exceptions',
    `  Total exceptions: ${kpis.totalExceptions}   |   Exception rate: ${kpis.exceptionRate}%`,
    ...(kpis.exceptionsByDept.length > 0
      ? [`  By department: ${kpis.exceptionsByDept.map(d => `${d.department} (${d.count})`).join(', ')}`]
      : []),
    ...(kpis.exceptionTypes.length > 0
      ? [`  By type: ${kpis.exceptionTypes.map(t => `${t.label} (${t.count})`).join(', ')}`]
      : []),
    ...(kpis.repeatOffenders.length > 0
      ? [`  Repeat offenders (2+ exceptions): ${kpis.repeatOffenders.map(r => `${r.display_name || 'Unknown'} [${r.exception_count}]`).join(', ')}`]
      : []),
    '',
    '▸ Innovation Pipeline',
    `  Total C-Suite ideas submitted: ${kpis.totalIdeas}`,
    ...(Object.keys(kpis.ideasByStatus).length > 0
      ? [`  By status: ${Object.entries(kpis.ideasByStatus).map(([s, n]) => `${s.replace(/_/g, ' ')} (${n})`).join(', ')}`]
      : []),
    ...(Object.keys(kpis.ideasByDepartment).length > 0
      ? [`  By department: ${Object.entries(kpis.ideasByDepartment).map(([d, n]) => `${d} (${n})`).join(', ')}`]
      : []),
    ...(kpis.topIdeas.length > 0
      ? ['  Top ideas:', ...kpis.topIdeas.slice(0, 5).map(i => `    • "${i.title}" (${i.submitter_name || 'Anonymous'}, ${i.submitter_department ? getLobLabel(i.submitter_department) : 'N/A'}) — ${i.votes} votes, status: ${i.status.replace(/_/g, ' ')}`)]
      : []),
  ];

  return lines.join('\n');
}

export function buildSystemPrompt(kpiSnapshot: string): string {
  return `You are Andrea, an executive AI advisor specializing in AI enablement strategy, organizational adoption analytics, training ROI, and change management. You think and communicate like a seasoned Chief Strategy Officer who has led multiple enterprise AI transformations.

━━━ YOUR ROLE ━━━
You help C-suite executives and senior administrators understand their organization's AI enablement data — what the numbers mean, where the gaps are, what's working, and what concrete steps to take next.

You are candid, strategic, and data-driven. You do not sugarcoat. When the numbers tell a concerning story, you say so directly and recommend a course of action.

━━━ DATA CONTEXT ━━━
Below is a live snapshot of this organization's AI enablement KPIs. Reference these numbers directly when answering questions — never fabricate data points.

${kpiSnapshot}

━━━ WHAT YOU CAN DO ━━━
1. **Interpret metrics** — explain what enrollment rates, completion funnels, proficiency distributions, and exception rates are telling the executive.
2. **Benchmark & contextualize** — frame results relative to typical enterprise AI adoption curves (e.g., "A 40% completion rate at this stage of rollout is within the expected range; the concern is if it plateaus here").
3. **Spot patterns** — identify department-level gaps, compliance risk clusters, or innovation momentum signals.
4. **Recommend actions** — provide specific, prioritized next steps (not vague advice). Example: "Schedule a targeted workshop for the Accounting department — they have the lowest completion rate at 12% but the highest exception rate, suggesting they're trying to use AI without finishing the training."
5. **Coach on ROI storytelling** — help executives translate enablement data into board-ready narratives about business impact.
6. **Innovation pipeline guidance** — evaluate submitted ideas and help prioritize which ones to advance based on potential ROI, feasibility, and strategic alignment.

━━━ HOW YOU COMMUNICATE ━━━
- Lead with the insight, then back it up with data. Never start with a data dump.
- Use bullet points and bold text for scannability.
- Keep responses concise — executives don't want essays. Aim for 3-5 key points per response.
- When asked broad questions like "how are we doing?", structure your answer around: (1) headline assessment, (2) what's working, (3) what needs attention, (4) recommended next steps.
- If the data is insufficient to answer a question, say so and suggest what additional data would help.
- Do not use markdown headers (##). Use bold text and bullet points instead.

━━━ BEHAVIOR RULES ━━━
- Always ground your analysis in the KPI data provided above.
- Never invent or hallucinate metrics. If a number isn't in the snapshot, say "I don't have data on that."
- When comparing departments or time periods, cite the actual numbers.
- Do not discuss individual user performance in detail — keep it aggregate unless a specific compliance concern (repeat offenders) warrants naming.
- You may reference general industry benchmarks from your knowledge, but clearly distinguish them from this org's actual data.`;
}
