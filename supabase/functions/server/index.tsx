import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const BASE = "/make-server-84218427";
const TABLE = "products_af";
const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    maxAge: 600,
  }),
);

const getAdmin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

const getSql = () => {
  const url = Deno.env.get("SUPABASE_DB_URL");
  if (!url) throw new Error("SUPABASE_DB_URL not set");
  return postgres(url, { max: 1 });
};

app.get(`${BASE}/health`, (c) => c.json({ status: "ok" }));

// ─── Init DB ──────────────────────────────────────────────────────────────────
app.get(`${BASE}/init-db`, async (c) => {
  const sb = getAdmin();

  // Create storage buckets (idempotent)
  await sb.storage.createBucket("product-images", {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
  await sb.storage.createBucket("custom-orders", {
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
  });

  // Try direct postgres connection (available in Supabase edge functions)
  try {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS products_af (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL,
        description text DEFAULT '',
        price numeric(10,2) NOT NULL DEFAULT 0,
        price_rs integer NOT NULL DEFAULT 0,
        category text NOT NULL DEFAULT 'pots',
        finish text NOT NULL DEFAULT 'matte-pla',
        type text NOT NULL DEFAULT 'pre-printed' CHECK (type IN ('pre-printed', 'pod')),
        stock integer,
        filament_color_id text,
        grams_per_unit integer,
        max_chars integer,
        weight_grams integer NOT NULL DEFAULT 200,
        rating numeric(3,1) DEFAULT 4.5,
        reviews integer DEFAULT 0,
        print_hours integer,
        top_selling boolean DEFAULT false,
        images text[] DEFAULT '{}',
        created_at timestamptz DEFAULT now()
      )
    `;
    await sql`ALTER TABLE products_af ENABLE ROW LEVEL SECURITY`;
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Public read products_af" ON products_af FOR SELECT USING (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `;
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Public write products_af" ON products_af FOR ALL USING (true) WITH CHECK (true);
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `;
    // Storage policies
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Public image read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `;
    await sql`
      DO $$ BEGIN
        CREATE POLICY "Upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'custom-orders'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$
    `;
    // Also seed sample products (upsert — safe to call multiple times)
    const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&auto=format`;
    const products = [
      { id:'00000000-0000-0000-0001-000000000001', name:'Geometric Planter Pod', description:'Minimalist faceted planter with sealed drainage tray. Ideal for succulents and cacti.', price:24.99, price_rs:4500, category:'pots', finish:'matte-pla', type:'pre-printed', stock:14, weight_grams:280, rating:4.8, reviews:32, print_hours:6, top_selling:true, images:[U('1730267252256-67bee55353e8'),U('1730267245087-5c7b159e2ddc')] },
      { id:'00000000-0000-0000-0001-000000000009', name:'Botanical Vase Trio', description:'Set of three organic bud vases in silk PLA. Watertight sealed base.', price:19.99, price_rs:3600, category:'pots', finish:'silk-pla', type:'pre-printed', stock:9, weight_grams:240, rating:4.5, reviews:44, print_hours:8, top_selling:false, images:[U('1595154590878-2447aa53bde1')] },
      { id:'00000000-0000-0000-0001-000000000010', name:'Ripple Pot — Large', description:'Oversized wavy-textured planter for medium tropical plants. Matte white or charcoal.', price:32.00, price_rs:5750, category:'pots', finish:'matte-pla', type:'pre-printed', stock:6, weight_grams:420, rating:4.7, reviews:21, print_hours:11, top_selling:false, images:[U('1588880695641-0440eaff4df0')] },
      { id:'00000000-0000-0000-0001-000000000004', name:'Hex Panel Wall Art', description:'Modular hexagonal wall panel. Mount solo or tile for a statement wall.', price:42.00, price_rs:7500, category:'wall-arts', finish:'matte-pla', type:'pre-printed', stock:5, weight_grams:450, rating:4.6, reviews:19, print_hours:18, top_selling:true, images:[U('1515155075601-23009d0cb6d4'),U('1524351543168-8e38787614e9')] },
      { id:'00000000-0000-0000-0001-000000000011', name:'Voronoi Wall Panel', description:'Organic Voronoi lattice wall panel. Casts beautiful shadow patterns when lit.', price:38.00, price_rs:6800, category:'wall-arts', finish:'matte-pla', type:'pre-printed', stock:8, weight_grams:390, rating:4.7, reviews:15, print_hours:14, top_selling:false, images:[U('1566041490977-9d5a61e22c01')] },
      { id:'00000000-0000-0000-0001-000000000012', name:'Crescent Moon Ornament', description:'Silk-finish crescent moon ornament with twine hanger.', price:9.99, price_rs:1800, category:'ornaments', finish:'silk-pla', type:'pre-printed', stock:22, weight_grams:60, rating:4.9, reviews:73, print_hours:2, top_selling:true, images:[U('1603513492128-ba7bc65b814a')] },
      { id:'00000000-0000-0000-0001-000000000013', name:'Geometric Terrarium Stand', description:'Geodesic sphere stand for glass orb terrariums. Stable three-point base.', price:14.99, price_rs:2700, category:'ornaments', finish:'matte-pla', type:'pre-printed', stock:11, weight_grams:120, rating:4.5, reviews:28, print_hours:4, top_selling:false, images:[U('1416339684178-3a239570f315')] },
      { id:'00000000-0000-0000-0001-000000000003', name:'Custom Name Tag — Serif', description:'Made-to-order nameplate in your choice of filament color. Serif font.', price:12.99, price_rs:2300, category:'custom', finish:'matte-pla', type:'pod', filament_color_id:'f-white', grams_per_unit:28, max_chars:20, weight_grams:80, rating:4.7, reviews:124, print_hours:2, top_selling:true, images:[U('1742745063996-8d74bacb8a9e'),U('1588883819938-de362db62aa3')] },
      { id:'00000000-0000-0000-0001-000000000008', name:'Custom Door Number', description:'House number or family name printed to order. UV-resistant coating.', price:18.99, price_rs:3400, category:'custom', finish:'matte-pla', type:'pod', filament_color_id:'f-green', grams_per_unit:55, max_chars:24, weight_grams:160, rating:4.6, reviews:66, print_hours:3, top_selling:false, images:[U('1588883819938-de362db62aa3')] },
      { id:'00000000-0000-0000-0001-000000000002', name:'Dynamic Warrior Figure', description:'Highly detailed action figure. Hand-painted with weathering effects. 18cm tall.', price:34.99, price_rs:6200, category:'action-figures', finish:'painted', type:'pre-printed', stock:7, weight_grams:320, rating:4.9, reviews:58, print_hours:14, top_selling:true, images:[U('1776736851933-4a2ece025ec5'),U('1630412612770-dc85fccc79d5')] },
      { id:'00000000-0000-0000-0001-000000000014', name:'Samurai Oni Warrior', description:'Ornate samurai figure with Oni mask and katana. 0.1mm resolution, hand-painted.', price:39.99, price_rs:7100, category:'action-figures', finish:'painted', type:'pre-printed', stock:4, weight_grams:360, rating:4.8, reviews:34, print_hours:16, top_selling:true, images:[U('1612404730178-db58d5b23e3f')] },
      { id:'00000000-0000-0000-0001-000000000005', name:'Darth Vader Bust', description:'Iconic bust at 0.1mm resolution, hand-finished matte black. 15cm tall.', price:28.99, price_rs:5200, category:'statues', finish:'painted', type:'pre-printed', stock:12, weight_grams:380, rating:4.9, reviews:87, print_hours:10, top_selling:true, images:[U('1638429489654-9d298ecfe49f'),U('1674271895767-d06559f81f1e')] },
      { id:'00000000-0000-0000-0001-000000000015', name:'Greek Torso Sculpture', description:'Museum-quality classical torso in resin. Ultra-fine detail, hand-sanded.', price:48.00, price_rs:8500, category:'statues', finish:'resin', type:'pre-printed', stock:3, weight_grams:560, rating:4.8, reviews:12, print_hours:20, top_selling:false, images:[U('1605296867424-35fc25c9212a')] },
      { id:'00000000-0000-0000-0001-000000000007', name:'Jungle Diorama Light Box', description:'Layered LED light box with jungle scene. USB-C, 3 brightness levels.', price:54.99, price_rs:9800, category:'light-boxes', finish:'resin', type:'pre-printed', stock:4, weight_grams:520, rating:4.8, reviews:23, print_hours:22, top_selling:true, images:[U('1483959651481-dc75b89291f1')] },
      { id:'00000000-0000-0000-0001-000000000016', name:'Mountain Sunset Light Box', description:'Tiered mountain silhouette light box with warm LED. USB-C, bamboo base.', price:49.99, price_rs:8900, category:'light-boxes', finish:'resin', type:'pre-printed', stock:6, weight_grams:480, rating:4.7, reviews:18, print_hours:19, top_selling:false, images:[U('1500534314209-a25ddb2bd429')] },
      { id:'00000000-0000-0000-0001-000000000018', name:'Matte PLA 1kg — Bamboo Green', description:'Premium matte PLA 1.75mm in auraform bamboo green. Low warp.', price:22.00, price_rs:3900, category:'filament', finish:'matte-pla', type:'pre-printed', stock:30, weight_grams:1100, rating:4.8, reviews:15, print_hours:0, top_selling:false, images:[U('1644936580583-91eb0c32c3db')] },
      { id:'00000000-0000-0000-0001-000000000019', name:'Silk PLA 1kg — Gold', description:'High-gloss silk PLA metallic gold. Mirror-like sheen from the printer.', price:26.00, price_rs:4600, category:'filament', finish:'silk-pla', type:'pre-printed', stock:18, weight_grams:1100, rating:4.7, reviews:9, print_hours:0, top_selling:false, images:[U('1644936580583-91eb0c32c3db')] },
      { id:'00000000-0000-0000-0001-000000000020', name:'Brass Nozzle Set — 0.4mm', description:'Pack of 5 precision brass nozzles 0.4mm. Fits MK3S+, Bambu, Ender-3.', price:8.99, price_rs:1600, category:'nozzles', finish:'matte-pla', type:'pre-printed', stock:40, weight_grams:50, rating:4.6, reviews:27, print_hours:0, top_selling:false, images:[U('1544817297-fa5c3a573e7a')] },
      { id:'00000000-0000-0000-0001-000000000021', name:'Hardened Steel Nozzle — 0.4mm', description:'Single hardened steel nozzle rated for abrasive filaments.', price:12.99, price_rs:2300, category:'nozzles', finish:'matte-pla', type:'pre-printed', stock:22, weight_grams:15, rating:4.9, reviews:19, print_hours:0, top_selling:false, images:[U('1544817297-fa5c3a573e7a')] },
      { id:'00000000-0000-0000-0001-000000000022', name:'Bowden PTFE Tube — 1m', description:'1m PTFE tube 2mm ID / 4mm OD. All standard push-fit fittings.', price:5.99, price_rs:1050, category:'parts', finish:'matte-pla', type:'pre-printed', stock:35, weight_grams:40, rating:4.5, reviews:11, print_hours:0, top_selling:false, images:[U('1644936580583-91eb0c32c3db')] },
      { id:'00000000-0000-0000-0001-000000000023', name:'Bed Spring Levelling Kit', description:'4-piece silicone bed levelling columns. Ender-3 / CR-10 fitment.', price:6.99, price_rs:1250, category:'parts', finish:'matte-pla', type:'pre-printed', stock:28, weight_grams:30, rating:4.7, reviews:33, print_hours:0, top_selling:false, images:[U('1544817297-fa5c3a573e7a')] },
    ];

    for (const p of products) {
      await sql`
        INSERT INTO products_af ${sql(p)}
        ON CONFLICT (id) DO NOTHING
      `;
    }

    await sql.end();
    return c.json({ success: true, message: `Database initialized and ${products.length} sample products seeded.` });
  } catch (err) {
    // Fall back: return SQL for manual execution
    const setupSql = `-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ezbutwwaummegowbxwcr/sql/new

CREATE TABLE IF NOT EXISTS products_af (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  price_rs integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'pots',
  finish text NOT NULL DEFAULT 'matte-pla',
  type text NOT NULL DEFAULT 'pre-printed' CHECK (type IN ('pre-printed', 'pod')),
  stock integer,
  filament_color_id text,
  grams_per_unit integer,
  max_chars integer,
  weight_grams integer NOT NULL DEFAULT 200,
  rating numeric(3,1) DEFAULT 4.5,
  reviews integer DEFAULT 0,
  print_hours integer,
  top_selling boolean DEFAULT false,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products_af ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read products_af" ON products_af FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public write products_af" ON products_af FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;`;

    return c.json({
      success: false,
      message: `Auto-setup failed (${(err as Error).message}). Copy the SQL below and run it in Supabase SQL Editor.`,
      sqlEditorUrl: "https://supabase.com/dashboard/project/ezbutwwaummegowbxwcr/sql/new",
      sql: setupSql,
    });
  }
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get(`${BASE}/products`, async (c) => {
  const sb = getAdmin();
  const category = c.req.query("category");
  const topSelling = c.req.query("top_selling");

  let q = sb.from(TABLE).select("*").order("created_at", { ascending: false });
  if (category) q = q.eq("category", category);
  if (topSelling === "true") q = q.eq("top_selling", true);

  const { data, error } = await q;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data ?? []);
});

app.get(`${BASE}/products/:id`, async (c) => {
  const sb = getAdmin();
  const { data, error } = await sb.from(TABLE).select("*").eq("id", c.req.param("id")).single();
  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

app.post(`${BASE}/products`, async (c) => {
  const sb = getAdmin();
  const body = await c.req.json();
  const { data, error } = await sb.from(TABLE).insert(toSnake(body)).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

app.patch(`${BASE}/products/:id`, async (c) => {
  const sb = getAdmin();
  const body = await c.req.json();
  const { data, error } = await sb.from(TABLE).update(toSnake(body)).eq("id", c.req.param("id")).select().single();
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.delete(`${BASE}/products/:id`, async (c) => {
  const sb = getAdmin();
  const { error } = await sb.from(TABLE).delete().eq("id", c.req.param("id"));
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ─── Storage: product image upload ────────────────────────────────────────────
app.post(`${BASE}/upload-url`, async (c) => {
  const sb = getAdmin();
  const { filename } = await c.req.json();
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await sb.storage.from("product-images").createSignedUploadUrl(path);
  if (error) return c.json({ error: error.message }, 500);
  const { data: { publicUrl } } = sb.storage.from("product-images").getPublicUrl(path);
  return c.json({ signedUrl: data.signedUrl, path, publicUrl });
});

app.delete(`${BASE}/image`, async (c) => {
  const sb = getAdmin();
  const { path } = await c.req.json();
  const { error } = await sb.storage.from("product-images").remove([path]);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// ─── Storage: custom order file upload ────────────────────────────────────────
app.post(`${BASE}/custom-order-url`, async (c) => {
  const sb = getAdmin();
  const { filename } = await c.req.json();
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `orders/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await sb.storage.from("custom-orders").createSignedUploadUrl(path);
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ signedUrl: data.signedUrl, path });
});

// ─── Seed sample products ─────────────────────────────────────────────────────
// Accept both GET and POST so it works from admin UI and direct browser calls
app.get(`${BASE}/seed`, async (c) => handler_seed(c));
app.post(`${BASE}/seed`, async (c) => handler_seed(c));

async function handler_seed(c: any) {
  const sb = getAdmin();

  const U = (id: string, w = 800, h = 1000) =>
    `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

  const seed = [
    // ── HOME DECORS: Pots ──────────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000001",
      name: "Geometric Planter Pod",
      description: "Minimalist faceted planter with a sealed drainage tray. Ideal for succulents, cacti, or small herbs. Printed in matte PLA with a smooth satin interior coat.",
      price: 24.99, price_rs: 4500,
      category: "pots", finish: "matte-pla", type: "pre-printed",
      stock: 14, weight_grams: 280, rating: 4.8, reviews: 32, print_hours: 6, top_selling: true,
      images: [U("1730267252256-67bee55353e8"), U("1730267245087-5c7b159e2ddc")],
    },
    {
      id: "00000000-0000-0000-0001-000000000009",
      name: "Botanical Vase Trio",
      description: "Set of three organic-form bud vases in silk PLA. Silk sheen finish, watertight sealed base. Makes a stunning centrepiece or windowsill display.",
      price: 19.99, price_rs: 3600,
      category: "pots", finish: "silk-pla", type: "pre-printed",
      stock: 9, weight_grams: 240, rating: 4.5, reviews: 44, print_hours: 8, top_selling: false,
      images: [U("1595154590878-2447aa53bde1")],
    },
    {
      id: "00000000-0000-0000-0001-000000000010",
      name: "Ripple Pot — Large",
      description: "Oversized wavy-textured planter for medium tropical plants. The ripple pattern hides layer lines beautifully. Available in matte white or charcoal.",
      price: 32.00, price_rs: 5750,
      category: "pots", finish: "matte-pla", type: "pre-printed",
      stock: 6, weight_grams: 420, rating: 4.7, reviews: 21, print_hours: 11, top_selling: false,
      images: [U("1588880695641-0440eaff4df0")],
    },
    // ── HOME DECORS: Wall Arts ─────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000004",
      name: "Hex Panel Wall Art",
      description: "Modular hexagonal wall panel — mount solo or tile together for a statement wall. Clicks together without tools. Available in matte white or bone.",
      price: 42.00, price_rs: 7500,
      category: "wall-arts", finish: "matte-pla", type: "pre-printed",
      stock: 5, weight_grams: 450, rating: 4.6, reviews: 19, print_hours: 18, top_selling: true,
      images: [U("1515155075601-23009d0cb6d4"), U("1524351543168-8e38787614e9")],
    },
    {
      id: "00000000-0000-0000-0001-000000000011",
      name: "Voronoi Wall Panel",
      description: "Organic Voronoi lattice wall panel — casts beautiful shadow patterns when lit. Printed in one piece, wall-mount hardware included.",
      price: 38.00, price_rs: 6800,
      category: "wall-arts", finish: "matte-pla", type: "pre-printed",
      stock: 8, weight_grams: 390, rating: 4.7, reviews: 15, print_hours: 14, top_selling: false,
      images: [U("1566041490977-9d5a61e22c01")],
    },
    // ── HOME DECORS: Ornaments ──────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000012",
      name: "Crescent Moon Ornament",
      description: "Silk-finish crescent moon ornament with twine hanger. Perfect for windows, nurseries, or as a festive decoration.",
      price: 9.99, price_rs: 1800,
      category: "ornaments", finish: "silk-pla", type: "pre-printed",
      stock: 22, weight_grams: 60, rating: 4.9, reviews: 73, print_hours: 2, top_selling: true,
      images: [U("1603513492128-ba7bc65b814a")],
    },
    {
      id: "00000000-0000-0000-0001-000000000013",
      name: "Geometric Terrarium Stand",
      description: "Geodesic sphere stand for glass orb terrariums. Stable three-point base, printed in black matte PLA.",
      price: 14.99, price_rs: 2700,
      category: "ornaments", finish: "matte-pla", type: "pre-printed",
      stock: 11, weight_grams: 120, rating: 4.5, reviews: 28, print_hours: 4, top_selling: false,
      images: [U("1416339684178-3a239570f315")],
    },
    // ── HOME DECORS: Custom ────────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000003",
      name: "Custom Name Tag — Serif",
      description: "Made-to-order nameplate in your choice of filament color. Perfect for desks, doors, and gifting. Serif font, precision-printed.",
      price: 12.99, price_rs: 2300,
      category: "custom", finish: "matte-pla", type: "pod",
      filament_color_id: "f-white", grams_per_unit: 28, max_chars: 20,
      weight_grams: 80, rating: 4.7, reviews: 124, print_hours: 2, top_selling: true,
      images: [U("1742745063996-8d74bacb8a9e"), U("1588883819938-de362db62aa3")],
    },
    {
      id: "00000000-0000-0000-0001-000000000008",
      name: "Custom Door Number",
      description: "House number or family name printed to order. UV-resistant coating. Clean modern font — your address, your style.",
      price: 18.99, price_rs: 3400,
      category: "custom", finish: "matte-pla", type: "pod",
      filament_color_id: "f-green", grams_per_unit: 55, max_chars: 24,
      weight_grams: 160, rating: 4.6, reviews: 66, print_hours: 3, top_selling: false,
      images: [U("1588883819938-de362db62aa3")],
    },
    // ── FIGURINES: Action Figures ──────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000002",
      name: "Dynamic Warrior Figure",
      description: "Highly detailed action figure in a dynamic battle pose. Hand-painted finish with weathering effects. 18cm tall.",
      price: 34.99, price_rs: 6200,
      category: "action-figures", finish: "painted", type: "pre-printed",
      stock: 7, weight_grams: 320, rating: 4.9, reviews: 58, print_hours: 14, top_selling: true,
      images: [U("1776736851933-4a2ece025ec5"), U("1630412612770-dc85fccc79d5")],
    },
    {
      id: "00000000-0000-0000-0001-000000000014",
      name: "Samurai Oni Warrior",
      description: "Ornate samurai figure with Oni mask, katana, and layered armour details. Printed at 0.1mm resolution, hand-painted.",
      price: 39.99, price_rs: 7100,
      category: "action-figures", finish: "painted", type: "pre-printed",
      stock: 4, weight_grams: 360, rating: 4.8, reviews: 34, print_hours: 16, top_selling: true,
      images: [U("1612404730178-db58d5b23e3f")],
    },
    // ── FIGURINES: Statues ────────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000005",
      name: "Darth Vader Bust",
      description: "Iconic Darth Vader bust, precision-printed at 0.1mm resolution and hand-finished with a matte black coat. 15cm tall.",
      price: 28.99, price_rs: 5200,
      category: "statues", finish: "painted", type: "pre-printed",
      stock: 12, weight_grams: 380, rating: 4.9, reviews: 87, print_hours: 10, top_selling: true,
      images: [U("1638429489654-9d298ecfe49f"), U("1674271895767-d06559f81f1e")],
    },
    {
      id: "00000000-0000-0000-0001-000000000015",
      name: "Greek Torso Sculpture",
      description: "Museum-quality reproduction of a classical Greek torso. Printed in resin for ultra-fine surface detail, hand-sanded.",
      price: 48.00, price_rs: 8500,
      category: "statues", finish: "resin", type: "pre-printed",
      stock: 3, weight_grams: 560, rating: 4.8, reviews: 12, print_hours: 20, top_selling: false,
      images: [U("1605296867424-35fc25c9212a")],
    },
    // ── FIGURINES: Light Boxes ────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000007",
      name: "Jungle Diorama Light Box",
      description: "Layered LED light box with a lush jungle scene. USB-C powered, three brightness levels. Resin-printed layers catch the light beautifully.",
      price: 54.99, price_rs: 9800,
      category: "light-boxes", finish: "resin", type: "pre-printed",
      stock: 4, weight_grams: 520, rating: 4.8, reviews: 23, print_hours: 22, top_selling: true,
      images: [U("1483959651481-dc75b89291f1")],
    },
    {
      id: "00000000-0000-0000-0001-000000000016",
      name: "Mountain Sunset Light Box",
      description: "Tiered mountain silhouette light box with warm LED backlight. Powered via USB-C, sits on a bamboo base.",
      price: 49.99, price_rs: 8900,
      category: "light-boxes", finish: "resin", type: "pre-printed",
      stock: 6, weight_grams: 480, rating: 4.7, reviews: 18, print_hours: 19, top_selling: false,
      images: [U("1500534314209-a25ddb2bd429")],
    },
    // ── 3D PRINT: Filament ────────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000018",
      name: "Matte PLA 1kg — Bamboo Green",
      description: "Premium matte PLA in auraform's signature bamboo green. 1.75mm diameter, consistent extrusion, low warp. Ideal for home decor prints.",
      price: 22.00, price_rs: 3900,
      category: "filament", finish: "matte-pla", type: "pre-printed",
      stock: 30, weight_grams: 1100, rating: 4.8, reviews: 15, print_hours: 0, top_selling: false,
      images: [U("1644936580583-91eb0c32c3db")],
    },
    {
      id: "00000000-0000-0000-0001-000000000019",
      name: "Silk PLA 1kg — Gold",
      description: "High-gloss silk PLA in metallic gold. Achieves a mirror-like sheen straight from the printer.",
      price: 26.00, price_rs: 4600,
      category: "filament", finish: "silk-pla", type: "pre-printed",
      stock: 18, weight_grams: 1100, rating: 4.7, reviews: 9, print_hours: 0, top_selling: false,
      images: [U("1644936580583-91eb0c32c3db")],
    },
    // ── 3D PRINT: Nozzles ─────────────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000020",
      name: "Brass Nozzle Set — 0.4mm",
      description: "Pack of 5 precision brass nozzles, 0.4mm. Compatible with MK3S+, Bambu, Ender-3.",
      price: 8.99, price_rs: 1600,
      category: "nozzles", finish: "matte-pla", type: "pre-printed",
      stock: 40, weight_grams: 50, rating: 4.6, reviews: 27, print_hours: 0, top_selling: false,
      images: [U("1544817297-fa5c3a573e7a")],
    },
    {
      id: "00000000-0000-0000-0001-000000000021",
      name: "Hardened Steel Nozzle — 0.4mm",
      description: "Single hardened steel nozzle rated for abrasive filaments — carbon fibre, glow-in-dark, and wood-fill composites.",
      price: 12.99, price_rs: 2300,
      category: "nozzles", finish: "matte-pla", type: "pre-printed",
      stock: 22, weight_grams: 15, rating: 4.9, reviews: 19, print_hours: 0, top_selling: false,
      images: [U("1544817297-fa5c3a573e7a")],
    },
    // ── 3D PRINT: Parts & Spares ──────────────────────────────────────────
    {
      id: "00000000-0000-0000-0001-000000000022",
      name: "Bowden PTFE Tube — 1m",
      description: "1-metre premium PTFE tube, 2mm ID / 4mm OD. Compatible with all standard push-fit fittings.",
      price: 5.99, price_rs: 1050,
      category: "parts", finish: "matte-pla", type: "pre-printed",
      stock: 35, weight_grams: 40, rating: 4.5, reviews: 11, print_hours: 0, top_selling: false,
      images: [U("1644936580583-91eb0c32c3db")],
    },
    {
      id: "00000000-0000-0000-0001-000000000023",
      name: "Bed Spring Levelling Kit",
      description: "4-piece silicone bed levelling column kit. Ender-3 / CR-10 fitment. Consistent first-layer adhesion.",
      price: 6.99, price_rs: 1250,
      category: "parts", finish: "matte-pla", type: "pre-printed",
      stock: 28, weight_grams: 30, rating: 4.7, reviews: 33, print_hours: 0, top_selling: false,
      images: [U("1544817297-fa5c3a573e7a")],
    },
  ];

  const { error } = await sb.from(TABLE).upsert(seed, { onConflict: "id" });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true, count: seed.length, message: `${seed.length} products seeded successfully.` });
}

// ─── camelCase → snake_case for product writes ────────────────────────────────
function toSnake(body: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    priceRs: "price_rs",
    filamentColorId: "filament_color_id",
    gramsPerUnit: "grams_per_unit",
    maxChars: "max_chars",
    weightGrams: "weight_grams",
    printHours: "print_hours",
    topSelling: "top_selling",
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    out[map[k] ?? k] = v;
  }
  return out;
}

Deno.serve(app.fetch);
