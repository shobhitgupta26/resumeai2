
import { Award, BarChart, Shield, Zap, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Features() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate("/sign-up");
  };
  
  const features = [
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Smart Analysis",
      description: "Get detailed insights on improving your resume's effectiveness."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "AI Technology",
      description: "Leverage advanced AI to optimize your resume content."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Success Rate",
      description: "Increase your chances of landing interviews with optimized content."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Data Security",
      description: "Your information is protected with enterprise-grade security."
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container max-w-6xl px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Features Designed for Success
          </h2>
          <p className="text-lg text-muted-foreground">
            Our platform offers everything you need to create standout resumes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-background border transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {!isSignedIn && (
          <div className="mt-16 text-center">
            <Button 
              onClick={handleSignUp}
              size="lg"
              className="rounded-full px-8"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
