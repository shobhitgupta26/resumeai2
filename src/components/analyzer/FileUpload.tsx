
import React, { useState } from "react";
import { FileUp, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => Promise<void>;
  file: File | null;
  loading: boolean;
  error: string | null;
  processingStage: string | null;
}

export default function FileUpload({ 
  onFileSelect, 
  onAnalyze, 
  file, 
  loading, 
  error,
  processingStage 
}: FileUploadProps) {
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a resume file to analyze",
        variant: "destructive",
      });
      return;
    }
    await onAnalyze();
  };

  return (
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
        </div>
        <Button 
          onClick={handleAnalyze} 
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
          <AlertDescription>{error}</AlertDescription>
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
  );
}
