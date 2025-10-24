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
import { CountryCardSkeleton } from "@/components/country-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchCountriesWithFilters, getUniqueRegions } from "@/lib/api";
import { CountryResponse } from "@/lib/types";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

export function CountriesList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    // State for URL parameters - use defaults until mounted
    const [urlParams, setUrlParams] = useState({
        currentPage: 1,
        pageSize: 20,
        query: "",
        region: "",
    });

    // Component state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [data, setData] = useState<CountryResponse | null>(null);
    const [regions, setRegions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search query
    const [debounceTimeout, setDebounceTimeout] =
        useState<NodeJS.Timeout | null>(null);

    // Set mounted to true after first render
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update URL parameters only when mounted
    useEffect(() => {
        if (mounted) {
            const currentPage = parseInt(searchParams.get("page") || "1");
            const pageSize = parseInt(searchParams.get("pageSize") || "20");
            const query = searchParams.get("query") || "";
            const region = searchParams.get("region") || "";

            setUrlParams({ currentPage, pageSize, query, region });
            setSearchQuery(query);
            setDebouncedSearch(query);
            setSelectedRegion(region);
        }
    }, [mounted, searchParams]);

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
            if (newParams.pageSize === 20) {
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
        if (!mounted) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchCountriesWithFilters(
                    urlParams.currentPage,
                    urlParams.pageSize,
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
    }, [
        mounted,
        urlParams.currentPage,
        urlParams.pageSize,
        debouncedSearch,
        selectedRegion,
    ]);

    // Sync component state with URL parameters
    useEffect(() => {
        if (mounted) {
            setSearchQuery(urlParams.query);
            setDebouncedSearch(urlParams.query);
            setSelectedRegion(urlParams.region);
        }
    }, [mounted, urlParams.query, urlParams.region]);

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

    const handleRetry = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const result = await fetchCountriesWithFilters(
                urlParams.currentPage,
                urlParams.pageSize,
                debouncedSearch,
                selectedRegion
            );
            setData(result);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch countries"
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive" className="max-w-md mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Något gick fel</AlertTitle>
                    <AlertDescription className="space-y-3">
                        <p>Det gick inte att ladda länderna: {error}</p>
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Försök igen
                        </Button>
                    </AlertDescription>
                </Alert>
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
                        placeholder="Search for country, region or capital..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="flex-1"
                    />
                    {(searchQuery || debouncedSearch || selectedRegion) && (
                        <Button variant="outline" onClick={clearFilters}>
                            Clear
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
                            <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All regions</SelectItem>
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
                            ? `Showing results for: "${debouncedSearch}" in ${selectedRegion}`
                            : debouncedSearch
                            ? `Showing results for: "${debouncedSearch}"`
                            : `Showing countries in: ${selectedRegion}`}
                    </p>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <>
                    <div className="mb-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-muted-foreground">
                                Laddar länder...
                            </span>
                        </div>
                    </div>

                    {/* Skeleton Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
                        {Array.from({ length: urlParams.pageSize }, (_, i) => (
                            <CountryCardSkeleton key={i} />
                        ))}
                    </div>
                </>
            )}

            {/* Results */}
            {!isLoading && (
                <>
                    {hasResults ? (
                        <>
                            {/* Results Info */}
                            <div className="mb-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Showing {data.countries.length} of{" "}
                                    {data.total} countries
                                    {data.totalPages > 1 &&
                                        ` (page ${urlParams.currentPage} of ${totalPages})`}
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
                                                        urlParams.currentPage >
                                                            1 &&
                                                        handlePageChange(
                                                            urlParams.currentPage -
                                                                1
                                                        )
                                                    }
                                                    className={
                                                        urlParams.currentPage <=
                                                        1
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
                                                        urlParams.currentPage <=
                                                        3
                                                    ) {
                                                        pageNum = i + 1;
                                                    } else if (
                                                        urlParams.currentPage >=
                                                        totalPages - 2
                                                    ) {
                                                        pageNum =
                                                            totalPages - 4 + i;
                                                    } else {
                                                        pageNum =
                                                            urlParams.currentPage -
                                                            2 +
                                                            i;
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
                                                                    urlParams.currentPage ===
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
                                                        urlParams.currentPage <
                                                            totalPages &&
                                                        handlePageChange(
                                                            urlParams.currentPage +
                                                                1
                                                        )
                                                    }
                                                    className={
                                                        urlParams.currentPage >=
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
                                    ? "No countries found for your search."
                                    : "No countries to display."}
                            </p>
                            {(debouncedSearch || selectedRegion) && (
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="mt-4"
                                >
                                    Show all countries
                                </Button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
