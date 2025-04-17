
import { Award, Sparkles, Shield, Zap, Bot, FileText, BarChart } from "lucide-react";
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
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Resume Writing",
      description: "Our AI assistant refines your resume by re-writing bullet points to highlight your achievements and showcase your impact.",
      image: "https://images.unsplash.com/photo-1555421689-3f034debb7a6?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "ATS-Friendly Formats",
      description: "All our templates are designed to pass through applicant tracking systems with flying colors.",
      image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Tailor Your Resume in One Click",
      description: "With a click of a button and a job description paste, get your resume tailored to the job.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600"
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Impact-Oriented Content",
      description: "Transform your experience into impactful statements that showcase measurable results and achievements.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
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
    <section ref={featuresRef} className="py-24 bg-muted/20">
      <div className="container max-w-7xl px-4">
        <div className="text-center mb-16 feature-header opacity-0">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Make your resume stand out
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every feature is crafted to help you create a resume that gets noticed by employers and lands you interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-item opacity-0 flex flex-col gap-8 bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-background/10 to-transparent z-10"></div>
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-col items-start">
                <div className="mb-4 text-primary p-2 rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                
                <Button 
                  variant="link" 
                  className="mt-4 p-0 text-primary"
                  onClick={() => navigate(isSignedIn ? "/builder" : "/sign-up")}
                >
                  Learn more →
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {!isSignedIn && (
          <div className="mt-20 text-center feature-item opacity-0">
            <div className="bg-primary/5 rounded-xl p-8 md:p-12 max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to create your professional resume?</h3>
              <p className="text-muted-foreground mb-8">Join thousands of job seekers who have successfully landed their dream jobs with our AI-powered resume builder.</p>
              <Button 
                size="lg"
                className="px-8 py-6 text-lg rounded-md bg-primary hover:bg-primary/90 transition-all duration-300"
                onClick={() => navigate("/sign-up")}
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
