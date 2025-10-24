"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { Country } from "@/lib/types";

interface SavedCountriesContextType {
    savedCountries: Country[];
    addCountry: (country: Country) => void;
    removeCountry: (countryCode: string) => void;
    isCountrySaved: (countryCode: string) => boolean;
    isLoading: boolean;
}

const SavedCountriesContext = createContext<
    SavedCountriesContextType | undefined
>(undefined);

export function SavedCountriesProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const [savedCountries, setSavedCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const updateSessionToken = useCallback(async () => {
        if (session?.user?.email) {
            try {
                // Update the JWT token with new saved countries
                await fetch("/api/auth/session", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        savedCountries: savedCountries.map((c) => c.cca3),
                    }),
                });
            } catch (error) {
                console.error("Error updating session:", error);
            }
        }
    }, [session?.user?.email, savedCountries]);

    // Load saved countries from localStorage based on user email
    useEffect(() => {
        const loadSavedCountries = async () => {
            if (session?.user?.email) {
                const savedKey = `savedCountries_${session.user.email}`;
                const saved = localStorage.getItem(savedKey);
                if (saved) {
                    try {
                        const parsedCountries = JSON.parse(saved);
                        setSavedCountries(parsedCountries);
                    } catch (error) {
                        console.error("Error loading saved countries:", error);
                        setSavedCountries([]);
                    }
                } else {
                    setSavedCountries([]);
                }
            } else {
                setSavedCountries([]);
            }
            setIsLoading(false);
        };

        loadSavedCountries();
    }, [session?.user?.email]);

    // Save to localStorage whenever savedCountries changes
    useEffect(() => {
        if (session?.user?.email && !isLoading) {
            const savedKey = `savedCountries_${session.user.email}`;
            localStorage.setItem(savedKey, JSON.stringify(savedCountries));

            // Also update the session token
            updateSessionToken();
        }
    }, [savedCountries, session?.user?.email, isLoading, updateSessionToken]);

    const addCountry = (country: Country) => {
        if (!session?.user?.email) return;

        setSavedCountries((prev) => {
            if (prev.find((c) => c.cca3 === country.cca3)) {
                return prev; // Already saved
            }
            return [...prev, country];
        });
    };

    const removeCountry = (countryCode: string) => {
        if (!session?.user?.email) return;

        setSavedCountries((prev) => prev.filter((c) => c.cca3 !== countryCode));
    };

    const isCountrySaved = (countryCode: string) => {
        return savedCountries.some((c) => c.cca3 === countryCode);
    };

    return (
        <SavedCountriesContext.Provider
            value={{
                savedCountries,
                addCountry,
                removeCountry,
                isCountrySaved,
                isLoading,
            }}
        >
            {children}
        </SavedCountriesContext.Provider>
    );
}

export function useSavedCountries() {
    const context = useContext(SavedCountriesContext);
    if (context === undefined) {
        throw new Error(
            "useSavedCountries must be used within a SavedCountriesProvider"
        );
    }
    return context;
}
