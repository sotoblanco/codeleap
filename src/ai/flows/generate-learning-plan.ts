'use server';
/**
 * @fileOverview Generates a structured learning plan from provided text content.
 *
 * - generateLearningPlan - A function that takes text content and returns a learning plan.
 * - GenerateLearningPlanInput - The input type for the generateLearningPlan function.
 * - GenerateLearningPlanOutput - The return type for the generateLearningPlan function.
 * - LearningStep - Represents a single step or topic in the learning plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningPlanInputSchema = z.object({
  content: z.string().describe('The lecture notes, documentation, or text content to base the learning plan on.'),
});
export type GenerateLearningPlanInput = z.infer<typeof GenerateLearningPlanInputSchema>;

const LearningStepSchema = z.object({
  topic: z.string().describe('A specific topic or concept derived from the content for this learning step.'),
  description: z.string().describe('A brief summary of what to learn for this topic and how it relates to the content.'),
  extractedDocumentation: z.string().optional().describe('A key snippet of documentation relevant to this topic, extracted directly from the provided content if possible.'),
  extractedExampleCode: z.string().optional().describe('A relevant code example for this topic, extracted from the content if available and applicable (e.g., if content includes code).'),
});
export type LearningStep = z.infer<typeof LearningStepSchema>;

const GenerateLearningPlanOutputSchema = z.object({
  title: z.string().describe('A concise and descriptive title for the overall learning plan, based on the input content.'),
  learningSteps: z.array(LearningStepSchema).describe('An array of learning steps, breaking down the content into manageable, sequential topics. Aim for 3-7 steps.'),
});
export type GenerateLearningPlanOutput = z.infer<typeof GenerateLearningPlanOutputSchema>;

export async function generateLearningPlan(input: GenerateLearningPlanInput): Promise<GenerateLearningPlanOutput> {
  return generateLearningPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningPlanPrompt',
  input: {schema: GenerateLearningPlanInputSchema},
  output: {schema: GenerateLearningPlanOutputSchema},
  prompt: `You are an AI curriculum designer. Your task is to analyze the provided text content and create a structured learning plan.

The plan should consist of:
1.  A concise and descriptive 'title' for the entire learning plan.
2.  A series of 'learningSteps' (aim for 3-7 steps). Each step should represent a key topic or concept from the content.

For each 'learningStep':
-   'topic': Clearly state the topic.
-   'description': Provide a brief summary of what this topic covers and its relevance from the input content.
-   'extractedDocumentation' (optional): If the content contains a specific, concise piece of text that serves as good documentation for this topic, extract it. Keep it brief.
-   'extractedExampleCode' (optional): If the content includes a relevant, short code example for this topic, extract it.

Focus on breaking down the core information into logical, learnable segments.

Provided Content:
{{{content}}}
`,
});

const generateLearningPlanFlow = ai.defineFlow(
  {
    name: 'generateLearningPlanFlow',
    inputSchema: GenerateLearningPlanInputSchema,
    outputSchema: GenerateLearningPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate learning plan. The AI model did not return a valid plan structure.");
    }
    // Ensure learningSteps is an array, even if the model messes up.
    if (!Array.isArray(output.learningSteps)) {
        output.learningSteps = [];
    }
    return output;
  }
);
