export function Features() {
  return (
    <section className="bg-[#FAFAFA] px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">

        <p className="text-sm font-medium tracking-wide text-[#7FB7D8] uppercase">
          Features
        </p>

        <h2 className="mt-4 text-3xl font-semibold text-[#1F2A44] md:text-4xl">
          Everything you need to navigate your career
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-2">

          {/* Feature 1 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm text-left">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Career Immersion Feed
            </h3>

            <p className="mt-4 text-slate-600">
              Short, real-world career insights from professionals across industries.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm text-left">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Level 1 & Level 2 Challenges
            </h3>

            <p className="mt-4 text-slate-600">
              Practical micro-missions to test your fit before committing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm text-left">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Mentor Sessions
            </h3>

            <p className="mt-4 text-slate-600">
              Book 15-minute calls with industry professionals for direct guidance.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm text-left">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Dynamic Career Dashboard
            </h3>

            <p className="mt-4 text-slate-600">
              Track your progress, badges, and validated skills in one place.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
