# Technology Stack (MERN Architecture)

## Frontend

### Core

* React.js
* Vite
* TypeScript
* TailwindCSS
* Shadcn/UI
* Framer Motion

### State Management

* Zustand

### Forms

* React Hook Form
* Zod Validation

### File Upload

* React Dropzone

### PDF Preview

* React PDF

### Resume Editor

* Monaco Editor (VS Code-like editing experience)

---

## Backend

### Core

* Node.js
* Express.js
* TypeScript

### Authentication

* JWT Authentication
* Refresh Token System

### Security

* Helmet
* CORS
* Rate Limiting
* Request Validation

### File Processing

* Multer

### PDF Parsing

* pdf-parse

### DOCX Parsing

* mammoth

---

## Database

### Primary Database

* MongoDB

### ODM

* Mongoose

Collections:

* Users
* Resumes
* AnalysisReports
* ResumeTemplates
* EvaluationRules
* JobDescriptions
* ActivityLogs

---

## AI Layer

### OCR & Document Understanding

* Gemini 2.5 Flash

Responsibilities:

* Resume OCR
* Layout Detection
* Section Extraction
* Multi-column Parsing
* Table Extraction

### Analysis & Resume Improvement

* Gemini 2.5 Pro

Responsibilities:

* Resume Scoring
* ATS Analysis
* Rewrite Suggestions
* Improvement Recommendations
* Job Match Analysis

Use structured output mode:

```ts
responseMimeType: "application/json"
```

All responses must conform to a strict JSON schema.

---

## Storage

### Development

* Local Storage

### Production

* AWS S3
  or
* Cloudinary

Store:

* Original Resume
* Processed Resume
* Generated PDF
* Exported DOCX

---

## Resume Generation

Resume templates should be React components.

Example:

```text
/templates
  /modern
  /ats
  /minimal
  /software-engineer
  /executive
```

Each template receives:

```ts
ResumeData
```

and renders dynamically.

Do NOT generate HTML using AI.

Use React components and structured JSON data.

---

## PDF Export

Libraries:

* React PDF
  or
* Puppeteer

Export:

* PDF
* DOCX
* JSON

---

## Application Architecture

Frontend (React)

↓ Upload Resume

Backend (Node/Express)

↓ Send File

Gemini OCR

↓ Structured Resume JSON

Gemini Analysis

↓ Analysis JSON

Frontend Diff Viewer

↓ User Accepts Changes

Resume Builder

↓ Generate Final Resume

PDF/DOCX Export

---

## Folder Structure

```text
resume-analyzer/

client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── templates/
│   ├── types/
│   └── utils/

server/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── prompts/
│   ├── validators/
│   ├── utils/
│   └── config/

shared/
├── schemas/
├── types/
└── constants/
```

---

## UI Design Requirements

The application must look like a premium SaaS product.

Inspiration:

* Linear
* Vercel
* Stripe
* Notion
* Clerk

Avoid:

* Generic AI gradients
* ChatGPT-style interfaces
* Random colorful dashboards
* Template-looking designs

Focus on:

* Clean typography
* Consistent spacing
* Subtle animations
* Professional cards
* Minimal color palette
* Excellent UX

The final product should feel like a startup-backed recruiting platform rather than an AI demo project.
