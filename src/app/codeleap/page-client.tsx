
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/codeleap/app-header';
import { CodePanel } from '@/components/codeleap/code-panel';
import { ExercisePanel } from '@/components/codeleap/exercise-panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { generateExerciseAction, improveCodeAction, explainConceptAction, generateLearningPlanAction } from '../actions';
import type { LearningStep, GenerateLearningPlanOutput } from '@/ai/flows/generate-learning-plan';
import type { GenerateExerciseInput } from '@/ai/flows/generate-exercise';
import { RefreshCcw, Zap, BookHeart, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/codeleap/loading-spinner';

export interface Exercise {
  question: string;
  codeSnippet?: string; // Optional for challenge mode
  solution: string;
  topic: string;
  documentation: string;
  exampleCode: string;
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

type LearningMode = 'hand-holding' | 'challenge';
type ExpandedPanel = 'exercise' | 'code' | null;

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
  const [learningContent, setLearningContent] = useState('');
  const [learningPlan, setLearningPlan] = useState<GenerateLearningPlanOutput | null>(null);
  const [currentPlanStepIndex, setCurrentPlanStepIndex] = useState<number | null>(null);

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [learningMode, setLearningMode] = useState<LearningMode>('hand-holding');
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanel>(null);

  const [isLoadingLearningPlan, setIsLoadingLearningPlan] = useState(false);
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);
  const [isLoadingImprove, setIsLoadingImprove] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const { toast } = useToast();

  const fetchExerciseForStep = useCallback(async (stepIndex: number, plan: GenerateLearningPlanOutput, mode: LearningMode) => {
    if (!plan || stepIndex < 0 || stepIndex >= plan.learningSteps.length) {
      toast({ title: 'Invalid Plan Step', description: 'Cannot fetch exercise for this step.', variant: 'destructive' });
      return;
    }
    setIsLoadingExercise(true);
    setFeedback(null);
    setExplanation(null);
    setCurrentExercise(null);
    setUserCode('');

    const step = plan.learningSteps[stepIndex];
    try {
      const exerciseInput: GenerateExerciseInput = {
        topic: step.topic,
        documentation: step.extractedDocumentation || DEFAULT_DOCUMENTATION,
        exampleCode: step.extractedExampleCode || DEFAULT_EXAMPLE_CODE,
        learningMode: mode,
      };
      const aiExercise = await generateExerciseAction(exerciseInput);
      setCurrentExercise({
        ...aiExercise,
        topic: step.topic,
        documentation: exerciseInput.documentation,
        exampleCode: exerciseInput.exampleCode,
      });
      setUserCode(aiExercise.codeSnippet || (mode === 'challenge' ? `# Start coding for: ${step.topic}\n# Documentation: ${exerciseInput.documentation.substring(0,100)}...\n# Example: ${exerciseInput.exampleCode.substring(0,100)}...\n` : ""));
      setCurrentPlanStepIndex(stepIndex);
    } catch (error) {
      toast({
        title: 'Error Generating Exercise',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingExercise(false);
    }
  }, [toast]);

  const handleGenerateLearningPlan = async () => {
    if (!learningContent.trim()) {
      toast({ title: 'Empty Content', description: 'Please paste some content to generate a plan.', variant: 'destructive' });
      return;
    }
    setIsLoadingLearningPlan(true);
    setLearningPlan(null);
    setCurrentExercise(null);
    setCurrentPlanStepIndex(null);
    setFeedback(null);
    setExplanation(null);
    setUserCode('');

    try {
      const plan = await generateLearningPlanAction({ content: learningContent });
      setLearningPlan(plan);
      if (plan.learningSteps.length > 0) {
        fetchExerciseForStep(0, plan, learningMode);
      } else {
        toast({ title: 'Empty Plan', description: 'The AI could not generate learning steps from the content.', variant: 'destructive'});
      }
    } catch (error) {
      toast({
        title: 'Error Generating Learning Plan',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLearningPlan(false);
    }
  };

  const fetchDefaultExercise = useCallback(async () => {
    setIsLoadingExercise(true);
    setFeedback(null);
    setExplanation(null);
    try {
      const aiExercise = await generateExerciseAction({
        topic: DEFAULT_TOPIC,
        documentation: DEFAULT_DOCUMENTATION,
        exampleCode: DEFAULT_EXAMPLE_CODE,
        learningMode: learningMode,
      });
      setCurrentExercise({
        ...aiExercise,
        topic: DEFAULT_TOPIC,
        documentation: DEFAULT_DOCUMENTATION,
        exampleCode: DEFAULT_EXAMPLE_CODE
      });
      setUserCode(aiExercise.codeSnippet || (learningMode === 'challenge' ? `# Start coding for: ${DEFAULT_TOPIC}\n` : ""));
    } catch (error) {
      toast({
        title: 'Error Generating Exercise',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingExercise(false);
    }
  }, [toast, learningMode]);

  useEffect(() => {
    if (!learningPlan) {
      fetchDefaultExercise();
    }
  }, [fetchDefaultExercise, learningPlan]);

  useEffect(() => {
    if (learningPlan && currentPlanStepIndex !== null) {
      fetchExerciseForStep(currentPlanStepIndex, learningPlan, learningMode);
    } else if (!learningPlan) {
        fetchDefaultExercise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningMode]);

  const handleRunCode = (code: string) => {
    console.log('Code submitted for simulation:', code);
    toast({
      title: 'Code "Run" Requested',
      description: 'Simulated output will appear in the console area below the editor.',
    });
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

      const normalize = (s: string) => s.replace(/\s+/g, '').trim();
      const isCorrect = normalize(code) === normalize(currentExercise.solution);

      setFeedback({
        message: isCorrect ? 'Your solution seems correct!' : 'Your solution might have some issues or could be improved. See suggestions.',
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

  const handleNextStep = () => {
    if (learningPlan && currentPlanStepIndex !== null && currentPlanStepIndex < learningPlan.learningSteps.length - 1) {
      fetchExerciseForStep(currentPlanStepIndex + 1, learningPlan, learningMode);
    } else {
      toast({ title: "End of Plan", description: "You've reached the last step of this learning plan."});
    }
  };

  const handlePrevStep = () => {
     if (learningPlan && currentPlanStepIndex !== null && currentPlanStepIndex > 0) {
      fetchExerciseForStep(currentPlanStepIndex - 1, learningPlan, learningMode);
    } else {
      toast({ title: "Start of Plan", description: "You are at the first step."});
    }
  };

  const handleTogglePanelExpand = (panel: 'exercise' | 'code') => {
    setExpandedPanel(current => current === panel ? null : panel);
  };

  const currentLearningStep = learningPlan && currentPlanStepIndex !== null ? learningPlan.learningSteps[currentPlanStepIndex] : null;

  return (
    <div className="flex flex-col h-screen bg-secondary">
      <AppHeader />
      <main className="flex-grow w-full max-w-screen-2xl mx-auto p-4 flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">What do you want to learn today?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your lecture notes, documentation, or any text content here..."
              value={learningContent}
              onChange={(e) => setLearningContent(e.target.value)}
              rows={6}
              className="bg-background border-border focus:ring-accent"
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <RadioGroup value={learningMode} onValueChange={(value: LearningMode) => setLearningMode(value)} className="flex gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hand-holding" id="r1" />
                        <Label htmlFor="r1" className="flex items-center gap-1"><BookHeart className="h-4 w-4 text-blue-500"/> Hand-holding Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="challenge" id="r2" />
                        <Label htmlFor="r2" className="flex items-center gap-1"><Zap className="h-4 w-4 text-orange-500"/> Challenge Mode</Label>
                    </div>
                </RadioGroup>
                <Button onClick={handleGenerateLearningPlan} disabled={isLoadingLearningPlan || !learningContent.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                {isLoadingLearningPlan ? <LoadingSpinner size={16} className="mr-2" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                Generate Learning Plan
                </Button>
            </div>
          </CardContent>
        </Card>

        {learningPlan && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Your Learning Plan: {learningPlan.title}</CardTitle>
               {currentLearningStep && <p className="text-sm text-muted-foreground">Current Step: {currentPlanStepIndex! + 1} of {learningPlan.learningSteps.length} - {currentLearningStep.topic}</p>}
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full" value={currentPlanStepIndex !== null ? `item-${currentPlanStepIndex}` : undefined}>
                {learningPlan.learningSteps.map((step, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger
                        onClick={() => fetchExerciseForStep(index, learningPlan, learningMode)}
                        disabled={isLoadingExercise && currentPlanStepIndex === index}
                        className={currentPlanStepIndex === index ? "text-accent" : ""}
                    >
                        Step {index + 1}: {step.topic}
                        {isLoadingExercise && currentPlanStepIndex === index && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                    </AccordionTrigger>
                    <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                      <p>{step.description}</p>
                      {step.extractedDocumentation && (
                        <>
                          <h5 className="font-semibold mt-2">Key Documentation:</h5>
                          <blockquote className="border-l-4 pl-4 italic text-muted-foreground my-2">{step.extractedDocumentation}</blockquote>
                        </>
                      )}
                       {step.extractedExampleCode && (
                        <>
                          <h5 className="font-semibold mt-2">Example Code:</h5>
                          <pre className="bg-muted p-2 rounded-md overflow-x-auto my-2"><code>{step.extractedExampleCode}</code></pre>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
               <div className="mt-4 flex justify-between">
                <Button onClick={handlePrevStep} disabled={currentPlanStepIndex === null || currentPlanStepIndex === 0 || isLoadingExercise} variant="outline">Previous Step</Button>
                <Button onClick={handleNextStep} disabled={currentPlanStepIndex === null || currentPlanStepIndex === learningPlan.learningSteps.length - 1 || isLoadingExercise} variant="outline">Next Step</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          {expandedPanel === 'code' && currentExercise ? null : (
            <ExercisePanel
              exercise={currentExercise}
              explanation={explanation}
              feedback={feedback}
              isLoadingExercise={isLoadingExercise && !learningPlan}
              isLoadingExplanation={isLoadingExplanation}
              isLoadingFeedback={isLoadingImprove || isLoadingSubmit}
              onExplainConcept={handleExplainConcept}
              learningMode={learningMode}
              isExpanded={expandedPanel === 'exercise'}
              onToggleExpand={() => handleTogglePanelExpand('exercise')}
              className={expandedPanel === 'exercise' ? "md:col-span-2" : ""}
            />
          )}
          {expandedPanel === 'exercise' && currentExercise ? null : (
            <CodePanel
              initialCode={currentExercise?.codeSnippet || userCode || (learningMode === 'challenge' && currentExercise ? `# Start coding for: ${currentExercise.topic}\n` : "print('Hello, CodeLeap!')" )}
              onRunCode={handleRunCode}
              onImproveCode={handleImproveCode}
              onSubmitCode={handleSubmitCode}
              isLoadingImprove={isLoadingImprove}
              isLoadingSubmit={isLoadingSubmit}
              showCodeEditor={true}
              isExpanded={expandedPanel === 'code'}
              onToggleExpand={() => handleTogglePanelExpand('code')}
              className={expandedPanel === 'code' ? "md:col-span-2" : ""}
            />
          )}
        </div>
      </main>
    </div>
  );
}
