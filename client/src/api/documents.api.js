import { api } from "./client"

export const documentsApi = {
  getByProjectId(projectId) {
    return api.get(
      `/api/documents/projects/${projectId}`
    )
  },

  upload(projectId, file) {
    const formData = new FormData()

    formData.append("file", file)

    return api.post(
      `/api/documents/projects/${projectId}/upload`,
      formData
    )
  },

  delete(documentId) {
    return api.delete(
      `/api/documents/${documentId}`
    )
  },
}