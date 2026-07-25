import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

export const dynamicParams = false;

// The route segment is [authView], so the key returned here must be `authView`.
export function generateStaticParams() {
	return Object.values(authViewPaths).map((authView) => ({ authView }));
}

export default async function AuthPage({
	params,
}: {
	params: Promise<{ authView: string }>;
}) {
	const { authView } = await params;

	return (
		<main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
			<AuthView path={authView} />
		</main>
	);
}
