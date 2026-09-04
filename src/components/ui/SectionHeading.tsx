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
        <p className={`text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-accent" : "text-primary"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${dark ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base ${dark ? "text-white/70" : "text-muted"}`}>{subtitle}</p>
      )}
    </div>
  );
}
