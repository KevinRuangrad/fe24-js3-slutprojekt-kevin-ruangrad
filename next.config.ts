import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["openweathermap.org", "images.unsplash.com"],
    },
     // Disable source maps in production to avoid the error
    productionBrowserSourceMaps: false,
    // Ensure proper environment variable handling
    env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
};

export default nextConfig;
