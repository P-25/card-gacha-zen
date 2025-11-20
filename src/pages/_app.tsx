import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Cinzel, Manrope } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${cinzel.variable} ${manrope.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}
