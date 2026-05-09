const workflow = [
  {
    title: "Compose",
    copy: "Start with a concrete professional moment, insight, or point of view. The form accepts the messy version first.",
  },
  {
    title: "Critique",
    copy: "The server route evaluates the prompt and output internally, then returns only the polished result to the interface.",
  },
  {
    title: "Refine",
    copy: "The final post lands in the UI ready to copy, paste, and publish with minimal editing.",
  },
] as const;

export function WorkflowGrid() {
  return (
    <section className="workflow">
      <div className="section-heading">
        <h2>Workflow</h2>
        <p>
          The UI is structured like a proper product surface, with separate pieces for framing,
          composition, and output.
        </p>
      </div>

      <div className="workflow__grid">
        {workflow.map((item, index) => (
          <article className="workflow-card" key={item.title}>
            <div className="workflow-card__index">0{index + 1}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
