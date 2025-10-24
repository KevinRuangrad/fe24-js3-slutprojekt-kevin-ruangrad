import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ExternalLink,
    Globe,
    MapPin,
    Users,
    Ruler,
    Languages,
    Coins,
    Flag,
    Thermometer,
    Eye,
    Wind,
    Droplets,
    Camera,
    BookOpen,
    Map,
} from "lucide-react";
import { WeatherData, UnsplashImage, WikipediaSummary } from "@/lib/types";
import { fetchUnsplashImages, fetchWikipediaSummary } from "@/lib/api";
import { ImageGallery } from "@/components/image-gallery";

interface CountryDetailPageProps {
    params: Promise<{
        code: string;
    }>;
}

async function getCountryByCode(code: string) {
    try {
        const response = await fetch(
            `https://restcountries.com/v3.1/alpha/${code}`,
            {
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            return null;
        }

        const countries = await response.json();
        return countries[0];
    } catch (error) {
        console.error("Error fetching country:", error);
        return null;
    }
}

async function getWeatherByCapital(
    capital: string
): Promise<WeatherData | null> {
    try {
        const apiKey = process.env.WEATHER_API_KEY;

        if (!apiKey) {
            console.error("WEATHER_API_KEY is not configured");
            return null;
        }

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`,
            {
                next: { revalidate: 1800 }, // Cache for 30 minutes
            }
        );

        if (!response.ok) {
            return null;
        }

        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
}

export default async function CountryDetailPage({
    params,
}: CountryDetailPageProps) {
    const { code } = await params;
    const country = await getCountryByCode(code);

    if (!country) {
        notFound();
    }

    const capital = country.capital ? country.capital[0] : "N/A";
    const population = country.population?.toLocaleString() || "N/A";
    const area = country.area ? `${country.area.toLocaleString()} km²` : "N/A";
    const languages = country.languages
        ? Object.values(country.languages).join(", ")
        : "N/A";
    const currencies = country.currencies
        ? Object.values(country.currencies as Record<string, { name: string }>)
              .map((currency) => currency.name)
              .join(", ")
        : "N/A";

    // Fetch weather data for the capital
    const weatherData =
        capital !== "N/A" ? await getWeatherByCapital(capital) : null;

    // Fetch images from Unsplash
    const unsplashImages: UnsplashImage[] = await fetchUnsplashImages(
        `${country.name.common} landscape`,
        6
    );

    // Fetch Wikipedia summary
    const wikipediaSummary: WikipediaSummary | null =
        await fetchWikipediaSummary(country.name.common);

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-6 mobile-header tablet-header">
                    <Link href="/">
                        <Button variant="outline" size="sm" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Countries
                        </Button>
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-center text-foreground mobile-title tablet-title">
                        {country.name.common}
                    </h1>
                    <p className="text-center text-muted-foreground mt-2 text-lg mobile-subtitle tablet-subtitle">
                        {country.name.official}
                    </p>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto tablet-detail-grid">
                    {/* Flag Card */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Flag className="w-6 h-6" />
                                Flag
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full h-64 rounded-md overflow-hidden">
                                <Image
                                    src={country.flags.svg}
                                    alt={
                                        country.flags.alt ||
                                        `${country.name.common} flag`
                                    }
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Information Card */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Globe className="w-6 h-6" />
                                Basic Information
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Region:
                                    </span>
                                    <Badge variant="secondary">
                                        {country.region}
                                    </Badge>
                                </div>
                                {country.subregion && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Map className="w-4 h-4" />
                                            Subregion:
                                        </span>
                                        <span className="font-medium">
                                            {country.subregion}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Capital:
                                    </span>
                                    <span className="font-medium">
                                        {capital}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Population:
                                    </span>
                                    <span className="font-medium">
                                        {population}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Ruler className="w-4 h-4" />
                                        Area:
                                    </span>
                                    <span className="font-medium">{area}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Languages and Currencies Card */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Languages className="w-6 h-6" />
                                Culture & Economy
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                                        <Languages className="w-5 h-5" />
                                        Languages
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {languages}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                                        <Coins className="w-5 h-5" />
                                        Currencies
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {currencies}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Weather Information Card */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Thermometer className="w-6 h-6" />
                                Weather in {capital}
                            </h2>
                        </CardHeader>
                        <CardContent>
                            {weatherData ? (
                                <div className="space-y-4">
                                    {/* Current Weather */}
                                    <div className="flex items-center space-x-3 justify-center">
                                        <Image
                                            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                            alt={
                                                weatherData.weather[0]
                                                    .description
                                            }
                                            width={48}
                                            height={48}
                                        />
                                        <div>
                                            <p className="text-xl font-bold">
                                                {Math.round(
                                                    weatherData.main.temp
                                                )}
                                                °C
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {
                                                    weatherData.weather[0]
                                                        .description
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Weather Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Thermometer className="w-4 h-4" />
                                                Feels like:
                                            </span>
                                            <span className="font-medium text-sm">
                                                {Math.round(
                                                    weatherData.main.feels_like
                                                )}
                                                °C
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Droplets className="w-4 h-4" />
                                                Humidity:
                                            </span>
                                            <span className="font-medium text-sm">
                                                {weatherData.main.humidity}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Wind className="w-4 h-4" />
                                                Wind:
                                            </span>
                                            <span className="font-medium text-sm">
                                                {weatherData.wind.speed} m/s
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                Visibility:
                                            </span>
                                            <span className="font-medium text-sm">
                                                {(
                                                    weatherData.visibility /
                                                    1000
                                                ).toFixed(1)}{" "}
                                                km
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground text-sm">
                                        Weather data not available for {capital}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Wikipedia Summary */}
                {wikipediaSummary && (
                    <Card className="mt-8 max-w-6xl mx-auto">
                        <CardHeader>
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                About {country.name.common}
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                {wikipediaSummary.extract}
                            </p>
                            <a
                                href={
                                    wikipediaSummary.content_urls.desktop.page
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary hover:underline text-sm"
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Read more on Wikipedia
                            </a>
                        </CardContent>
                    </Card>
                )}

                {/* Image Gallery */}
                {unsplashImages.length > 0 && (
                    <Card className="mt-8 max-w-6xl mx-auto">
                        <CardHeader>
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Camera className="w-6 h-6" />
                                Images of {country.name.common}
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <ImageGallery
                                images={unsplashImages}
                                countryName={country.name.common}
                            />
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
