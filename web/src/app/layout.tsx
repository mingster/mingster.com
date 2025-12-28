import { GoogleAnalytics } from "@next/third-parties/google";
import type { Viewport } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { CookiesProvider } from "next-client-cookies/server";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { cookieName, fallbackLng } from "@/app/i18n/settings";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { IOSVersionCheck } from "@/components/ios-version-check";
import { RecaptchaScript } from "@/components/recaptcha-script";
import { Toaster } from "@/components/toaster";
import I18nProvider from "@/providers/i18n-provider";
import { SessionWrapper } from "@/providers/session-provider";
import "./css/globals.css";
import { getT } from "@/app/i18n";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	// Also supported but less commonly used
	// interactiveWidget: 'resizes-visual',
};

const title = "mingster.com";

export async function generateMetadata() {
	const { t } = await getT("tw", "translation");

	return {
		title: t("meta_site_title"),
		/* 
		 title: {
		   template: `%s | ${title}`,
		   default: title, // a default is required when creating a template
	   }, */

		keywords: ["", "", ""],
		authors: [{ name: title, url: "https://mingster.com" }],
		creator: title,
		publisher: title,

		openGraph: {
			title: title,
			description: "",
			url: "https://mingster.com",
			siteName: title,
			type: "website",
		},
		robots: {
			index: false,
			follow: true,
			nocache: true,
			googleBot: {
				index: true,
				follow: false,
				noimageindex: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		manifest: "/favicons/site.webmanifest",
		applicationName: title,
		/*
	  appleWebApp: {
		title: title,
		capable: true,
		statusBarStyle: 'default',
	  },
	  themeColor: [
		{ media: '(prefers-color-scheme: dark)', color: '#38bdf8' },
		{ media: '(prefers-color-scheme: light)', color: '#f8fafc' },
	  ],
	  */
		icons: {
			icon: "/favicons/favicon-16x16.png",
			shortcut: "/favicons/favicon-32x32.png",
			apple: [
				{ url: "/favicons/apple-touch-icon.png" },
				{
					url: "/favicons/apple-touch-icon.png",
					sizes: "180x180",
					type: "image/png",
				},
			],
			other: {
				rel: "apple-touch-icon-precomposed",
				url: "/favicons/apple-touch-icon.png",
			},
		},
		verification: {
			google: "google",
			yandex: "yandex",
			yahoo: "yahoo",
			other: {
				"google-site-verification": "google-site-verification",
			},
		},
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const langCookie = cookieStore.get(cookieName);
	const htmlLang = langCookie?.value ?? fallbackLng;

	//</RecaptchaProvider>
	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<head suppressHydrationWarning={true} />
			<body className={"antialiased"}>
				<Script
					id="theme-init"
					strategy="beforeInteractive"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Theme initialization must run before hydration to prevent flash
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var theme = localStorage.getItem('theme');
									var isDark = false;
									
									if (theme === 'dark') {
										isDark = true;
									} else if (theme === 'light') {
										isDark = false;
									} else if (theme === 'system' || !theme) {
										// Use system preference or default to dark
										isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
									}
									
									if (isDark) {
										document.documentElement.classList.add('dark');
									} else {
										document.documentElement.classList.remove('dark');
									}
								} catch (e) {}
							})();
						`,
					}}
				/>
				<RecaptchaScript useEnterprise={true} />
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<CookiesProvider>
						<I18nProvider initialLng={htmlLang}>
							<SessionWrapper>
								<IOSVersionCheck>
									<Suspense fallback={null}>
										<PageViewTracker />
									</Suspense>
									{children}
								</IOSVersionCheck>
							</SessionWrapper>
						</I18nProvider>
					</CookiesProvider>
				</ThemeProvider>
				<Toaster />
				{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
					<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
				)}
			</body>
		</html>
	);
}
