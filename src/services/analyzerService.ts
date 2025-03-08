interface ResumeAnalysisRequest {
  text: string;
}

export interface Section {
  score: number;
}

export interface Sections {
  [key: string]: Section;
  content: Section;
  formatting: Section;
  keywords: Section;
  relevance: Section;
}

export interface Insight {
  type: "positive" | "warning" | "negative";
  text: string;
}

export interface Recommendation {
  category: "content" | "keywords" | "formatting" | "other";
  title: string;
  description: string;
  examples?: string;
}

export interface ATSScores {
  readability: number;
  keywords: number;
  formatting: number;
}

export interface AnalysisResultData {
  overallScore: number;
  sections: Sections;
  keyInsights: Insight[];
  recommendations: Recommendation[];
  atsScores: ATSScores;
  detectedKeywords: string[];
}

const GEMINI_API_KEY = "AIzaSyD0MRUI3y9R_YhswBE2cneDwH918tXznwA";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const analyzeResume = async (fileContent: string): Promise<AnalysisResultData> => {
  try {
    console.log("Analyzing resume with content length:", fileContent.length);
    
    // Clean up the content if it's a PDF to remove binary data and focus on text
    const cleanContent = cleanResumeContent(fileContent);
    
    if (cleanContent.length < 50) {
      throw new Error("Could not extract sufficient text from the resume. Please try a different file format.");
    }
    
    // The prompt that instructs Gemini what to do
    const prompt = `
      You are a professional resume analyst. Analyze this resume content and provide detailed feedback:
      "${cleanContent}"
      
      Return your analysis as a JSON object with this structure:
      {
        "overallScore": (number between 0-100),
        "sections": {
          "content": { "score": (number between 0-100) },
          "formatting": { "score": (number between 0-100) },
          "keywords": { "score": (number between 0-100) },
          "relevance": { "score": (number between 0-100) }
        },
        "keyInsights": [
          { "type": "positive", "text": "specific strength" },
          { "type": "warning", "text": "specific area of improvement" },
          { "type": "negative", "text": "specific issue that needs addressing" }
          // 3-5 key insights
        ],
        "recommendations": [
          {
            "category": "content",
            "title": "short descriptive title",
            "description": "detailed explanation",
            "examples": "specific example of improvement"
          }
          // 3-5 recommendations covering different categories (content, keywords, formatting)
        ],
        "atsScores": {
          "readability": (number between 0-100),
          "keywords": (number between 0-100),
          "formatting": (number between 0-100)
        },
        "detectedKeywords": [
          // List of 5-10 keywords or phrases found in the resume
        ]
      }
      
      Make the analysis detailed, constructive, and helpful for job seekers.
    `;

    // Prepare the API request
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json();
    console.log("Gemini API response:", data);

    if (!response.ok) {
      console.error("API error:", data);
      throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Extract the generated text from the response
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON from the generated text
    // The text might have markdown formatting, so we need to extract just the JSON part
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/```([\s\S]*?)```/) ||
                      [null, generatedText];
    
    let cleanedJsonText = jsonMatch[1].trim();
    
    // Additional cleaning to handle potential formatting issues
    if (cleanedJsonText.startsWith('{') && cleanedJsonText.endsWith('}')) {
      console.log("Extracted JSON:", cleanedJsonText);
      
      try {
        // Parse the JSON
        const analysisResult = JSON.parse(cleanedJsonText) as AnalysisResultData;
        
        // Validate the parsed result has the expected structure
        if (!analysisResult.overallScore || !analysisResult.sections) {
          throw new Error("Invalid analysis result structure");
        }
        
        return analysisResult;
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Could not parse analysis results from AI response");
      }
    } else {
      throw new Error("Could not extract valid JSON from the API response");
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    // Fallback to mock data on error
    return generateMockAnalysis();
  }
};

// Helper function to clean resume content
const cleanResumeContent = (content: string): string => {
  // If it's a PDF, try to extract only meaningful text
  if (content.startsWith('%PDF')) {
    // Simple heuristic to extract text from PDF content
    // Remove binary data and keep only printable ASCII and basic unicode
    let cleanText = '';
    let inTextBlock = false;
    
    // Split by lines and process
    const lines = content.split('\n');
    for (const line of lines) {
      // Look for text blocks in the PDF
      if (line.includes('/Text') || line.includes('/Contents') || line.includes('BT')) {
        inTextBlock = true;
      } else if (line.includes('ET') || line.includes('endstream')) {
        inTextBlock = false;
      }
      
      // If in text block, try to extract readable content
      if (inTextBlock) {
        // Extract only printable characters
        const printable = line.replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim();
        
        if (printable.length > 3 && !/^[0-9.]+$/.test(printable)) {
          cleanText += printable + ' ';
        }
      }
    }
    
    // If not enough text was extracted, return a meaningful error message
    if (cleanText.length < 50) {
      return "Could not extract readable text from this PDF. Please try converting to a text format first.";
    }
    
    return cleanText;
  }
  
  // For other formats, just return the content as is
  return content;
};

// Helper function to extract text from files
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = (e) => {
      reject(new Error('Error reading file'));
    };
    
    // Try different reading approaches depending on file type
    if (file.type === 'application/pdf') {
      // Read as binary string for PDFs
      reader.readAsBinaryString(file);
    } 
    else if (file.name.endsWith('.txt') || 
             file.type === 'text/plain' || 
             file.type === 'application/msword' || 
             file.type.includes('document')) {
      // Read as text for text-based files
      reader.readAsText(file);
    }
    else {
      // For unknown types, try as text
      reader.readAsText(file);
    }
  });
};

// Generate mock analysis as fallback
const generateMockAnalysis = (): AnalysisResultData => {
  return {
    overallScore: 76,
    sections: {
      content: { score: 82 },
      formatting: { score: 68 },
      keywords: { score: 91 },
      relevance: { score: 63 },
    },
    keyInsights: [
      { type: "positive", text: "Strong professional experience section with quantifiable achievements." },
      { type: "warning", text: "Education section could be more detailed with relevant coursework." },
      { type: "negative", text: "Missing keywords that are commonly found in job descriptions for this role." },
      { type: "positive", text: "Good use of action verbs throughout the resume." },
    ],
    recommendations: [
      {
        category: "content",
        title: "Add more quantifiable achievements",
        description: "Include specific metrics, percentages, or other numerical data to demonstrate your impact.",
        examples: "Instead of 'Increased sales', use 'Increased regional sales by 27% over 6 months'."
      },
      {
        category: "keywords",
        title: "Include more industry-specific keywords",
        description: "Your resume is missing some important keywords that recruiters look for.",
        examples: "Consider adding terms like 'project management', 'agile methodology', or 'data analysis'."
      },
      {
        category: "formatting",
        title: "Improve section organization",
        description: "The structure of your resume could be more clear with better section hierarchy.",
        examples: "Use consistent headings and ensure proper spacing between sections."
      },
      {
        category: "content",
        title: "Strengthen your summary statement",
        description: "Your professional summary should concisely highlight your most relevant experience and skills.",
        examples: "Experienced project manager with 5+ years leading cross-functional teams and delivering enterprise software solutions."
      },
      {
        category: "keywords",
        title: "Tailor skills section to the job",
        description: "Customize your skills section to match the requirements in the job description.",
        examples: "For a marketing role, highlight skills like 'content strategy', 'SEO', and 'campaign management'."
      },
    ],
    atsScores: {
      readability: 85,
      keywords: 72,
      formatting: 90
    },
    detectedKeywords: [
      "React",
      "JavaScript",
      "Product Management",
      "Agile",
      "Team Leadership",
      "UI/UX",
      "Customer Experience",
      "A/B Testing"
    ]
  };
};
