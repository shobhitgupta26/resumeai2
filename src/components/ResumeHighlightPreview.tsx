
import { AnalysisResultData } from "@/services/analyzerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ResumeHighlightPreviewProps {
  content: string;
  analysis: AnalysisResultData | null;
}

export default function ResumeHighlightPreview({ content, analysis }: ResumeHighlightPreviewProps) {
  if (!content || !analysis) return null;

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
