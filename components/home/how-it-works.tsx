import { MousePointerClick, Upload, Factory, Truck } from "lucide-react"

const steps = [
  {
    icon: MousePointerClick,
    title: "Customize",
    description: "Pick a product and configure size, material, finish and quantity with live pricing.",
  },
  {
    icon: Upload,
    title: "Upload or design",
    description: "Upload your artwork or let our design team create it for you from a simple brief.",
  },
  {
    icon: Factory,
    title: "We produce",
    description: "Track every stage of production in real time, from proof approval to quality check.",
  },
  {
    icon: Truck,
    title: "Delivered",
    description: "Get your order delivered anywhere, with live tracking and easy one-click reorders.",
  },
]

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A seamless experience, end to end
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            From your first click to final delivery, EnterPrint keeps everything transparent and in one account.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="relative rounded-sm border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <span className="absolute right-5 top-5 font-serif text-3xl font-semibold text-border">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
