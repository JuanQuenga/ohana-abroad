"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { toast } from "sonner";

interface AccommodationsTabProps {
  tripId: Id<"trips">;
}

export function AccommodationsTab({ tripId }: AccommodationsTabProps) {
  const accommodations = useQuery(api.accommodations.list, { tripId }) || [];
  const createAccommodation = useMutation(api.accommodations.create);
  const removeAccommodation = useMutation(api.accommodations.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    checkIn: "",
    checkOut: "",
    confirmationNumber: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.checkIn || !formData.checkOut) {
      toast.error("Please fill in required fields");
      return;
    }

    createAccommodation({
      tripId,
      ...formData,
      address: formData.address || undefined,
      confirmationNumber: formData.confirmationNumber || undefined,
      notes: formData.notes || undefined,
    })
      .then(() => {
        setFormData({
          name: "",
          address: "",
          checkIn: "",
          checkOut: "",
          confirmationNumber: "",
          notes: "",
        });
        setShowForm(false);
        toast.success("Accommodation added!");
      })
      .catch(() => {
        toast.error("Failed to add accommodation");
      });
  };

  const handleDelete = (accommodationId: Id<"accommodations">) => {
    removeAccommodation({ accommodationId })
      .then(() => {
        toast.success("Accommodation removed");
      })
      .catch(() => {
        toast.error("Failed to remove accommodation");
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Accommodations
          </h3>
          <p className="text-gray-600">Manage your hotels and lodging</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Hotel</Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Hotel de Paris"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="e.g., 123 Rue de la Paix, Paris"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date *
                </label>
                <Input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) =>
                    setFormData({ ...formData, checkIn: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date *
                </label>
                <Input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOut: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Number
              </label>
              <Input
                value={formData.confirmationNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmationNumber: e.target.value,
                  })
                }
                placeholder="e.g., ABC123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Special requests, amenities, etc."
                rows={2}
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit">Add Hotel</Button>
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

      {accommodations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏨</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No accommodations yet
          </h4>
          <p className="text-gray-600">
            Add your hotels and lodging information!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation._id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🏨</span>
                  <h4 className="font-semibold text-gray-900">
                    {accommodation.name}
                  </h4>
                </div>
                <button
                  onClick={() => handleDelete(accommodation._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  🗑️
                </button>
              </div>

              {accommodation.address && (
                <p className="text-sm text-gray-600 mb-2">
                  📍 {accommodation.address}
                </p>
              )}

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">
                    {new Date(accommodation.checkIn).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">
                    {new Date(accommodation.checkOut).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {accommodation.confirmationNumber && (
                <div className="bg-blue-50 rounded p-2 mb-3">
                  <p className="text-sm text-blue-800">
                    <strong>Confirmation:</strong>{" "}
                    {accommodation.confirmationNumber}
                  </p>
                </div>
              )}

              {accommodation.notes && (
                <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                  {accommodation.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
