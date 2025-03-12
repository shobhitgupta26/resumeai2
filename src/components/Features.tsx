
import { Award, BarChart, Clock, FileText, Sparkles, Shield, Zap, Lock, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Features() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const handleSignUp = () => {
    navigate("/sign-up");
  };
  
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Professional Templates",
      description: "Choose from a collection of elegant, ATS-optimized resume templates.",
      bgImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Suggestions",
      description: "Get real-time content improvements and wording suggestions as you type.",
      bgImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Detailed Analysis",
      description: "Receive comprehensive insights on how to improve your resume's effectiveness.",
      bgImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes through Applicant Tracking Systems with ease.",
      bgImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Generation",
      description: "Create a professional resume in minutes, not hours, with intuitive tools.",
      bgImage: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy Protection",
      description: "Your data is secure with our advanced encryption and privacy controls.",
      bgImage: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Gemini AI Analysis",
      description: "Leverage Google's Gemini AI to get deep insights on your resume's strengths and weaknesses.",
      bgImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-blue-500/5 to-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-blue-500">
            Features Designed for Success
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI-powered platform offers everything you need to create standout resumes that get noticed by employers.
          </p>
          
          {!isSignedIn && (
            <Button 
              onClick={handleSignUp}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-300"
              size="lg"
            >
              Sign Up to Access All Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative bg-card/60 backdrop-blur-lg border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30 animate-fade-in group product-card overflow-hidden"
              style={{ 
                animationDelay: `${index * 100}ms`,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${feature.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.6) contrast(1.2)',
                }}
              />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              
              {!isSignedIn && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="text-center p-4">
                    <Lock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="font-medium text-sm">Sign up to unlock</p>
                    <Button 
                      size="sm" 
                      className="mt-2 border-blue-500/50 hover:bg-blue-500/10 rounded-full"
                      onClick={handleSignUp}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
              
              {hoveredIndex === index && (
                <div className="absolute -bottom-1 -right-1 h-20 w-20 opacity-30 bg-gradient-to-br from-blue-500 to-blue-600 rounded-tl-full z-10"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a href="#" className="inline-flex items-center text-blue-500 hover:text-blue-600 transition-colors gap-1 font-medium">
            Explore all features
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
