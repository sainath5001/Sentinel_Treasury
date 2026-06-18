"use client";

import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Architecture", href: "/architecture" },
  { label: "Demo", href: "/demo" },
  { label: "Dashboard", href: "/dashboard" },
] as const;

function StackedCircularFooter() {
  return (
    <footer className="border-t border-violet-500/10 bg-black py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <Link
            href="/"
            className="mb-8 rounded-full border border-violet-500/30 bg-violet-500/10 p-8 text-violet-300 transition-colors hover:border-violet-500/50 hover:bg-violet-500/15"
            aria-label="Sentinel Treasury home"
          >
            <Icons.logo className="h-7 w-7" />
          </Link>

          <nav className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-400 transition-colors hover:text-violet-300"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mb-8 flex space-x-3">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="rounded-full border-slate-600 bg-black/50 text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
            >
              <a
                href="https://twitter.com/terminal3io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons.twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              className="rounded-full border-slate-600 bg-black/50 text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
            >
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              asChild
              className="rounded-full border-slate-600 bg-black/50 text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
            >
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Icons.linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </Button>
          </div>

          <div className="mb-8 w-full max-w-md">
            <form
              className="flex space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="grow">
                <Label htmlFor="footer-email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="footer-email"
                  placeholder="Get hackathon updates"
                  type="email"
                  className="rounded-full border-slate-600 bg-black/50 text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500/40"
                />
              </div>
              <Button
                type="submit"
                className="rounded-full border-0 bg-[#BF80FF] text-slate-950 hover:bg-[#C896FF]"
              >
                Subscribe
              </Button>
            </form>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-xs text-slate-500">
              Identity → Authorization → Protected Action → Audit
            </p>
            <p className="text-sm text-slate-500">
              © 2026 Sentinel Treasury. Powered by Terminal 3.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { StackedCircularFooter };
