import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth;
        },
        jwt: async ({ token, user, trigger, session }) => {
            if (user && user.email) {
                token.id = user.id;
                token.email = user.email;

                // Initialize savedCountries if not present
                if (!token.savedCountries) {
                    token.savedCountries = [];
                }
            }

            // Handle updates to saved countries from client
            if (
                trigger === "update" &&
                session?.savedCountries &&
                token.email
            ) {
                token.savedCountries = session.savedCountries;
            }

            return token;
        },
        session: async ({ session, token }) => {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.savedCountries =
                    (token.savedCountries as string[]) || [];
            }
            return session;
        },
    },
});
