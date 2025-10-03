"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface InviteMembersModalProps {
  tripId: Id<"trips">;
  onClose: () => void;
}

export function InviteMembersModal({
  tripId,
  onClose,
}: InviteMembersModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteMember = useMutation(api.trips.inviteMember);
  const members = useQuery(api.trips.getMembers, { tripId });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSubmitting(true);
    inviteMember({ tripId, email: email.trim(), role })
      .then(() => {
        toast.success("Invitation sent successfully!");
        setEmail("");
      })
      .catch((error: any) => {
        toast.error(error.message || "Failed to send invitation");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
            Owner
          </span>
        );
      case "editor":
        return (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Editor
          </span>
        );
      case "viewer":
        return (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
            Viewer
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Invite Team Members
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="editor">
                  Editor - Can add/edit trip details
                </option>
                <option value="viewer">
                  Viewer - Can view trip details only
                </option>
              </select>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Current Members
            </h3>
            <div className="space-y-2">
              {members?.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user?.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getRoleBadge(member.role)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
