"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/onboarding");
  }

  async function handleForgotPassword() {
    setResetLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email first.");
      setResetLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
      setResetLoading(false);
      return;
    }

    setMessage("Check your email for a password reset link.");
    setResetLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#1F2A44]">
            Log in to Navi
          </h1>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3"
              required
            />

            <button
              type="button"
              onClick={() => setShowForgotPassword((prev) => !prev)}
              className="self-start text-sm text-slate-600 hover:underline"
            >
              Forgot password?
            </button>

            {showForgotPassword && (
              <div className="rounded-lg border border-slate-200 bg-[#F3F6FA] p-4">
                <p className="text-sm text-slate-600">
                  Enter your email and we will send you a reset link.
                </p>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Send reset link"}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-[#1F2A44] px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
