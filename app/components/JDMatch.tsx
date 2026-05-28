import React from "react";

interface JDMatchProps {
  jdMatch: NonNullable<Feedback["jdMatch"]>;
}

const Badge = ({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "missing";
}) => (
  <span
    className={
      tone === "good"
        ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
        : "rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
    }
  >
    {label}
  </span>
);

const JDMatch = ({ jdMatch }: JDMatchProps) => {
  const scoreTone =
    jdMatch.score >= 75
      ? "text-emerald-600"
      : jdMatch.score >= 50
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">Job Description Match</h3>
        <p className={`text-lg font-bold ${scoreTone}`}>{jdMatch.score}/100</p>
      </div>

      <p className="mb-5 text-sm text-slate-600">
        This score reflects how closely your resume aligns with the provided job title and description.
      </p>

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-slate-800">Matched Keywords</p>
        <div className="flex flex-wrap gap-2">
          {jdMatch.matchedKeywords?.length ? (
            jdMatch.matchedKeywords.map((keyword) => (
              <Badge key={keyword} label={keyword} tone="good" />
            ))
          ) : (
            <span className="text-sm text-slate-500">No matched keywords found.</span>
          )}
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-slate-800">Missing Keywords</p>
        <div className="flex flex-wrap gap-2">
          {jdMatch.missingKeywords?.length ? (
            jdMatch.missingKeywords.map((keyword) => (
              <Badge key={keyword} label={keyword} tone="missing" />
            ))
          ) : (
            <span className="text-sm text-slate-500">No critical missing keywords detected.</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-800">Priority Improvements</p>
        <ul className="space-y-2">
          {jdMatch.priorityImprovements?.length ? (
            jdMatch.priorityImprovements.map((item, index) => (
              <li
                key={`${index}-${item}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {item}
              </li>
            ))
          ) : (
            <li className="text-sm text-slate-500">No priority improvements provided.</li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default JDMatch;
