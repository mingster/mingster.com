import { CookiesProvider } from "next-client-cookies/server";
//import { getT } from "@/app/i18n";
import { Toaster } from "@/components/ui/sonner";
import { SessionWrapper } from "@/providers/auth-provider";
import I18nProvider from "@/providers/i18n-provider";
import NextThemeProvider from "@/providers/theme-provider";

import "./globals.css";
import type { Viewport } from "next";
import { getT } from "./i18n";

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
	/*bg-[url(/img/bg.jpg)] bg-background  */
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`overscroll-none antialiased dark [--scroll-mt:9.875rem] lg:[--scroll-mt:6.3125rem] [scrollbar-gutter:stable]`}
			>
				<NextThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<CookiesProvider>
						<I18nProvider>
							<SessionWrapper>{children}</SessionWrapper>
						</I18nProvider>
					</CookiesProvider>
				</NextThemeProvider>
				<Toaster />
			</body>
		</html>
	);
}
