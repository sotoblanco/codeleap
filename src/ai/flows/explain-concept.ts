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
  explanation: z.string().describe('A simplified, easy-to-understand explanation of the coding concept. Use analogies if helpful. Markdown formatting (like bullet points) can be used.'),
  breakdown: z.string().describe('A breakdown of the concept into smaller, more digestible parts. Markdown formatting can be used.'),
  application: z.string().describe('An explanation of how the concept applies to the provided documentation and example code. Be specific. Markdown formatting can be used.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `You are an expert coding teacher, renowned for making complex topics easy to understand using simple language, analogies, and clear examples.

Your task is to:
1.  Provide a very simple, **easy-to-understand explanation** of the concept: \`{{{concept}}}\`. Use analogies if they make it clearer.
2.  Break down the \`{{{concept}}}\` into smaller, digestible parts.
3.  Clearly explain how this \`{{{concept}}}\` is applied or demonstrated in the provided documentation and example code. Be specific.

Concept: {{{concept}}}
Documentation:
{{{documentation}}}
Example Code:
\`\`\`python
{{{exampleCode}}}
\`\`\`

Make sure your output is structured according to the requested JSON schema fields: 'explanation', 'breakdown', and 'application'.
For 'explanation', 'breakdown', and 'application', provide clear, well-formatted text. You can use Markdown formatting like bullet points (\`- item\`) or numbered lists (\`1. item\`) within these string fields if it enhances readability.
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
