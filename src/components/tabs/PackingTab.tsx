import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { toast } from "sonner";

interface PackingTabProps {
  tripId: Id<"trips">;
}

export function PackingTab({ tripId }: PackingTabProps) {
  const items = useQuery(api.packing.list, { tripId }) || [];
  const createItem = useMutation(api.packing.create);
  const togglePacked = useMutation(api.packing.togglePacked);
  const removeItem = useMutation(api.packing.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.category) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createItem({
        tripId,
        ...formData,
      });
      setFormData({ item: "", category: "" });
      setShowForm(false);
      toast.success("Item added to packing list!");
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleTogglePacked = async (itemId: Id<"packingItems">) => {
    try {
      await togglePacked({ itemId });
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleDelete = async (itemId: Id<"packingItems">) => {
    try {
      await removeItem({ itemId });
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const categories = Object.keys(groupedItems).sort();
  const packedCount = items.filter(item => item.packed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Packing List</h3>
          <p className="text-gray-600">Keep track of what to pack for your trip</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Item
        </Button>
      </div>

      {totalCount > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Packing Progress</span>
            <span className="text-sm text-gray-600">{packedCount} of {totalCount} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item *
                </label>
                <Input
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="e.g., Passport, Sunglasses"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Documents, Clothing, Electronics"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="submit">Add Item</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧳</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No packing items yet</h4>
          <p className="text-gray-600">Start building your packing checklist!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📦</span>
                {category}
                <span className="ml-2 text-sm text-gray-500">
                  ({groupedItems[category].filter(item => item.packed).length}/{groupedItems[category].length})
                </span>
              </h4>
              <div className="space-y-2">
                {groupedItems[category].map((item) => (
                  <div key={item._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => handleTogglePacked(item._id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className={`flex-1 ${item.packed ? "line-through text-gray-500" : "text-gray-900"}`}>
                      {item.item}
                    </span>
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
