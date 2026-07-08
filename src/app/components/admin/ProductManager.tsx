import { useEffect, useRef, useState } from "react";
import {
  Plus, Pencil, Trash2, Upload, X, Check, Loader2, AlertCircle, Database, RefreshCw, ImagePlus,
} from "lucide-react";
import {
  api, CATEGORY_LABELS, FINISH_LABELS, FILAMENTS,
  type Product, type ProductType, type MaterialFinish,
} from "../../lib/api";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as string[];
const ALL_FINISHES = Object.keys(FINISH_LABELS) as MaterialFinish[];

interface FormState {
  name: string;
  description: string;
  price: number;
  priceRs: number;
  category: string;
  finish: MaterialFinish;
  type: ProductType;
  stock: number;
  filamentColorId: string;
  gramsPerUnit: number;
  maxChars: number;
  weightGrams: number;
  rating: number;
  reviews: number;
  printHours: number;
  topSelling: boolean;
  images: string[];
}

const defaultForm = (): FormState => ({
  name: "",
  description: "",
  price: 0,
  priceRs: 0,
  category: "pots",
  finish: "matte-pla",
  type: "pre-printed",
  stock: 10,
  filamentColorId: FILAMENTS[0].id,
  gramsPerUnit: 80,
  maxChars: 20,
  weightGrams: 200,
  rating: 4.5,
  reviews: 0,
  printHours: 4,
  topSelling: false,
  images: [],
});

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [dbMsg, setDbMsg] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSql, setDbSql] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getProducts();
      setProducts(list);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setForm(defaultForm());
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      priceRs: p.priceRs,
      category: p.category,
      finish: p.finish,
      type: p.type,
      stock: p.stock ?? 0,
      filamentColorId: p.filamentColorId ?? FILAMENTS[0].id,
      gramsPerUnit: p.gramsPerUnit ?? 80,
      maxChars: p.maxChars ?? 20,
      weightGrams: p.weightGrams,
      rating: p.rating,
      reviews: p.reviews,
      printHours: p.printHours ?? 4,
      topSelling: p.topSelling,
      images: [...p.images],
    });
    setEditing(p);
    setCreating(false);
  };

  const closeForm = () => { setCreating(false); setEditing(null); };

  const set = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const setNum = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: Number(e.target.value) }));

  const setBool = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.checked }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImg(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const { signedUrl, publicUrl } = await api.getUploadUrl(file.name);
        await api.uploadFile(signedUrl, file);
        urls.push(publicUrl);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (e: any) {
      alert("Image upload failed: " + e.message);
    } finally {
      setUploadingImg(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        priceRs: form.priceRs,
        category: form.category,
        finish: form.finish,
        type: form.type,
        stock: form.type === "pre-printed" ? form.stock : undefined,
        filamentColorId: form.type === "pod" ? form.filamentColorId : undefined,
        gramsPerUnit: form.type === "pod" ? form.gramsPerUnit : undefined,
        maxChars: form.type === "pod" ? form.maxChars : undefined,
        weightGrams: form.weightGrams,
        rating: form.rating,
        reviews: form.reviews,
        printHours: form.printHours || undefined,
        topSelling: form.topSelling,
        images: form.images,
      };
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      await fetchProducts();
      closeForm();
    } catch (e: any) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setDeleteId(null);
      await fetchProducts();
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  };

  const handleInitDb = async () => {
    setDbLoading(true);
    setDbMsg(null);
    setDbSql(null);
    try {
      const result = await api.initDb();
      if (result.sql) {
        setDbSql(result.sql);
        setDbMsg("Auto-create failed. Run the SQL below in Supabase SQL Editor:");
      } else {
        setDbMsg(result.message ?? "Database initialized successfully.");
        await fetchProducts();
      }
    } catch (e: any) {
      setDbMsg("Error: " + e.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleSeed = async () => {
    setDbLoading(true);
    try {
      await api.seedProducts();
      await fetchProducts();
      setDbMsg("Sample products seeded successfully.");
    } catch (e: any) {
      setDbMsg("Seed failed: " + e.message);
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7]" style={{ fontFamily: "var(--font-body)" }}>
      <div className="mx-auto max-w-[1280px] px-6 py-8">

        {/* Setup panel */}
        <div className="mb-6 rounded-[6px] border border-border bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                <Database size={14} /> Database Setup
              </div>
              <div className="mt-1 text-[13px] text-foreground">
                Initialize the products table and storage buckets in Supabase before adding products.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleInitDb}
                disabled={dbLoading}
                className="flex items-center gap-2 rounded-[3px] border border-border px-4 py-2 text-[12px] text-foreground transition hover:bg-secondary disabled:opacity-50"
              >
                {dbLoading ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
                Init DB
              </button>
              <button
                onClick={handleSeed}
                disabled={dbLoading}
                className="flex items-center gap-2 rounded-[3px] border border-border px-4 py-2 text-[12px] text-foreground transition hover:bg-secondary disabled:opacity-50"
              >
                {dbLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Seed Sample Data
              </button>
            </div>
          </div>
          {dbMsg && (
            <div className="mt-4 rounded-[3px] bg-secondary px-4 py-3 text-[13px] text-foreground">
              {dbMsg}
            </div>
          )}
          {dbSql && (
            <pre className="mt-3 overflow-x-auto rounded-[3px] bg-foreground p-4 text-[12px] leading-[1.6] text-secondary" style={{ fontFamily: "var(--font-mono)" }}>
              {dbSql}
            </pre>
          )}
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-[28px] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
              Products
            </h2>
            <div className="mt-1 font-mono text-[12px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
              {products.length} products in database
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-[3px] bg-accent px-5 py-2.5 text-[12px] uppercase tracking-[0.2em] text-white transition hover:bg-accent/90"
          >
            <Plus size={15} /> Add Product
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-[4px] border border-orange-200 bg-orange-50 px-4 py-3 text-[13px] text-orange-800">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>{error} — Run "Init DB" above to set up the database first.</div>
          </div>
        )}

        {/* Product table */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-[4px] bg-muted" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[6px] border border-border bg-white">
            {products.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <div className="text-[15px]">No products yet.</div>
                <div className="mt-1 text-[13px]">Click "Add Product" or seed sample data above.</div>
              </div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Category</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Type</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price (Rs.)</th>
                    <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground md:table-cell">Stock</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="transition hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="h-10 w-10 flex-shrink-0 rounded-[3px] object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[3px] bg-muted text-muted-foreground/40">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
                                <path d="m21 15-5-5L5 21" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-foreground">{p.name}</div>
                            {p.topSelling && (
                              <span className="text-[10px] uppercase tracking-[0.14em] text-accent">Top Selling</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {CATEGORY_LABELS[p.category] ?? p.category}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${p.type === "pod" ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"}`}>
                          {p.type === "pod" ? "Custom" : "Pre-printed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                        {p.priceRs.toLocaleString()}
                      </td>
                      <td className="hidden px-4 py-3 text-center md:table-cell">
                        {p.type === "pre-printed" ? (
                          <span className={`font-mono text-[12px] ${(p.stock ?? 0) < 5 ? "text-orange-500" : "text-foreground"}`} style={{ fontFamily: "var(--font-mono)" }}>
                            {p.stock ?? 0}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="rounded-[2px] p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Pencil size={13} />
                          </button>
                          {deleteId === p.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="rounded-[2px] bg-red-500 p-2 text-white"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-[2px] p-2 text-muted-foreground hover:text-foreground"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="rounded-[2px] p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Product Form Drawer */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-foreground/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="flex w-full max-w-[640px] flex-col overflow-y-auto bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h3 className="text-[18px] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                {editing ? "Edit Product" : "New Product"}
              </h3>
              <button onClick={closeForm} className="text-muted-foreground transition hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 px-6 py-6">
              {/* Type toggle */}
              <div>
                <div className={labelCls}>Product Type</div>
                <div className="mt-2 flex gap-2">
                  {(["pre-printed", "pod"] as ProductType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: t }))}
                      className={`flex-1 rounded-[3px] border py-2.5 text-[12px] uppercase tracking-[0.18em] transition ${form.type === t ? "border-accent bg-accent text-white" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
                    >
                      {t === "pod" ? "Custom (POD)" : "Pre-Printed"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <F label="Product Name *">
                <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Geometric Planter Pod" />
              </F>

              {/* Description */}
              <F label="Description">
                <textarea value={form.description} onChange={set("description")} rows={3} className={inputCls + " resize-none"} placeholder="Brief description of the product..." />
              </F>

              {/* Category + Finish */}
              <div className="grid grid-cols-2 gap-4">
                <F label="Category">
                  <select value={form.category} onChange={set("category")} className={inputCls}>
                    {ALL_CATEGORIES.map((k) => (
                      <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                    ))}
                  </select>
                </F>
                <F label="Finish / Material">
                  <select value={form.finish} onChange={set("finish") as any} className={inputCls}>
                    {ALL_FINISHES.map((k) => (
                      <option key={k} value={k}>{FINISH_LABELS[k]}</option>
                    ))}
                  </select>
                </F>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <F label="Price USD ($)">
                  <input type="number" min={0} step={0.01} value={form.price} onChange={setNum("price")} className={inputCls} />
                </F>
                <F label="Price LKR (Rs.)">
                  <input type="number" min={0} value={form.priceRs} onChange={setNum("priceRs")} className={inputCls} />
                </F>
              </div>

              {/* Type-specific fields */}
              {form.type === "pre-printed" ? (
                <F label="Stock Quantity">
                  <input type="number" min={0} value={form.stock} onChange={setNum("stock")} className={inputCls} />
                </F>
              ) : (
                <div className="space-y-4 rounded-[4px] border border-border bg-secondary/50 p-4">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Print-on-Demand Settings</div>
                  <div className="grid grid-cols-2 gap-4">
                    <F label="Default Filament Color">
                      <select value={form.filamentColorId} onChange={set("filamentColorId")} className={inputCls}>
                        {FILAMENTS.map((f) => (
                          <option key={f.id} value={f.id}>{f.colorName}</option>
                        ))}
                      </select>
                    </F>
                    <F label="Grams per Unit">
                      <input type="number" min={0} value={form.gramsPerUnit} onChange={setNum("gramsPerUnit")} className={inputCls} />
                    </F>
                  </div>
                  <F label="Max Custom Text Characters">
                    <input type="number" min={1} max={100} value={form.maxChars} onChange={setNum("maxChars")} className={inputCls} />
                  </F>
                </div>
              )}

              {/* Weight + Print hours */}
              <div className="grid grid-cols-2 gap-4">
                <F label="Weight (grams)">
                  <input type="number" min={0} value={form.weightGrams} onChange={setNum("weightGrams")} className={inputCls} />
                </F>
                <F label="Print Hours (approx)">
                  <input type="number" min={0} step={0.5} value={form.printHours} onChange={setNum("printHours")} className={inputCls} />
                </F>
              </div>

              {/* Rating + Reviews */}
              <div className="grid grid-cols-2 gap-4">
                <F label="Rating (1–5)">
                  <input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={setNum("rating")} className={inputCls} />
                </F>
                <F label="Review Count">
                  <input type="number" min={0} value={form.reviews} onChange={setNum("reviews")} className={inputCls} />
                </F>
              </div>

              {/* Top Selling */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.topSelling}
                  onChange={setBool("topSelling")}
                  className="h-4 w-4 accent-[#4a7c3f]"
                />
                <span className="text-[13px] text-foreground">Mark as Top Selling</span>
              </label>

              {/* Images */}
              <div>
                <div className={labelCls + " mb-3"}>Product Images</div>
                {form.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-4 gap-2">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-[3px] bg-muted">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 flex rounded-full bg-red-500 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImg}
                  className="flex w-full items-center justify-center gap-2 rounded-[3px] border border-dashed border-border py-4 text-[13px] text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {uploadingImg ? (
                    <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><ImagePlus size={15} /> Add images (multiple allowed)</>
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  Images are uploaded to Supabase Storage and stored as public URLs.
                </div>
              </div>
            </div>

            {/* Drawer footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
              <button
                onClick={closeForm}
                className="rounded-[3px] border border-border px-5 py-2.5 text-[12px] text-muted-foreground transition hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 rounded-[3px] bg-accent px-6 py-2.5 text-[12px] uppercase tracking-[0.2em] text-white transition hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {editing ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-[3px] border border-border bg-muted px-3 py-2.5 text-[13px] text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent";
const labelCls = "text-[11px] uppercase tracking-[0.18em] text-muted-foreground";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
