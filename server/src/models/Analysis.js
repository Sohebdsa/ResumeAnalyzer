const mongoose = require('mongoose')

const suggestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['error', 'warning', 'success'], required: true },
  text: { type: String, required: true },
}, { _id: false })

const keywordsSchema = new mongoose.Schema({
  matched: [String],
  missing:  [String],
}, { _id: false })

const sectionsSchema = new mongoose.Schema({
  contact:        Boolean,
  summary:        Boolean,
  experience:     Boolean,
  education:      Boolean,
  skills:         Boolean,
  projects:       Boolean,
  certifications: Boolean,
}, { _id: false })

const improvementSchema = new mongoose.Schema({
  before: String,
  after:  String,
}, { _id: false })

const analysisSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },

  // Scores (0-100)
  overallScore:     { type: Number, default: 0 },
  atsScore:         { type: Number, default: 0 },
  keywordScore:     { type: Number, default: 0 },
  readabilityScore: { type: Number, default: 0 },

  // ATS pass/fail
  atsPass: { type: Boolean, default: false },

  // Breakdown
  sections:    { type: sectionsSchema,    default: {} },
  keywords:    { type: keywordsSchema,    default: { matched: [], missing: [] } },
  suggestions: { type: [suggestionSchema], default: [] },
  improvements:{ type: improvementSchema, default: { before: '', after: '' } },

  // Structured resume data extracted by Gemini
  extractedData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Full AI-rewritten resume (cached after first rewrite call)
  rewrittenData: { type: mongoose.Schema.Types.Mixed, default: {} },

}, { timestamps: true })

module.exports = mongoose.model('Analysis', analysisSchema)
