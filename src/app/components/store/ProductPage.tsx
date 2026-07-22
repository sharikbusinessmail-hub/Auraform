import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Star, MessageCircle, ShoppingBag, Upload, FileText, Loader2 } from "lucide-react";
import { api, openWhatsApp, buildWhatsAppMessage, FINISH_LABELS, FILAMENTS, type Product, type CartItem } from "../../lib/api";

interface Props {
  onAddToCart: (item: CartItem) => void;
}

export function ProductPage({ onAddToCart }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [text, setText] = useState("");
  const [filamentId, setFilamentId] = useState(FILAMENTS[0].id);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    
    let cancelled = false;
    setLoading(true);
    
    api.getProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setFilamentId(p.filamentColorId ?? FILAMENTS[0].id);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
      
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-6 text-center">
        <h2 className="text-[24px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>Product not found</h2>
        <p className="mt-2 text-[15px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>The requested product does not exist or has been removed.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-full bg-accent px-6 py-2.5 text-[12px] uppercase tracking-[0.2em] text-white"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Return Home
        </button>
      </div>
    );
  }

  const isPod = product.type === "pod";
  const podChars = product.maxChars ?? 20;
  const podValid = !isPod || text.trim().length > 0;
  const soldOut = product.type === "pre-printed" && (product.stock ?? 0) === 0;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCustomFile(f);
    setUploadingFile(true);
    try {
      const { signedUrl, path } = await api.getCustomOrderUploadUrl(f.name);
      await api.uploadFile(signedUrl, f);
      setCustomFileUrl(path);
    } catch {
      setCustomFileUrl(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({
      product,
      qty,
      customText: isPod ? text : undefined,
      filamentColorId: isPod ? filamentId : undefined,
      customFileUrl: customFileUrl ?? undefined,
      customFileName: customFile?.name,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    const items: CartItem[] = [{
      product,
      qty,
      customText: isPod ? text : undefined,
      filamentColorId: isPod ? filamentId : undefined,
    }];
    const msg = buildWhatsAppMessage(items);
    openWhatsApp(msg);
  };

  return (
    <div className="w-full bg-white" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[12px] uppercase tracking-[0.2em] text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <X size={13} /> Back to shop
        </button>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_1fr]">
          {/* Images */}
          <div>
            <div className="aspect-[4/4.5] overflow-hidden rounded-[6px] bg-muted">
              {product.images[activeImg] ? (
                <img src={product.images[activeImg]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/30 text-[14px]">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {product.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`aspect-square overflow-hidden rounded-[4px] bg-muted transition ${idx === activeImg ? "ring-2 ring-accent" : "opacity-50 hover:opacity-100"}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {FINISH_LABELS[product.finish] ?? product.finish}
            </div>
            <h1 className="mt-3 text-[38px] leading-[1.05] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={13} className={n <= Math.round(product.rating) ? "fill-accent text-accent" : "fill-border text-border"} />
                ))}
              </div>
              <span className="text-[13px] text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="mt-4">
              <span className="font-mono text-[28px] font-medium text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                Rs. {product.priceRs.toLocaleString()}
              </span>
              <span className="ml-3 text-[14px] text-muted-foreground">(~${product.price})</span>
            </div>

            <p className="mt-6 text-[15px] leading-[1.75] text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8 space-y-6 border-t border-border pt-8">
              {isPod ? (
                <>
                  {/* Custom text */}
                  <div>
                    <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-foreground">
                      <span>Your custom text</span>
                      <span className="font-mono text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                        {text.length}/{podChars}
                      </span>
                    </div>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, podChars))}
                      placeholder="e.g. AURAFORM STUDIO"
                      className="w-full rounded-[4px] border border-border bg-muted px-4 py-3 text-[18px] tracking-wide text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-accent focus:ring-1 focus:ring-accent"
                      style={{ fontFamily: "var(--font-display)" }}
                    />
                    {text && (
                      <div className="mt-4 flex items-center justify-center rounded-[4px] bg-secondary py-5">
                        <span className="text-[26px] tracking-[0.06em] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
                          {text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Filament color */}
                  <div>
                    <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-foreground">Filament color</div>
                    <div className="flex flex-wrap gap-2">
                      {FILAMENTS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFilamentId(f.id)}
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition ${filamentId === f.id ? "border-accent bg-accent text-white" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                        >
                          <span className="h-3 w-3 rounded-full border border-white/30 shadow-sm" style={{ background: f.hex }} />
                          {f.colorName}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                      {product.gramsPerUnit ? `Uses ~${product.gramsPerUnit}g filament · ` : ""}prints within 3–5 days
                    </div>
                  </div>

                  {/* Reference file upload */}
                  <div>
                    <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-foreground">
                      Reference file (optional)
                    </div>
                    <div
                      className="relative flex items-center gap-3 rounded-[4px] border border-dashed border-border p-4 transition hover:border-accent"
                      onClick={() => fileRef.current?.click()}
                    >
                      {customFile ? (
                        <>
                          <FileText size={18} className="text-accent" />
                          <span className="text-[13px] text-foreground">{customFile.name}</span>
                          {uploadingFile && <span className="ml-auto text-[11px] text-muted-foreground">Uploading…</span>}
                          {!uploadingFile && customFileUrl && <span className="ml-auto text-[11px] text-accent">✓ Uploaded</span>}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCustomFile(null); setCustomFileUrl(null); }}
                            className="ml-2 text-muted-foreground hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={18} className="text-muted-foreground/50" />
                          <span className="text-[13px] text-muted-foreground cursor-pointer">
                            Upload a sketch, photo, or STL file
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.stl,.obj,.3mf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${soldOut ? "bg-red-400" : "bg-green-500"}`} />
                  <span className="text-[13px] text-muted-foreground">
                    {soldOut ? "Out of stock" : `${product.stock ?? "—"} in stock · ships within 2 days`}
                  </span>
                </div>
              )}

              {/* Qty + Add to cart */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-[4px] border border-border">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 text-muted-foreground transition hover:text-foreground">
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-mono text-[14px]" style={{ fontFamily: "var(--font-mono)" }}>{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="px-3 py-3 text-muted-foreground transition hover:text-foreground">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    disabled={!podValid || soldOut}
                    onClick={handleAddToCart}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-[4px] py-3.5 text-[12px] uppercase tracking-[0.22em] transition disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground ${addedToCart ? "bg-green-500 text-white" : "bg-foreground text-white hover:bg-foreground/90"}`}
                  >
                    <ShoppingBag size={15} />
                    {addedToCart ? "Added!" : "Add to Bag"}
                  </button>
                </div>

                {/* Buy now via WhatsApp */}
                <button
                  disabled={!podValid || soldOut}
                  onClick={handleBuyNow}
                  className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#25D366] py-3.5 text-[12px] uppercase tracking-[0.22em] text-white transition hover:bg-[#20bd5a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageCircle size={15} />
                  Buy Now via WhatsApp
                </button>
              </div>

              {/* Weight / shipping note */}
              <div className="rounded-[4px] bg-secondary px-4 py-3 text-[12px] text-muted-foreground">
                <span className="font-mono" style={{ fontFamily: "var(--font-mono)" }}>~{product.weightGrams}g</span>
                {product.weightGrams < 1000
                  ? " · Flat shipping Rs. 500 island-wide"
                  : " · Shipping calculated at delivery"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}