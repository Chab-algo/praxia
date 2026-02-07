export default function AgentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Agents</h2>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          New Agent
        </button>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No agents yet. Create one from a recipe to get started.
      </div>
    </div>
  );
}
