import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackVisit } from "@/lib/analytics.functions";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "UniDoc — Médico online para universitários" },
      {
        name: "description",
        content:
          "Consultas médicas online com valor acessível. Sem fila, sem deslocamento, sem burocracia. Feito para a rotina universitária.",
      },
      { property: "og:title", content: "UniDoc — Médico online para universitários" },
      {
        property: "og:description",
        content:
          "Teleconsulta em minutos com médicos de CRM ativo. Agende, pague e consulte de qualquer lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "UniDoc — Médico online para universitários" },
      { name: "description", content: "Your Caring Companion is an online medical platform for booking consultations and managing appointments." },
      { property: "og:description", content: "Your Caring Companion is an online medical platform for booking consultations and managing appointments." },
      { name: "twitter:description", content: "Your Caring Companion is an online medical platform for booking consultations and managing appointments." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/30cc27f6-4e9e-4895-9c6e-143a984595e9/id-preview-467a406f--1fd9ddbb-d78a-4c1f-8897-0f15e3726ae8.lovable.app-1779128626429.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/30cc27f6-4e9e-4895-9c6e-143a984595e9/id-preview-467a406f--1fd9ddbb-d78a-4c1f-8897-0f15e3726ae8.lovable.app-1779128626429.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const trackVisitFn = useServerFn(trackVisit);

  useEffect(() => {
    // Only track on the client and not in admin paths to avoid polluting real traffic data
    if (typeof window !== "undefined" && !location.pathname.startsWith("/admin")) {
      trackVisitFn({
        data: {
          path: location.pathname,
          userAgent: window.navigator.userAgent,
          referrer: document.referrer,
        },
      }).catch(console.error);
    }
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
