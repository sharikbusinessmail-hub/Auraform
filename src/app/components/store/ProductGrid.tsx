import { useEffect, useMemo, useState } from "react";
import { Star, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { api, type Product, CATEGORY_LABELS, FINISH_LABELS } from "../../lib/api";

interface Props {
  filter: { category?: string; search?: string } | null;
  onOpen: (p: Product) => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={11}
          className={n <= Math.round(rating) ? "fill-accent text-accent" : "fill-border text-border"}
        />
      ))}
    </div>
  );
}

function ProductCard({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) {
  return (
    <button
      onClick={() => onOpen(p)}
      className="group overflow-hidden rounded-[6px] border border-border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/4.2] overflow-hidden bg-muted">
        {p.images[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {p.type === "pod" && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white" style={{ fontFamily: "var(--font-body)" }}>
            Custom
          </span>
        )}
        {p.type === "pre-printed" && p.stock !== undefined && p.stock <= 5 && p.stock > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white" style={{ fontFamily: "var(--font-body)" }}>
            {p.stock} left
          </span>
        )}
        {p.type === "pre-printed" && p.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white" style={{ fontFamily: "var(--font-body)" }}>
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          {FINISH_LABELS[p.finish] ?? p.finish}
        </div>
        <h3 className="mt-1.5 text-[16px] leading-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
          {p.name}
        </h3>
        <div className="mt-2.5 flex items-center gap-2">
          <Stars rating={p.rating} />
          <span className="font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            ({p.reviews})
          </span>
        </div>
        {p.printHours && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            <Clock size={11} className="text-muted-foreground/70" />
            {p.printHours}h print time
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[16px] font-medium text-accent" style={{ fontFamily: "var(--font-mono)" }}>
            Rs. {p.priceRs.toLocaleString()}
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition group-hover:bg-accent group-hover:text-white" style={{ fontFamily: "var(--font-body)" }}>
            View
          </span>
        </div>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[6px] border border-border bg-white">
      <div className="aspect-[4/4.2] animate-pulse bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGrid({ filter, onOpen }: Props) {
  const [tab, setTab] = useState<"featured" | "top-selling">("featured");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    // When searching we fetch everything and filter client-side.
    const params = filter?.category && !filter?.search ? { category: filter.category } : undefined;

    (async () => {
      try {
        let data = await api.getProducts(params);
        // Auto-seed on first load if the catalog is completely empty.
        if (data.length === 0 && !params) {
          try {
            await api.initDb();
            data = await api.getProducts(params);
          } catch {
            /* init unavailable — leave empty */
          }
        }
        if (!cancelled) setAllProducts(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [filter?.category, filter?.search]);

  const topSelling = useMemo(() => allProducts.filter((p) => p.topSelling), [allProducts]);

  const searchResults = useMemo(() => {
    if (!filter?.search) return allProducts;
    const q = filter.search.toLowerCase();
    return allProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[p.category] ?? "").toLowerCase().includes(q)
    );
  }, [allProducts, filter?.search]);

  const displayItems = filter
    ? (filter.search ? searchResults : allProducts)
    : (tab === "featured" ? allProducts : topSelling);

  const sectionLabel = filter?.search
    ? `Results for “${filter.search}”`
    : filter?.category
      ? (CATEGORY_LABELS[filter.category] ?? filter.category)
      : null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-accent" style={{ fontFamily: "var(--font-body)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {filter ? "Filtered results" : "Browse our collection"}
            </div>
            <h2 className="mt-3 text-[42px] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {sectionLabel ?? "Marketplace"}
            </h2>
            {!filter && (
              <p className="mt-2 text-[15px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Discover our collection of high-quality 3D printed items
              </p>
            )}
          </div>

          {!filter && (
            <div className="flex gap-1 self-start rounded-full border border-border bg-muted p-1 md:self-auto" style={{ fontFamily: "var(--font-body)" }}>
              <button
                onClick={() => setTab("featured")}
                className={`rounded-full px-5 py-2 text-[12px] uppercase tracking-[0.14em] transition ${tab === "featured" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Featured
              </button>
              <button
                onClick={() => setTab("top-selling")}
                className={`rounded-full px-5 py-2 text-[12px] uppercase tracking-[0.14em] transition ${tab === "top-selling" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Top Selling
              </button>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="mb-8 flex items-start gap-3 rounded-[6px] border border-orange-200 bg-orange-50 px-5 py-4">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-orange-500" />
            <div style={{ fontFamily: "var(--font-body)" }}>
              <div className="text-[14px] font-medium text-orange-800">Database not set up yet</div>
              <div className="mt-1 text-[13px] text-orange-700">
                {error.includes("relation") || error.includes("exist")
                  ? "Products table not found. Please go to Admin → Setup & run the database initialisation."
                  : error}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : displayItems.length === 0 && !error ? (
          <div className="py-24 text-center text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            <RefreshCw size={32} className="mx-auto mb-4 text-muted-foreground/30" />
            <div className="text-[16px]">No products found</div>
            <div className="mt-1 text-[13px]">
              {filter?.search ? "Try a different search term." : filter ? "Try a different category." : "Add products in the admin panel."}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayItems.map((p) => (
              <ProductCard key={p.id} p={p} onOpen={onOpen} />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && displayItems.length > 0 && (
          <div className="mt-12 text-center">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-accent bg-white px-8 py-3 text-[12px] uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white"
              style={{ fontFamily: "var(--font-body)" }}
            >
              View All Models →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
