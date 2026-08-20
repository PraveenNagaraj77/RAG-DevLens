import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Content */}
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            AI-powered code intelligence
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Understand your
            <span className="block text-primary">
              codebase with AI.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            DevLens helps developers understand their projects faster.
            Upload your documentation and project files, then ask questions
            and get answers grounded in your actual codebase.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <a
              href="https://github.com/PraveenNagaraj77/RAG-DevLens"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Tech stack */}
          <div className="mt-10">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
              Built with
            </p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span>React</span>
              <span>Node.js</span>
              <span>PostgreSQL</span>
              <span>Qdrant</span>
              <span>Gemini</span>
            </div>
          </div>
        </div>

        {/* Product Preview */}
        <div className="relative">
          <div className="relative mx-auto w-full max-w-xl">
            {/* Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />

            {/* Browser window */}
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl">
              {/* Browser header */}
              <div className="flex h-11 items-center gap-2 border-b bg-muted/30 px-4">
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />

                <div className="ml-4 h-6 flex-1 rounded-md border bg-background" />
              </div>

              {/* App */}
              <div className="flex min-h-[380px]">
                {/* Sidebar */}
                <div className="hidden w-36 shrink-0 border-r bg-muted/20 p-3 sm:block">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                      D
                    </div>

                    <span className="text-xs font-semibold">
                      DevLens
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-md bg-primary/10 px-2 py-2 text-[10px] text-primary">
                      Dashboard
                    </div>

                    <div className="px-2 py-2 text-[10px] text-muted-foreground">
                      Projects
                    </div>

                    <div className="px-2 py-2 text-[10px] text-muted-foreground">
                      AI Chat
                    </div>
                  </div>
                </div>

                {/* Chat */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="border-b p-4">
                    <p className="text-sm font-semibold">
                      AI Chat
                    </p>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Ask questions about your project
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 p-4">
                    {/* User */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-xl bg-primary px-3 py-2 text-xs text-primary-foreground">
                        How does authentication work?
                      </div>
                    </div>

                    {/* AI */}
                    <div className="flex gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
                        AI
                      </div>

                      <div className="max-w-[85%] rounded-xl border bg-background p-3">
                        <p className="text-xs leading-5">
                          Authentication is handled using JWT tokens.
                          The backend validates the token through the
                          authentication middleware before allowing
                          access to protected routes.
                        </p>

                        <div className="mt-3 border-t pt-2">
                          <p className="text-[9px] font-medium text-muted-foreground">
                            Sources
                          </p>

                          <div className="mt-1 flex gap-1">
                            <span className="rounded bg-muted px-1.5 py-1 text-[8px] text-muted-foreground">
                              authMiddleware.js
                            </span>

                            <span className="rounded bg-muted px-1.5 py-1 text-[8px] text-muted-foreground">
                              authController.js
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="border-t p-3">
                    <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                      <span className="flex-1 text-[10px] text-muted-foreground">
                        Ask DevLens...
                      </span>

                      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <ArrowRight className="size-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;