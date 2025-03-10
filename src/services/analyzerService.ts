
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

    reader.onload = (event) => {
      const text = event.target?.result as string;
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
    }
  ],
  detectedKeywords: ["Project Management", "Data Analysis", "SEO"],
  atsScores: {
    readability: 75,
    keywords: 60,
    formatting: 80,
  },
};

export async function analyzeResume(text: string): Promise<AnalysisResultData> {
  try {
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
    throw error;
  }
}

export function getMockAnalysisResult(): AnalysisResultData {
  return mockAnalysisResult;
}
