import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["openweathermap.org", "images.unsplash.com"],
    },
    // Optimize production builds
    productionBrowserSourceMaps: false,
    // Runtime environment configuration
    env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
};

export default nextConfig;
