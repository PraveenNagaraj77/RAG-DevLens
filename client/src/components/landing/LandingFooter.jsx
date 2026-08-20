import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const productLinks = [
  {
    label: "Get Started",
    href: "/register",
  },
  {
    label: "Sign In",
    href: "/login",
  },
];

function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                D
              </div>

              <span className="text-sm font-semibold tracking-tight">
                DevLens
              </span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              An AI-powered code and documentation assistant that helps
              developers understand their projects faster.
            </p>

            <a
              href="https://github.com/PraveenNagaraj77/RAG-DevLens"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View source
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Product
            </h3>

            <div className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Built With
            </h3>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">React</p>

              <p className="text-sm text-muted-foreground">Node.js</p>

              <p className="text-sm text-muted-foreground">PostgreSQL</p>

              <p className="text-sm text-muted-foreground">Qdrant · Gemini</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DevLens. All rights reserved.</p>

          <p>
            Designed & developed by{" "}
            <span className="font-medium text-foreground">Praveen</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
