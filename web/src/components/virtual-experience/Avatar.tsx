"use client";

import { useEffect, useState, Suspense } from "react";
import { AvatarCapsule } from "./AvatarCapsule";
import { AvatarGLB } from "./AvatarGLB";

const CHARACTER_URL = "/models/character.glb";
const ANIMATIONS_URL = "/models/animations.glb";

/**
 * Avatar wrapper: if character.glb and animations.glb exist, render GLB avatar with
 * animations and morph targets; otherwise render placeholder capsule.
 */
export function Avatar() {
	const [modelReady, setModelReady] = useState(false);

	useEffect(() => {
		Promise.all([
			fetch(CHARACTER_URL, { method: "HEAD" }).then((r) => r.ok),
			fetch(ANIMATIONS_URL, { method: "HEAD" }).then((r) => r.ok),
		])
			.then(([a, b]) => setModelReady(a && b))
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
