const API_BASE = 'http://localhost:5000/api'

export const api = {
  // Upload a resume file for analysis
  async uploadResume(file, jobTitle = '', jobDescription = '') {
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('jobTitle', jobTitle)
    formData.append('jobDescription', jobDescription)

    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Upload failed')
    }
    return res.json() // { success, resumeId, message }
  },

  // Poll status until done
  async pollStatus(resumeId) {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/status`)
    if (!res.ok) throw new Error('Failed to check status')
    return res.json() // { status, errorMessage, name }
  },

  // List all analyzed resumes
  async listResumes() {
    const res = await fetch(`${API_BASE}/resumes`)
    if (!res.ok) throw new Error('Failed to fetch resumes')
    return res.json() // { resumes: [...] }
  },

  // Get full report for a resume
  async getReport(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}/report`)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to fetch report')
    }
    return res.json()
  },

  // Trigger full AI rewrite (returns contact + rewrite object)
  async rewriteResume(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}/rewrite`, { method: 'POST' })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to rewrite resume')
    }
    return res.json() // { cached, contact, rewrite }
  },

  // Delete a resume
  async deleteResume(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete resume')
    return res.json()
  },
}

