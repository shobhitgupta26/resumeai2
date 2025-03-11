
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, FileType, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import AnalysisResult from "@/components/AnalysisResult";
import { useToast } from "@/hooks/use-toast";
import { analyzeResume, extractTextFromFile, AnalysisResultData } from "@/services/analyzerService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Analyzer() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setIsMockData(false);
      setResults(null); // Clear previous results when a new file is selected
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
    setProcessingStage("Reading file");

    try {
      // Display file info for debugging
      console.log("Analyzing file:", file.name, "Type:", file.type, "Size:", file.size);
      
      // Extract text from the uploaded file
      setProcessingStage("Extracting text");
      const fileContent = await extractTextFromFile(file);
      
      // Check if we got meaningful content
      if (!fileContent || fileContent.trim().length < 50) {
        throw new Error("Could not extract sufficient text from the file. Please try another file format (TXT recommended) or check file content.");
      }

      // Send the file content to the Gemini API for analysis
      setProcessingStage("Analyzing with AI");
      const analysisResults = await analyzeResume(fileContent);
      
      // Update results
      setResults(analysisResults);
      setProcessingStage(null);
      
      // Check if we got real analysis or mock data
      const mockDataDetected = analysisResults.keyInsights.some(insight => 
        insight.text.includes("Could not generate specific insights"));
      
      setIsMockData(mockDataDetected);
      
      toast({
        title: mockDataDetected ? "Analysis limited" : "Analysis complete",
        description: mockDataDetected 
          ? "We had trouble analyzing your file format. Try uploading a plain text (.txt) version for better results." 
          : "Your resume has been analyzed successfully with Gemini AI",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError((error as Error).message);
      setProcessingStage(null);
      
      toast({
        title: "Analysis failed",
        description: (error as Error).message || "An error occurred while analyzing your resume",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 py-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Resume Analyzer
            </h1>
            <p className="text-lg text-muted-foreground">
              Get instant AI-powered insights on how to improve your resume
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="mb-8 p-8 border rounded-lg bg-card shadow-sm">
              <div className="text-center mb-6">
                <FileUp className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h2 className="text-2xl font-medium mb-2">Upload Your Resume</h2>
                <p className="text-muted-foreground">
                  Supported file types: TXT (recommended), DOC, DOCX, PDF (Max 5MB)
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
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
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all duration-300"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {processingStage || "Analyzing..."}
                    </>
                  ) : (
                    <>
                      Analyze Resume
                      <Upload className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {isMockData && results && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Limited Analysis</AlertTitle>
                  <AlertDescription>
                    We encountered an issue with analyzing your specific file. For accurate analysis, 
                    try uploading a simpler file format like .txt or ensure your PDF has selectable text.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <AnalysisResult results={results} isMockData={isMockData} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
