# Authentication Setup

This application uses Auth.js (NextAuth.js) for authentication with support for GitHub and Google OAuth providers.

## Getting Started

1. The `AUTH_SECRET` and `NEXTAUTH_URL` are already configured in your `.env.local` file.

2. To enable OAuth providers, you'll need to set up applications with GitHub and/or Google:

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
    - Application name: Your app name
    - Homepage URL: `http://localhost:3000`
    - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add the Client ID and Client Secret to your `.env.local`:
    ```
    AUTH_GITHUB_ID=your_github_client_id
    AUTH_GITHUB_SECRET=your_github_client_secret
    ```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure the OAuth consent screen
6. Set up the OAuth client:
    - Application type: Web application
    - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Add the Client ID and Client Secret to your `.env.local`:
    ```
    AUTH_GOOGLE_ID=your_google_client_id
    AUTH_GOOGLE_SECRET=your_google_client_secret
    ```

## Features

-   **Login Page**: Simple login page at `/login` with GitHub and Google OAuth buttons
-   **Navigation**: User avatar in the navigation bar when logged in
-   **Session Management**: Dropdown menu with user info and logout option
-   **Responsive Design**: Uses shadcn/ui components for a clean, modern interface

## Usage

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign In" in the navigation
4. Choose your preferred OAuth provider
5. After authentication, you'll see your avatar in the navigation

## Components Created

-   `components/navigation.tsx` - Main navigation with user avatar
-   `components/user-avatar.tsx` - User avatar dropdown component
-   `app/login/page.tsx` - Login page with OAuth buttons
-   `lib/auth.ts` - Auth.js configuration
-   `app/api/auth/[...nextauth]/route.ts` - API route for authentication
