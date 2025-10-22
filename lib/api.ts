import { Country, CountryResponse } from "./types";

const BASE_URL = "https://restcountries.com/v3.1";
const COUNTRIES_PER_PAGE = 10;

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

export async function fetchCountriesPaginated(
    page: number = 1
): Promise<CountryResponse> {
    try {
        const allCountries = await fetchAllCountries();
        const startIndex = (page - 1) * COUNTRIES_PER_PAGE;
        const endIndex = startIndex + COUNTRIES_PER_PAGE;

        const paginatedCountries = allCountries.slice(startIndex, endIndex);
        const totalPages = Math.ceil(allCountries.length / COUNTRIES_PER_PAGE);

        return {
            countries: paginatedCountries,
            total: allCountries.length,
            page,
            limit: COUNTRIES_PER_PAGE,
            totalPages,
        };
    } catch (error) {
        console.error("Error fetching paginated countries:", error);
        throw error;
    }
}

export async function searchCountries(
    query: string,
    page: number = 1
): Promise<CountryResponse> {
    try {
        const allCountries = await fetchAllCountries();

        const filteredCountries = allCountries.filter(
            (country) =>
                country.name.common
                    .toLowerCase()
                    .includes(query.toLowerCase()) ||
                country.region.toLowerCase().includes(query.toLowerCase()) ||
                (country.capital &&
                    country.capital.some((cap) =>
                        cap.toLowerCase().includes(query.toLowerCase())
                    ))
        );

        const startIndex = (page - 1) * COUNTRIES_PER_PAGE;
        const endIndex = startIndex + COUNTRIES_PER_PAGE;
        const paginatedCountries = filteredCountries.slice(
            startIndex,
            endIndex
        );
        const totalPages = Math.ceil(
            filteredCountries.length / COUNTRIES_PER_PAGE
        );

        return {
            countries: paginatedCountries,
            total: filteredCountries.length,
            page,
            limit: COUNTRIES_PER_PAGE,
            totalPages,
        };
    } catch (error) {
        console.error("Error searching countries:", error);
        throw error;
    }
}
