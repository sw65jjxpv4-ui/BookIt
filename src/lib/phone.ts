// Normalizes a Pakistani phone number to digits-only, country-code-first
// form (e.g. "0300 1234567" or "+92 300 1234567" -> "923001234567") so the
// same number always maps to the same account, no matter how it's typed.
export function normalizePakistaniPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return `92${digits}`;
}

// Supabase Auth's phone sign-in requires an SMS provider we don't have set
// up yet (see project notes). Until then, phone accounts are implemented as
// email accounts under the hood, using an email address nobody will ever
// see or receive mail at, derived from the phone number.
export function phoneToAuthEmail(rawPhone: string): string {
  return `p${normalizePakistaniPhone(rawPhone)}@phone.bookit.internal`;
}
