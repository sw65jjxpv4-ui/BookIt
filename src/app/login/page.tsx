"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { phoneToAuthEmail } from "@/lib/phone";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: mode === "email" ? identifier : phoneToAuthEmail(identifier),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="mx-auto max-w-sm">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Log in
        </h1>

        <div className="mt-6 flex rounded-md border border-zinc-200 p-1 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex-1 rounded px-3 py-1.5 text-sm ${
              mode === "email"
                ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex-1 rounded px-3 py-1.5 text-sm ${
              mode === "phone"
                ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
                : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-zinc-600 dark:text-zinc-400">
              {mode === "email" ? "Email" : "Phone number"}
            </label>
            <input
              type={mode === "email" ? "email" : "tel"}
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === "email" ? "you@example.com" : "0300 1234567"}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-600 dark:text-zinc-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
