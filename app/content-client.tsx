"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { TripDashboard } from "../src/components/TripDashboard";
import { useEffect } from "react";

export function ContentClient({ user }: { user: any }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const createUser = useMutation(api.auth.createUser);

  useEffect(() => {
    // If user is authenticated but no Convex user exists, create one
    if (user && !loggedInUser && loggedInUser !== undefined) {
      createUser({
        subject: user.id,
        name: user.firstName || user.name,
        email: user.email,
      });
    }
  }, [user, loggedInUser, createUser]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back,{" "}
          {user?.firstName || user?.email?.split("@")[0] || "Traveler"}! 👋
        </h2>
        <p className="text-lg text-gray-600">
          Plan your perfect European adventure with your family
        </p>
      </div>
      <TripDashboard />
    </div>
  );
}
