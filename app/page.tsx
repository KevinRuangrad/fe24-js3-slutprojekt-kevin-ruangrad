import { CountriesList } from "@/components/countries-list";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-center text-foreground">
                        Upptäck världen
                    </h1>
                    <p className="text-center text-muted-foreground mt-2 text-lg">
                        Upptäck världens länder med flaggor, regioner och
                        huvudstäder
                    </p>
                </div>
            </header>
            <main>
                <CountriesList />
            </main>
        </div>
    );
}
