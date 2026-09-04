/** A restrained nod to a printer's registration mark — used in place of a generic dot cluster. */
function RegistrationMark({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <path d="M12 0.5V6.5M12 17.5V23.5M0.5 12H6.5M17.5 12H23.5" stroke="currentColor" strokeWidth="1.4" opacity="0.9" />
    </svg>
  );
}

export function Logo({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const light = tone === "light";
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <RegistrationMark size={30} className={light ? "mb-2 text-accent" : "mb-2 text-primary"} />
      <div className="text-center">
        <span
          className={`font-display block text-2xl font-semibold tracking-tight sm:text-3xl ${
            light ? "text-white" : "text-navy"
          }`}
        >
          Metroprint
        </span>
        <div className="mt-0.5 flex items-center justify-center gap-2">
          <span className={`h-px w-6 ${light ? "bg-white/25" : "bg-border"}`} />
          <span
            className={`text-[11px] font-bold uppercase tracking-[0.28em] sm:text-xs ${
              light ? "text-accent" : "text-accent-ink"
            }`}
          >
            Marketing
          </span>
          <span className={`h-px w-6 ${light ? "bg-white/25" : "bg-border"}`} />
        </div>
      </div>
    </div>
  );
}

export function LogoCompact({
  className = "",
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RegistrationMark size={20} className={tone === "dark" ? "text-primary" : "text-accent"} />
      <span
        className={`font-display text-lg font-semibold tracking-tight ${
          tone === "dark" ? "text-navy" : "text-white"
        }`}
      >
        Metroprint <span className="font-normal text-accent">Marketing</span>
      </span>
    </div>
  );
}
