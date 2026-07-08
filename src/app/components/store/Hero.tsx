import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  onNavigate: (filter: { category?: string } | null) => void;
  onCustomOrder: () => void;
  onShopAll: () => void;
}

type Action =
  | { kind: "shop-all" }
  | { kind: "custom" }
  | { kind: "category"; category: string };

const slides: {
  src: string;
  badge: string;
  title: string;
  body: string;
  primaryLabel: string;
  primary: Action;
  secondaryLabel: string;
  secondary: Action;
}[] = [
  {
    src: "https://images.unsplash.com/photo-1776736851933-4a2ece025ec5?w=1800&h=1100&fit=crop&auto=format",
    badge: "New Arrivals · July 2026",
    title: "Bring your world to life — one layer at a time.",
    body: "Premium 3D printed home decor, figurines, and custom pieces. Made in Sri Lanka.",
    primaryLabel: "Shop Collection",
    primary: { kind: "shop-all" },
    secondaryLabel: "Custom Order",
    secondary: { kind: "custom" },
  },
  {
    src: "https://images.unsplash.com/photo-1730267252256-67bee55353e8?w=1800&h=1100&fit=crop&auto=format",
    badge: "Home Decors",
    title: "Geometric planters that grow with your space.",
    body: "Matte PLA, silk finishes, and resin — printed to order or ready to ship island-wide.",
    primaryLabel: "View Pots & Planters",
    primary: { kind: "category", category: "pots" },
    secondaryLabel: "All Home Decors",
    secondary: { kind: "shop-all" },
  },
  {
    src: "https://images.unsplash.com/photo-1515155075601-23009d0cb6d4?w=1800&h=1100&fit=crop&auto=format",
    badge: "Custom Design Service",
    title: "Your vision. Our printers. One perfect piece.",
    body: "Send us a sketch, photo, or idea — we model it, print it, and deliver to your door.",
    primaryLabel: "Start a Custom Order",
    primary: { kind: "custom" },
    secondaryLabel: "View Gallery",
    secondary: { kind: "shop-all" },
  },
];

export function Hero({ onNavigate, onCustomOrder, onShopAll }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);

  const s = slides[i];

  const runAction = (a: Action) => {
    if (a.kind === "custom") onCustomOrder();
    else if (a.kind === "shop-all") onShopAll();
    else onNavigate({ category: a.category });
  };

  const handlePrimary = () => runAction(s.primary);
  const handleSecondary = () => runAction(s.secondary);

  return (
    <section className="relative h-[88vh] min-h-[520px] overflow-hidden bg-secondary">
      {slides.map((sl, idx) => (
        <img
          key={idx}
          src={sl.src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/78 via-foreground/32 to-transparent" />

      <div className="relative flex h-full flex-col justify-end px-8 pb-20 lg:px-16">
        <div className="max-w-xl">
          <div
            className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-white backdrop-blur-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {s.badge}
          </div>
          <h1
            className="mt-5 text-[46px] leading-[1.05] tracking-tight text-white lg:text-[62px]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {s.title}
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-[1.7] text-white/80" style={{ fontFamily: "var(--font-body)" }}>
            {s.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePrimary}
              className="inline-flex items-center gap-2 bg-accent px-7 py-3.5 text-[12px] uppercase tracking-[0.2em] text-white transition hover:bg-accent/90"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {s.primaryLabel} <ArrowRight size={14} />
            </button>
            <button
              onClick={handleSecondary}
              className="text-[12px] uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {s.secondaryLabel} →
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-[3px] rounded-full transition-all ${idx === i ? "w-10 bg-white" : "w-4 bg-white/35"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
