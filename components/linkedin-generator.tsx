"use client";

import { useState } from "react";
import { PromptForm } from "@/components/prompt-form";
import { SamplePrompts } from "@/components/sample-prompts";
import { OutputFeed } from "@/components/output-feed";
import type { GenerationRun, LinkedInGenerationResult } from "@/lib/types";

function toRun(prompt: string, result: LinkedInGenerationResult): GenerationRun {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    prompt,
    createdAt: new Date().toISOString(),
    ...result,
  };
}

export function LinkedInGenerator() {
  const apiBaseUrl =
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000"
      : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "");
  const [prompt, setPrompt] = useState("");
  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([
    "c# development",
    "AI engineering",
    "enterprise engineering",
    "best practices for production deployment",
  ]);


  async function handleSubmit() {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      setError("Please type a prompt first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: cleanPrompt, skills, }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? ((await response.json()) as LinkedInGenerationResult | { error?: string })
        : { error: await response.text() };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "Generation failed.");
      }

      setRuns((current) => [toRun(cleanPrompt, payload as LinkedInGenerationResult), ...current]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Generation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Copy failed. Your browser may be blocking clipboard access.");
    }
  }

  return (
    <section className="generator">
      <div className="input-card">
        <div>
          <h2 className="input-card__title">Compose with intent</h2>
          <p className="input-card__copy">
            Feed the generator the rough idea. The backend will refine it and return a polished final
            post.
          </p>
        </div>

        <PromptForm
          prompt={prompt}
          skills={skills}
          isLoading={isLoading}
          onPromptChange={setPrompt}
          onSkillsChange={setSkills}
          onSubmit={handleSubmit}
        />

        <SamplePrompts onPick={setPrompt} />
      </div>

      <OutputFeed runs={runs} isLoading={isLoading} error={error} onCopy={handleCopy} />
    </section>
  );
}
