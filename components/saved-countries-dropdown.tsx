"use client";

import { useState } from "react";
import { Heart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSavedCountries } from "@/lib/saved-countries-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export function SavedCountriesDropdown() {
    const { data: session } = useSession();
    const { savedCountries, removeCountry, isLoading } = useSavedCountries();
    const [isOpen, setIsOpen] = useState(false);

    if (!session || isLoading) {
        return null; // Don't show if not logged in or still loading
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <Heart className="w-4 h-4 mr-2" />
                    Saved
                    {savedCountries.length > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {savedCountries.length}
                        </Badge>
                    )}
                    <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Saved Countries</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {savedCountries.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                        No saved countries yet.
                        <br />
                        Save countries by clicking the heart icon.
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {savedCountries.map((country) => (
                            <DropdownMenuItem
                                key={country.cca3}
                                className="p-0"
                            >
                                <div className="flex items-center justify-between w-full p-2">
                                    <Link
                                        href={`/country/${country.cca3}`}
                                        className="flex items-center gap-3 flex-1 min-w-0"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="relative w-8 h-6 rounded overflow-hidden flex-shrink-0">
                                            <Image
                                                src={country.flags.svg}
                                                alt={`${country.name.common} flag`}
                                                fill
                                                className="object-cover"
                                                sizes="32px"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {country.name.common}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {country.region}
                                            </p>
                                        </div>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeCountry(country.cca3);
                                        }}
                                        className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <Heart className="w-4 h-4 fill-current" />
                                    </Button>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {savedCountries.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Link
                                href="/saved-countries"
                                onClick={() => setIsOpen(false)}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                >
                                    View All Saved Countries
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
