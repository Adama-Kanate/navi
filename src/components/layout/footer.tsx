import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
        <div>
          <Link href="/" className="text-xl font-semibold text-[#1F2A44]">
            navi
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
            Clarity you can act on. Navi helps students and young professionals
            turn uncertainty into a clear, structured next step.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1F2A44]">
            Product
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/how-it-works" className="hover:text-[#1F2A44]">
              How it works
            </Link>
            <Link href="/signup" className="hover:text-[#1F2A44]">
              Build My Plan
            </Link>
            <Link href="/dashboard" className="hover:text-[#1F2A44]">
              Dashboard
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1F2A44]">
            Company
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/" className="hover:text-[#1F2A44]">
              About
            </Link>
            <Link href="/" className="hover:text-[#1F2A44]">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1F2A44]">
            Legal
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/" className="hover:text-[#1F2A44]">
              Privacy
            </Link>
            <Link href="/" className="hover:text-[#1F2A44]">
              Terms
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">
          © 2026 Navi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
