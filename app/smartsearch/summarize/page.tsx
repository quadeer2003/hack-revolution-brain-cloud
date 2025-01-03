"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

function Summarize() {
  const searchParams = useSearchParams();
  const content = searchParams?.get("summary");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl px-6 py-8 bg-white shadow-lg rounded-xl dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Summarized Content
        </h1>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {content || "No summary available. Please provide a valid input."}
        </p>
      </div>
    </div>
  );
}

export default Summarize;
