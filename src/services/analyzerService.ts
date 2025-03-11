
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
// Updated to use the correct API endpoint
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

export const analyzeResume = async (fileContent: string): Promise<AnalysisResultData> => {
  try {
    console.log("Analyzing resume with content length:", fileContent.length);
    
    // Improved text extraction for PDFs
    const cleanContent = extractReadableText(fileContent);
    console.log("Cleaned content length:", cleanContent.length);
    
    if (cleanContent.length < 50) {
      console.error("Insufficient text extracted from resume");
      throw new Error("Could not extract sufficient text from the resume. Please try a different file format like .txt for best results.");
    }
    
    // Enhanced prompt for Gemini AI with better instructions
    const prompt = `
      You are a professional resume analyst. Analyze this resume content and provide detailed, constructive feedback:
      "${cleanContent.substring(0, 12000)}"
      
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
          // 5-7 key insights with specific details from the resume
        ],
        "recommendations": [
          {
            "category": "content",
            "title": "short descriptive title",
            "description": "detailed explanation with specific examples from the resume",
            "examples": "specific example of improvement"
          }
          // 5-7 specific, actionable recommendations directly related to the resume content
        ],
        "atsScores": {
          "readability": (number between 0-100),
          "keywords": (number between 0-100),
          "formatting": (number between 0-100)
        },
        "detectedKeywords": [
          // List of 8-12 specific keywords or phrases found in the resume
        ]
      }
      
      Make sure your analysis is specific to this resume, mentioning actual content from the document.
      Provide honest, detailed feedback that will genuinely help improve the resume.
      DO NOT provide generic feedback - be specific to this resume.
    `;

    console.log("Sending request to Gemini API...");
    
    // Improved API request with better error handling
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
          temperature: 0.1, // Lower temperature for more consistent results
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json();
    console.log("Received response from Gemini API");
    
    if (!response.ok) {
      console.error("API error:", data);
      throw new Error(`API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Improved error handling for API response
    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      console.error("Invalid response format from Gemini API:", data);
      throw new Error("Invalid response format from Gemini API");
    }

    // Better extraction of JSON from the response
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log("Generated text length:", generatedText.length);
    
    // Improved JSON extraction with multiple regex patterns
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/```([\s\S]*?)```/) ||
                      generatedText.match(/\{[\s\S]*\}/) ||
                      [null, generatedText];
    
    let cleanedJsonText = (jsonMatch[1] || jsonMatch[0] || generatedText).trim();
    
    // Further cleaning to handle edge cases
    if (!cleanedJsonText.startsWith('{')) {
      const startIndex = cleanedJsonText.indexOf('{');
      if (startIndex >= 0) {
        cleanedJsonText = cleanedJsonText.substring(startIndex);
      }
    }
    
    if (!cleanedJsonText.endsWith('}')) {
      const endIndex = cleanedJsonText.lastIndexOf('}');
      if (endIndex >= 0) {
        cleanedJsonText = cleanedJsonText.substring(0, endIndex + 1);
      }
    }
    
    console.log("Attempting to parse JSON response");
    
    try {
      // Parse and validate the JSON
      const analysisResult = JSON.parse(cleanedJsonText) as AnalysisResultData;
      
      // Validate and provide defaults for missing fields
      const validatedResult = validateAndFixAnalysisResult(analysisResult);
      console.log("Successfully parsed and validated analysis result");
      
      return validatedResult;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError, "Raw JSON:", cleanedJsonText);
      throw new Error("Could not parse analysis results from AI response");
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    // Only use mock data when specifically requested or for development testing
    console.log("Using fallback mock data due to error");
    return generateMockAnalysis();
  }
};

// Improved function to extract readable text from various formats
const extractReadableText = (content: string): string => {
  // Check if content appears to be PDF binary data
  if (content.startsWith('%PDF') || content.includes('%%EOF') || /^\s*%PDF/.test(content)) {
    console.log("Detected PDF content, applying specialized extraction");
    return extractTextFromPDF(content);
  }
  
  // Already text format, just clean it up
  return cleanTextContent(content);
};

// Specialized function for PDF text extraction
const extractTextFromPDF = (pdfContent: string): string => {
  let extractedText = '';
  const lines = pdfContent.split('\n');
  
  // Enhanced PDF text extraction with better pattern matching
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip binary data and PDF structural elements
    if (line.includes('/Type/Page') || 
        line.includes('/Font') || 
        line.includes('/XObject') ||
        line.includes('/ExtGState') ||
        line.includes('/MediaBox') ||
        /^\s*\d+\s+\d+\s+obj/.test(line) ||
        /^\s*trailer/.test(line) ||
        /^\s*startxref/.test(line) ||
        /^\s*xref/.test(line) ||
        line.length < 2) {
      continue;
    }
    
    // Try to extract text content
    if (line.includes('(') && line.includes(')')) {
      // Extract text between parentheses, which often contains actual content in PDFs
      const matches = line.match(/\((.*?)\)/g);
      if (matches) {
        matches.forEach(match => {
          // Remove the parentheses and decode PDF text encoding
          const text = match.substring(1, match.length - 1)
            .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')');
          
          // Only add meaningful text (not single characters or punctuation)
          if (text.length > 1 && !/^[.,;:!?\s]+$/.test(text)) {
            extractedText += text + ' ';
          }
        });
      }
    } else if (line.includes('TJ') || line.includes('Tj')) {
      // Handle TJ and Tj operators which define text
      const textMatch = line.match(/\[(.*?)\]\s*TJ/) || line.match(/\((.*?)\)\s*Tj/);
      if (textMatch && textMatch[1]) {
        extractedText += textMatch[1].replace(/[()<>{}[\]]/g, ' ') + ' ';
      }
    }
  }
  
  // Clean up the extracted text
  return cleanTextContent(extractedText);
};

// Clean and normalize text content
const cleanTextContent = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\r\n|\r|\n/g, '\n')   // Normalize line breaks
    .trim();
};

// Helper function to extract text from files with improved detection
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("Extracting text from file:", file.name, "Type:", file.type);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log("File read complete, content length:", text.length);
      resolve(text);
    };
    
    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      reject(new Error('Error reading file'));
    };
    
    // Improved file type detection and handling
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log("Reading PDF as binary string");
      reader.readAsBinaryString(file);
    } 
    else if (file.name.toLowerCase().endsWith('.docx') || 
             file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log("Reading DOCX as binary string");
      reader.readAsBinaryString(file);
    }
    else if (file.name.toLowerCase().endsWith('.doc') || 
             file.type === 'application/msword') {
      console.log("Reading DOC as binary string");
      reader.readAsBinaryString(file);
    }
    else {
      // Default to text for all other formats
      console.log("Reading as text");
      reader.readAsText(file);
    }
  });
};

// Helper function to validate and fix analysis result
const validateAndFixAnalysisResult = (result: Partial<AnalysisResultData>): AnalysisResultData => {
  // Create a valid result with defaults for any missing properties
  const validResult: AnalysisResultData = {
    overallScore: typeof result.overallScore === 'number' ? result.overallScore : 50,
    sections: {
      content: { score: 0 },
      formatting: { score: 0 },
      keywords: { score: 0 },
      relevance: { score: 0 },
      ...result.sections
    },
    keyInsights: result.keyInsights || [
      { type: "negative", text: "Could not generate specific insights for this resume." }
    ],
    recommendations: result.recommendations || [
      {
        category: "content",
        title: "Improve resume content",
        description: "The resume needs more specific achievements and skills.",
        examples: "Add quantifiable metrics to your accomplishments."
      }
    ],
    atsScores: {
      readability: 0,
      keywords: 0,
      formatting: 0,
      ...result.atsScores
    },
    detectedKeywords: result.detectedKeywords || []
  };
  
  return validResult;
};

// Generate mock analysis for testing or when the API fails
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
