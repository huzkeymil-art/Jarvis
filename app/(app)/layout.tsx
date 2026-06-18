import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { OrbProvider } from "@/components/orb-context";
import { MountedGate } from "@/components/mounted-gate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrbProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-hidden">
            <MountedGate>{children}</MountedGate>
          </main>
        </div>
      </div>
    </OrbProvider>
  );
}
