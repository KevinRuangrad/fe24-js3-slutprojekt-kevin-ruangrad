# Countries Explorer - Implementation Guide

This implementation provides a paginated country listing using the REST Countries API with the following features:

## Features

-   ✅ **10 countries per page** with pagination
-   ✅ **Flag, name, region, and capital** for each country
-   ✅ **Search functionality** (search by country name, region, or capital)
-   ✅ **Responsive design** with shadcn/ui components
-   ✅ **TanStack Query** for efficient data fetching and caching
-   ✅ **Swedish UI text** as requested ("Huvudstad", "Sök", etc.)

## Tech Stack

-   **Next.js 15** with App Router
-   **TanStack Query v5** for data fetching and caching
-   **shadcn/ui** for UI components (Card, Button, Pagination, Badge, Input)
-   **REST Countries API** (v3.1)
-   **TypeScript** for type safety
-   **Tailwind CSS** for styling

## API Integration

### REST Countries API Endpoints Used

```typescript
// Fetch all countries with specific fields
https://restcountries.com/v3.1/all?fields=name,capital,region,flags,cca3
```

### Data Structure

```typescript
interface Country {
    name: {
        common: string;
        official: string;
    };
    capital?: string[];
    region: string;
    flags: {
        png: string;
        svg: string;
        alt?: string;
    };
    cca3: string; // 3-letter country code
}
```

## Implementation Details

### 1. Data Fetching (`lib/api.ts`)

-   Fetches all countries once and caches them
-   Implements client-side pagination (10 countries per page)
-   Provides search functionality across name, region, and capital

### 2. Components Structure

```
components/
├── country-card.tsx        # Individual country card display
├── countries-list.tsx      # Main list with pagination and search
└── providers.tsx          # TanStack Query provider setup
```

### 3. Features Implemented

#### Pagination

-   Shows 10 countries per page
-   Smart pagination component with page numbers
-   Smooth scrolling to top on page change
-   Shows current page info: "Visar X av Y länder (sida N av M)"

#### Search

-   Debounced search (300ms delay)
-   Searches across: country name, region, capital
-   Resets to page 1 when searching
-   Shows search results count
-   Clear search functionality

#### UI/UX

-   Responsive grid layout (1-5 columns based on screen size)
-   Loading states with spinner
-   Error handling with retry functionality
-   Hover effects on cards
-   Swedish language interface

## Usage Example

The main page (`app/page.tsx`) shows how to use the component:

```tsx
import { CountriesList } from "@/components/countries-list";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-background border-b">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-center">
                        Explore Countries
                    </h1>
                    <p className="text-center text-muted-foreground mt-2">
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
```

## Key Benefits

1. **Performance**: TanStack Query caches the API response, so subsequent page loads are instant
2. **User Experience**: Debounced search prevents excessive API calls
3. **Responsive**: Works well on mobile, tablet, and desktop
4. **Accessible**: Proper semantic HTML and keyboard navigation
5. **Type Safe**: Full TypeScript integration with proper interfaces

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or 3001 if 3000 is occupied).

## Possible Enhancements

-   Add dark/light mode toggle
-   Implement infinite scroll as alternative to pagination
-   Add country detail modal/page
-   Add favorites functionality
-   Implement sorting options (alphabetical, by region, etc.)
-   Add loading skeleton placeholders
-   Add error boundaries for better error handling
