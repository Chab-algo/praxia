import { ToastProvider } from "@/components/toast";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <header className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
            <div className="lg:hidden w-10" />
            <div className="text-sm text-muted-foreground ml-auto">
              PraxIA v0.1.0
            </div>
          </header>
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
