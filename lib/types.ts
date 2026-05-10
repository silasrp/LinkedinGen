export type LinkedInGenerationResult = {
  finalPost: string;
  visualContent?: string;
};

export type GenerationRun = LinkedInGenerationResult & {
  id: string;
  prompt: string;
  createdAt: string;
};
