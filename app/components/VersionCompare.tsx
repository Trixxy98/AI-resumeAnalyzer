import React from "react";
import { Link } from "react-router";

interface VersionItem {
  id: string;
  version: number;
  createdAt?: string;
  overallScore?: number;
  jdMatchScore?: number;
}

const deltaTone = (value: number) =>
  value > 0
    ? "text-emerald-600"
    : value < 0
      ? "text-rose-600"
      : "text-slate-600";

const deltaPrefix = (value: number) => (value > 0 ? "+" : "");

const StatDelta = ({ label, value }: { label: string; value: number | null }) => {
  if (value === null) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${deltaTone(value)}`}>
        {deltaPrefix(value)}
        {value}
      </p>
    </div>
  );
};

const VersionCompare = ({
  currentVersion,
  comparison,
  versions,
}: {
  currentVersion: number;
  comparison: ResumeComparison | null;
  versions: VersionItem[];
}) => {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Version History</h3>
      <p className="mt-1 text-sm text-slate-600">
        Current version: v{currentVersion}
      </p>

      {comparison ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Change vs previous version</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <StatDelta label="Overall Score" value={comparison.overallDelta} />
            <StatDelta label="ATS Score" value={comparison.atsDelta} />
            <StatDelta label="JD Match" value={comparison.jdMatchDelta} />
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          This is your first version for this target role.
        </p>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-slate-700">All versions</p>
        <div className="space-y-2">
          {versions.map((item) => (
            <Link
              to={`/resume/${item.id}`}
              key={item.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                item.version === currentVersion
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div>
                <p className="font-medium">v{item.version}</p>
                {item.createdAt && (
                  <p className={item.version === currentVersion ? "text-slate-300" : "text-slate-500"}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                {typeof item.overallScore === "number" && <p>Overall {item.overallScore}</p>}
                {typeof item.jdMatchScore === "number" && (
                  <p className={item.version === currentVersion ? "text-slate-300" : "text-slate-500"}>
                    JD {item.jdMatchScore}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VersionCompare;
