import { auth } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { SavedCountriesDropdown } from "@/components/saved-countries-dropdown";
import { Badge } from "@/components/ui/badge";
import { Binoculars } from "lucide-react";
import Link from "next/link";

export async function Navigation() {
    const session = await auth();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 hover:text-primary transition-colors"
                    >
                        <Binoculars className="h-6 w-6 sm:h-7 sm:w-7" />
                        <h1 className="text-lg sm:text-xl font-bold tracking-wider font-mono bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                            Explore it
                        </h1>
                    </Link>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                    {session?.user && (
                        <>
                            <SavedCountriesDropdown />
                            <Badge
                                variant="outline"
                                className="hidden sm:inline-flex text-xs"
                            >
                                Welcome! {session.user.name || "User"}
                            </Badge>
                        </>
                    )}
                    <UserAvatar session={session} />
                </div>
            </div>
        </nav>
    );
}
