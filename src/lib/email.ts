import { Resend } from "resend";
import { formatPrice } from "@/lib/product-prices";
import { CONTACT_INFO, SITE_NAME } from "@/lib/constants";
import type { OrderStatus } from "@/lib/types";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || `${SITE_NAME} <onboarding@resend.dev>`;
}

function adminEmail() {
  return process.env.NOTIFICATION_EMAIL;
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number | null;
}) {
  const resend = getResend();
  if (!resend) return;

  const total =
    params.totalAmount != null ? formatPrice(params.totalAmount) : "See your account";

  await resend.emails.send({
    from: fromAddress(),
    to: params.to,
    subject: `Order confirmed — ${params.orderNumber}`,
    text: [
      `Hi ${params.customerName},`,
      "",
      `Thank you for your order with ${SITE_NAME}!`,
      "",
      `Order: ${params.orderNumber}`,
      `Total: ${total}`,
      "",
      "We'll start processing your order and email you when it's ready.",
      "",
      `— ${SITE_NAME}`,
    ].join("\n"),
  });
}

export async function sendAdminOrderNotification(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number | null;
}) {
  const resend = getResend();
  const to = adminEmail();
  if (!resend || !to) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const total =
    params.totalAmount != null ? formatPrice(params.totalAmount) : "—";

  await resend.emails.send({
    from: fromAddress(),
    to,
    subject: `New paid order — ${params.orderNumber}`,
    text: [
      "A new order has been paid.",
      "",
      `Order: ${params.orderNumber}`,
      `Customer: ${params.customerName}`,
      `Email: ${params.customerEmail}`,
      `Total: ${total}`,
      "",
      `View in admin: ${siteUrl}/admin/dashboard`,
    ].join("\n"),
  });
}

export async function sendInquiryNotification(params: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  const resend = getResend();
  const to = adminEmail();
  if (!resend || !to) return;

  await resend.emails.send({
    from: fromAddress(),
    to,
    replyTo: params.email,
    subject: `New quote inquiry from ${params.name}`,
    text: [
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      `Phone: ${params.phone || "—"}`,
      "",
      params.message,
    ].join("\n"),
  });
}

const STATUS_EMAIL_STATUSES: OrderStatus[] = ["processing", "completed", "cancelled"];

export async function sendOrderStatusUpdateEmail(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  productName: string;
  status: OrderStatus;
  isInquiry: boolean;
}) {
  if (!STATUS_EMAIL_STATUSES.includes(params.status)) return;

  const resend = getResend();
  if (!resend) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ref = params.orderNumber || "your request";

  let subject: string;
  let body: string[];

  if (params.isInquiry) {
    if (params.status === "completed") {
      subject = `Update on your quote inquiry — ${ref}`;
      body = [
        `Hi ${params.customerName},`,
        "",
        "We've reviewed your custom quote inquiry and marked it as completed.",
        "",
        "If you still have questions, reply to this email or contact us directly.",
        "",
        `— ${SITE_NAME}`,
        CONTACT_INFO.email,
      ];
    } else if (params.status === "cancelled") {
      subject = `Quote inquiry closed — ${ref}`;
      body = [
        `Hi ${params.customerName},`,
        "",
        "Your quote inquiry has been closed. If you'd like to start a new request, visit our website anytime.",
        "",
        `— ${SITE_NAME}`,
      ];
    } else {
      subject = `We're reviewing your inquiry — ${ref}`;
      body = [
        `Hi ${params.customerName},`,
        "",
        "We're now reviewing your custom quote inquiry and will follow up soon.",
        "",
        `— ${SITE_NAME}`,
      ];
    }
  } else if (params.status === "completed") {
    subject = `Your order is complete — ${ref}`;
    body = [
      `Hi ${params.customerName},`,
      "",
      `Good news! Your order ${ref} (${params.productName}) is complete.`,
      "",
      "If you have any questions about pickup or delivery, reply to this email.",
      "",
      `View your orders: ${siteUrl}/account`,
      "",
      `— ${SITE_NAME}`,
    ];
  } else if (params.status === "cancelled") {
    subject = `Order cancelled — ${ref}`;
    body = [
      `Hi ${params.customerName},`,
      "",
      `Your order ${ref} has been cancelled.`,
      "",
      "If this was a mistake or you have questions, please contact us.",
      "",
      CONTACT_INFO.email,
      "",
      `— ${SITE_NAME}`,
    ];
  } else {
    subject = `Order update — ${ref}`;
    body = [
      `Hi ${params.customerName},`,
      "",
      `Your order ${ref} (${params.productName}) is now being processed.`,
      "",
      `Track your orders: ${siteUrl}/account`,
      "",
      `— ${SITE_NAME}`,
    ];
  }

  await resend.emails.send({
    from: fromAddress(),
    to: params.to,
    subject,
    text: body.join("\n"),
  });
}
