import { useState } from "react";
import { Search, ShoppingBag, User, ChevronDown, X } from "lucide-react";
import { CATEGORY_LABELS } from "../../lib/api";

interface HeaderProps {
  cartCount: number;
  onNavigate: (filter: { category?: string } | null) => void;
  onEnterAdmin: () => void;
  onOpenCart: () => void;
  onCustomOrder: () => void;
}

const megaMenu = [
  {
    label: "Home Decors",
    subs: [
      { key: "pots", label: "Pots" },
      { key: "wall-arts", label: "Wall Arts" },
      { key: "ornaments", label: "Ornaments" },
      { key: "custom", label: "Custom" },
    ],
    image: "https://images.unsplash.com/photo-1730267252256-67bee55353e8?w=600&h=380&fit=crop&auto=format",
    imageAlt: "3D printed geometric pot",
  },
  {
    label: "Figurines",
    subs: [
      { key: "action-figures", label: "Action Figures" },
      { key: "statues", label: "Statues" },
      { key: "light-boxes", label: "Light Boxes" },
      { key: "custom", label: "Custom" },
    ],
    image: "https://images.unsplash.com/photo-1776736851933-4a2ece025ec5?w=600&h=380&fit=crop&auto=format",
    imageAlt: "3D printed action figure",
  },
  {
    label: "3D Print",
    subs: [
      { key: "filament", label: "Filament" },
      { key: "nozzles", label: "Nozzles" },
      { key: "parts", label: "Parts & Spares" },
    ],
    image: "https://images.unsplash.com/photo-1644936580583-91eb0c32c3db?w=600&h=380&fit=crop&auto=format",
    imageAlt: "3D printing in progress",
  },
];

export function Header({ cartCount, onNavigate, onEnterAdmin, onOpenCart, onCustomOrder }: HeaderProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCategory = (key: string) => {
    onNavigate({ category: key });
    setOpen(null);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur" onMouseLeave={() => setOpen(null)}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">

        {/* Logo */}
        <button onClick={() => { onNavigate(null); setMobileOpen(false); }} className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", letterSpacing: "-0.01em" }}>
            <span className="text-foreground">auraform</span><span className="text-accent">.lk</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex" style={{ fontFamily: "var(--font-body)" }}>
          <button
            onClick={() => onNavigate(null)}
            className="rounded-md px-4 py-2 text-[13px] font-medium text-foreground transition hover:bg-secondary"
          >
            Home
          </button>

          {megaMenu.map((m, idx) => (
            <button
              key={m.label}
              onMouseEnter={() => setOpen(idx)}
              onClick={() => setOpen(idx === open ? null : idx)}
              className={`flex items-center gap-1 rounded-md px-4 py-2 text-[13px] font-medium transition ${open === idx ? "bg-secondary text-accent" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              {m.label}
              <ChevronDown size={12} className={`transition-transform ${open === idx ? "rotate-180" : ""}`} />
            </button>
          ))}

          <button
            onClick={onCustomOrder}
            className="rounded-md px-4 py-2 text-[13px] font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            Custom Order
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden text-muted-foreground transition hover:text-foreground md:block">
            <Search size={18} />
          </button>
          <button onClick={onEnterAdmin} className="hidden text-muted-foreground transition hover:text-foreground md:block" title="Admin">
            <User size={18} />
          </button>
          <button onClick={onOpenCart} className="relative text-foreground">
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
                {cartCount}
              </span>
            )}
          </button>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="text-foreground md:hidden"
          >
            {mobileOpen ? <X size={20} /> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mega dropdown — desktop */}
      {open !== null && (
        <div
          className="absolute left-0 right-0 top-full hidden border-b border-border bg-white shadow-[0_20px_48px_-12px_rgba(26,43,24,0.14)] md:block"
          onMouseEnter={() => setOpen(open)}
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-[220px_1fr_240px] gap-10 px-6 py-10">
            {/* Sub-categories */}
            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.26em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                {megaMenu[open].label}
              </div>
              <ul className="space-y-1">
                {megaMenu[open].subs.map((s) => (
                  <li key={s.key}>
                    <button
                      onClick={() => handleCategory(s.key)}
                      className="block w-full rounded-[3px] py-2 text-left text-[17px] text-foreground/80 transition hover:text-accent"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { onNavigate(null); setOpen(null); }}
                className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-accent"
                style={{ fontFamily: "var(--font-body)" }}
              >
                View all →
              </button>
            </div>

            {/* Category preview images */}
            <div className="grid grid-cols-3 gap-4">
              {megaMenu.map((m, idx) => (
                <button
                  key={m.label}
                  onClick={() => { setOpen(idx); }}
                  className={`group relative overflow-hidden rounded-[4px] transition ${idx === open ? "ring-2 ring-accent" : "opacity-55 hover:opacity-90"}`}
                >
                  <img src={m.image} alt={m.imageAlt} className="h-[140px] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-[13px] font-medium text-white" style={{ fontFamily: "var(--font-display)" }}>
                    {m.label}
                  </div>
                  {idx === open && (
                    <div className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white" style={{ fontFamily: "var(--font-body)" }}>
                      Active
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Sidebar */}
            <div>
              <div className="mb-4 text-[10px] uppercase tracking-[0.26em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Popular
              </div>
              <ul className="space-y-2.5" style={{ fontFamily: "var(--font-body)" }}>
                {[
                  { label: "Geometric Planter Pod", cat: "pots" },
                  { label: "Dynamic Warrior Figure", cat: "action-figures" },
                  { label: "Custom Name Tag", cat: "custom" },
                  { label: "Hex Panel Wall Art", cat: "wall-arts" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                    <button
                      onClick={() => handleCategory(item.cat)}
                      className="text-[13px] text-foreground/75 transition hover:text-accent"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-[4px] bg-secondary p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent" style={{ fontFamily: "var(--font-body)" }}>
                  Custom Design?
                </div>
                <div className="mt-1.5 text-[13px] leading-[1.5] text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                  Share your idea — we model and print it for you.
                </div>
                <button
                  onClick={() => { onCustomOrder(); setOpen(null); }}
                  className="mt-3 text-[11px] uppercase tracking-[0.2em] text-accent transition hover:underline"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Get a quote →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-6 py-6 md:hidden" style={{ fontFamily: "var(--font-body)" }}>
          <div className="space-y-5">
            <button onClick={() => { onNavigate(null); setMobileOpen(false); }} className="block text-[15px] font-medium text-foreground">
              Home
            </button>
            {megaMenu.map((m) => (
              <div key={m.label}>
                <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{m.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  {m.subs.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleCategory(s.key)}
                      className="rounded-[3px] border border-border px-3 py-2 text-left text-[13px] text-foreground transition hover:border-accent hover:text-accent"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => { onCustomOrder(); setMobileOpen(false); }}
              className="block w-full rounded-[3px] bg-accent py-3 text-center text-[12px] uppercase tracking-[0.2em] text-white"
            >
              Custom Order
            </button>
            <button
              onClick={() => { onEnterAdmin(); setMobileOpen(false); }}
              className="block w-full text-center text-[12px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
