"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { updateAgent, deleteAgent } from "@/lib/api";
import { useToast } from "@/components/toast";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";

interface AgentData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  recipe_slug: string | null;
}

export default function AgentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const { addToast } = useToast();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  const agentId = params.id as string;

  useEffect(() => {
    if (!isLoaded) return;
    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/agents/${agentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Agent not found");
        const data: AgentData = await res.json();
        setAgent(data);
        setName(data.name);
        setDescription(data.description || "");
        setStatus(data.status);
      } catch (err) {
        console.error(err);
        addToast("Failed to load agent", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isLoaded, agentId, getToken, addToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      await updateAgent(token, agent.id, { name, description, status });
      addToast("Agent updated", "success");
      router.push(`/dashboard/agents/${agent.id}`);
    } catch (err: any) {
      addToast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!agent) return;
    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) return;
      await deleteAgent(token, agent.id);
      addToast("Agent deleted", "success");
      router.push("/dashboard/agents");
    } catch (err: any) {
      addToast(err.message || "Failed to delete", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-8 w-64 mb-8" />
        <Card padding="md">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </Card>
      </div>
    );
  }

  if (!agent) {
    return <p className="text-muted-foreground">Agent not found.</p>;
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-h1 mb-8">Edit Agent</h1>

      <div className="max-w-xl space-y-6">
        <Card padding="md">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="accent" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card padding="md" className="border-praxia-error/30">
          <h3 className="text-sm font-semibold text-[rgb(var(--praxia-error))] mb-3">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete this agent. This action cannot be undone.
          </p>
          {!confirmDelete ? (
            <Button
              variant="secondary"
              className="text-[rgb(var(--praxia-error))] border-praxia-error/30 hover:bg-[rgb(var(--praxia-error)_/_0.1)]"
              onClick={() => setConfirmDelete(true)}
            >
              Delete Agent
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="text-[rgb(var(--praxia-error))] border-praxia-error/30 hover:bg-[rgb(var(--praxia-error)_/_0.1)]"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
