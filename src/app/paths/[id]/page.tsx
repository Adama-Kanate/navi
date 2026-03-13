"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type Path = {
  id: string;
  title: string;
  category: string | null;
  short_description: string | null;
  why_it_fits: string | null;
  status_target: string | null;
  decision_target: string | null;
};

type PathStep = {
  id: string;
  step_order: number;
  title: string;
  description: string | null;
};

type PlanTask = {
  week_number: number | null;
  status: string | null;
};

export default function PathDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [startingPath, setStartingPath] = useState(false);
  const [path, setPath] = useState<Path | null>(null);
  const [steps, setSteps] = useState<PathStep[]>([]);
  const [planTasks, setPlanTasks] = useState<PlanTask[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPath() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: pathData, error: pathError } = await supabase
        .from("paths")
        .select("*")
        .eq("id", params.id)
        .single();

      if (pathError) {
        setError(pathError.message);
        setLoading(false);
        return;
      }

      setPath(pathData);

      const { data: stepsData, error: stepsError } = await supabase
        .from("path_steps")
        .select("id, step_order, title, description")
        .eq("path_id", params.id)
        .order("step_order", { ascending: true });

      if (stepsError) {
        setError(stepsError.message);
        setLoading(false);
        return;
      }

      setSteps(stepsData || []);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: tasksData } = await supabase
          .from("plan_tasks")
          .select("week_number, status")
          .eq("user_id", currentUser.id);
        setPlanTasks(tasksData || []);
      }

      setLoading(false);
    }

    loadPath();
  }, [params.id, router, supabase]);

  async function handleStartPath() {
    if (!path) return;

    if (steps.length === 0) {
      setError("No path steps available yet for this path.");
      return;
    }

    setStartingPath(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: deleteError } = await supabase
      .from("plan_tasks")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
      setStartingPath(false);
      return;
    }

    const generatedTasks = steps.map((step) => ({
      user_id: user.id,
      title: step.title,
      description: step.description,
      week_number: step.step_order,
      status: "todo",
    }));

    const { error: insertError } = await supabase
      .from("plan_tasks")
      .insert(generatedTasks);

    if (insertError) {
      setError(insertError.message);
      setStartingPath(false);
      return;
    }

    const { error: activePathError } = await supabase
      .from("user_active_paths")
      .upsert({
        user_id: user.id,
        path_id: path.id,
      });

    if (activePathError) {
      setError(activePathError.message);
      setStartingPath(false);
      return;
    }

    setStartingPath(false);
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <p className="text-slate-600">Loading path...</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.push("/paths")}
            className="mb-6 text-sm text-slate-600 hover:underline"
          >
            ← Back to paths
          </button>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {path && (
              <>
                <p className="text-sm text-slate-500">{path.category || "Path"}</p>

                <h1 className="mt-2 text-4xl font-semibold text-[#1F2A44]">
                  {path.title}
                </h1>

                <p className="mt-6 text-lg text-slate-600">
                  {path.short_description}
                </p>

                <div className="mt-8 rounded-2xl bg-[#F3F6FA] p-6">
                  <p className="text-sm text-slate-500">Why this path fits you</p>
                  <p className="mt-3 text-slate-700">{path.why_it_fits}</p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Matched status</p>
                    <p className="mt-2 font-semibold text-[#1F2A44]">
                      {path.status_target || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Matched decision</p>
                    <p className="mt-2 font-semibold text-[#1F2A44]">
                      {path.decision_target || "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <h2 className="text-2xl font-semibold text-[#1F2A44]">
                    Path journey
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Follow these steps to move from uncertainty to action.
                  </p>

                  {steps.length > 0 && (() => {
                    const doneWeeks = new Set(
                      planTasks
                        .filter((t) => t.status === "done" && t.week_number !== null)
                        .map((t) => t.week_number as number)
                    );
                    const totalSteps = steps.length;
                    const completedSteps = steps.filter((s) => doneWeeks.has(s.step_order)).length;
                    const progressPercent = Math.round((completedSteps / totalSteps) * 100);
                    return (
                      <div className="mt-6 rounded-xl bg-[#F3F6FA] p-4">
                        <p className="text-sm text-slate-500">Progress on this path</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#1F2A44]">
                            {completedSteps} / {totalSteps} steps completed
                          </p>
                          <p className="text-sm text-slate-500">{progressPercent}% complete</p>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-[#1F2A44] transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {steps.length === 0 ? (
                    <div className="mt-6 rounded-xl border border-slate-200 p-6">
                      <p className="text-slate-600">
                        No path steps available yet for this path.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {steps.map((step) => {
                        const isDone = planTasks.some(
                          (t) => t.week_number === step.step_order && t.status === "done"
                        );
                        return (
                          <div
                            key={step.id}
                            className={`rounded-xl border p-5 ${
                              isDone
                                ? "border-green-200 bg-green-50"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-500">
                                {isDone ? "✔ " : ""}Step {step.step_order}
                              </p>
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  isDone
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {isDone ? "Done" : "To do"}
                              </span>
                            </div>
                            <h3 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                              {step.title}
                            </h3>
                            {step.description && (
                              <p className="mt-2 text-slate-600">{step.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={handleStartPath}
                    disabled={startingPath || steps.length === 0}
                    className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {startingPath ? "Choosing path..." : "Choose this path"}
                  </button>

                  <button
                    onClick={() => router.push("/mentors")}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
                  >
                    View matching mentors
                  </button>

                  <button
                    onClick={() => router.push("/paths")}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
                  >
                    Back to paths
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
