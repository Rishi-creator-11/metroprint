export function AnnouncementBar() {
  return (
    <div className="bg-navy text-white/90">
      <div className="mp-container flex items-center justify-center gap-x-3 py-1.5 text-center text-[11px] font-medium tracking-wide sm:gap-x-4 sm:text-xs">
        <span>Free design review on every order</span>
        <span className="hidden text-white/30 sm:inline" aria-hidden="true">
          &middot;
        </span>
        <span className="hidden sm:inline">Fast turnaround</span>
        <span className="hidden text-white/30 md:inline" aria-hidden="true">
          &middot;
        </span>
        <span className="hidden md:inline">Nationwide shipping</span>
      </div>
    </div>
  );
}
