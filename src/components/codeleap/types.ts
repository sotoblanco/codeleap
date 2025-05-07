
export interface Exercise {
  question: string;
  codeSnippet?: string; 
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

export type LearningMode = 'hand-holding' | 'challenge';
