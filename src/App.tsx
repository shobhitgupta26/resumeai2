
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Builder from "./pages/Builder";
import Analyzer from "./pages/Analyzer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-32 bg-muted rounded-md mx-auto mb-4"></div>
        <div className="h-4 w-48 bg-muted rounded-md mx-auto"></div>
      </div>
    </div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30">
                  <div className="w-full max-w-md">
                    <SignIn 
                      routing="path" 
                      path="/sign-in" 
                      signUpUrl="/sign-up"
                      redirectUrl="/builder"
                      appearance={{
                        elements: {
                          rootBox: "mx-auto w-full max-w-md",
                          card: "bg-card shadow-xl border rounded-xl p-8 mx-4"
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
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30">
                  <div className="w-full max-w-md">
                    <SignUp 
                      routing="path" 
                      path="/sign-up" 
                      signInUrl="/sign-in"
                      redirectUrl="/builder"
                      appearance={{
                        elements: {
                          rootBox: "mx-auto w-full max-w-md",
                          card: "bg-card shadow-xl border rounded-xl p-8 mx-4"
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
  );
};

export default App;
