import type { Metadata } from "next";
import "./globals.css";
import {GeistMono} from "geist/font/mono"
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";


export const metadata: Metadata = {
  title: "Brain Cloud",
  description: "A cloud storage for your brain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className= {GeistMono.className}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

             <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
