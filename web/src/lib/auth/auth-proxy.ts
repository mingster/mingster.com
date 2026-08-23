/**
 * Better Auth route handlers set the session cookie on the 302 from
 * `/api/auth/callback/*`. Next.js can drop that `Set-Cookie` when proxy/middleware
 * returns a mutated `NextResponse.next()` (extra headers or cookies). First OAuth
 * then creates a DB session the browser never stores — user must sign in twice.
 */
export function shouldPassThroughBetterAuthProxy(pathname: string): boolean {
	return pathname === "/api/auth" || pathname.startsWith("/api/auth/");
}
