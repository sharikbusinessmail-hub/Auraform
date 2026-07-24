import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
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

// ─── Admin Route Wrapper ──────────────────────────────────────────────────────
function AdminRoute() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);

  if (isAuth) {
    return <AdminShell onExit={() => { setIsAuth(false); navigate("/"); }} />;
  }
  
  return <AdminAuth onEnter={() => setIsAuth(true)} onBack={() => navigate("/")} />;
}

// ─── Main App Content ─────────────────────────────────────────────────────────
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState<Filter | null>(null);
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
    
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        if (f && productsRef.current) {
          productsRef.current.scrollIntoView({ behavior: "smooth" });
        } else if (f === null) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 150);
    } else {
      if (f && productsRef.current) {
        setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
      } else if (f === null) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSearch = (term: string) => {
    const t = term.trim();
    handleNavigate(t ? { search: t } : null);
  };

  const handleShopAll = () => {
    handleNavigate(null);
  };

  const handleCustomOrder = () => {
    navigate("/custom-order");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Reusable footer component for multi-page consistency
  const SiteFooter = () => (
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
            
            {/* Direct Contact Details */}
            <div className="mt-4 space-y-1.5 text-[13px] text-foreground/80" style={{ fontFamily: "var(--font-body)" }}>
              <div className="flex items-center gap-2">
                <span className="text-accent">✉</span>
                <a href="mailto:auraformlk@gmail.com" className="transition hover:text-accent">
                  auraformlk@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">💬</span>
                <a href="https://wa.me/94784262650" target="_blank" rel="noreferrer" className="transition hover:text-accent">
                  +94 78 426 2650
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-3">
            {[
              { label: "Home Decors", action: () => handleNavigate({ category: "pots" }) },
              { label: "Key Tags", action: () => handleNavigate({ category: "key-tags" }) },
              { label: "Figurines", action: () => handleNavigate({ category: "action-figures" }) },
              { label: "Custom Orders", action: handleCustomOrder },
              { label: "3D Modeling", action: handleCustomOrder },
              { label: "Contact Us", action: () => window.open("https://wa.me/94784262650", "_blank") },
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
            © 2026 auraformlk.store · All rights reserved
          </span>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white text-foreground" style={{ fontFamily: "var(--font-body)" }}>
      
      <Routes>
        <Route path="/" element={
          <>
            <Header
              cartCount={cartCount}
              onNavigate={handleNavigate}
              onEnterAdmin={() => {}}
              onOpenCart={() => setCartOpen(true)}
              onCustomOrder={handleCustomOrder}
              onSearch={handleSearch}
            />

            {!filter && (
              <Hero onNavigate={handleNavigate} onCustomOrder={handleCustomOrder} onShopAll={handleShopAll} />
            )}

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
              <ProductGrid filter={filter} />
            </div>

            {!filter && (
              <ModelingServices onCustomOrder={handleCustomOrder} />
            )}

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

            <SiteFooter />
            <FloatingActions />
          </>
        } />

        <Route path="/product/:id" element={
          <>
            <Header
              cartCount={cartCount}
              onNavigate={handleNavigate}
              onEnterAdmin={() => {}}
              onOpenCart={() => setCartOpen(true)}
              onCustomOrder={handleCustomOrder}
              onSearch={handleSearch}
            />
            <ProductPage onAddToCart={addToCart} />
            <SiteFooter />
            <FloatingActions />
          </>
        } />

        <Route path="/custom-order" element={
          <>
            <Header
              cartCount={cartCount}
              onNavigate={handleNavigate}
              onEnterAdmin={() => {}}
              onOpenCart={() => setCartOpen(true)}
              onCustomOrder={handleCustomOrder}
              onSearch={handleSearch}
            />
            <CustomOrderPage onBack={() => navigate("/")} />
            <SiteFooter />
            <FloatingActions />
          </>
        } />

        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>

      {!isAdminRoute && (
        <CartDrawer
          open={cartOpen}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onUpdate={updateCartQty}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <SpeedInsights />
    </BrowserRouter>
  );
}