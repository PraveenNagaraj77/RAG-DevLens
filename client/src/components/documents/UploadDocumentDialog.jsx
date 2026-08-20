import { useRef, useState } from "react"
import {
  FileText,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".docx",
]

function UploadDocumentDialog({ open, onClose, onUpload }) {
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [error, setError] = useState("")

  if (!open) {
    return null
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setError("")

    const extension = `.${selectedFile.name
      .split(".")
      .pop()
      .toLowerCase()}`

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(
        "Unsupported file type. Please select a PDF, TXT, MD, or DOCX file."
      )
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10 MB.")
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = (event) => {
    event.preventDefault()

    const droppedFile = event.dataTransfer.files?.[0]

    if (!droppedFile) {
      return
    }

    setError("")

    const extension = `.${droppedFile.name
      .split(".")
      .pop()
      .toLowerCase()}`

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(
        "Unsupported file type. Please select a PDF, TXT, MD, or DOCX file."
      )
      return
    }

    if (droppedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10 MB.")
      return
    }

    setFile(droppedFile)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!file) {
      setError("Please select a document first.")
      return
    }

    onUpload(file)

    setFile(null)
    setError("")
    onClose()
  }

  const handleClose = () => {
    setFile(null)
    setError("")
    onClose()
  }

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
        className="relative z-10 w-full max-w-lg rounded-xl border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b p-5 sm:p-6">
          <div>
            <h2
              id="upload-document-title"
              className="font-semibold"
            >
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a document to this project for AI-powered analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 sm:p-6">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.md,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {!file ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className="flex min-h-52 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-background shadow-sm">
                  <Upload className="size-5 text-muted-foreground" />
                </div>

                <p className="mt-4 text-sm font-medium">
                  Drop your file here
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse
                </p>

                <p className="mt-4 text-xs text-muted-foreground">
                  PDF, TXT, MD, DOCX · Maximum 10 MB
                </p>
              </button>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label="Remove selected file"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            )}

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
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!file}
              className="w-full sm:w-auto"
            >
              <Upload className="size-4" />
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadDocumentDialog