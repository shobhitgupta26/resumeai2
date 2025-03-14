
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, AlertCircle, Loader2, FileText, Sparkles, Save, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import AnalysisResult from "@/components/AnalysisResult";
import SavedAnalyses from "@/components/SavedAnalyses";
import { useToast } from "@/hooks/use-toast";
import { 
  analyzeResume, 
  extractTextFromFile, 
  AnalysisResultData, 
  saveAnalysisToStorage, 
  getSavedAnalyses, 
  deleteSavedAnalysis, 
  SavedAnalysis 
} from "@/services/analyzerService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Analyzer() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [currentSavedAnalysisId, setCurrentSavedAnalysisId] = useState<string | undefined>(undefined);

  // Load saved analyses on component mount
  useEffect(() => {
    const analyses = getSavedAnalyses();
    setSavedAnalyses(analyses);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResults(null); // Clear previous results when a new file is selected
      setCurrentSavedAnalysisId(undefined);
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
    setProcessingStage("Reading file");
    setCurrentSavedAnalysisId(undefined);

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
      
      // Save the analysis to localStorage
      const savedAnalysis = saveAnalysisToStorage(analysisResults, file.name);
      
      // Update the UI state
      setResults(analysisResults);
      setProcessingStage(null);
      setCurrentSavedAnalysisId(savedAnalysis.id);
      
      // Refresh the saved analyses list
      setSavedAnalyses(getSavedAnalyses());
      
      toast({
        title: "Analysis complete",
        description: "Your resume has been analyzed successfully with Gemini AI",
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

  const handleAnalysisSelect = (analysis: SavedAnalysis) => {
    setResults(analysis.results);
    setCurrentSavedAnalysisId(analysis.id);
    setFile(null);
    setError(null);
    
    toast({
      title: "Analysis loaded",
      description: `Loaded analysis for "${analysis.filename}"`,
    });
  };

  const handleDeleteAnalysis = (id: string) => {
    deleteSavedAnalysis(id);
    
    // If the deleted analysis is currently being viewed, clear the results
    if (id === currentSavedAnalysisId) {
      setResults(null);
      setCurrentSavedAnalysisId(undefined);
    }
    
    // Refresh the saved analyses list
    setSavedAnalyses(getSavedAnalyses());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 py-8">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1 className="text-4xl font-bold mb-3 gradient-text">
              Resume Analyzer
            </h1>
            <p className="text-lg text-muted-foreground">
              Get instant AI-powered insights on how to improve your resume
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <SavedAnalyses 
              savedAnalyses={savedAnalyses}
              onAnalysisSelect={handleAnalysisSelect}
              onDeleteAnalysis={handleDeleteAnalysis}
              currentAnalysisId={currentSavedAnalysisId}
            />
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="mb-8 p-8 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-400/20 flex items-center justify-center mx-auto mb-3 text-primary">
                  <FileUp className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-medium mb-2">Upload Your Resume</h2>
                <p className="text-muted-foreground">
                  Supported file types: TXT (recommended), DOC, DOCX, PDF (Max 5MB)
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  For best results, use plain text (.txt) format
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
                <div className="relative w-full">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt"
                    className="cursor-pointer border-dashed hover:border-primary/50 focus:border-primary/50 transition-colors"
                  />
                  <div className="absolute inset-0 pointer-events-none rounded-md border-2 border-dashed border-primary/0 group-focus:border-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || loading}
                  className="w-full sm:w-auto button-gradient shadow-md"
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
              
              {loading && (
                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className={`flex items-center space-x-2 ${processingStage === "Reading file" ? "text-primary font-medium" : ""}`}>
                      <div className={`h-2 w-2 rounded-full ${processingStage === "Reading file" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}></div>
                      <span>Reading file</span>
                    </div>
                    <div className="h-0.5 w-6 bg-muted"></div>
                    <div className={`flex items-center space-x-2 ${processingStage === "Extracting text" ? "text-primary font-medium" : ""}`}>
                      <div className={`h-2 w-2 rounded-full ${processingStage === "Extracting text" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}></div>
                      <span>Extracting text</span>
                    </div>
                    <div className="h-0.5 w-6 bg-muted"></div>
                    <div className={`flex items-center space-x-2 ${processingStage === "Analyzing with AI" ? "text-primary font-medium" : ""}`}>
                      <div className={`h-2 w-2 rounded-full ${processingStage === "Analyzing with AI" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}></div>
                      <span>AI analysis</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {results && currentSavedAnalysisId && savedAnalyses.length > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>
                    Analysis saved on {new Date(savedAnalyses.find(a => a.id === currentSavedAnalysisId)?.timestamp || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <AnalysisResult results={results} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
