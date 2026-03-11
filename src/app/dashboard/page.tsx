"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";
import { sameDecision, sameStatus } from "@/lib/matching";

type Profile = {
  id: string;
  full_name: string | null;
  current_status: string | null;
  target_decision: string | null;
  deadline_window: string | null;
  stuck_level: number | null;
  constraints: string[] | null;
};

type Path = {
  id: string;
  title: string;
  category: string | null;
  short_description: string | null;
  status_target: string | null;
  decision_target: string | null;
};

type Mentor = {
  id: string;
  full_name: string;
  title: string | null;
  short_bio: string | null;
  booking_url: string | null;
  expertise_status: string | null;
  expertise_decision: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  week_number: number | null;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");

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
        .select("*")
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

      setProfile(profileData);

      const { data: pathsData, error: pathsError } = await supabase
        .from("paths")
        .select("id, title, category, short_description, status_target, decision_target");

      if (pathsError) {
        setError(pathsError.message);
        setLoading(false);
        return;
      }

      const allPaths = pathsData || [];
      const statusMatchedPaths = allPaths.filter((path) =>
        sameStatus(path.status_target, profileData.current_status)
      );
      const decisionMatchedPaths = statusMatchedPaths.filter((path) =>
        sameDecision(path.decision_target, profileData.target_decision)
      );

      setPaths(decisionMatchedPaths.length > 0 ? decisionMatchedPaths : statusMatchedPaths);

      const { data: mentorsData, error: mentorsError } = await supabase
        .from("mentors")
        .select(
          "id, full_name, title, short_bio, booking_url, expertise_status, expertise_decision"
        );

      if (mentorsError) {
        setError(mentorsError.message);
        setLoading(false);
        return;
      }

      const allMentors = mentorsData || [];
      const statusMatchedMentors = allMentors.filter((mentor) =>
        sameStatus(mentor.expertise_status, profileData.current_status)
      );
      const decisionMatchedMentors = statusMatchedMentors.filter((mentor) =>
        sameDecision(mentor.expertise_decision, profileData.target_decision)
      );

      setMentors(
        decisionMatchedMentors.length > 0 ? decisionMatchedMentors : statusMatchedMentors
      );

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

  function getSuggestedNextStep() {
    if (!profile) return "Complete your profile to unlock your next steps.";

    if (profile.target_decision === "Choose an internship") {
      return "Shortlist 3 internship targets and prepare one tailored application this week.";
    }

    if (profile.target_decision === "Choose a master's program") {
      return "Compare 3 programs, review deadlines, and note the required documents.";
    }

    if (profile.target_decision === "Choose a first job") {
      return "Clarify 2 target roles and identify the skills and experiences each one requires.";
    }

    if (profile.target_decision === "Switch careers") {
      return "Define one realistic transition path and validate it with a small practical test.";
    }

    if (profile.target_decision === "Choose post-secondary options") {
      return "Build a shortlist of post-secondary options that match your strengths and constraints.";
    }

    return "Identify one realistic path and break it into small actions for the next 7 days.";
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  async function toggleTaskStatus(task: Task) {
    const nextStatus = task.status === "done" ? "todo" : "done";

    const { error } = await supabase
      .from("plan_tasks")
      .update({ status: nextStatus })
      .eq("id", task.id);

    if (!error) {
      setTasks((prev) =>
        prev.map((currentTask) =>
          currentTask.id === task.id ? { ...currentTask, status: nextStatus } : currentTask
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
            <h1 className="text-4xl font-semibold text-[#1F2A44]">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>

            <p className="mt-3 text-lg text-slate-600">
              Here is your current Navi profile and decision context.
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Current status</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.current_status || "Not provided"}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Target decision</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.target_decision || "Not provided"}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Next important deadline</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.deadline_window || "Not provided"}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500">Stuck level</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1F2A44]">
                  {profile?.stuck_level ? `${profile.stuck_level}/10` : "Not provided"}
                </h2>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Constraints</p>

              {profile?.constraints && profile.constraints.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.constraints.map((constraint) => (
                    <span
                      key={constraint}
                      className="rounded-full bg-[#DCE6F2] px-3 py-1 text-sm text-[#1F2A44]"
                    >
                      {constraint}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-slate-600">No constraints provided yet.</p>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-[#1F2A44] p-6 text-white">
              <p className="text-sm text-slate-200">Suggested next step</p>
              <h2 className="mt-2 text-2xl font-semibold">{getSuggestedNextStep()}</h2>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">Your progress</p>

              <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                {progressPercentage}% of your current plan completed
              </h2>

              <div className="mt-4 h-3 w-full rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-[#1F2A44] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {completedTasks} of {totalTasks} task{totalTasks > 1 ? "s" : ""} completed
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Suggested paths</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {paths.length > 0
                      ? `${paths.length} path${paths.length > 1 ? "s" : ""} matched to your profile`
                      : "No matched paths yet"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/paths")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  View my paths
                </button>
              </div>

              {paths.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {paths.slice(0, 2).map((path) => (
                    <div key={path.id} className="rounded-xl bg-[#F3F6FA] p-4">
                      <p className="text-sm text-slate-500">{path.category || "Path"}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[#1F2A44]">
                        {path.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {path.short_description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Suggested mentors</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {mentors.length > 0
                      ? `${mentors.length} mentor${mentors.length > 1 ? "s" : ""} matched to your profile`
                      : "No matched mentors yet"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/mentors")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  View mentors
                </button>
              </div>

              {mentors.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {mentors.slice(0, 2).map((mentor) => (
                    <div key={mentor.id} className="rounded-xl bg-[#F3F6FA] p-4">
                      <p className="text-sm text-slate-500">{mentor.title || "Mentor"}</p>
                      <h3 className="mt-2 text-lg font-semibold text-[#1F2A44]">
                        {mentor.full_name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">{mentor.short_bio}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Your action plan</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                    {tasks.length > 0
                      ? `${tasks.length} task${tasks.length > 1 ? "s" : ""} in your current plan`
                      : "No tasks yet"}
                  </h2>
                </div>

                <button
                  onClick={() => router.push("/challenges")}
                  className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
                >
                  View tasks
                </button>
              </div>

              {tasks.length > 0 && (
                <div className="mt-6 space-y-4">
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="rounded-xl bg-[#F3F6FA] p-4">
                      <p className="text-sm text-slate-500">
                        Week {task.week_number || "—"} • {task.status || "todo"}
                      </p>

                      <h3 className="mt-2 text-lg font-semibold text-[#1F2A44]">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-2 text-sm text-slate-600">{task.description}</p>
                      )}

                      {task.status === "done" && (
                        <p className="mt-4 font-medium text-green-600">✓ Completed</p>
                      )}

                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="mt-4 rounded-lg bg-[#1F2A44] px-4 py-2 text-white hover:opacity-90"
                      >
                        {task.status === "done" ? "Mark as todo" : "Mark as done"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => router.push("/onboarding")}
                className="rounded-lg bg-[#1F2A44] px-5 py-3 text-white hover:opacity-90"
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
