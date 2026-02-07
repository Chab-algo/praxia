export default function AgentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Agent Details</h2>
      <p className="text-muted-foreground">Agent ID: {params.id}</p>
      <div className="mt-4 rounded-lg border p-6">
        <p className="text-muted-foreground">
          Agent configuration and execution history will appear here.
        </p>
      </div>
    </div>
  );
}
