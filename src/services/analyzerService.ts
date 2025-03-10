import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAfyXnxzBm2H-Um6hy5ziDaofP8VRpdvnI");

export interface AnalysisResultData {
  overallScore: number;
  sections: {
    summary: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    education: { score: number; feedback: string };
    skills: { score: number; feedback: string };
  };
  keyInsights: Insight[];
  recommendations: Recommendation[];
  detectedKeywords: string[];
  atsScores: {
    readability: number;
    keywords: number;
    formatting: number;
  };
}

export interface Insight {
  type: "positive" | "warning" | "negative";
  text: string;
}

export interface Recommendation {
  category: "content" | "keywords" | "formatting" | "style";
  title: string;
  description: string;
  examples?: string;
}

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    if (file.type === "application/pdf") {
      console.warn("PDF detected. Simple text extraction may not work properly.");
    }

    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      if (text.includes("%PDF-")) {
        console.warn("PDF content detected, text extraction might be incomplete");
      }
      
      resolve(text);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
}

const mockAnalysisResult: AnalysisResultData = {
  overallScore: 65,
  sections: {
    summary: { score: 70, feedback: "Good summary, but could be more concise." },
    experience: { score: 60, feedback: "Experience section needs more quantifiable achievements." },
    education: { score: 80, feedback: "Education section is well-detailed." },
    skills: { score: 50, feedback: "Skills section needs more relevant keywords." },
  },
  keyInsights: [
    { type: "positive", text: "Strong educational background." },
    { type: "warning", text: "Needs more focus on quantifiable achievements." },
    { type: "negative", text: "Skills section lacks relevant industry keywords." },
    { type: "warning", text: "Resume could benefit from more quantifiable metrics." },
  ],
  recommendations: [
    {
      category: "content",
      title: "Quantify Achievements",
      description: "Add numbers and metrics to your experience section to showcase your impact.",
      examples: "Instead of 'Managed projects,' try 'Managed projects resulting in a 30% increase in efficiency.'"
    },
    {
      category: "keywords",
      title: "Optimize Skills Section",
      description: "Include industry-specific keywords in your skills section to improve ATS compatibility.",
      examples: "Add skills like 'SEO,' 'Data Analysis,' and 'Project Management.'"
    },
    {
      category: "formatting",
      title: "Improve Formatting",
      description: "Use a clean and professional format to make your resume easy to read.",
      examples: "Use bullet points, clear headings, and consistent font sizes."
    },
    {
      category: "style",
      title: "Be More Concise",
      description: "Keep your resume content brief and to the point.",
      examples: "Limit bullet points to 1-2 lines each and focus on your most relevant achievements."
    },
    {
      category: "content",
      title: "Highlight Technical Skills",
      description: "Emphasize technical skills that are relevant to your target position.",
      examples: "Include specific technologies, software, and methodologies you're proficient in."
    }
  ],
  detectedKeywords: ["Project Management", "Data Analysis", "SEO", "Leadership", "Communication", "Excel"],
  atsScores: {
    readability: 75,
    keywords: 60,
    formatting: 80,
  },
};

export async function analyzeResume(text: string): Promise<AnalysisResultData> {
  try {
    if (text.includes("%PDF-") || 
       (text.includes("obj") && text.includes("endobj") && text.includes("stream"))) {
      console.error("Cannot analyze PDF binary content");
      throw new Error("The file contains PDF binary data which cannot be analyzed. Please upload a text version of your resume.");
    }
    
    if (text.trim().length < 100) {
      console.error("Resume text is too short to analyze");
      throw new Error("The extracted text is too short to analyze. Please try a different file format or copy your resume text directly.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Analyze this resume text and provide detailed feedback in JSON format:
    ${text}

    Analyze the resume for these aspects:
    1. Overall impression
    2. Each section's strength (summary, experience, education, skills)
    3. Specific improvements needed
    4. Keyword optimization
    5. ATS compatibility
    6. Writing style and clarity

    Be extremely detailed in your feedback, especially in the recommendations section.
    Provide actionable advice that the person can implement right away.
    Include at least 5 detailed recommendations in different categories.
    Identify at least 4-6 key insights about the resume's strengths and weaknesses.
    Detect at least 5-8 keywords that are present in the resume.

    Return the analysis in this exact JSON format:
    {
      "overallScore": number,
      "sections": {
        "summary": { "score": number, "feedback": string },
        "experience": { "score": number, "feedback": string },
        "education": { "score": number, "feedback": string },
        "skills": { "score": number, "feedback": string }
      },
      "keyInsights": [
        { "type": "positive"|"warning"|"negative", "text": string }
      ],
      "recommendations": [
        {
          "category": "content"|"keywords"|"formatting"|"style",
          "title": string,
          "description": string,
          "examples": string
        }
      ],
      "detectedKeywords": string[],
      "atsScores": {
        "readability": number,
        "keywords": number,
        "formatting": number
      }
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    try {
      const analysis = JSON.parse(analysisText);
      return analysis;
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      throw new Error("Failed to parse analysis results");
    }
  } catch (error) {
    console.error("Error in analyzeResume:", error);
    
    const errorMessage = String(error);
    if (errorMessage.includes("429") || 
        errorMessage.includes("quota") || 
        errorMessage.includes("Resource has been exhausted")) {
      throw new Error("API quota exceeded. Please try again later or use a different API key.");
    }
    
    throw error;
  }
}

export function getMockAnalysisResult(): AnalysisResultData {
  return mockAnalysisResult;
}
