// ─── Config ───────────────────────────────────────────────────────────────────
// Change this to your WhatsApp Business number (country code + number, no +)
export const WHATSAPP_NUMBER = "94771234567";

const API = "/make-server-84218427";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ProductType = "pre-printed" | "pod";
export type MaterialFinish = "matte-pla" | "silk-pla" | "resin" | "painted";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRs: number;
  category: string;
  finish: MaterialFinish;
  type: ProductType;
  stock?: number;
  filamentColorId?: string;
  gramsPerUnit?: number;
  maxChars?: number;
  weightGrams: number;
  rating: number;
  reviews: number;
  printHours?: number;
  topSelling: boolean;
  images: string[];
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  customText?: string;
  filamentColorId?: string;
  customFileUrl?: string;
  customFileName?: string;
}

// ─── DB → App conversion ──────────────────────────────────────────────────────
const mapProduct = (db: Record<string, unknown>): Product => ({
  id: db.id as string,
  name: db.name as string,
  description: (db.description as string) ?? "",
  price: db.price as number,
  priceRs: db.price_rs as number,
  category: db.category as string,
  finish: db.finish as MaterialFinish,
  type: db.type as ProductType,
  stock: db.stock as number | undefined,
  filamentColorId: db.filament_color_id as string | undefined,
  gramsPerUnit: db.grams_per_unit as number | undefined,
  maxChars: db.max_chars as number | undefined,
  weightGrams: (db.weight_grams as number) ?? 200,
  rating: (db.rating as number) ?? 4.5,
  reviews: (db.reviews as number) ?? 0,
  printHours: db.print_hours as number | undefined,
  topSelling: (db.top_selling as boolean) ?? false,
  images: (db.images as string[]) ?? [],
  createdAt: db.created_at as string | undefined,
});

const toDb = (p: Partial<Product> & Record<string, unknown>) => ({
  ...(p.name !== undefined && { name: p.name }),
  ...(p.description !== undefined && { description: p.description }),
  ...(p.price !== undefined && { price: p.price }),
  ...(p.priceRs !== undefined && { price_rs: p.priceRs }),
  ...(p.category !== undefined && { category: p.category }),
  ...(p.finish !== undefined && { finish: p.finish }),
  ...(p.type !== undefined && { type: p.type }),
  ...(p.stock !== undefined && { stock: p.stock }),
  ...(p.filamentColorId !== undefined && { filament_color_id: p.filamentColorId }),
  ...(p.gramsPerUnit !== undefined && { grams_per_unit: p.gramsPerUnit }),
  ...(p.maxChars !== undefined && { max_chars: p.maxChars }),
  ...(p.weightGrams !== undefined && { weight_grams: p.weightGrams }),
  ...(p.rating !== undefined && { rating: p.rating }),
  ...(p.reviews !== undefined && { reviews: p.reviews }),
  ...(p.printHours !== undefined && { print_hours: p.printHours }),
  ...(p.topSelling !== undefined && { top_selling: p.topSelling }),
  ...(p.images !== undefined && { images: p.images }),
});

// ─── API Calls ────────────────────────────────────────────────────────────────
export const api = {
  async getProducts(params?: { category?: string; topSelling?: boolean }): Promise<Product[]> {
    const url = new URL(`${window.location.origin}${API}/products`);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.topSelling) url.searchParams.set("top_selling", "true");
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error(data.error ?? "Failed to load products");
    return data.map(mapProduct);
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API}/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    return mapProduct(await res.json());
  },

  async createProduct(p: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const res = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toDb(p as any)),
    });
    if (!res.ok) throw new Error(await res.text());
    return mapProduct(await res.json());
  },

  async updateProduct(id: string, p: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toDb(p as any)),
    });
    if (!res.ok) throw new Error(await res.text());
    return mapProduct(await res.json());
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
  },

  async getUploadUrl(filename: string): Promise<{ signedUrl: string; path: string; publicUrl: string }> {
    const res = await fetch(`${API}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async uploadFile(signedUrl: string, file: File): Promise<void> {
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed");
  },

  async getCustomOrderUploadUrl(filename: string): Promise<{ signedUrl: string; path: string }> {
    const res = await fetch(`${API}/custom-order-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async initDb(): Promise<{ success: boolean; message: string; sql?: string; sqlEditorUrl?: string }> {
    const res = await fetch(`${API}/init-db`);
    return res.json();
  },

  async seedProducts(): Promise<{ success: boolean; count?: number; message?: string; error?: string }> {
    const res = await fetch(`${API}/seed`);
    return res.json();
  },
};

// ─── Cart helpers ─────────────────────────────────────────────────────────────
const CART_KEY = "auraform_cart";

export const cartStorage = {
  load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    } catch {
      return [];
    }
  },
  save(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },
};

export function calcShipping(items: CartItem[]): { grams: number; rs: number | null } {
  const grams = items.reduce((sum, i) => sum + i.product.weightGrams * i.qty, 0);
  return { grams, rs: grams < 1000 ? 500 : null };
}

export function buildWhatsAppMessage(items: CartItem[], name?: string, address?: string): string {
  const lines = items.map((i) => {
    const suffix = i.customText ? ` (Text: "${i.customText}")` : "";
    return `• ${i.product.name}${suffix} ×${i.qty} — Rs. ${(i.product.priceRs * i.qty).toLocaleString()}`;
  });
  const subtotal = items.reduce((s, i) => s + i.product.priceRs * i.qty, 0);
  const { grams, rs: shipping } = calcShipping(items);
  const shippingLine = shipping
    ? `Rs. ${shipping.toLocaleString()}`
    : `To be quoted (${(grams / 1000).toFixed(2)}kg)`;
  const total = shipping ? subtotal + shipping : subtotal;

  return [
    "🛍️ *New Order — auraform.lk*",
    "",
    "*Items:*",
    ...lines,
    "",
    `*Subtotal:* Rs. ${subtotal.toLocaleString()}`,
    `*Shipping:* ${shippingLine}`,
    shipping ? `*Total:* Rs. ${total.toLocaleString()}` : `*Total:* Rs. ${subtotal.toLocaleString()} + shipping`,
    "",
    name ? `*Name:* ${name}` : "*Name:* [please provide]",
    address ? `*Address:* ${address}` : "*Address:* [please provide]",
    "",
    "Thank you! Please confirm to proceed.",
  ].join("\n");
}

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  pots: "Pots",
  "wall-arts": "Wall Arts",
  ornaments: "Ornaments",
  "action-figures": "Action Figures",
  statues: "Statues",
  "light-boxes": "Light Boxes",
  custom: "Custom",
  filament: "Filament",
  nozzles: "Nozzles",
  parts: "Parts & Spares",
};

export const FINISH_LABELS: Record<string, string> = {
  "matte-pla": "Matte PLA",
  "silk-pla": "Silk PLA",
  resin: "Resin",
  painted: "Hand-Painted",
};

export const FILAMENTS = [
  { id: "f-white", colorName: "White", hex: "#f5f5f2" },
  { id: "f-green", colorName: "Bamboo Green", hex: "#4a7c3f" },
  { id: "f-black", colorName: "Midnight", hex: "#1a2b18" },
  { id: "f-grey", colorName: "Stone Grey", hex: "#8a9a8b" },
  { id: "f-gold", colorName: "Gold Silk", hex: "#c5a142" },
];
