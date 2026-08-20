
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

function CTASection() {
  return (
    <section className="border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border bg-muted/20 px-6 py-14 text-center sm:px-10 sm:py-16">
          {/* Background glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -z-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Start exploring your codebase
            </div>

            {/* Heading */}
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Understand your codebase
              <span className="block text-primary">
                with DevLens.
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Stop searching through files manually. Upload your project,
              ask questions, and get answers grounded in your own
              documentation and codebase.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Supporting text */}
            <p className="mt-5 text-xs text-muted-foreground/60">
              Built for developers who want to understand their projects
              faster.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
