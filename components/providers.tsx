"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { SavedCountriesProvider } from "@/lib/saved-countries-context";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Optimized caching strategy for API responses
                        staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
                        gcTime: 30 * 60 * 1000, // Cache for 30 minutes
                        retry: 2, // Retry failed requests twice
                        // Prevent unnecessary refetches on focus/reconnect
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SavedCountriesProvider>
                <QueryProvider>{children}</QueryProvider>
            </SavedCountriesProvider>
        </SessionProvider>
    );
}
