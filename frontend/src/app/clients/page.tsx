"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

// Note: This would need an endpoint to list organizations/clients
// For now, this is a placeholder
export default function ClientsPage() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
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
    <motion.div
      variants={staggerContainer}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de vos clients et leur santé
        </p>
      </div>

      {clients.length === 0 ? (
        <motion.div className="text-center py-12 text-muted-foreground" variants={fadeUp}>
          <p>Aucun client pour le moment.</p>
          <p className="text-sm mt-2">
            Les clients seront affichés ici une fois que vous aurez des organisations.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
        >
          {clients.map((client) => (
            <motion.div
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
              variants={fadeUp}
              {...(shouldReduceMotion ? {} : cardHover)}
            >
              <h3 className="font-semibold mb-2">{client.name}</h3>
              <p className="text-sm text-muted-foreground">Plan: {client.plan}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
