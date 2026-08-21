
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  FolderKanban,
  Upload,
  Trash2,
  MessageSquare,
  CalendarDays,
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

      const response = await documentsApi.upload(projectId, file);

      if (response?.success) {
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

      await documentsApi.delete(documentId);

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

  const openUploadDialog = () => {
    setUploadError("");
    setUploadOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="size-5 animate-pulse" />
            </div>

            <p className="mt-4 text-sm font-medium">
              Loading project...
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Fetching project information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/app/projects">
          <Button variant="ghost" className="-ml-2 mb-6">
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8">
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <FolderKanban className="size-5" />
          </div>

          <h2 className="mt-4 font-semibold">
            Unable to load project
          </h2>

          <p className="mt-2 text-sm text-destructive">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/app/projects">
          <Button variant="ghost" className="-ml-2">
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>

          <h2 className="mt-4 font-semibold">
            Project not found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            The project you're looking for doesn't exist or you don't
            have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Back navigation */}
        <Link to="/app/projects">
          <Button
            variant="ghost"
            className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to Projects
          </Button>
        </Link>

        {/* Error */}
        {uploadError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="mt-0.5 size-2 shrink-0 rounded-full bg-destructive" />

            <p className="text-sm text-destructive">
              {uploadError}
            </p>
          </div>
        )}

        {/* Project Hero */}
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="relative border-b p-5 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
                  <FolderKanban className="size-6 sm:size-7" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                      {project.name}
                    </h1>

                    <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      Project
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {project.description ||
                      "No description provided for this project."}
                  </p>
                </div>
              </div>

              <Button
                onClick={openUploadDialog}
                disabled={uploading}
                className="w-full shrink-0 sm:w-auto"
              >
                <Upload className="size-4" />
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <ProjectStat
              icon={FileText}
              label="Documents"
              value={documents.length}
            />

            <ProjectStat
              icon={MessageSquare}
              label="AI Conversations"
              value="—"
            />

            <ProjectStat
              icon={CalendarDays}
              label="Last Updated"
              value={
                project.updated_at
                  ? new Date(project.updated_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "Not available"
              }
            />
          </div>
        </section>

        {/* Documents */}
        <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                  Project Documents
                </h2>

                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {documents.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Documents provide context for DevLens AI responses.
              </p>
            </div>

            {documents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={openUploadDialog}
                disabled={uploading}
              >
                <Upload className="size-4" />
                Add Document
              </Button>
            )}
          </div>

          {documentsLoading ? (
            <div className="grid gap-3 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted" />

                    <div className="flex-1">
                      <div className="h-4 w-1/3 rounded bg-muted" />
                      <div className="mt-2 h-3 w-1/4 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3 p-5 sm:p-6">
              {documents.map((document) => {
                const fileName =
                  document.file_name ||
                  document.filename ||
                  document.name ||
                  "Uploaded document";

                return (
                  <div
                    key={document.id}
                    className="group flex items-center gap-3 rounded-xl border bg-background p-4 transition-all duration-150 hover:border-primary/25 hover:bg-muted/20"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {fileName}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {document.file_type
                            ? document.file_type.toUpperCase()
                            : "DOCUMENT"}
                        </span>

                        <span>•</span>

                        <span className="text-primary/80">
                          Processed
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={
                        deletingDocumentId === document.id
                      }
                      onClick={() =>
                        handleDeleteDocument(document.id)
                      }
                      className="shrink-0 text-muted-foreground opacity-70 transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label={`Delete ${fileName}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <FileText className="size-6 text-muted-foreground" />
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  No documents yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload your project documentation, source files,
                  or other supported documents to give DevLens
                  the context it needs.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={openUploadDialog}
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

function ProjectStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-5 sm:p-6">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

export default ProjectDetails;

