"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type ActivePath = {
  id: string;
  title: string;
  category: string | null;
  short_description: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  week_number: number | null;
};

type DecisionAnswer = {
  dimension: string;
  answer: string;
};

type PathStep = {
  id: string;
  step_order: number;
};

function normalizeTaskStatus(status: string | null) {
  return (status || "").trim().toLowerCase().replace(/\s+/g, "");
}

function isDoneStatus(status: string | null) {
  return normalizeTaskStatus(status) === "done";
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activePath, setActivePath] = useState<ActivePath | null>(null);
  const [pathSteps, setPathSteps] = useState<PathStep[]>([]);
  const [error, setError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (!profileData) {
        router.push("/onboarding");
        return;
      }

      const { data: activePathRow } = await supabase
        .from("user_active_paths")
        .select("path_id")
        .eq("user_id", user.id)
        .single();

      if (activePathRow?.path_id) {
        const { data: activePathData } = await supabase
          .from("paths")
          .select("id, title, category, short_description")
          .eq("id", activePathRow.path_id)
          .single();

        if (activePathData) {
          setActivePath(activePathData);
        }

        const { data: stepsData } = await supabase
          .from("path_steps")
          .select("id, step_order")
          .eq("path_id", activePathRow.path_id);

        setPathSteps(stepsData || []);
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from("plan_tasks")
        .select("id, title, description, status, week_number")
        .eq("user_id", user.id)
        .order("week_number", { ascending: true });

      if (tasksError) {
        setError(tasksError.message);
        setLoading(false);
        return;
      }

      setTasks(tasksData || []);
      setLoading(false);
    }

    loadDashboard();
  }, [router, supabase]);

  async function toggleTaskStatus(taskId: string, currentStatus: string | null) {
    const nextStatus = currentStatus === "done" ? "todo" : "done";

    const { error } = await supabase
      .from("plan_tasks")
      .update({ status: nextStatus })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: nextStatus } : task
        )
      );
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "This will permanently delete your account and all associated data. This action cannot be undone. Continue?"
    );

    if (!confirmed || deletingAccount) {
      return;
    }

    setDeletingAccount(true);

    try {
      const response = await fetch("/api/delete-account", {
        method: "POST",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error || "Failed to delete account.";
        throw new Error(message);
      }

      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete account.";
      window.alert(message);
      setDeletingAccount(false);
    }
  }

  const stepOrders = new Set(pathSteps.map((s) => s.step_order));
  const totalSteps = pathSteps.length;
  const completedSteps = tasks.filter(
    (t) => isDoneStatus(t.status) && t.week_number !== null && stepOrders.has(t.week_number)
  ).length;
  const stepProgressPercentage =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const nextActionTask = [...tasks]
    .sort((a, b) => (a.week_number ?? Number.MAX_SAFE_INTEGER) - (b.week_number ?? Number.MAX_SAFE_INTEGER))
    .find((task) => !isDoneStatus(task.status));

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-slate-600">Loading dashboard...</p>
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
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-semibold text-[#1F2A44]">Execution dashboard</h1>

            <p className="mt-3 text-lg text-slate-600">
              Focus on your active path, track your progress, and complete your next tasks.
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-10 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Current path</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {activePath ? activePath.title : "No active path yet"}
                  </h2>
                </div>

                {activePath ? (
                  <button
                    onClick={() => router.push(`/paths/${activePath.id}`)}
                    className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                  >
                    Resume this path
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/paths")}
                    className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                  >
                    Explore paths
                  </button>
                )}
              </div>

              {activePath && (
                <div className="mt-4 rounded-xl bg-[#F3F6FA] p-4">
                  <p className="text-sm text-slate-500">{activePath.category || "Path"}</p>
                  <p className="mt-2 text-slate-700">{activePath.short_description}</p>

                  {totalSteps > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-500">Your progress</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1F2A44]">
                          {completedSteps} / {totalSteps} steps completed
                        </p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-[#1F2A44] transition-all"
                          style={{ width: `${stepProgressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Next action</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {nextActionTask ? nextActionTask.title : "Your current plan is complete"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push(nextActionTask ? "/plan" : "/paths")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  {nextActionTask ? "Open this task" : "Explore paths"}
                </button>
              </div>

              {nextActionTask && (
                <div className="mt-4 rounded-xl bg-[#F3F6FA] p-4">
                  <p className="text-sm text-slate-500">From your current action plan</p>
                  <p className="text-sm text-slate-500">
                    Week {nextActionTask.week_number || "—"} • {nextActionTask.status || "todo"}
                  </p>
                  {nextActionTask.description && (
                    <p className="mt-2 text-sm text-slate-600">{nextActionTask.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">All tasks</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? "s" : ""}` : "No tasks yet"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/plan")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  Open full plan
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="mt-4 text-slate-600">No tasks available yet. Choose a path to generate your action plan.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="rounded-xl bg-[#F3F6FA] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">
                            Week {task.week_number || "-"} - {task.status || "todo"}
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-[#1F2A44]">{task.title}</h3>
                          {task.description && (
                            <p className="mt-1 text-sm text-slate-600">{task.description}</p>
                          )}
                        </div>

                        <button
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          className={`rounded-lg px-4 py-2 text-sm ${
                            isDoneStatus(task.status)
                              ? "border border-slate-300 text-slate-700 hover:bg-slate-50"
                              : "bg-[#1F2A44] text-white hover:opacity-90"
                          }`}
                        >
                          {isDoneStatus(task.status) ? "Mark as todo" : "Mark as done"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/results")}
                className="rounded-lg border border-slate-300 px-5 py-3 text-slate-700 hover:bg-slate-50"
              >
                View my insights
              </button>
            </div>

            <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-2xl font-semibold text-red-800">Delete account</h2>
              <p className="mt-2 text-sm text-red-700">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="mt-4 rounded-lg bg-red-700 px-5 py-3 text-white hover:bg-red-800 disabled:opacity-60"
              >
                {deletingAccount ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
