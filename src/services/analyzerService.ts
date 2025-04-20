
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
    console.log("Detected PDF content, applying specialized extraction");
    return extractTextFromPDF(content);
  }
  
  return cleanTextContent(content);
};

const extractTextFromPDF = (pdfContent: string): string => {
  let extractedText = '';
  
  // Enhanced and improved PDF text extraction specifically for LaTeX-generated PDFs
  try {
    console.log("Starting enhanced PDF extraction for LaTeX-generated documents");
    
    // First approach: Extract text from content streams using multiple patterns
    const streamMatches = pdfContent.match(/stream[\r\n]([\s\S]*?)[\r\n]endstream/g) || [];
    let streamExtracted = '';
    
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch.replace(/^stream[\r\n]|[\r\n]endstream$/g, '');
      
      // Extract readable text from various encoding formats
      
      // 1. Extract text from parentheses (most common in PDFs)
      const parenthesesMatches = streamContent.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)/g) || [];
      parenthesesMatches.forEach(match => {
        const text = match.substring(1, match.length - 1)
          .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
          .replace(/\\n/g, ' ')
          .replace(/\\\\/g, '\\')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')');
          
        if (text.length > 1 && !/^[\s.,;:!?]*$/.test(text)) {
          streamExtracted += text + ' ';
        }
      });
      
      // 2. Extract text from hex strings (common in LaTeX PDFs)
      const hexMatches = streamContent.match(/<([0-9A-Fa-f]+)>/g) || [];
      hexMatches.forEach(match => {
        const hex = match.substring(1, match.length - 1);
        let hexText = '';
        
        for (let i = 0; i < hex.length; i += 2) {
          if (i + 1 < hex.length) {
            const charCode = parseInt(hex.substr(i, 2), 16);
            if (charCode >= 32 && charCode <= 126) { // Only printable ASCII
              hexText += String.fromCharCode(charCode);
            } else if (charCode === 32 || charCode === 10 || charCode === 13) {
              hexText += ' '; // Convert whitespace to space
            }
          }
        }
        
        if (hexText.length > 1 && /[a-zA-Z0-9]/.test(hexText)) {
          streamExtracted += hexText + ' ';
        }
      });
      
      // 3. Look for LaTeX-specific identifiers to extract font mappings
      const fontDefs = streamContent.match(/\/([A-Z0-9]+)\s+\d+\s+Tf/g) || [];
      fontDefs.forEach(fontDef => {
        const fontName = fontDef.match(/\/([A-Z0-9]+)/)[1];
        // Look for text using this font
        const fontTextRegex = new RegExp(`BT\\s*${fontDef}[\\s\\S]*?ET`, 'g');
        const fontBlocks = streamContent.match(fontTextRegex) || [];
        
        fontBlocks.forEach(block => {
          // Extract text within this font block
          const textMatches = block.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)\s*Tj|\[((?:[^[\]\\]|\\.|<[0-9A-Fa-f]+>)*)\]\s*TJ/g) || [];
          textMatches.forEach(textMatch => {
            if (textMatch.endsWith('Tj')) {
              const text = textMatch.match(/\((.*?)\)/)[1]
                .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)));
              streamExtracted += text + ' ';
            } else if (textMatch.endsWith('TJ')) {
              const array = textMatch.substring(1, textMatch.length - 3);
              // Extract just the string parts from TJ array (ignore positioning numbers)
              const stringParts = array.match(/\(((?:[^()\\]|\\[()]|\\\\|\\[0-9]{3})*)\)/g) || [];
              stringParts.forEach(str => {
                const text = str.substring(1, str.length - 1)
                  .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)));
                streamExtracted += text + ' ';
              });
            }
          });
        });
      });
    }
    
    console.log("Stream extraction complete, length:", streamExtracted.length);
    extractedText = streamExtracted;
    
    // If we didn't get good results, try specialized LaTeX PDF handlers
    if (extractedText.length < 200) {
      console.log("First pass extraction insufficient, trying specialized LaTeX extraction");
      
      // LaTeX-specific approach: Look for content between BT and ET markers
      const btEtRegex = /BT[\s\S]*?ET/g;
      let btEtMatches = pdfContent.match(btEtRegex) || [];
      let latexExtracted = '';
      
      btEtMatches.forEach(textBlock => {
        // Extract text operations (Tj, TJ, and ') within the text block
        const textOps = textBlock.match(/\(([^)]*)\)\s*Tj|\[([^\]]*)\]\s*TJ|\(([^)]*)\)\s*'/g) || [];
        
        textOps.forEach(textOp => {
          if (textOp.includes('(') && textOp.includes(')')) {
            const text = textOp.match(/\((.*?)\)/)[1]
              .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')');
            latexExtracted += text + ' ';
          }
        });
        
        // Handle hex-encoded text (very common in LaTeX)
        const hexOps = textBlock.match(/<([0-9A-Fa-f]+)>\s*Tj/g) || [];
        hexOps.forEach(hexOp => {
          const hex = hexOp.match(/<([0-9A-Fa-f]+)>/)[1];
          let hexText = '';
          
          for (let i = 0; i < hex.length; i += 2) {
            if (i + 1 < hex.length) {
              const charCode = parseInt(hex.substr(i, 2), 16);
              if (charCode >= 32 && charCode <= 126) {
                hexText += String.fromCharCode(charCode);
              } else if ([32, 10, 13, 9].includes(charCode)) {
                hexText += ' ';
              }
            }
          }
          
          latexExtracted += hexText + ' ';
        });
      });
      
      console.log("LaTeX-specific extraction complete, length:", latexExtracted.length);
      
      if (latexExtracted.length > extractedText.length * 0.7) {
        extractedText = latexExtracted;
      }
      
      // If still insufficient, try one more approach
      if (extractedText.length < 150) {
        console.log("Trying third extraction method");
        
        // Look for ToUnicode CMaps (mapping between PDF char codes and Unicode)
        const cmapMatches = pdfContent.match(/\/ToUnicode[\s\S]*?stream[\r\n]([\s\S]*?)[\r\n]endstream/g) || [];
        const unicodeMappings = new Map();
        
        cmapMatches.forEach(cmap => {
          const cmapContent = cmap.replace(/^.*?stream[\r\n]|[\r\n]endstream.*$/gs, '');
          const mappings = cmapContent.match(/\s*<([0-9A-F]+)>\s*<([0-9A-F]+)>/g) || [];
          
          mappings.forEach(mapping => {
            const match = mapping.match(/<([0-9A-F]+)>\s*<([0-9A-F]+)>/);
            if (match) {
              const pdfCode = match[1];
              const unicodeHex = match[2];
              
              try {
                // Convert Unicode hex to actual character
                const codePoint = parseInt(unicodeHex, 16);
                if (codePoint) {
                  unicodeMappings.set(pdfCode, String.fromCodePoint(codePoint));
                }
              } catch (e) {
                // Ignore invalid conversions
              }
            }
          });
        });
        
        // Now find all character codes in content streams
        const charCodeMatches = pdfContent.match(/<([0-9A-F]+)>\s*Tj/g) || [];
        let cmapExtracted = '';
        
        charCodeMatches.forEach(codeMatch => {
          const code = codeMatch.match(/<([0-9A-F]+)>/)[1];
          
          // Try direct mapping
          if (unicodeMappings.has(code)) {
            cmapExtracted += unicodeMappings.get(code);
          } else {
            // Try to interpret as hex directly
            try {
              for (let i = 0; i < code.length; i += 2) {
                if (i + 1 < code.length) {
                  const charCode = parseInt(code.substr(i, 2), 16);
                  if (charCode >= 32 && charCode <= 126) {
                    cmapExtracted += String.fromCharCode(charCode);
                  }
                }
              }
            } catch (e) {
              // Skip if invalid
            }
          }
        });
        
        console.log("CMap extraction complete, length:", cmapExtracted.length);
        
        if (cmapExtracted.length > extractedText.length * 0.5) {
          extractedText = cmapExtracted;
        }
      }
    }
    
    // Final attempt - look for plain text within the PDF
    if (extractedText.length < 100) {
      console.log("Trying direct text extraction as last resort");
      
      // Look for blocks of text that might be readable
      const textBlocks = pdfContent.match(/([A-Za-z][A-Za-z\s.,;:!?()\[\]]{10,})/g) || [];
      const plainText = textBlocks.join(' ');
      
      if (plainText.length > extractedText.length * 0.3) {
        extractedText = plainText;
      }
    }
    
    // Post-processing to clean up text
    extractedText = extractedText
      .replace(/(\w)- (\w)/g, '$1$2') // Fix hyphenated words
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, '') // Remove non-printable ASCII chars
      .trim();
    
    console.log("Final extracted text length from PDF:", extractedText.length);
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
  }
  
  return cleanTextContent(extractedText);
};

const cleanTextContent = (text: string): string => {
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
      resolve(text);
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

// Functions to manage saved analyses
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

// Helper function to generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
