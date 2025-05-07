
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, BookOpen, MessageSquare, Zap } from 'lucide-react';
import type { Exercise, Explanation, Feedback } from '@/app/codeleap/page-client';
import { LoadingSpinner } from './loading-spinner';
import { Button } from '@/components/ui/button'; 
import type { LearningMode } from '@/app/codeleap/page-client';


const SimpleMarkdown = ({ content }: { content: string }) => {
  // Clean up standalone "$&" tokens. \b ensures it's a "word" boundary.
  let text = content.replace(/\b\$&\b/g, '').trim();

  // Process unordered lists (lines starting with '-' or '*')
  // Converts them to <li> items, then wraps blocks of <li> into <ul>
  text = text.replace(/^\s*[-*]\s+(.+)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, (match) => {
    if (match.trim().startsWith('<ul>') || match.trim().startsWith('<ol>')) {
      return match; // Avoid re-wrapping
    }
    return `<ul>${match.trim()}</ul>`;
  });

  // Process ordered lists (lines starting with '1.', '2.', etc.)
  // Converts them to <li> items, then wraps blocks of <li> into <ol>
  // (if not already part of a <ul>)
  text = text.replace(/^\s*\d+\.\s+(.+)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, (match, _p1, offset, string) => {
    const precedingContext = string.substring(Math.max(0, offset - 15), offset);
    // If it looks like it's inside a <ul> or already wrapped, don't wrap in <ol>
    if (precedingContext.match(/<ul>\s*$/si) || match.trim().startsWith('<ul>') || match.trim().startsWith('<ol>')) {
      return match;
    }
    return `<ol>${match.trim()}</ol>`;
  });

  // Convert newlines to <br />
  // This should be done carefully to avoid <br/> inside list structures if not desired.
  // For simplicity here, it's a global replacement.
  text = text.replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: text }} />;
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
}: ExercisePanelProps) {
  return (
    <Card className="h-full flex flex-col shadow-xl rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-primary">
          {learningMode === 'challenge' ? <Zap className="inline h-6 w-6 mr-2 text-orange-500" /> : <Lightbulb className="inline h-6 w-6 mr-2 text-blue-500" />}
          Coding {learningMode === 'challenge' ? 'Challenge' : 'Exercise'}
        </CardTitle>
        <CardDescription>
          {learningMode === 'challenge' 
            ? 'Solve the problem from scratch. Good luck!' 
            : 'Read the instructions and complete the code.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0 min-h-0"> {/* Added min-h-0 here */}
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
                  <h3 className="text-lg font-semibold text-foreground">{exercise.question}</h3>
                  
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
                         {exercise.documentation && <div className="mt-2 text-xs prose prose-xs max-w-none dark:prose-invert"><strong className="font-semibold">Hint:</strong> <SimpleMarkdown content={exercise.documentation.substring(0,250) + (exercise.documentation.length > 250 ? "..." : "")}/></div>}
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
                <div className="space-y-4 prose prose-sm max-w-none dark:prose-invert">
                  <div>
                    <h4 className="font-semibold mb-1">Simplified Explanation:</h4>
                    <SimpleMarkdown content={explanation.explanation} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 mt-3">Breakdown:</h4>
                    <SimpleMarkdown content={explanation.breakdown} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 mt-3">Application to Example:</h4>
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
                  <AlertDescription className="prose prose-sm max-w-none dark:prose-invert">
                    {feedback.message && <p>{feedback.message}</p>}
                    {feedback.suggestions && (
                      <>
                        <h5 className="font-semibold mt-2">Suggestions:</h5>
                        {/* Render suggestions as Markdown if they might contain it */}
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

