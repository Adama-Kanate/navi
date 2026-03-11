"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  week_number: number | null;
};

export default function ChallengesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("plan_tasks")
        .select("id, title, description, status, week_number")
        .eq("user_id", user.id)
        .order("week_number", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setTasks(data || []);
      setLoading(false);
    }

    loadTasks();
  }, [router, supabase]);

  async function toggleTaskStatus(taskId: string, currentStatus: string | null) {
    const nextStatus = currentStatus === "done" ? "todo" : "done";

    const { error } = await supabase
      .from("plan_tasks")
      .update({ status: nextStatus })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((currentTask) =>
          currentTask.id === taskId ? { ...currentTask, status: nextStatus } : currentTask
        )
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-slate-600">Loading tasks...</p>
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
          <h1 className="text-4xl font-semibold text-[#1F2A44]">
            Your action plan
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            These are your current tasks for moving forward with clarity.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {tasks.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-slate-600">No tasks available yet.</p>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Week {task.week_number || "—"} • {task.status || "todo"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {task.title}
                  </h2>
                  {task.description && (
                    <p className="mt-3 text-slate-600">{task.description}</p>
                  )}
                  <div className="mt-4 flex items-center justify-end">
                    {task.status !== "done" ? (
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="mt-4 rounded-lg bg-[#1F2A44] px-4 py-2 text-white hover:opacity-90"
                      >
                        Mark as done
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        Mark as todo
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
