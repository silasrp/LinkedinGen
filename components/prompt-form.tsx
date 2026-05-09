type PromptFormProps = {
  prompt: string;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
};

export function PromptForm({
  prompt,
  isLoading,
  onPromptChange,
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
