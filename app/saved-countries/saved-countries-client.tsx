"use client";

import { useSavedCountries } from "@/lib/saved-countries-context";
import { CountryCard } from "@/components/country-card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";

export function SavedCountriesClient() {
    const { savedCountries, removeCountry, isLoading } = useSavedCountries();

    if (isLoading) {
        return (
            <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                    Loading your saved countries...
                </p>
            </div>
        );
    }

    if (savedCountries.length === 0) {
        return (
            <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                    No saved countries yet
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start exploring and save your favorite countries by clicking
                    the heart icon on any country card.
                </p>
                <Link href="/">
                    <Button>Explore Countries</Button>
                </Link>
            </div>
        );
    }

    const clearAllSaved = () => {
        if (confirm("Are you sure you want to remove all saved countries?")) {
            savedCountries.forEach((country) => removeCountry(country.cca3));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                    {savedCountries.length} Saved{" "}
                    {savedCountries.length === 1 ? "Country" : "Countries"}
                </h2>
                {savedCountries.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllSaved}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {savedCountries.map((country) => (
                    <CountryCard key={country.cca3} country={country} />
                ))}
            </div>
        </div>
    );
}
