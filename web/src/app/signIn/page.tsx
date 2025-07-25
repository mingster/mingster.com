import { Suspense } from "react";
import ClientSignIn from "@/components/auth/client-signin";
import { Loader } from "@/components/ui/loader";
import logger from "@/utils/logger";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export default async function SignInPage(props: Props) {
	const log = logger.child({ module: "SignInPage" });

	const { searchParams } = props;

	const searchParamsObj = await searchParams;
	const callbackUrl = (searchParamsObj.callbackUrl as string) || "/";
	log.info({ callbackUrl });

	return (
		<Suspense fallback={<Loader />}>
			<div className="w-full h-screen flex items-center justify-center">
				<ClientSignIn callbackUrl={callbackUrl} />
			</div>
		</Suspense>
	);
}
