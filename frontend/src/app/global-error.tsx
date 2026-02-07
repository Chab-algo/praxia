"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: "#666", marginBottom: 16 }}>{error.message}</p>
            <button
              onClick={reset}
              style={{
                padding: "8px 24px",
                borderRadius: 6,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
