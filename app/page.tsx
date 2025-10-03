import { withAuth } from "@workos-inc/authkit-nextjs";
import { SignOutButton } from "../src/SignOutButton";
import { Toaster } from "sonner";
import { TripDashboard } from "../src/components/TripDashboard";
import { PlaneTakeoff } from "lucide-react";
import { ContentClient } from "./content-client";

export default async function HomePage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-50 via-slate-50 to-indigo-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[conic-gradient(from_45deg,_var(--tw-gradient-stops))] from-cyan-400 via-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <PlaneTakeoff className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ohana Abroad
              </h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentClient user={user} />
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
