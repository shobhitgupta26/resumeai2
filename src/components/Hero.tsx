
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/95">
      <div className="container px-4 text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-6 animate-fade-in">
          Your Resume,
          <br />
          Reimagined.
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Create professional resumes powered by AI technology.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Button 
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-lg rounded-full bg-primary hover:bg-primary/90"
            onClick={() => navigate(isSignedIn ? "/builder" : "/sign-up")}
          >
            Get Started
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-lg rounded-full border-2"
            onClick={() => navigate("/features")}
          >
            Learn more
          </Button>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-5xl aspect-[16/9] rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 blur-3xl opacity-50" />
      </div>
    </section>
  );
}
