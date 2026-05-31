import React, { useMemo, useState } from "react";
import { usePuterStore } from "~/lib/puter";

type RewriteSection = "summary" | "experience" | "skills";

const sectionLabel: Record<RewriteSection, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  skills: "Skills Section",
};

const RewriteAssistant = ({
  feedback,
  jobTitle,
  jobDescription,
}: {
  feedback: Feedback;
  jobTitle?: string;
  jobDescription?: string;
}) => {
  const { ai, puterReady } = usePuterStore();
  const [section, setSection] = useState<RewriteSection>("summary");
  const [originalText, setOriginalText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const suggestedKeywords = useMemo(
    () => feedback.jdMatch?.missingKeywords?.slice(0, 8) || [],
    [feedback]
  );

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      setError("Please paste your current section text first.");
      return;
    }
    if (!puterReady) {
      setError("AI service is not ready yet. Please try again in a moment.");
      return;
    }

    setIsGenerating(true);
    setError("");

    const prompt = `
You are an expert resume writer.

Rewrite the "${sectionLabel[section]}" section for a resume.
Return only the rewritten text, without markdown or backticks.
Keep the same factual meaning and avoid inventing experience.

Target job title: ${jobTitle || "Not provided"}
Target job description: ${jobDescription || "Not provided"}

Current section text:
${originalText}

Relevant guidance:
- Overall score: ${feedback.overallScore}
- ATS score: ${feedback.ATS.score}
- JD match score: ${feedback.jdMatch?.score ?? "N/A"}
- Missing keywords to naturally incorporate when relevant: ${
      suggestedKeywords.length ? suggestedKeywords.join(", ") : "None provided"
    }

Requirements:
- Make it concise, professional, and ATS-friendly
- Use strong action verbs
- Preserve truthfulness
- Keep formatting clean for direct copy-paste
`;

    try {
      const response = await ai.chat(prompt);
      if (!response) {
        setError("No response received from AI.");
        return;
      }

      const rawContent =
        typeof response.message.content === "string"
          ? response.message.content
          : response.message.content?.[0]?.text || "";

      const cleaned = rawContent
        .replace(/```(?:text|markdown)?/gi, "")
        .replace(/```/g, "")
        .trim();

      if (!cleaned) {
        setError("AI returned an empty rewrite. Please try again.");
        return;
      }

      setRewrittenText(cleaned);
    } catch (rewriteError) {
      console.error("Rewrite generation failed:", rewriteError);
      setError("Failed to generate rewrite. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!rewrittenText) return;
    try {
      await navigator.clipboard.writeText(rewrittenText);
    } catch (copyError) {
      console.error("Failed to copy rewritten text:", copyError);
    }
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Resume Rewrite Assistant</h3>
          <p className="text-sm text-slate-600">Rewrite any section with one click using your current feedback context.</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Section</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={section}
            onChange={(e) => setSection(e.target.value as RewriteSection)}
          >
            <option value="summary">Professional Summary</option>
            <option value="experience">Work Experience</option>
            <option value="skills">Skills Section</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Suggested Missing Keywords</label>
          <div className="min-h-[42px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {suggestedKeywords.length ? suggestedKeywords.join(", ") : "No keyword suggestions available"}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Current Section Text</label>
        <textarea
          rows={7}
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Paste your existing section content here..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={handleRewrite}
          disabled={isGenerating}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Rewrite Section"}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!rewrittenText}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy Result
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-rose-600">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Rewritten Output</label>
        <textarea
          rows={8}
          readOnly
          value={rewrittenText}
          placeholder="Your rewritten section will appear here."
          className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
        />
      </div>
    </section>
  );
};

export default RewriteAssistant;
