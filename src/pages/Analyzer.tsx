import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, AlertCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import AnalysisResult from "@/components/AnalysisResult";
import { useToast } from "@/hooks/use-toast";
import { analyzeResume, extractTextFromFile, AnalysisResultData, getMockAnalysisResult } from "@/services/analyzerService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Analyzer() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setIsMockData(false);
      setResults(null);
      setQuotaExceeded(false);
      
      try {
        const content = await extractTextFromFile(selectedFile);
        setFileContent(content);
      } catch (error) {
        console.error("Error reading file content:", error);
        setFileContent("");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a resume file to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setIsMockData(false);
    setQuotaExceeded(false);

    try {
      console.log("Analyzing file:", file.name, "Type:", file.type, "Size:", file.size);
      
      const fileContent = await extractTextFromFile(file);
      
      if (!fileContent || fileContent.trim().length < 50) {
        throw new Error("Could not extract sufficient text from the file. Please try another file format or check file content.");
      }

      const analysisResults = await analyzeResume(fileContent);
      
      setResults(analysisResults);
      
      const lowScores = analysisResults.overallScore < 10 && 
                      Object.values(analysisResults.sections).every(s => s.score < 10);
      
      const containsMockText = 
        JSON.stringify(analysisResults).includes("Jane Doe") ||
        JSON.stringify(analysisResults).includes("sample text") ||
        JSON.stringify(analysisResults).includes("This is a resume for");
      
      const badFileContent = fileContent.includes("Could not extract readable text") || 
                           fileContent.length < 100;
      
      const mockDataDetected = lowScores || containsMockText || badFileContent;
      setIsMockData(mockDataDetected);
      
      toast({
        title: "Analysis complete",
        description: mockDataDetected 
          ? "Using sample data due to text extraction issues" 
          : "Your resume has been analyzed successfully with Gemini AI",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      
      const errorMessage = (error as Error).message;
      setError(errorMessage);
      
      if (errorMessage.includes("quota") || errorMessage.includes("API quota exceeded")) {
        setQuotaExceeded(true);
        setIsMockData(true);
        setResults(getMockAnalysisResult());
        
        toast({
          title: "API Quota Exceeded",
          description: "Using sample data. The API usage limit has been reached. Try again later.",
          variant: "destructive",
        });
      } else {
        setIsMockData(true);
        
        toast({
          title: "Analysis failed",
          description: errorMessage || "An error occurred while analyzing your resume",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl font-bold mb-3">Resume Analyzer</h1>
            <p className="text-lg text-muted-foreground">
              Get instant AI-powered insights on how to improve your resume
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="mb-8 p-8 border rounded-lg bg-gradient-to-br from-secondary/40 to-background shadow-sm">
              <div className="text-center mb-6">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-medium mb-2">Upload Your Resume</h2>
                <p className="text-muted-foreground">
                  Supported file types: TXT (recommended), DOC, DOCX, PDF (Max 5MB)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  For best results, use plain text (.txt) format
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="cursor-pointer"
                />
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Analyzing..." : "Analyze Resume"}
                  {!loading && <Upload className="ml-2 h-4 w-4" />}
                </Button>
              </div>
              
              {error && !quotaExceeded && (
                <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {quotaExceeded && (
                <Alert variant="warning" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>API Usage Limit Reached</AlertTitle>
                  <AlertDescription>
                    The Gemini AI API usage limit has been reached. We're showing sample analysis data instead.
                    Please try again later when the quota resets.
                  </AlertDescription>
                </Alert>
              )}
              
              {isMockData && results && !quotaExceeded && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Using Sample Analysis</AlertTitle>
                  <AlertDescription>
                    We encountered an issue with the AI analysis. Showing sample data instead. For accurate analysis, 
                    try uploading a simpler file format like .txt or ensure your PDF has selectable text.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-6">
              <AnalysisResult results={results} isMockData={isMockData} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
