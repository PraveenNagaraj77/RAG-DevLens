import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  FolderKanban,
  Upload,
  Trash2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Files,
  Archive,
  Folder,
  LoaderCircle,
  CircleCheck,
  CircleX,
  Clock3,
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

  const [deletingUploadId, setDeletingUploadId] = useState(null);
  const [expandedUploads, setExpandedUploads] = useState({});

  // ==================================================
  // FETCH PROJECT
  // ==================================================

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

  // ==================================================
  // FETCH DOCUMENTS
  // ==================================================

  const fetchDocuments = async (showLoader = true) => {
    try {
      if (showLoader) {
        setDocumentsLoading(true);
      }

      const response =
        await documentsApi.getByProjectId(projectId);

      setDocuments(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );

      setUploadError("");
    } catch (error) {
      console.error(
        "Failed to fetch documents:",
        error,
      );

      setUploadError(
        error.message ||
          "Unable to load documents",
      );
    } finally {
      if (showLoader) {
        setDocumentsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!projectId) {
      return;
    }

    fetchDocuments(true);
  }, [projectId]);

  // ==================================================
  // POLL INGESTION STATUS
  // ==================================================

  useEffect(() => {
    if (!projectId || documents.length === 0) {
      return;
    }

    const hasProcessingDocuments = documents.some(
      (document) =>
        document.ingestion_status === "pending" ||
        document.ingestion_status === "processing",
    );

    if (!hasProcessingDocuments) {
      return;
    }

    const interval = setInterval(() => {
      fetchDocuments(false);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [projectId, documents]);

  // ==================================================
  // GROUP DOCUMENTS BY UPLOAD
  // ==================================================
const uploads = useMemo(() => {
  const groups = new Map();

  documents.forEach((document) => {
    const uploadId =
      document.upload_id ||
      document.upload_group_id ||
      document.id;

    if (!groups.has(uploadId)) {
      groups.set(uploadId, {
        upload_id: uploadId,

        upload_type:
          document.upload_type ||
          "file",

        upload_name:
          document.upload_name ||
          document.file_name ||
          "Uploaded files",

        created_at:
          document.created_at,

        documents: [],
      });
    }

    groups
      .get(uploadId)
      .documents.push(document);
  });

  return Array.from(
    groups.values(),
  );
}, [documents]);
  // ==================================================
  // TOGGLE UPLOAD
  // ==================================================

  const toggleUpload = (uploadId) => {
    setExpandedUploads((current) => ({
      ...current,
      [uploadId]: !current[uploadId],
    }));
  };

  // ==================================================
  // UPLOAD
  // ==================================================

  const handleUploadDocument = async (files) => {
    try {
      setUploading(true);
      setUploadError("");

      const response =
        await documentsApi.upload(
          projectId,
          files,
        );

      if (response?.success) {
        const uploadedDocuments =
          Array.isArray(response.data)
            ? response.data
            : [];

        setDocuments((current) => [
          ...current,
          ...uploadedDocuments,
        ]);

        setUploadOpen(false);

        /*
         * Automatically expand the newly uploaded
         * upload group.
         */
        if (response.upload_id) {
          setExpandedUploads((current) => ({
            ...current,
            [response.upload_id]: true,
          }));
        }
      }
    } catch (error) {
      console.error(
        "Failed to upload documents:",
        error,
      );

      setUploadError(
        error.message ||
          "Unable to upload documents",
      );
    } finally {
      setUploading(false);
    }
  };

  // ==================================================
  // DELETE ENTIRE UPLOAD
  // ==================================================

  const handleDeleteUpload = async (upload) => {
    const uploadType =
      upload.upload_type || "file";

    let message =
      "Are you sure you want to delete this upload?";

    if (uploadType === "folder") {
      message =
        `Are you sure you want to delete the entire folder "${upload.upload_name}"?`;
    }

    if (uploadType === "zip") {
      message =
        `Are you sure you want to delete the entire ZIP "${upload.upload_name}"?`;
    }

    if (!window.confirm(message)) {
      return;
    }

    try {
      setDeletingUploadId(
        upload.upload_id,
      );

      setUploadError("");

      await documentsApi.deleteUpload(
        upload.upload_id,
      );

      setDocuments((current) =>
        current.filter(
          (document) =>
            document.upload_id !==
            upload.upload_id,
        ),
      );

      setExpandedUploads((current) => {
        const next = { ...current };

        delete next[upload.upload_id];

        return next;
      });
    } catch (error) {
      console.error(
        "Failed to delete upload:",
        error,
      );

      setUploadError(
        error.message ||
          "Unable to delete upload",
      );
    } finally {
      setDeletingUploadId(null);
    }
  };

  // ==================================================
  // OPEN UPLOAD DIALOG
  // ==================================================

  const openUploadDialog = () => {
    setUploadError("");
    setUploadOpen(true);
  };

  // ==================================================
  // LOADING
  // ==================================================

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

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/app/projects">
          <Button
            variant="ghost"
            className="-ml-2 mb-6"
          >
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

  // ==================================================
  // PROJECT NOT FOUND
  // ==================================================

  if (!project) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link to="/app/projects">
          <Button
            variant="ghost"
            className="-ml-2"
          >
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
            The project you're looking for doesn't
            exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

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

        {/* ==================================================
            PROJECT HERO
        ================================================== */}

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

                {uploading
                  ? "Uploading..."
                  : "Upload Document"}
              </Button>

            </div>
          </div>

          {/* Stats */}

          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            <ProjectStat
              icon={Files}
              label="Uploads"
              value={uploads.length}
            />

            <ProjectStat
              icon={FileText}
              label="Documents"
              value={documents.length}
            />

            <ProjectStat
              icon={CalendarDays}
              label="Last Updated"
              value={
                project.updated_at
                  ? new Date(
                      project.updated_at,
                    ).toLocaleDateString(
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

        {/* ==================================================
            DOCUMENTS
        ================================================== */}

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

          {/* Loading */}

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

          ) : uploads.length > 0 ? (

            <div className="space-y-3 p-5 sm:p-6">

              {uploads.map((upload) => {
                const expanded =
                  !!expandedUploads[
                    upload.upload_id
                  ];

                const deleting =
                  deletingUploadId ===
                  upload.upload_id;

                const uploadType =
                  upload.upload_type || "file";

                const documentCount =
                  upload.documents.length;

                const isFolder =
                  uploadType === "folder";

                const isZip =
                  uploadType === "zip";

                const uploadStatus =
                  getUploadStatus(
                    upload.documents,
                  );

                return (
                  <div
                    key={upload.upload_id}
                    className="overflow-hidden rounded-xl border bg-background"
                  >

                    {/* Upload Header */}

                    <div className="group flex items-center gap-3 p-4 transition-colors hover:bg-muted/20">

                      <button
                        type="button"
                        onClick={() =>
                          toggleUpload(
                            upload.upload_id,
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >

                        {/* Icon */}

                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {isFolder ? (
                            <Folder className="size-5" />
                          ) : isZip ? (
                            <Archive className="size-5" />
                          ) : (
                            <FileText className="size-5" />
                          )}
                        </div>

                        {/* Name */}

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium">
                            {upload.upload_name}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">

                            <span>
                              {isFolder
                                ? "FOLDER"
                                : isZip
                                  ? "ZIP"
                                  : "FILE"}
                            </span>

                            <span>•</span>

                            <span>
                              {documentCount}{" "}
                              {documentCount === 1
                                ? "file"
                                : "files"}
                            </span>

                            <span>•</span>

                            <UploadStatus
                              status={
                                uploadStatus
                              }
                            />

                          </div>
                        </div>

                        {expanded ? (
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        )}

                      </button>

                      {/* Delete */}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={deleting}
                        onClick={() =>
                          handleDeleteUpload(
                            upload,
                          )
                        }
                        className="shrink-0 text-muted-foreground opacity-70 transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`Delete ${upload.upload_name}`}
                      >
                        {deleting ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>

                    </div>

                    {/* Files */}

                    {expanded && (
                      <div className="border-t bg-muted/10 px-4 py-3">

                        <div className="space-y-2">

                          {upload.documents.map(
                            (document) => {
                              const fileName =
                                document.file_name ||
                                document.filename ||
                                document.name ||
                                "Uploaded document";

                              return (
                                <div
                                  key={
                                    document.id
                                  }
                                  className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5"
                                >

                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <FileText className="size-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <p className="truncate text-sm">
                                      {fileName}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                      {document.file_type
                                        ? document.file_type.toUpperCase()
                                        : "DOCUMENT"}
                                    </p>

                                    {document.ingestion_status ===
                                      "failed" &&
                                      document.ingestion_error && (
                                        <p className="mt-1 truncate text-[11px] text-destructive">
                                          {
                                            document.ingestion_error
                                          }
                                        </p>
                                      )}

                                  </div>

                                  <DocumentStatus
                                    status={
                                      document.ingestion_status
                                    }
                                  />

                                </div>
                              );
                            },
                          )}

                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          ) : (

            /* Empty */

            <div className="flex min-h-80 items-center justify-center p-6">

              <div className="max-w-md text-center">

                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <FileText className="size-6 text-muted-foreground" />
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  No documents yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload your project documentation,
                  source files, or other supported
                  documents to give DevLens the context
                  it needs.
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
        onClose={() =>
          setUploadOpen(false)
        }
        onUpload={handleUploadDocument}
      />
    </>
  );
}

// ==================================================
// UPLOAD STATUS
// ==================================================

function UploadStatus({ status }) {
  if (status === "completed") {
    return (
      <span className="flex items-center gap-1 text-primary/80">
        <CircleCheck className="size-3" />
        Processed
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="flex items-center gap-1 text-muted-foreground">
        <LoaderCircle className="size-3 animate-spin" />
        Processing
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-destructive">
        <CircleX className="size-3" />
        Failed
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-muted-foreground">
      <Clock3 className="size-3" />
      Pending
    </span>
  );
}

// ==================================================
// DOCUMENT STATUS
// ==================================================

function DocumentStatus({ status }) {
  if (status === "completed") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[11px] text-primary/80">
        <CircleCheck className="size-3" />
        Processed
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
        <LoaderCircle className="size-3 animate-spin" />
        Processing
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="flex shrink-0 items-center gap-1 text-[11px] text-destructive">
        <CircleX className="size-3" />
        Failed
      </span>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
      <Clock3 className="size-3" />
      Pending
    </span>
  );
}

// ==================================================
// GET GROUP STATUS
// ==================================================

function getUploadStatus(documents) {
  if (!documents.length) {
    return "pending";
  }

  const statuses = documents.map(
    (document) =>
      document.ingestion_status || "pending",
  );

  if (statuses.includes("failed")) {
    return "failed";
  }

  if (
    statuses.includes("processing") ||
    statuses.includes("pending")
  ) {
    return "processing";
  }

  return "completed";
}

// ==================================================
// PROJECT STAT
// ==================================================

function ProjectStat({
  icon: Icon,
  label,
  value,
}) {
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