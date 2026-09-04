"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Code2 } from "lucide-react";
import type { OptionField, OptionsSchema } from "@/lib/types";

const TYPES: OptionField["type"][] = ["select", "radio", "text", "textarea"];
const inputClass =
  "w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

function slugifyName(label: string) {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/**
 * Form editor for a product's `options_schema.fields`, with an advanced raw-JSON
 * mode. `onChange` fires with the full schema on every edit.
 */
export function OptionsSchemaEditor({
  value,
  onChange,
}: {
  value: OptionsSchema;
  onChange: (schema: OptionsSchema) => void;
}) {
  const [mode, setMode] = useState<"form" | "json">("form");
  const [json, setJson] = useState(() => JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = useState("");

  const fields = value.fields ?? [];

  const update = (next: OptionField[]) => onChange({ fields: next });
  const patchField = (i: number, patch: Partial<OptionField>) =>
    update(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  const remove = (i: number) => update(fields.filter((_, idx) => idx !== i));
  const add = () =>
    update([
      ...fields,
      { name: `option_${fields.length + 1}`, label: "New Option", type: "select", options: [], required: true },
    ]);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.fields)) throw new Error("must be { fields: [...] }");
      setJsonError("");
      onChange(parsed);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface/40 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-navy">Product options ({fields.length})</span>
        <button
          type="button"
          onClick={() => {
            if (mode === "form") setJson(JSON.stringify(value, null, 2));
            setMode(mode === "form" ? "json" : "form");
          }}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-navy"
        >
          <Code2 size={13} /> {mode === "form" ? "Advanced JSON" : "Back to form"}
        </button>
      </div>

      {mode === "json" ? (
        <div>
          <textarea
            rows={14}
            spellCheck={false}
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className={`${inputClass} font-mono text-xs`}
          />
          {jsonError && <p className="mt-1 text-xs text-red-600">{jsonError}</p>}
          <button
            type="button"
            onClick={applyJson}
            className="mt-2 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90"
          >
            Apply JSON
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.length === 0 && (
            <p className="text-xs text-muted">No options — customers just pick a quantity / add to cart.</p>
          )}
          {fields.map((f, i) => {
            const hasChoices = f.type === "select" || f.type === "radio";
            return (
              <div key={i} className="rounded-lg border border-border bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted">#{i + 1}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted hover:bg-surface disabled:opacity-30">
                      <ArrowUp size={13} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === fields.length - 1} className="rounded p-1 text-muted hover:bg-surface disabled:opacity-30">
                      <ArrowDown size={13} />
                    </button>
                    <button type="button" onClick={() => remove(i)} className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-[10px] uppercase text-muted">Label</span>
                    <input
                      className={inputClass}
                      value={f.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        patchField(i, { label });
                      }}
                      onBlur={(e) => {
                        if (!f.name || /^option_\d+$/.test(f.name)) {
                          const n = slugifyName(e.target.value);
                          if (n) patchField(i, { name: n });
                        }
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase text-muted">Field name</span>
                    <input
                      className={`${inputClass} font-mono`}
                      value={f.name}
                      onChange={(e) => patchField(i, { name: slugifyName(e.target.value) || e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase text-muted">Type</span>
                    <select
                      className={inputClass}
                      value={f.type}
                      onChange={(e) => patchField(i, { type: e.target.value as OptionField["type"] })}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {hasChoices && (
                  <label className="mt-2 block">
                    <span className="text-[10px] uppercase text-muted">Choices (one per line)</span>
                    <textarea
                      rows={3}
                      className={`${inputClass} text-xs`}
                      value={(f.options ?? []).join("\n")}
                      onChange={(e) =>
                        patchField(i, {
                          options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </label>
                )}
                {!hasChoices && (
                  <label className="mt-2 block">
                    <span className="text-[10px] uppercase text-muted">Placeholder</span>
                    <input
                      className={inputClass}
                      value={f.placeholder ?? ""}
                      onChange={(e) => patchField(i, { placeholder: e.target.value || undefined })}
                    />
                  </label>
                )}
                <label className="mt-2 flex items-center gap-2 text-xs text-navy">
                  <input
                    type="checkbox"
                    checked={f.required ?? false}
                    onChange={(e) => patchField(i, { required: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-border"
                  />
                  Required
                </label>
              </div>
            );
          })}
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-navy"
          >
            <Plus size={13} /> Add option
          </button>
        </div>
      )}
    </div>
  );
}
