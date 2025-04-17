import { Award, Sparkles, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

export default function Features() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered",
      description: "Leverage advanced AI to optimize your resume content.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "ATS-Friendly",
      description: "Ensure your resume passes through applicant tracking systems.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Professional Templates",
      description: "Choose from our collection of expertly designed templates.",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Analysis",
      description: "Get detailed insights and improvements in real-time.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    const featureElements = featuresRef.current?.querySelectorAll(".feature-item");
    if (featureElements) {
      featureElements.forEach((el, index) => {
        (el as HTMLElement).style.animationDelay = `${0.2 * index}s`;
        observer.observe(el);
      });
    }

    const headerElement = featuresRef.current?.querySelector(".feature-header");
    if (headerElement) {
      observer.observe(headerElement);
    }

    return () => {
      if (featureElements) {
        featureElements.forEach((el) => observer.unobserve(el));
      }
      if (headerElement) {
        observer.unobserve(headerElement);
      }
    };
  }, []);

  return (
    <section ref={featuresRef} className="py-24 bg-muted/30 dark:bg-background/50">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-16 feature-header opacity-0">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Designed for success
          </h2>
          <p className="text-xl text-muted-foreground">
            Every feature is crafted to help you land your dream job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-item opacity-0 flex flex-col rounded-2xl transition-all duration-500 hover:bg-background/50 dark:hover:bg-white/5 hover:shadow-xl overflow-hidden border border-transparent hover:border-primary/20"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-primary p-3 rounded-full bg-background/80 backdrop-blur-sm">
                  {feature.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {!isSignedIn && (
          <div className="mt-16 text-center feature-item opacity-0">
            <Button 
              size="lg"
              className="px-8 py-6 text-lg rounded-full transition-all duration-300 hover:shadow-lg"
              onClick={() => navigate("/sign-up")}
            >
              Try it free
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
