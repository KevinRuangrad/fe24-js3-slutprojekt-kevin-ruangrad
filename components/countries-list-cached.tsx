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
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
    useCountriesWithFilters,
    useRegions,
    usePrefetchCountry,
} from "@/lib/hooks/useCountries";

export function CountriesListCached() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefetchCountry = usePrefetchCountry();

    // URL parameters
    const initialPage = parseInt(searchParams.get("page") || "1");
    const initialQuery = searchParams.get("q") || "";
    const initialRegion = searchParams.get("region") || "";

    // Local state
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedRegion, setSelectedRegion] = useState(initialRegion);
    const [currentPage, setCurrentPage] = useState(initialPage);

    // React Query hooks
    const {
        data: countriesData,
        isLoading: isLoadingCountries,
        error: countriesError,
        refetch: refetchCountries,
        isFetching,
    } = useCountriesWithFilters(currentPage, 10, searchQuery, selectedRegion);

    const {
        data: regions = [],
        isLoading: isLoadingRegions,
        error: regionsError,
    } = useRegions();

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (currentPage > 1) params.set("page", currentPage.toString());
        if (searchQuery) params.set("q", searchQuery);
        if (selectedRegion) params.set("region", selectedRegion);

        const newUrl = params.toString() ? `?${params.toString()}` : "/";
        router.push(newUrl, { scroll: false });
    }, [currentPage, searchQuery, selectedRegion, router]);

    // Handlers
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleRegionChange = (value: string) => {
        setSelectedRegion(value === "all" ? "" : value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleRefresh = () => {
        refetchCountries();
    };

    // Prefetch country details on hover
    const handleCountryHover = (countryCode: string) => {
        prefetchCountry(countryCode);
    };

    // Error state
    if (countriesError || regionsError) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {countriesError?.message ||
                            regionsError?.message ||
                            "Failed to load data. Please try again."}
                    </AlertDescription>
                </Alert>
                <Button onClick={handleRefresh} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Search countries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        value={selectedRegion || "all"}
                        onValueChange={handleRegionChange}
                        disabled={isLoadingRegions}
                    >
                        <SelectTrigger aria-label="Select region filter">
                            <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {regions.map((region) => (
                                <SelectItem key={region} value={region}>
                                    {region}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSearch} disabled={isFetching}>
                    {isFetching ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Search
                </Button>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isFetching}
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            isFetching ? "animate-spin" : ""
                        }`}
                    />
                </Button>
            </div>

            {/* Results Summary */}
            {countriesData && (
                <div className="text-sm text-muted-foreground">
                    Showing {countriesData.countries.length} of{" "}
                    {countriesData.total} countries
                    {searchQuery && ` matching "${searchQuery}"`}
                    {selectedRegion && ` in ${selectedRegion}`}
                    {isFetching && (
                        <span className="ml-2 text-blue-600">
                            <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                            Updating...
                        </span>
                    )}
                </div>
            )}

            {/* Countries Grid */}
            {isLoadingCountries ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <CountryCardSkeleton key={index} />
                    ))}
                </div>
            ) : countriesData?.countries.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countriesData.countries.map((country) => (
                        <div
                            key={country.cca3}
                            onMouseEnter={() =>
                                handleCountryHover(country.name.common)
                            }
                        >
                            <CountryCard country={country} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">
                        No countries found matching your criteria.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedRegion("");
                            setCurrentPage(1);
                        }}
                        className="mt-4"
                    >
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* Pagination */}
            {countriesData && countriesData.totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        className="cursor-pointer"
                                    />
                                </PaginationItem>
                            )}

                            {/* Page numbers */}
                            {Array.from({
                                length: Math.min(5, countriesData.totalPages),
                            }).map((_, index) => {
                                const startPage = Math.max(1, currentPage - 2);
                                const pageNumber = startPage + index;

                                if (pageNumber > countriesData.totalPages)
                                    return null;

                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            onClick={() =>
                                                handlePageChange(pageNumber)
                                            }
                                            isActive={
                                                pageNumber === currentPage
                                            }
                                            className="cursor-pointer"
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            {currentPage < countriesData.totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        className="cursor-pointer"
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
