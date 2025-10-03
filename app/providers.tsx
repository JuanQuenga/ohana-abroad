"use client";
import { ReactNode, useMemo, useEffect } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { useAccessToken } from "@workos-inc/authkit-nextjs/components";

export function AppProviders({ children }: { children: ReactNode }) {
  const { getAccessToken } = useAccessToken();

  const convex = useMemo(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string),
    []
  );

  useEffect(() => {
    convex.setAuth(getAccessToken, (isAuthenticated) => {
      console.log("Auth status changed:", isAuthenticated);
    });
  }, [convex, getAccessToken]);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
