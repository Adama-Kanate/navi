import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-[#FAFAFA] px-6 py-24 md:py-32">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#1F2A44] sm:text-5xl md:text-7xl">
          From stuck to moving — <span className="text-[#7FB7D8]">in one clear plan.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
          Step-by-step action plan, matched schools and programs with real deadlines,
          and verified mentors.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-[#1F2A44] px-6 py-3 text-base font-medium text-white transition hover:opacity-90"
          >
            Build My Plan →
          </Link>

          <Link
            href="/paths"
            className="rounded-xl bg-[#DCE6F2] px-6 py-3 text-base font-medium text-[#1F2A44] transition hover:opacity-90"
          >
            See Example Matches
          </Link>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:gap-8">
          <div>○ Verified deadlines from official sources</div>
          <div>○ Verified mentors only</div>
          <div>○ Clear weekly action plan</div>
        </div>
      </div>
    </section>
  );
}
