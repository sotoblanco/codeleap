// src/ai/flows/improve-code.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing suggestions to improve code.
 *
 * - improveCode - A function that accepts code and returns suggestions for improvement.
 * - ImproveCodeInput - The input type for the improveCode function.
 * - ImproveCodeOutput - The output type for the improveCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveCodeInputSchema = z.object({
  code: z.string().describe('The code to be improved.'),
  language: z.string().describe('The programming language of the code.'),
  question: z.string().optional().describe('The coding question the code is trying to answer.')
});
export type ImproveCodeInput = z.infer<typeof ImproveCodeInputSchema>;

const ImproveCodeOutputSchema = z.object({
  improvements: z.string().describe('Suggestions for improving the code.'),
});
export type ImproveCodeOutput = z.infer<typeof ImproveCodeOutputSchema>;

export async function improveCode(input: ImproveCodeInput): Promise<ImproveCodeOutput> {
  return improveCodeFlow(input);
}

const improveCodePrompt = ai.definePrompt({
  name: 'improveCodePrompt',
  input: {schema: ImproveCodeInputSchema},
  output: {schema: ImproveCodeOutputSchema},
  prompt: `You are an expert software engineer who provides suggestions for improving code.

  You will review the code and provide suggestions for improving it, focusing on best practices, efficiency, and readability.
  You must take into account the programming language of the code and the coding question the code is trying to answer, if provided.

  Code:
  ${"```"}{{{language}}}
  {{{code}}}
  ${"```"}

  Coding Question (if applicable):
  {{{question}}}

  Improvements:
  `,
});

const improveCodeFlow = ai.defineFlow(
  {
    name: 'improveCodeFlow',
    inputSchema: ImproveCodeInputSchema,
    outputSchema: ImproveCodeOutputSchema,
  },
  async input => {
    const {output} = await improveCodePrompt(input);
    return output!;
  }
);

