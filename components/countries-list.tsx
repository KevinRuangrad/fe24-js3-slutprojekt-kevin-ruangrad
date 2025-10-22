"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { CountryCard } from "@/components/country-card";
import { fetchCountriesPaginated, searchCountries } from "@/lib/api";
import { CountryResponse } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function CountriesList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [data, setData] = useState<CountryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search query
    const [debounceTimeout, setDebounceTimeout] =
        useState<NodeJS.Timeout | null>(null);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeout = setTimeout(() => {
            setDebouncedSearch(value);
            setCurrentPage(1); // Reset to first page when searching
        }, 300);

        setDebounceTimeout(timeout);
    };

    // Fetch data when page or search changes
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let result: CountryResponse;
                if (debouncedSearch.trim()) {
                    result = await searchCountries(
                        debouncedSearch,
                        currentPage
                    );
                } else {
                    result = await fetchCountriesPaginated(currentPage);
                }
                setData(result);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch countries"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentPage, debouncedSearch]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearSearch = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setCurrentPage(1);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-destructive">
                    Error loading countries: {error}
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    const totalPages = data?.totalPages || 1;
    const hasResults = data && data.countries.length > 0;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Section */}
            <div className="mb-8 space-y-4">
                <div className="flex gap-2 max-w-md mx-auto">
                    <Input
                        placeholder="Sök efter land, region eller huvudstad..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="flex-1"
                    />
                    {(searchQuery || debouncedSearch) && (
                        <Button variant="outline" onClick={clearSearch}>
                            Rensa
                        </Button>
                    )}
                </div>

                {debouncedSearch && (
                    <p className="text-center text-sm text-muted-foreground">
                        Visar resultat för: &quot;{debouncedSearch}&quot;
                    </p>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Laddar länder...</span>
                    </div>
                </div>
            )}

            {/* Results */}
            {!isLoading && (
                <>
                    {hasResults ? (
                        <>
                            {/* Results Info */}
                            <div className="mb-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Visar {data.countries.length} av{" "}
                                    {data.total} länder
                                    {data.totalPages > 1 &&
                                        ` (sida ${currentPage} av ${totalPages})`}
                                </p>
                            </div>

                            {/* Countries Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
                                {data.countries.map((country) => (
                                    <CountryCard
                                        key={country.cca3}
                                        country={country}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() =>
                                                        currentPage > 1 &&
                                                        handlePageChange(
                                                            currentPage - 1
                                                        )
                                                    }
                                                    className={
                                                        currentPage <= 1
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>

                                            {/* Page numbers */}
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        totalPages
                                                    ),
                                                },
                                                (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage <= 3
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        currentPage >=
                                                        totalPages - 2
                                                    ) {
                                                        pageNum =
                                                            totalPages - 4 + i;
                                                    } else {
                                                        pageNum =
                                                            currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <PaginationItem
                                                            key={pageNum}
                                                        >
                                                            <PaginationLink
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        pageNum
                                                                    )
                                                                }
                                                                isActive={
                                                                    currentPage ===
                                                                    pageNum
                                                                }
                                                                className="cursor-pointer"
                                                            >
                                                                {pageNum}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    );
                                                }
                                            )}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() =>
                                                        currentPage <
                                                            totalPages &&
                                                        handlePageChange(
                                                            currentPage + 1
                                                        )
                                                    }
                                                    className={
                                                        currentPage >=
                                                        totalPages
                                                            ? "pointer-events-none opacity-50"
                                                            : "cursor-pointer"
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                {debouncedSearch
                                    ? "Inga länder hittades för din sökning."
                                    : "Inga länder att visa."}
                            </p>
                            {debouncedSearch && (
                                <Button
                                    variant="outline"
                                    onClick={clearSearch}
                                    className="mt-4"
                                >
                                    Visa alla länder
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
