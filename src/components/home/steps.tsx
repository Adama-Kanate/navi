export function Steps() {
  return (
    <section className="bg-[#F3F6FA] px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">

        <h2 className="text-3xl font-semibold text-[#1F2A44] md:text-4xl">
          Three steps to your action plan
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {/* Step 1 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="text-4xl font-semibold text-[#DCE6F2]">01</div>

            <h3 className="mt-6 text-xl font-semibold text-[#1F2A44]">
              Clarify your direction
            </h3>

            <p className="mt-4 text-slate-600">
              Answer 5 quick questions to build your profile.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="text-4xl font-semibold text-[#DCE6F2]">02</div>

            <h3 className="mt-6 text-xl font-semibold text-[#1F2A44]">
              Get matched programs
            </h3>

            <p className="mt-4 text-slate-600">
              See a shortlist of schools and programs with deadlines and requirements.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="text-4xl font-semibold text-[#DCE6F2]">03</div>

            <h3 className="mt-6 text-xl font-semibold text-[#1F2A44]">
              Follow your action plan
            </h3>

            <p className="mt-4 text-slate-600">
              A week-by-week checklist to apply without missing anything.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
