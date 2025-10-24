import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SaveCountryButton } from "@/components/save-country-button";
import { Country } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

interface CountryCardProps {
    country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
    const capital = country.capital ? country.capital[0] : "N/A";

    return (
        <div className="block h-full relative group">
            <Link href={`/country/${country.cca3}`} className="block h-full">
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer mobile-card tablet-card">
                    <CardHeader className="pb-3 p-4 sm:p-6">
                        <div className="relative w-full h-24 sm:h-32 mb-3 rounded-md overflow-hidden mobile-flag tablet-flag">
                            <Image
                                src={country.flags.svg}
                                alt={
                                    country.flags.alt ||
                                    `${country.name.common} flag`
                                }
                                fill
                                className="object-cover"
                                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-center line-clamp-2">
                            {country.name.common}
                        </h3>
                    </CardHeader>
                    <CardContent className="pt-0 p-4 sm:p-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    Region:
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                    {country.region}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                    Capital:
                                </span>
                                <span className="text-xs sm:text-sm font-medium text-right line-clamp-1">
                                    {capital}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            {/* Save button positioned absolutely */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <SaveCountryButton
                    country={country}
                    size="sm"
                    variant="outline"
                    className="bg-background/90 backdrop-blur-sm shadow-sm"
                />
            </div>
        </div>
    );
}
