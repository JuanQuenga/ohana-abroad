"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { toast } from "sonner";

interface ItineraryTabProps {
  tripId: Id<"trips">;
}

export function ItineraryTab({ tripId }: ItineraryTabProps) {
  const items = useQuery(api.itinerary.list, { tripId }) || [];
  const createItem = useMutation(api.itinerary.create);
  const removeItem = useMutation(api.itinerary.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    title: "",
    description: "",
    location: "",
    type: "activity" as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.title) {
      toast.error("Please fill in required fields");
      return;
    }

    createItem({
      tripId,
      ...formData,
      time: formData.time || undefined,
      description: formData.description || undefined,
      location: formData.location || undefined,
    })
      .then(() => {
        setFormData({
          date: "",
          time: "",
          title: "",
          description: "",
          location: "",
          type: "activity",
        });
        setShowForm(false);
        toast.success("Itinerary item added!");
      })
      .catch(() => {
        toast.error("Failed to add item");
      });
  };

  const handleDelete = (itemId: Id<"itineraryItems">) => {
    removeItem({ itemId })
      .then(() => {
        toast.success("Item removed");
      })
      .catch(() => {
        toast.error("Failed to remove item");
      });
  };

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = [];
      }
      acc[item.date].push(item);
      return acc;
    },
    {} as Record<string, typeof items>
  );

  const sortedDates = Object.keys(groupedItems).sort();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "activity":
        return "🎯";
      case "transport":
        return "🚗";
      case "meal":
        return "🍽️";
      case "accommodation":
        return "🏨";
      default:
        return "📍";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "activity":
        return "bg-blue-100 text-blue-800";
      case "transport":
        return "bg-green-100 text-green-800";
      case "meal":
        return "bg-orange-100 text-orange-800";
      case "accommodation":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Itinerary
          </h3>
          <p className="text-gray-600">
            Plan your daily activities and schedule
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Item</Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Visit Eiffel Tower"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activity">Activity</option>
                  <option value="transport">Transport</option>
                  <option value="meal">Meal</option>
                  <option value="accommodation">Accommodation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Champ de Mars, Paris"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional details..."
                rows={2}
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit">Add Item</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No itinerary items yet
          </h4>
          <p className="text-gray-600">Start planning your daily activities!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div
              key={date}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <div className="space-y-3">
                {groupedItems[date]
                  .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                  .map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {getTypeIcon(item.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900">
                            {item.title}
                          </h5>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}
                          >
                            {item.type}
                          </span>
                          {item.time && (
                            <span className="text-sm text-gray-500">
                              {item.time}
                            </span>
                          )}
                        </div>
                        {item.location && (
                          <p className="text-sm text-gray-600 mb-1">
                            📍 {item.location}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-700">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
