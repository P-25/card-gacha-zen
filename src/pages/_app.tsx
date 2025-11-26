import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

import ReduxProvider from "@/components/ReduxProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider>
      <div className={`${quicksand.className} ${quicksand.variable}`}>
        <Component {...pageProps} />
      </div>
    </ReduxProvider>
  );
}
