type PromptFormProps = {
  prompt: string;
  skills: [string, string, string, string];  
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSkillChange: (index: number, value: string) => void;  
  onSubmit: () => void;
};

export function PromptForm({
  prompt,
  skills,  
  isLoading,
  onPromptChange,
  onSkillChange,  
  onSubmit,
}: PromptFormProps) {
  return (
    <form
      className="prompt-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="skill-1">Skill 1</label>
      <input
        id="skill-1"
        value={skills[0]}
        onChange={(event) => onSkillChange(0, event.target.value)}
        placeholder="For example: product strategy"
      />

      <label htmlFor="skill-2">Skill 2</label>
      <input
        id="skill-2"
        value={skills[1]}
        onChange={(event) => onSkillChange(1, event.target.value)}
        placeholder="For example: growth marketing"
      />

      <label htmlFor="skill-3">Skill 3</label>
      <input
        id="skill-3"
        value={skills[2]}
        onChange={(event) => onSkillChange(2, event.target.value)}
        placeholder="For example: AI systems"
      />

      <label htmlFor="skill-4">Skill 4</label>
      <input
        id="skill-4"
        value={skills[3]}
        onChange={(event) => onSkillChange(3, event.target.value)}
        placeholder="For example: leadership"
      />

      <label htmlFor="prompt">What should the post say?</label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Describe the post, the moment, and the tone you want..."
      />

      <div className="prompt-form__actions">
        <button className="button button--primary" type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate post"}
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={() => onPromptChange("")}
          disabled={isLoading || !prompt}
        >
          Clear prompt
        </button>
      </div>
    </form>
  );
}
