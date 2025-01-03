"use client"
import Navbar from "./_components/navbar";
import "../globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider";
export default function landing({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div>
        <main>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar/>
          {children}
        </ThemeProvider>
        </main>
      </div>
    );
  }
  