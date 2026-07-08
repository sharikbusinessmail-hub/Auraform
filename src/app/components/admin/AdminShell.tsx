import { useState } from "react";
import { LogOut, Package, Layers, KanbanSquare } from "lucide-react";
import { initialOrders, type Order, type OrderStage } from "../../data/mock";
import { FilamentDashboard } from "./FilamentDashboard";
import { ProductManager } from "./ProductManager";
import { OrderKanban } from "./OrderKanban";

type Tab = "catalog" | "overview" | "fulfillment";

export function AdminShell({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<Tab>("catalog");
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const moveOrder = (id: string, to: OrderStage) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, stage: to } : o)));

  const podQueue = orders.filter((o) => o.type === "pod" && (o.stage === "print-queue" || o.stage === "printing")).length;
  const shipToday = orders.filter((o) => o.stage === "ready-to-ship").length;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] flex-col border-r border-border bg-card px-6 py-8 lg:flex">
        <div className="mb-12">
          <div style={{ fontFamily: "var(--font-display)", fontSize: "20px" }}>
            <span className="text-foreground">auraform</span><span className="text-accent">.lk</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            Studio Console
          </div>
        </div>

        <nav className="flex flex-col gap-1" style={{ fontFamily: "var(--font-body)" }}>
          <NavBtn active={tab === "catalog"} onClick={() => setTab("catalog")} icon={<Package size={15} />} label="Catalog" />
          <NavBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<Layers size={15} />} label="Overview" />
          <NavBtn active={tab === "fulfillment"} onClick={() => setTab("fulfillment")} icon={<KanbanSquare size={15} />} label="Fulfillment" />
        </nav>

        <button
          onClick={onExit}
          className="mt-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <LogOut size={14} /> Exit Admin
        </button>
      </aside>

      <main className="lg:pl-[240px]">
        <header className="flex flex-wrap items-baseline justify-between gap-6 border-b border-border px-10 py-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
              Tuesday · July 8, 2026
            </div>
            <h1 className="mt-2 text-[34px] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {tab === "catalog" && "Product Catalog"}
              {tab === "overview" && "Studio at a glance"}
              {tab === "fulfillment" && "Fulfillment floor"}
            </h1>
          </div>
          <div className="flex gap-8" style={{ fontFamily: "var(--font-mono)" }}>
            <Stat label="POD in queue" value={podQueue} />
            <Stat label="Ready to ship" value={shipToday} />
          </div>
        </header>

        <div>
          {tab === "catalog" && <ProductManager />}
          {tab === "overview" && (
            <div className="grid grid-cols-1 gap-8 p-10">
              <FilamentDashboard spools={[]} />
              <OrderKanban orders={orders} onMove={moveOrder} />
            </div>
          )}
          {tab === "fulfillment" && (
            <div className="p-10">
              <OrderKanban orders={orders} onMove={moveOrder} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-[13px] transition ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="text-right">
      <div className={`text-[24px] ${accent ? "text-accent" : "text-foreground"}`} style={{ fontFamily: "var(--font-mono)" }}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
        {label}
      </div>
    </div>
  );
}
