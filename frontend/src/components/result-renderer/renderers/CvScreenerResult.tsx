"use client";

import type { CvScreenerOutput } from "@/types/result-renderer";

const RECO_COLORS: Record<string, string> = {
  strong_yes: "bg-green-100 text-green-700",
  yes: "bg-blue-100 text-blue-700",
  maybe: "bg-orange-100 text-orange-700",
  no: "bg-red-100 text-red-700",
};

const RECO_LABELS: Record<string, string> = {
  strong_yes: "Strong Yes",
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
};

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#22c55e" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-2xl font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function CvScreenerResult({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const d = data as unknown as CvScreenerOutput;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold">
            {d.candidate_name || "Candidate"}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">
              {d.experience_years} years experience
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                RECO_COLORS[d.recommendation] || "bg-gray-100 text-gray-700"
              }`}
            >
              {RECO_LABELS[d.recommendation] || d.recommendation}
            </span>
          </div>
        </div>
        <ScoreRing score={d.match_score ?? 0} />
      </div>

      {/* Skills */}
      {d.skills_found && d.skills_found.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Skills
          </label>
          <div className="flex flex-wrap gap-1.5">
            {d.skills_found.map((skill, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {d.summary && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Summary
          </label>
          <p className="text-sm text-foreground leading-relaxed">
            {d.summary}
          </p>
        </div>
      )}
    </div>
  );
}
