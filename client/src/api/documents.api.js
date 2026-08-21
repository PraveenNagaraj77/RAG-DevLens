import { api } from "./client";

export const documentsApi = {
  getByProjectId(projectId) {
    return api.get(
      `/api/documents/projects/${projectId}`,
    );
  },

  upload(projectId, files) {
    const formData =
      new FormData();

    files.forEach((file) => {
      formData.append(
        "files",
        file,
        file.name,
      );
    });

    return api.post(
      `/api/documents/projects/${projectId}/upload`,
      formData,
    );
  },

  delete(documentId) {
    return api.delete(
      `/api/documents/${documentId}`,
    );
  },

  deleteUpload(uploadId) {
    return api.delete(
      `/api/documents/upload/${uploadId}`,
    );
  },
};