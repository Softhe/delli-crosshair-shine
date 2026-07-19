import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const CustomCrosshair = lazy(() => import("./pages/CustomCrosshair"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <main className="flex min-h-screen items-center justify-center px-4" aria-busy="true">
    <p className="text-sm text-muted-foreground">Loading page…</p>
  </main>
);

function App() {
  return (
    <TooltipProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/custom" element={<CustomCrosshair />} />
            <Route path="/:shareCode" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
        <Sonner />
    </TooltipProvider>
  );
}

export default App;
