import { MessageSquare, Box, Printer } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "Share Your Vision",
    body: "Send us your 2D drawing, sketch, or reference photo — complete with dimensions and any additional details. No CAD skills needed.",
    image: "https://images.unsplash.com/photo-1611505982706-9ebc79e5d3f1?w=600&h=380&fit=crop&auto=format",
  },
  {
    num: "02",
    icon: Box,
    title: "Crafting the 3D Model",
    body: "Our designers build a precise 3D model from your reference and send you a rendered preview for approval before a single gram of filament is used.",
    image: "https://images.unsplash.com/photo-1609862776364-897efc7dafdb?w=600&h=380&fit=crop&auto=format",
  },
  {
    num: "03",
    icon: Printer,
    title: "Print & Deliver",
    body: "Once you approve the model, we print it in your chosen material, hand-finish it, and deliver island-wide across Sri Lanka.",
    image: "https://images.unsplash.com/photo-1644936580583-91eb0c32c3db?w=600&h=380&fit=crop&auto=format",
  },
];

export function ModelingServices({ onCustomOrder }: { onCustomOrder?: () => void }) {
  return (
    <section className="border-t border-border bg-white py-24">
      <div className="mx-auto max-w-[1400px] px-6">

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-accent" style={{ fontFamily: "var(--font-body)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
            Custom Design
          </div>
          <h2
            className="mt-4 text-[52px] tracking-tight text-foreground lg:text-[62px]"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            3D Modeling Services
          </h2>
          <p className="mt-2 text-[17px] font-medium text-accent" style={{ fontFamily: "var(--font-body)" }}>
            Transform Your Vision into Reality
          </p>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-[1.75] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            Bring your ideas to life with our expert 3D modeling services. Whether you have a concept sketch or a detailed 2D drawing, we specialize in turning your vision into a precise and detailed 3D model.
          </p>
        </div>

        {/* Process sub-header */}
        <div className="mb-10 text-center">
          <h3 className="text-[28px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Our Modeling Process
          </h3>
          <p className="mt-2 text-[14px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
            From concept to finished print in three steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="group relative overflow-hidden rounded-[6px] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Step badge */}
                <div
                  className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-bl-[6px] bg-accent text-white text-[13px] font-semibold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {idx + 1}
                </div>

                <div className="relative h-[200px] overflow-hidden bg-muted">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Icon size={24} strokeWidth={1.5} className="text-white opacity-90" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                    Step {step.num}
                  </div>
                  <h4 className="mt-2 text-[20px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                    {step.title}
                  </h4>
                  <p className="mt-3 text-[14px] leading-[1.7] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA strip */}
        <div className="mt-14 rounded-[8px] bg-secondary px-10 py-12">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-accent" style={{ fontFamily: "var(--font-body)" }}>
                Get started today
              </div>
              <h3 className="mt-3 text-[32px] text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
                Have something in mind?
              </h3>
              <p className="mt-3 max-w-md text-[15px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Share your idea and we will get back within 24 hours with a quote and timeline — no commitment needed.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <button
                onClick={onCustomOrder}
                className="rounded-[3px] bg-accent px-8 py-4 text-[12px] uppercase tracking-[0.2em] text-white transition hover:bg-accent/90"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Request a Quote →
              </button>
              <span className="text-[12px] text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
                Island-wide delivery · Fast turnaround
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
