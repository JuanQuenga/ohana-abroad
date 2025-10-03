import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { toast } from "sonner";

interface RemindersTabProps {
  tripId: Id<"trips">;
}

export function RemindersTab({ tripId }: RemindersTabProps) {
  const reminders = useQuery(api.reminders.list, { tripId }) || [];
  const createReminder = useMutation(api.reminders.create);
  const toggleCompleted = useMutation(api.reminders.toggleCompleted);
  const removeReminder = useMutation(api.reminders.remove);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createReminder({
        tripId,
        ...formData,
        description: formData.description || undefined,
      });
      setFormData({
        title: "",
        description: "",
        dueDate: "",
      });
      setShowForm(false);
      toast.success("Reminder added!");
    } catch (error) {
      toast.error("Failed to add reminder");
    }
  };

  const handleToggleCompleted = async (reminderId: Id<"reminders">) => {
    try {
      await toggleCompleted({ reminderId });
    } catch (error) {
      toast.error("Failed to update reminder");
    }
  };

  const handleDelete = async (reminderId: Id<"reminders">) => {
    try {
      await removeReminder({ reminderId });
      toast.success("Reminder removed");
    } catch (error) {
      toast.error("Failed to remove reminder");
    }
  };

  const sortedReminders = reminders.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getDaysUntil = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
          <p className="text-gray-600">Keep track of important tasks and deadlines</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Reminder
        </Button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Book restaurant reservation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                placeholder="Additional details..."
                rows={2}
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit">Add Reminder</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏰</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h4>
          <p className="text-gray-600">Add reminders for important tasks and deadlines!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReminders.map((reminder) => {
            const daysUntil = getDaysUntil(reminder.dueDate);
            const isOverdue = daysUntil < 0 && !reminder.completed;
            const isDueSoon = daysUntil <= 3 && daysUntil >= 0 && !reminder.completed;

            return (
              <div
                key={reminder._id}
                className={`bg-white border rounded-lg p-4 ${
                  reminder.completed
                    ? "border-gray-200 opacity-75"
                    : isOverdue
                    ? "border-red-300 bg-red-50"
                    : isDueSoon
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleToggleCompleted(reminder._id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      reminder.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-green-500"
                    }`}
                  >
                    {reminder.completed && <span className="text-xs">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-medium ${
                          reminder.completed ? "text-gray-500 line-through" : "text-gray-900"
                        }`}
                      >
                        {reminder.title}
                      </h4>
                      <button
                        onClick={() => handleDelete(reminder._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>📅 {new Date(reminder.dueDate).toLocaleDateString()}</span>
                      {!reminder.completed && (
                        <span
                          className={
                            isOverdue
                              ? "text-red-600 font-medium"
                              : isDueSoon
                              ? "text-yellow-600 font-medium"
                              : "text-gray-600"
                          }
                        >
                          {isOverdue
                            ? `${Math.abs(daysUntil)} days overdue`
                            : daysUntil === 0
                            ? "Due today"
                            : daysUntil === 1
                            ? "Due tomorrow"
                            : `${daysUntil} days left`}
                        </span>
                      )}
                    </div>

                    {reminder.description && (
                      <p
                        className={`text-sm ${
                          reminder.completed ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        {reminder.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
