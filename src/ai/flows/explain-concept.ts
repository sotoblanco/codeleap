'use server';

/**
 * @fileOverview Explains a coding concept in simpler terms.
 *
 * - explainConcept - A function that explains a given coding concept.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  concept: z.string().describe('The coding concept to explain.'),
  documentation: z.string().describe('Relevant documentation for the concept.'),
  exampleCode: z.string().describe('Example code demonstrating the concept.'),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z.string().describe('A simplified explanation of the coding concept.'),
  breakdown: z.string().describe('A breakdown of the concept into smaller, more digestible parts.'),
  application: z.string().describe('An explanation of how the concept applies to the provided documentation and example code.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are an expert coding teacher, skilled at explaining complex concepts in simple terms.

  Your task is to explain the coding concept provided, break it down into smaller parts, and explain how it applies to the given documentation and example code.

  Concept: {{{concept}}}
  Documentation: {{{documentation}}}
  Example Code: {{{exampleCode}}}

  Explanation:
  {{#each (split explanation)}}
  - {{{this}}}
  {{/each}}

  Breakdown:
  {{#each (split breakdown)}}
  - {{{this}}}
  {{/each}}

  Application:
  {{#each (split application)}}
  - {{{this}}}
  {{/each}}
`,
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
