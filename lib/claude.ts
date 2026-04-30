import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  defaultHeaders: {
    'anthropic-beta': 'prompt-caching-2024-07-31',
  },
})

export const CLAUDE_MODEL = 'claude-haiku-4-5'
export const MAX_TOKENS = 8000

// Static instructions — cache_control marks this as a cacheable prefix.
// Haiku 4.5 minimum is 4096 tokens; prefix will hit cache once resume + JD
// content pushes the total past that threshold.
const SYSTEM_PROMPT = `You are an expert technical recruiter and ATS specialist. Analyze the resume against the job description precisely.

Return ONLY a valid JSON object. No markdown, no code blocks, no explanation — raw JSON only.

Rules for brevity (IMPORTANT — stay within these limits):
- strengths: exactly 3 items, one sentence each
- critical_issues: exactly 3 items, one sentence each
- sections: only sections present in the resume, max 4, feedback max 2 sentences, improvements max 2 items each
- keyword_gaps: max 6 items, context max 1 sentence
- suggestions: max 5 items, action max 1 sentence, reason max 1 sentence
- rewrite_examples: exactly 2 items

JSON structure:
{
  "overall_score": <integer 0-100>,
  "ats_score": <integer 0-100>,
  "verdict": "<2 sentences max>",
  "strengths": ["<one sentence>", "<one sentence>", "<one sentence>"],
  "critical_issues": ["<one sentence>", "<one sentence>", "<one sentence>"],
  "sections": [
    {
      "name": "<summary|experience|education|skills|projects|certifications>",
      "score": <integer 0-100>,
      "feedback": "<max 2 sentences>",
      "improvements": ["<one sentence>", "<one sentence>"]
    }
  ],
  "keyword_gaps": [
    {
      "keyword": "<missing keyword>",
      "importance": "<critical|important|nice-to-have>",
      "context": "<one sentence>"
    }
  ],
  "suggestions": [
    {
      "priority": "<high|medium|low>",
      "category": "<Formatting|Content|Keywords|Quantification|Structure>",
      "action": "<one sentence>",
      "reason": "<one sentence>"
    }
  ],
  "rewrite_examples": [
    {
      "section": "<section name>",
      "original": "<weak text from resume>",
      "improved": "<stronger rewrite>"
    }
  ]
}

Scoring: 90-100 exceptional, 75-89 strong, 60-74 decent, 40-59 significant gaps, 0-39 poor match. Be honest, do not inflate.`

export function getSystemBlocks() {
  return [
    {
      type: 'text' as const,
      text: SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' as const },
    },
  ]
}

export function buildUserMessage(
  resumeText: string,
  jobDescription: string,
  jobTitle?: string,
  companyName?: string
): string {
  const header = [
    jobTitle ? `Job Title: ${jobTitle}` : null,
    companyName ? `Company: ${companyName}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return [
    header || null,
    `<resume>\n${resumeText}\n</resume>`,
    `<job_description>\n${jobDescription}\n</job_description>`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
