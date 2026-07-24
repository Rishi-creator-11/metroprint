import { randomBytes } from "crypto";
import type { Order } from "./types";

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MP-${y}${m}${d}-${rand}`;
}

export function isInquiry(record: Pick<Order, "category">): boolean {
  return record.category === "Inquiry";
}

export function isPaidOrder(record: Pick<Order, "payment_status" | "category">): boolean {
  return record.payment_status === "paid" && !isInquiry(record);
}

export function generateAccessToken(): string {
  return randomBytes(24).toString("hex");
}
