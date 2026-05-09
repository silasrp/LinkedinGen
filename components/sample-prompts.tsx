import { samplePrompts } from "@/lib/prompts";

type SamplePromptsProps = {
  onPick: (value: string) => void;
};

export function SamplePrompts({ onPick }: SamplePromptsProps) {
  return (
    <section className="sample-prompts" aria-label="Sample prompts">
      <p className="sample-prompts__label">Need a starting point?</p>
      <div className="sample-prompts__grid">
        {samplePrompts.map((prompt) => (
          <button
            key={prompt}
            className="sample-chip"
            type="button"
            onClick={() => onPick(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
