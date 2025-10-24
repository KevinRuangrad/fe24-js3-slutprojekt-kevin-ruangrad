import { DefaultSession } from "next-auth";

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

export interface WeatherData {
    name: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
        deg: number;
    };
    visibility: number;
    sys: {
        country: string;
        sunrise: number;
        sunset: number;
    };
}

export interface UnsplashImage {
    id: string;
    urls: {
        small: string;
        regular: string;
        full: string;
    };
    alt_description: string | null;
    description: string | null;
    user: {
        name: string;
        username: string;
        links: {
            html: string;
        };
    };
    links: {
        html: string;
    };
}

export interface WikipediaSummary {
    title: string;
    extract: string;
    content_urls: {
        desktop: {
            page: string;
        };
    };
}

// Extend NextAuth types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            savedCountries: string[];
        } & DefaultSession["user"];
    }

    interface JWT {
        id: string;
        savedCountries: string[];
    }
}
