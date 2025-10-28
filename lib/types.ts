import { z } from "zod";
import { DefaultSession } from "next-auth";

// Zod schemas
export const CountrySchema = z.object({
    name: z.object({
        common: z.string(),
        official: z.string(),
    }),
    capital: z.array(z.string()).optional(),
    region: z.string(),
    flags: z.object({
        png: z.string(),
        svg: z.string(),
        alt: z.string().optional(),
    }),
    cca3: z.string(),
});

export const CountryResponseSchema = z.object({
    countries: z.array(CountrySchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const WeatherDataSchema = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        feels_like: z.number(),
        temp_min: z.number(),
        temp_max: z.number(),
        pressure: z.number(),
        humidity: z.number(),
    }),
    weather: z.array(
        z.object({
            id: z.number(),
            main: z.string(),
            description: z.string(),
            icon: z.string(),
        })
    ),
    wind: z.object({
        speed: z.number(),
        deg: z.number(),
    }),
    visibility: z.number(),
    sys: z.object({
        country: z.string(),
        sunrise: z.number(),
        sunset: z.number(),
    }),
});

export const UnsplashImageSchema = z.object({
    id: z.string(),
    urls: z.object({
        small: z.string(),
        regular: z.string(),
        full: z.string(),
    }),
    alt_description: z.string().nullable(),
    description: z.string().nullable(),
    user: z.object({
        name: z.string(),
        username: z.string(),
        links: z.object({
            html: z.string(),
        }),
    }),
    links: z.object({
        html: z.string(),
    }),
});

export const WikipediaSummarySchema = z.object({
    title: z.string(),
    extract: z.string(),
    content_urls: z.object({
        desktop: z.object({
            page: z.string(),
        }),
    }),
});

export type Country = z.infer<typeof CountrySchema>;
export type CountryResponse = z.infer<typeof CountryResponseSchema>;
export type WeatherData = z.infer<typeof WeatherDataSchema>;
export type UnsplashImage = z.infer<typeof UnsplashImageSchema>;
export type WikipediaSummary = z.infer<typeof WikipediaSummarySchema>;

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
