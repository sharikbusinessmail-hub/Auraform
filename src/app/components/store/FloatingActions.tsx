import { useState } from "react";
import { X } from "lucide-react";
import { openWhatsApp } from "../../lib/api";

// ─── Sample links — replace with your real handles later ──────────────────────
const INSTAGRAM_URL = "https://instagram.com/auraform.lk";
const TIKTOK_URL = "https://tiktok.com/@auraform.lk";

const threads = [
  {
    label: "Product enquiry",
    message:
      "Hi auraform.lk! 👋 I have a question about one of your products.",
  },
  {
    label: "Track an order",
    message:
      "Hi auraform.lk! I'd like to check the status of my order please.",
  },
  {
    label: "Need help",
    message: "Hi auraform.lk! I need some help please.",
  },
];

function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function FloatingActions() {
  const [chatOpen, setChatOpen] = useState(false);

  const startThread = (message: string) => {
    openWhatsApp(message);
    setChatOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* WhatsApp chat prompt panel */}
      {chatOpen && (
        <div
          className="w-[290px] overflow-hidden rounded-[16px] border border-[#1f2a24] bg-[#0e1613] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#25D366]">
              <span className="h-2 w-2 rounded-full bg-[#25D366]" />
              Live • auraform.lk
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/50 transition hover:text-white"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Greeting */}
          <p className="px-5 pb-4 pt-1 text-[14px] leading-[1.5] text-white/85">
            Hi — how can we help? Choose a thread to start on WhatsApp.
          </p>

          {/* Threads */}
          <div className="space-y-2.5 px-4 pb-5">
            {threads.map((t) => (
              <button
                key={t.label}
                onClick={() => startThread(t.message)}
                className="flex w-full items-center gap-3 rounded-[10px] bg-[#182420] px-4 py-3.5 text-left text-[14px] font-medium text-white transition hover:bg-[#20322b]"
              >
                <span className="text-[#25D366]">✦</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instagram */}
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Instagram"
        className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition hover:scale-110"
        style={{ background: "linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888)" }}
      >
        <InstagramIcon />
      </a>

      {/* TikTok */}
      <a
        href={TIKTOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="TikTok"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-black shadow-lg transition hover:scale-110"
      >
        <TikTokIcon />
      </a>

      {/* WhatsApp — opens chat prompt */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        title="Chat on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-110 hover:bg-[#20bd5a]"
      >
        {chatOpen ? <X size={24} color="white" /> : <WhatsAppIcon />}
      </button>
    </div>
  );
}
