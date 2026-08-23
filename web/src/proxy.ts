import { type NextRequest, NextResponse } from "next/server";
import { shouldPassThroughBetterAuthProxy } from "@/lib/auth/auth-proxy";
import logger from "./lib/logger";

export const config = {
	//matcher: ["/((>!api|?!_next/static|_next/image|favicon.ico).*)"],
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

const CORS_HEADERS = {
	"Access-Control-Allow-Credentials": "true",
	"Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",
	"Content-Type": "application/json",
	Allow: "GET, POST, PATCH, OPTIONS",
	"Access-Control-Allow-Headers":
		"Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, Authorization",
};

// Pre-compile regex patterns for better performance
const API_PATH_REGEX = /\/api\//;
const TRACKER_PATH_REGEX = /\/api\/tracker\//;

// Cache allowed origins to avoid parsing on every request
let cachedAllowedOrigins: Set<string> | null = null;
let cachedFrontendUrls: string | null = null;

/**
 * Get allowed origins as a Set for O(1) lookup performance
 * Cached to avoid parsing environment variable on every request
 */
const getAllowedOrigins = (): Set<string> => {
	const furls = process.env.FRONTEND_URLS;

	// Return cached result if environment variable hasn't changed
	if (cachedAllowedOrigins && cachedFrontendUrls === furls) {
		return cachedAllowedOrigins;
	}

	// Parse and cache the result
	const origins = furls
		? (furls.split(",") as string[]).map((url) => url.trim()).filter(Boolean)
		: [];

	cachedAllowedOrigins = new Set(origins);
	cachedFrontendUrls = furls ?? null;

	return cachedAllowedOrigins;
};

const badRequest = new NextResponse(null, {
	status: 400,
	statusText: "Bad Request",
	headers: { "Content-Type": "text/plain" },
});

/**
 * True when the request's Origin is the site's own origin. Compares hostname
 * (ignoring scheme) against the forwarded/host header, so a reverse proxy that
 * rewrites X-Forwarded-Proto cannot cause a same-origin request to be rejected.
 */
function isSameOrigin(req: NextRequest, origin: string): boolean {
	const host = (
		req.headers.get("x-forwarded-host") ??
		req.headers.get("host") ??
		""
	)
		.split(",")[0]
		.trim();
	if (!host) return false;
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}

/**
 * Apply CORS headers to response in a single batch operation
 * More efficient than multiple append() calls
 */
function applyCorsHeaders(response: NextResponse, origin: string | null): void {
	if (origin) {
		response.headers.set("Access-Control-Allow-Origin", origin);
	}

	// Batch set all CORS headers at once
	for (const [key, value] of Object.entries(CORS_HEADERS)) {
		response.headers.set(key, value);
	}
}

/**
 * Apple Sign In uses `response_mode=form_post`, meaning Apple POSTs the OAuth
 * result back to our callback URL from appleid.apple.com.
 *
 * Next.js rejects cross-origin POSTs at the framework level (Origin ≠ Host)
 * before the route handler ever runs — so Better Auth's `disableOriginCheck`
 * config cannot help. This proxy intercepts that POST in the Edge runtime
 * (which does NOT apply the same CSRF check), converts it to a GET redirect,
 * and lets Better Auth process it normally via the GET handler.
 */
async function handleAppleCallback(
	req: NextRequest,
): Promise<NextResponse | null> {
	if (
		req.nextUrl.pathname === "/api/auth/callback/apple" &&
		req.method === "POST"
	) {
		try {
			const body = await req.formData();
			const params = new URLSearchParams();
			for (const [key, value] of body.entries()) {
				params.set(key, value.toString());
			}
			const redirectUrl = new URL(
				`/api/auth/callback/apple?${params.toString()}`,
				req.url,
			);
			return NextResponse.redirect(redirectUrl, 302);
		} catch {
			// If body parsing fails, let the request through — Better Auth will handle the error
			return NextResponse.next();
		}
	}
	return null;
}

export async function proxy(req: NextRequest) {
	const appleResponse = await handleAppleCallback(req);
	if (appleResponse) return appleResponse;

	// Do not mutate NextResponse for Better Auth — extra headers/CORS can drop
	// Set-Cookie on OAuth 302, so the first Google/LINE/Apple callback
	// never stores the session cookie.
	if (shouldPassThroughBetterAuthProxy(req.nextUrl.pathname)) {
		return NextResponse.next();
	}

	//#region csp - https://nextjs.org/docs/pages/guides/content-security-policy
	/*
	const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
	const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`
	// Replace newline characters and spaces
	const contentSecurityPolicyHeaderValue = cspHeader
		.replace(/\s{2,}/g, ' ')
		.trim()

	const requestHeaders = new Headers(req.headers)
	requestHeaders.set('x-nonce', nonce)

	requestHeaders.set(
		'Content-Security-Policy',
		contentSecurityPolicyHeaderValue
	)

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	})
	response.headers.set(
		'Content-Security-Policy',
		contentSecurityPolicyHeaderValue
	)
	*/
	//#endregion

	const response = NextResponse.next();

	response.headers.set("x-current-path", req.nextUrl.pathname);

	// Early return for non-API routes using pre-compiled regex
	if (!API_PATH_REGEX.test(req.url)) {
		return response;
	}

	//#region cors
	// Skip CORS check for tracker API routes (allow Java clients)
	if (TRACKER_PATH_REGEX.test(req.url)) {
		applyCorsHeaders(response, "*");
		return response;
	}

	const origin = req.headers.get("origin");

	// Only process CORS if origin is present
	if (origin) {
		// Always allow same-origin requests. The site's own frontend must be able
		// to call its own API regardless of how FRONTEND_URLS is configured; CORS
		// only matters for genuine cross-origin (third-party) callers.
		if (isSameOrigin(req, origin)) {
			applyCorsHeaders(response, origin);
			return response;
		}

		const allowedOrigins = getAllowedOrigins();

		// Use Set.has() for O(1) lookup instead of array.includes() O(n)
		if (!allowedOrigins.has(origin)) {
			logger.warn("CORS blocked for origin", {
				tags: ["cors"],
				metadata: {
					origin,
					allowedOrigins: Array.from(allowedOrigins),
				},
				service: "proxy",
				environment: process.env.NODE_ENV,
				version: process.env.npm_package_version,
				url: req.url || "",
				method: req.method || "",
			});

			return badRequest;
		}

		// Apply CORS headers for allowed origin
		applyCorsHeaders(response, origin);
	}
	//#endregion

	return response;
}
