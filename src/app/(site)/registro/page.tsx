import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="container py-16">
      <RegisterForm />
    </div>
  );
}
