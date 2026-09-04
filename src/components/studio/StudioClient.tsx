"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type Konva from "konva";
import {
  Undo2, Redo2, Eye, EyeOff, ImagePlus, Type, PaintBucket, Ruler,
  ZoomIn, ZoomOut, Maximize, ChevronLeft, Check, AlertTriangle, Trash2,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, Loader2,
} from "lucide-react";
import { resolvePrintSpec, type ResolvedPrintSpec } from "@/lib/studio/print-specs";
import {
  newDesign, preflight, layerDpi, ratingForDpi, toCartRef,
  type StudioDesign, type SideKey, type SideDesign, type Layer, type ArtworkLayer,
} from "@/lib/studio/design";
import {
  readStudioIntent, clearStudioIntent, readStudioEditState, clearStudioEditState,
  setStudioResult, type StudioIntent,
} from "@/lib/studio/handoff";
import { LogoCompact } from "@/components/layout/Logo";

const StudioCanvas = dynamic(() => import("@/components/studio/StudioCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">
      <Loader2 className="mr-2 animate-spin" size={16} /> Loading canvas…
    </div>
  ),
});

interface ProductLite {
  slug: string;
  title: string;
  category: string;
  image_url: string | null;
  print_specs: Record<string, unknown>;
}

type Action =
  | { type: "set"; design: StudioDesign }
  | { type: "addLayer"; side: SideKey; layer: Layer }
  | { type: "updateLayer"; side: SideKey; index: number; patch: Partial<Layer> }
  | { type: "removeLayer"; side: SideKey; index: number }
  | { type: "setBackground"; side: SideKey; background: string }
  | { type: "ack"; ids: string[] };

function sideOf(d: StudioDesign, s: SideKey): SideDesign {
  return s === "front" ? d.front : (d.back as SideDesign);
}
function withSide(d: StudioDesign, s: SideKey, next: SideDesign): StudioDesign {
  return s === "front" ? { ...d, front: next } : { ...d, back: next };
}

function reducer(state: StudioDesign, action: Action): StudioDesign {
  const stamp = (d: StudioDesign): StudioDesign => ({ ...d, updatedAt: new Date().toISOString() });
  switch (action.type) {
    case "set":
      return action.design;
    case "addLayer": {
      const sd = sideOf(state, action.side);
      return stamp(withSide(state, action.side, { ...sd, layers: [...sd.layers, action.layer] }));
    }
    case "updateLayer": {
      const sd = sideOf(state, action.side);
      const layers = sd.layers.map((l, i) =>
        i === action.index ? ({ ...l, ...action.patch } as Layer) : l,
      );
      return stamp(withSide(state, action.side, { ...sd, layers }));
    }
    case "removeLayer": {
      const sd = sideOf(state, action.side);
      return stamp(withSide(state, action.side, {
        ...sd, layers: sd.layers.filter((_, i) => i !== action.index),
      }));
    }
    case "setBackground": {
      const sd = sideOf(state, action.side);
      return stamp(withSide(state, action.side, { ...sd, background: action.background }));
    }
    case "ack":
      return { ...state, acknowledgedWarnings: [...new Set([...(state.acknowledgedWarnings ?? []), ...action.ids])] };
    default:
      return state;
  }
}

const BG_SWATCHES = ["#ffffff", "#0f172a", "#f1f5f9", "#111827", "#1d4ed8", "#dc2626", "#16a34a", "#f59e0b"];
const TEXT_COLORS = ["#0f172a", "#ffffff", "#1d4ed8", "#dc2626", "#16a34a", "#f59e0b", "#7c3aed"];

export function StudioClient({
  product,
  sizeOptions,
  sidesOptions,
}: {
  product: ProductLite;
  sizeOptions: string[];
  sidesOptions: string[];
}) {
  const router = useRouter();
  const [intent, setIntent] = useState<StudioIntent | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] ?? "");
  const [selectedSides, setSelectedSides] = useState<string>("");

  const doubleSided = (() => {
    if (product.slug.startsWith("business-cards")) return true;
    if (selectedSides) return /both|front\s*\+?\s*back|double|2/i.test(selectedSides);
    // No explicit choice yet: default to double-sided only if the product has no single-sided option.
    const hasSingle = sidesOptions.some((o) => /single|one\s*side|1/i.test(o));
    const hasDouble = sidesOptions.some((o) => /both|double|2|front\s*\+?\s*back/i.test(o));
    return hasDouble && !hasSingle;
  })();

  const spec: ResolvedPrintSpec = useMemo(
    () =>
      resolvePrintSpec({
        slug: product.slug,
        category: product.category,
        override: product.print_specs,
        selectedSize,
        sidesHint: doubleSided ? 2 : 1,
      }),
    [product, selectedSize, doubleSided],
  );

  const [design, dispatch] = useReducer(reducer, undefined as unknown as StudioDesign, () =>
    newDesign(product.slug, spec, {}),
  );

  // history
  const past = useRef<StudioDesign[]>([]);
  const future = useRef<StudioDesign[]>([]);
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const commit = useCallback(
    (action: Action) => {
      past.current = [...past.current.slice(-49), design];
      future.current = [];
      dispatch(action);
      forceRerender();
    },
    [design],
  );
  const undo = () => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current = [design, ...future.current].slice(0, 50);
    dispatch({ type: "set", design: prev });
    forceRerender();
  };
  const redo = () => {
    const next = future.current.shift();
    if (!next) return;
    past.current = [...past.current, design];
    dispatch({ type: "set", design: next });
    forceRerender();
  };

  // hydrate from intent / edit state (once)
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const edit = readStudioEditState(product.slug);
    const it = readStudioIntent();
    if (it?.slug === product.slug) setIntent(it);
    if (it?.selectedOptions?.size && sizeOptions.includes(it.selectedOptions.size)) {
      setSelectedSize(it.selectedOptions.size);
    }
    const sidesVal = it?.selectedOptions?.sides ?? it?.selectedOptions?.printed_sides;
    if (sidesVal) setSelectedSides(sidesVal);
    if (edit && edit.productSlug === product.slug) {
      dispatch({ type: "set", design: edit });
      clearStudioEditState(product.slug);
    } else {
      dispatch({
        type: "set",
        design: newDesign(product.slug, spec, it?.selectedOptions ?? {}),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep spec/sides fresh when size changes
  useEffect(() => {
    if (!hydrated.current) return;
    dispatch({
      type: "set",
      design: {
        ...design,
        spec,
        selectedOptions: { ...design.selectedOptions, ...(selectedSize ? { size: selectedSize } : {}) },
        back: spec.sides === 2 ? (design.back ?? { background: "#ffffff", layers: [] }) : null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.width, spec.height, spec.sides]);

  const [side, setSide] = useState<SideKey>("front");
  const [selected, setSelected] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [preview, setPreview] = useState(false);
  const [guides, setGuides] = useState(true);
  const [panel, setPanel] = useState<"uploads" | "text" | "background" | "size">("uploads");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const stageRef = useRef<Konva.Stage | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => setSelected(null), [side]);

  const activeSide = sideOf(design, side);
  const warnings = useMemo(() => preflight(design), [design]);
  const blocking = warnings.filter(
    (w) => w.level === "error" && !(design.acknowledgedWarnings ?? []).includes(w.id),
  );

  // ---- uploads ----
  const handleFiles = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("upload_id", `studio-${design.productSlug}`);
      fd.append("files", file);
      const res = await fetch("/api/upload-artwork", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const uploaded = data.files?.[0] as { name: string; url: string } | undefined;
      if (!uploaded) throw new Error("Upload failed");

      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        const im = new window.Image();
        im.onload = () => resolve({ w: im.naturalWidth, h: im.naturalHeight });
        im.onerror = () => resolve({ w: 1000, h: 1000 });
        im.src = uploaded.url;
      });

      // fit to cover the bleed box while keeping aspect ratio
      const ar = dims.w / dims.h;
      const boardAr = spec.bleedWidth / spec.bleedHeight;
      let w = spec.bleedWidth;
      let h = spec.bleedHeight;
      if (ar > boardAr) h = w / ar;
      else w = h * ar;
      const layer: ArtworkLayer = {
        kind: "image",
        url: uploaded.url,
        name: uploaded.name,
        naturalWidth: dims.w,
        naturalHeight: dims.h,
        x: (spec.bleedWidth - w) / 2,
        y: (spec.bleedHeight - h) / 2,
        width: w,
        height: h,
        rotation: 0,
      };
      commit({ type: "addLayer", side, layer });
      setSelected(activeSide.layers.length);
      setPanel("uploads");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---- layer ops ----
  const patchSelected = (patch: Partial<Layer>) => {
    if (selected == null) return;
    commit({ type: "updateLayer", side, index: selected, patch });
  };
  const selLayer = selected != null ? activeSide.layers[selected] : null;

  const fitImage = (mode: "fit" | "fill") => {
    if (!selLayer || selLayer.kind !== "image") return;
    const ar = selLayer.naturalWidth / selLayer.naturalHeight;
    const boardAr = spec.bleedWidth / spec.bleedHeight;
    let w: number, h: number;
    if ((mode === "fit") === ar > boardAr) {
      w = spec.bleedWidth;
      h = w / ar;
    } else {
      h = spec.bleedHeight;
      w = h * ar;
    }
    patchSelected({
      width: w, height: h, rotation: 0,
      x: (spec.bleedWidth - w) / 2, y: (spec.bleedHeight - h) / 2,
    } as Partial<Layer>);
  };
  const centerH = () => selLayer && patchSelected({ x: (spec.bleedWidth - (selLayer as ArtworkLayer).width) / 2 } as Partial<Layer>);
  const centerV = () => selLayer && patchSelected({ y: (spec.bleedHeight - (selLayer as ArtworkLayer).height) / 2 } as Partial<Layer>);

  const addText = () => {
    const layer: Layer = {
      kind: "text",
      text: "Your text",
      x: spec.bleed + spec.safeMargin + 0.1,
      y: spec.bleedHeight / 2 - 0.3,
      fontSize: 24,
      fill: "#0f172a",
      bold: false,
      align: "left",
      width: spec.width - spec.safeMargin * 2,
      rotation: 0,
    };
    commit({ type: "addLayer", side, layer });
    setSelected(activeSide.layers.length);
    setPanel("text");
  };

  // ---- done ----
  const finish = async () => {
    if (blocking.length) return;
    setSaving(true);
    let thumb: string | null = product.image_url ?? null;
    try {
      if (stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 0.6, mimeType: "image/jpeg", quality: 0.72 });
        // Upload the preview so we never store base64 in the cart / order.
        const blob = await (await fetch(dataUrl)).blob();
        const fd = new FormData();
        fd.append("upload_id", `studio-preview-${design.productSlug}`);
        fd.append("files", new File([blob], "design-preview.jpg", { type: "image/jpeg" }));
        const res = await fetch("/api/upload-artwork", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          thumb = data.files?.[0]?.url ?? thumb;
        } else {
          thumb = dataUrl; // fallback: keep it local for this session only
        }
      }
    } catch {
      /* tainted canvas or upload failure — fall back to product image */
    }
    const approved: StudioDesign = { ...design, spec, approvedAt: new Date().toISOString() };
    setStudioResult({
      slug: product.slug,
      design: approved,
      thumbnailUrl: thumb,
      cartItemId: intent?.cartItemId,
    });
    void toCartRef; // ref shape is rebuilt on the receiving page
    clearStudioIntent();
    const back = intent?.returnTo || `/products/${product.slug}`;
    router.push(back);
  };

  const dpiBadge = (l: ArtworkLayer) => {
    const dpi = layerDpi(l);
    const r = ratingForDpi(dpi);
    return (
      <span
        className={
          "rounded px-1.5 py-0.5 text-[10px] font-bold " +
          (r === "good" ? "bg-green-100 text-green-700" : r === "warn" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")
        }
      >
        ~{dpi} DPI
      </span>
    );
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-100 text-navy">
      {/* top bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-white px-3 py-2 sm:gap-3 sm:px-4">
        <button
          onClick={() => router.push(intent?.returnTo || `/products/${product.slug}`)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-surface"
        >
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Exit</span>
        </button>
        <div className="hidden sm:block"><LogoCompact tone="dark" /></div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{product.title}</p>
          <p className="truncate text-[11px] text-muted">
            Design Studio · {spec.label ?? `${spec.width}×${spec.height} ${spec.unit}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!past.current.length} className="rounded-lg p-2 text-muted hover:bg-surface disabled:opacity-30" aria-label="Undo"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={!future.current.length} className="rounded-lg p-2 text-muted hover:bg-surface disabled:opacity-30" aria-label="Redo"><Redo2 size={16} /></button>
          <button onClick={() => setPreview((p) => !p)} className={"flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium " + (preview ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface")}>
            {preview ? <EyeOff size={15} /> : <Eye size={15} />} <span className="hidden md:inline">Preview</span>
          </button>
          <button
            onClick={finish}
            disabled={saving || blocking.length > 0}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Done
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* left rail */}
        <nav className="flex shrink-0 flex-col items-center gap-1 border-r border-border bg-white py-2">
          {([
            ["uploads", ImagePlus, "Upload"],
            ["text", Type, "Text"],
            ["background", PaintBucket, "Fill"],
            ["size", Ruler, "Size"],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setPanel(key)}
              className={"flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium " + (panel === key ? "bg-primary/10 text-primary" : "text-muted hover:bg-surface")}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        {/* left panel */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-white p-4 md:block">
          {panel === "uploads" && (
            <div>
              <h2 className="text-sm font-bold">Upload artwork</h2>
              <label className="mt-3 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border bg-surface px-3 py-6 text-center hover:border-primary">
                {uploading ? <Loader2 className="animate-spin text-primary" size={20} /> : <ImagePlus className="text-muted" size={20} />}
                <span className="mt-2 text-xs font-medium">{uploading ? "Uploading…" : "Click or drop a file"}</span>
                <span className="mt-1 text-[11px] text-muted">PNG, JPG, PDF · 25 MB</span>
                <input type="file" accept="image/png,image/jpeg,application/pdf" className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
              </label>
              {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
              <ul className="mt-3 space-y-1.5">
                {activeSide.layers.map((l, i) =>
                  l.kind === "image" ? (
                    <li key={i}>
                      <button
                        onClick={() => setSelected(i)}
                        className={"flex w-full items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-left text-xs " + (selected === i ? "border-primary bg-primary/5" : "border-border hover:bg-surface")}
                      >
                        <span className="truncate">{l.name}</span>
                        {dpiBadge(l)}
                      </button>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          )}
          {panel === "text" && (
            <div>
              <h2 className="text-sm font-bold">Text</h2>
              <button onClick={addText} className="mt-3 w-full rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy/90">+ Add text</button>
              {selLayer?.kind === "text" && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={selLayer.text}
                    onChange={(e) => patchSelected({ text: e.target.value } as Partial<Layer>)}
                    rows={2}
                    className="w-full rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                  <label className="block text-xs font-medium">Size: {selLayer.fontSize}pt
                    <input type="range" min={8} max={96} value={selLayer.fontSize} onChange={(e) => patchSelected({ fontSize: Number(e.target.value) } as Partial<Layer>)} className="mt-1 w-full" />
                  </label>
                  <div className="flex gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button key={c} onClick={() => patchSelected({ fill: c } as Partial<Layer>)} className={"h-6 w-6 rounded-full border " + (selLayer.fill === c ? "ring-2 ring-primary ring-offset-1" : "border-border")} style={{ background: c }} aria-label={c} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => patchSelected({ bold: !selLayer.bold } as Partial<Layer>)} className={"rounded px-2 py-1 text-xs font-bold " + (selLayer.bold ? "bg-navy text-white" : "bg-surface")}>B</button>
                    {(["left", "center", "right"] as const).map((a) => (
                      <button key={a} onClick={() => patchSelected({ align: a } as Partial<Layer>)} className={"rounded px-2 py-1 text-xs capitalize " + (selLayer.align === a ? "bg-navy text-white" : "bg-surface")}>{a}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {panel === "background" && (
            <div>
              <h2 className="text-sm font-bold">Background — {side}</h2>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {BG_SWATCHES.map((c) => (
                  <button key={c} onClick={() => commit({ type: "setBackground", side, background: c })} className={"h-10 rounded-lg border " + (activeSide.background === c ? "ring-2 ring-primary" : "border-border")} style={{ background: c }} aria-label={c} />
                ))}
              </div>
              <button
                onClick={() => commit({ type: "setBackground", side, background: "transparent" })}
                className={"mt-2 w-full rounded-lg border px-3 py-2 text-xs font-medium " + (activeSide.background === "transparent" ? "border-primary bg-primary/5 text-primary" : "border-border")}
              >
                Transparent
              </button>
              <input type="color" value={activeSide.background.startsWith("#") ? activeSide.background : "#ffffff"} onChange={(e) => commit({ type: "setBackground", side, background: e.target.value })} className="mt-2 h-9 w-full rounded-lg border border-border" />
            </div>
          )}
          {panel === "size" && (
            <div>
              <h2 className="text-sm font-bold">Size &amp; sides</h2>
              {sizeOptions.length > 0 ? (
                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="mt-3 w-full rounded-lg border border-border px-2 py-2 text-sm">
                  {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p className="mt-2 text-xs text-muted">Fixed size: {spec.label}</p>
              )}
              <dl className="mt-4 space-y-1 text-xs text-muted">
                <div className="flex justify-between"><dt>Trim</dt><dd>{spec.width} × {spec.height} {spec.unit}</dd></div>
                <div className="flex justify-between"><dt>Bleed</dt><dd>{spec.bleed} {spec.unit}</dd></div>
                <div className="flex justify-between"><dt>Safe margin</dt><dd>{spec.safeMargin} {spec.unit}</dd></div>
                <div className="flex justify-between"><dt>Sides</dt><dd>{spec.sides === 2 ? "Front + Back" : "Front only"}</dd></div>
              </dl>
              <label className="mt-4 flex items-center gap-2 text-xs font-medium">
                <input type="checkbox" checked={guides} onChange={(e) => setGuides(e.target.checked)} /> Show print guides
              </label>
            </div>
          )}
        </aside>

        {/* canvas */}
        <main className="relative min-w-0 flex-1">
          <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
            <StudioCanvas
              spec={spec}
              side={activeSide}
              showGuides={guides}
              preview={preview}
              zoom={zoom}
              selectedIndex={selected}
              onSelect={setSelected}
              onChangeLayer={(i, patch) => commit({ type: "updateLayer", side, index: i, patch })}
              containerSize={containerSize}
              onStage={(s) => (stageRef.current = s)}
            />
          </div>

          {/* guide legend */}
          {!preview && guides && (
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-lg bg-white/90 p-2 text-[10px] shadow-sm">
              <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-red-500" /> Bleed</span>
              <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t-2 border-navy" /> Trim</span>
              <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-blue-600" /> Safe area</span>
            </div>
          )}

          {/* front/back */}
          {spec.sides === 2 && (
            <div className="absolute right-3 top-3 flex overflow-hidden rounded-lg border border-border bg-white text-xs font-semibold shadow-sm">
              {(["front", "back"] as SideKey[]).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={"px-3 py-1.5 capitalize " + (side === s ? "bg-primary text-white" : "text-muted hover:bg-surface")}>{s}</button>
              ))}
            </div>
          )}

          {/* zoom */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-white px-2 py-1 shadow-sm">
            <button onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.15).toFixed(2)))} className="rounded p-1.5 hover:bg-surface" aria-label="Zoom out"><ZoomOut size={15} /></button>
            <span className="w-12 text-center text-xs font-medium">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(4, +(z + 0.15).toFixed(2)))} className="rounded p-1.5 hover:bg-surface" aria-label="Zoom in"><ZoomIn size={15} /></button>
            <button onClick={() => setZoom(1)} className="rounded p-1.5 hover:bg-surface" aria-label="Fit"><Maximize size={15} /></button>
          </div>

          {/* mobile: preflight strip + tool sheet */}
          <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-2 md:hidden">
            {warnings.length > 0 && (
              <div className="mx-3 max-w-full rounded-lg bg-white/95 px-3 py-1.5 text-[11px] shadow-sm">
                <span className={blocking.length ? "font-semibold text-red-600" : "font-semibold text-amber-700"}>
                  {blocking.length ? "⚠ " + blocking[0].message : "⚠ " + warnings[0].message}
                </span>
                {blocking.length > 0 && (
                  <button onClick={() => commit({ type: "ack", ids: blocking.map((b) => b.id) })} className="ml-2 font-bold underline">OK, continue</button>
                )}
              </div>
            )}
            <div className="flex justify-center gap-2">
              <label className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white shadow">
                <ImagePlus size={14} /> Upload
                <input type="file" accept="image/png,image/jpeg,application/pdf" className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
              </label>
              <button onClick={addText} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold shadow"><Type size={14} /> Text</button>
              {selLayer && (
                <button onClick={() => { commit({ type: "removeLayer", side, index: selected! }); setSelected(null); }} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow"><Trash2 size={14} /></button>
              )}
            </div>
          </div>
        </main>

        {/* right panel — selection + preflight */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-border bg-white p-4 lg:block">
          {selLayer ? (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold capitalize">{selLayer.kind} layer</h2>
                <button onClick={() => { commit({ type: "removeLayer", side, index: selected! }); setSelected(null); }} className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete layer"><Trash2 size={15} /></button>
              </div>
              {selLayer.kind === "image" && (
                <>
                  <div className="mt-2">{dpiBadge(selLayer)}</div>
                  <label className="mt-3 block text-xs font-medium">Scale
                    <input
                      type="range" min={10} max={200}
                      value={Math.round((selLayer.width / spec.bleedWidth) * 100)}
                      onChange={(e) => {
                        const f = Number(e.target.value) / 100;
                        const w = spec.bleedWidth * f;
                        const ar = selLayer.width / selLayer.height;
                        patchSelected({ width: w, height: w / ar } as Partial<Layer>);
                      }}
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className="mt-2 block text-xs font-medium">Rotation: {Math.round(selLayer.rotation)}°
                    <input type="range" min={-180} max={180} value={selLayer.rotation} onChange={(e) => patchSelected({ rotation: Number(e.target.value) } as Partial<Layer>)} className="mt-1 w-full" />
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
                    <button onClick={() => fitImage("fit")} className="rounded-lg border border-border py-1.5 hover:bg-surface">Fit</button>
                    <button onClick={() => fitImage("fill")} className="rounded-lg border border-border py-1.5 hover:bg-surface">Fill</button>
                    <button onClick={centerH} className="flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 hover:bg-surface"><AlignHorizontalJustifyCenter size={13} /> Center</button>
                    <button onClick={centerV} className="flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 hover:bg-surface"><AlignVerticalJustifyCenter size={13} /> Middle</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">Select a layer to edit it, or add artwork from the left.</p>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
              <AlertTriangle size={13} /> Pre-flight
            </h3>
            {warnings.length === 0 ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-green-700"><Check size={13} /> Looks print-ready</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {warnings.map((w) => (
                  <li key={w.id} className={"rounded-lg px-2 py-1.5 text-[11px] " + (w.level === "error" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800")}>
                    <span className="font-semibold capitalize">{w.side}:</span> {w.message}
                    {w.level === "error" && (
                      <button onClick={() => commit({ type: "ack", ids: [w.id] })} className="mt-1 block text-[10px] font-bold underline">Acknowledge &amp; continue anyway</button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
