import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <h1 className="text-2xl font-bold text-center">
                        Country Not Found
                    </h1>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        The country you&apos;re looking for doesn&apos;t exist
                        or the country code is invalid.
                    </p>
                    <Link href="/">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Countries
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
