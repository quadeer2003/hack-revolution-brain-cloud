import type { Metadata } from "next";
import "./globals.css";
import {GeistMono} from "geist/font/mono"
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "@liveblocks/react-ui/styles.css";
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern"
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
            <AnimatedGridPattern
      // numSquares={90}
      maxOpacity={0.2}
      duration={3}
      repeatDelay={1}
      height={200}
      width={200}
      numSquares={290}
      className={cn(
      "absolute inset-0 w-full h-full",
      "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
      "inset-x-0 inset-y-[-40%] h-[200%] skew-y-12",
      )}
      />

             <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
