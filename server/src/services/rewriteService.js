const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Rewrites the entire resume using Gemini, section by section.
 * Returns a structured object with improved versions of every section.
 */
async function rewriteFullResume(extractedData, rawText, jobTitle = '', jobDescription = '') {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const prompt = `
You are an elite resume writer and career strategist. Your job is to completely rewrite and optimize every section of this resume to be:
- ATS-friendly (clear formatting, keyword-rich, no tables/columns)
- Achievement-oriented (quantified metrics, strong action verbs like Led, Built, Reduced, Increased, Shipped)
- Concise and impactful (every bullet says something meaningful)
- Tailored to the target role

${jobTitle ? `Target Role: ${jobTitle}` : ''}
${jobDescription ? `\nJob Description:\n---\n${jobDescription}\n---\n` : ''}

Original Resume Text:
---
${rawText}
---

Extracted Resume Data (for context):
${JSON.stringify(extractedData, null, 2)}

Return a JSON object with this EXACT schema — rewrite every section while keeping all real facts:
{
  "summary": string (3-4 sentence professional summary, ATS-optimized, keyword-rich, first-person omitted),
  "experience": [
    {
      "title": string (keep original),
      "company": string (keep original),
      "location": string (keep original),
      "startDate": string (keep original),
      "endDate": string (keep original),
      "current": boolean,
      "bullets": [string] (4-6 STRONG rewritten bullets with quantified metrics and action verbs — make up plausible numbers if none given, mark with ≈ for estimated)
    }
  ],
  "education": [
    {
      "degree": string,
      "institution": string,
      "location": string,
      "graduationDate": string,
      "gpa": string,
      "highlights": [string] (1-2 notable achievements/coursework if relevant)
    }
  ],
  "skills": {
    "technical": [string],
    "languages": [string],
    "tools": [string],
    "soft": [string]
  },
  "projects": [
    {
      "name": string (keep original),
      "description": string (rewrite to be punchy and impact-focused, 1-2 sentences),
      "technologies": [string],
      "url": string,
      "bullets": [string] (2-3 achievement bullets)
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "date": string
    }
  ],
  "improvements": [
    {
      "section": string (e.g. "Experience - Senior Dev at Google"),
      "before": string (original weak sentence),
      "after": string (your improved rewrite)
    }
  ],
  "keyChanges": [string] (5-8 specific changes made and why — e.g. "Added ≈40% performance metric to API bullet at Company X")
}

Rules:
- Keep ALL personal info (name, email, phone, etc.) from original — do NOT invent contact details
- Do NOT fabricate companies, titles, or dates
- You MAY add plausible quantified metrics to bullets when none exist, mark them with "≈" prefix
- Every experience bullet must start with a strong past-tense action verb
- summary must mention years of experience and primary expertise domain
- Do not add text outside the JSON
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Gemini returned invalid JSON for resume rewrite')
  }
}

module.exports = { rewriteFullResume }
