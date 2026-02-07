export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Active Agents</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Executions Today</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">AI Cost (MTD)</p>
          <p className="text-3xl font-bold">$0.00</p>
        </div>
      </div>
    </div>
  );
}
