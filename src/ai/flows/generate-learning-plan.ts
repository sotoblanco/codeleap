'use server';
/**
 * @fileOverview Generates a structured learning plan from provided text content, documentation URL, or code URL.
 *
 * - generateLearningPlan - A function that takes text content and/or URLs and returns a learning plan.
 * - GenerateLearningPlanInput - The input type for the generateLearningPlan function.
 * - GenerateLearningPlanOutput - The return type for the generateLearningPlan function.
 * - LearningStep - Represents a single step or topic in the learning plan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLearningPlanInputSchema = z.object({
  content: z.string().optional().describe('Pasted lecture notes, documentation, or text content to base the learning plan on.'),
  documentationUrl: z.string().url().optional().describe('An optional URL to fetch additional documentation content.'),
  codeUrl: z.string().url().optional().describe('An optional URL to fetch code content (e.g., a raw GitHub file URL).'),
}).refine(data => data.content || data.documentationUrl || data.codeUrl, {
  message: "Either content, documentation URL, or code URL must be provided.",
  path: ["content"], // You can point to a general path or a specific field
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
  input: {schema: GenerateLearningPlanInputSchema}, // The prompt still sees the full input, but will primarily use the assembled content.
  output: {schema: GenerateLearningPlanOutputSchema},
  prompt: `You are an AI curriculum designer. Your task is to analyze the provided text content (which may include pasted text and/or content fetched from URLs) and create a structured learning plan.

The plan should consist of:
1.  A concise and descriptive 'title' for the entire learning plan.
2.  A series of 'learningSteps' (aim for 3-7 steps). Each step should represent a key topic or concept from the content.

For each 'learningStep':
-   'topic': Clearly state the topic.
-   'description': Provide a brief summary of what this topic covers and its relevance from the input content.
-   'extractedDocumentation' (optional): If the content contains a specific, concise piece of text that serves as good documentation for this topic, extract it. Keep it brief.
-   'extractedExampleCode' (optional): If the content includes a relevant, short code example for this topic, extract it.

Focus on breaking down the core information into logical, learnable segments.

Provided Content (this includes any pasted text and content fetched from URLs):
{{{content}}}
`,
});

const generateLearningPlanFlow = ai.defineFlow(
  {
    name: 'generateLearningPlanFlow',
    inputSchema: GenerateLearningPlanInputSchema,
    outputSchema: GenerateLearningPlanOutputSchema,
  },
  async (inputArgs) => {
    let assembledContent = inputArgs.content || "";

    const fetchContentFromUrl = async (url: string, type: string): Promise<string> => {
      try {
        const response = await fetch(url, { headers: { 'Accept': 'text/plain, text/html, application/json, *.*' }});
        if (!response.ok) {
          console.error(`Failed to fetch ${type} URL ${url}: ${response.statusText}`);
          return `\n\n[Error fetching ${type} from ${url}: ${response.statusText}]`;
        }
        let textContent = await response.text();
        
        // Basic check for HTML and attempt to extract main content (very rudimentary)
        if (textContent.toLowerCase().includes("<html")) {
            // Attempt to find body or main tag, this is highly unreliable
            const bodyMatch = textContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch && bodyMatch[1]) textContent = bodyMatch[1];

            // Remove script and style tags
            textContent = textContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
            textContent = textContent.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
            // Remove all other HTML tags
            textContent = textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        const MAX_CONTENT_LENGTH = 30000; // Increased limit slightly
        let processedContent = textContent;
        if (textContent.length > MAX_CONTENT_LENGTH) {
          processedContent = textContent.substring(0, MAX_CONTENT_LENGTH) + "\n[Content truncated due to length]";
        }
        return `\n\n--- ${type} from URL (${url}) ---\n${processedContent}`;
      } catch (error: any) {
        console.error(`Error fetching ${type} URL ${url}:`, error);
        return `\n\n[Exception while fetching ${type} from ${url}: ${error.message || 'Unknown error'}]`;
      }
    };

    if (inputArgs.documentationUrl) {
      assembledContent += await fetchContentFromUrl(inputArgs.documentationUrl, "Documentation");
    }

    if (inputArgs.codeUrl) {
      assembledContent += await fetchContentFromUrl(inputArgs.codeUrl, "Code (raw text expected)");
    }

    if (!assembledContent.trim()) {
      // This case should be caught by the Zod refine, but as a fallback:
      throw new Error("No content provided. Please paste content or provide valid URLs that return text.");
    }
    
    const promptInput: GenerateLearningPlanInput = {
        ...inputArgs, // Pass original URLs too, though prompt template primarily uses assembled content
        content: assembledContent, 
    };

    const {output} = await prompt(promptInput);
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
