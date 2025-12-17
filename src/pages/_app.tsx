import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Luckiest_Guy } from "next/font/google";

const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  variable: "--font-luckiest-guy",
  weight: "400",
  display: "swap",
});

import ReduxProvider from "@/components/ReduxProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider>
      <Head>
        <title>EchoRift</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={`${luckiestGuy.className} ${luckiestGuy.variable}`}>
        <Component {...pageProps} />
      </div>
    </ReduxProvider>
  );
}
