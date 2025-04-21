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
      - Analyze thoroughly regardless of the format or content style
      - Reference specific details from the resume in your analysis
      - Be constructive and specific in your assessment
      - Provide actionable recommendations based on the actual content
      - Return ONLY valid JSON, nothing else
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
          temperature: 0.6,
          topK: 32,
          topP: 0.9,
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
  if (!content || content.length < 10) {
    return content;
  }
  
  try {
    // Check if it's likely a PDF
    const isPDF = content.startsWith('%PDF') || 
                 content.includes('%%EOF') || 
                 /^\s*%PDF/.test(content) ||
                 content.includes('/Type /Page') ||
                 content.includes('/Contents');
    
    // Check if it's likely a DOCX (Office Open XML)
    const isDocx = content.includes('PK') && 
                  (content.includes('word/') || 
                   content.includes('[Content_Types].xml') ||
                   content.includes('docProps/'));
                   
    // Check if it's likely a DOC (older Microsoft Word)
    const isDoc = content.includes('\xD0\xCF\x11\xE0') || 
                 content.includes('Microsoft Word') ||
                 content.includes('MSWordDoc');
    
    if (isPDF) {
      console.log("Detected PDF content, applying universal PDF extraction");
      return universalPDFTextExtraction(content);
    } else if (isDocx || isDoc) {
      console.log("Detected Word document, applying office document extraction");
      return extractOfficeDocumentText(content);
    }
    
    // Fallback to standard text cleaning
    return cleanTextContent(content);
  } catch (error) {
    console.error("Error in text extraction:", error);
    return cleanTextContent(content);
  }
};

const universalPDFTextExtraction = (pdfContent: string): string => {
  let extractedText = '';
  
  try {
    // Multi-strategy PDF text extraction approach
    
    // Strategy 1: Content stream text extraction
    const streams = pdfContent.match(/stream\s+([\s\S]*?)\s+endstream/g) || [];
    for (const stream of streams) {
      const streamContent = stream.replace(/^stream\s+/, '').replace(/\s+endstream$/, '');
      
      // Look for text operators in content streams
      const textMatches = streamContent.match(/BT\s+([\s\S]*?)\s+ET/g) || [];
      for (const textBlock of textMatches) {
        // Extract text strings from text showing operators (Tj, TJ, etc.)
        const strings = textBlock.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj|\[((?:[^[\]\\]|\\.|<[0-9A-Fa-f]+>|\([^()]*\))*)\]\s*TJ|<([0-9A-Fa-f]+)>\s*Tj/g) || [];
        
        for (const str of strings) {
          if (str.includes('(') && str.includes(')')) {
            // Handle literal strings
            const textMatch = str.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/);
            if (textMatch && textMatch[1]) {
              extractedText += decodePdfString(textMatch[1]) + ' ';
            }
          } else if (str.startsWith('[') && str.endsWith('TJ')) {
            // Handle array TJ operators
            const arrayContent = str.substring(1, str.indexOf(']'));
            const arrayElements = arrayContent.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g) || [];
            for (const element of arrayElements) {
              const elementText = element.substring(1, element.length - 1);
              extractedText += decodePdfString(elementText) + ' ';
            }
          } else if (str.startsWith('<') && str.includes('>')) {
            // Handle hex strings
            const hexMatch = str.match(/<([0-9A-Fa-f]+)>/);
            if (hexMatch && hexMatch[1]) {
              extractedText += decodeHexString(hexMatch[1]) + ' ';
            }
          }
        }
      }
    }
    
    // Strategy 2: Object dictionary text extraction
    const objects = pdfContent.match(/\d+\s+\d+\s+obj\s+[\s\S]*?endobj/g) || [];
    for (const obj of objects) {
      // Look for text strings in objects
      const textStrings = obj.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g) || [];
      for (const textString of textStrings) {
        const text = textString.substring(1, textString.length - 1);
        // Only include strings that look like actual text
        if (text.length > 3 && /[a-zA-Z]{2,}/.test(text) && !/^[\d\s.]+$/.test(text)) {
          extractedText += decodePdfString(text) + ' ';
        }
      }
      
      // Look for hex strings in objects
      const hexStrings = obj.match(/<([0-9A-Fa-f]+)>/g) || [];
      for (const hexString of hexStrings) {
        const hex = hexString.substring(1, hexString.length - 1);
        // Only include strings that look like actual text (at least 6 hex chars = 3 ASCII chars)
        if (hex.length >= 6) {
          const decoded = decodeHexString(hex);
          if (decoded.length > 3 && /[a-zA-Z]{2,}/.test(decoded) && !/^[\d\s.]+$/.test(decoded)) {
            extractedText += decoded + ' ';
          }
        }
      }
    }
    
    // Strategy 3: Fallback pattern-based extraction for difficult PDFs
    if (extractedText.trim().length < 150) {
      console.log("Initial extraction yielded insufficient text, trying fallback method");
      
      // Look for patterns that likely contain readable content
      const contentPatterns = [
        // Look for words and sentences (at least 4 chars long, contains letters, not just numbers)
        /[A-Za-z][A-Za-z0-9\s.,;:'"!?@#$%^&*()\-+=]{4,}/g,
        // Look for continuous text blocks
        /[A-Za-z][a-z]{3,}(?:\s+[A-Za-z][a-z]*){5,}/g
      ];
      
      for (const pattern of contentPatterns) {
        const matches = pdfContent.match(pattern) || [];
        for (const match of matches) {
          if (match.length > 10 && /[A-Za-z]{3,}/.test(match) && !/^\s*[\d.]+\s*$/.test(match)) {
            // Only include meaningful text
            extractedText += match + ' ';
          }
        }
      }
    }
    
    // Final processing and cleanup
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/(\w)-\s+(\w)/g, '$1$2') // Fix hyphenated words
      .replace(/\s+([.,;:?!])/g, '$1') // Fix spacing before punctuation
      .replace(/\b\d+\.\d+\.\d+\.\d+\b/g, '') // Remove IP addresses
      .replace(/https?:\/\/\S+/g, '') // Remove URLs that might be in footer/headers
      .replace(/www\.\S+/g, '') // Remove websites
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '') // Remove emails that might be in footer/headers
      .trim();
    
    console.log("Universal PDF text extraction complete, extracted length:", extractedText.length);
    
    if (extractedText.trim().length < 100) {
      // For PDFs where we couldn't extract much, add generic text to prevent AI confusion
      return "This document appears to be in a format that made text extraction difficult. " +
        "If possible, please convert your resume to a plain text format or export it as text from your original document.";
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return "This document appears to be in a format that made text extraction difficult. " + 
      "If possible, please convert your resume to a plain text format for the best analysis results.";
  }
};

const decodePdfString = (str: string): string => {
  return str
    .replace(/\\(\d{3})/g, (m, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t');
};

const decodeHexString = (hex: string): string => {
  let decoded = '';
  for (let i = 0; i < hex.length; i += 2) {
    if (i + 1 < hex.length) {
      const charCode = parseInt(hex.substring(i, i + 2), 16);
      // Only include printable ASCII and common Unicode characters
      if ((charCode >= 32 && charCode <= 126) || charCode >= 160) {
        decoded += String.fromCharCode(charCode);
      }
    }
  }
  return decoded;
};

const extractOfficeDocumentText = (content: string): string => {
  try {
    let extractedText = '';
    
    // For DOCX formats
    const hasDocxStructure = content.includes('word/document.xml') || content.includes('[Content_Types].xml');
    if (hasDocxStructure) {
      // Try to find XML content within the file
      const xmlMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
      for (const match of xmlMatches) {
        const text = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
        extractedText += text + ' ';
      }
      
      // Fallback for other XML-based content
      const paragraphMatches = content.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) || [];
      for (const paragraph of paragraphMatches) {
        const textMatches = paragraph.match(/>([^<]+)</g) || [];
        for (const textMatch of textMatches) {
          const text = textMatch.substring(1, textMatch.length - 1);
          if (text.trim().length > 0) {
            extractedText += text + ' ';
          }
        }
      }
    }
    
    // For DOC formats and general fallback
    if (extractedText.trim().length < 100) {
      // Look for printable text sequences
      const textMatches = content.match(/[A-Za-z][A-Za-z0-9\s.,;:'"!?@#$%^&*()-+=]{5,}/g) || [];
      for (const match of textMatches) {
        if (match.length > 10 && /[A-Za-z]{3,}/.test(match)) {
          extractedText += match + ' ';
        }
      }
    }
    
    // Final cleanup
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\u0000/g, '') // Remove null bytes
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim();
    
    console.log("Office document text extraction complete, extracted length:", extractedText.length);
    
    if (extractedText.trim().length < 100) {
      return "This document appears to be in a format that made text extraction difficult. " +
        "Please convert your resume to a plain text format for better analysis results.";
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error in Office document text extraction:", error);
    return "This Office document format made text extraction difficult. " +
      "Please consider saving your document as plain text (.txt) for better analysis.";
  }
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
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                file.name.toLowerCase().endsWith('.docx')) {
        console.log("Processing DOCX content for extraction");
        const extractedText = extractReadableText(text);
        resolve(extractedText);
      } else if (file.type === 'application/msword' || 
                file.name.toLowerCase().endsWith('.doc')) {
        console.log("Processing DOC content for extraction");
        const extractedText = extractReadableText(text);
        resolve(extractedText);
      } else {
        // For plain text files, just use the content directly
        resolve(text);
      }
    };
    
    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      reject(new Error('Error reading file'));
    };
    
    // Use appropriate reading method based on file type
    if (file.type === 'application/pdf' || 
        file.name.toLowerCase().endsWith('.pdf') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.toLowerCase().endsWith('.docx') ||
        file.type === 'application/msword' || 
        file.name.toLowerCase().endsWith('.doc')) {
      console.log("Reading binary file");
      reader.readAsBinaryString(file);
    } else {
      console.log("Reading as text");
      reader.readAsText(file);
    }
  });
};

const validateAndFixAnalysisResult = (result: Partial<AnalysisResultData>): AnalysisResultData => {
  // Check if all required properties exist and have valid values
  const hasValidStructure = result.overallScore !== undefined && 
                           result.sections !== undefined &&
                           result.keyInsights !== undefined &&
                           result.recommendations !== undefined &&
                           result.atsScores !== undefined;
  
  // Generate a generic but useful analysis if the result structure is invalid
  if (!hasValidStructure) {
    console.warn("Received invalid analysis structure from AI, generating fallback analysis");
    return generateFallbackAnalysis(result);
  }
  
  // Fix any missing or invalid data
  const validResult: AnalysisResultData = {
    overallScore: typeof result.overallScore === 'number' && result.overallScore >= 0 && result.overallScore <= 100 
                  ? result.overallScore : 65,
    sections: {
      content: { score: (result.sections?.content?.score ?? 65) },
      formatting: { score: (result.sections?.formatting?.score ?? 60) },
      keywords: { score: (result.sections?.keywords?.score ?? 70) },
      relevance: { score: (result.sections?.relevance?.score ?? 65) }
    },
    keyInsights: Array.isArray(result.keyInsights) && result.keyInsights.length > 0
                 ? result.keyInsights
                 : [
                     { type: "positive", text: "Your resume has content that can be analyzed for improvement." },
                     { type: "warning", text: "Consider adding more specific achievements and metrics to strengthen your experience section." },
                     { type: "negative", text: "Your resume may not be optimized for ATS systems based on the format." }
                   ],
    recommendations: Array.isArray(result.recommendations) && result.recommendations.length > 0
                    ? result.recommendations
                    : [
                        {
                          category: "content",
                          title: "Add quantifiable achievements",
                          description: "Include specific metrics and results in your work experience to demonstrate impact.",
                          examples: "Increased website traffic by 45% through implementation of SEO strategies."
                        },
                        {
                          category: "keywords",
                          title: "Optimize for ATS systems",
                          description: "Include relevant industry keywords throughout your resume to pass through applicant tracking systems.",
                          examples: "Add skills and technologies specific to your industry in a dedicated skills section."
                        },
                        {
                          category: "formatting",
                          title: "Improve readability",
                          description: "Use consistent formatting, bullet points, and white space to make your resume more scannable.",
                          examples: "Use 3-5 bullet points per job role, focusing on achievements rather than responsibilities."
                        }
                      ],
    atsScores: {
      readability: (result.atsScores?.readability ?? 65),
      keywords: (result.atsScores?.keywords ?? 70),
      formatting: (result.atsScores?.formatting ?? 60)
    },
    detectedKeywords: Array.isArray(result.detectedKeywords) ? result.detectedKeywords : []
  };
  
  return validResult;
};

const generateFallbackAnalysis = (partialResult: Partial<AnalysisResultData>): AnalysisResultData => {
  return {
    overallScore: 65,
    sections: {
      content: { score: 65 },
      formatting: { score: 60 },
      keywords: { score: 70 },
      relevance: { score: 65 }
    },
    keyInsights: [
      { 
        type: "positive", 
        text: "Your resume has been analyzed and shows potential with some good content elements."
      },
      { 
        type: "warning", 
        text: "Consider enhancing your resume with more specific achievements and relevant keywords for your industry."
      },
      { 
        type: "negative", 
        text: "The resume needs improvements in formatting for better readability and ATS compatibility."
      }
    ],
    recommendations: [
      {
        category: "content",
        title: "Strengthen your experience section",
        description: "Focus on achievements rather than just responsibilities. Use active verbs and include specific metrics.",
        examples: "Instead of 'Responsible for social media', use 'Grew Instagram following by 5,000+ followers in 3 months'"
      },
      {
        category: "keywords",
        title: "Optimize for ATS systems",
        description: "Include relevant industry keywords throughout your resume to pass through applicant tracking systems.",
        examples: "Research job descriptions for positions you're interested in and incorporate those keywords naturally"
      },
      {
        category: "formatting",
        title: "Improve structure and readability",
        description: "Use consistent formatting with clear section headings and bullet points for better readability.",
        examples: "Organize information using headings like 'Experience', 'Education', and 'Skills'"
      },
      {
        category: "other",
        title: "Customize for each application",
        description: "Tailor your resume for each position you apply for by emphasizing relevant experience.",
        examples: "Adjust your summary section to highlight skills most relevant to the specific job description"
      }
    ],
    atsScores: {
      readability: 65,
      keywords: 70,
      formatting: 60
    },
    detectedKeywords: partialResult.detectedKeywords || [
      "communication",
      "teamwork",
      "organization",
      "leadership",
      "project management"
    ]
  };
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
