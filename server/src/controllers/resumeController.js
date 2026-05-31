const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const mongoose = require('mongoose')
const Resume = require('../models/Resume')
const Analysis = require('../models/Analysis')
const { extractResumeStructure, analyzeResume } = require('../services/geminiService')
const { rewriteFullResume } = require('../services/rewriteService')

// ─── Helper: Extract text from file ───────────────────────────────────────────
async function extractText(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    const buffer = fs.readFileSync(filePath)
    const data = await pdfParse(buffer)
    return data.text
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  }

  throw new Error('Unsupported file type')
}

// ─── POST /api/resumes/upload ──────────────────────────────────────────────────
async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const { jobTitle = '', jobDescription = '' } = req.body

  // Create resume document immediately so client can track status
  const resume = await Resume.create({
    originalName: req.file.originalname,
    fileName:     req.file.filename,
    fileSize:     req.file.size,
    mimeType:     req.file.mimetype,
    jobTitle,
    jobDescription,
    status: 'parsing',
  })

  // Run pipeline async (respond with ID immediately, process in background)
  res.status(202).json({
    success: true,
    resumeId: resume._id,
    message: 'Upload received. Analysis started.',
  })

  // Background pipeline
  runPipeline(resume, req.file.path, jobDescription).catch(async (err) => {
    console.error('Pipeline error:', err.message)
    await Resume.findByIdAndUpdate(resume._id, {
      status: 'error',
      errorMessage: err.message,
    })
  })
}

async function runPipeline(resume, filePath, jobDescription) {
  try {
    // Step 1: Extract raw text
    await Resume.findByIdAndUpdate(resume._id, { status: 'parsing' })
    const rawText = await extractText(filePath, resume.mimeType)

    await Resume.findByIdAndUpdate(resume._id, { rawText, status: 'analyzing' })

    // Step 2: Gemini Flash — structured extraction
    const extractedData = await extractResumeStructure(rawText)

    // Step 3: Gemini Pro — analysis + scoring
    const analysisData = await analyzeResume(rawText, extractedData, jobDescription)

    // Step 4: Save analysis to MongoDB
    await Analysis.create({
      resume: resume._id,
      overallScore:     Math.round(analysisData.overallScore  || 0),
      atsScore:         Math.round(analysisData.atsScore       || 0),
      keywordScore:     Math.round(analysisData.keywordScore   || 0),
      readabilityScore: Math.round(analysisData.readabilityScore || 0),
      atsPass:          analysisData.atsPass || false,
      sections:         extractedData.sectionsFound || {},
      keywords:         analysisData.keywords || { matched: [], missing: [] },
      suggestions:      analysisData.suggestions || [],
      improvements:     analysisData.improvements || { before: '', after: '' },
      extractedData,
    })

    // Step 5: Mark done
    await Resume.findByIdAndUpdate(resume._id, { status: 'done' })

    console.log(`✅ Pipeline complete for resume ${resume._id}`)
  } finally {
    // Always clean up uploaded file
    try {
      fs.unlinkSync(filePath)
    } catch (_) {}
  }
}

// ─── GET /api/resumes/:id/status ──────────────────────────────────────────────
async function getResumeStatus(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resume ID format' })
    }
    const resume = await Resume.findById(req.params.id).select('status errorMessage originalName')
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    res.json({ status: resume.status, errorMessage: resume.errorMessage, name: resume.originalName })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── GET /api/resumes ─────────────────────────────────────────────────────────
async function listResumes(req, res) {
  try {
    const resumes = await Resume.find({ status: 'done' }).sort({ createdAt: -1 }).limit(50)

    // Fetch scores for each resume
    const ids = resumes.map(r => r._id)
    const analyses = await Analysis.find({ resume: { $in: ids } }).select(
      'resume overallScore atsScore keywordScore atsPass keywords suggestions'
    )

    const analysisMap = {}
    analyses.forEach(a => { analysisMap[a.resume.toString()] = a })

    const list = resumes.map(r => {
      const a = analysisMap[r._id.toString()] || {}
      return {
        id:           r._id,
        name:         r.jobTitle || r.originalName,
        file:         r.originalName,
        uploadedAt:   r.createdAt,
        score:        a.overallScore || 0,
        atsPass:      a.atsPass || false,
        keywords:     a.keywordScore || 0,
        improvements: (a.suggestions || []).filter(s => s.type !== 'success').length,
      }
    })

    res.json({ resumes: list })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── GET /api/resumes/:id/report ──────────────────────────────────────────────
async function getReport(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resume ID format' })
    }
    const resume = await Resume.findById(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })

    if (resume.status !== 'done') {
      return res.status(202).json({ status: resume.status, error: 'Analysis not complete yet' })
    }

    const analysis = await Analysis.findOne({ resume: resume._id })
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' })

    res.json({
      id:               resume._id,
      name:             resume.jobTitle || resume.originalName,
      file:             resume.originalName,
      analyzedAt:       analysis.createdAt,
      overallScore:     analysis.overallScore,
      atsScore:         analysis.atsScore,
      keywordScore:     analysis.keywordScore,
      readabilityScore: analysis.readabilityScore,
      atsPass:          analysis.atsPass,
      sections:         analysis.sections,
      keywords:         analysis.keywords,
      suggestions:      analysis.suggestions,
      improvements:     analysis.improvements,
      extractedData:    analysis.extractedData,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── DELETE /api/resumes/:id ──────────────────────────────────────────────────
async function deleteResume(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resume ID format' })
    }
    const resume = await Resume.findByIdAndDelete(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    await Analysis.deleteOne({ resume: req.params.id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ─── POST /api/resumes/:id/rewrite ───────────────────────────────────────────
async function rewriteResume(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid resume ID format' })
    }

    const resume = await Resume.findById(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (resume.status !== 'done') {
      return res.status(202).json({ status: resume.status, error: 'Analysis not complete yet' })
    }

    const analysis = await Analysis.findOne({ resume: resume._id })
    if (!analysis) return res.status(404).json({ error: 'Analysis not found' })

    // Return cached rewrite if it exists
    if (analysis.rewrittenData && Object.keys(analysis.rewrittenData).length > 0) {
      return res.json({
        cached: true,
        contact: analysis.extractedData?.contact || {},
        rewrite: analysis.rewrittenData,
      })
    }

    // Call Gemini to rewrite the full resume
    const rewrite = await rewriteFullResume(
      analysis.extractedData,
      resume.rawText,
      resume.jobTitle,
      resume.jobDescription
    )

    // Cache the rewrite in the Analysis document
    analysis.rewrittenData = rewrite
    await analysis.save()

    res.json({
      cached: false,
      contact: analysis.extractedData?.contact || {},
      rewrite,
    })
  } catch (err) {
    console.error('Rewrite error:', err.message)
    res.status(500).json({ error: err.message })
  }
}

module.exports = { uploadResume, getResumeStatus, listResumes, getReport, deleteResume, rewriteResume }
