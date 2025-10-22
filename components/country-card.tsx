import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Country } from "@/lib/types";
import Image from "next/image";

interface CountryCardProps {
    country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
    const capital = country.capital ? country.capital[0] : "N/A";

    return (
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                    <Image
                        src={country.flags.svg}
                        alt={country.flags.alt || `${country.name.common} flag`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <h3 className="text-lg font-semibold text-center line-clamp-2">
                    {country.name.common}
                </h3>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Region:
                        </span>
                        <Badge variant="secondary" className="text-xs">
                            {country.region}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Huvudstad:
                        </span>
                        <span className="text-sm font-medium text-right line-clamp-1">
                            {capital}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
