import { clerkMiddleware } from "@clerk/nextjs/server";

// Export the default middleware with no custom configuration
export default clerkMiddleware();

// Setup matcher patterns for routes that will utilize the Clerk middleware
export const config = {
  matcher: [
    // Protected routes that need authentication
    '/settings',
    '/settings/(.*)',
    '/onboarding',
    '/onboarding/(.*)',
    '/dashboard',
    '/dashboard/(.*)',
    '/profile',
    '/profile/(.*)',
    '/predict',
    '/predict/(.*)',
    '/market',
    '/market/(.*)',
    // API routes
    '/api/(.*)',
    '/trpc/(.*)',
    // Skip Next.js internals and all static files
    '/((?!_next|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|webm|mp4|css|js)$).*)',
  ],
};