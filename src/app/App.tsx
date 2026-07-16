import { useEffect, useRef, useState } from "react";
import { Header } from "./components/store/Header";
import { Hero } from "./components/store/Hero";
import { ProductGrid } from "./components/store/ProductGrid";
import { ProductPage } from "./components/store/ProductPage";
import { CartDrawer } from "./components/store/CartDrawer";
import { CustomOrderPage } from "./components/store/CustomOrderPage";
import { ModelingServices } from "./components/store/ModelingServices";
import { FloatingActions } from "./components/store/FloatingActions";
import { AdminAuth } from "./components/admin/AdminAuth";
import { AdminShell } from "./components/admin/AdminShell";
import { type CartItem } from "./lib/api";

type View = "store" | "admin-auth" | "admin" | "custom-order";
type Filter = { category?: string; search?: string };

const STORAGE_KEY = "auraform_cart_v1";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export default function App() {
  const [view, setView] = useState<View>("store");
  const [filter, setFilter] = useState<Filter | null>(null);
  const [activeProduct, setActiveProduct] = useState<import("./lib/api").Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.background = "#ffffff";
    document.body.style.fontFamily = "var(--font-body)";
  }, []);

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (x) => x.product.id === item.product.id && x.customText === item.customText && x.filamentColorId === item.filamentColorId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    setActiveProduct(null);
    setCartOpen(true);
  };

  const updateCartQty = (id: string, customText: string | undefined, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === id && item.customText === customText ? { ...item, qty } : item
      )
    );
  };

  const removeFromCart = (id: string, customText: string | undefined) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === id && item.customText === customText))
    );
  };

  const clearCart = () => setCartItems([]);

  const handleNavigate = (f: Filter | null) => {
    setFilter(f);
    setActiveProduct(null);
    setView("store");
    if (f && productsRef.current) {
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    } else if (f === null) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = (term: string) => {
    const t = term.trim();
    handleNavigate(t ? { search: t } : null);
  };

  const handleShopAll = () => {
    setFilter(null);
    setActiveProduct(null);
    setView("store");
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const handleCustomOrder = () => {
    setView("custom-order");
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (view === "admin-auth") {
    return <AdminAuth onEnter={() => setView("admin")} onBack={() => setView("store")} />;
  }
  if (view === "admin") {
    return <AdminShell onExit={() => setView("store")} />;
  }
  if (view === "custom-order") {
    return (
      <>
        <Header
          cartCount={cartCount}
          onNavigate={handleNavigate}
          onEnterAdmin={() => setView("admin-auth")}
          onOpenCart={() => setCartOpen(true)}
          onCustomOrder={handleCustomOrder}
          onSearch={handleSearch}
        />
        <CustomOrderPage onBack={() => setView("store")} />
        <CartDrawer
          open={cartOpen}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onUpdate={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground" style={{ fontFamily: "var(--font-body)" }}>
      <Header
        cartCount={cartCount}
        onNavigate={handleNavigate}
        onEnterAdmin={() => setView("admin-auth")}
        onOpenCart={() => setCartOpen(true)}
        onCustomOrder={handleCustomOrder}
        onSearch={handleSearch}
      />

      {!filter && (
        <Hero onNavigate={handleNavigate} onCustomOrder={handleCustomOrder} onShopAll={handleShopAll} />
      )}

      {/* Trust bar */}
      {!filter && (
        <div className="border-y border-border bg-secondary py-3.5">
          <div
            className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-8 px-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {["Island-wide Delivery", "Custom 3D Design", "PLA · Silk · Resin", "500+ Happy Customers"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="text-accent">✦</span> {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div ref={productsRef}>
        <ProductGrid filter={filter} onOpen={setActiveProduct} />
      </div>

      {!filter && (
        <ModelingServices onCustomOrder={handleCustomOrder} />
      )}

      {/* About strip */}
      {!filter && (
        <section className="border-t border-border bg-foreground py-24 text-white">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-accent" style={{ fontFamily: "var(--font-body)" }}>
                About auraform.lk
              </div>
              <h2
                className="mt-4 text-[44px] leading-[1.06] tracking-tight"
                style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
              >
                {"Sri Lanka's home for premium 3D printed creations."}
              </h2>
            </div>
            <div className="flex flex-col justify-end gap-5">
              <p className="text-[15px] leading-[1.8] text-white/70" style={{ fontFamily: "var(--font-body)" }}>
                We design, model, and print every piece in our studio — from decorative pots and geometric wall art to custom figurines and personalized nameplates. Nothing ships from a warehouse.
              </p>
              <button
                onClick={handleCustomOrder}
                className="self-start border-b border-white/30 pb-1 text-[12px] uppercase tracking-[0.2em] text-white/70 transition hover:border-white hover:text-white"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Start a custom order →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                  </svg>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "18px" }}>
                  <span className="text-foreground">auraform</span><span className="text-accent">.lk</span>
                </span>
              </div>
              <p className="mt-3 max-w-xs text-[13px] leading-[1.6] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Premium 3D printed decor, figurines, and custom pieces. Made in Sri Lanka, delivered island-wide.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3">
              {[
                { label: "Home Decors", action: () => handleNavigate({ category: "pots" }) },
                { label: "About Us", action: () => {} },
                { label: "Figurines", action: () => handleNavigate({ category: "action-figures" }) },
                { label: "Custom Orders", action: handleCustomOrder },
                { label: "3D Modeling", action: handleCustomOrder },
                { label: "Contact", action: () => {} },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="text-left text-[13px] text-muted-foreground transition hover:text-accent"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <span className="font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              © 2026 auraform.lk · All rights reserved
            </span>
          </div>
        </div>
      </footer>

      {/* Product detail overlay */}
      {activeProduct && (
        <ProductPage
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdate={updateCartQty}
        onRemove={removeFromCart}
        onClear={clearCart}
      />

      {/* Floating social buttons */}
      <FloatingActions />
    </div>
  );
}
