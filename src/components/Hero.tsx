
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
    <section className="min-h-[calc(100vh-4rem)] flex items-center pt-20 section-padding overflow-hidden hero-gradient">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-sm font-medium tracking-wider uppercase text-primary">AI-Powered Resume Builder</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 gradient-text">
              Create Outstanding Resumes with AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-lg">
              Build, analyze, and optimize your resume with intelligent insights for better job opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto button-gradient shadow-md hover:shadow-lg group"
                onClick={handleGetStarted}
              >
                <FileText className="mr-2 h-5 w-5" /> 
                {isSignedIn ? "Create Resume" : "Sign Up & Create Resume"}
                <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                onClick={handleAnalyzeResume}
              >
                <Sparkles className="mr-2 h-5 w-5" /> 
                {isSignedIn ? "Analyze Resume" : "Sign Up & Analyze Resume"}
              </Button>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>AI-powered insights to boost your resume quality</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Professional templates optimized for ATS systems</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Deep analysis using Gemini AI for tailored recommendations</span>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="h-9 w-9 rounded-full bg-primary border-2 border-white dark:border-background flex items-center justify-center text-white text-xs font-medium">JD</div>
                <div className="h-9 w-9 rounded-full bg-purple-500 border-2 border-white dark:border-background flex items-center justify-center text-white text-xs font-medium">RW</div>
                <div className="h-9 w-9 rounded-full bg-pink-500 border-2 border-white dark:border-background flex items-center justify-center text-white text-xs font-medium">KL</div>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">500+</span> professionals using ResumeAI today
              </p>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-pink-500 rounded-xl blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-card border rounded-xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1644982647711-9129d2ed7ceb?q=80&w=1000" 
                alt="Resume builder preview" 
                className="w-full h-auto object-cover rounded-xl opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="space-y-4">
                    <div className="h-8 rounded-md bg-white/30 w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 rounded-md bg-white/30 w-full"></div>
                      <div className="h-4 rounded-md bg-white/30 w-5/6"></div>
                    </div>
                    <div className="pt-4 flex justify-end">
                      <div className="h-8 rounded-md bg-white/50 w-1/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-card p-4 rounded-lg shadow-lg border flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">AI-powered suggestions</p>
                <p className="text-xs text-muted-foreground">Optimize your resume content</p>
              </div>
            </div>
            
            {!isSignedIn && (
              <div className="absolute -top-2 -left-2 bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Sign up to unlock all features</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
