import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#1F2A44]">
            Log in to Navi
          </h1>

          <form className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg border border-slate-200 px-4 py-3"
            />

            <input
              type="password"
              placeholder="Password"
              className="rounded-lg border border-slate-200 px-4 py-3"
            />

            <button className="mt-2 rounded-lg bg-[#1F2A44] px-4 py-3 text-white hover:opacity-90">
              Log in
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
