import React, { useMemo, useState } from "react";

type TodoItem = {
  id: string;
  task: string;
  priority: "high" | "medium" | "low";
  reason?: string;
};

const priorityClass: Record<TodoItem["priority"], string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

const buildFallbackTasks = (feedback: Feedback): TodoItem[] => {
  const tasks: TodoItem[] = [];
  const addTask = (task: string, priority: TodoItem["priority"], reason?: string) => {
    const normalized = task.trim();
    if (!normalized) return;
    if (tasks.some((item) => item.task.toLowerCase() === normalized.toLowerCase())) return;
    tasks.push({
      id: `fallback-${tasks.length + 1}`,
      task: normalized,
      priority,
      reason,
    });
  };

  feedback.jdMatch?.missingKeywords?.slice(0, 3).forEach((keyword) => {
    addTask(
      `Add keyword "${keyword}" in summary or experience bullets`,
      "high",
      "Directly improves Job Description match score"
    );
  });

  const buckets = [feedback.ATS, feedback.content, feedback.structure, feedback.skills, feedback.toneAndStyle];
  buckets.forEach((bucket) => {
    bucket.tips
      .filter((tip) => tip.type === "improve")
      .slice(0, 2)
      .forEach((tip) => addTask(tip.tip, "medium"));
  });

  if (tasks.length === 0) {
    addTask("Refine resume bullets with measurable impact", "medium");
  }

  return tasks.slice(0, 7);
};

const normalizeActionPlan = (feedback: Feedback): TodoItem[] => {
  if (!feedback.actionPlan?.length) return buildFallbackTasks(feedback);

  return feedback.actionPlan.map((item, idx) => ({
    id: `ai-${idx + 1}`,
    task: item.task,
    priority: item.priority,
    reason: item.reason,
  }));
};

const ActionPlan = ({ feedback, resumeId }: { feedback: Feedback; resumeId: string }) => {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});
  const generatedTasks = useMemo(() => normalizeActionPlan(feedback), [feedback]);
  const storageKey = `action_plan_progress_${resumeId}`;

  const generatedCount = todoItems.length;
  const completedCount = todoItems.filter((item) => doneMap[item.id]).length;

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        todoItems?: TodoItem[];
        doneMap?: Record<string, boolean>;
      };

      if (Array.isArray(parsed.todoItems) && parsed.todoItems.length > 0) {
        setTodoItems(parsed.todoItems);
      }
      if (parsed.doneMap && typeof parsed.doneMap === "object") {
        setDoneMap(parsed.doneMap);
      }
    } catch (error) {
      console.error("Failed to restore action plan progress:", error);
    }
  }, [storageKey]);

  React.useEffect(() => {
    try {
      if (!todoItems.length) {
        localStorage.removeItem(storageKey);
        return;
      }
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          todoItems,
          doneMap,
        })
      );
    } catch (error) {
      console.error("Failed to persist action plan progress:", error);
    }
  }, [todoItems, doneMap, storageKey]);

  const handleGenerate = () => {
    setTodoItems(generatedTasks);
    setDoneMap({});
  };

  const toggleTask = (id: string) => {
    setDoneMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async () => {
    if (!todoItems.length) return;
    const text = todoItems
      .map((item) => `${doneMap[item.id] ? "[x]" : "[ ]"} ${item.task}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy checklist:", error);
    }
  };

  const handleReset = () => {
    setTodoItems([]);
    setDoneMap({});
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to reset action plan progress:", error);
    }
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Action Plan</h3>
          <p className="text-sm text-slate-600">Generate a one-click to-do list from your AI feedback.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            One-click Generate
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!todoItems.length}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Checklist
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!todoItems.length}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {todoItems.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-slate-600">
            Progress: <span className="font-semibold text-slate-900">{completedCount}</span> /{" "}
            <span className="font-semibold text-slate-900">{generatedCount}</span> completed
          </p>
          <div className="space-y-3">
            {todoItems.map((item) => {
              const done = !!doneMap[item.id];
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                    done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={done}
                    onChange={() => toggleTask(item.id)}
                  />
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-medium ${done ? "line-through text-slate-500" : "text-slate-800"}`}>
                        {item.task}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    {item.reason && <p className="text-xs text-slate-500">{item.reason}</p>}
                  </div>
                </label>
              );
            })}
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
          Click <span className="font-semibold text-slate-700">One-click Generate</span> to build your personalized task checklist.
        </p>
      )}
    </section>
  );
};

export default ActionPlan;
