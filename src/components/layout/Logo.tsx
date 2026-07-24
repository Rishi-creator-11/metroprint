export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="mb-2 flex gap-2">
        <span className="h-3 w-3 rounded-full bg-cyan-400" />
        <span className="h-3 w-3 rounded-full bg-fuchsia-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
      </div>
      <div className="text-center">
        <span className="block text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          METROPRINT
        </span>
        <div className="mt-0.5 flex items-center justify-center gap-2">
          <span className="h-0.5 w-6 bg-cyan-400" />
          <span className="text-lg font-semibold tracking-widest text-accent sm:text-xl">
            USA
          </span>
          <span className="h-0.5 w-6 bg-fuchsia-500" />
        </div>
      </div>
    </div>
  );
}

export function LogoCompact({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        MetroPrint <span className="font-normal text-accent">USA</span>
      </span>
    </div>
  );
}
