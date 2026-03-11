export function DashboardPreview() {
  return (
    <section className="bg-[#F3F6FA] px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-[#7FB7D8]">
            Dashboard
          </p>

          <h2 className="mt-4 text-3xl font-semibold text-[#1F2A44] md:text-4xl">
            Turn uncertainty into a clear plan.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Navi organizes your decisions, mentors, and next steps into one simple
            dashboard.
          </p>

          <div className="mt-8 space-y-4 text-slate-600">
            <div>• Personalized decision roadmap</div>
            <div>• Weekly action plan</div>
            <div>• Mentor guidance when needed</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm text-slate-500">Dashboard preview</p>
              <h3 className="text-xl font-semibold text-[#1F2A44]">Your Navi dashboard</h3>
            </div>

            <span className="rounded-full bg-[#DCE6F2] px-3 py-1 text-xs font-medium text-[#1F2A44]">
              Week 2
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-sm text-slate-500">Top matched program</p>
              <h4 className="mt-1 text-lg font-semibold text-[#1F2A44]">
                MSc Applied Data Science
              </h4>
              <p className="mt-1 text-sm text-slate-500">Deadline in 18 days</p>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-sm text-slate-500">Next mentor session</p>
              <h4 className="mt-1 text-lg font-semibold text-[#1F2A44]">
                Career strategist — Friday, 15:00
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Focus: choosing between business and data paths
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FAFC] p-4">
              <p className="text-sm text-slate-500">This week&apos;s tasks</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>• Finalize shortlist of 3 programs</li>
                <li>• Draft motivation letter outline</li>
                <li>• Complete 1 challenge in data analysis</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#1F2A44] p-4 text-white">
              <p className="text-sm text-slate-200">Progress</p>
              <h4 className="mt-1 text-lg font-semibold">68% of your 30-day plan completed</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
