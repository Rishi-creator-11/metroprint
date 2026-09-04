"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Loader2, Plus } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/ui/Toast";
import type { Category } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function AdminCategoryManager({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [list, setList] = useState(categories);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [adding, setAdding] = useState(false);

  const persisted = list.filter((c) => !c.id.startsWith("seed-cat-"));
  const seedOnly = list.some((c) => c.id.startsWith("seed-cat-"));

  const patch = async (id: string, body: Record<string, unknown>, optimistic: Partial<Category>) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...optimistic } : c)));
    setBusy(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...fromApi(data) } : c)));
      toast.success("Category updated");
      router.refresh();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Save failed";
      setMessage({ type: "err", text });
      toast.error(text);
    } finally {
      setBusy(null);
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= persisted.length) return;
    const a = persisted[index];
    const b = persisted[j];
    patch(a.id, { sort_order: b.sort_order }, { sort_order: b.sort_order });
    patch(b.id, { sort_order: a.sort_order }, { sort_order: a.sort_order });
  };

  return (
    <div className="mt-6 space-y-4">
      {seedOnly && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Showing built-in fallback categories — run migration 038 to make them editable.
        </p>
      )}
      {message && (
        <p className={`rounded-lg px-4 py-2 text-sm ${message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </p>
      )}

      <ul className="space-y-3">
        {persisted.map((c, i) => (
          <CategoryRow
            key={c.id}
            category={c}
            count={productCounts[c.name] ?? 0}
            busy={busy === c.id}
            first={i === 0}
            last={i === persisted.length - 1}
            onMove={(dir) => move(i, dir)}
            onSave={(body, optimistic) => patch(c.id, body, optimistic)}
          />
        ))}
      </ul>

      {persisted.length > 0 && (
        adding ? (
          <NewCategory
            onCancel={() => setAdding(false)}
            onCreated={(c) => {
              setAdding(false);
              setList((prev) => [...prev, c]);
              router.refresh();
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-navy"
          >
            <Plus size={15} /> New category
          </button>
        )
      )}
    </div>
  );
}

function fromApi(d: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  visible: boolean;
}): Category {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description ?? "",
    image_url: d.image_url ?? null,
    sort_order: d.sort_order,
    visible: d.visible,
  };
}

function CategoryRow({
  category,
  count,
  busy,
  first,
  last,
  onMove,
  onSave,
}: {
  category: Category;
  count: number;
  busy: boolean;
  first: boolean;
  last: boolean;
  onMove: (dir: -1 | 1) => void;
  onSave: (body: Record<string, unknown>, optimistic: Partial<Category>) => void;
}) {
  const [name, setName] = useState(category.name as string);
  const [description, setDescription] = useState(category.description);
  const [image, setImage] = useState(category.image_url ?? "");
  const dirty =
    name !== category.name ||
    description !== category.description ||
    image !== (category.image_url ?? "");

  return (
    <li className="rounded-xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col">
          <button type="button" onClick={() => onMove(-1)} disabled={first || busy} className="text-muted hover:text-navy disabled:opacity-30">
            <ArrowUp size={14} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={last || busy} className="text-muted hover:text-navy disabled:opacity-30">
            <ArrowDown size={14} />
          </button>
        </div>
        <input className={`${inputClass} max-w-xs`} value={name} onChange={(e) => setName(e.target.value)} />
        <span className="text-xs text-muted">{count} active product{count === 1 ? "" : "s"}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (
                category.visible &&
                !window.confirm(`Hide "${category.name}" from the storefront? Customers won't see this category until you make it visible again.`)
              )
                return;
              onSave({ visible: !category.visible }, { visible: !category.visible });
            }}
            disabled={busy}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
              category.visible ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {category.visible ? <Eye size={13} /> : <EyeOff size={13} />}
            {category.visible ? "Visible" : "Hidden"}
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase text-muted">Description</span>
          <textarea rows={2} className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <ImageUpload value={image} onChange={setImage} folder="categories" label="Tile image" />
      </div>

      {dirty && (
        <button
          type="button"
          onClick={() =>
            onSave(
              { name, description, image_url: image },
              { name, description, image_url: image || null },
            )
          }
          disabled={busy}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
        </button>
      )}
    </li>
  );
}

function NewCategory({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (c: Category) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image_url: image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      onCreated(fromApi(data));
      toast.success(`Category "${data.name}" created`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <h3 className="text-sm font-bold text-navy">New category</h3>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase text-muted">Name</span>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Signage" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase text-muted">Description</span>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div className="mt-3">
        <ImageUpload value={image} onChange={setImage} folder="categories" label="Tile image" />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={create}
          disabled={saving || !name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Create
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-muted hover:text-navy">
          Cancel
        </button>
      </div>
    </div>
  );
}
