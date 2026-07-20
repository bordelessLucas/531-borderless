"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerWithEmail, signInWithEmail, signInWithGoogle } from "@/features/auth/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/input";

function mapAuthError(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado. Faça login.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha inválidos.";
    case "auth/weak-password":
      return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/popup-closed-by-user":
      return "Login com Google cancelado.";
    case "auth/operation-not-allowed":
      return "Método de login desabilitado no Firebase Console (ative E-mail/Senha e Google).";
    default:
      return err instanceof Error ? err.message : "Não foi possível autenticar.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/conta";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { role } = await signInWithEmail(email, password);
      router.replace(role === "admin" || role === "operator" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setPending(true);
    setError(null);
    try {
      const { role } = await signInWithGoogle();
      router.replace(role === "admin" || role === "operator" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Acesse pedidos, bilhetes e o backoffice (staff).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-subtle">
        <span className="h-px flex-1 bg-surface-border" />
        ou
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={onGoogle}>
        Continuar com Google
      </Button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Não tem conta?{" "}
        <Link href="/registro" className="font-medium text-brand hover:underline">
          Criar conta
        </Link>
      </p>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { role } = await registerWithEmail({ name, email, password });
      router.replace(role === "admin" || role === "operator" ? "/admin" : "/conta");
      router.refresh();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setPending(true);
    setError(null);
    try {
      const { role } = await signInWithGoogle();
      router.replace(role === "admin" || role === "operator" ? "/admin" : "/conta");
      router.refresh();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Guarde seus pedidos e baixe bilhetes quando estiverem prontos.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field
          id="name"
          label="Nome"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando…" : "Criar conta"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-subtle">
        <span className="h-px flex-1 bg-surface-border" />
        ou
        <span className="h-px flex-1 bg-surface-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" disabled={pending} onClick={onGoogle}>
        Continuar com Google
      </Button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
