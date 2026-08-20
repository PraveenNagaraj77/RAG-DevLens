import {
  ArrowRight,
  Braces,
  Database,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const pipeline = [
  {
    icon: FileText,
    label: "Project Files",
    description: "Docs & source files",
  },
  {
    icon: Braces,
    label: "Chunking",
    description: "Content processing",
  },
  {
    icon: Sparkles,
    label: "Embeddings",
    description: "Semantic vectors",
  },
  {
    icon: Database,
    label: "Qdrant",
    description: "Vector retrieval",
  },
  {
    icon: MessageSquare,
    label: "Gemini",
    description: "Answer generation",
  },
];

function ArchitectureSection() {
  return (
    <section id="technology" className="scroll-mt-20 border-t bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Under the hood
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            AI grounded in your
            <span className="text-primary"> project context.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            DevLens uses a retrieval-augmented generation pipeline to find
            relevant project context before generating an answer.
          </p>
        </div>

        {/* Architecture */}
        <div className="mt-14 overflow-hidden rounded-2xl border bg-card">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold">DevLens RAG Pipeline</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Retrieval → Context → Generation
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-medium text-muted-foreground">
                AI Pipeline
              </span>
            </div>
          </div>

          {/* Pipeline */}
          <div className="overflow-x-auto">
            <div className="flex min-w-[850px] items-center justify-center px-8 py-12">
              {pipeline.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-center">
                    <div className="w-32 text-center">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border bg-background text-primary shadow-sm">
                        <Icon className="size-6" />
                      </div>

                      <p className="mt-4 text-xs font-semibold">{item.label}</p>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    {index < pipeline.length - 1 && (
                      <div className="mx-3 flex items-center">
                        <ArrowRight className="size-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div className="grid border-t sm:grid-cols-3">
            <ArchitectureDetail
              title="Retrieve"
              description="Relevant chunks are searched from the project's vector knowledge."
            />

            <ArchitectureDetail
              title="Augment"
              description="Retrieved content becomes context for the AI model."
            />

            <ArchitectureDetail
              title="Generate"
              description="Gemini generates an answer using the retrieved project context."
            />
          </div>
        </div>

        {/* Technology stack */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["React", "Node.js", "PostgreSQL", "Qdrant", "Gemini", "Docker"].map(
            (technology) => (
              <span
                key={technology}
                className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground"
              >
                {technology}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

function ArchitectureDetail({ title, description }) {
  return (
    <div className="border-b p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:p-6 sm:last:border-r-0">
      <p className="text-xs font-semibold text-primary">{title}</p>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default ArchitectureSection;
