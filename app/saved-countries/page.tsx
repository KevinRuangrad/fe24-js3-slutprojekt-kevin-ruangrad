import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SavedCountriesClient } from "./saved-countries-client";

export default async function SavedCountriesPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground">
                        My Saved Countries
                    </h1>
                    <p className="text-center text-muted-foreground mt-2">
                        Your personal collection of favorite destinations
                    </p>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <SavedCountriesClient />
            </main>
        </div>
    );
}
