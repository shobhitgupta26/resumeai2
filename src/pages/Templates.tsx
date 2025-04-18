import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Eye, Star, Edit, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import ResumePreview from "@/components/ResumePreview";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const templatesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid", "preview", "edit"

  const templates = [
    {
      name: "Professional",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600",
      popular: true,
      description: "A clean, professional template that highlights your experience and skills.",
      prefilledData: {
        personalInfo: {
          name: "Michael Anderson",
          title: "Senior Product Manager",
          email: "m.anderson@example.com",
          phone: "(555) 123-4567",
          website: "michaelanderson.com",
          summary: "Results-driven Product Manager with 8+ years of experience in tech. Proven track record of launching successful products and driving user growth."
        },
        experience: [
          {
            company: "Tech Solutions Inc.",
            position: "Senior Product Manager",
            startDate: "2020-01",
            endDate: "",
            current: true,
            description: "Led cross-functional teams to deliver enterprise software solutions. Increased user engagement by 45% through data-driven improvements."
          },
          {
            company: "Innovation Labs",
            position: "Product Manager",
            startDate: "2017-03",
            endDate: "2019-12",
            current: false,
            description: "Managed the development and launch of mobile applications, resulting in 2M+ downloads and 4.8 star rating."
          }
        ],
        education: [
          {
            institution: "Stanford University",
            degree: "Master of Business Administration",
            field: "Product Management",
            startDate: "2015-09",
            endDate: "2017-06",
            description: "Focus on Product Strategy and Innovation"
          }
        ],
        skills: ["Product Strategy", "Agile/Scrum", "User Research", "Data Analytics", "Stakeholder Management", "Product Roadmapping"],
        certifications: [
          {
            name: "Professional Scrum Product Owner",
            url: "https://www.scrum.org/certificates/12345"
          }
        ]
      }
    },
    {
      name: "Modern",
      image: "https://images.unsplash.com/photo-1516383740770-fbcc5ccbece0?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "A contemporary design with a clean layout and bold typography.",
      prefilledData: {
        personalInfo: {
          name: "Sarah Chen",
          title: "UX/UI Designer",
          email: "sarah.chen@example.com",
          phone: "(555) 987-6543",
          website: "sarahchen.design",
          summary: "Creative UX/UI Designer passionate about crafting intuitive digital experiences. Combining design thinking with user-centered approaches to create impactful solutions."
        },
        experience: [
          {
            company: "Design Forward Agency",
            position: "Senior UX Designer",
            startDate: "2021-06",
            endDate: "",
            current: true,
            description: "Lead designer for major client projects, implementing design systems and improving user experiences across web and mobile platforms."
          },
          {
            company: "Creative Digital Studio",
            position: "UI Designer",
            startDate: "2019-03",
            endDate: "2021-05",
            current: false,
            description: "Created visually stunning interfaces for startups and established brands, focusing on accessibility and user engagement."
          }
        ],
        education: [
          {
            institution: "Rhode Island School of Design",
            degree: "Bachelor of Fine Arts",
            field: "Graphic Design",
            startDate: "2015-09",
            endDate: "2019-05",
            description: "Focus on Digital Design and Typography"
          }
        ],
        skills: ["UI Design", "User Research", "Figma", "Adobe Creative Suite", "Prototyping", "Design Systems"],
        certifications: [
          {
            name: "Google UX Design Certificate",
            url: "https://www.coursera.org/certificates/67890"
          }
        ]
      }
    },
    {
      name: "Creative",
      image: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "Stand out with this creative template that shows your personality.",
      prefilledData: {
        personalInfo: {
          name: "Alex Rivera",
          title: "Art Director & Visual Designer",
          email: "alex@rivera.design",
          phone: "(555) 234-5678",
          website: "riveradesign.co",
          summary: "Award-winning Art Director with a passion for bold, innovative design. Specialized in branding and creative direction for digital and print media."
        },
        experience: [
          {
            company: "Creative Minds Studio",
            position: "Art Director",
            startDate: "2020-03",
            endDate: "",
            current: true,
            description: "Direct creative vision for major brand campaigns. Led team of designers in developing award-winning visual content."
          },
          {
            company: "Digital Arts Co",
            position: "Senior Designer",
            startDate: "2018-01",
            endDate: "2020-02",
            current: false,
            description: "Created compelling visual narratives for diverse client portfolio. Specialized in motion graphics and interactive design."
          }
        ],
        education: [
          {
            institution: "Parsons School of Design",
            degree: "Bachelor of Fine Arts",
            field: "Communication Design",
            startDate: "2014-09",
            endDate: "2018-05",
            description: "Focus on Typography and Motion Design"
          }
        ],
        skills: ["Art Direction", "Brand Design", "Motion Graphics", "Typography", "Creative Strategy", "Team Leadership"],
        certifications: [
          {
            name: "Adobe Certified Expert",
            url: "https://adobe.com/certificates/56789"
          }
        ]
      }
    },
    {
      name: "Executive",
      image: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&q=80&w=600",
      popular: true,
      description: "Perfect for senior professionals and executives with extensive experience.",
      prefilledData: {
        personalInfo: {
          name: "Patricia Thompson",
          title: "Chief Financial Officer",
          email: "p.thompson@example.com",
          phone: "(555) 345-6789",
          website: "linkedin.com/in/pthompson",
          summary: "Strategic CFO with 15+ years of experience in financial leadership. Expert in driving organizational growth, optimizing operations, and maximizing shareholder value."
        },
        experience: [
          {
            company: "Global Enterprises Inc.",
            position: "Chief Financial Officer",
            startDate: "2019-01",
            endDate: "",
            current: true,
            description: "Oversee financial operations of $500M company. Led successful merger resulting in 30% revenue growth."
          },
          {
            company: "Investment Corp",
            position: "VP of Finance",
            startDate: "2015-06",
            endDate: "2018-12",
            current: false,
            description: "Managed $200M investment portfolio. Implemented cost-saving initiatives resulting in $5M annual savings."
          }
        ],
        education: [
          {
            institution: "Harvard Business School",
            degree: "Master of Business Administration",
            field: "Finance",
            startDate: "2013-09",
            endDate: "2015-05",
            description: "Beta Gamma Sigma Honor Society"
          }
        ],
        skills: ["Financial Strategy", "M&A", "Risk Management", "Corporate Finance", "Strategic Planning", "Board Relations"],
        certifications: [
          {
            name: "Chartered Financial Analyst (CFA)",
            url: "https://www.cfainstitute.org/cfa/34567"
          }
        ]
      }
    },
    {
      name: "Minimalist",
      image: "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "A clean, minimal design that lets your content speak for itself.",
      prefilledData: {
        personalInfo: {
          name: "David Park",
          title: "Software Engineer",
          email: "david.park@example.com",
          phone: "(555) 456-7890",
          website: "davidpark.dev",
          summary: "Full-stack developer with expertise in modern web technologies. Passionate about clean code and scalable architecture."
        },
        experience: [
          {
            company: "Tech Innovators",
            position: "Senior Software Engineer",
            startDate: "2021-03",
            endDate: "",
            current: true,
            description: "Lead developer for cloud-based applications. Implemented microservices architecture improving system reliability by 40%."
          },
          {
            company: "StartUp Labs",
            position: "Software Engineer",
            startDate: "2019-06",
            endDate: "2021-02",
            current: false,
            description: "Developed and maintained multiple web applications using React and Node.js. Reduced page load time by 60%."
          }
        ],
        education: [
          {
            institution: "MIT",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startDate: "2015-09",
            endDate: "2019-05",
            description: "Focus on Software Engineering and Algorithms"
          }
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "System Design"],
        certifications: [
          {
            name: "AWS Certified Solutions Architect",
            url: "https://aws.amazon.com/certificates/89012"
          }
        ]
      }
    },
    {
      name: "Technical",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80&w=600",
      popular: false,
      description: "Ideal for technical roles with sections for projects and skills.",
      prefilledData: {
        personalInfo: {
          name: "Emily Zhang",
          title: "Machine Learning Engineer",
          email: "emily.zhang@example.com",
          phone: "(555) 567-8901",
          website: "emilyzhang.ai",
          summary: "ML Engineer specializing in computer vision and deep learning. Experience in developing and deploying production-ready AI models."
        },
        experience: [
          {
            company: "AI Solutions Ltd",
            position: "Senior ML Engineer",
            startDate: "2020-08",
            endDate: "",
            current: true,
            description: "Lead development of computer vision models for autonomous systems. Achieved 95% accuracy in object detection systems."
          },
          {
            company: "Data Science Corp",
            position: "ML Engineer",
            startDate: "2018-05",
            endDate: "2020-07",
            current: false,
            description: "Developed NLP models for text classification and sentiment analysis. Reduced model training time by 60%."
          }
        ],
        education: [
          {
            institution: "UC Berkeley",
            degree: "Master of Science",
            field: "Computer Science",
            startDate: "2016-09",
            endDate: "2018-05",
            description: "Specialization in Machine Learning and AI"
          }
        ],
        skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "Deep Learning", "MLOps"],
        certifications: [
          {
            name: "Google TensorFlow Certificate",
            url: "https://tensorflow.org/certificates/45678"
          }
        ]
      }
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

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setViewMode("preview");
    window.scrollTo(0, 0);
  };

  const handleEditTemplate = () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to edit this resume",
      });
      navigate("/sign-up");
      return;
    }

    if (selectedTemplate) {
      setViewMode("edit");
      window.scrollTo(0, 0);
    }
  };

  const handleUseTemplate = () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use this template",
      });
      navigate("/sign-up");
      return;
    }
    
    if (selectedTemplate) {
      sessionStorage.setItem("selectedTemplate", JSON.stringify(selectedTemplate.prefilledData));
      navigate("/builder");
    }
  };

  const handleBackToTemplates = () => {
    setViewMode("grid");
    setSelectedTemplate(null);
  };

  return (
    <div ref={templatesRef} className="min-h-screen flex flex-col dark:bg-gradient-to-b dark:from-background dark:via-background/80 dark:to-background">
      <Navbar />
      <main className="flex-1 pt-20">
        {viewMode === "grid" && (
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
                            onClick={() => handlePreview(template)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Preview
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
        )}

        {viewMode === "preview" && selectedTemplate && (
          <section className="py-12">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-8">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToTemplates}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Templates
                </Button>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleUseTemplate}
                  >
                    Use This Template
                  </Button>
                  <Button 
                    onClick={handleEditTemplate}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Now
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-2">{selectedTemplate.name}</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl text-center">{selectedTemplate.description}</p>
                
                <div className="w-full max-w-[800px] mx-auto border rounded-lg shadow-lg overflow-hidden bg-white">
                  <ResumePreview data={selectedTemplate.prefilledData} />
                </div>
              </div>
            </div>
          </section>
        )}

        {viewMode === "edit" && selectedTemplate && (
          <section className="py-8">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-8">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToTemplates}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Templates
                </Button>
                <Button 
                  onClick={() => {
                    sessionStorage.setItem("selectedTemplate", JSON.stringify(selectedTemplate.prefilledData));
                    navigate("/builder");
                  }}
                >
                  Continue in Full Editor
                </Button>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-6">Edit Your Resume</h2>
                
                <div className="w-full max-w-[800px] mx-auto border rounded-lg shadow-lg overflow-hidden bg-white">
                  <DirectEditResume 
                    template={selectedTemplate} 
                    onSave={(updatedData) => {
                      const updatedTemplate = {
                        ...selectedTemplate,
                        prefilledData: updatedData
                      };
                      setSelectedTemplate(updatedTemplate);
                    }} 
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
