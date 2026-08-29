import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  city: string;
  address: string | null;
  price_range: number | null;
  cover_photo_url: string | null;
};

type Photo = {
  id: string;
  photo_url: string;
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
};

type AvailabilitySlot = {
  id: string;
  slot_date: string;
  slot_time: string;
  capacity: number;
  booked_count: number;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: restaurant },
    { data: photos },
    { data: menuItems },
    { data: slots },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("id, name, description, cuisine, city, address, price_range, cover_photo_url")
      .eq("id", id)
      .single(),
    supabase
      .from("restaurant_photos")
      .select("id, photo_url")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("menu_items")
      .select("id, name, description, price, category")
      .eq("restaurant_id", id)
      .order("category", { ascending: true }),
    supabase
      .from("availability_slots")
      .select("id, slot_date, slot_time, capacity, booked_count")
      .eq("restaurant_id", id)
      .gte("slot_date", today)
      .order("slot_date", { ascending: true })
      .order("slot_time", { ascending: true }),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!restaurant) {
    notFound();
  }

  const typedRestaurant = restaurant as Restaurant;
  const typedPhotos = (photos ?? []) as Photo[];
  const typedMenuItems = (menuItems ?? []) as MenuItem[];
  const typedSlots = (slots ?? []) as AvailabilitySlot[];
  const typedReviews = (reviews ?? []) as Review[];

  const averageRating =
    typedReviews.length > 0
      ? (
          typedReviews.reduce((sum, review) => sum + review.rating, 0) /
          typedReviews.length
        ).toFixed(1)
      : null;

  const menuByCategory = typedMenuItems.reduce<Record<string, MenuItem[]>>(
    (groups, item) => {
      const key = item.category ?? "Menu";
      groups[key] = groups[key] ? [...groups[key], item] : [item];
      return groups;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <main className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← All restaurants
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {typedRestaurant.name}
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              {typedRestaurant.city}
              {typedRestaurant.cuisine ? ` · ${typedRestaurant.cuisine}` : ""}
              {typedRestaurant.price_range
                ? ` · ${"$".repeat(typedRestaurant.price_range)}`
                : ""}
            </p>
            {typedRestaurant.address && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {typedRestaurant.address}
              </p>
            )}
          </div>
          {averageRating && (
            <div className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-lg font-semibold text-black dark:text-zinc-50">
                ★ {averageRating}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {typedReviews.length}{" "}
                {typedReviews.length === 1 ? "review" : "reviews"}
              </div>
            </div>
          )}
        </div>

        {typedRestaurant.description && (
          <p className="mt-6 text-zinc-700 dark:text-zinc-300">
            {typedRestaurant.description}
          </p>
        )}

        {typedPhotos.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">
              Photos
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {typedPhotos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.photo_url}
                  alt={typedRestaurant.name}
                  className="h-32 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            Availability
          </h2>
          {typedSlots.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              No upcoming time slots yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {typedSlots.map((slot) => {
                const full = slot.booked_count >= slot.capacity;
                return (
                  <li
                    key={slot.id}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      full
                        ? "border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                        : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {slot.slot_date} · {slot.slot_time.slice(0, 5)}
                    {full ? " (full)" : ""}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {typedMenuItems.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">
              Menu
            </h2>
            <div className="mt-3 flex flex-col gap-6">
              {Object.entries(menuByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {category}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <div>
                          <div className="text-black dark:text-zinc-50">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.price != null && (
                          <div className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
                            Rs {item.price}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">
            Reviews
          </h2>
          {typedReviews.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              No reviews yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-4">
              {typedReviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="text-sm font-medium text-black dark:text-zinc-50">
                    ★ {review.rating}
                  </div>
                  {review.comment && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
