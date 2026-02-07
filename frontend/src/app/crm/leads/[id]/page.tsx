"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { getLead, updateLead, addInteraction } from "@/lib/api";

interface LeadDetail {
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
  updated_at: string;
  interactions: Interaction[];
}

interface Interaction {
  id: string;
  type: string;
  subject: string | null;
  notes: string | null;
  outcome: string | null;
  created_at: string;
}

const STATUSES = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "qualified", label: "Qualifié" },
  { value: "proposal", label: "Proposition" },
  { value: "negotiation", label: "Négociation" },
  { value: "closed_won", label: "Gagné" },
  { value: "closed_lost", label: "Perdu" },
];

const INTERACTION_TYPES = [
  { value: "email", label: "Email" },
  { value: "call", label: "Appel" },
  { value: "meeting", label: "Réunion" },
  { value: "demo", label: "Démo" },
  { value: "note", label: "Note" },
];

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getToken, isLoaded } = useAuth();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionForm, setInteractionForm] = useState({
    type: "note",
    subject: "",
    notes: "",
    outcome: "",
  });

  useEffect(() => {
    if (!isLoaded || !params.id) return;

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const leadData = await getLead(token, params.id as string);
        setLead(leadData);
      } catch (err) {
        console.error("Failed to load lead:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoaded, getToken, params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;

    try {
      const token = await getToken();
      if (!token) return;

      await updateLead(token, lead.id, { status: newStatus });
      setLead({ ...lead, status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleAddInteraction = async () => {
    if (!lead) return;

    try {
      const token = await getToken();
      if (!token) return;

      await addInteraction(token, lead.id, interactionForm);

      // Reload lead to get updated interactions
      const updatedLead = await getLead(token, lead.id);
      setLead(updatedLead);

      // Reset form
      setInteractionForm({ type: "note", subject: "", notes: "", outcome: "" });
      setShowInteractionForm(false);
    } catch (err) {
      console.error("Failed to add interaction:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!lead) {
    return <div className="text-center py-12">Lead non trouvé</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-4"
        >
          ← Retour
        </button>
        <h2 className="text-2xl font-bold">{lead.full_name || lead.email}</h2>
        <p className="text-muted-foreground">{lead.company}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Lead info */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Informations</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <p className="font-medium">{lead.email}</p>
              </div>
              {lead.phone && (
                <div>
                  <label className="text-sm text-muted-foreground">Téléphone</label>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              )}
              {lead.job_title && (
                <div>
                  <label className="text-sm text-muted-foreground">Poste</label>
                  <p className="font-medium">{lead.job_title}</p>
                </div>
              )}
              {lead.source && (
                <div>
                  <label className="text-sm text-muted-foreground">Source</label>
                  <p className="font-medium">{lead.source}</p>
                </div>
              )}
              {lead.notes && (
                <div>
                  <label className="text-sm text-muted-foreground">Notes</label>
                  <p className="font-medium whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactions timeline */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Interactions</h3>
              <button
                onClick={() => setShowInteractionForm(!showInteractionForm)}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                + Ajouter
              </button>
            </div>

            {showInteractionForm && (
              <div className="mb-4 p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={interactionForm.type}
                    onChange={(e) =>
                      setInteractionForm({ ...interactionForm, type: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                  >
                    {INTERACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sujet</label>
                  <input
                    type="text"
                    value={interactionForm.subject}
                    onChange={(e) =>
                      setInteractionForm({ ...interactionForm, subject: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={interactionForm.notes}
                    onChange={(e) =>
                      setInteractionForm({ ...interactionForm, notes: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Résultat</label>
                  <input
                    type="text"
                    value={interactionForm.outcome}
                    onChange={(e) =>
                      setInteractionForm({ ...interactionForm, outcome: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddInteraction}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setShowInteractionForm(false)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {lead.interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune interaction</p>
              ) : (
                lead.interactions.map((interaction) => (
                  <div key={interaction.id} className="border-l-2 border-primary pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {INTERACTION_TYPES.find((t) => t.value === interaction.type)?.label ||
                          interaction.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(interaction.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {interaction.subject && (
                      <p className="text-sm font-medium mb-1">{interaction.subject}</p>
                    )}
                    {interaction.notes && (
                      <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                    )}
                    {interaction.outcome && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Résultat: {interaction.outcome}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Statut</h3>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Score */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Score</h3>
            <div className="text-3xl font-bold">{lead.score}</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${lead.score}%` }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Métadonnées</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Créé le:</span>{" "}
                <span className="font-medium">
                  {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Modifié le:</span>{" "}
                <span className="font-medium">
                  {new Date(lead.updated_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
