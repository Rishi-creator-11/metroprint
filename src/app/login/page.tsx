import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
