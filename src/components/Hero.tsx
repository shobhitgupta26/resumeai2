
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Hero() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElements = heroRef.current?.querySelectorAll(".animate-on-scroll");
    if (heroElements) {
      heroElements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (heroElements) {
        heroElements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/95 overflow-hidden">
      <div className="container px-4 relative z-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="text-left lg:w-1/2 animate-on-scroll opacity-0" style={{ animationDelay: "0.2s" }}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6">
            Your Resume,
            <br />
            <span className="text-gradient-primary">Reimagined.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-8 animate-on-scroll opacity-0" style={{ animationDelay: "0.4s" }}>
            Create professional resumes powered by AI technology that helps you stand out and get noticed by employers.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 animate-on-scroll opacity-0" style={{ animationDelay: "0.6s" }}>
            <Button 
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-lg rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
              onClick={() => navigate(isSignedIn ? "/builder" : "/sign-up")}
            >
              Get Started
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-lg rounded-full border-2 transition-all duration-300 hover:shadow-md"
              onClick={() => navigate("/features")}
            >
              Learn more
            </Button>
          </div>
        </div>

        <div className="lg:w-1/2 mt-12 lg:mt-0 animate-on-scroll opacity-0" style={{ animationDelay: "0.8s" }}>
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-blue/30 rounded-2xl blur opacity-75 animate-pulse"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800"
                alt="Person working on resume" 
                className="w-full h-auto rounded-2xl object-cover transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ambient light effects */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full max-w-5xl aspect-[16/9] rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 blur-3xl opacity-50 animate-pulse" />
      </div>
      <div className="absolute -left-48 top-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -right-48 bottom-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
    </section>
  );
}
