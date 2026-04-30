import 'server-only'
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'
export const MAX_TOKENS = 4096

export function buildAnalysisPrompt(
  resumeText: string,
  jobDescription: string
): string {
  return `You are an expert technical recruiter and ATS specialist with 15+ years of experience at top tech companies. Analyze this resume against the job description with the precision of a senior hiring manager.

<resume>
${resumeText}
</resume>

<job_description>
${jobDescription}
</job_description>

Analyze thoroughly and return ONLY a valid JSON object matching this exact structure. No markdown, no explanation, just the JSON:

{
  "overall_score": <integer 0-100, honest and calibrated>,
  "ats_score": <integer 0-100, based purely on keyword match and formatting>,
  "verdict": "<2-3 sentence executive summary of this candidacy>",
  "strengths": ["<specific strength with evidence from resume>"],
  "critical_issues": ["<specific blocking issue that would cause rejection>"],
  "sections": [
    {
      "name": "<section name: summary|experience|education|skills|projects|certifications>",
      "score": <integer 0-100>,
      "feedback": "<specific, actionable paragraph — reference actual resume content>",
      "improvements": ["<concrete improvement with example>"]
    }
  ],
  "keyword_gaps": [
    {
      "keyword": "<exact keyword/phrase from JD missing in resume>",
      "importance": "<critical|important|nice-to-have>",
      "context": "<where this keyword appears in the JD and why it matters>"
    }
  ],
  "suggestions": [
    {
      "priority": "<high|medium|low>",
      "category": "<Formatting|Content|Keywords|Quantification|Structure>",
      "action": "<specific actionable instruction>",
      "reason": "<why this matters for this specific role>"
    }
  ],
  "rewrite_examples": [
    {
      "section": "<section name>",
      "original": "<exact text from resume that is weak>",
      "improved": "<rewritten version that is stronger, quantified, keyword-rich>"
    }
  ]
}

Scoring calibration:
- 90-100: Exceptional match, would likely get interview at any company
- 75-89: Strong candidate, minor gaps
- 60-74: Decent match, notable improvements needed
- 40-59: Significant gaps, major rework required
- 0-39: Poor match, fundamental mismatch

Be honest. Recruiters respect brutal honesty. Do not inflate scores.`
}
