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

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  filename: string;
  overallScore: number;
  results: AnalysisResultData;
}

const GEMINI_API_KEY = "AIzaSyAEvHNa-fRhkLRnEyLHhR2Cp9t8memXYSg";
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent";

export const analyzeResume = async (fileContent: string): Promise<AnalysisResultData> => {
  try {
    console.log("Analyzing resume with content length:", fileContent.length);
    
    const cleanContent = extractReadableText(fileContent);
    console.log("Cleaned content length:", cleanContent.length);
    
    if (cleanContent.length < 50) {
      throw new Error("Could not extract sufficient text from the resume. Please try a different file format.");
    }
    
    const prompt = `
      Analyze this resume content and provide a detailed, creative, and personalized analysis. Be specific and reference actual content from the resume:

      "${cleanContent.substring(0, 12000)}"
      
      Provide a thorough analysis that includes:
      1. Overall assessment of the resume's effectiveness
      2. Specific strengths and weaknesses found in the actual content
      3. Detailed suggestions for improvement based on current industry standards
      4. Analysis of keyword optimization and ATS compatibility
      5. Formatting and presentation evaluation
      
      Format your response as a JSON object with this structure:
      {
        "overallScore": (calculated score 0-100 based on comprehensive analysis),
        "sections": {
          "content": {"score": (0-100)},
          "formatting": {"score": (0-100)},
          "keywords": {"score": (0-100)},
          "relevance": {"score": (0-100)}
        },
        "keyInsights": [
          {"type": "positive/warning/negative", "text": "specific insight referencing actual content"}
        ],
        "recommendations": [
          {
            "category": "content/keywords/formatting/other",
            "title": "specific action item",
            "description": "detailed explanation referencing actual resume content",
            "examples": "specific example from or for the resume"
          }
        ],
        "atsScores": {
          "readability": (0-100),
          "keywords": (0-100),
          "formatting": (0-100)
        },
        "detectedKeywords": [
          "actual keywords found in the resume"
        ]
      }

      IMPORTANT:
      - Reference specific content from the resume in your analysis
      - Do not use generic feedback
      - Be constructive but honest in your assessment
      - Provide actionable recommendations based on the actual content
    `;

    console.log("Sending request to Gemini API...");
    
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
          temperature: 0.7,
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

    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      console.error("Invalid response format from Gemini API:", data);
      throw new Error("Invalid response format from Gemini API");
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log("Generated text length:", generatedText.length);
    
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                      generatedText.match(/```([\s\S]*?)```/) ||
                      generatedText.match(/\{[\s\S]*\}/) ||
                      [null, generatedText];
    
    let cleanedJsonText = (jsonMatch[1] || jsonMatch[0] || generatedText).trim();
    
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
      const analysisResult = JSON.parse(cleanedJsonText) as AnalysisResultData;
      
      const validatedResult = validateAndFixAnalysisResult(analysisResult);
      console.log("Successfully parsed and validated analysis result");
      
      return validatedResult;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError, "Raw JSON:", cleanedJsonText);
      throw new Error("Could not parse analysis results from AI response");
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume: " + (error as Error).message);
  }
};

const extractReadableText = (content: string): string => {
  if (content.startsWith('%PDF') || content.includes('%%EOF') || /^\s*%PDF/.test(content)) {
    console.log("Detected PDF content, applying advanced extraction");
    return extractTextFromPDF(content);
  }
  
  return cleanTextContent(content);
};

// Simplified and improved PDF text extraction function
const extractTextFromPDF = (pdfContent: string): string => {
  let extractedText = '';
  
  try {
    // Find all text content from various PDF structures
    const allTextMatches = [];
    
    // Method 1: Find text within parentheses after "Tj" operators (most common text encoding)
    const tjMatches = pdfContent.matchAll(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)\s*Tj/g);
    for (const match of tjMatches) {
      if (match[1] && match[1].length > 1) {
        allTextMatches.push(match[1]);
      }
    }
    
    // Method 2: Find text within arrays with "TJ" operators (spacing-aware text)
    const tjArrayMatches = pdfContent.matchAll(/\[((?:[^[\]\\]|\\.|<[0-9A-Fa-f]+>)*)\]\s*TJ/g);
    for (const match of tjArrayMatches) {
      if (match[1]) {
        // Extract string parts from the TJ array
        const stringMatches = match[1].match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)/g) || [];
        for (const strMatch of stringMatches) {
          if (strMatch && strMatch.length > 2) { // Longer than just ()
            allTextMatches.push(strMatch.slice(1, -1));
          }
        }
      }
    }
    
    // Method 3: Find text within hex notation (usually used for non-ASCII text)
    const hexMatches = pdfContent.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g);
    for (const match of hexMatches) {
      if (match[1] && match[1].length > 0) {
        let text = '';
        for (let i = 0; i < match[1].length; i += 2) {
          if (i + 1 < match[1].length) {
            const charCode = parseInt(match[1].slice(i, i + 2), 16);
            if (charCode >= 32 && charCode <= 126) { // Printable ASCII
              text += String.fromCharCode(charCode);
            }
          }
        }
        if (text.length > 0) {
          allTextMatches.push(text);
        }
      }
    }
    
    // Method 4: More general search for text within parentheses
    const generalMatches = pdfContent.matchAll(/\(([^\\\(\)]{2,})\)/g);
    for (const match of generalMatches) {
      if (match[1] && match[1].length > 1 && /[a-zA-Z0-9]/.test(match[1])) {
        allTextMatches.push(match[1]);
      }
    }
    
    // Handle escaping and build the final text
    for (let textChunk of allTextMatches) {
      textChunk = textChunk
        .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      
      if (/[a-zA-Z0-9]/.test(textChunk)) {
        extractedText += textChunk + ' ';
      }
    }
    
    // Clean up and format
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/([a-z])-\s+([a-z])/gi, '$1$2')  // Fix hyphenated words
      .trim();
    
    // Additional cleaning for PDF artifacts
    extractedText = extractedText
      .replace(/\s*\b[A-Z][0-9]+\b\s*/g, ' ') // Remove font codes
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log("Extracted text length:", extractedText.length);
    
    if (extractedText.length < 50) {
      console.warn("PDF extraction produced little text, trying fallback method");
      
      // Fallback method: try to find any meaningful text
      const contentMatches = pdfContent.match(/stream[\r\n]([\s\S]*?)[\r\n]endstream/g) || [];
      let fallbackText = '';
      
      for (const streamMatch of contentMatches) {
        const streamContent = streamMatch.replace(/^stream[\r\n]|[\r\n]endstream$/g, '');
        const textFragments = streamContent.match(/[a-zA-Z0-9][a-zA-Z0-9 .\-,:;?!\n]{5,}/g) || [];
        
        for (const fragment of textFragments) {
          if (fragment.length > 10 && /[a-zA-Z]{3,}/.test(fragment)) {
            fallbackText += fragment + ' ';
          }
        }
      }
      
      if (fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
      }
    }
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    extractedText = "Failed to extract text from PDF. Please try a different file format.";
  }
  
  return cleanTextContent(extractedText);
};

const cleanTextContent = (text: string): string => {
  if (!text || text.length < 10) {
    return text;
  }
  
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\r/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\r\n|\r|\n/g, '\n')
    .trim();
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("Extracting text from file:", file.name, "Type:", file.type);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      console.log("File read complete, content length:", text.length);
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        console.log("Processing PDF content for extraction");
        const extractedText = extractReadableText(text);
        
        if (extractedText.length < 50) {
          console.warn("PDF extraction produced insufficient text:", extractedText.length);
        }
        
        resolve(extractedText);
      } else {
        resolve(text);
      }
    };
    
    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      reject(new Error('Error reading file'));
    };
    
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
      console.log("Reading as text");
      reader.readAsText(file);
    }
  });
};

const validateAndFixAnalysisResult = (result: Partial<AnalysisResultData>): AnalysisResultData => {
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
      { type: "negative", text: "Unable to generate specific insights. Please try uploading a different file format." }
    ],
    recommendations: result.recommendations || [
      {
        category: "content",
        title: "Unable to analyze resume content",
        description: "We couldn't properly analyze your resume. Try uploading a plain text (.txt) version for better results.",
        examples: "Convert your resume to plain text format to ensure all content is properly analyzed."
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

export const saveAnalysisToStorage = (analysis: AnalysisResultData, filename: string): SavedAnalysis => {
  const savedAnalyses = getSavedAnalyses();
  
  const newSavedAnalysis: SavedAnalysis = {
    id: generateId(),
    timestamp: Date.now(),
    filename,
    overallScore: analysis.overallScore,
    results: analysis
  };
  
  const updatedAnalyses = [newSavedAnalysis, ...savedAnalyses];
  localStorage.setItem('savedResumeAnalyses', JSON.stringify(updatedAnalyses));
  
  return newSavedAnalysis;
};

export const getSavedAnalyses = (): SavedAnalysis[] => {
  const savedAnalysesString = localStorage.getItem('savedResumeAnalyses');
  return savedAnalysesString ? JSON.parse(savedAnalysesString) : [];
};

export const deleteSavedAnalysis = (id: string): void => {
  const savedAnalyses = getSavedAnalyses();
  const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
  localStorage.setItem('savedResumeAnalyses', JSON.stringify(updatedAnalyses));
};

export const getSavedAnalysisById = (id: string): SavedAnalysis | null => {
  const savedAnalyses = getSavedAnalyses();
  return savedAnalyses.find(analysis => analysis.id === id) || null;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
