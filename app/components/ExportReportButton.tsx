import React from "react";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDelta = (value: number | null) => {
  if (value === null) return "N/A";
  return `${value > 0 ? "+" : ""}${value}`;
};

const ExportReportButton = ({
  resumeId,
  resumeData,
  feedback,
  version,
  comparison,
  versionHistory,
}: {
  resumeId: string;
  resumeData: Resume | null;
  feedback: Feedback;
  version: number;
  comparison: ResumeComparison | null;
  versionHistory: { id: string; version: number; createdAt?: string; overallScore?: number; jdMatchScore?: number }[];
}) => {
  const handleExport = () => {
    const reportWindow = window.open("", "_blank", "width=1000,height=900");
    if (!reportWindow) return;

    try {
      const checklistStorageKey = `action_plan_progress_${resumeId}`;
      const checklistRaw = localStorage.getItem(checklistStorageKey);
      let checklistItems: { task: string; done: boolean; priority?: string }[] = [];

      if (checklistRaw) {
        try {
          const parsed = JSON.parse(checklistRaw) as {
            todoItems?: { id: string; task: string; priority: string }[];
            doneMap?: Record<string, boolean>;
          };
          checklistItems = (parsed.todoItems || []).map((item) => ({
            task: item.task,
            priority: item.priority,
            done: !!parsed.doneMap?.[item.id],
          }));
        } catch (error) {
          console.error("Failed to parse checklist progress:", error);
        }
      }

      if (!checklistItems.length && feedback.actionPlan?.length) {
        checklistItems = feedback.actionPlan.map((item) => ({
          task: item.task,
          priority: item.priority,
          done: false,
        }));
      }

      const now = new Date().toLocaleString();
      const jdMatchScore = feedback.jdMatch?.score ?? "N/A";
      const checklistRows = checklistItems.length
        ? checklistItems
            .map(
              (item) => `
            <tr>
              <td>${item.done ? "Completed" : "Pending"}</td>
              <td>${escapeHtml(item.priority || "N/A")}</td>
              <td>${escapeHtml(item.task)}</td>
            </tr>
          `
            )
            .join("")
        : `<tr><td colspan="3">No checklist generated yet.</td></tr>`;

      const versionRows = versionHistory.length
        ? versionHistory
            .map(
              (item) => `
            <tr>
              <td>v${item.version}</td>
              <td>${item.createdAt ? escapeHtml(new Date(item.createdAt).toLocaleString()) : "-"}</td>
              <td>${item.overallScore ?? "-"}</td>
              <td>${item.jdMatchScore ?? "-"}</td>
            </tr>
          `
            )
            .join("")
        : `<tr><td colspan="4">No version history available.</td></tr>`;

      const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>ResumAI Report - ${escapeHtml(resumeData?.jobTitle || "Resume")}</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #0f172a; }
            h1, h2, h3 { margin: 0 0 10px; }
            h1 { font-size: 26px; }
            h2 { font-size: 18px; margin-top: 24px; }
            p { margin: 0 0 8px; }
            .muted { color: #475569; font-size: 13px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
            .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
            th { background: #e2e8f0; }
            ul { margin: 0; padding-left: 18px; }
            .section { margin-top: 24px; }
            @media print { .no-print { display: none; } body { padding: 12px; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom:16px;">
            <button onclick="window.print()">Print / Save PDF</button>
          </div>
          <h1>ResumAI Resume Report</h1>
          <p class="muted">Generated: ${escapeHtml(now)}</p>
          <p class="muted">Resume ID: ${escapeHtml(resumeId)}</p>

          <div class="section grid">
            <div class="card">
              <h3>Target Role</h3>
              <p><strong>Company:</strong> ${escapeHtml(resumeData?.companyName || "N/A")}</p>
              <p><strong>Job Title:</strong> ${escapeHtml(resumeData?.jobTitle || "N/A")}</p>
              <p><strong>Version:</strong> v${version}</p>
            </div>
            <div class="card">
              <h3>Score Summary</h3>
              <p><strong>Overall:</strong> ${feedback.overallScore}/100</p>
              <p><strong>ATS:</strong> ${feedback.ATS.score}/100</p>
              <p><strong>JD Match:</strong> ${jdMatchScore}/100</p>
            </div>
          </div>

          <div class="section">
            <h2>Version Comparison</h2>
            <p><strong>Overall Delta:</strong> ${formatDelta(comparison?.overallDelta ?? null)}</p>
            <p><strong>ATS Delta:</strong> ${formatDelta(comparison?.atsDelta ?? null)}</p>
            <p><strong>JD Match Delta:</strong> ${formatDelta(comparison?.jdMatchDelta ?? null)}</p>
          </div>

          <div class="section">
            <h2>Action Plan Checklist</h2>
            <table>
              <thead>
                <tr><th>Status</th><th>Priority</th><th>Task</th></tr>
              </thead>
              <tbody>${checklistRows}</tbody>
            </table>
          </div>

          <div class="section">
            <h2>JD Match Insights</h2>
            <p><strong>Matched Keywords:</strong> ${escapeHtml((feedback.jdMatch?.matchedKeywords || []).join(", ") || "N/A")}</p>
            <p><strong>Missing Keywords:</strong> ${escapeHtml((feedback.jdMatch?.missingKeywords || []).join(", ") || "N/A")}</p>
            <p><strong>Priority Improvements:</strong></p>
            <ul>
              ${(feedback.jdMatch?.priorityImprovements || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>N/A</li>"}
            </ul>
          </div>

          <div class="section">
            <h2>Version History</h2>
            <table>
              <thead>
                <tr><th>Version</th><th>Created At</th><th>Overall</th><th>JD Match</th></tr>
              </thead>
              <tbody>${versionRows}</tbody>
            </table>
          </div>
        </body>
      </html>
    `;

      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
    } catch (error) {
      console.error("Failed to generate report:", error);
      reportWindow.document.open();
      reportWindow.document.write(`
        <!doctype html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>Failed to generate report</h2>
            <p>Please close this tab and try again.</p>
            <pre>${escapeHtml(error instanceof Error ? error.message : "Unknown error")}</pre>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      Export PDF Report
    </button>
  );
};

export default ExportReportButton;
