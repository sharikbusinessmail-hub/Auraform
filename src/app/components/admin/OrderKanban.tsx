import { useState } from "react";
import type { Order, OrderStage } from "../../data/mock";

const columns: { id: OrderStage; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Just placed" },
  { id: "print-queue", label: "Print Queue", hint: "POD only" },
  { id: "printing", label: "On Press", hint: "Actively printing" },
  { id: "ready-to-ship", label: "Ready to Ship", hint: "Packing" },
  { id: "shipped", label: "Shipped", hint: "Handed off" },
];

const stageAfter: Record<OrderStage, OrderStage | null> = {
  "new": "print-queue",
  "print-queue": "printing",
  "printing": "ready-to-ship",
  "ready-to-ship": "shipped",
  "shipped": null,
};

export function OrderKanban({ orders, onMove }: { orders: Order[]; onMove: (id: string, to: OrderStage) => void }) {
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDrop = (o: Order, to: OrderStage) => {
    // pre-printed items skip the print-queue and printing stages
    if (o.type === "pre-printed" && (to === "print-queue" || to === "printing")) return;
    onMove(o.id, to);
  };

  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            Fulfillment
          </div>
          <h2 className="mt-2 text-[26px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Order pipeline
          </h2>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
          Drag cards to advance · POD flows through print queue · Pre-printed skips to ready to ship
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {columns.map((col) => {
          const cards = orders.filter((o) => o.stage === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragging) return;
                const o = orders.find((x) => x.id === dragging);
                if (o) handleDrop(o, col.id);
                setDragging(null);
              }}
              className="flex min-h-[420px] flex-col rounded-[2px] border border-border bg-card p-4"
            >
              <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
                <div>
                  <div className="text-[13px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{col.label}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                    {col.hint}
                  </div>
                </div>
                <div className="font-mono text-[12px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  {String(cards.length).padStart(2, "0")}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {cards.map((o) => {
                  const next = stageAfter[o.stage];
                  const skipPrint = o.type === "pre-printed" && next && (next === "print-queue" || next === "printing");
                  return (
                    <div
                      key={o.id}
                      draggable
                      onDragStart={() => setDragging(o.id)}
                      onDragEnd={() => setDragging(null)}
                      className={`cursor-grab border border-border bg-background p-4 transition ${dragging === o.id ? "opacity-40" : "hover:border-foreground"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                          {o.id}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] ${o.type === "pod" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"}`} style={{ fontFamily: "var(--font-body)" }}>
                          {o.type === "pod" ? "POD" : "Stock"}
                        </span>
                      </div>
                      <div className="mt-2 text-[14px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                        {o.productName}
                      </div>
                      {o.customText && (
                        <div className="mt-2 border-l-2 border-accent pl-2 text-[12px] italic text-foreground/80" style={{ fontFamily: "var(--font-display)" }}>
                          "{o.customText}"
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                        <span>{o.customer} · {o.placed}</span>
                        <span className="font-mono text-foreground" style={{ fontFamily: "var(--font-mono)" }}>${o.total}</span>
                      </div>
                      {next && (
                        <button
                          onClick={() => {
                            const target = skipPrint ? "ready-to-ship" : next;
                            handleDrop(o, target as OrderStage);
                          }}
                          className="mt-3 w-full border border-border py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-foreground hover:text-foreground"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          → {skipPrint ? "Ready to Ship" : columns.find((c) => c.id === next)?.label}
                        </button>
                      )}
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="flex flex-1 items-center justify-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60" style={{ fontFamily: "var(--font-body)" }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
