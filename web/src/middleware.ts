import { type NextRequest, NextResponse } from "next/server";

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const CORS_HEADERS = {
	"Access-Control-Allow-Credentials": "true",
	"Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",
	"Content-Type": "application/json",
	Allow: "GET, POST, PATCH, OPTIONS",
	"Access-Control-Allow-Headers":
		"Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, Authorization",
};

const getAllowedOrigins = () => {
	const furls = process.env.FRONTEND_URLS;

	// in production, allow origins from FRONTEND_URLS only
	return process.env.NODE_ENV === "production"
		? (furls?.split(",") as string[])
		: ["http://localhost:3000", "https://api.stripe.com"];
};

const badRequest = new NextResponse(null, {
	status: 400,
	statusText: "Bad Request",
	headers: { "Content-Type": "text/plain" },
});

export function middleware(req: NextRequest) {
	const res = NextResponse.next();
	res.headers.set("x-current-path", req.nextUrl.pathname);

	if (!/\/api\/*/.test(req.url)) {
		return res;
	}

	const origin = req.headers.get("origin");
	const allowedOrigins = getAllowedOrigins();

	if (origin && !allowedOrigins.includes(origin)) {
		return badRequest;
	}

	if (origin && process.env.FRONTEND_URLS) {
		const allowedOrigins = process.env.FRONTEND_URLS.split(",") as string[];
		if (allowedOrigins.includes(origin)) {
			res.headers.append("Access-Control-Allow-Origin", origin);

			for (const [key, value] of Object.entries(CORS_HEADERS)) {
				res.headers.append(key, value);
			}
		}
	}

	return res;
}
