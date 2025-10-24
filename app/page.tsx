import { Suspense } from "react";
import { CountriesList } from "@/components/countries-list";
import { CountryCardSkeleton } from "@/components/country-card-skeleton";

function CountriesListFallback() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 space-y-4">
                <div className="flex gap-2 max-w-md mx-auto">
                    <div className="h-10 bg-muted rounded-md flex-1 animate-pulse" />
                </div>
                <div className="flex justify-center">
                    <div className="h-10 w-[200px] bg-muted rounded-md animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {Array.from({ length: 20 }, (_, i) => (
                    <CountryCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-center text-foreground">
                        Explore the World
                    </h1>
                    <p className="text-center text-muted-foreground mt-2 text-lg">
                        Discover countries around the world with flags, regions
                        and capitals
                    </p>
                </div>
            </header>
            <main>
                <Suspense fallback={<CountriesListFallback />}>
                    <CountriesList />
                </Suspense>
            </main>
        </div>
    );
}
