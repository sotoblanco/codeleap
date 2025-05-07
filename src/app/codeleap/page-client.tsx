'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/codeleap/app-header';
import { CodePanel } from '@/components/codeleap/code-panel';
import { ExercisePanel } from '@/components/codeleap/exercise-panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateExerciseAction, improveCodeAction, explainConceptAction } from '../actions';
import { RefreshCcw } from 'lucide-react';
import { LoadingSpinner } from '@/components/codeleap/loading-spinner';

export interface Exercise {
  question: string;
  codeSnippet: string;
  solution: string;
  topic: string;
  documentation: string; // Added for explainConcept
  exampleCode: string; // Added for explainConcept
}

export interface Feedback {
  message?: string;
  suggestions?: string;
  isCorrect?: boolean;
}

export interface Explanation {
  explanation: string;
  breakdown: string;
  application: string;
}

// Default values for generating an exercise
const DEFAULT_TOPIC = "Basic Python Output and Variables";
const DEFAULT_DOCUMENTATION = "Python basics include variables for storing data (e.g., name = \"Alice\"), the print() function for displaying output (e.g., print(\"Hello\")), and f-strings for formatted output (e.g., print(f\"Hello, {name}\")). Arithmetic operations like addition (+), subtraction (-), multiplication (*), and division (/) are also fundamental.";
const DEFAULT_EXAMPLE_CODE = 
`name = "World"
print(f"Hello, {name}!")
x = 10
y = 5
sum_result = x + y
print(f"The sum of {x} and {y} is {sum_result}")

# Try to make a variable for your favorite food and print it.
# Then, try to calculate 100 divided by 4 and print the result.
`;

export function CodeLeapPageClient() {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);

  const [isLoadingExercise, setIsLoadingExercise] = useState(true);
  const [isLoadingImprove, setIsLoadingImprove] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const { toast } = useToast();

  const fetchNewExercise = useCallback(async () => {
    setIsLoadingExercise(true);
    setFeedback(null);
    setExplanation(null);
    try {
      const aiExercise = await generateExerciseAction({
        topic: DEFAULT_TOPIC,
        documentation: DEFAULT_DOCUMENTATION,
        exampleCode: DEFAULT_EXAMPLE_CODE,
      });
      setCurrentExercise({
        ...aiExercise,
        topic: DEFAULT_TOPIC, // Pass along for explanation context
        documentation: DEFAULT_DOCUMENTATION,
        exampleCode: DEFAULT_EXAMPLE_CODE
      });
      setUserCode(aiExercise.codeSnippet); // Initialize editor with snippet
    } catch (error) {
      toast({
        title: 'Error Generating Exercise',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
      setCurrentExercise(null); // Clear exercise on error
    } finally {
      setIsLoadingExercise(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNewExercise();
  }, [fetchNewExercise]);

  const handleRunCode = (code: string) => {
    // For now, this is a placeholder. In a real app, this would execute Python.
    console.log('Running code:', code);
    toast({
      title: 'Code "Run"',
      description: 'Code execution simulation. Output would appear in a console.',
    });
    // No feedback change for run, or a very generic one
  };

  const handleImproveCode = async (code: string) => {
    if (!currentExercise) {
      toast({ title: 'No Exercise', description: 'Load an exercise first.', variant: 'destructive' });
      return;
    }
    setIsLoadingImprove(true);
    setFeedback(null);
    try {
      const improvementSuggestions = await improveCodeAction({
        code,
        language: 'python',
        question: currentExercise.question,
      });
      setFeedback({
        suggestions: improvementSuggestions.improvements,
      });
      toast({ title: 'Suggestions Ready', description: 'Check the feedback panel for improvement tips.' });
    } catch (error) {
      toast({
        title: 'Error Getting Suggestions',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingImprove(false);
    }
  };

  const handleSubmitCode = async (code: string) => {
    if (!currentExercise) {
      toast({ title: 'No Exercise', description: 'Load an exercise first.', variant: 'destructive' });
      return;
    }
    setIsLoadingSubmit(true);
    setFeedback(null);
    try {
      const improvementSuggestions = await improveCodeAction({
        code,
        language: 'python',
        question: currentExercise.question,
      });

      // Basic correctness check (very naive)
      const normalize = (s: string) => s.replace(/\s+/g, '').trim();
      const isCorrect = normalize(code) === normalize(currentExercise.solution);

      setFeedback({
        message: isCorrect ? 'Your solution seems correct!' : 'Your solution might have some issues or could be improved.',
        suggestions: improvementSuggestions.improvements,
        isCorrect,
      });
      toast({
        title: isCorrect ? 'Submission Correct!' : 'Submission Feedback',
        description: 'Check the feedback panel.',
        variant: isCorrect ? 'default' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Error Submitting Code',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleExplainConcept = async () => {
    if (!currentExercise) {
      toast({ title: 'No Exercise Context', description: 'Load an exercise to explain its concepts.', variant: 'destructive' });
      return;
    }
    setIsLoadingExplanation(true);
    setExplanation(null);
    try {
      const conceptExplanation = await explainConceptAction({
        concept: currentExercise.topic,
        documentation: currentExercise.documentation,
        exampleCode: currentExercise.exampleCode,
      });
      setExplanation(conceptExplanation);
      toast({ title: 'Explanation Ready', description: 'Check the explanation panel.' });
    } catch (error) {
      toast({
        title: 'Error Explaining Concept',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingExplanation(false);
    }
  };
  

  return (
    <div className="flex flex-col h-screen bg-secondary">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 flex flex-col gap-4">
        <div className="flex justify-end">
          <Button onClick={fetchNewExercise} disabled={isLoadingExercise} variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
            {isLoadingExercise ? <LoadingSpinner size={16} className="mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            New Exercise
          </Button>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          <ExercisePanel
            exercise={currentExercise}
            explanation={explanation}
            feedback={feedback}
            isLoadingExercise={isLoadingExercise}
            isLoadingExplanation={isLoadingExplanation}
            isLoadingFeedback={isLoadingImprove || isLoadingSubmit}
            onExplainConcept={handleExplainConcept}
          />
          <CodePanel
            initialCode={currentExercise?.codeSnippet || userCode || "print('Hello, CodeLeap!')"}
            onRunCode={handleRunCode}
            onImproveCode={handleImproveCode}
            onSubmitCode={handleSubmitCode}
            isLoadingImprove={isLoadingImprove}
            isLoadingSubmit={isLoadingSubmit}
          />
        </div>
      </main>
    </div>
  );
}
