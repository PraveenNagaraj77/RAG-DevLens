
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { projectsApi } from "@/api/projects.api";

function Projects() {
  const [projects, setProjects] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await projectsApi.getAll();

      setProjects(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);

      setError(error.message || "Unable to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (event, project) => {
    event.preventDefault();
    event.stopPropagation();

    setEditingProject(project);
    setDialogOpen(true);
  };

  const handleSaveProject = async (projectData) => {
    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        await projectsApi.update(editingProject.id, projectData);
      } else {
        await projectsApi.create(projectData);
      }

      setDialogOpen(false);
      setEditingProject(null);

      await fetchProjects();
    } catch (error) {
      console.error("Failed to save project:", error);

      setError(error.message || "Unable to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event, project) => {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(project.id);
      setError("");

      await projectsApi.delete(project.id);

      await fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);

      setError(error.message || "Unable to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="size-5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Projects
                  </h1>

                  {!loading && (
                    <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      {projects.length}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Manage your codebases and explore them with DevLens AI.
                </p>
              </div>
            </div>
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
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="mt-1 size-2 shrink-0 rounded-full bg-destructive" />

            <div>
              <p className="text-sm font-medium text-destructive">
                Something went wrong
              </p>

              <p className="mt-0.5 text-sm text-destructive/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <section className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="font-semibold">Your Projects</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Your codebases and project knowledge spaces.
              </p>
            </div>

            {!loading && projects.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <ProjectSkeleton key={item} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[360px] items-center justify-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <FolderKanban className="size-6 text-muted-foreground" />
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  No projects yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create your first project and start giving DevLens
                  the context it needs to understand your codebase.
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
                  className="group block h-full"
                >
                  <article className="relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-2xl border bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                    {/* Hover Accent */}
                    <div className="absolute inset-x-0 top-0 h-px bg-primary/0 transition-colors group-hover:bg-primary/50" />

                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <FolderKanban className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {project.name}
                        </h3>

                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-emerald-500" />

                          <span className="text-[11px] text-muted-foreground">
                            Ready for analysis
                          </span>
                        </div>
                      </div>

                      {/* Open indicator */}
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:bg-muted group-hover:opacity-100">
                        <ArrowUpRight className="size-4" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-5 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
                      {project.description ||
                        "No description provided for this project."}
                    </p>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <span className="text-[11px] text-muted-foreground">
                        DevLens Project
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(event) =>
                            handleOpenEdit(event, project)
                          }
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Edit ${project.name}`}
                          title="Edit project"
                        >
                          <Pencil className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(event) =>
                            handleDelete(event, project)
                          }
                          disabled={deletingId === project.id}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                          aria-label={`Delete ${project.name}`}
                          title="Delete project"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
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
          setDialogOpen(false);
          setEditingProject(null);
        }}
        onCreate={handleSaveProject}
        project={editingProject}
      />
    </>
  );
}

function ProjectSkeleton() {
  return (
    <div className="min-h-[210px] animate-pulse rounded-2xl border bg-background p-5">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-muted" />

        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-muted" />

          <div className="mt-2 h-3 w-24 rounded bg-muted" />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>

      <div className="mt-7 border-t pt-4">
        <div className="h-3 w-28 rounded bg-muted" />
      </div>
    </div>
  );
}

export default Projects;

