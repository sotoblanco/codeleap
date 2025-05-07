
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, BookOpen, MessageSquare, Zap, Maximize2, Minimize2 } from 'lucide-react';
import type { Exercise, Explanation, Feedback } from '@/app/codeleap/page-client';
import { LoadingSpinner } from './loading-spinner';
import { Button } from '@/components/ui/button';
import type { LearningMode } from '@/app/codeleap/page-client';
import { cn } from '@/lib/utils';


const SimpleMarkdown = ({ content }: { content: string }) => {
  let html = content.replace(/\b\$&\b/g, '').trim(); // Remove problematic sequence if present

  // Code blocks (```python ... ``` or ``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const languageClass = lang ? `language-${lang}` : '';
    return `<pre class="bg-muted p-2 rounded-md overflow-x-auto my-2"><code class="${languageClass}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`;
  });
  
  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_)
  // Ensure it doesn't conflict with list markers by checking for space before/after or start/end of line for standalone italics
  html = html.replace(/(^|\s)\*([^\*\s][^\*]*?)\*(\s|$)/g, '$1<em>$2</em>$3');
  html = html.replace(/(^|\s)_([^\_\s][^_]*?)_(\s|$)/g, '$1<em>$2</em>$3');


  // Unordered lists (*, -, +) - basic handling
  html = html.replace(/^\s*([*-+])\s+(.+)/gm, (match, marker, item) => `<li>${item.trim()}</li>`);
  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
    // check if already wrapped
    if (match.startsWith('<ul>') || match.startsWith('<ol>')) return match;
    return `<ul>${match.trim()}</ul>`;
  });


  // Ordered lists (1., 2.) - basic handling
  html = html.replace(/^\s*(\d+)\.\s+(.+)/gm, (match, number, item) => `<li>${item.trim()}</li>`);
  // Wrap consecutive <li> items in <ol>
  html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
     // check if already wrapped or part of ul
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = match;
    const firstChild = tempDiv.firstChild as HTMLElement;

    if (match.startsWith('<ol>') || match.startsWith('<ul>')) return match;
    if (firstChild && firstChild.tagName === 'LI' && !isNaN(parseInt(firstChild.textContent || '',10))) {
         // Check if it looks like an ordered list item start
        const firstLiContent = firstChild.innerHTML;
        if(/^\d+\./.test(firstLiContent.trim())) return `<ol>${match.trim()}</ol>`; // Heuristic: if it starts like "1. item" then it's OL
    }

    // If it was matched by UL regex first, it will be wrapped by UL. This attempts to re-classify if it's actually an OL.
    // This is a bit tricky with simple regex. A more robust parser would be better.
    // For now, this logic assumes if it wasn't caught by UL's more specific start markers, and it has numbers, it might be OL.
    // This is a simplification and might misclassify.
    // The previous regex for OL tries to handle it, but wrapping is tricky.
    
    // Attempt to differentiate: if the first li's content starts with a number.
    const firstLiText = match.match(/<li>(.*?)<\/li>/);
    if (firstLiText && /^\s*\d+\s*/.test(firstLiText[1])) {
         if (match.startsWith('<ul>')) return match; // if already UL, respect it
         return `<ol>${match.trim()}</ol>`;
    }
    // Default to UL if not clearly OL from previous regex
    if (match.startsWith('<ul>')) return match;
    return `<ul>${match.trim()}</ul>`;

  });
  
  // Paragraphs (simple: replace double newlines with <p> tags)
  // This needs to be careful not to wrap existing blocks like <ul>, <ol>, <pre>
  // A more robust solution would parse into blocks first.
  // For now, let's just convert remaining newlines to <br> if they are not part of other structures.
  // The .prose class usually handles paragraph spacing.
  // Let's convert newlines that are not inside pre/code or after li/p
  html = html.split('\n').map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<') && (trimmedLine.endsWith('>') || trimmedLine.includes('</'))) {
      // Likely already HTML, don't wrap in <p>
      return line;
    }
    if (trimmedLine === '') return ''; // Keep empty lines as they might be for spacing between markdown blocks
    return `<p>${line}</p>`;
  }).join('');

  // Clean up: remove <p> tags around block elements like <pre>, <ul>, <ol>
  html = html.replace(/<p>\s*(<(?:pre|ul|ol|h[1-6]|blockquote|hr)[^>]*>[\s\S]*?<\/(?:pre|ul|ol|h[1-6]|blockquote|hr)>)\s*<\/p>/gi, '$1');
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');


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
