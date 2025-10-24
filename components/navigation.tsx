import { auth } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export async function Navigation() {
    const session = await auth();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold">
                        <Link
                            href="/"
                            className="hover:text-primary transition-colors"
                        >
                            Explore it
                        </Link>
                    </h1>
                </div>

                <div className="flex items-center space-x-3">
                    {session?.user && (
                        <Badge
                            variant="outline"
                            className="hidden sm:inline-flex"
                        >
                            Welcome! {session.user.name || "User"}
                        </Badge>
                    )}
                    <UserAvatar session={session} />
                </div>
            </div>
        </nav>
    );
}
