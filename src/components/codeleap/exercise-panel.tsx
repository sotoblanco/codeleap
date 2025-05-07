'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, BookOpen, MessageSquare } from 'lucide-react';
import type { Exercise, Explanation, Feedback } from '@/app/codeleap/page-client';
import { LoadingSpinner } from './loading-spinner';

interface ExercisePanelProps {
  exercise: Exercise | null;
  explanation: Explanation | null;
  feedback: Feedback | null;
  isLoadingExercise: boolean;
  isLoadingExplanation: boolean;
  isLoadingFeedback: boolean;
  onExplainConcept: () => Promise<void>;
}

export function ExercisePanel({
  exercise,
  explanation,
  feedback,
  isLoadingExercise,
  isLoadingExplanation,
  isLoadingFeedback,
  onExplainConcept,
}: ExercisePanelProps) {
  return (
    <Card className="h-full flex flex-col shadow-xl rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-primary">Coding Challenge</CardTitle>
        <CardDescription>Read the instructions and complete the code.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
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
                  <p className="text-muted-foreground">
                    Fill in the blanks or complete the code snippet provided in the editor.
                  </p>
                  {/* Example of using documentation, can be expanded */}
                  {exercise.topic && (
                     <Alert>
                       <Lightbulb className="h-4 w-4" />
                       <AlertTitle>Topic: {exercise.topic}</AlertTitle>
                       <AlertDescription>
                         Focus on concepts related to {exercise.topic.toLowerCase()} to solve this exercise.
                       </AlertDescription>
                     </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No exercise loaded. Click "New Exercise" to start.</p>
              )}
            </TabsContent>

            <TabsContent value="explanation">
              {isLoadingExplanation ? (
                 <div className="flex justify-center items-center h-40">
                  <LoadingSpinner size={32} />
                </div>
              ) : explanation ? (
                <div className="space-y-4 prose prose-sm max-w-none">
                  <h4 className="font-semibold">Simplified Explanation:</h4>
                  <p>{explanation.explanation}</p>
                  <h4 className="font-semibold">Breakdown:</h4>
                  <p>{explanation.breakdown}</p>
                  <h4 className="font-semibold">Application:</h4>
                  <p>{explanation.application}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Click below to get an explanation for the current topic.</p>
                   <button 
                    onClick={onExplainConcept}
                    disabled={isLoadingExplanation || !exercise}
                    className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 flex items-center mx-auto"
                  >
                    {isLoadingExplanation && <LoadingSpinner size={16} className="mr-2" />}
                    Explain Concepts
                  </button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback">
               {isLoadingFeedback ? (
                 <div className="flex justify-center items-center h-40">
                  <LoadingSpinner size={32} />
                </div>
              ) : feedback ? (
                <Alert variant={feedback.isCorrect ? "default" : "destructive"} className={feedback.isCorrect ? "bg-green-50 border-green-300" : ""}>
                   <AlertTitle className={feedback.isCorrect ? "text-green-700" : ""}>
                    {feedback.isCorrect ? "Correct!" : "Needs Improvement"}
                  </AlertTitle>
                  <AlertDescription className="prose prose-sm max-w-none">
                    {feedback.message && <p>{feedback.message}</p>}
                    {feedback.suggestions && (
                      <>
                        <h5 className="font-semibold mt-2">Suggestions:</h5>
                        <p>{feedback.suggestions}</p>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-muted-foreground">Submit your code to get feedback.</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
