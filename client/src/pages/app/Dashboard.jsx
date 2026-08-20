import { useEffect, useState } from "react";
import { FileText, FolderKanban, MessageSquare, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { projectsApi } from "@/api/projects.api";

function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0)
  const [loading, setLoading] = useState(true);

  const userName = user?.name || "Developer";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsApi.getAll();

        console.log("Dashboard projects:", response);

        setProjects(response?.data || []);
        setProjectCount(response?.count || 0)
      } catch (error) {
        console.error("Failed to load dashboard projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const stats = [
    {
      label: "Projects",
      value: projectCount,
      icon: FolderKanban,
    },
    {
      label: "Documents",
      value: 0,
      icon: FileText,
    },
    {
      label: "Conversations",
      value: 0,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {userName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Understand your codebase with AI-powered insights.
          </p>
        </div>

        <Link to="/app/projects">
          <Button className="w-full shrink-0 sm:w-auto">
            <Plus className="size-4" />
            New Project
          </Button>
        </Link>
      </section>

      {/* Stats */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>

                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Recent Projects */}
      <section className="mt-6 overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-5 sm:p-6">
          <h2 className="font-semibold">Recent Projects</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your recently created projects will appear here.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                <FolderKanban className="size-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-sm font-medium">No projects yet</h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your first project and start analyzing your codebase with
                DevLens.
              </p>

              <Link to="/app/projects">
                <Button variant="outline" className="mt-5">
                  <Plus className="size-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                to={`/app/projects/${project.id}`}
                state={{ project }}
                className="group block"
              >
                <div className="rounded-xl border bg-background p-5 transition-all duration-150 group-hover:border-primary/30 group-hover:shadow-sm">
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
                  </div>

                  <p className="mt-4 text-sm leading-5 text-muted-foreground line-clamp-2">
                    {project.description || "No description provided."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
