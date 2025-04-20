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
      throw new Error("Could not extract sufficient text from the resume. Please try a different file format like .txt for best results.");
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
    return extractTextFromPDFAdvanced(content);
  }
  
  return cleanTextContent(content);
};

const extractTextFromPDFAdvanced = (pdfContent: string): string => {
  let extractedText = '';
  
  try {
    console.log("Starting enhanced PDF extraction with multiple methods");
    
    // Method 1: Extract text using regex for text objects in content streams
    const extractMethodOne = () => {
      console.log("Applying extraction method 1: Text objects from streams");
      let result = '';
      
      // Find all content streams
      const streamMatches = pdfContent.match(/stream[\r\n]([\s\S]*?)[\r\n]endstream/g) || [];
      
      for (const streamMatch of streamMatches) {
        const streamContent = streamMatch.replace(/^stream[\r\n]|[\r\n]endstream$/g, '');
        
        // Extract text objects
        const textObjects = streamContent.match(/BT[\s\S]*?ET/g) || [];
        
        for (const textObject of textObjects) {
          // Extract text strings
          const textMatches = textObject.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)\s*Tj|\[((?:[^[\]\\]|\\.|<[0-9A-Fa-f]+>)*)\]\s*TJ/g) || [];
          
          for (const textMatch of textMatches) {
            if (textMatch.endsWith('Tj')) {
              const matches = textMatch.match(/\((.*?)\)/);
              if (matches && matches[1]) {
                const text = matches[1]
                  .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
                  .replace(/\\\(/g, '(')
                  .replace(/\\\)/g, ')')
                  .replace(/\\\\/g, '\\');
                
                if (text.length > 1 && /[a-zA-Z0-9]/.test(text)) {
                  result += text + ' ';
                }
              }
            } else if (textMatch.endsWith('TJ')) {
              const arrayContent = textMatch.slice(1, -3);
              const stringMatches = arrayContent.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)/g) || [];
              
              for (const strMatch of stringMatches) {
                const text = strMatch.slice(1, -1)
                  .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
                  .replace(/\\\(/g, '(')
                  .replace(/\\\)/g, ')')
                  .replace(/\\\\/g, '\\');
                
                if (text.length > 1 && /[a-zA-Z0-9]/.test(text)) {
                  result += text + ' ';
                }
              }
            }
          }
        }
      }
      
      return result;
    };
    
    // Method 2: Extract text from hex-encoded strings (common in modern PDFs)
    const extractMethodTwo = () => {
      console.log("Applying extraction method 2: Hex-encoded strings");
      let result = '';
      
      const hexMatches = pdfContent.match(/<([0-9A-Fa-f]+)>\s*Tj/g) || [];
      
      for (const hexMatch of hexMatches) {
        const hex = hexMatch.match(/<([0-9A-Fa-f]+)>/)?.[1] || '';
        let text = '';
        
        for (let i = 0; i < hex.length; i += 2) {
          if (i + 1 < hex.length) {
            const charCode = parseInt(hex.substr(i, 2), 16);
            if (charCode >= 32 && charCode <= 126) {
              text += String.fromCharCode(charCode);
            } else if (charCode === 32 || charCode === 10 || charCode === 13) {
              text += ' ';
            }
          }
        }
        
        if (text.length > 1 && /[a-zA-Z0-9]/.test(text)) {
          result += text + ' ';
        }
      }
      
      return result;
    };
    
    // Method 3: Extract text from ToUnicode CMaps
    const extractMethodThree = () => {
      console.log("Applying extraction method 3: ToUnicode CMaps");
      let result = '';
      
      // Find ToUnicode CMaps
      const cmapMatches = pdfContent.match(/\/ToUnicode[\s\S]*?stream[\r\n]([\s\S]*?)[\r\n]endstream/g) || [];
      const charMap = new Map<string, string>();
      
      for (const cmapMatch of cmapMatches) {
        const cmapContent = cmapMatch.replace(/^.*?stream[\r\n]|[\r\n]endstream.*$/gs, '');
        const mappings = cmapContent.match(/beginbfchar[\s\S]*?endbfchar/g) || [];
        
        for (const mapping of mappings) {
          const charMappings = mapping.replace(/beginbfchar|endbfchar/g, '').trim().split(/\s+/);
          
          for (let i = 0; i < charMappings.length; i += 2) {
            if (i + 1 < charMappings.length) {
              const pdfChar = charMappings[i].replace(/[<>]/g, '');
              const unicodeChar = charMappings[i+1].replace(/[<>]/g, '');
              
              if (pdfChar && unicodeChar) {
                try {
                  // Convert Unicode hex to actual character
                  const codePoint = parseInt(unicodeChar, 16);
                  if (codePoint) {
                    charMap.set(pdfChar, String.fromCodePoint(codePoint));
                  }
                } catch (e) {
                  // Ignore invalid conversions
                }
              }
            }
          }
        }
      }
      
      // Use the mapping to extract text
      const textBlocks = pdfContent.match(/\/(T[0-9]+)\s+(\d+)\s+Tf[\s\S]*?BT[\s\S]*?ET/g) || [];
      
      for (const block of textBlocks) {
        const charCodes = block.match(/<([0-9A-Fa-f]+)>\s*Tj/g) || [];
        
        for (const code of charCodes) {
          const charCode = code.match(/<([0-9A-Fa-f]+)>/)?.[1] || '';
          
          if (charMap.has(charCode)) {
            result += charMap.get(charCode);
          } else {
            // Try direct interpretation
            let text = '';
            for (let i = 0; i < charCode.length; i += 2) {
              if (i + 1 < charCode.length) {
                const code = parseInt(charCode.substr(i, 2), 16);
                if (code >= 32 && code <= 126) {
                  text += String.fromCharCode(code);
                }
              }
            }
            if (text.length > 0) {
              result += text;
            }
          }
        }
        result += ' ';
      }
      
      return result;
    };
    
    // Method 4: Extract text from all parenthesized strings (may catch more text)
    const extractMethodFour = () => {
      console.log("Applying extraction method 4: All parenthesized strings");
      let result = '';
      
      // Find all text in parentheses that might be readable
      const parenthesisMatches = pdfContent.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)/g) || [];
      
      for (const match of parenthesisMatches) {
        const text = match.slice(1, -1)
          .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        
        // Only add if it looks like actual text (contains letters/numbers and is longer than 1 char)
        if (text.length > 1 && /[a-zA-Z0-9]/.test(text)) {
          result += text + ' ';
        }
      }
      
      return result;
    };
    
    // Method 5: Using PDF.js-like approach for text extraction
    const extractMethodFive = () => {
      console.log("Applying extraction method 5: PDF.js-like approach");
      let result = '';
      
      // Find all text showing operators: TJ, Tj, ', "
      const operators = [
        ...pdfContent.matchAll(/\[((?:[^[\]\\]|\\.|<[0-9A-Fa-f]+>)*)\]\s*TJ/g),
        ...pdfContent.matchAll(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)\s*Tj/g),
        ...pdfContent.matchAll(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)\s*'/g),
        ...pdfContent.matchAll(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)\s*"/g)
      ];
      
      for (const match of operators) {
        const content = match[1];
        
        if (match[0].includes('TJ')) {
          // TJ operator can contain multiple strings and positioning numbers
          const stringMatches = content.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)/g) || [];
          
          for (const str of stringMatches) {
            const text = str.slice(1, -1)
              .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\\\\/g, '\\');
            
            if (text.length > 0) {
              result += text + ' ';
            }
          }
        } else {
          // Tj, ', " operators - direct strings
          const text = content
            .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          
          if (text.length > 0) {
            result += text + ' ';
          }
        }
      }
      
      return result;
    };
    
    // Apply all extraction methods and select the best result
    const results = [
      extractMethodOne(),
      extractMethodTwo(),
      extractMethodThree(),
      extractMethodFour(),
      extractMethodFive()
    ];
    
    console.log("Extraction results lengths:", results.map(r => r.length));
    
    // Select the longest result that has actual content
    const validResults = results.filter(r => r.length > 100 && /[a-zA-Z0-9]{10,}/.test(r));
    
    if (validResults.length > 0) {
      // Sort by length and take the longest
      extractedText = validResults.sort((a, b) => b.length - a.length)[0];
    } else {
      // If no good result, concatenate all results
      extractedText = results.join(' ');
    }
    
    console.log("Final extracted text length:", extractedText.length);
    
    // Post-process the text
    extractedText = extractedText
      .replace(/(\w)-\s+(\w)/g, '$1$2') // Fix hyphenated words
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, '') // Remove non-printable ASCII chars
      .trim();
    
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
    extractedText = "ERROR: Could not extract text from PDF. Please try a different file format.";
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
