
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
      const selectedFile = e.target.files[0];
      onFileSelect(selectedFile);
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
    <div className="mb-8 p-8 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all dark:bg-gray-800/80 dark:border-gray-700">
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-400/20 flex items-center justify-center mx-auto mb-3 text-indigo-500 dark:text-indigo-400">
          <FileUp className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-medium mb-2">Upload Your Resume</h2>
        <p className="text-muted-foreground">
          Upload your resume in PDF, DOC, DOCX, or TXT format for best results
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
        <div className="relative w-full">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt"
            className="cursor-pointer border-dashed hover:border-indigo-500/50 focus:border-indigo-500/50 transition-colors dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
        <Button 
          onClick={handleAnalyze} 
          disabled={!file || loading}
          className="w-full sm:w-auto shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
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
            <div className={`flex items-center space-x-2 ${processingStage === "Reading file" ? "text-indigo-500 dark:text-indigo-400 font-medium" : ""}`}>
              <div className={`h-2 w-2 rounded-full ${processingStage === "Reading file" ? "bg-indigo-500 dark:bg-indigo-400 animate-pulse" : "bg-muted-foreground"}`}></div>
              <span>Reading file</span>
            </div>
            <div className="h-0.5 w-6 bg-muted"></div>
            <div className={`flex items-center space-x-2 ${processingStage === "Extracting text" ? "text-indigo-500 dark:text-indigo-400 font-medium" : ""}`}>
              <div className={`h-2 w-2 rounded-full ${processingStage === "Extracting text" ? "bg-indigo-500 dark:bg-indigo-400 animate-pulse" : "bg-muted-foreground"}`}></div>
              <span>Extracting text</span>
            </div>
            <div className="h-0.5 w-6 bg-muted"></div>
            <div className={`flex items-center space-x-2 ${processingStage === "Analyzing with AI" ? "text-indigo-500 dark:text-indigo-400 font-medium" : ""}`}>
              <div className={`h-2 w-2 rounded-full ${processingStage === "Analyzing with AI" ? "bg-indigo-500 dark:bg-indigo-400 animate-pulse" : "bg-muted-foreground"}`}></div>
              <span>AI analysis</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
