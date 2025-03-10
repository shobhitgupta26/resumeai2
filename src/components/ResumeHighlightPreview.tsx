
import { AnalysisResultData } from "@/services/analyzerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, FileWarning } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResumeHighlightPreviewProps {
  content: string;
  analysis: AnalysisResultData | null;
}

export default function ResumeHighlightPreview({ content, analysis }: ResumeHighlightPreviewProps) {
  if (!content) return null;

  // Check if content looks like PDF data
  const isPdfContent = content.includes("%PDF-") || 
                      (content.includes("obj") && 
                       content.includes("endobj") && 
                       content.includes("stream"));

  if (isPdfContent) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Resume Preview
            <FileWarning className="h-4 w-4 text-orange-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="warning">
            <FileWarning className="h-4 w-4" />
            <AlertTitle>PDF File Detected</AlertTitle>
            <AlertDescription>
              We detected PDF content that cannot be properly displayed. For best results:
              <ul className="list-disc list-inside mt-2">
                <li>Try uploading a plain text (.txt) version of your resume</li>
                <li>Copy and paste your resume content into a text file</li>
                <li>Save your document as plain text before uploading</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  // Get sections that need improvement (score < 60)
  const sectionsToImprove = Object.entries(analysis.sections)
    .filter(([_, section]) => section.score < 60)
    .map(([key]) => key.toLowerCase());

  // Split content into paragraphs
  const paragraphs = content.split('\n\n');

  // Function to determine if a paragraph belongs to a section
  const getSectionType = (paragraph: string): string | null => {
    const lower = paragraph.toLowerCase();
    if (lower.includes('experience') || lower.includes('work')) return 'experience';
    if (lower.includes('education') || lower.includes('academic')) return 'education';
    if (lower.includes('skills') || lower.includes('expertise')) return 'skills';
    if (lower.includes('summary') || lower.includes('objective')) return 'summary';
    return null;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Resume Preview
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {paragraphs.map((paragraph, index) => {
            const sectionType = getSectionType(paragraph);
            const needsImprovement = sectionType && sectionsToImprove.includes(sectionType);
            
            return (
              <div
                key={index}
                className={`mb-4 p-2 rounded ${
                  needsImprovement ? 'bg-red-50 border border-red-200' : ''
                }`}
              >
                {needsImprovement && (
                  <div className="text-xs text-red-500 mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    This section needs improvement
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{paragraph}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
