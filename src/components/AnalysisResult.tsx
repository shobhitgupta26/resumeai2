
import {
  AlertCircle,
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  PieChart,
  Sparkles,
  Target,
  XCircle,
  TrendingUp,
  Zap,
  BrainCircuit,
  BookOpen,
  TriangleAlert,
  BadgePlus,
  Flame,
  Pencil,
  ListChecks,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AnalysisResultData, Insight, Recommendation } from "@/services/analyzerService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

interface AnalysisResultProps {
  results: AnalysisResultData | null;
  isMockData?: boolean;
}

export default function AnalysisResult({ results, isMockData = false }: AnalysisResultProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  if (!results) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-gradient-to-br from-muted/60 to-muted/20">
        <div className="text-center max-w-md p-6">
          <BrainCircuit className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Upload your resume to see analysis</p>
          <p className="text-sm text-muted-foreground">
            Our AI will analyze your resume for content quality, ATS compatibility, keyword optimization, 
            and provide detailed improvement recommendations.
          </p>
        </div>
      </div>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const progressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const progressColorClass = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-emerald-400 to-emerald-500";
    if (score >= 60) return "bg-gradient-to-r from-amber-400 to-amber-500";
    return "bg-gradient-to-r from-red-400 to-red-500";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "⚠️";
    return "🔴";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "content":
        return <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />;
      case "keywords":
        return <Target className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />;
      case "formatting":
        return <PieChart className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />;
      case "skills":
        return <BookOpen className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />;
      case "experience":
        return <Calendar className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />;
      case "education":
        return <Award className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />;
      case "impact":
        return <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Sparkles className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />;
    }
  };

  // Filter recommendations by category if one is selected
  const filteredRecommendations = selectedCategory 
    ? results.recommendations.filter(rec => rec.category === selectedCategory)
    : results.recommendations;

  const categories = [...new Set(results.recommendations.map(rec => rec.category))];

  return (
    <div className="space-y-6">
      {isMockData && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is sample analysis data. For real AI-powered analysis, please try uploading a different file format like .txt.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="col-span-1 md:col-span-8 overflow-hidden border-0 shadow-md bg-gradient-to-br from-card to-background">
          <CardHeader className="flex-row justify-between items-center pb-2 space-y-0 bg-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Resume Score
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Overall</span>
              <div className={`text-2xl font-bold ${scoreColor(results.overallScore)}`}>
                {results.overallScore}/100
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Quality</span>
                <span className="text-sm font-medium">{results.overallScore}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${progressColorClass(results.overallScore)}`} 
                  style={{ width: `${results.overallScore}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {results.overallScore >= 80 ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Your resume is well-optimized
                  </span>
                ) : results.overallScore >= 60 ? (
                  <span className="flex items-center gap-1">
                    <TriangleAlert className="h-3 w-3 text-yellow-500" />
                    Your resume needs some improvements
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-red-500" />
                    Your resume needs significant improvements
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(results.sections).map(([key, section]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <Label className="text-sm capitalize flex items-center gap-1">
                      {key === "experience" && <Calendar className="h-3 w-3" />}
                      {key === "education" && <BookOpen className="h-3 w-3" />}
                      {key === "skills" && <ListChecks className="h-3 w-3" />}
                      {key === "summary" && <FileText className="h-3 w-3" />}
                      {key}
                    </Label>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${scoreColor(section.score)}`}>
                        {section.score}%
                      </span>
                      <span>{getScoreEmoji(section.score)}</span>
                    </div>
                  </div>
                  <Progress
                    value={section.score}
                    className="h-2"
                    indicatorClassName={progressColor(section.score)}
                  />
                  <p className="text-xs text-muted-foreground">{section.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-4 border-0 shadow-md bg-gradient-to-br from-card to-background overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Key Insights
            </CardTitle>
            <CardDescription>Areas to focus on improving</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {results.keyInsights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border flex items-start gap-2 
                  ${insight.type === "positive" ? "bg-green-50 border-green-100" : 
                    insight.type === "warning" ? "bg-yellow-50 border-yellow-100" : 
                    "bg-red-50 border-red-100"}`}>
                  {insight.type === "positive" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : insight.type === "warning" ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-card to-background">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BadgePlus className="h-4 w-4 text-indigo-500" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Detailed suggestions for improvement</CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`text-xs ${selectedCategory === null ? 'bg-primary/10' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className={`text-xs flex items-center gap-1 ${selectedCategory === category ? 'bg-primary/10' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {getCategoryIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
            {filteredRecommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-3 items-start">
                  {getCategoryIcon(rec.category)}
                  <div>
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    {rec.examples && (
                      <div className="mt-2 pl-4 border-l-2 border-primary/20">
                        <span className="text-xs font-medium">Example:</span>
                        <p className="text-sm italic">{rec.examples}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <CollapsibleContent className="space-y-4">
              {filteredRecommendations.slice(3).map((rec, index) => (
                <div key={index + 3} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-3 items-start">
                    {getCategoryIcon(rec.category)}
                    <div>
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      {rec.examples && (
                        <div className="mt-2 pl-4 border-l-2 border-primary/20">
                          <span className="text-xs font-medium">Example:</span>
                          <p className="text-sm italic">{rec.examples}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CollapsibleContent>

            {filteredRecommendations.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center mx-auto"
              >
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" /> Show More
                  </>
                )}
              </Button>
            )}
          </Collapsible>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-card to-background">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            ATS Compatibility
          </CardTitle>
          <CardDescription>How well your resume performs with Applicant Tracking Systems</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(results.atsScores).map(([key, score]) => (
              <div key={key} className="p-4 border rounded-lg bg-gradient-to-br from-white to-muted/10 shadow-sm flex flex-col items-center">
                <div className={`text-3xl font-bold mb-2 ${scoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-sm capitalize">{key}</p>
                <div className="w-full mt-2">
                  <Progress
                    value={score}
                    className="h-1.5"
                    indicatorClassName={progressColor(score)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-white to-muted/10 shadow-sm">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Industry Keywords Detected
            </h4>
            <div className="flex flex-wrap gap-2">
              {results.detectedKeywords.map((keyword, index) => (
                <span 
                  key={index} 
                  className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 
                    transition-colors rounded-full flex items-center gap-1 shadow-sm"
                >
                  <Pencil className="h-3 w-3" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
