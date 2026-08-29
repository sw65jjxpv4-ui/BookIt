import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Restaurant not found
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This restaurant may have been removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to all restaurants
        </Link>
      </main>
    </div>
  );
}
