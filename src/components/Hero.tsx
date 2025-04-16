
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { FileText, Sparkles, ChevronRight, Lock, CheckCircle } from "lucide-react";

export default function Hero() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isSignedIn ? "/builder" : "/sign-up");
  };

  const handleAnalyzeResume = () => {
    navigate(isSignedIn ? "/analyzer" : "/sign-up");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-background/95 overflow-hidden">
      <div className="container max-w-6xl px-4">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Build Your Future
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in opacity-90 max-w-xl mx-auto" style={{ animationDelay: "0.2s" }}>
            Create professional resumes with AI-powered insights for better career opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-14 text-lg"
              onClick={handleGetStarted}
            >
              <FileText className="mr-2 h-5 w-5" />
              {isSignedIn ? "Create Resume" : "Get Started"}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto rounded-full px-8 h-14 text-lg border-2"
              onClick={handleAnalyzeResume}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isSignedIn ? "Analyze Resume" : "Try Demo"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="p-6 rounded-2xl bg-card border">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Professional Templates</h3>
              <p className="text-sm text-muted-foreground">Choose from our collection of ATS-optimized resume templates.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Get intelligent suggestions and improvements in real-time.</p>
            </div>

            <div className="p-6 rounded-2xl bg-card border">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">ATS Optimized</h3>
              <p className="text-sm text-muted-foreground">Ensure your resume passes through applicant tracking systems.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
