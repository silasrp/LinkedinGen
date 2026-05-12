"use client";

import { useState } from "react";

export type VisualFormat = "single_image" | "carousel";

export const ART_STYLES = [
  {
    title: "Impressionism",
    description: "Soft light, loose brushwork, and natural focus (e.g., Monet-inspired).",
  },
  {
    title: "Cubism",
    description: "Geometric, fragmented perspectives displaying objects from multiple angles simultaneously.",
  },
  {
    title: "Surrealism",
    description: "Dreamlike, illogical, or bizarre landscapes with high symbolic detail (e.g., Dalí or Magritte style).",
  },
  {
    title: "Baroque",
    description: "Dramatic, grand scenes with high contrast (chiaroscuro), rich gold trims, and epic lighting.",
  },
  {
    title: "Art Deco / Art Nouveau",
    description: "Sleek geometric symmetry or elegant, flowing, nature-inspired curves.",
  },
  {
    title: "Expressionism / Fauvism",
    description: "Distorted forms and wild, unexpected palettes to convey raw emotion.",
  },
  {
    title: "Flat Vector Design / Corporate Memphis",
    description: "Minimalist flat shapes with solid colors, clean geometry, and zero gradients.",
  },
  {
    title: "Infographic Futurism / UI Mockups",
    description: "Sleek digital dashboards, clean text overlays, data charts, and sharp technical layouts.",
  },
  {
    title: "Vintage Screen-Print / Travel Poster",
    description: "Distressed paper textures, 1960s lithograph styles, bold analog contours, and custom typography.",
  },
  {
    title: "Brutalism",
    description: "Raw, unpolished, blocky layouts with high visual impact and experimental design structures.",
  },
  {
    title: "Pixar / Disney 3D Look",
    description: "High-end 3D digital animation with soft rendering, expressive eyes, and glossy lighting.",
  },
  {
    title: "Anime / Studio Ghibli",
    description: "Beautifully painted environments mixed with crisp cell-shaded or hand-drawn anime figures.",
  },
  {
    title: "Classic Comic Book / Noir Comic",
    description: "Heavy black inks, visible halftone printing dots, or moody high-contrast shadows.",
  },
  {
    title: "Cottagecore / Storybook Illustration",
    description: "Soft colored-pencil lines, gouache washes, and grainy textures.",
  },
  {
    title: "Chibi / Kawaii Style",
    description: "Cute, oversized heads, small bodies, and highly simplified, playful character art.",
  },
  {
    title: "Vaporwave / Synthwave",
    description: "Grid lines, neon pink-and-purple gradients, 80s computer icons, and marble statues.",
  },
  {
    title: "Cyberpunk",
    description: "Gritty urban environments illuminated by intense neon light pollution, reflections, and high-tech augmentations.",
  },
  {
    title: "Pixel Art / 8-Bit & 16-Bit",
    description: "Low-res grid art mimicking classic arcade and retro video games.",
  },
  {
    title: "Claymation / Puppet Scenes",
    description: "Tactile, stop-motion-style clay textures with realistic fingerprints and small physical details.",
  },
  {
    title: "Analog Scan / Neural Noise",
    description: "Glitch-art, VHS tracking lines, distorted digital artifacts, and fuzzy camera grain.",
  },
  {
    title: "Cinematic Realism",
    description: "High-end movie stills featuring dramatic rim lighting, shallow depth of field, and polished grading.",
  },
  {
    title: "UGC / Candid Smartphone Photography",
    description: "Imperfect lighting, natural shadows, and accidental framing that mimics a raw mobile phone capture.",
  },
  {
    title: "Thermal / Infrared Vision",
    description: "Visualizing environments in heat-map colors or striking monochrome negatives.",
  },
] as const;

export type ArtStyle = (typeof ART_STYLES)[number]["title"];


type PromptFormProps = {
  prompt: string;
  skills: string[];
  visualFormat: VisualFormat;
  artStyle: ArtStyle;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onSkillsChange: (skills: string[]) => void;
  onVisualFormatChange: (value: VisualFormat) => void;
  onArtStyleChange: (value: ArtStyle) => void;
  onSubmit: () => void;
};

const MAX_SKILLS = 4;

export function PromptForm({
  prompt,
  skills,
  visualFormat,
  artStyle,
  isLoading,
  onPromptChange,
  onSkillsChange,
  onVisualFormatChange,
  onArtStyleChange,  
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

      <fieldset className="prompt-form__group">
        <legend className="prompt-form__legend">Image format</legend>
        <div className="prompt-form__toggle">
          <label
            className={`prompt-form__toggleItem ${
              visualFormat === "single_image" ? "is-active" : ""
            }`}
          >
            <input
              type="radio"
              name="visualFormat"
              value="single_image"
              checked={visualFormat === "single_image"}
              onChange={() => onVisualFormatChange("single_image")}
              disabled={isLoading}
            />
            <span>Single image</span>
          </label>

          <label
            className={`prompt-form__toggleItem ${visualFormat === "carousel" ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="visualFormat"
              value="carousel"
              checked={visualFormat === "carousel"}
              onChange={() => onVisualFormatChange("carousel")}
              disabled={isLoading}
            />
            <span>Carousel</span>
          </label>
        </div>
      </fieldset>

      <label htmlFor="artStyle">Art style</label>
      <select
        id="artStyle"
        value={artStyle}
        onChange={(event) => onArtStyleChange(event.target.value as ArtStyle)}
        disabled={isLoading}
      >
        {ART_STYLES.map((style) => (
          <option key={style.title} value={style.title}>
            {style.title}
          </option>
        ))}
      </select>

      <details className="prompt-form__styleHelp">
        <summary>Style descriptions</summary>
        <div className="prompt-form__styleHelpBody">
          {ART_STYLES.map((style) => (
            <p key={style.title}>
              <strong>{style.title}:</strong> {style.description}
            </p>
          ))}
        </div>
      </details>

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