import type { GenerationRun } from "@/lib/types";

type OutputFeedProps = {
  runs: GenerationRun[];
  isLoading: boolean;
  error: string | null;
  onCopy: (value: string) => void;
};

export function OutputFeed({ runs, isLoading, error, onCopy }: OutputFeedProps) {
  const latestRun = runs[0];

  return (
    <section className="output-stack" aria-live="polite">
      <div className="status-bar">
        <div className="status-badge">
          <span className="status-badge__dot" />
          {isLoading ? "Writing and refining" : latestRun ? "Latest revision ready" : "Waiting for a prompt"}
        </div>
        <p className="status-bar__copy">
          {latestRun ? "The newest run appears first, with supporting notes folded underneath." : "Your results will stack here as separate revisions."}
        </p>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {runs.length === 0 ? (
        <div className="empty-state">
          No generation yet. Add a prompt on the left, and the app will produce a polished final post.
        </div>
      ) : (
        <div className="run-list">
          {runs.map((run) => (
            <article className="run-card" key={run.id}>
              <div className="run-card__header">
                <div>
                  <h3>Final post</h3>
                  <p className="run-card__prompt">{run.prompt}</p>
                </div>
                <button className="button button--ghost" type="button" onClick={() => onCopy(run.finalPost)}>
                  Copy final
                </button>
              </div>

              <div className="run-card__body">
                <div className="run-card__final">{run.finalPost}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
