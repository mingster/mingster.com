import { Suspense } from "react";
import ClientSignIn from "@/components/auth/client-signin";
import { SignInSessionContinue } from "@/components/auth/sign-in-session-continue";
import { Loader } from "@/components/loader";
import { resolveOAuthCallbackUrl } from "@/lib/auth-sign-in-urls";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export default async function SignInPage(props: Props) {
	const { searchParams } = props;

	const searchParamsObj = await searchParams;
	const rawCallbackUrl = searchParamsObj.callbackUrl;
	const callbackUrl = resolveOAuthCallbackUrl(
		Array.isArray(rawCallbackUrl) ? rawCallbackUrl[0] : rawCallbackUrl,
	);

	return (
		<Suspense fallback={<Loader />}>
			<div className="w-full h-screen flex items-center justify-center">
				<SignInSessionContinue callbackUrl={callbackUrl}>
					<ClientSignIn callbackUrl={callbackUrl} />
				</SignInSessionContinue>
			</div>
		</Suspense>
	);
}
