"use client";

import Image from "next/image";
import { UnsplashImage } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface ImageGalleryProps {
    images: UnsplashImage[];
    countryName: string;
}

export function ImageGallery({ images, countryName }: ImageGalleryProps) {
    // Show only the first 6 images
    const displayImages = images.slice(0, 6);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {displayImages.map((image) => (
                <div key={image.id} className="space-y-2">
                    <div className="relative h-48 rounded-md overflow-hidden">
                        <Image
                            src={image.urls.regular}
                            alt={
                                image.alt_description ||
                                image.description ||
                                `${countryName} landscape`
                            }
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                        Photo by{" "}
                        <a
                            href={image.user.links.html}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                            {image.user.name}
                            <ExternalLink className="w-3 h-3" />
                        </a>{" "}
                        on{" "}
                        <a
                            href={image.links.html}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                            Unsplash
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
