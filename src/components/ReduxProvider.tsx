"use client";

import { Provider } from "react-redux";
import { store, hydrateStore } from "../store/store";
import { useEffect } from "react";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hydrate store on client mount
    hydrateStore();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
