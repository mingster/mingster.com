"use client";

import { Suspense, useEffect, useState } from "react";
import { AvatarCapsule } from "./AvatarCapsule";
import { AvatarGLB } from "./AvatarGLB";

const CHARACTER_URL = "/models/character.glb";

/**
 * Avatar wrapper: if character.glb exists, render GLB avatar with morph targets;
 * otherwise render placeholder capsule.
 */
export function Avatar() {
	const [modelReady, setModelReady] = useState(false);

	useEffect(() => {
		fetch(CHARACTER_URL, { method: "HEAD" })
			.then((r) => setModelReady(r.ok))
			.catch(() => setModelReady(false));
	}, []);

	if (!modelReady) {
		return <AvatarCapsule />;
	}

	return (
		<Suspense fallback={<AvatarCapsule />}>
			<AvatarGLB />
		</Suspense>
	);
}
