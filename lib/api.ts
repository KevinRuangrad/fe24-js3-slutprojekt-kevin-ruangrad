import {
    Country,
    CountryResponse,
    UnsplashImage,
    WikipediaSummary,
} from "./types";

const BASE_URL = "https://restcountries.com/v3.1";

// Fetch all countries with caching strategy
export async function fetchAllCountries(): Promise<Country[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/all?fields=name,capital,region,flags,cca3`,
            {
                next: { revalidate: 86400 }, // Cache for 24 hours
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const countries: Country[] = await response.json();
        const sortedCountries = countries.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        return sortedCountries;
    } catch (error) {
        console.error("Error fetching countries:", error);
        throw error;
    }
}

// Advanced filtering with pagination for large datasets
export async function fetchCountriesWithFilters(
    page: number = 1,
    pageSize: number = 10,
    query: string = "",
    region: string = ""
): Promise<CountryResponse> {
    try {
        const allCountries = await fetchAllCountries();

        let filteredCountries = allCountries;

        // Apply region filter with case-insensitive matching
        if (region && region !== "all") {
            filteredCountries = filteredCountries.filter(
                (country) =>
                    country.region.toLowerCase() === region.toLowerCase()
            );
        }

        // Multi-field search across name, region, and capital
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

        // Calculate pagination bounds and return structured response
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

// Extract unique regions for dropdown filtering
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

// Unsplash API integration with error handling and fallbacks
export async function fetchUnsplashImages(
    query: string,
    count: number = 6
): Promise<UnsplashImage[]> {
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
        return data.results;
    } catch (error) {
        console.error("Error fetching Unsplash images:", error);
        return [];
    }
}

// Wikipedia API integration for country information
export async function fetchWikipediaSummary(
    countryName: string
): Promise<WikipediaSummary | null> {
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
            return null;
        }

        const data = await response.json();
        const summary = {
            title: data.title,
            extract: data.extract,
            content_urls: data.content_urls,
        };

        return summary;
    } catch (error) {
        console.error("Error fetching Wikipedia summary:", error);
        return null;
    }
}
