import {
  Brain,
  FileSearch,
  FolderSearch,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Codebase Intelligence",
    description:
      "Understand your project through natural-language questions instead of manually searching through files and documentation.",
  },
  {
    icon: FileSearch,
    title: "Documentation-Aware",
    description:
      "Upload project documentation and files so DevLens can use your own project context when answering questions.",
  },
  {
    icon: FolderSearch,
    title: "Semantic Retrieval",
    description:
      "DevLens searches your project's indexed knowledge and retrieves the most relevant context for each question.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded Answers",
    description:
      "Responses are generated from retrieved project context instead of relying only on the AI model's general knowledge.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Built for developers
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Understand more.
            <span className="text-primary"> Search less.</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            DevLens turns your project documentation and codebase context
            into an intelligent workspace you can interact with.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm sm:p-7"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>

                <h3 className="mt-6 text-base font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlight */}
        <div className="mt-6 rounded-2xl border bg-muted/20 p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold">
                Your project stays at the center.
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                DevLens doesn't replace your codebase with generic AI
                knowledge. It retrieves relevant information from your
                project and uses that context to answer your questions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat value="RAG" label="Powered" />
              <Stat value="AI" label="Assisted" />
              <Stat value="Code" label="Focused" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="min-w-20 rounded-xl border bg-background px-4 py-3 text-center">
      <p className="text-sm font-semibold text-primary">{value}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default FeaturesSection;