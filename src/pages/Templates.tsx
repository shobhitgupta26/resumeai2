
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Eye, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

export default function Templates() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const templatesRef = useRef<HTMLDivElement>(null);

  const templates = [
    {
      name: "Professional",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600",
      popular: true,
      description: "A clean, professional template that highlights your experience and skills."
    },
    {
      name: "Modern",
      image: "https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "A contemporary design with a clean layout and bold typography."
    },
    {
      name: "Creative",
      image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "Stand out with this creative template that shows your personality."
    },
    {
      name: "Executive",
      image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&q=80&w=600",
      popular: true,
      description: "Perfect for senior professionals and executives with extensive experience."
    },
    {
      name: "Minimalist",
      image: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "A clean, minimal design that lets your content speak for itself."
    },
    {
      name: "Technical",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "Ideal for technical roles with sections for projects and skills."
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
      { threshold: 0.1 }
    );

    const templateElements = templatesRef.current?.querySelectorAll(".template-item");
    if (templateElements) {
      templateElements.forEach((el, index) => {
        (el as HTMLElement).style.animationDelay = `${0.1 * index}s`;
        observer.observe(el);
      });
    }

    const headerElement = templatesRef.current?.querySelector(".templates-header");
    if (headerElement) {
      observer.observe(headerElement);
    }

    return () => {
      if (templateElements) {
        templateElements.forEach((el) => observer.unobserve(el));
      }
      if (headerElement) {
        observer.unobserve(headerElement);
      }
    };
  }, []);

  return (
    <div ref={templatesRef} className="min-h-screen flex flex-col dark:bg-gradient-to-b dark:from-background dark:via-background/80 dark:to-background">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="py-24">
          <div className="container px-4 max-w-7xl">
            <div className="text-center mb-16 templates-header opacity-0">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                Professional Resume Templates
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose from our collection of ATS-friendly, professionally designed templates 
                that will help you land your dream job.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {templates.map((template, index) => (
                <div 
                  key={index} 
                  className="template-item opacity-0 group flex flex-col border bg-card rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="relative">
                    <div className="aspect-[8.5/11] overflow-hidden bg-muted/30">
                      <img 
                        src={template.image} 
                        alt={template.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          className="bg-primary/90 hover:bg-primary"
                          onClick={() => navigate(isSignedIn ? "/builder" : "/sign-up")}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Preview
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-background/80 backdrop-blur-sm"
                          onClick={() => navigate(isSignedIn ? "/builder" : "/sign-up")}
                        >
                          <Download className="h-4 w-4 mr-1" /> Use
                        </Button>
                      </div>
                    </div>
                    
                    {template.popular && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-white" /> Popular
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-lg mb-6">Ready to create your professional resume?</p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate(isSignedIn ? "/builder" : "/sign-up")}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
