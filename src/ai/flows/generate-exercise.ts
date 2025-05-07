'use server';
/**
 * @fileOverview A coding exercise generation AI agent.
 *
 * - generateExercise - A function that handles the exercise generation process.
 * - GenerateExerciseInput - The input type for the generateExercise function.
 * - GenerateExerciseOutput - The return type for the generateExercise function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExerciseInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a coding exercise.'),
  documentation: z.string().describe('Relevant documentation for the topic.'),
  exampleCode: z.string().describe('Example code related to the topic.'),
});
export type GenerateExerciseInput = z.infer<typeof GenerateExerciseInputSchema>;

const GenerateExerciseOutputSchema = z.object({
  question: z.string().describe('The coding exercise question.'),
  codeSnippet: z.string().describe('The code snippet with blanks to fill.'),
  solution: z.string().describe('The complete solution to the exercise.'),
});
export type GenerateExerciseOutput = z.infer<typeof GenerateExerciseOutputSchema>;

export async function generateExercise(input: GenerateExerciseInput): Promise<GenerateExerciseOutput> {
  return generateExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExercisePrompt',
  input: {schema: GenerateExerciseInputSchema},
  output: {schema: GenerateExerciseOutputSchema},
  prompt: `You are an AI coding exercise generator. You will generate a coding exercise based on the provided topic, documentation, and example code. The exercise should have fill-in-the-blank sections. Also, provide the full solution to the exercise.

Topic: {{{topic}}}
Documentation: {{{documentation}}}
Example Code: {{{exampleCode}}}

Exercise Question:
{{output.question}}

Code Snippet with Blanks:
{{output.codeSnippet}}

Solution:
{{output.solution}}`,
});

const generateExerciseFlow = ai.defineFlow(
  {
    name: 'generateExerciseFlow',
    inputSchema: GenerateExerciseInputSchema,
    outputSchema: GenerateExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
