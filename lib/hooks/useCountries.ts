"use client";

import {
    useQuery,
    useInfiniteQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    fetchAllCountries,
    fetchCountriesWithFilters,
    getUniqueRegions,
    fetchUnsplashImages,
    fetchWikipediaSummary,
} from "../api";

// Query keys for consistent caching
export const QUERY_KEYS = {
    allCountries: ["countries", "all"] as const,
    countriesWithFilters: (page: number, query: string, region: string) =>
        ["countries", "filtered", { page, query, region }] as const,
    regions: ["regions"] as const,
    unsplashImages: (query: string, count: number) =>
        ["unsplash", query, count] as const,
    wikipediaSummary: (countryName: string) =>
        ["wikipedia", countryName] as const,
} as const;

// Hook for fetching all countries
export function useAllCountries() {
    return useQuery({
        queryKey: QUERY_KEYS.allCountries,
        queryFn: fetchAllCountries,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

// Hook for fetching countries with filters and pagination
export function useCountriesWithFilters(
    page: number = 1,
    pageSize: number = 10,
    query: string = "",
    region: string = ""
) {
    return useQuery({
        queryKey: QUERY_KEYS.countriesWithFilters(page, query, region),
        queryFn: () => fetchCountriesWithFilters(page, pageSize, query, region),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        // Keep previous data while fetching new
        placeholderData: (previousData) => previousData,
    });
}

// Hook for infinite scroll/pagination
export function useInfiniteCountries(
    pageSize: number = 10,
    query: string = "",
    region: string = ""
) {
    return useInfiniteQuery({
        queryKey: ["countries", "infinite", { query, region, pageSize }],
        queryFn: ({ pageParam = 1 }) =>
            fetchCountriesWithFilters(pageParam, pageSize, query, region),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.totalPages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    });
}

// Hook for fetching unique regions
export function useRegions() {
    return useQuery({
        queryKey: QUERY_KEYS.regions,
        queryFn: getUniqueRegions,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

// Hook for fetching Unsplash images
export function useUnsplashImages(query: string, count: number = 6) {
    return useQuery({
        queryKey: QUERY_KEYS.unsplashImages(query, count),
        queryFn: () => fetchUnsplashImages(query, count),
        enabled: !!query, // Only run if query exists
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 2 * 60 * 60 * 1000, // 2 hours
    });
}

// Hook for fetching Wikipedia summary
export function useWikipediaSummary(countryName: string) {
    return useQuery({
        queryKey: QUERY_KEYS.wikipediaSummary(countryName),
        queryFn: () => fetchWikipediaSummary(countryName),
        enabled: !!countryName, // Only run if countryName exists
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}

// Hook for prefetching country data
export function usePrefetchCountry() {
    const queryClient = useQueryClient();

    return (countryCode: string) => {
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.wikipediaSummary(countryCode),
            queryFn: () => fetchWikipediaSummary(countryCode),
            staleTime: 24 * 60 * 60 * 1000,
        });
    };
}
