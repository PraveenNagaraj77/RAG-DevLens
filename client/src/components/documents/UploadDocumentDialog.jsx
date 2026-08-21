import { useRef, useState } from "react";
import {
  FileArchive,
  FileText,
  FolderOpen,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 200;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".java",
  ".sql",
  ".zip",
];

const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
];

function UploadDocumentDialog({
  open,
  onClose,
  onUpload,
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --------------------------------------------------
  // IMPORTANT:
  // Do not render the dialog unless open === true
  // --------------------------------------------------

  if (!open) {
    return null;
  }

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getExtension = (fileName) => {
    const lastDot = fileName.lastIndexOf(".");

    if (lastDot === -1) {
      return "";
    }

    return fileName.substring(lastDot).toLowerCase();
  };

  const getRelativePath = (file) => {
    return file.webkitRelativePath || file.name;
  };

  const isIgnoredPath = (file) => {
    const relativePath = getRelativePath(file);

    const parts = relativePath
      .replace(/\\/g, "/")
      .split("/");

    return parts.some((part) =>
      IGNORED_DIRECTORIES.includes(part),
    );
  };

  const validateFiles = (selectedFiles) => {
    const fileList = Array.from(selectedFiles || []);

    if (fileList.length === 0) {
      return {
        files: [],
        error: "",
      };
    }

    // ------------------------------------------------
    // Remove ignored directories
    // ------------------------------------------------

    const filteredFiles = fileList.filter(
      (file) => !isIgnoredPath(file),
    );

    if (filteredFiles.length === 0) {
      return {
        files: [],
        error:
          "No supported files were found in the selected folder.",
      };
    }

    // ------------------------------------------------
    // Maximum file count
    // ------------------------------------------------

    if (filteredFiles.length > MAX_FILES) {
      return {
        files: [],
        error: `This selection contains ${filteredFiles.length} files. Maximum allowed is ${MAX_FILES}.`,
      };
    }

    // ------------------------------------------------
    // Validate individual files
    // ------------------------------------------------

    const validFiles = [];

    for (const file of filteredFiles) {
      const extension = getExtension(file.name);

      // Ignore unsupported files
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        continue;
      }

      // Maximum file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          files: [],
          error: `${file.name} is larger than 5 MB.`,
        };
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return {
        files: [],
        error:
          "No supported files were found in the selection.",
      };
    }

    return {
      files: validFiles,
      error: "",
    };
  };

  // --------------------------------------------------
  // Selection
  // --------------------------------------------------

  const handleFilesSelected = (
    selectedFiles,
    selectedMode,
  ) => {
    const result = validateFiles(selectedFiles);

    setError(result.error);
    setMode(selectedMode);

    if (result.files.length > 0) {
      setFiles(result.files);
    } else {
      setFiles([]);
    }
  };

  // --------------------------------------------------
  // Individual Files
  // --------------------------------------------------

  const handleFileChange = (event) => {
    handleFilesSelected(
      event.target.files,
      "files",
    );

    event.target.value = "";
  };

  // --------------------------------------------------
  // Folder
  // --------------------------------------------------

  const handleFolderChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    console.log(
      "Folder selected:",
      selectedFiles.length,
    );

    console.log(
      "Folder files:",
      selectedFiles,
    );

    // Debug relative paths
    console.log(
      "Folder paths:",
      selectedFiles.map(
        (file) => file.webkitRelativePath,
      ),
    );

    if (selectedFiles.length === 0) {
      setError(
        "No files were found in the selected folder.",
      );

      return;
    }

    handleFilesSelected(
      selectedFiles,
      "folder",
    );

    event.target.value = "";
  };

  // --------------------------------------------------
  // ZIP
  // --------------------------------------------------

  const handleZipChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    handleFilesSelected(
      [selectedFile],
      "zip",
    );

    event.target.value = "";
  };

  // --------------------------------------------------
  // Drag & Drop
  // --------------------------------------------------

  const handleDrop = (event) => {
    event.preventDefault();

    handleFilesSelected(
      event.dataTransfer.files,
      "files",
    );
  };

  // --------------------------------------------------
  // Upload
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (files.length === 0) {
      setError("Please select files first.");

      return;
    }

    try {
      setUploading(true);
      setError("");

      await onUpload(files);

      handleReset();
      onClose();
    } catch (error) {
      console.error(
        "Upload failed:",
        error,
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload files.",
      );
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // Reset
  // --------------------------------------------------

  const handleReset = () => {
    setFiles([]);
    setError("");
    setMode(null);
  };

  const handleClose = () => {
    if (uploading) {
      return;
    }

    handleReset();
    onClose();
  };

  // --------------------------------------------------
  // Labels
  // --------------------------------------------------

  const getModeTitle = () => {
    if (mode === "zip") {
      return "ZIP archive selected";
    }

    if (mode === "folder") {
      return "Folder selected";
    }

    return "Files selected";
  };

  const getModeDescription = () => {
    if (mode === "zip") {
      return "The ZIP will be extracted and supported files will be indexed.";
    }

    if (mode === "folder") {
      return "Supported files from the selected folder will be indexed.";
    }

    return "The selected files will be indexed as project documents.";
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}

      <button
        type="button"
        aria-label="Close dialog"
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
      />

      {/* Dialog */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-document-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-xl"
      >
        {/* Header */}

        <div className="flex items-start justify-between border-b p-5 sm:p-6">
          <div>
            <h2
              id="upload-document-title"
              className="font-semibold"
            >
              Add to Project
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Upload source code, documentation,
              a folder, or a ZIP archive.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ------------------------------------------ */}
        {/* File Input */}
        {/* ------------------------------------------ */}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_EXTENSIONS.filter(
            (extension) =>
              extension !== ".zip",
          ).join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* ------------------------------------------ */}
        {/* Folder Input */}
        {/* ------------------------------------------ */}

        <input
          ref={(element) => {
            folderInputRef.current = element;

            if (element) {
              element.webkitdirectory = true;
              element.multiple = true;
            }
          }}
          type="file"
          onChange={handleFolderChange}
          className="hidden"
        />

        {/* ------------------------------------------ */}
        {/* ZIP Input */}
        {/* ------------------------------------------ */}

        <input
          ref={zipInputRef}
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          onChange={handleZipChange}
          className="hidden"
        />

        {/* Content */}

        <div className="p-5 sm:p-6">
          {files.length === 0 ? (
            <>
              {/* Upload Options */}

              <div className="grid gap-3 sm:grid-cols-3">
                {/* Files */}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploading}
                  className="group flex flex-col items-center rounded-xl border bg-background p-4 text-center transition-all hover:border-primary/40 hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <FileText className="size-5" />
                  </div>

                  <p className="mt-3 text-sm font-medium">
                    Files
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Select one or more files
                  </p>
                </button>

                {/* Folder */}

                <button
                  type="button"
                  onClick={() =>
                    folderInputRef.current?.click()
                  }
                  disabled={uploading}
                  className="group flex flex-col items-center rounded-xl border bg-background p-4 text-center transition-all hover:border-primary/40 hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <FolderOpen className="size-5" />
                  </div>

                  <p className="mt-3 text-sm font-medium">
                    Folder
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Upload an entire folder
                  </p>
                </button>

                {/* ZIP */}

                <button
                  type="button"
                  onClick={() =>
                    zipInputRef.current?.click()
                  }
                  disabled={uploading}
                  className="group flex flex-col items-center rounded-xl border bg-background p-4 text-center transition-all hover:border-primary/40 hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <FileArchive className="size-5" />
                  </div>

                  <p className="mt-3 text-sm font-medium">
                    ZIP
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Upload a project archive
                  </p>
                </button>
              </div>

              {/* Drop Zone */}

              <div
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={handleDrop}
                className="mt-4 flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-background shadow-sm">
                  <Upload className="size-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  Or drag files here
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Up to {MAX_FILES} files · 5 MB
                  per file
                </p>
              </div>

              {/* Formats */}

              <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
                Supported: PDF, TXT, MD, JS, JSX,
                TS, TSX, JSON, HTML, CSS, Java,
                SQL, ZIP
              </p>
            </>
          ) : (
            <div>
              {/* Selected Header */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {getModeTitle()}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {getModeDescription()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={uploading}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Clear selection"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* File Count */}

              <div className="mt-4 rounded-lg border bg-muted/30 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Files to index
                  </span>

                  <span className="text-sm font-semibold">
                    {files.length}
                  </span>
                </div>
              </div>

              {/* File List */}

              <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
                {files.map((file, index) => {
                  const displayPath =
                    getRelativePath(file);

                  return (
                    <div
                      key={`${displayPath}-${index}`}
                      className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"
                    >
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />

                      <span
                        className="min-w-0 flex-1 truncate text-xs"
                        title={displayPath}
                      >
                        {displayPath}
                      </span>

                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}

          {error && (
            <p className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}

        <div className="flex flex-col-reverse gap-2 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              files.length === 0 ||
              uploading
            }
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Upload className="size-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Upload{" "}
                {files.length > 0
                  ? `${files.length} ${
                      files.length === 1
                        ? "File"
                        : "Files"
                    }`
                  : "Files"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UploadDocumentDialog;