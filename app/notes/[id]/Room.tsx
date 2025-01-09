"use client";

import React, { useEffect, ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { MessageCircle } from "lucide-react";

interface RoomProps {
  children: ReactNode;
  roomId: string;
}

function ErrorFallback({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Liveblocks error:", error);
  }, [error]);

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
      <h2 className="text-red-700 dark:text-red-400 font-semibold mb-2 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Error loading discussion
      </h2>
      <pre className="text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap">
        {error.message}
      </pre>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse" />
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Room({ children, roomId }: RoomProps) {
  useEffect(() => {
    console.log("Room mounted with ID:", roomId);
  }, [roomId]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LiveblocksProvider publicApiKey="pk_prod_kTn1axwZr5AqVg6GoIkn1rBe00U5KlWKA6bheNhDia8MoOiPgQi2t1gZ-d7gyuIL">
        <RoomProvider
          id={roomId}
          initialPresence={{}}
        >
          <ClientSideSuspense fallback={<LoadingFallback />}>
            {() => children}
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  );
} 