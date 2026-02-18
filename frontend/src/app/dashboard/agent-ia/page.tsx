"use client";

import { useState } from "react";
import { queryRag, getRagData, type RagSource } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";

export default function AgentIAPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<RagSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);
    try {
      const res = await queryRag(question.trim(), {
        k: 6,
        specialist: "agents_ia",
        score_threshold: 0.65,
      });
      setAnswer(res.answer);
      setSources(res.sources || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la requête";
      const isNetworkError = /failed to fetch|load failed|network error|err_connection_refused/i.test(msg);
      setError(
        isNetworkError
          ? "Impossible de joindre le backend. Vérifiez que NEXT_PUBLIC_API_URL pointe vers l'API (ex. https://votre-backend.up.railway.app) et que le backend autorise votre domaine (CORS)."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setDownloading(true);
    setError(null);
    try {
      const data = await getRagData({ include_embeddings: false });
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rag_data_export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      const isNetworkError = /failed to fetch|load failed|network error/i.test(msg);
      setError(
        isNetworkError
          ? "Impossible de joindre le backend. Vérifiez NEXT_PUBLIC_API_URL et CORS."
          : msg
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 mb-1">Agent IA</h1>
          <p className="text-body text-muted-foreground">
            Expert en agents IA, bonnes pratiques et LangChain. Posez une question ; les réponses
            s&apos;appuient sur la recherche vectorielle (RAG). Les sources et scores sont affichés
            pour challenger les résultats.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadData}
          disabled={downloading}
        >
          {downloading ? "..." : "Télécharger la base vectorisée"}
        </Button>
      </div>

      <Card padding="md" rounded="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium mb-2">
              Question
            </label>
            <textarea
              id="question"
              rows={3}
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-l-4 focus:border-l-praxia-accent focus:pl-2 disabled:opacity-50"
              placeholder="Ex. Qu'est-ce que le pattern ReAct ? Comment réduire les hallucinations en RAG ?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Recherche..." : "Envoyer"}
          </Button>
        </form>
      </Card>

      {loading && (
        <Card padding="md">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full" />
        </Card>
      )}

      {error && (
        <Card padding="md" accent="left" className="border-praxia-error">
          <p className="text-sm font-medium text-[rgb(var(--praxia-error))]">Erreur</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </Card>
      )}

      {!loading && answer !== null && (
        <div className="space-y-4">
          <Card padding="md" rounded="lg">
            <h3 className="text-sm font-medium mb-2">Réponse</h3>
            <div className="text-body whitespace-pre-wrap">{answer}</div>
          </Card>

          {sources.length > 0 && (
            <Card padding="md" rounded="lg">
              <h3 className="text-sm font-medium mb-3">Sources (recherche vectorielle)</h3>
              <ul className="space-y-3">
                {sources.map((src, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border bg-muted/30 p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {typeof (src.metadata?.title) === "string" && (
                        <span className="font-medium">{String(src.metadata.title)}</span>
                      )}
                      {typeof src.score === "number" && (
                        <span className="text-muted-foreground">
                          score : {(src.score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground line-clamp-3">{src.content}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
