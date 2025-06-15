
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Legal from "@/components/Legal";
import Navbar from "@/components/Navbar";
import { Bot, Star, FileText, Award } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        {/* Testimonial section */}
        <section className="section-padding bg-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
          <div className="container max-w-6xl px-4 relative">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Loved by thousands of job seekers
              </h2>
              <div className="flex justify-center mb-4">
                <div className="flex text-accent text-2xl">
                  <Star className="fill-accent animate-scale" style={{ animationDelay: "0.1s" }} />
                  <Star className="fill-accent animate-scale" style={{ animationDelay: "0.2s" }} />
                  <Star className="fill-accent animate-scale" style={{ animationDelay: "0.3s" }} />
                  <Star className="fill-accent animate-scale" style={{ animationDelay: "0.4s" }} />
                  <Star className="fill-accent animate-scale" style={{ animationDelay: "0.5s" }} />
                </div>
              </div>
              <p className="text-lg text-muted-foreground">4.9/5 rating from our users</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card rounded-xl p-8 border border-border/50 card-hover group animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    JD
                  </div>
                  <div>
                    <div className="font-semibold text-lg">John Doe</div>
                    <div className="text-sm text-muted-foreground">Marketing Specialist</div>
                  </div>
                </div>
                <blockquote className="text-foreground/90 italic mb-6 text-base leading-relaxed">
                  "The AI suggestions helped me highlight achievements I hadn't considered. Got interviews at 3 companies within a week!"
                </blockquote>
                <div className="flex text-accent">
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-8 border border-border/50 card-hover group animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg border border-secondary/20">
                    AS
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Amy Smith</div>
                    <div className="text-sm text-muted-foreground">Software Developer</div>
                  </div>
                </div>
                <blockquote className="text-foreground/90 italic mb-6 text-base leading-relaxed">
                  "The one-click tailoring feature is a game-changer. I was able to customize my resume for different job applications in minutes!"
                </blockquote>
                <div className="flex text-accent">
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                </div>
              </div>
              
              <div className="glass-card rounded-xl p-8 border border-border/50 card-hover group animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg border border-accent/20">
                    TJ
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Tom Jackson</div>
                    <div className="text-sm text-muted-foreground">Project Manager</div>
                  </div>
                </div>
                <blockquote className="text-foreground/90 italic mb-6 text-base leading-relaxed">
                  "After struggling to get responses, I revamped my resume with ResumeAI and landed my dream job at a Fortune 500 company!"
                </blockquote>
                <div className="flex text-accent">
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                  <Star className="h-5 w-5 fill-accent" />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Features />
        
        {/* How it works section */}
        <section className="section-padding bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
          <div className="container max-w-6xl px-4 relative">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                How it works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Create your professional resume in three simple steps and land your dream job faster
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center group animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold shadow-md">
                    1
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Choose a template</h3>
                <p className="text-muted-foreground leading-relaxed">Select from our collection of professional, ATS-friendly templates designed by career experts</p>
              </div>
              
              <div className="text-center group animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Bot className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-bold shadow-md">
                    2
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">Add your information</h3>
                <p className="text-muted-foreground leading-relaxed">Fill in your details or let our AI assistant help you optimize your content for maximum impact</p>
              </div>
              
              <div className="text-center group animate-fade-in" style={{ animationDelay: "0.6s" }}>
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-md">
                    3
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors">Download and apply</h3>
                <p className="text-muted-foreground leading-relaxed">Download your perfect resume in PDF format and start applying to jobs with confidence</p>
              </div>
            </div>
          </div>
        </section>
        
        <Legal />
      </main>
      <Footer />
    </div>
  );
}
