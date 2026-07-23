export default async function handler(req, res) {
  // Pull your environment variables securely in the Vercel backend
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://ezbutwwaummegowbxwcr.supabase.co";
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // 1. Fetch only the IDs of all your products directly from Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products_af?select=id`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const products = await response.json();
    const baseUrl = 'https://auraformlk.store'';

    // 2. Build the XML map dynamically
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/custom-order</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Dynamic Product Pages -->
  ${products.map(p => `
  <url>
    <loc>${baseUrl}/product/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

    // 3. Send the XML to the browser/Googlebot
    res.setHeader('Content-Type', 'text/xml');
    
    // Cache the sitemap for 24 hours to keep your site blazing fast
    res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400, stale-while-revalidate');
    
    res.status(200).send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
}