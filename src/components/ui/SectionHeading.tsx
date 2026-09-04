export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p
          className={`flex items-center gap-2 text-sm font-semibold ${
            dark ? "text-accent" : "text-primary"
          } ${align === "center" ? "justify-center" : ""}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-accent" : "bg-primary"}`} aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${dark ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base ${dark ? "text-white/70" : "text-muted"}`}>{subtitle}</p>
      )}
    </div>
  );
}
