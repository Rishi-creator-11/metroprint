import { Suspense } from "react";
import AdminLoginForm from "./AdminLoginForm";

export const metadata = { title: "Admin sign in" };

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface">
          Loading...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
