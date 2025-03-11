
import { Award, BarChart, Clock, FileText, Sparkles, Shield, Zap, Lock } from "lucide-react";
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
      icon: <FileText className="h-6 w-6" />,
      title: "Professional Templates",
      description: "Choose from a collection of elegant, ATS-optimized resume templates.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Suggestions",
      description: "Get real-time content improvements and wording suggestions as you type.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Detailed Analysis",
      description: "Receive comprehensive insights on how to improve your resume's effectiveness.",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes through Applicant Tracking Systems with ease.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Generation",
      description: "Create a professional resume in minutes, not hours, with intuitive tools.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy Protection",
      description: "Your data is secure with our advanced encryption and privacy controls.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Gemini AI Analysis",
      description: "Leverage Google's Gemini AI to get deep insights on your resume's strengths and weaknesses.",
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-in">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 gradient-text">
            Features Designed for Success
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI-powered platform offers everything you need to create standout resumes that get noticed by employers.
          </p>
          
          {!isSignedIn && (
            <Button 
              onClick={handleSignUp}
              className="mt-6 button-gradient"
              size="lg"
            >
              Sign Up to Access All Features
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 animate-fade-in relative overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              
              {!isSignedIn && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-center p-4">
                    <Lock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="font-medium text-sm">Sign up to unlock</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2 border-primary/50 hover:bg-primary/10"
                      onClick={handleSignUp}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
