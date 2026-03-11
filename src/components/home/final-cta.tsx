import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-[#1F2A44] px-6 py-24 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-[#DCE6F2]">
          Start now
        </p>

        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
          Get a clear direction and a 30-day plan you can actually follow
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200">
          Stop losing time in uncertainty. Build your plan, explore realistic paths,
          and move forward with structure.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-6 py-3 text-base font-medium text-[#1F2A44] transition hover:opacity-90"
          >
            Build My Plan →
          </Link>

          <Link
            href="/how-it-works"
            className="rounded-xl border border-white/30 px-6 py-3 text-base font-medium text-white transition hover:bg-white/10"
          >
            How it works
          </Link>
        </div>
      </div>
    </section>
  );
}
