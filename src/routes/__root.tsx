import { Link, Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-display text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tiramisu Analysis — Personal Color Season Analysis" },
      { name: "description", content: "Discover your true 12-season color palette with AI-powered personal color analysis." },
      { name: "author", content: "Tiramisu Analysis" },
      { property: "og:title", content: "Tiramisu Analysis — Personal Color Season Analysis" },
      { property: "og:description", content: "Discover your true 12-season color palette with AI-powered personal color analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Tiramisu Analysis — Personal Color Season Analysis" },
      { name: "twitter:description", content: "Discover your true 12-season color palette with AI-powered personal color analysis." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48fd7bb9-7cb7-4eb9-9817-0a89af4d7115/id-preview-f3e1b4e0--60d42bab-3613-4037-abf6-0b3eed03d300.lovable.app-1776759757897.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/48fd7bb9-7cb7-4eb9-9817-0a89af4d7115/id-preview-f3e1b4e0--60d42bab-3613-4037-abf6-0b3eed03d300.lovable.app-1776759757897.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const { user, signOut } = useAuth();
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 md:px-10 md:py-7">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-wide text-foreground md:text-2xl">
          Tiramisu <span className="italic text-accent">Analysis</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm md:gap-5">
          {user ? (
            <>
              <span className="hidden text-xs text-foreground/60 md:inline">
                {user.user_metadata?.display_name || user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-full border border-border bg-card px-4 py-2 text-foreground transition hover:bg-muted"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-full border border-border bg-card px-4 py-2 text-foreground transition hover:bg-muted"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/analyze"
            className="rounded-full bg-primary px-5 py-2 text-primary-foreground transition hover:opacity-90"
          >
            Begin analysis
          </Link>
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Header />
      <Outlet />
    </AuthProvider>
  );
}
