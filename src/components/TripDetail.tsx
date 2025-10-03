import { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { Button } from "./ui/Button";
import { ItineraryTab } from "./tabs/ItineraryTab";
import { AccommodationsTab } from "./tabs/AccommodationsTab";
import { ActivitiesTab } from "./tabs/ActivitiesTab";
import { PackingTab } from "./tabs/PackingTab";
import { NotesTab } from "./tabs/NotesTab";
import { RemindersTab } from "./tabs/RemindersTab";
import { InviteMembersModal } from "./InviteMembersModal";

interface TripDetailProps {
  trip: Doc<"trips">;
  onBack: () => void;
}

type TabType =
  | "overview"
  | "itinerary"
  | "accommodations"
  | "activities"
  | "packing"
  | "notes"
  | "reminders";

export function TripDetail({ trip, onBack }: TripDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "itinerary", label: "Itinerary", icon: "📅" },
    { id: "accommodations", label: "Hotels", icon: "🏨" },
    { id: "activities", label: "Activities", icon: "🎯" },
    { id: "packing", label: "Packing", icon: "🧳" },
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "reminders", label: "Reminders", icon: "⏰" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 left-4 flex space-x-3">
            <Button
              onClick={onBack}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              ← Back to Trips
            </Button>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              👥 Invite Members
            </Button>
          </div>
          <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
            <p className="text-lg opacity-90">{trip.destination}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{formatDate(trip.startDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-semibold">{formatDate(trip.endDate)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">⏱️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{getDuration()} days</p>
              </div>
            </div>
          </div>

          {trip.description && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{trip.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trip Overview
              </h3>
              <p className="text-gray-600 mb-6">
                Use the tabs above to manage different aspects of your trip
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {tabs.slice(1).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center"
                  >
                    <div className="text-2xl mb-2">{tab.icon}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {tab.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === "itinerary" && <ItineraryTab tripId={trip._id} />}
          {activeTab === "accommodations" && (
            <AccommodationsTab tripId={trip._id} />
          )}
          {activeTab === "activities" && <ActivitiesTab tripId={trip._id} />}
          {activeTab === "packing" && <PackingTab tripId={trip._id} />}
          {activeTab === "notes" && <NotesTab tripId={trip._id} />}
          {activeTab === "reminders" && <RemindersTab tripId={trip._id} />}
        </div>
      </div>

      {showInviteModal && (
        <InviteMembersModal
          tripId={trip._id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
