import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { TripDashboard } from "./components/TripDashboard";
import { useState } from "react";
import { PlaneTakeoff } from "lucide-react";

export default function App() {
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
            <Authenticated>
              <SignOutButton />
            </Authenticated>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Content />
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Authenticated>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {loggedInUser?.email?.split("@")[0] || "Traveler"}! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Plan your perfect European adventure with your family
          </p>
        </div>
        <TripDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[conic-gradient(from_45deg,_var(--tw-gradient-stops))] from-cyan-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlaneTakeoff className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Plan Your Dream Trip
            </h2>
            <p className="text-lg text-gray-600">
              Collaborate with your family to organize the perfect European
              getaway
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
