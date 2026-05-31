const mongoose = require('mongoose')

const resumeSchema = new mongoose.Schema({
  // Original file info
  originalName: { type: String, required: true },
  fileName:     { type: String, required: true },   // stored filename on disk
  fileSize:     { type: Number, required: true },
  mimeType:     { type: String, required: true },

  // Job target (optional)
  jobTitle:       { type: String, default: '' },
  jobDescription: { type: String, default: '' },

  // Extracted text (raw from OCR)
  rawText: { type: String, default: '' },

  // Status of pipeline
  status: {
    type: String,
    enum: ['uploading', 'parsing', 'analyzing', 'done', 'error'],
    default: 'uploading',
  },
  errorMessage: { type: String, default: '' },

}, { timestamps: true })

module.exports = mongoose.model('Resume', resumeSchema)
