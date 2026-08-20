import {
  ArrowDown,
  ArrowRight,
  Brain,
  FileText,
  FolderKanban,
  MessageSquare,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FolderKanban,
    title: "Create a project",
    description:
      "Create a workspace for your codebase and keep everything organized in one place.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Add your documents",
    description:
      "Upload documentation and supported project files so DevLens can build context around your project.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Ask questions",
    description:
      "Ask natural-language questions about your architecture, authentication, features, or implementation.",
  },
  {
    number: "04",
    icon: Brain,
    title: "Get grounded answers",
    description:
      "DevLens retrieves relevant project context and uses AI to generate an answer based on your data.",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-t bg-muted/20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            How it works
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            From your codebase to
            <span className="text-primary"> useful answers.</span>
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            DevLens combines document processing, semantic search, and
            generative AI to help you understand your project faster.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-14">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.number} className="relative">
                  <div className="group h-full rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm">
                    {/* Top */}
                    <div className="flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>

                      <span className="text-xs font-semibold tracking-wider text-muted-foreground/40">
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="mt-6 text-base font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {/* Desktop connector */}
                  {!isLast && (
                    <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:flex">
                      <div className="flex size-6 items-center justify-center rounded-full border bg-background">
                        <ArrowRight className="size-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Mobile connector */}
                  {!isLast && (
                    <div className="flex justify-center py-3 md:hidden">
                      <ArrowDown className="size-4 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RAG pipeline */}
        <div className="mt-14 overflow-hidden rounded-2xl border bg-card">
          <div className="border-b px-5 py-4 sm:px-6">
            <p className="text-sm font-semibold">
              What happens behind the scenes?
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              DevLens retrieves relevant context before generating an answer.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="flex min-w-[720px] items-center justify-center gap-3 px-6 py-8">
              <PipelineItem label="Your Files" />
              <PipelineArrow />

              <PipelineItem label="Processing" />
              <PipelineArrow />

              <PipelineItem label="Embeddings" />
              <PipelineArrow />

              <PipelineItem label="Qdrant" active />
              <PipelineArrow />

              <PipelineItem label="Gemini" active />
              <PipelineArrow />

              <PipelineItem label="Answer" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PipelineItem({ label, active = false }) {
  return (
    <div
      className={[
        "shrink-0 rounded-lg border px-4 py-2.5 text-xs font-medium",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "bg-background text-muted-foreground",
      ].join(" ")}
    >
      {label}
    </div>
  );
}

function PipelineArrow() {
  return (
    <ArrowRight className="size-4 shrink-0 text-muted-foreground/40" />
  );
}

export default HowItWorksSection;