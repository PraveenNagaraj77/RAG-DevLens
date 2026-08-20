import { useEffect, useState } from "react"
import { Pencil, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"

function CreateProjectDialog({
  open,
  onClose,
  onCreate,
  project = null,
}) {
  const isEditMode = Boolean(project)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (open) {
      setName(project?.name || "")
      setDescription(project?.description || "")
    }
  }, [open, project])

  if (!open) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!name.trim()) {
      return
    }

    const projectData = {
      name: name.trim(),
      description: description.trim(),
    }

    onCreate(projectData)

    if (!isEditMode) {
      setName("")
      setDescription("")
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
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
        aria-labelledby="project-dialog-title"
        className="relative z-10 w-full max-w-lg rounded-xl border bg-card shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b p-5 sm:p-6">
          <div>
            <h2
              id="project-dialog-title"
              className="font-semibold"
            >
              {isEditMode
                ? "Edit Project"
                : "Create New Project"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {isEditMode
                ? "Update your project details."
                : "Add a project to start analyzing your codebase."}
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
          <div className="space-y-5 p-5 sm:p-6">
            {/* Project Name */}
            <div className="space-y-2">
              <label
                htmlFor="project-name"
                className="text-sm font-medium"
              >
                Project Name
              </label>

              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="My React App"
                autoFocus
                className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="project-description"
                className="text-sm font-medium"
              >
                Description
                <span className="ml-1 text-muted-foreground">
                  (Optional)
                </span>
              </label>

              <textarea
                id="project-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe your project..."
                rows={4}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
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
              disabled={!name.trim()}
              className="w-full sm:w-auto"
            >
              {isEditMode ? (
                <>
                  <Pencil className="size-4" />
                  Update Project
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectDialog