import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function NavBar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const displayName =
    (claims?.user_metadata as { full_name?: string } | undefined)
      ?.full_name ??
    claims?.email ??
    claims?.phone;

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-semibold text-black dark:text-zinc-50"
        >
          BookIt
        </Link>

        {claims ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Hi, {displayName}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-black px-3 py-1.5 text-white dark:bg-zinc-50 dark:text-black"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
