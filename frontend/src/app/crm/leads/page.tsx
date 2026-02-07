"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { listLeads, updateLead } from "@/lib/api";

interface Lead {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  job_title: string | null;
  status: string;
  source: string | null;
  score: number;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
}

const STATUSES = [
  { value: "new", label: "Nouveau", color: "bg-gray-100 text-gray-800" },
  { value: "contacted", label: "Contacté", color: "bg-blue-100 text-blue-800" },
  { value: "qualified", label: "Qualifié", color: "bg-yellow-100 text-yellow-800" },
  { value: "proposal", label: "Proposition", color: "bg-orange-100 text-orange-800" },
  { value: "negotiation", label: "Négociation", color: "bg-purple-100 text-purple-800" },
  { value: "closed_won", label: "Gagné", color: "bg-green-100 text-green-800" },
  { value: "closed_lost", label: "Perdu", color: "bg-red-100 text-red-800" },
];

export default function LeadsPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const allLeads = await listLeads(token);
        setLeads(allLeads);
      } catch (err) {
        console.error("Failed to load leads:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoaded, getToken]);

  const handleDragStart = (leadId: string) => {
    setDraggedLead(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedLead) return;

    try {
      const token = await getToken();
      if (!token) return;

      await updateLead(token, draggedLead, { status: newStatus });

      // Update local state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === draggedLead ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      console.error("Failed to update lead:", err);
    } finally {
      setDraggedLead(null);
    }
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Vente</h2>
          <p className="text-muted-foreground mt-1">
            Gérez vos leads et suivez votre pipeline commercial
          </p>
        </div>
        <button
          onClick={() => router.push("/crm/leads/new")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Nouveau Lead
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-7 gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => {
          const statusLeads = getLeadsByStatus(status.value);
          return (
            <div
              key={status.value}
              className="flex-shrink-0 w-64"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status.value)}
            >
              <div className={`p-3 rounded-t-lg ${status.color} font-medium`}>
                {status.label} ({statusLeads.length})
              </div>
              <div className="border border-t-0 rounded-b-lg p-2 min-h-[400px] bg-muted/30">
                {statusLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => router.push(`/crm/leads/${lead.id}`)}
                    className="mb-2 p-3 bg-background border rounded-lg cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-sm mb-1">
                      {lead.full_name || lead.email}
                    </div>
                    {lead.company && (
                      <div className="text-xs text-muted-foreground mb-1">
                        {lead.company}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Score: {lead.score}
                      </span>
                      {lead.job_title && (
                        <span className="text-xs text-muted-foreground">
                          {lead.job_title}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
