
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Download, FileText, GraduationCap, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DirectEditResume from "@/components/DirectEditResume";

export default function Templates() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and professional design with a touch of color",
      previewImageUrl: "/placeholder.svg",
      prefilledData: {
        personalInfo: {
          name: "Alex Johnson",
          title: "Senior Frontend Developer",
          email: "alex.johnson@example.com",
          phone: "(555) 123-4567",
          website: "alexjohnson.dev",
          summary: "Experienced frontend developer with 5+ years creating responsive, user-friendly web applications. Specialized in React, TypeScript, and modern CSS frameworks.",
        },
        experience: [
          {
            company: "Tech Solutions Inc.",
            position: "Senior Frontend Developer",
            startDate: "2021-03-01",
            endDate: "",
            current: true,
            description: "Lead frontend development for multiple client projects, implementing responsive designs and optimizing performance. Mentored junior developers and introduced best practices.",
          },
          {
            company: "WebDev Studio",
            position: "Frontend Developer",
            startDate: "2018-06-01",
            endDate: "2021-02-28",
            current: false,
            description: "Developed and maintained client websites using React, Redux, and CSS-in-JS. Collaborated with design team to implement pixel-perfect UIs.",
          }
        ],
        education: [
          {
            institution: "University of Technology",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startDate: "2014-09-01",
            endDate: "2018-05-01",
            description: "Graduated with honors. Specialized in web technologies and user experience design.",
          }
        ],
        skills: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Redux", "Tailwind CSS", "Responsive Design", "Git", "Jest", "Cypress"],
        certifications: [
          {
            name: "AWS Certified Developer",
            url: "https://aws.amazon.com/certification/certified-developer-associate/"
          },
          {
            name: "Meta Frontend Developer Professional Certificate",
            url: "https://www.coursera.org/professional-certificates/meta-front-end-developer"
          }
        ],
      }
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple and elegant design that puts content first",
      previewImageUrl: "/placeholder.svg",
      prefilledData: {
        personalInfo: {
          name: "Morgan Smith",
          title: "UX/UI Designer",
          email: "morgan.smith@example.com",
          phone: "(555) 987-6543",
          website: "morgandesigns.co",
          summary: "Creative UX/UI designer with a passion for creating intuitive, accessible, and beautiful digital experiences. Proficient in user research, wireframing, and prototyping.",
        },
        experience: [
          {
            company: "DesignHub Agency",
            position: "Senior UX/UI Designer",
            startDate: "2020-01-15",
            endDate: "",
            current: true,
            description: "Lead design processes for enterprise clients, creating wireframes, prototypes, and final designs. Conducted user research and usability testing to improve product experiences.",
          },
          {
            company: "Creative Solutions",
            position: "UI Designer",
            startDate: "2017-08-01",
            endDate: "2019-12-31",
            current: false,
            description: "Designed user interfaces for web and mobile applications. Collaborated with developers to ensure design implementation matched specifications.",
          }
        ],
        education: [
          {
            institution: "Design Institute",
            degree: "Bachelor of Arts",
            field: "Interaction Design",
            startDate: "2013-09-01",
            endDate: "2017-06-30",
            description: "Focused on user experience, interaction design, and visual communication. Graduated with distinction.",
          }
        ],
        skills: ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "UI Design", "Visual Design", "Design Systems", "Accessibility", "User Testing"],
        certifications: [
          {
            name: "Google UX Design Professional Certificate",
            url: "https://www.coursera.org/professional-certificates/google-ux-design"
          },
          {
            name: "Certified Usability Analyst",
            url: "https://www.humanfactors.com/certification/"
          }
        ],
      }
    },
    {
      id: "professional",
      name: "Professional",
      description: "Traditional format ideal for corporate environments",
      previewImageUrl: "/placeholder.svg",
      prefilledData: {
        personalInfo: {
          name: "Taylor Wilson",
          title: "Marketing Manager",
          email: "taylor.wilson@example.com",
          phone: "(555) 456-7890",
          website: "taylorwilson.marketing",
          summary: "Results-driven marketing professional with expertise in digital marketing strategies, brand development, and campaign management. Proven track record of increasing conversion rates and brand awareness.",
        },
        experience: [
          {
            company: "Global Marketing Inc.",
            position: "Marketing Manager",
            startDate: "2019-05-01",
            endDate: "",
            current: true,
            description: "Oversee digital marketing campaigns for technology clients with budgets exceeding $500,000. Implemented data-driven strategies resulting in 35% increase in lead generation.",
          },
          {
            company: "Brand Solutions",
            position: "Marketing Specialist",
            startDate: "2016-06-01",
            endDate: "2019-04-30",
            current: false,
            description: "Managed social media accounts and email marketing campaigns. Increased engagement by 42% through targeted content strategies.",
          }
        ],
        education: [
          {
            institution: "Business University",
            degree: "Bachelor of Business Administration",
            field: "Marketing",
            startDate: "2012-09-01",
            endDate: "2016-05-30",
            description: "Graduated magna cum laude. Active member of Marketing Association and Digital Media Club.",
          }
        ],
        skills: ["Digital Marketing", "SEO/SEM", "Content Strategy", "Social Media Marketing", "Email Campaigns", "Analytics", "A/B Testing", "Brand Development", "Market Research", "CRM"],
        certifications: [
          {
            name: "HubSpot Marketing Certification",
            url: "https://academy.hubspot.com/certification"
          },
          {
            name: "Google Analytics Certification",
            url: "https://analytics.google.com/analytics/academy/"
          }
        ],
      }
    }
  ];

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleUseTemplate = () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use this template",
      });
      navigate("/sign-in");
      return;
    }

    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    if (selectedTemplateData) {
      sessionStorage.setItem("selectedTemplate", JSON.stringify(selectedTemplateData.prefilledData));
      navigate("/builder");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Resume Templates</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from professionally designed templates to kickstart your resume
            </p>
          </div>

          <Tabs defaultValue="modern" value={selectedTemplate} onValueChange={handleSelectTemplate} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8 max-w-md mx-auto">
              <TabsTrigger value="modern">Modern</TabsTrigger>
              <TabsTrigger value="minimal">Minimal</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
            </TabsList>

            {templates.map((template) => (
              <TabsContent key={template.id} value={template.id}>
                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-8 lg:col-span-9">
                    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                      <div className="p-1 max-h-[800px] overflow-y-auto">
                        <DirectEditResume 
                          template={templates.find(t => t.id === template.id)} 
                          onSave={() => {}}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-4 lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Professional header</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Clear content sections</span>
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Work experience focus</span>
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Education highlight</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col space-y-2">
                        <Button 
                          className="w-full" 
                          onClick={handleUseTemplate}
                        >
                          Use This Template
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "Coming soon",
                              description: "This feature will be available soon",
                            });
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Example
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
