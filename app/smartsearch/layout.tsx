"use client"

import { ReactNode } from 'react';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import FloatingDockComponent from './_components/floatingDockComponent';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4">
        <FloatingDockComponent />
        <div className='flex-grow'>{children}</div>
      </main>
    </div>
  );
}
