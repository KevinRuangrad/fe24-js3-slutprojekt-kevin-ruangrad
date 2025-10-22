import { Country, CountryResponse } from "./types";

const BASE_URL = "https://restcountries.com/v3.1";

// Cache for all countries to avoid multiple API calls
let allCountriesCache: Country[] | null = null;

export async function fetchAllCountries(): Promise<Country[]> {
    if (allCountriesCache) {
        return allCountriesCache;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/all?fields=name,capital,region,flags,cca3`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const countries: Country[] = await response.json();
        allCountriesCache = countries.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );
        return allCountriesCache;
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
