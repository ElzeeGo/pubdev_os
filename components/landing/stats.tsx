export function Stats() {
  const stats = [
    {
      value: "540",
      label: "weekly",
      description: "npm downloads (and counting!).",
      company: "REAL DATA",
    },
    {
      value: "100%",
      label: "honest",
      description: "marketing. No fake numbers.",
      company: "REFRESHING",
    },
    {
      value: "3AM",
      label: "commits",
      description: "because sleep is optional.",
      company: "DEDICATION",
    },
    {
      value: "∞",
      label: "potential",
      description: "we're just getting started.",
      company: "AMBITIOUS",
    },
  ]

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm">
            <div className="text-3xl font-bold mb-2">
              {stat.value} <span className="text-muted-foreground text-lg font-normal">{stat.label}</span>
            </div>
            <div className="text-muted-foreground mb-4">{stat.description}</div>
            <div className="text-sm font-bold text-foreground">{stat.company}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

