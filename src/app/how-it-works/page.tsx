import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-semibold text-[#1F2A44]">
            How Navi works
          </h1>

          <p className="mt-6 text-lg text-slate-600">
            Navi helps you turn career uncertainty into a clear direction and a
            concrete 30-day action plan.
          </p>

          <div className="mt-16 space-y-10 text-left">
            <div>
              <h3 className="text-xl font-semibold text-[#1F2A44]">
                1. Clarify your direction
              </h3>
              <p className="mt-2 text-slate-600">
                Answer a few structured questions to define your interests,
                constraints and goals.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1F2A44]">
                2. Explore realistic paths
              </h3>
              <p className="mt-2 text-slate-600">
                Navi suggests realistic options and programs aligned with your
                profile.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#1F2A44]">
                3. Follow your action plan
              </h3>
              <p className="mt-2 text-slate-600">
                A structured 30-day roadmap helps you move forward with clear
                tasks and deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
