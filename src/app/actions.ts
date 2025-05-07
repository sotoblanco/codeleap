// src/app/actions.ts
'use server';

import { generateExercise as genExerciseAI } from '@/ai/flows/generate-exercise';
import type { GenerateExerciseInput, GenerateExerciseOutput } from '@/ai/flows/generate-exercise';
import { improveCode as improveCodeAI } from '@/ai/flows/improve-code';
import type { ImproveCodeInput, ImproveCodeOutput } from '@/ai/flows/improve-code';
import { explainConcept as explainConceptAI } from '@/ai/flows/explain-concept';
import type { ExplainConceptInput, ExplainConceptOutput } from '@/ai/flows/explain-concept';
import { generateLearningPlan as generateLearningPlanAI } from '@/ai/flows/generate-learning-plan';
import type { GenerateLearningPlanInput, GenerateLearningPlanOutput } from '@/ai/flows/generate-learning-plan';


export async function generateExerciseAction(input: GenerateExerciseInput): Promise<GenerateExerciseOutput> {
  try {
    const result = await genExerciseAI(input);
    return result;
  } catch (error) {
    console.error("Error in generateExerciseAction:", error);
    throw new Error("Failed to generate exercise. Please try again.");
  }
}

export async function improveCodeAction(input: ImproveCodeInput): Promise<ImproveCodeOutput> {
  try {
    const result = await improveCodeAI(input);
    return result;
  } catch (error) {
    console.error("Error in improveCodeAction:", error);
    throw new Error("Failed to get code improvements. Please try again.");
  }
}

export async function explainConceptAction(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  try {
    const result = await explainConceptAI(input);
    return result;
  } catch (error) {
    console.error("Error in explainConceptAction:", error);
    throw new Error("Failed to explain concept. Please try again.");
  }
}

export async function generateLearningPlanAction(input: GenerateLearningPlanInput): Promise<GenerateLearningPlanOutput> {
  try {
    const result = await generateLearningPlanAI(input);
    return result;
  } catch (error) {
    console.error("Error in generateLearningPlanAction:", error);
    throw new Error("Failed to generate learning plan. Please try again.");
  }
}
