import { Input } from "@/components/ui/input";

export default function Home() {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen gap-16">
                <h1 className="text-8xl font-sans">Explore it</h1>
                <Input className="w-2xl" placeholder="Search for country..." />
            </div>
            <div></div>
        </>
    );
}
