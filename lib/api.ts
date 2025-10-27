import {
    Country,
    CountryResponse,
    UnsplashImage,
    WikipediaSummary,
} from "./types";

const BASE_URL = "https://restcountries.com/v3.1";

// Enhanced cache with TTL (Time To Live)
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class ApiCache {
    private cache = new Map<string, CacheEntry<unknown>>();

    set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlSeconds * 1000,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if cache has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    clear(): void {
        this.cache.clear();
    }
}

const apiCache = new ApiCache();

export async function fetchAllCountries(): Promise<Country[]> {
    const cacheKey = "all-countries";
    const cached = apiCache.get<Country[]>(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/all?fields=name,capital,region,flags,cca3`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const countries: Country[] = await response.json();
        const sortedCountries = countries.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        // Cache for 24 hours (86400 seconds)
        apiCache.set(cacheKey, sortedCountries, 86400);
        return sortedCountries;
    } catch (error) {
        console.error("Error fetching countries:", error);
        throw error;
    }
}

export async function fetchCountriesWithFilters(
    page: number = 1,
    pageSize: number = 10,
    query: string = "",
    region: string = ""
): Promise<CountryResponse> {
    try {
        const allCountries = await fetchAllCountries();

        let filteredCountries = allCountries;

        // Filter by region if specified
        if (region && region !== "all") {
            filteredCountries = filteredCountries.filter(
                (country) =>
                    country.region.toLowerCase() === region.toLowerCase()
            );
        }

        // Filter by search query if specified
        if (query.trim()) {
            filteredCountries = filteredCountries.filter(
                (country) =>
                    country.name.common
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                    country.region
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                    (country.capital &&
                        country.capital.some((cap) =>
                            cap.toLowerCase().includes(query.toLowerCase())
                        ))
            );
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCountries = filteredCountries.slice(
            startIndex,
            endIndex
        );
        const totalPages = Math.ceil(filteredCountries.length / pageSize);

        return {
            countries: paginatedCountries,
            total: filteredCountries.length,
            page,
            limit: pageSize,
            totalPages,
        };
    } catch (error) {
        console.error("Error fetching countries with filters:", error);
        throw error;
    }
}

// Get unique regions for filter dropdown
export async function getUniqueRegions(): Promise<string[]> {
    try {
        const allCountries = await fetchAllCountries();
        const regions = [
            ...new Set(allCountries.map((country) => country.region)),
        ];
        return regions.sort();
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}

// Legacy functions for backward compatibility
export async function fetchCountriesPaginated(
    page: number = 1
): Promise<CountryResponse> {
    return fetchCountriesWithFilters(page, 10, "", "");
}

export async function searchCountries(
    query: string,
    page: number = 1
): Promise<CountryResponse> {
    return fetchCountriesWithFilters(page, 10, query, "");
}

// Unsplash API functions
export async function fetchUnsplashImages(
    query: string,
    count: number = 6
): Promise<UnsplashImage[]> {
    const cacheKey = `unsplash-${query}-${count}`;
    const cached = apiCache.get<UnsplashImage[]>(cacheKey);

    if (cached) {
        return cached;
    }

    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;

        if (!accessKey) {
            console.error("UNSPLASH_ACCESS_KEY is not configured");
            return [];
        }

        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                query
            )}&per_page=${count}&orientation=landscape`,
            {
                headers: {
                    Authorization: `Client-ID ${accessKey}`,
                },
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch images from Unsplash");
        }

        const data = await response.json();
        // Cache for 1 hour (3600 seconds)
        apiCache.set(cacheKey, data.results, 3600);
        return data.results;
    } catch (error) {
        console.error("Error fetching Unsplash images:", error);
        return [];
    }
}

// Wikipedia API functions
export async function fetchWikipediaSummary(
    countryName: string
): Promise<WikipediaSummary | null> {
    const cacheKey = `wikipedia-${countryName}`;
    const cached = apiCache.get<WikipediaSummary | null>(cacheKey);

    if (cached !== null) {
        return cached;
    }

    try {
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
                countryName
            )}`,
            {
                next: { revalidate: 86400 }, // Cache for 24 hours
            }
        );

        if (!response.ok) {
            // Cache null result for 1 hour to avoid repeated failed requests
            apiCache.set(cacheKey, null, 3600);
            return null;
        }

        const data = await response.json();
        const summary = {
            title: data.title,
            extract: data.extract,
            content_urls: data.content_urls,
        };

        // Cache for 24 hours (86400 seconds)
        apiCache.set(cacheKey, summary, 86400);
        return summary;
    } catch (error) {
        console.error("Error fetching Wikipedia summary:", error);
        // Cache null result for 1 hour to avoid repeated failed requests
        apiCache.set(cacheKey, null, 3600);
        return null;
    }
}
