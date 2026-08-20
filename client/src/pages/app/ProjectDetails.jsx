import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  FolderKanban,
  Upload,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { projectsApi } from "@/api/projects.api";
import { documentsApi } from "@/api/documents.api";
import UploadDocumentDialog from "@/components/documents/UploadDocumentDialog";

function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await projectsApi.getById(projectId);

        console.log("Project details:", response);

        setProject(response?.data || null);
      } catch (error) {
        console.error("Failed to fetch project:", error);

        setError(error.message || "Unable to load project");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setDocumentsLoading(true);

        const response = await documentsApi.getByProjectId(projectId);

        console.log("Project documents:", response);

        setDocuments(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch documents:", error);

        setUploadError(error.message || "Unable to load documents");
      } finally {
        setDocumentsLoading(false);
      }
    };

    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const handleUploadDocument = async (file) => {
    try {
      setUploading(true);
      setUploadError("");

      console.log("Uploading document:", file.name);

      const response = await documentsApi.upload(projectId, file);

      console.log("Document upload response:", response);

      if (response?.success) {
        /*
         * Add the newly uploaded document
         * to the existing document list.
         */
        if (response?.data) {
          setDocuments((current) => [...current, response.data]);
        }

        setUploadOpen(false);
      }
    } catch (error) {
      console.error("Failed to upload document:", error);

      setUploadError(error.message || "Unable to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingDocumentId(documentId);
      setUploadError("");

      console.log("Deleting document:", documentId);

      const response = await documentsApi.delete(documentId);

      console.log("Document delete response:", response);

      // Remove document from UI
      setDocuments((current) =>
        current.filter((document) => document.id !== documentId),
      );
    } catch (error) {
      console.error("Failed to delete document:", error);

      setUploadError(error.message || "Unable to delete document");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex min-h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/app/projects">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/app/projects">
          <Button variant="ghost">
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="mt-6 rounded-xl border bg-card p-8 text-center">
          <FolderKanban className="mx-auto size-8 text-muted-foreground" />

          <h2 className="mt-4 font-semibold">Project not found</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Back */}
        <Link to="/app/projects">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>

        {/* Upload Error */}
        {uploadError && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}

        {/* Project Header */}
        <section className="rounded-xl border bg-card">
          <div className="flex flex-col gap-5 border-b p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="size-6" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold tracking-tight">
                  {project.name}
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description || "No description provided."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setUploadError("");
                setUploadOpen(true);
              }}
              disabled={uploading}
              className="w-full shrink-0 sm:w-auto"
            >
              <Upload className="size-4" />

              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>

          {/* Project Information */}
          <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-3">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Project
              </p>

              <p className="mt-2 truncate text-sm font-medium">
                {project.name}
              </p>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Documents
              </p>

              <p className="mt-2 text-2xl font-semibold">{documents.length}</p>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last Updated
              </p>

              <p className="mt-2 text-sm font-medium">
                {project.updated_at
                  ? new Date(project.updated_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="mt-6 overflow-hidden rounded-xl border bg-card">
          <div className="border-b p-5 sm:p-6">
            <h2 className="font-semibold">Documents</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Upload documents to give DevLens context about your project.
            </p>
          </div>

          {documentsLoading ? (
            <div className="flex min-h-64 items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">
                Loading documents...
              </p>
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3 p-5 sm:p-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 rounded-xl border bg-background p-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {document.file_name ||
                        document.filename ||
                        document.name ||
                        "Uploaded document"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {document.file_type
                        ? document.file_type.toUpperCase()
                        : "Document"}{" "}
                      · Processed successfully
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={deletingDocumentId === document.id}
                    onClick={() => handleDeleteDocument(document.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${document.file_name || "document"}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 items-center justify-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                  <FileText className="size-5 text-muted-foreground" />
                </div>

                <h3 className="mt-4 text-sm font-medium">No documents yet</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload your project documentation, source files, or other
                  supported documents.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setUploadError("");
                    setUploadOpen(true);
                  }}
                >
                  <Upload className="size-4" />
                  Upload Document
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <UploadDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUploadDocument}
      />
    </>
  );
}

export default ProjectDetails;
