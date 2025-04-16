
import { Award, Sparkles, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";

export default function Features() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered",
      description: "Leverage advanced AI to optimize your resume content."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "ATS-Friendly",
      description: "Ensure your resume passes through applicant tracking systems."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Professional Templates",
      description: "Choose from our collection of expertly designed templates."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Analysis",
      description: "Get detailed insights and improvements in real-time."
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-16">
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
              className="flex flex-col items-center text-center p-8"
            >
              <div className="mb-6 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-medium mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {!isSignedIn && (
          <div className="mt-16 text-center">
            <Button 
              size="lg"
              className="px-8 py-6 text-lg rounded-full"
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
