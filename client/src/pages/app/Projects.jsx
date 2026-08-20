import { useEffect, useState } from "react"
import {
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import CreateProjectDialog from "@/components/projects/CreateProjectDialog"
import { projectsApi } from "@/api/projects.api"

function Projects() {
  const [projects, setProjects] = useState([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [error, setError] = useState("")

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await projectsApi.getAll()

      console.log("Projects response:", response)

      setProjects(response?.data || [])
    } catch (error) {
      console.error("Failed to fetch projects:", error)

      setError(
        error.message || "Unable to load projects"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // Open create dialog
  const handleOpenCreate = () => {
    setEditingProject(null)
    setDialogOpen(true)
  }

  // Open edit dialog
  const handleOpenEdit = (event, project) => {
    event.preventDefault()
    event.stopPropagation()

    setEditingProject(project)
    setDialogOpen(true)
  }

  // Create / Update
  const handleSaveProject = async (projectData) => {
    try {
      setSaving(true)
      setError("")

      if (editingProject) {
        await projectsApi.update(
          editingProject.id,
          projectData
        )
      } else {
        await projectsApi.create(projectData)
      }

      setDialogOpen(false)
      setEditingProject(null)

      await fetchProjects()
    } catch (error) {
      console.error(
        "Failed to save project:",
        error
      )

      setError(
        error.message || "Unable to save project"
      )
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDelete = async (event, project) => {
    event.preventDefault()
    event.stopPropagation()

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(project.id)
      setError("")

      await projectsApi.delete(project.id)

      await fetchProjects()
    } catch (error) {
      console.error(
        "Failed to delete project:",
        error
      )

      setError(
        error.message || "Unable to delete project"
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Projects
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your codebases and projects with DevLens.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="w-full shrink-0 sm:w-auto"
          >
            <Plus className="size-4" />
            New Project
          </Button>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Projects */}
        <section className="mt-8 overflow-hidden rounded-xl border bg-card">
          <div className="border-b p-5 sm:p-6">
            <h2 className="font-semibold">
              Your Projects
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Your projects will appear here once you create them.
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-80 items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">
                Loading projects...
              </p>
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-80 items-center justify-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                  <FolderKanban className="size-5 text-muted-foreground" />
                </div>

                <h3 className="mt-4 text-sm font-medium">
                  No projects yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create your first project and start analyzing
                  your codebase with AI-powered insights.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={handleOpenCreate}
                >
                  <Plus className="size-4" />
                  Create Project
                </Button>
              </div>
            </div>
          ) : (
            /* Project Cards */
            <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/app/projects/${project.id}`}
                  state={{ project }}
                  className="group block"
                >
                  <div className="h-full rounded-xl border bg-background p-5 transition-all duration-150 group-hover:border-primary/30 group-hover:shadow-sm">
                    {/* Card Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderKanban className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {project.name}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Project
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={(event) =>
                            handleOpenEdit(
                              event,
                              project
                            )
                          }
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label={`Edit ${project.name}`}
                          title="Edit project"
                        >
                          <Pencil className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(event) =>
                            handleDelete(
                              event,
                              project
                            )
                          }
                          disabled={
                            deletingId === project.id
                          }
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                          aria-label={`Delete ${project.name}`}
                          title="Delete project"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground">
                      {project.description ||
                        "No description provided."}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <p className="text-xs text-muted-foreground">
                        Ready for code analysis
                      </p>

                      <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        Open →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create / Edit Dialog */}
      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingProject(null)
        }}
        onCreate={handleSaveProject}
        project={editingProject}
      />
    </>
  )
}

export default Projects