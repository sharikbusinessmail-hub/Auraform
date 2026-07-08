import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, MessageCircle, Trash2 } from "lucide-react";
import { type CartItem, calcShipping, buildWhatsAppMessage, openWhatsApp, FINISH_LABELS } from "../../lib/api";

interface Props {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, customText: string | undefined, qty: number) => void;
  onRemove: (id: string, customText: string | undefined) => void;
  onClear: () => void;
}

export function CartDrawer({ items, open, onClose, onUpdate, onRemove, onClear }: Props) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [showContact, setShowContact] = useState(false);

  const { grams, rs: shipping } = calcShipping(items);
  const subtotal = items.reduce((s, i) => s + i.product.priceRs * i.qty, 0);
  const total = shipping ? subtotal + shipping : subtotal;
  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    const msg = buildWhatsAppMessage(items, name || undefined, address || undefined);
    openWhatsApp(msg);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-foreground/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={18} className="text-foreground" />
            <h2 className="text-[17px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Your bag {!isEmpty && <span className="font-mono text-[13px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>({items.reduce((s, i) => s + i.qty, 0)})</span>}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground transition hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={40} className="text-muted-foreground/40" />
              <div>
                <div className="text-[16px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>Your bag is empty</div>
                <div className="mt-1 text-[13px] text-muted-foreground">Add some items from the store</div>
              </div>
              <button
                onClick={onClose}
                className="mt-2 rounded-[3px] border border-accent px-6 py-2.5 text-[12px] uppercase tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const key = `${item.product.id}-${item.customText ?? ""}`;
                return (
                  <div key={key} className="flex gap-4 rounded-[4px] border border-border p-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-[3px] object-cover bg-muted flex-shrink-0"
                    />
                    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[14px] leading-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                          {item.product.name}
                        </div>
                        <button
                          onClick={() => onRemove(item.product.id, item.customText)}
                          className="flex-shrink-0 text-muted-foreground/60 transition hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {FINISH_LABELS[item.product.finish] ?? item.product.finish}
                      </div>
                      {item.customText && (
                        <div className="rounded bg-secondary px-2 py-1 text-[12px] font-medium text-foreground">
                          "{item.customText}"
                        </div>
                      )}
                      {item.customFileName && (
                        <div className="text-[11px] text-muted-foreground">
                          📎 {item.customFileName}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded border border-border">
                          <button
                            onClick={() => item.qty > 1 && onUpdate(item.product.id, item.customText, item.qty - 1)}
                            className="px-2.5 py-1.5 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                            disabled={item.qty <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center font-mono text-[13px]" style={{ fontFamily: "var(--font-mono)" }}>
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onUpdate(item.product.id, item.customText, item.qty + 1)}
                            className="px-2.5 py-1.5 text-muted-foreground transition hover:text-foreground"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-mono text-[14px] font-medium text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                          Rs. {(item.product.priceRs * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={onClear}
                className="w-full text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-red-500"
              >
                Clear bag
              </button>
            </div>
          )}
        </div>

        {/* Summary + Checkout */}
        {!isEmpty && (
          <div className="border-t border-border px-6 pb-6 pt-4">
            {/* Shipping info */}
            <div className="mb-4 rounded-[4px] bg-secondary px-4 py-3 text-[13px]">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-muted-foreground">Shipping ({(grams / 1000).toFixed(2)}kg)</span>
                {shipping ? (
                  <span className="font-mono text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                    Rs. {shipping.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[11px] text-accent">Calculated at delivery</span>
                )}
              </div>
              {!shipping && (
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  Orders over 1kg — shipping quoted after confirmation.
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-medium text-foreground">Total</span>
                <span className="font-mono text-[16px] font-medium text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                  {shipping
                    ? `Rs. ${total.toLocaleString()}`
                    : `Rs. ${subtotal.toLocaleString()} + shipping`}
                </span>
              </div>
            </div>

            {/* Contact details (optional) */}
            {showContact ? (
              <div className="mb-4 space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-[3px] border border-border bg-muted px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-accent"
                />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Delivery address (optional)"
                  className="w-full rounded-[3px] border border-border bg-muted px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-accent"
                />
              </div>
            ) : (
              <button
                onClick={() => setShowContact(true)}
                className="mb-4 w-full text-center text-[12px] text-muted-foreground transition hover:text-foreground"
              >
                + Add name &amp; address to message
              </button>
            )}

            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2.5 rounded-[3px] bg-[#25D366] py-4 text-[13px] uppercase tracking-[0.2em] text-white transition hover:bg-[#20bd5a]"
            >
              <MessageCircle size={16} />
              Checkout via WhatsApp
            </button>
            <div className="mt-3 text-center text-[11px] text-muted-foreground">
              We will confirm your order and arrange payment via WhatsApp.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
