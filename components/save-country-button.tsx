"use client";

import { Heart, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedCountries } from "@/lib/saved-countries-context";
import { Country } from "@/lib/types";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface SaveCountryButtonProps {
    country: Country;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    className?: string;
}

export function SaveCountryButton({
    country,
    variant = "outline",
    size = "default",
    className,
}: SaveCountryButtonProps) {
    const { data: session } = useSession();
    const { addCountry, removeCountry, isCountrySaved, isLoading } =
        useSavedCountries();

    const isSaved = isCountrySaved(country.cca3);

    if (!session || isLoading) {
        return null; // Don't show save button if not logged in or still loading
    }

    const handleToggleSave = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if button is inside a Link
        e.stopPropagation();

        if (isSaved) {
            removeCountry(country.cca3);
        } else {
            addCountry(country);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleToggleSave}
            className={cn(
                "flex items-center gap-2 transition-colors",
                isSaved && "text-red-500 hover:text-red-600",
                className
            )}
        >
            {isSaved ? (
                <>
                    <Heart className="w-4 h-4 fill-current" />
                    Saved
                </>
            ) : (
                <>
                    <HeartOff className="w-4 h-4" />
                    Save
                </>
            )}
        </Button>
    );
}
