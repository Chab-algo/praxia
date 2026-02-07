export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">PraxIA</h1>
          <p className="text-xs text-muted-foreground">AI Agent Studio</p>
        </div>
        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Dashboard
          </a>
          <a
            href="/dashboard/recipes"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Recipes
          </a>
          <a
            href="/dashboard/agents"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Agents
          </a>
          <a
            href="/dashboard/executions"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Executions
          </a>
          <a
            href="/dashboard/usage"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            Usage
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div />
          <div className="text-sm text-muted-foreground">PraxIA v0.1.0</div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
