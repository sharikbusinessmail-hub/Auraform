import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/api";

export function AdminAuth({ onEnter, onBack }: { onEnter: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-login if a valid Supabase session already exists
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        onEnter();
      }
    });
  }, [onEnter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    // This strictly asks Supabase to verify the credentials.
    // Fake passwords will immediately fail here.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });

    if (error) {
      setErr("Invalid login credentials."); // Shows error if fake email/password is used
    } else {
      onEnter(); // Only lets you in if Supabase says "Success"
    }
    
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[1fr_1fr]">
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1644936580583-91eb0c32c3db?w=1400&h=1800&fit=crop&auto=format"
          alt="3D printer in action"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="text-[11px] uppercase tracking-[0.28em] opacity-75" style={{ fontFamily: "var(--font-body)" }}>
            auraform.lk
          </div>
          <div className="mt-3 text-[34px] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            The studio console.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <button
            onClick={onBack}
            className="mb-12 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
            style={{ fontFamily: "var(--font-body)" }}
          >
            <ArrowLeft size={14} /> Back to storefront
          </button>

          <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            auraform.lk — Studio access
          </div>
          <h1 className="mt-3 text-[38px] tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Sign in.
          </h1>

          <form onSubmit={handleLogin} className="mt-12 space-y-6">
            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border-b border-border bg-transparent py-3 text-[15px] text-foreground outline-none focus:border-accent"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="mt-2 w-full border-b border-border bg-transparent py-3 text-[15px] text-foreground outline-none focus:border-accent"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
            {err && (
              <div className="text-[12px] text-red-500" style={{ fontFamily: "var(--font-body)" }}>{err}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-[3px] bg-accent py-4 text-[12px] uppercase tracking-[0.24em] text-white transition hover:bg-accent/90 disabled:opacity-50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {loading ? "Authenticating..." : "Enter the studio"}
            </button>
          </form>

          <div className="mt-8 font-mono text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
            Secure Supabase authentication active.
          </div>
        </div>
      </div>
    </div>
  );
}