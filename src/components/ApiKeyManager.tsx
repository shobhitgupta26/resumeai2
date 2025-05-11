
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiKeyService, ApiKeys } from "@/services/ApiKeyService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Lock, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ApiKeyManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const hasGeminiKey = apiKeyService.hasApiKey("GEMINI_API_KEY");

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    apiKeyService.setApiKey("GEMINI_API_KEY", apiKey.trim());
    setApiKey("");
    setIsOpen(false);
    
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved for this session",
    });
  };

  const removeApiKey = () => {
    apiKeyService.removeApiKey("GEMINI_API_KEY");
    
    toast({
      title: "API Key Removed",
      description: "Your API key has been removed",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={hasGeminiKey ? "outline" : "default"}
          size="sm" 
          className="gap-2"
        >
          {hasGeminiKey ? (
            <>
              <Check className="h-4 w-4" />
              <span>API Key Set</span>
            </>
          ) : (
            <>
              <Key className="h-4 w-4" />
              <span>Set API Key</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Your API keys are stored locally</AlertTitle>
            <AlertDescription>
              API keys are stored in your browser's local storage and are only used on your device.
              In production, these should be set as environment variables.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <label htmlFor="gemini-key" className="text-sm font-medium">
              Gemini API Key
            </label>
            <Input
              id="gemini-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://ai.google.dev/" target="_blank" rel="noreferrer" className="underline">Google AI Studio</a>
            </p>
          </div>
          
          <div className="flex justify-between">
            {hasGeminiKey && (
              <Button variant="outline" onClick={removeApiKey} className="gap-2">
                <X className="h-4 w-4" />
                Remove Key
              </Button>
            )}
            <Button onClick={saveApiKey} className="gap-2 ml-auto">
              <Check className="h-4 w-4" />
              Save Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
