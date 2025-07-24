import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { sqlClient } from "@/lib/prismadb";
import type { User } from "@/types";

//import { transformBigIntToNumbers, transformDecimalsToNumbers } from "@/utils/utils";

// return user object from database for signed in user.
//
const getUser = async (id: string | undefined): Promise<User | null> => {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	//const session = await auth();
	if (!session) {
		return null;
	}

	const obj = await sqlClient.user.findUnique({
		where: {
			//id: session.user.id,
			id: id,
		},
		include: {
			accounts: true,
			sessions: true,
			twofactors: true,
			apikeys: true,
			passkeys: true,
		},
	});

	return obj as User;
};

export default getUser;
