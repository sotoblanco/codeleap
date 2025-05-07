'use client';

import type { editor } from 'monaco-editor'; // Using type import
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, RefreshCw, CheckCircle, Wand2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodePanelProps {
  initialCode: string;
  onRunCode: (code: string) => void;
  onImproveCode: (code: string) => Promise<void>;
  onSubmitCode: (code: string) => Promise<void>;
  isLoadingImprove: boolean;
  isLoadingSubmit: boolean;
}

// Basic placeholder for syntax highlighting. In a real app, use Monaco or CodeMirror.
const SyntaxHighlightedCode = ({ code }: { code: string }) => {
  // Basic Python keyword highlighting
  const highlightKeywords = (line: string) => {
    const keywords = ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'print', 'True', 'False', 'None'];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    return line.replace(keywordRegex, '<span class="text-sky-400">$1</span>')
               .replace(/(\".*?\")/g, '<span class="text-green-400">$1</span>') // Strings
               .replace(/(\'.*?\')/g, '<span class="text-green-400">$1</span>') // Strings
               .replace(/(#.*)/g, '<span class="text-slate-500">$1</span>'); // Comments
  };

  return (
    <pre className="p-4 rounded-md bg-gray-800 text-gray-100 overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm leading-relaxed">
      {code.split('\n').map((line, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: highlightKeywords(line) || ' ' }} />
      ))}
    </pre>
  );
};


export function CodePanel({
  initialCode,
  onRunCode,
  onImproveCode,
  onSubmitCode,
  isLoadingImprove,
  isLoadingSubmit,
}: CodePanelProps) {
  const [code, setCode] = useState(initialCode);
  const [showSyntaxHighlighted, setShowSyntaxHighlighted] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleImproveCode = async () => {
    await onImproveCode(code);
  };

  const handleSubmitCode = async () => {
    await onSubmitCode(code);
  };

  return (
    <Card className="h-full flex flex-col bg-primary text-primary-foreground shadow-2xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary-foreground">Python Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 relative">
        <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSyntaxHighlighted(!showSyntaxHighlighted)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              {showSyntaxHighlighted ? "Edit" : "Preview"}
            </Button>
        </div>
        {showSyntaxHighlighted ? (
          <ScrollArea className="h-full flex-grow p-4">
             <SyntaxHighlightedCode code={code} />
          </ScrollArea>
        ) : (
          <Textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your Python code here..."
            className="flex-grow w-full h-full p-4 bg-gray-800 text-gray-100 border-0 rounded-none resize-none focus:ring-0 focus:border-accent font-mono text-sm leading-relaxed"
            spellCheck="false"
          />
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-primary-foreground/20">
        <div className="flex gap-2">
          <Button
            onClick={() => onRunCode(code)}
            variant="secondary"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Run code"
          >
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
          <Button
            onClick={handleImproveCode}
            variant="secondary"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
            disabled={isLoadingImprove}
            aria-label="Improve code"
          >
            {isLoadingImprove ? (
              <LoadingSpinner size={16} className="mr-2" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Improve
          </Button>
        </div>
        <Button
          onClick={handleSubmitCode}
          variant="default"
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={isLoadingSubmit}
          aria-label="Submit code"
        >
          {isLoadingSubmit ? (
            <LoadingSpinner size={16} className="mr-2 text-white" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
}
