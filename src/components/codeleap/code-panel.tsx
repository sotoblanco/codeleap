'use client';

import type { editor } from 'monaco-editor'; // Using type import
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play, Wand2, CheckCircle, Eye, Code, Terminal } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from './loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodePanelProps {
  initialCode: string;
  onRunCode: (code: string) => void; // This prop will still be called (e.g., for a toast)
  onImproveCode: (code: string) => Promise<void>;
  onSubmitCode: (code: string) => Promise<void>;
  isLoadingImprove: boolean;
  isLoadingSubmit: boolean;
  showCodeEditor: boolean;
}

// Basic placeholder for syntax highlighting.
const SyntaxHighlightedCode = ({ code }: { code: string }) => {
  const highlightKeywords = (line: string) => {
    const keywords = ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'import', 'from', 'print', 'True', 'False', 'None', 'async', 'await', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'pass', 'continue', 'break', 'global', 'nonlocal', 'assert', 'del', 'in', 'is', 'not', 'or', 'and'];
    const builtInFunctions = ['abs', 'all', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip', '__import__'];
    
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    const builtInRegex = new RegExp(`\\b(${builtInFunctions.join('|')})(?=\\()`, 'g');
    const stringRegex = /(\"[^\"\\]*(?:\\.[^\"\\]*)*\"|\'[^\'\\]*(?:\\.[^\'\\]*)*\')/g;
    const numberRegex = /\b(\d+\.?\d*)\b/g;
    const commentRegex = /(#.*)/;

    const commentMatch = line.match(commentRegex);
    let codePart = line;
    let commentPart = '';

    if (commentMatch) {
      codePart = line.substring(0, commentMatch.index);
      commentPart = commentMatch[0];
    }

    let highlightedCodePart = codePart
      .replace(keywordRegex, '<span class="text-sky-400 font-semibold">$1</span>')
      .replace(builtInRegex, '<span class="text-purple-400">$1</span>')
      .replace(stringRegex, '<span class="text-green-400">$1</span>')
      .replace(numberRegex, '<span class="text-yellow-400">$1</span>');
    
    if (commentPart) {
      return highlightedCodePart + `<span class="text-slate-500 italic">${commentPart}</span>`;
    }
    return highlightedCodePart;
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
  showCodeEditor,
}: CodePanelProps) {
  const [code, setCode] = useState(initialCode);
  const [showSyntaxHighlighted, setShowSyntaxHighlighted] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null); // For simulated output
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(initialCode);
    setConsoleOutput(null); // Reset console on new exercise/code
    setShowSyntaxHighlighted(showCodeEditor ? false : !!initialCode);
  }, [initialCode, showCodeEditor]);

  const simulatePrintStatements = (currentCode: string): string => {
    const MAX_ITERATIONS = 100;
    let iterations = 0;
    const printRegex = /print\s*\(\s*(?:f(["'])(.*?)\1|(["'])(.*?)\3|([^)]+?))\s*\)/g;
    let match;
    const outputs: string[] = [];

    while ((match = printRegex.exec(currentCode)) !== null && iterations < MAX_ITERATIONS) {
      iterations++;
      const fStringContent = match[2];
      const regularStringContent = match[4];
      const expressionContent = match[5];

      if (fStringContent !== undefined) {
        outputs.push(`f"${fStringContent}"`); 
      } else if (regularStringContent !== undefined) {
        outputs.push(regularStringContent);
      } else if (expressionContent !== undefined) {
        outputs.push(`[Output for: ${expressionContent.trim()}]`);
      }
    }

    if (iterations >= MAX_ITERATIONS) {
        outputs.push("[Simulation limit reached due to too many print statements or complex regex processing]");
    }

    if (outputs.length === 0) {
      return "No print() statements found or code did not produce direct output via print(). (Simulated)";
    }
    return outputs.join('\n');
  };

  const handleInternalRunCode = () => {
    const output = simulatePrintStatements(code);
    setConsoleOutput(output);
    onRunCode(code); // Call the prop, which might show a toast or log
  };

  const handleImproveCode = async () => {
    await onImproveCode(code);
  };

  const handleSubmitCode = async () => {
    await onSubmitCode(code);
  };

  const editorVisible = showCodeEditor && !showSyntaxHighlighted;
  const previewVisible = showSyntaxHighlighted || !showCodeEditor;

  return (
    <Card className="h-full flex flex-col bg-primary text-primary-foreground shadow-2xl rounded-lg">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-semibold text-primary-foreground">Python Editor</CardTitle>
         {showCodeEditor && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSyntaxHighlighted(!showSyntaxHighlighted)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              aria-label={showSyntaxHighlighted ? "Switch to Edit Mode" : "Switch to Preview Mode"}
            >
              {showSyntaxHighlighted ? <Code className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
              {showSyntaxHighlighted ? "Edit" : "Preview"}
            </Button>
          )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 relative">
        {/* Editor/Preview Area */}
        <div className="flex-grow p-0 relative min-h-0">
          {editorVisible ? (
            <Textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your Python code here..."
              className="absolute inset-0 w-full h-full p-4 bg-gray-800 text-gray-100 border-0 rounded-none resize-none focus:ring-0 focus:border-accent font-mono text-sm leading-relaxed"
              spellCheck="false"
              aria-label="Python code editor"
            />
          ) : previewVisible && code.trim() ? (
            <ScrollArea className="absolute inset-0">
              {/* SyntaxHighlightedCode already has p-4 and bg */}
              <SyntaxHighlightedCode code={code} />
            </ScrollArea>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <p className="text-muted-foreground text-center">
                {showCodeEditor 
                  ? "Start typing Python code or switch to Preview." 
                  : "Code preview is shown here. Switch to 'Hand-holding' mode or select an exercise with a snippet to edit."}
              </p>
            </div>
          )}
        </div>

        {/* Console Output Area */}
        {consoleOutput !== null && (
          <div className="p-4 border-t border-primary-foreground/20">
            <h4 className="mb-2 text-sm font-semibold text-primary-foreground/80 flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              Console Output <span className="ml-1 text-xs font-normal text-primary-foreground/60">(Simulated)</span>
            </h4>
            <ScrollArea className="max-h-32">
              <pre className="text-xs bg-gray-800 text-gray-100 p-2 rounded-md whitespace-pre-wrap break-all font-mono">
                {consoleOutput}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-primary-foreground/20">
        <div className="flex gap-2">
          <Button
            onClick={handleInternalRunCode}
            variant="secondary"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Run code"
            disabled={!code.trim()}
          >
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
          <Button
            onClick={handleImproveCode}
            variant="secondary"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
            disabled={isLoadingImprove || !code.trim()}
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
          className="bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
          disabled={isLoadingSubmit || !code.trim()}
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
