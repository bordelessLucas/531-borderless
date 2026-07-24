"use client";

import { useEffect, useState } from "react";

interface AdminDataState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Carrega dados do Firestore no browser. O admin roda 100% no client para
 * funcionar no Hosting estático, onde não há renderização no servidor.
 */
export function useAdminData<T>(loader: () => Promise<T>, key: string): AdminDataState<T> {
  const [state, setState] = useState<AdminDataState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null, isLoading: true });

    loader()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, isLoading: false });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          error: err instanceof Error ? err.message : "Erro ao carregar dados.",
          isLoading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
