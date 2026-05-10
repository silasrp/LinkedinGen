"use client";

import { useState } from "react";

type PromptFormProps = {
  prompt: string;
  skills: string[];
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSkillsChange: (skills: string[]) => void;
  onSubmit: () => void;
};

const MAX_SKILLS = 4;

export function PromptForm({
  prompt,
  skills,
  isLoading,
  onPromptChange,
  onSkillsChange,
  onSubmit,
}: PromptFormProps) {
  const [skillInput, setSkillInput] = useState("");

  function addSkill(rawValue: string) {
    const value = rawValue.trim();

    if (!value) return;
    if (skills.length >= MAX_SKILLS) return;
    if (skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) return;

    onSkillsChange([...skills, value]);
    setSkillInput("");
  }

  function removeSkill(index: number) {
    onSkillsChange(skills.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <form
      className="prompt-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="skills">Skills</label>

      <div className="tag-input" aria-describedby="skills-help">
        <div className="tag-input__chips">
          {skills.map((skill, index) => (
            <span className="tag-chip" key={`${skill}-${index}`}>
              {skill}
              <button
                type="button"
                className="tag-chip__remove"
                onClick={() => removeSkill(index)}
                aria-label={`Remove skill ${skill}`}
                disabled={isLoading}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          id="skills"
          value={skillInput}
          onChange={(event) => setSkillInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addSkill(skillInput);
            }
            if (event.key === "Backspace" && !skillInput && skills.length > 0) {
              removeSkill(skills.length - 1);
            }
          }}
          onBlur={() => addSkill(skillInput)}
          placeholder={
            skills.length >= MAX_SKILLS
              ? "Maximum 4 skills added"
              : "Type a skill and press Enter"
          }
          disabled={isLoading || skills.length >= MAX_SKILLS}
          aria-label="Add skill"
        />
      </div>

      <p id="skills-help" className="prompt-form__helper">
        Add up to 4 skills. Press Enter or comma to add one.
      </p>

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