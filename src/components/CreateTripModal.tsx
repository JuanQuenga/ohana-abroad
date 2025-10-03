"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { toast } from "sonner";

interface CreateTripModalProps {
  onClose: () => void;
}

export function CreateTripModal({ onClose }: CreateTripModalProps) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTrip = useMutation(api.trips.create);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    createTrip({
      title,
      destination,
      startDate,
      endDate,
      description: description || undefined,
    })
      .then(() => {
        toast.success("Trip created successfully!");
        onClose();
      })
      .catch(() => {
        toast.error("Failed to create trip");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Trip</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Family Europe Adventure 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Paris, Rome, Barcelona"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your trip plans..."
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-br from-cyan-400 via-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-cyan-600 hover:via-blue-600 hover:to-indigo-700"
              >
                {isSubmitting ? "Creating..." : "Create Trip"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
