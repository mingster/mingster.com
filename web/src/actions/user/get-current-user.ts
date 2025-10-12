import { auth } from "@/lib/auth";
import { sqlClient } from "@/lib/prismadb";
//import { User } from 'prisma/prisma-client';
import type { User } from "@/types";
import { transformDecimalsToNumbers } from "@/utils/utils";
import { headers } from "next/headers";

const getCurrentUser = async (): Promise<User | null> => {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	if (!session) {
		return null;
	}

	const obj = await sqlClient.user.findUnique({
		where: {
			id: session.user?.id ?? "",
		},
		include: {
			accounts: true,
			sessions: true,
			twofactors: true,
			apikeys: true,
			passkeys: true,
			members: true,
			invitations: true,
		},
	});

	if (obj) {
		transformDecimalsToNumbers(obj);
	}

	return obj;
};

export default getCurrentUser;
