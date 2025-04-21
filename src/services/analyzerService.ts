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
      - If you cannot extract meaningful text from the resume, provide appropriate feedback about the format rather than claiming there's gibberish
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
  if (!content || content.length < 10) {
    return content;
  }
  
  try {
    // Check if it's likely a PDF (basic signature detection)
    const isPDF = content.startsWith('%PDF') || 
                 content.includes('%%EOF') || 
                 /^\s*%PDF/.test(content) ||
                 content.includes('/Type /Page') ||
                 content.includes('/Contents');
    
    if (isPDF) {
      console.log("Detected PDF content, applying enhanced extraction");
      return enhancedPDFTextExtraction(content);
    }
    
    return cleanTextContent(content);
  } catch (error) {
    console.error("Error in text extraction:", error);
    return cleanTextContent(content);
  }
};

const enhancedPDFTextExtraction = (pdfContent: string): string => {
  let extractedText = '';
  
  try {
    // Combined PDF text extraction methods
    
    // Method 1: Extract text using multiple patterns commonly found in PDFs
    const patterns = [
      // Standard text objects
      /\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})+)\)\s*Tj/g,
      // Array-based text objects
      /\[((?:[^[\]\\]|\\.|<[0-9A-Fa-f]+>|\([^()]*\))*)\]\s*TJ/g,
      // Hex-encoded text
      /<([0-9A-Fa-f]+)>\s*Tj/g,
      // Stream content with BT/ET markers (Begin/End Text)
      /BT\s*([\s\S]*?)\s*ET/g,
      // General text searches with length filters
      /\(([A-Za-z0-9\s.,;:'"!?-]{10,})\)/g,
      // Text within content streams
      /stream\s*([\s\S]*?)\s*endstream/g
    ];
    
    // Process each pattern
    for (const pattern of patterns) {
      const matches = pdfContent.matchAll(pattern);
      for (const match of matches) {
        const capturedText = match[1];
        if (capturedText && capturedText.length > 5) {
          // Process based on pattern type
          if (pattern.toString().includes('TJ')) {
            // Process TJ arrays
            const textParts = capturedText.match(/\(([^()]*)\)/g) || [];
            for (const part of textParts) {
              if (part && part.length > 2) { // More than just empty ()
                extractedText += part.substring(1, part.length - 1) + ' ';
              }
            }
          } else if (pattern.toString().includes('<')) {
            // Decode hex text
            let decodedText = '';
            for (let i = 0; i < capturedText.length; i += 2) {
              if (i + 1 < capturedText.length) {
                const hexCode = capturedText.substring(i, i + 2);
                const charCode = parseInt(hexCode, 16);
                if (charCode >= 32 && charCode <= 126) { // Printable ASCII range
                  decodedText += String.fromCharCode(charCode);
                }
              }
            }
            if (decodedText.length > 3) {
              extractedText += decodedText + ' ';
            }
          } else if (pattern.toString().includes('BT')) {
            // Extract text between BT/ET markers
            const textOperations = capturedText.match(/\([^()]*\)\s*Tj|\[[^\[\]]*\]\s*TJ|<[0-9A-Fa-f]+>\s*Tj/g) || [];
            for (const op of textOperations) {
              if (op.includes('(') && op.includes(')')) {
                const textMatch = op.match(/\(([^()]*)\)/);
                if (textMatch && textMatch[1]) {
                  extractedText += textMatch[1] + ' ';
                }
              }
            }
          } else if (pattern.toString().includes('stream')) {
            // Process stream content
            const textFragments = capturedText.match(/[a-zA-Z][a-zA-Z0-9 .,;:'"!?-]{5,}/g) || [];
            for (const fragment of textFragments) {
              if (fragment.length > 10 && /[a-zA-Z]{3,}/.test(fragment)) {
                extractedText += fragment + ' ';
              }
            }
          } else {
            // General text capture
            extractedText += capturedText + ' ';
          }
        }
      }
    }
    
    // If we still don't have much text, try a more aggressive approach
    if (extractedText.length < 100) {
      console.log("Initial extraction yielded insufficient text, trying secondary method");
      
      // Method 2: Look for any meaningful text fragments in the entire PDF
      const fallbackMatches = pdfContent.match(/[A-Za-z][A-Za-z0-9\s.,;:'"!?@#$%^&*()-+=]{5,}/g) || [];
      let fallbackText = '';
      
      for (const fragment of fallbackMatches) {
        // Filter for likely meaningful content
        if (fragment.length > 10 && /[A-Za-z]{3,}/.test(fragment) && !/^\s*[0-9.]+\s*$/.test(fragment)) {
          fallbackText += fragment + ' ';
        }
      }
      
      if (fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
      }
    }
    
    // Final processing - handle PDF-specific character issues
    extractedText = extractedText
      .replace(/\\(\d{3})/g, (m, octal) => String.fromCharCode(parseInt(octal, 8)))
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\s+/g, ' ')
      .replace(/(\w)-\s+(\w)/g, '$1$2') // Fix hyphenated words
      .trim();
      
    console.log("PDF text extraction complete, extracted length:", extractedText.length);
    
    if (extractedText.length < 50) {
      // If we still don't have enough text, provide a fallback message
      return "The resume appears to be in PDF format, but meaningful text could not be extracted. Try uploading a plain text version of your resume for better results.";
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    return "Error extracting text from PDF. Please try a different file format, such as .txt or .docx.";
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
  const hasValidScores = result.overallScore && result.overallScore > 0;
  
  if (!hasValidScores && result.keyInsights && result.keyInsights.length > 0 && 
      result.keyInsights[0].text && result.keyInsights[0].text.includes("gibberish")) {
    // This is likely a text extraction issue with the PDF, provide better feedback
    return {
      overallScore: 50, // Provide a neutral score
      sections: {
        content: { score: 50 },
        formatting: { score: 50 },
        keywords: { score: 50 },
        relevance: { score: 50 }
      },
      keyInsights: [
        { 
          type: "warning", 
          text: "We had trouble extracting readable text from your resume. For the best analysis, consider uploading a plain text (.txt) or Word (.docx) version of your resume." 
        },
        { 
          type: "warning", 
          text: "The format of your PDF file might be making it difficult to analyze its content properly." 
        },
        { 
          type: "positive", 
          text: "Your resume has been processed, but we recommend checking our formatting tips below to ensure your resume is ATS-friendly." 
        }
      ],
      recommendations: [
        {
          category: "formatting",
          title: "Convert to ATS-friendly format",
          description: "Your resume might be using a format that's difficult for Applicant Tracking Systems (ATS) to read. Consider using a simpler format without complex layouts, tables, or graphics.",
          examples: "Use standard headings like 'Experience', 'Education', and 'Skills' with simple formatting."
        },
        {
          category: "content",
          title: "Ensure text is selectable in your PDF",
          description: "Some PDFs contain images of text rather than actual text characters. Make sure your resume contains real text that can be selected and copied.",
          examples: "Try opening your PDF and selecting text - if you cannot select individual words, it might be an image."
        },
        {
          category: "other",
          title: "Try uploading a different file format",
          description: "For the most accurate analysis, try uploading a plain text (.txt) or Word (.docx) version of your resume.",
          examples: "Many word processors allow you to save or export your document in multiple formats."
        }
      ],
      atsScores: {
        readability: 50,
        keywords: 40,
        formatting: 50
      },
      detectedKeywords: result.detectedKeywords || []
    };
  }

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
      { type: "warning", text: "We couldn't fully analyze your resume. Try uploading a different file format for better results." }
    ],
    recommendations: result.recommendations || [
      {
        category: "content",
        title: "Use a different file format",
        description: "For better analysis, try uploading a plain text (.txt) or Word (.docx) version of your resume.",
        examples: "Many word processors allow you to save or export your document in multiple formats."
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
