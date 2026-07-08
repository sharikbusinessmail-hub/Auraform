import { useRef, useState } from "react";
import { ArrowLeft, Upload, X, MessageCircle, FileText } from "lucide-react";
import { api, openWhatsApp, WHATSAPP_NUMBER, CATEGORY_LABELS } from "../../lib/api";

interface Props {
  onBack: () => void;
}

const ACCEPTED = ".jpg,.jpeg,.png,.webp,.stl,.obj,.3mf,.zip";
const HOME_CATEGORIES = ["pots", "wall-arts", "ornaments"];
const FIG_CATEGORIES = ["action-figures", "statues", "light-boxes"];

export function CustomOrderPage({ onBack }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    category: "custom",
    description: "",
    size: "",
    color: "",
    qty: 1,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const removeFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.description.trim()) {
      setError("Please fill in name, phone, and description.");
      return;
    }
    setError(null);
    setSending(true);

    let fileNote = "";
    if (file) {
      try {
        setUploading(true);
        const { signedUrl, path } = await api.getCustomOrderUploadUrl(file.name);
        await api.uploadFile(signedUrl, file);
        fileNote = `\n📎 Reference file: ${file.name} (uploaded, path: ${path})`;
      } catch (_) {
        fileNote = `\n📎 Reference file: ${file.name} (upload failed — please send manually)`;
      } finally {
        setUploading(false);
      }
    }

    const msg = [
      "🎨 *Custom Order Request — auraform.lk*",
      "",
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      "",
      `*Category:* ${CATEGORY_LABELS[form.category] ?? form.category}`,
      form.size ? `*Size / Dimensions:* ${form.size}` : null,
      form.color ? `*Preferred Color:* ${form.color}` : null,
      `*Quantity:* ${form.qty}`,
      "",
      `*Description:*\n${form.description}`,
      fileNote || null,
      "",
      "Please let me know the quote and timeline. Thank you!",
    ]
      .filter(Boolean)
      .join("\n");

    openWhatsApp(msg);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-body)" }}>
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-5">
        <div className="mx-auto flex max-w-[900px] items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground">
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 py-16">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="text-[11px] uppercase tracking-[0.28em] text-accent">
            <svg className="mr-1.5 inline-block" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Custom Design Service
          </div>
          <h1
            className="mt-4 text-[48px] tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            Build it your way.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.7] text-muted-foreground">
            Describe your idea, upload a sketch or STL file, and we will model and print it for you. We will reply via WhatsApp with a quote within 24 hours.
          </p>
          <div className="mt-4 font-mono text-[12px] text-accent" style={{ fontFamily: "var(--font-mono)" }}>
            wa.me/{WHATSAPP_NUMBER}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            {/* Contact */}
            <div>
              <div className="mb-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Contact Details</div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Your Name *">
                  <input value={form.name} onChange={set("name")} className={inputCls} placeholder="Nisal Perera" required />
                </Field>
                <Field label="WhatsApp Number *">
                  <input value={form.phone} onChange={set("phone")} className={inputCls} placeholder="077 123 4567" required />
                </Field>
              </div>
            </div>

            {/* Product details */}
            <div>
              <div className="mb-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Product Details</div>
              <div className="space-y-5">
                <Field label="Category">
                  <select value={form.category} onChange={set("category")} className={inputCls}>
                    <optgroup label="Home Decors">
                      {HOME_CATEGORIES.map((k) => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
                    </optgroup>
                    <optgroup label="Figurines">
                      {FIG_CATEGORIES.map((k) => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
                    </optgroup>
                    <option value="custom">Other / Custom</option>
                  </select>
                </Field>
                <Field label="Description / Requirements *">
                  <textarea
                    value={form.description}
                    onChange={set("description")}
                    rows={5}
                    className={inputCls + " resize-none"}
                    placeholder="Describe your idea — dimensions, style, purpose, any references..."
                    required
                  />
                </Field>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Size / Dimensions">
                    <input value={form.size} onChange={set("size")} className={inputCls} placeholder="e.g. 15cm tall" />
                  </Field>
                  <Field label="Preferred Color / Finish">
                    <input value={form.color} onChange={set("color")} className={inputCls} placeholder="e.g. Matte white" />
                  </Field>
                </div>
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.qty}
                    onChange={(e) => setForm((p) => ({ ...p, qty: Math.max(1, Number(e.target.value)) }))}
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {/* File upload */}
            <div>
              <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Reference File (Optional)
              </div>
              <div
                className="relative rounded-[4px] border-2 border-dashed border-border p-8 text-center transition hover:border-accent"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files[0];
                  if (f) setFile(f);
                }}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={20} className="text-accent" />
                    <span className="text-[14px] text-foreground">{file.name}</span>
                    <button type="button" onClick={removeFile} className="text-muted-foreground transition hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto mb-3 text-muted-foreground/50" />
                    <div className="text-[14px] text-foreground">Drag & drop or click to upload</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">
                      Accepts: JPG, PNG, STL, OBJ, 3MF, ZIP (max 50MB)
                    </div>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED}
                  onChange={handleFile}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
            </div>

            {error && <div className="rounded-[3px] bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={sending || uploading}
              className="flex w-full items-center justify-center gap-2.5 rounded-[3px] bg-[#25D366] py-4 text-[13px] uppercase tracking-[0.22em] text-white transition hover:bg-[#20bd5a] disabled:opacity-60"
            >
              <MessageCircle size={16} />
              {uploading ? "Uploading file…" : sending ? "Opening WhatsApp…" : "Send via WhatsApp"}
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-[4px] border border-border bg-secondary p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent">How it works</div>
              {[
                { n: "1", t: "Submit this form", b: "We receive your idea and file via WhatsApp." },
                { n: "2", t: "We quote you", b: "We reply within 24 hours with price and timeline." },
                { n: "3", t: "Approve & Print", b: "Once you approve, we print and deliver island-wide." },
              ].map((s) => (
                <div key={s.n} className="mt-5 flex gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                    {s.n}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-foreground">{s.t}</div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground">{s.b}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[4px] border border-border p-6">
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Accepted files</div>
              <div className="mt-3 space-y-2 text-[13px] text-foreground">
                <div className="flex gap-2"><span className="font-mono text-accent" style={{ fontFamily: "var(--font-mono)" }}>JPG/PNG</span> — Sketches, photos, references</div>
                <div className="flex gap-2"><span className="font-mono text-accent" style={{ fontFamily: "var(--font-mono)" }}>STL/OBJ</span> — Ready-to-print 3D models</div>
                <div className="flex gap-2"><span className="font-mono text-accent" style={{ fontFamily: "var(--font-mono)" }}>3MF</span> — Sliced model files</div>
                <div className="flex gap-2"><span className="font-mono text-accent" style={{ fontFamily: "var(--font-mono)" }}>ZIP</span> — Multiple files in one archive</div>
              </div>
            </div>

            <div className="rounded-[4px] bg-foreground px-6 py-5 text-primary-foreground">
              <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">Pricing starts from</div>
              <div className="mt-1.5 font-mono text-[28px] text-accent" style={{ fontFamily: "var(--font-mono)" }}>Rs. 2,500</div>
              <div className="mt-1.5 text-[13px] opacity-70">Varies by complexity, size, and material.</div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "mt-2 w-full rounded-[3px] border border-border bg-muted px-3 py-2.5 text-[14px] text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
