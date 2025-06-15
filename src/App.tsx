
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import Loading from "@/components/Loading";
import Index from "./pages/Index";
import Builder from "./pages/Builder";
import Analyzer from "./pages/Analyzer";
import Templates from "./pages/Templates";
import Pricing from "./pages/Pricing";
import FeaturesPage from "./pages/FeaturesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Loading size="lg" text="Loading ResumeAI..." />
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route 
              path="/builder" 
              element={
                <ProtectedRoute>
                  <Builder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analyzer" 
              element={
                <ProtectedRoute>
                  <Analyzer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sign-in/*" 
              element={
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-blue-dark/20 dark:to-indigo-dark/10">
                  <div className="w-full max-w-md">
                    <SignIn 
                      routing="path" 
                      path="/sign-in" 
                      signUpUrl="/sign-up"
                      redirectUrl="/"
                      appearance={{
                        elements: {
                          rootBox: "mx-auto w-full max-w-md",
                          card: "bg-card shadow-xl border rounded-xl p-8 mx-4 dark:bg-card/95 dark:backdrop-blur-md",
                          headerTitle: "text-foreground",
                          headerSubtitle: "text-muted-foreground",
                          formButtonPrimary: "bg-blue hover:bg-blue-dark text-white",
                          formFieldLabel: "text-foreground",
                          formFieldInput: "bg-background border-border",
                          footer: "text-muted-foreground",
                          footerActionLink: "text-blue hover:text-blue-dark"
                        }
                      }}
                    />
                  </div>
                </div>
              } 
            />
            <Route 
              path="/sign-up/*" 
              element={
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30 dark:from-blue-dark/20 dark:to-indigo-dark/10">
                  <div className="w-full max-w-md">
                    <SignUp 
                      routing="path" 
                      path="/sign-up" 
                      signInUrl="/sign-in"
                      redirectUrl="/"
                      appearance={{
                        elements: {
                          rootBox: "mx-auto w-full max-w-md",
                          card: "bg-card shadow-xl border rounded-xl p-8 mx-4 dark:bg-card/95 dark:backdrop-blur-md",
                          headerTitle: "text-foreground",
                          headerSubtitle: "text-muted-foreground",
                          formButtonPrimary: "bg-blue hover:bg-blue-dark text-white",
                          formFieldLabel: "text-foreground",
                          formFieldInput: "bg-background border-border",
                          footer: "text-muted-foreground",
                          footerActionLink: "text-blue hover:text-blue-dark"
                        }
                      }}
                    />
                  </div>
                </div>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
