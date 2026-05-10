export function Hero() {
  return (
    <section className="hero">
      <p className="hero__eyebrow">LinkedIn studio</p>
      <h1 className="hero__title">
        An <span className="hero__titleAccent">agentic app</span> for writing stronger posts.
      </h1>
      <p className="hero__lede">
        This interface is built as a normal component tree on Vercel, with the generation logic
        behind a server API route. It keeps the frontend conventional, the structure modular, and
        the writing workflow editorial.
      </p>
      <div className="hero__meta">
        <span className="pill">React component tree</span>
        <span className="pill">Vercel-ready</span>
        <span className="pill">Final post only</span>
      </div>
    </section>
  );
}
