import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="container py-16">
      <Suspense fallback={<div className="mx-auto h-80 max-w-md animate-pulse rounded-2xl bg-surface-subtle" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
