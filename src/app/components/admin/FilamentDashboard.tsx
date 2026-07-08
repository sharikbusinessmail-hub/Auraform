import type { FilamentSpool } from "../../data/mock";

export function FilamentDashboard({ spools }: { spools: FilamentSpool[] }) {
  const totalRemaining = spools.reduce((s, f) => s + f.remainingGrams, 0);
  const totalCap = spools.reduce((s, f) => s + f.totalGrams, 0);

  return (
    <section className="rounded-[2px] border border-border bg-card p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            Raw materials
          </div>
          <h2 className="mt-2 text-[26px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Filament on hand
          </h2>
        </div>
        <div className="text-right">
          <div className="font-mono text-[22px] text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            {(totalRemaining / 1000).toFixed(2)}kg
          </div>
          <div className="font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            of {(totalCap / 1000).toFixed(2)}kg capacity
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {spools.map((f) => {
          const pct = Math.round((f.remainingGrams / f.totalGrams) * 100);
          const low = pct < 20;
          return (
            <div key={f.id} className="border border-border p-5">
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full border border-border shadow-inner"
                  style={{ background: f.hex }}
                />
                <div className="flex-1">
                  <div className="text-[15px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    {f.colorName}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                    {f.material} · {f.id}
                  </div>
                </div>
                {low && (
                  <span className="bg-accent px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-accent-foreground" style={{ fontFamily: "var(--font-body)" }}>
                    Reorder
                  </span>
                )}
              </div>

              <div className="mt-5 h-[3px] w-full bg-muted">
                <div
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, background: low ? "var(--accent)" : "var(--foreground)" }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                <span>{f.remainingGrams}g remaining</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
