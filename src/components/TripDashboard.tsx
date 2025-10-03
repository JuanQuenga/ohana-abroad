"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { TripCard } from "./TripCard";
import { TripDetail } from "./TripDetail";
import { CreateTripModal } from "./CreateTripModal";
import { Button } from "./ui/Button";

export function TripDashboard() {
  const trips = useQuery(api.trips.list) || [];
  const [selectedTripId, setSelectedTripId] = useState<Id<"trips"> | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedTrip = useQuery(
    api.trips.get,
    selectedTripId ? { tripId: selectedTripId } : "skip"
  );

  if (selectedTripId && selectedTrip) {
    return (
      <TripDetail trip={selectedTrip} onBack={() => setSelectedTripId(null)} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Your Trips</h3>
          <p className="text-gray-600 mt-1">
            Manage and organize your family adventures
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-br from-cyan-400 via-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-cyan-600 hover:via-blue-600 hover:to-indigo-700"
        >
          <span className="mr-2">+</span>
          New Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-gray-400">🗺️</span>
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            No trips yet
          </h4>
          <p className="text-gray-600 mb-6">
            Create your first trip to start planning your adventure!
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-br from-cyan-400 via-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-cyan-600 hover:via-blue-600 hover:to-indigo-700"
          >
            Create Your First Trip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              onClick={() => setSelectedTripId(trip._id)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTripModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
