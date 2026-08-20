import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const navigation = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
  {
    label: "Technology",
    href: "#technology",
  },
];

function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavigation = (event, href) => {
    event.preventDefault();

    const target = document.querySelector(href);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            D
          </div>

          <span className="text-sm font-semibold tracking-tight">
            DevLens
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) =>
                handleNavigation(event, item.href)
              }
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 sm:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>

          <Link to="/register">
            <Button size="sm">
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen((open) => !open)
          }
          className="inline-flex size-9 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted sm:hidden"
          aria-label={
            mobileMenuOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t bg-background sm:hidden">
          <nav className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4">
            <div className="space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) =>
                    handleNavigation(
                      event,
                      item.href
                    )
                  }
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full"
                  >
                    Get Started
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;