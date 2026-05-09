import { Hero } from "@/components/hero";
import { WorkflowGrid } from "@/components/workflow-grid";
import { LinkedInGenerator } from "@/components/linkedin-generator";

export default function Page() {
  return (
    <main className="page">
      <div className="page__glow page__glow--left" />
      <div className="page__glow page__glow--right" />

      <div className="shell">
        <Hero />
        <WorkflowGrid />
        <LinkedInGenerator />
      </div>
    </main>
  );
}
