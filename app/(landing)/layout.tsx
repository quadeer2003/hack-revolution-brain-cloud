"use client"

import Navbar from "./_components/navbar";
import "../globals.css"
export default function landing({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <div>
        <main >
        
            <Navbar/>
          {children}
        </main>
      </div>
    );
  }