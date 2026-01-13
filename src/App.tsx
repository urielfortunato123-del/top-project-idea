import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Suspense, lazy, memo } from "react";
import { Loader2 } from "lucide-react";
// Lazy load all pages for better initial load performance
const Auth = lazy(() => import("./pages/Auth"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Capture = lazy(() => import("./pages/Capture"));
const Pending = lazy(() => import("./pages/Pending"));
const Photos = lazy(() => import("./pages/Photos"));
const PhotoDetail = lazy(() => import("./pages/PhotoDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PhotoBrowser = lazy(() => import("./pages/PhotoBrowser"));
const PhotoMap = lazy(() => import("./pages/PhotoMap"));
const Reports = lazy(() => import("./pages/Reports"));
const RDOPage = lazy(() => import("./pages/RDOPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient for low-end devices
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
));
PageLoader.displayName = 'PageLoader';

const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
});
ProtectedRoute.displayName = 'ProtectedRoute';

const AdminRoute = memo(({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading, role } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Wait role hydration to avoid redirecting an admin before role arrives
  if (role === null) {
    return <PageLoader />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
});
AdminRoute.displayName = 'AdminRoute';

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/capture" element={<ProtectedRoute><Capture /></ProtectedRoute>} />
        <Route path="/pending" element={<ProtectedRoute><Pending /></ProtectedRoute>} />
        <Route path="/photos" element={<ProtectedRoute><Photos /></ProtectedRoute>} />
        <Route path="/photos/:id" element={<ProtectedRoute><PhotoDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/photo-browser" element={<AdminRoute><PhotoBrowser /></AdminRoute>} />
        <Route path="/photo-map" element={<ProtectedRoute><PhotoMap /></ProtectedRoute>} />
        <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/rdo" element={<ProtectedRoute><RDOPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
          <UpdatePrompt />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
