"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { CountryCard } from "@/components/country-card";
import { fetchCountriesWithFilters, getUniqueRegions } from "@/lib/api";
import { CountryResponse } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function CountriesList() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get URL parameters
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "24");
    const query = searchParams.get("query") || "";
    const region = searchParams.get("region") || "";

    const [searchQuery, setSearchQuery] = useState(query);
    const [selectedRegion, setSelectedRegion] = useState(region);
    const [debouncedSearch, setDebouncedSearch] = useState(query);
    const [data, setData] = useState<CountryResponse | null>(null);
    const [regions, setRegions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search query
    const [debounceTimeout, setDebounceTimeout] =
        useState<NodeJS.Timeout | null>(null);

    // Update URL parameters
    const updateURL = (newParams: {
        page?: number;
        pageSize?: number;
        query?: string;
        region?: string;
    }) => {
        const params = new URLSearchParams(searchParams);

        if (newParams.page !== undefined) {
            if (newParams.page === 1) {
                params.delete("page");
            } else {
                params.set("page", newParams.page.toString());
            }
        }

        if (newParams.pageSize !== undefined) {
            if (newParams.pageSize === 24) {
                params.delete("pageSize");
            } else {
                params.set("pageSize", newParams.pageSize.toString());
            }
        }

        if (newParams.query !== undefined) {
            if (newParams.query === "") {
                params.delete("query");
            } else {
                params.set("query", newParams.query);
            }
        }

        if (newParams.region !== undefined) {
            if (newParams.region === "" || newParams.region === "all") {
                params.delete("region");
            } else {
                params.set("region", newParams.region);
            }
        }

        const newURL = params.toString() ? `?${params.toString()}` : "";
        router.push(newURL);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeout = setTimeout(() => {
            setDebouncedSearch(value);
            updateURL({ query: value, page: 1 });
        }, 300);

        setDebounceTimeout(timeout);
    };

    const handleRegionChange = (value: string) => {
        setSelectedRegion(value);
        updateURL({ region: value, page: 1 });
    };

    // Load regions on component mount
    useEffect(() => {
        const loadRegions = async () => {
            try {
                const uniqueRegions = await getUniqueRegions();
                setRegions(uniqueRegions);
            } catch (err) {
                console.error("Failed to load regions:", err);
            }
        };
        loadRegions();
    }, []);

    // Fetch data when URL parameters change
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchCountriesWithFilters(
                    currentPage,
                    pageSize,
                    debouncedSearch,
                    selectedRegion
                );
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
    }, [currentPage, pageSize, debouncedSearch, selectedRegion]);

    // Sync component state with URL parameters
    useEffect(() => {
        setSearchQuery(query);
        setDebouncedSearch(query);
        setSelectedRegion(region);
    }, [query, region]);

    const handlePageChange = (page: number) => {
        updateURL({ page });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedRegion("");
        setDebouncedSearch("");
        router.push("/");
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
                    {(searchQuery || debouncedSearch || selectedRegion) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Rensa
                        </Button>
                    )}
                </div>

                {/* Region Filter */}
                <div className="flex justify-center">
                    <Select
                        value={selectedRegion || "all"}
                        onValueChange={handleRegionChange}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Välj region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alla regioner</SelectItem>
                            {regions.map((regionName) => (
                                <SelectItem key={regionName} value={regionName}>
                                    {regionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(debouncedSearch || selectedRegion) && (
                    <p className="text-center text-sm text-muted-foreground">
                        {debouncedSearch && selectedRegion
                            ? `Visar resultat för: "${debouncedSearch}" i ${selectedRegion}`
                            : debouncedSearch
                            ? `Visar resultat för: "${debouncedSearch}"`
                            : `Visar länder i: ${selectedRegion}`}
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
                                {debouncedSearch || selectedRegion
                                    ? "Inga länder hittades för din sökning."
                                    : "Inga länder att visa."}
                            </p>
                            {(debouncedSearch || selectedRegion) && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
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
