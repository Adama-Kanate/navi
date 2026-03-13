"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isExchangingCode, setIsExchangingCode] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const hasAttemptedExchange = useRef(false);

  useEffect(() => {
    async function initializeRecoverySession() {
      if (hasAttemptedExchange.current) return;
      hasAttemptedExchange.current = true;

      setIsExchangingCode(true);
      setIsReady(false);
      setError("");
      setSuccess("");

      const code = searchParams.get("code");

      if (!code) {
        setError("This password reset link is invalid or expired.");
        setIsExchangingCode(false);
        return;
      }

      const {
        data: { session },
        error: exchangeError,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !session) {
        setError("This password reset link is invalid or expired.");
        setIsExchangingCode(false);
        return;
      }

      setIsReady(true);
      setIsExchangingCode(false);
    }

    initializeRecoverySession();
  }, [searchParams, supabase]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess("");
    setError("");

    if (!isReady) {
      setError("This password reset link is invalid or expired.");
      setIsSubmitting(false);
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill both password fields.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess("Password updated successfully. Redirecting to login...");
    setIsSubmitting(false);
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      router.push("/login");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      <section className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#1F2A44]">Set a new password</h1>

          {isExchangingCode && (
            <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Preparing your password reset...
            </p>
          )}

          <form onSubmit={handleUpdatePassword} className="mt-6 flex flex-col gap-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3"
              required
              disabled={isExchangingCode || !isReady || isSubmitting}
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg border border-slate-200 px-4 py-3"
              required
              disabled={isExchangingCode || !isReady || isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting || isExchangingCode || !isReady}
              className="mt-2 rounded-lg bg-[#1F2A44] px-4 py-3 text-white hover:opacity-90 disabled:opacity-50"
            >
              {isExchangingCode
                ? "Preparing reset link..."
                : isSubmitting
                  ? "Updating password..."
                  : "Update password"}
            </button>
          </form>

          {success && (
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
