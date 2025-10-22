export interface Country {
    name: {
        common: string;
        official: string;
    };
    capital?: string[];
    region: string;
    flags: {
        png: string;
        svg: string;
        alt?: string;
    };
    cca3: string; // 3-letter country code for unique identification
}

export interface CountryResponse {
    countries: Country[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
