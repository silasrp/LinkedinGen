import type { GenerationRun } from "@/lib/types";

type OutputFeedProps = {
  runs: GenerationRun[];
  error: string | null;
  statusLabel: string;
  onCopy: (value: string) => void;
};

export function OutputFeed({ runs, error, statusLabel, onCopy }: OutputFeedProps) {
  const latestRun = runs[0];

  return (
    <section className="output-stack" aria-live="polite">
      <div className="status-bar">
        <div className="status-badge">
          <span className="status-badge__dot" />
          {statusLabel}
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
                {renderVisual(run.visualContent)}
                {renderReferences(run.references)}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function renderVisual(visualContent?: string) {
  if (!visualContent) return null;

  let data: any;
  try {
    data = JSON.parse(visualContent);
  } catch {
    return (
      <details className="run-section" open>
        <summary>Visual</summary>
        <pre className="run-card__visualRaw">{visualContent}</pre>
      </details>
    );
  }

  return (
    <details className="run-section" open>
      <summary>Visual</summary>
      {data?.format ? <p><strong>Format:</strong> {data.format}</p> : null}
      {data?.art_style ? <p><strong>Art style:</strong> {data.art_style}</p> : null}      
      {data?.rationale ? <p><strong>Why this format:</strong> {data.rationale}</p> : null}

      {Array.isArray(data?.assets) ? (
        <div className="visual-assets">
          {data.assets.map((asset: any, index: number) => (
            <article className="visual-asset" key={index}>
              {asset.label ? <h4>{asset.label}</h4> : null}
              {asset.alt_text ? <p>{asset.alt_text}</p> : null}

              {asset.type === "image_url" && typeof asset.content === "string" ? (
                <img
                  className="visual-image"
                  src={asset.content}
                  alt={asset.alt_text || "Visual asset"}
                  loading="lazy"
                />
              ) : asset.type === "svg" && typeof asset.content === "string" ? (
                <div
                  className="visual-svg"
                  dangerouslySetInnerHTML={{ __html: asset.content }}
                />
              ) : (
                <pre className="run-card__visualRaw">{asset.content}</pre>
              )}
            </article>
          ))}
        </div>
      ) : null}
    </details>
  );
}

function renderReferences(references?: string[]) {
  if (!references?.length) return null;

  return (
    <details className="run-section" open>
      <summary>References</summary>
      <ol className="reference-list">
        {references.map((reference, index) => (
          <li key={`${reference}-${index}`}>
            <a href={reference} target="_blank" rel="noreferrer noopener">
              {reference}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

