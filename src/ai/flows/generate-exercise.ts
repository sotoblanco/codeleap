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
  learningMode: z.enum(['hand-holding', 'challenge']).default('hand-holding').describe("The desired learning mode: 'hand-holding' for fill-in-the-blanks, 'challenge' for harder questions from scratch."),
});
export type GenerateExerciseInput = z.infer<typeof GenerateExerciseInputSchema>;

const GenerateExerciseOutputSchema = z.object({
  question: z.string().describe('The coding exercise question.'),
  codeSnippet: z.string().optional().describe("The code snippet with blanks to fill. For 'challenge' mode, this should be an empty string or omitted."),
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
  prompt: `You are an AI coding exercise generator. Your goal is to create a Python exercise based on the provided topic, documentation, example code, and learning mode.

Topic: {{{topic}}}
Documentation: {{{documentation}}}
Example Code: {{{exampleCode}}}
Learning Mode: {{{learningMode}}}

Instructions:
1. Formulate a clear question related to the topic.
2. If Learning Mode is 'hand-holding':
   - Provide a Python code snippet with clearly marked fill-in-the-blank sections (e.g., using \`____\` or \`# TODO\`). This snippet should be a good starting point for the user.
   - The 'codeSnippet' field in your output should contain this.
3. If Learning Mode is 'challenge':
   - The question should be more demanding, requiring the user to write significant Python code or solve a more complex problem from scratch based on the topic.
   - The 'codeSnippet' field in your output MUST be an empty string. Do NOT provide any starter code.
4. Provide the complete Python solution for the exercise.

Ensure your output strictly adheres to the JSON schema for GenerateExerciseOutput.
If Learning Mode is 'challenge', the 'codeSnippet' field must be an empty string.
`,
});

const generateExerciseFlow = ai.defineFlow(
  {
    name: 'generateExerciseFlow',
    inputSchema: GenerateExerciseInputSchema,
    outputSchema: GenerateExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI model did not return exercise output.");
    }
    // Ensure codeSnippet is empty string if challenge mode and model didn't comply
    if (input.learningMode === 'challenge' && output.codeSnippet) {
        output.codeSnippet = "";
    }
    // Ensure codeSnippet is defined for hand-holding if model omitted it
    if (input.learningMode === 'hand-holding' && output.codeSnippet === undefined) {
        output.codeSnippet = "# TODO: Write your code here, following the question.";
    }
    return output;
  }
);
