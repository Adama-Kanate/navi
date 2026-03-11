export function Trust() {
  return (
    <section className="bg-[#FAFAFA] px-6 py-24">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-[#7FB7D8]">
          Why Navi
        </p>

        <h2 className="mt-4 text-3xl font-semibold text-[#1F2A44] md:text-4xl">
          Built for clarity, backed by structure
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Navi helps users move forward with trusted information, transparent reasoning,
          and a plan they can actually follow.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Verified information
            </h3>
            <p className="mt-4 text-slate-600">
              Programs, requirements, and deadlines are meant to come from reliable,
              official sources.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Human-supported guidance
            </h3>
            <p className="mt-4 text-slate-600">
              Mentor sessions add a real feedback layer when users need reassurance
              or perspective.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1F2A44]">
              Transparent next steps
            </h3>
            <p className="mt-4 text-slate-600">
              No fake certainty — just realistic options, practical tasks, and a clear
              30-day direction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
