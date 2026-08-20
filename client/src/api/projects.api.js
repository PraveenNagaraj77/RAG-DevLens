import { api } from "./client"

export const projectsApi = {
  getAll() {
    return api.get("/api/projects")
  },

  getById(projectId) {
    return api.get(`/api/projects/${projectId}`)
  },

  create(project) {
    return api.post("/api/projects", project)
  },

  update(projectId, project) {
    return api.put(
      `/api/projects/${projectId}`,
      project
    )
  },

  delete(projectId) {
    return api.delete(
      `/api/projects/${projectId}`
    )
  },
}