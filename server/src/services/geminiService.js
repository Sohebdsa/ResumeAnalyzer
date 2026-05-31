const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ─── OCR + Extraction (Gemini 2.5 Flash) ──────────────────────────────────────
async function extractResumeStructure(rawText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const prompt = `
You are a precise resume parser. Given the raw text of a resume, extract all structured information.

Return a JSON object that matches this exact schema:
{
  "contact": {
    "name": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string,
    "website": string
  },
  "summary": string,
  "experience": [
    {
      "title": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "bullets": [string]
    }
  ],
  "education": [
    {
      "degree": string,
      "institution": string,
      "location": string,
      "graduationDate": string,
      "gpa": string
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
      "name": string,
      "description": string,
      "technologies": [string],
      "url": string
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "date": string
    }
  ],
  "sectionsFound": {
    "contact": boolean,
    "summary": boolean,
    "experience": boolean,
    "education": boolean,
    "skills": boolean,
    "projects": boolean,
    "certifications": boolean
  }
}

Rules:
- Return empty strings "" for missing text fields
- Return empty arrays [] for missing list fields
- Return false for missing booleans
- Do not add any text outside the JSON

Resume text:
---
${rawText}
---
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    return JSON.parse(text)
  } catch {
    // Try to extract JSON from response if wrapped
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Gemini Flash returned invalid JSON')
  }
}

// ─── Analysis (Gemini 2.5 Flash) ───────────────────────────────────────────────
async function analyzeResume(rawText, extractedData, jobDescription = '') {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyst and career coach.

Analyze the provided resume and return a detailed analysis as a JSON object.

${jobDescription ? `Job Description:\n---\n${jobDescription}\n---\n` : ''}

Return this exact JSON schema:
{
  "overallScore": number (0-100),
  "atsScore": number (0-100, how well it will pass ATS systems),
  "keywordScore": number (0-100, how well keywords match the job description or general industry),
  "readabilityScore": number (0-100, clarity, formatting, conciseness),
  "atsPass": boolean (true if atsScore >= 70),
  "keywords": {
    "matched": [string] (keywords found in resume that are relevant),
    "missing": [string] (important keywords for this role that are missing)
  },
  "suggestions": [
    {
      "type": "error" | "warning" | "success",
      "text": string (specific, actionable suggestion)
    }
  ],
  "improvements": {
    "before": string (an example weak sentence from the resume),
    "after": string (your improved rewrite of that sentence with metrics and action verbs)
  }
}

Rules:
- suggestions array must have 5-10 items mixing errors, warnings, and successes
- errors = critical missing items (no projects, no metrics, gaps in experience)
- warnings = things that weaken the resume (vague language, missing keywords, etc.)
- successes = things done well (strong action verbs, clear structure, etc.)
- improvements.before must be a real quote from the resume
- improvements.after must be a specific rewrite with quantified metrics
- overallScore = weighted average: atsScore*0.4 + keywordScore*0.35 + readabilityScore*0.25
- Do not add any text outside the JSON

Resume text:
---
${rawText}
---

Extracted resume data:
${JSON.stringify(extractedData, null, 2)}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Gemini Pro returned invalid JSON')
  }
}

module.exports = { extractResumeStructure, analyzeResume }
