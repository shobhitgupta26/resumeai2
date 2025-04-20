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
  
  // Enhanced PDF text extraction logic for better LaTeX support
  try {
    // Look for text object markers in PDF
    const textMarkers = ['/Text', '/TJ', '/Tj', '/T*', '/BT', '/ET'];
    const lines = pdfContent.split('\n');
    
    // First pass: Extract text from standard PDF structures
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip binary data and non-text sections
      if (
        /[\x00-\x08\x0B\x0C\x0E-\x1F\x80-\xFF]{10,}/.test(line) || 
        line.includes('/Image') ||
        line.includes('/ExtGState') ||
        line.includes('/Font') ||
        line.includes('/XObject') ||
        line.includes('/ColorSpace') ||
        /^\s*\d+\s+\d+\s+obj/.test(line) ||
        /^\s*trailer/.test(line) ||
        /^\s*xref/.test(line) ||
        line.length < 2
      ) {
        continue;
      }
      
      // Text extraction for common PDF text encoding patterns
      if (line.includes('(') && line.includes(')')) {
        const matches = line.match(/\((.*?)\)/g) || [];
        matches.forEach(match => {
          const text = match.substring(1, match.length - 1)
            .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')');
          
          if (text.length > 1 && !/^[.,;:!?\s]+$/.test(text)) {
            extractedText += text + ' ';
          }
        });
      } 
      
      // Extract text from TJ operators (array of strings and positioning)
      else if (line.includes(' TJ')) {
        const tjMatch = line.match(/\[\s*(.*?)\s*\]\s*TJ/);
        if (tjMatch && tjMatch[1]) {
          const parts = tjMatch[1].split(/\s*(?:\(|\))\s*/);
          parts.forEach(part => {
            if (part && !/^[-\d.]+$/.test(part) && part.length > 0) {
              extractedText += part.replace(/[\\\(\)]/g, '') + ' ';
            }
          });
        }
      }
      
      // Extract text from Tj operators (simple string)
      else if (line.includes(' Tj')) {
        const tjMatch = line.match(/\(\s*(.*?)\s*\)\s*Tj/);
        if (tjMatch && tjMatch[1]) {
          extractedText += tjMatch[1].replace(/[\\\(\)]/g, '') + ' ';
        }
      }
      
      // Look for hex-encoded strings (common in LaTeX-generated PDFs)
      else if (line.includes('<') && line.includes('>')) {
        const hexMatches = line.match(/<([0-9A-Fa-f]+)>/g);
        if (hexMatches) {
          hexMatches.forEach(match => {
            // Convert hex to ASCII
            const hex = match.substring(1, match.length - 1);
            try {
              let hexText = '';
              for (let i = 0; i < hex.length; i += 2) {
                if (i + 1 < hex.length) {
                  const hexCode = hex.substr(i, 2);
                  const charCode = parseInt(hexCode, 16);
                  if (charCode >= 32 && charCode <= 126) { // Only printable ASCII
                    hexText += String.fromCharCode(charCode);
                  }
                }
              }
              if (hexText.length > 1 && /[a-zA-Z0-9]/.test(hexText)) {
                extractedText += hexText + ' ';
              }
            } catch (e) {
              // Skip invalid hex
            }
          });
        }
      }
    }
    
    // Secondary pass for LaTeX-specific content
    if (extractedText.length < 500) {
      console.log("First pass extraction yielded limited text, trying LaTeX-specialized methods");
      
      // Look for content between BT (Begin Text) and ET (End Text) markers - common in LaTeX PDFs
      const btEtRegex = /BT([\s\S]*?)ET/g;
      let btEtMatch;
      let btEtExtracted = '';
      
      while ((btEtMatch = btEtRegex.exec(pdfContent)) !== null) {
        const textBlock = btEtMatch[1];
        
        // Look for LaTeX-style text structures
        const textParts = textBlock.match(/\((.*?)\)Tj|\[(.*?)\]TJ|<([0-9A-Fa-f]+)>/g) || [];
        
        textParts.forEach(part => {
          if (part.endsWith('Tj')) {
            const text = part.substring(1, part.length - 3)
              .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)))
              .replace(/\\n/g, '\n')
              .replace(/\\\\/g, '\\')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')');
            
            btEtExtracted += text + ' ';
          } 
          else if (part.endsWith('TJ')) {
            const arrayContent = part.substring(1, part.length - 3);
            const stringParts = arrayContent.match(/\((.*?)\)/g) || [];
            stringParts.forEach(str => {
              const text = str.substring(1, str.length - 1)
                .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)));
              btEtExtracted += text + ' ';
            });
            
            // Handle numbers mixed with text in TJ arrays (common in LaTeX PDFs)
            const mixedParts = arrayContent.match(/\(([^)]*)\)|([+-]?\d+(\.\d+)?)/g) || [];
            mixedParts.forEach(mixedPart => {
              if (!mixedPart.startsWith('(') && !isNaN(parseFloat(mixedPart))) {
                // This is a spacing number, ignore
              } else if (mixedPart.startsWith('(')) {
                const text = mixedPart.substring(1, mixedPart.length - 1)
                  .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)));
                btEtExtracted += text;
              }
            });
          }
          else if (part.startsWith('<') && part.endsWith('>')) {
            // Handle hex encoding (very common in LaTeX PDFs)
            const hex = part.substring(1, part.length - 1);
            try {
              let hexText = '';
              for (let i = 0; i < hex.length; i += 2) {
                if (i + 1 < hex.length) {
                  const charCode = parseInt(hex.substr(i, 2), 16);
                  if (charCode >= 32 && charCode <= 126) {
                    hexText += String.fromCharCode(charCode);
                  } else if (charCode === 32 || charCode === 10 || charCode === 13) {
                    hexText += ' '; // Convert common whitespace characters to space
                  }
                }
              }
              btEtExtracted += hexText + ' ';
            } catch (e) {
              // Skip invalid hex
            }
          }
        });
      }
      
      if (btEtExtracted.length > extractedText.length * 0.5) {
        console.log("BT/ET extraction yielded better results, using that");
        extractedText = btEtExtracted;
      }
      
      // If still not enough text, try one more approach for LaTeX PDFs
      if (extractedText.length < 200) {
        console.log("Still insufficient text, attempting final extraction method");
        
        // Look for content tables and structure elements common in LaTeX
        const contentMatches = pdfContent.match(/\/Contents\s*\[\s*(.*?)\s*\]/gs) || [];
        let contentExtracted = '';
        
        contentMatches.forEach(contentMatch => {
          const objectRefs = contentMatch.match(/\d+\s+\d+\s+R/g) || [];
          objectRefs.forEach(ref => {
            const objId = ref.split(' ')[0];
            const objRegex = new RegExp(`${objId}\\s+0\\s+obj[\\s\\S]*?endobj`, 'g');
            const objMatches = pdfContent.match(objRegex) || [];
            
            objMatches.forEach(objMatch => {
              // Extract text content from stream
              const streamMatch = objMatch.match(/stream([\s\S]*?)endstream/);
              if (streamMatch && streamMatch[1]) {
                const streamContent = streamMatch[1].trim();
                
                // Process text in the stream
                const textParts = streamContent.match(/\(([^)]+)\)Tj|\[([^\]]+)\]TJ|<([0-9A-Fa-f]+)>/g) || [];
                textParts.forEach(textPart => {
                  if (textPart.includes('(') && textPart.includes(')')) {
                    const text = textPart.match(/\((.*?)\)/)[1]
                      .replace(/\\(\d{3})/g, (m, code) => String.fromCharCode(parseInt(code, 8)));
                    contentExtracted += text + ' ';
                  }
                  else if (textPart.startsWith('<') && textPart.endsWith('>')) {
                    const hex = textPart.substring(1, textPart.length - 1);
                    let hexText = '';
                    for (let i = 0; i < hex.length; i += 2) {
                      if (i + 1 < hex.length) {
                        const charCode = parseInt(hex.substr(i, 2), 16);
                        if (charCode >= 32 && charCode <= 126) {
                          hexText += String.fromCharCode(charCode);
                        }
                      }
                    }
                    contentExtracted += hexText + ' ';
                  }
                });
              }
            });
          });
        });
        
        if (contentExtracted.length > extractedText.length) {
          console.log("Content extraction yielded better results, using that");
          extractedText = contentExtracted;
        }
      }
    }
  } catch (error) {
    console.error("Error in PDF text extraction:", error);
  }
  
  console.log("Extracted text length from PDF:", extractedText.length);
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
