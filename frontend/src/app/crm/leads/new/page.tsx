"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createLead } from "@/lib/api";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

export default function NewLeadPage() {
  const router = useRouter();
  const { getToken, isLoaded } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    company: "",
    phone: "",
    job_title: "",
    source: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Non authentifié");

      await createLead(token, formData);
      router.push("/crm/leads");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6 max-w-2xl"
      variants={staggerContainer}
      initial={shouldReduceMotion ? false : "initial"}
      animate={shouldReduceMotion ? false : "animate"}
    >
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-4"
        >
          ← Retour
        </button>
        <h2 className="text-2xl font-bold">Nouveau Lead</h2>
      </div>

      <motion.form onSubmit={handleSubmit} className="space-y-6" variants={fadeUp}>
        <div>
          <label className="block text-sm font-medium mb-2">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom complet</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Entreprise</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Poste</label>
          <input
            type="text"
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Source</label>
          <input
            type="text"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            placeholder="Ex: website, referral, event"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={4}
          />
        </div>

        <AnimatePresence initial={false}>
          {error && (
            <motion.div
              className="p-4 bg-destructive/10 text-destructive rounded-lg"
              variants={fadeUp}
              initial={shouldReduceMotion ? false : "initial"}
              animate={shouldReduceMotion ? false : "animate"}
              exit={shouldReduceMotion ? undefined : "exit"}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <motion.button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            {...(shouldReduceMotion ? {} : cardHover)}
          >
            {loading ? "Création..." : "Créer le Lead"}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90"
            {...(shouldReduceMotion ? {} : cardHover)}
          >
            Annuler
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}
