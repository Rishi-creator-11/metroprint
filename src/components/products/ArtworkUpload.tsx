"use client";

import { useId, useMemo, useRef, useState, useEffect } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import {
  MAX_ARTWORK_FILES,
  type ArtworkFile,
  getArtworkAcceptAttribute,
} from "@/lib/artwork";
import { ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface ArtworkUploadProps {
  files: ArtworkFile[];
  onChange: (files: ArtworkFile[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  required?: boolean;
}

export function ArtworkUpload({
  files,
  onChange,
  onUploadingChange,
  label = "Upload Artwork / Design",
  required = false,
}: ArtworkUploadProps) {
  const inputId = useId();
  const uploadId = useMemo(() => crypto.randomUUID(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  const handleFiles = async (selected: FileList | null) => {
    if (!selected?.length) return;

    const remaining = MAX_ARTWORK_FILES - files.length;
    if (remaining <= 0) {
      setError(`You can attach up to ${MAX_ARTWORK_FILES} files.`);
      return;
    }

    const toUpload = Array.from(selected).slice(0, remaining);
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("upload_id", uploadId);
      for (const file of toUpload) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload-artwork", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onChange([...files, ...(data.files as ArtworkFile[])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeFile = (url: string) => {
    onChange(files.filter((f) => f.url !== url));
  };

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <p className="mb-2 text-xs text-muted">
        PDF, PNG, JPG, AI, PSD, EPS, or SVG — up to {MAX_ARTWORK_FILES} files, 25 MB each.
      </p>

      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface px-4 py-6 transition-colors hover:border-primary hover:bg-white"
      >
        {uploading ? (
          <Loader2 className="animate-spin text-primary" size={24} />
        ) : (
          <FileUp className="text-muted" size={24} />
        )}
        <span className="mt-2 text-sm font-medium text-navy">
          {uploading ? "Uploading..." : "Click to upload files"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {ACCEPTED_FILE_TYPES.join(", ")}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={getArtworkAcceptAttribute()}
          disabled={uploading || files.length >= MAX_ARTWORK_FILES}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file.url}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary hover:underline"
              >
                {file.name}
              </a>
              <button
                type="button"
                onClick={() => removeFile(file.url)}
                className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${file.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
