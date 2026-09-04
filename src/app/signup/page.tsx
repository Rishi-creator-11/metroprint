import { Suspense } from "react";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
