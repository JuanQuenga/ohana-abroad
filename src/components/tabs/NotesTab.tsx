import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { toast } from "sonner";

interface NotesTabProps {
  tripId: Id<"trips">;
}

export function NotesTab({ tripId }: NotesTabProps) {
  const notes = useQuery(api.notes.list, { tripId }) || [];
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const removeNote = useMutation(api.notes.remove);

  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Id<"notes"> | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingNote) {
        await updateNote({
          noteId: editingNote,
          ...formData,
        });
        toast.success("Note updated!");
        setEditingNote(null);
      } else {
        await createNote({
          tripId,
          ...formData,
        });
        toast.success("Note added!");
      }
      setFormData({ title: "", content: "" });
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const handleEdit = (note: any) => {
    setFormData({
      title: note.title,
      content: note.content,
    });
    setEditingNote(note._id);
    setShowForm(true);
  };

  const handleDelete = async (noteId: Id<"notes">) => {
    try {
      await removeNote({ noteId });
      toast.success("Note deleted");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "" });
    setEditingNote(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shared Notes</h3>
          <p className="text-gray-600">Collaborate and share trip information</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          + Add Note
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
                placeholder="e.g., Restaurant Recommendations"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note here..."
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button type="submit">
                {editingNote ? "Update Note" : "Add Note"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h4>
          <p className="text-gray-600">Start sharing trip information with your family!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📝</span>
                  {note.title}
                </h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
                {note.content}
              </div>

              <div className="text-xs text-gray-500">
                Created {new Date(note._creationTime).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
