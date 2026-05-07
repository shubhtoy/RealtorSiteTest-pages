import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import SitePreloader from "./components/layout/SitePreloader";
import SiteFooter from "./components/layout/SiteFooter";
import SiteHeader from "./components/layout/SiteHeader";
import RouteErrorBoundary from "./components/layout/RouteErrorBoundary";
import { ThemeInjector } from "./components/layout/ThemeInjector";
import { EditableContentProvider } from "./context/EditableContentContext";
const HomePage = lazy(() => import("./pages/HomePage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));

function RouteFallback() {
  return <main className="mx-auto w-[min(1140px,92vw)] py-24 text-sm text-muted-foreground">Loading...</main>;
}

function AppContent({ showPreloader }: { showPreloader: boolean }) {
  const location = useLocation();
  const isStudio = location.pathname === "/studio";

  return (
    <>
      {!isStudio ? <SitePreloader visible={showPreloader} /> : null}
      {!isStudio ? <SiteHeader /> : null}

      <Routes>
        <Route path="/" element={<Suspense fallback={<RouteFallback />}><HomePage /></Suspense>} />
        <Route path="/gallery" element={<Suspense fallback={<RouteFallback />}><GalleryPage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<RouteFallback />}><ContactPage /></Suspense>} />
        <Route
          path="/studio"
          element={<Suspense fallback={<RouteFallback />}><StudioPage /></Suspense>}
        />
        <Route path="/edit" element={<Navigate to="/studio" replace />} />
        <Route path="/edit/studio" element={<Navigate to="/studio" replace />} />
        <Route path="/edit/gallery" element={<Navigate to="/studio" replace />} />
        <Route path="/edit/contact" element={<Navigate to="/studio" replace />} />
        <Route path="/admin/config" element={<Navigate to="/studio" replace />} />
        <Route path="*" element={<RouteErrorBoundary><Suspense fallback={<RouteFallback />}><NotFoundPage /></Suspense></RouteErrorBoundary>} />
      </Routes>

      {!isStudio ? <SiteFooter /> : null}
      <Toaster richColors position="top-right" />
    </>
  );
}

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const minShowMs = 700;
    let minTimer: ReturnType<typeof setTimeout> | undefined;

    const waitForMinimumTime = new Promise<void>((resolve) => {
      minTimer = setTimeout(resolve, minShowMs);
    });

    const waitForWindowLoad = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
        return;
      }

      const onLoad = () => {
        window.removeEventListener("load", onLoad);
        resolve();
      };

      window.addEventListener("load", onLoad);
    });

    Promise.all([waitForMinimumTime, waitForWindowLoad]).then(() => {
      if (!isCancelled) {
        setShowPreloader(false);
      }
    });

    return () => {
      isCancelled = true;
      if (minTimer) {
        clearTimeout(minTimer);
      }
    };
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <EditableContentProvider>
        <ThemeInjector />
        <AppContent showPreloader={showPreloader} />
      </EditableContentProvider>
    </BrowserRouter>
  );
}
