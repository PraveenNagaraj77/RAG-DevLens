import { api } from "./client"

export const documentsApi = {
  upload(projectId, file) {
    const formData = new FormData()

    formData.append("file", file)

    return api.post(
      `/api/documents/projects/${projectId}/upload`,
      formData
    )
  },
}