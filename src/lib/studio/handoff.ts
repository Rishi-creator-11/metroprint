"use client";

import type { StudioDesign } from "@/lib/studio/design";

/**
 * Lightweight sessionStorage bridge between the product page, the studio route
 * and the cart. Kept out of the URL so large design state never hits query
 * strings, and out of localStorage so it doesn't linger.
 */

const INTENT_KEY = "mp-studio-intent";
const RESULT_PREFIX = "mp-studio-result:";
const EDIT_PREFIX = "mp-studio-edit:";

export interface StudioIntent {
  slug: string;
  selectedOptions: Record<string, string>;
  /** Where to return after the studio ("pdp" href or "cart"). */
  returnTo: string;
  /** Set when editing an existing cart line. */
  cartItemId?: string;
}

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode / quota — studio still works, just no handoff */
  }
}
function safeRemove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function setStudioIntent(intent: StudioIntent) {
  safeSet(INTENT_KEY, JSON.stringify(intent));
}
export function readStudioIntent(): StudioIntent | null {
  const raw = safeGet(INTENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudioIntent;
  } catch {
    return null;
  }
}
export function clearStudioIntent() {
  safeRemove(INTENT_KEY);
}

/** Full design to load into the editor when editing an existing cart line. */
export function setStudioEditState(slug: string, design: StudioDesign) {
  safeSet(EDIT_PREFIX + slug, JSON.stringify(design));
}
export function readStudioEditState(slug: string): StudioDesign | null {
  const raw = safeGet(EDIT_PREFIX + slug);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudioDesign;
  } catch {
    return null;
  }
}
export function clearStudioEditState(slug: string) {
  safeRemove(EDIT_PREFIX + slug);
}

export interface StudioResult {
  slug: string;
  design: StudioDesign;
  thumbnailUrl: string | null;
  cartItemId?: string;
}

export function setStudioResult(result: StudioResult) {
  safeSet(RESULT_PREFIX + result.slug, JSON.stringify(result));
}
export function readStudioResult(slug: string): StudioResult | null {
  const raw = safeGet(RESULT_PREFIX + slug);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudioResult;
  } catch {
    return null;
  }
}
export function clearStudioResult(slug: string) {
  safeRemove(RESULT_PREFIX + slug);
}
