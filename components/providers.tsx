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
                        // Data is fresh for 5 minutes
                        staleTime: 5 * 60 * 1000,
                        // Cache for 30 minutes
                        gcTime: 30 * 60 * 1000,
                        // Retry failed requests
                        retry: 2,
                        // Don't refetch on window focus for cached data
                        refetchOnWindowFocus: false,
                        // Don't refetch on reconnect if data is fresh
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
