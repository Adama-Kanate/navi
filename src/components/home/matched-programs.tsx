export function MatchedPrograms() {
  return (
    <section className="bg-[#FAFAFA] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium uppercase tracking-wide text-[#7FB7D8]">
          Matched Programs
        </p>

        <h2 className="mt-4 text-center text-3xl font-semibold text-[#1F2A44] md:text-4xl">
          Programs matched to your profile
        </h2>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button className="rounded-full bg-[#1F2A44] px-4 py-2 text-sm font-medium text-white">
            All Fields
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            Business
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            Engineering
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            Design
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            Data Science
          </button>

          <button className="ml-2 rounded-full bg-[#1F2A44] px-4 py-2 text-sm font-medium text-white">
            All Countries
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            France
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            UK
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            Germany
          </button>
          <button className="rounded-full bg-[#DCE6F2] px-4 py-2 text-sm font-medium text-[#1F2A44]">
            Netherlands
          </button>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-[#1F2A44] md:text-2xl">
                MSc Digital Marketing & Data Analytics
              </h3>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                39 days left
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">ESSEC Business School</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#DCE6F2] px-3 py-1 text-xs text-[#1F2A44]">
                Business
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                France
              </span>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>• Bachelor&apos;s degree in business or related field</li>
              <li>• TOEFL 90+ or IELTS 6.5+</li>
            </ul>

            <p className="mt-5 text-sm text-[#7FB7D8]">
              Why it matches you: Matches your interest in marketing and data analysis
            </p>

            <button className="mt-6 rounded-xl bg-[#1F2A44] px-5 py-3 text-sm font-medium text-white hover:opacity-90">
              View & Apply →
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-[#1F2A44] md:text-2xl">
                MEng Software Engineering
              </h3>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                85 days left
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">TU Munich</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#DCE6F2] px-3 py-1 text-xs text-[#1F2A44]">
                Engineering
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                Germany
              </span>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>• BSc in Computer Science or equivalent</li>
              <li>• GPA 3.0+ or equivalent</li>
            </ul>

            <p className="mt-5 text-sm text-[#7FB7D8]">
              Why it matches you: Aligns with your technical profile and coding challenges
            </p>

            <button className="mt-6 rounded-xl bg-[#1F2A44] px-5 py-3 text-sm font-medium text-white hover:opacity-90">
              View & Apply →
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-[#1F2A44] md:text-2xl">
                BA Interaction Design
              </h3>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                18 days left
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">Design Academy Eindhoven</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#DCE6F2] px-3 py-1 text-xs text-[#1F2A44]">
                Design
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                Netherlands
              </span>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>• Portfolio of 10+ projects</li>
              <li>• Motivation letter</li>
            </ul>

            <p className="mt-5 text-sm text-[#7FB7D8]">
              Why it matches you: Fits your UX design interest and creative skills
            </p>

            <button className="mt-6 rounded-xl bg-[#1F2A44] px-5 py-3 text-sm font-medium text-white hover:opacity-90">
              View & Apply →
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-[#1F2A44] md:text-2xl">
                MSc Applied Data Science
              </h3>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                116 days left
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">University of London</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#DCE6F2] px-3 py-1 text-xs text-[#1F2A44]">
                Data Science
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                UK
              </span>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>• Quantitative bachelor&apos;s degree</li>
              <li>• Basic Python proficiency</li>
            </ul>

            <p className="mt-5 text-sm text-[#7FB7D8]">
              Why it matches you: Matches your data analysis badges and profile
            </p>

            <button className="mt-6 rounded-xl bg-[#1F2A44] px-5 py-3 text-sm font-medium text-white hover:opacity-90">
              View & Apply →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
