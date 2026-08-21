import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  FileText,
  FolderKanban,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { projectsApi } from "@/api/projects.api";
import { documentsApi } from "@/api/documents.api";

function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const userName = user?.name || "Developer";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setDocumentsLoading(true);

        const response = await projectsApi.getAll();

        console.log("Dashboard projects:", response);

        const projectList = Array.isArray(response?.data)
          ? response.data
          : [];

        setProjects(projectList);

        setProjectCount(
          response?.count ?? projectList.length
        );

        if (projectList.length === 0) {
          setDocumentCount(0);
          return;
        }

        const documentResponses = await Promise.all(
          projectList.map((project) =>
            documentsApi.getByProjectId(project.id)
          )
        );

        const totalDocuments = documentResponses.reduce(
          (total, response) => {
            const documents = Array.isArray(response?.data)
              ? response.data
              : [];

            return total + documents.length;
          },
          0
        );

        console.log(
          "Dashboard document count:",
          totalDocuments
        );

        setDocumentCount(totalDocuments);
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        setDocumentCount(0);
      } finally {
        setLoading(false);
        setDocumentsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Projects",
      value: projectCount,
      description: "Active workspaces",
      icon: FolderKanban,
    },
    {
      label: "Documents",
      value: documentsLoading ? "..." : documentCount,
      description: "Indexed project files",
      icon: FileText,
    },
    {
      label: "Conversations",
      value: 0,
      description: "AI conversations",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Developer workspace
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {userName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Understand your codebase, explore your projects,
              and get AI-powered insights with DevLens.
            </p>
          </div>

          <Link to="/app/projects" className="shrink-0">
            <Button className="w-full sm:w-auto">
              <Plus className="size-4" />
              New Project
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>

                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Recent Projects */}
      <section className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-semibold">
              Recent Projects
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Quickly access your latest development projects.
            </p>
          </div>

          {projects.length > 0 && (
            <Link to="/app/projects">
              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto"
              >
                View all
                <ArrowUpRight className="size-4" />
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <ProjectSkeleton />
        ) : projects.length === 0 ? (
          <EmptyProjects />
        ) : (
          <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <Link
      to={`/app/projects/${project.id}`}
      state={{ project }}
      className="group block"
    >
      <div className="h-full rounded-xl border bg-background p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <FolderKanban className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">
              {project.name}
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Project workspace
            </p>
          </div>

          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {project.description ||
            "No description provided for this project."}
        </p>

        <div className="mt-5 border-t pt-4">
          <span className="inline-flex items-center rounded-full border bg-muted/30 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            AI ready
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyProjects() {
  return (
    <div className="flex min-h-80 items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FolderKanban className="size-6" />
        </div>

        <h3 className="mt-5 text-sm font-semibold">
          Your workspace is empty
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create your first project and start exploring your
          codebase with DevLens.
        </p>

        <Link to="/app/projects">
          <Button
            variant="outline"
            className="mt-5"
          >
            <Plus className="size-4" />
            Create Project
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-xl border bg-background p-5"
        >
          <div className="flex items-start gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;