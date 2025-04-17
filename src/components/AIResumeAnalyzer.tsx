
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeResume } from "@/services/analyzerService";
import { AnalysisResultData } from "@/services/analyzerService";

interface AIResumeAnalyzerProps {
  resumeData: any;
  onAnalysisComplete: (results: AnalysisResultData) => void;
}

export default function AIResumeAnalyzer({ resumeData, onAnalysisComplete }: AIResumeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeResume = async () => {
    try {
      setIsAnalyzing(true);
      
      // Convert resume data to text format for analysis
      const resumeText = generateResumeText(resumeData);
      
      // Send to AI for analysis
      const analysisResults = await analyzeResume(resumeText);
      
      // Pass results back to parent
      onAnalysisComplete(analysisResults);
      
      toast({
        title: "Resume analyzed",
        description: "AI analysis complete. Review the suggestions to improve your resume.",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert resume data to a text format suitable for AI analysis
  const generateResumeText = (data: any): string => {
    const personalInfo = data.personalInfo;
    let text = `Name: ${personalInfo.name || ''}\n`;
    text += `Title: ${personalInfo.title || ''}\n`;
    text += `Email: ${personalInfo.email || ''}\n`;
    text += `Phone: ${personalInfo.phone || ''}\n`;
    text += `Website: ${personalInfo.website || ''}\n\n`;
    text += `Summary:\n${personalInfo.summary || ''}\n\n`;
    
    text += `EXPERIENCE:\n`;
    data.experience.forEach((exp: any, index: number) => {
      if (exp.company || exp.position) {
        text += `${exp.position} at ${exp.company}\n`;
        text += `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}\n`;
        text += `${exp.description || ''}\n\n`;
      }
    });
    
    text += `EDUCATION:\n`;
    data.education.forEach((edu: any, index: number) => {
      if (edu.institution || edu.degree) {
        text += `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}\n`;
        text += `${edu.institution || ''}\n`;
        text += `${edu.startDate || ''} - ${edu.endDate || ''}\n`;
        text += `${edu.description || ''}\n\n`;
      }
    });
    
    text += `SKILLS:\n`;
    data.skills.filter((s: string) => s).forEach((skill: string) => {
      text += `- ${skill}\n`;
    });
    
    text += `\nCERTIFICATIONS:\n`;
    data.certifications.filter((c: any) => c.name || c.url).forEach((cert: any) => {
      text += `- ${cert.name || ''} ${cert.url ? `(${cert.url})` : ''}\n`;
    });
    
    return text;
  };

  return (
    <Button 
      onClick={handleAnalyzeResume} 
      disabled={isAnalyzing}
      variant="secondary"
      className="gap-2"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4" />
          Analyze Resume with AI
        </>
      )}
    </Button>
  );
}
