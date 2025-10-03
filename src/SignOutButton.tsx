"use client";

import { signOut } from "./actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="px-4 py-2 rounded bg-white text-secondary border border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-sm hover:shadow"
      >
        Sign out
      </button>
    </form>
  );
}
