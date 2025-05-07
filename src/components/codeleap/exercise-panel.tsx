
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, BookOpen, MessageSquare, Zap, Maximize2, Minimize2 } from 'lucide-react';
import type { Exercise, Explanation, Feedback, LearningMode } from './types';
import { LoadingSpinner } from './loading-spinner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const SimpleMarkdown = ({ content }: { content: string }) => {
  // Sanitize potentially problematic sequences like '$&' which can have special meaning in regex replacement
  let html = content.replace(/\$&/g, '&#36;&amp;').trim();

  // Code blocks (```python ... ``` or ``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : '';
    // Escape HTML characters inside code blocks
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre class="bg-muted p-2 rounded-md overflow-x-auto my-2"><code class="${languageClass}">${escapedCode.trim()}</code></pre>`;
  });
  
  // Inline code (`code`)
  html = html.replace(/`([^`]+?)`/g, (match, code) => {
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">${escapedCode}</code>`;
  });

  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^\*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/(?<!\*)\*([^\*]+?)\*(?!\*)/g, '<em>$1</em>'); // Avoid ** turning into *<em>
  html = html.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');   // Avoid __ turning into _<em>

  // Links [text](url)
  html = html.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>');

  // Split into lines to process lists and paragraphs
  const lines = html.split('\n');
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  const processedLines: string[] = [];

  for (const line of lines) {
    let processedLine = line;
    const ulMatch = line.match(/^(\s*)([*-+])\s+(.*)/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(listType === 'ol' ? '</ol>' : '</ul>'); // Close previous list
        processedLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      processedLine = `<li>${ulMatch[3]}</li>`;
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(listType === 'ul' ? '</ul>' : '</ol>'); // Close previous list
        processedLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      processedLine = `<li>${olMatch[3]}</li>`;
    } else {
      if (inList) {
        processedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
        inList = false;
        listType = null;
      }
      // Wrap non-list, non-block lines in <p> tags if they are not empty
      // and don't already look like an HTML tag
      if (processedLine.trim() !== '' && !processedLine.trim().startsWith('<')) {
        processedLine = `<p>${processedLine}</p>`;
      }
    }
    processedLines.push(processedLine);
  }

  if (inList) { // Close any open list at the end
    processedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
  }

  html = processedLines.join('\n');
  
  // Clean up: remove <p> tags around block elements like <pre>, <ul>, <ol>, <blockquote>
  html = html.replace(/<p>\s*(<(?:pre|ul|ol|blockquote|h[1-6]|hr)[^>]*>[\s\S]*?<\/(?:pre|ul|ol|blockquote|h[1-6]|hr)>)\s*<\/p>/gi, '$1');
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  // Consolidate multiple newlines from processing into single ones where appropriate (visual spacing is usually CSS controlled)
  html = html.replace(/\n\n+/g, '\n');


  return <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
};


interface ExercisePanelProps {
  exercise: Exercise | null;
  explanation: Explanation | null;
  feedback: Feedback | null;
  isLoadingExercise: boolean;
  isLoadingExplanation: boolean;
  isLoadingFeedback: boolean;
  onExplainConcept: () => Promise<void>;
  learningMode: LearningMode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  className?: string;
}

export function ExercisePanel({
  exercise,
  explanation,
  feedback,
  isLoadingExercise,
  isLoadingExplanation,
  isLoadingFeedback,
  onExplainConcept,
  learningMode,
  isExpanded,
  onToggleExpand,
  className,
}: ExercisePanelProps) {
  return (
    <Card className={cn("h-full flex flex-col shadow-xl rounded-lg", className)}>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
            <CardTitle className="text-2xl font-bold text-primary">
            {learningMode === 'challenge' ? <Zap className="inline h-6 w-6 mr-2 text-orange-500" /> : <Lightbulb className="inline h-6 w-6 mr-2 text-blue-500" />}
            Coding {learningMode === 'challenge' ? 'Challenge' : 'Exercise'}
            </CardTitle>
            <CardDescription>
            {learningMode === 'challenge'
                ? 'Solve the problem from scratch. Good luck!'
                : 'Read the instructions and complete the code.'}
            </CardDescription>
        </div>
        <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="text-primary hover:bg-muted h-7 w-7"
            aria-label={isExpanded ? "Minimize panel" : "Expand panel"}
            aria-expanded={isExpanded}
        >
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0 min-h-0">
        <Tabs defaultValue="question" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-auto sticky top-0 bg-muted/50 p-1 rounded-none border-b">
            <TabsTrigger value="question" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Lightbulb className="mr-2 h-4 w-4" /> Question
            </TabsTrigger>
            <TabsTrigger value="explanation" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <BookOpen className="mr-2 h-4 w-4" /> Explanation
            </TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <MessageSquare className="mr-2 h-4 w-4" /> Feedback
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow p-6">
            <TabsContent value="question">
              {isLoadingExercise ? (
                <div className="flex justify-center items-center h-40">
                  <LoadingSpinner size={32} />
                </div>
              ) : exercise ? (
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-foreground">
                     <SimpleMarkdown content={exercise.question} />
                  </div>

                  {learningMode === 'hand-holding' && exercise.codeSnippet && (
                    <p className="text-muted-foreground">
                      Fill in the blanks or complete the code snippet provided in the editor.
                    </p>
                  )}
                  {learningMode === 'challenge' && (
                    <p className="text-muted-foreground">
                      Write the Python code to solve this problem. You'll need to start from scratch in the editor.
                    </p>
                  )}

                  {exercise.topic && (
                     <Alert>
                       <Lightbulb className="h-4 w-4" />
                       <AlertTitle>Topic: {exercise.topic}</AlertTitle>
                       <AlertDescription>
                         Focus on concepts related to {exercise.topic.toLowerCase()} to solve this.
                         {exercise.documentation && <div className="mt-2 text-xs"><strong className="font-semibold">Hint:</strong> <SimpleMarkdown content={exercise.documentation.substring(0,250) + (exercise.documentation.length > 250 ? "..." : "")}/></div>}
                       </AlertDescription>
                     </Alert>
                  )}
                </div>
              ) : (
                 <div className="text-center py-8">
                    <p className="text-muted-foreground">No exercise loaded yet. <br/> If you pasted content, try generating a learning plan. Otherwise, a default exercise will load shortly.</p>
                 </div>
              )}
            </TabsContent>

            <TabsContent value="explanation">
              {isLoadingExplanation ? (
                 <div className="flex justify-center items-center h-40">
                  <LoadingSpinner size={32} />
                </div>
              ) : explanation ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1 prose prose-sm dark:prose-invert">Simplified Explanation:</h4>
                    <SimpleMarkdown content={explanation.explanation} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 mt-3 prose prose-sm dark:prose-invert">Breakdown:</h4>
                    <SimpleMarkdown content={explanation.breakdown} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 mt-3 prose prose-sm dark:prose-invert">Application to Example:</h4>
                    <SimpleMarkdown content={explanation.application} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {exercise ? "Click below to get an explanation for the current topic." : "Load an exercise first to get an explanation."}
                  </p>
                   <Button
                    onClick={onExplainConcept}
                    disabled={isLoadingExplanation || !exercise}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 flex items-center mx-auto"
                  >
                    {isLoadingExplanation && <LoadingSpinner size={16} className="mr-2" />}
                    Explain Concepts
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback">
               {isLoadingFeedback ? (
                 <div className="flex justify-center items-center h-40">
                  <LoadingSpinner size={32} />
                </div>
              ) : feedback ? (
                <Alert variant={feedback.isCorrect === false ? "destructive" : "default"} className={feedback.isCorrect === true ? "bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700" : ""}>
                   <AlertTitle className={feedback.isCorrect === true ? "text-green-700 dark:text-green-300" : feedback.isCorrect === false ? "text-destructive-foreground" : ""}>
                    {feedback.isCorrect === true ? "Correct!" : feedback.isCorrect === false ? "Needs Improvement" : "Feedback"}
                  </AlertTitle>
                  <AlertDescription>
                    {feedback.message && <p className="mb-2">{feedback.message}</p>}
                    {feedback.suggestions && (
                      <>
                        <h5 className="font-semibold mt-2 prose prose-sm dark:prose-invert">Suggestions:</h5>
                        <SimpleMarkdown content={feedback.suggestions} />
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                 <div className="text-center py-8">
                    <p className="text-muted-foreground">Submit your code to get feedback, or click "Improve" for suggestions.</p>
                 </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
