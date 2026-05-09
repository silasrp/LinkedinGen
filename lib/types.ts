export type LinkedInGenerationResult = {
  finalPost: string;
};

export type GenerationRun = LinkedInGenerationResult & {
  id: string;
  prompt: string;
  createdAt: string;
};
