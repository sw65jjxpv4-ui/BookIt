import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: string;
  name: string;
  city: string;
  cuisine: string | null;
  description: string | null;
};

export default async function Home() {
  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("id, name, city, cuisine, description")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          BookIt
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Find and reserve a table at restaurants across Pakistan.
        </p>

        {error && (
          <p className="mt-8 text-red-600">
            Could not load restaurants: {error.message}
          </p>
        )}

        {!error && restaurants?.length === 0 && (
          <p className="mt-8 text-zinc-600 dark:text-zinc-400">
            No restaurants yet — add one in Supabase to see it here.
          </p>
        )}

        <ul className="mt-8 flex flex-col gap-4">
          {restaurants?.map((restaurant: Restaurant) => (
            <li
              key={restaurant.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-lg font-medium text-black dark:text-zinc-50">
                {restaurant.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {restaurant.city}
                {restaurant.cuisine ? ` · ${restaurant.cuisine}` : ""}
              </p>
              {restaurant.description && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {restaurant.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
