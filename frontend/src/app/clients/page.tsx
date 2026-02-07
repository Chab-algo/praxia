"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Note: This would need an endpoint to list organizations/clients
// For now, this is a placeholder
export default function ClientsPage() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    // TODO: Implement list clients endpoint
    setLoading(false);
  }, [isLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de vos clients et leur santé
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucun client pour le moment.</p>
          <p className="text-sm mt-2">
            Les clients seront affichés ici une fois que vous aurez des organisations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
            >
              <h3 className="font-semibold mb-2">{client.name}</h3>
              <p className="text-sm text-muted-foreground">Plan: {client.plan}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
