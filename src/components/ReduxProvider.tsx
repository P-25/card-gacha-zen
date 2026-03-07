"use client";

import { Provider } from "react-redux";
import { store, hydrateStore } from "../store/store";
import { useEffect, useState } from "react";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Hydrate store on client mount
    hydrateStore();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return <Provider store={store}>{children}</Provider>;
}
