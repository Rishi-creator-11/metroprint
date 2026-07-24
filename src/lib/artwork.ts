import { ACCEPTED_FILE_TYPES } from "./constants";

export const MAX_ARTWORK_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
export const MAX_ARTWORK_FILES = 5;

export interface ArtworkFile {
  name: string;
  url: string;
}

export function getArtworkAcceptAttribute(): string {
  return ACCEPTED_FILE_TYPES.join(",");
}

export function validateArtworkFile(file: File): string | null {
  if (file.size > MAX_ARTWORK_FILE_SIZE) {
    return `${file.name} is too large (max 25 MB).`;
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ACCEPTED_FILE_TYPES.some((ext) => lowerName.endsWith(ext));
  if (!hasAllowedExt) {
    return `${file.name} is not a supported file type.`;
  }

  return null;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export function collectArtworkUrls(items: { artwork_files?: ArtworkFile[] }[]): string[] {
  const urls = new Set<string>();
  for (const item of items) {
    for (const file of item.artwork_files || []) {
      urls.add(file.url);
    }
  }
  return [...urls];
}
