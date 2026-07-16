import { createClient } from "@supabase/supabase-js";

// Change this to your WhatsApp Business number or set VITE_WHATSAPP_NUMBER in Vercel
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "94771234567";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ezbutwwaummegowbxwcr.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
const mapProduct = (db: any): Product => ({
  id: db.id,
  name: db.name,
  description: db.description ?? "",
  price: Number(db.price),
  priceRs: db.price_rs,
  category: db.category,
  finish: db.finish,
  type: db.type,
  stock: db.stock,
  filamentColorId: db.filament_color_id,
  gramsPerUnit: db.grams_per_unit,
  maxChars: db.max_chars,
  weightGrams: db.weight_grams ?? 200,
  rating: Number(db.rating) ?? 4.5,
  reviews: db.reviews ?? 0,
  printHours: db.print_hours,
  topSelling: db.top_selling ?? false,
  images: db.images ?? [],
  createdAt: db.created_at,
});

const toDb = (p: any) => ({
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
    let query = supabase.from("products_af").select("*");
    if (params?.category) query = query.eq("category", params.category);
    if (params?.topSelling) query = query.eq("top_selling", true);
    
    const { data, error } = await query;
    if (error) throw error;
    return data.map(mapProduct);
  },

  async getProduct(id: string): Promise<Product> {
    const { data, error } = await supabase.from("products_af").select("*").eq("id", id).single();
    if (error) throw error;
    return mapProduct(data);
  },

  async createProduct(p: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const { data, error } = await supabase.from("products_af").insert(toDb(p)).select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async updateProduct(id: string, p: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase.from("products_af").update(toDb(p)).eq("id", id).select().single();
    if (error) throw error;
    return mapProduct(data);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products_af").delete().eq("id", id);
    if (error) throw error;
  },

  // Direct Supabase Storage Upload Interceptor
  async getUploadUrl(filename: string): Promise<{ signedUrl: string; path: string; publicUrl: string }> {
    const fileExt = filename.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    
    // We pass the path as the "signedUrl" so uploadFile knows where to put it
    return { signedUrl: path, path, publicUrl: data.publicUrl };
  },

  async uploadFile(signedUrl: string, file: File): Promise<void> {
    // signedUrl is actually the exact file path requested by getUploadUrl
    const { error } = await supabase.storage.from('product-images').upload(signedUrl, file);
    if (error) throw new Error("Upload failed: " + error.message);
  },

  async getCustomOrderUploadUrl(filename: string): Promise<{ signedUrl: string; path: string }> {
    const { signedUrl, path } = await this.getUploadUrl(filename);
    return { signedUrl, path };
  },

  async initDb() {
    return { success: true, message: "Database is connected directly." };
  },

  async seedProducts() {
    return { success: true, message: "Use the SQL Editor to seed." };
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