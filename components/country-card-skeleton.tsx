import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CountryCardSkeleton() {
    return (
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                    <Skeleton className="w-full h-full" />
                </div>
                <Skeleton className="h-6 w-3/4 mx-auto" />
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-14" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
