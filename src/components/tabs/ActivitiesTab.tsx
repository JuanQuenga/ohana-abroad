import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { toast } from "sonner";

interface ActivitiesTabProps {
  tripId: Id<"trips">;
}

export function ActivitiesTab({ tripId }: ActivitiesTabProps) {
  const activities = useQuery(api.activities.list, { tripId }) || [];
  const createActivity = useMutation(api.activities.create);
  const updateActivity = useMutation(api.activities.update);
  const removeActivity = useMutation(api.activities.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    date: "",
    time: "",
    cost: "",
    bookingRequired: false,
    status: "planned" as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Please enter activity name");
      return;
    }

    try {
      await createActivity({
        tripId,
        ...formData,
        description: formData.description || undefined,
        location: formData.location || undefined,
        date: formData.date || undefined,
        time: formData.time || undefined,
        cost: formData.cost || undefined,
      });
      setFormData({
        name: "",
        description: "",
        location: "",
        date: "",
        time: "",
        cost: "",
        bookingRequired: false,
        status: "planned",
      });
      setShowForm(false);
      toast.success("Activity added!");
    } catch (error) {
      toast.error("Failed to add activity");
    }
  };

  const handleStatusChange = async (activityId: Id<"activities">, status: "planned" | "booked" | "completed") => {
    try {
      await updateActivity({ activityId, status });
      toast.success("Status updated!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (activityId: Id<"activities">) => {
    try {
      await removeActivity({ activityId });
      toast.success("Activity removed");
    } catch (error) {
      toast.error("Failed to remove activity");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-yellow-100 text-yellow-800";
      case "booked": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
          <p className="text-gray-600">Plan and track your trip activities</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Activity
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Louvre Museum Tour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will you do?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Rue de Rivoli, Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost
                </label>
                <Input
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="e.g., €25 per person"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.bookingRequired}
                  onChange={(e) => setFormData({ ...formData, bookingRequired: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Booking required</span>
              </label>
            </div>

            <div className="flex space-x-3">
              <Button type="submit">Add Activity</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h4>
          <p className="text-gray-600">Start planning your trip activities!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div key={activity._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎯</span>
                  <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                </div>
                <button
                  onClick={() => handleDelete(activity._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  🗑️
                </button>
              </div>

              {activity.description && (
                <p className="text-sm text-gray-700 mb-3">{activity.description}</p>
              )}

              {activity.location && (
                <p className="text-sm text-gray-600 mb-2">📍 {activity.location}</p>
              )}

              {activity.date && (
                <p className="text-sm text-gray-600 mb-2">
                  📅 {new Date(activity.date).toLocaleDateString()}
                  {activity.time && ` at ${activity.time}`}
                </p>
              )}

              {activity.cost && (
                <p className="text-sm text-gray-600 mb-3">💰 {activity.cost}</p>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
                {activity.bookingRequired && (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    Booking required
                  </span>
                )}
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => handleStatusChange(activity._id, "planned")}
                  className={`px-2 py-1 text-xs rounded ${
                    activity.status === "planned" ? "bg-yellow-200" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Planned
                </button>
                <button
                  onClick={() => handleStatusChange(activity._id, "booked")}
                  className={`px-2 py-1 text-xs rounded ${
                    activity.status === "booked" ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Booked
                </button>
                <button
                  onClick={() => handleStatusChange(activity._id, "completed")}
                  className={`px-2 py-1 text-xs rounded ${
                    activity.status === "completed" ? "bg-green-200" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
