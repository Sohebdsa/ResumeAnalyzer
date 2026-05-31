const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const {
  uploadResume,
  getResumeStatus,
  listResumes,
  getReport,
  deleteResume,
  rewriteResume,
} = require('../controllers/resumeController')

router.post('/upload',         upload.single('resume'), uploadResume)
router.get('/',                listResumes)
router.get('/:id/status',      getResumeStatus)
router.get('/:id/report',      getReport)
router.post('/:id/rewrite',    rewriteResume)
router.delete('/:id',          deleteResume)

module.exports = router

