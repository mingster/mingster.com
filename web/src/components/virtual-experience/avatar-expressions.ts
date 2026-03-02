/**
 * Morph target weights for facial expressions (Ready Player Me / similar rigs).
 * Keys match expression names from API; values are morph target name -> weight.
 *
 * Equivalent to setting morphs directly on the head mesh:
 *   const head = avatar.getObjectByName('AvatarHead');
 *   const smileIndex = head.morphTargetDictionary['mouthSmile'];
 *   head.morphTargetInfluences[smileIndex] = 1.0; // 0.0 to 1.0
 * This file defines which morph names and weights each expression uses.
 */
export const FACIAL_EXPRESSIONS: Record<string, Record<string, number>> = {
	default: {},
	neutral: {},
	happy: {
		browInnerUp: 0.17,
		eyeSquintLeft: 0.4,
		eyeSquintRight: 0.44,
		noseSneerLeft: 0.17,
		noseSneerRight: 0.14,
		mouthPressLeft: 0.61,
		mouthPressRight: 0.41,
	},
	smile: {
		browInnerUp: 0.17,
		eyeSquintLeft: 0.4,
		eyeSquintRight: 0.44,
		noseSneerLeft: 0.17,
		noseSneerRight: 0.14,
		mouthPressLeft: 0.61,
		mouthPressRight: 0.41,
	},
	sad: {
		mouthFrownLeft: 1,
		mouthFrownRight: 1,
		mouthShrugLower: 0.78,
		browInnerUp: 0.45,
		eyeSquintLeft: 0.72,
		eyeSquintRight: 0.75,
		eyeLookDownLeft: 0.5,
		eyeLookDownRight: 0.5,
		jawForward: 1,
	},
	surprised: {
		eyeWideLeft: 0.5,
		eyeWideRight: 0.5,
		jawOpen: 0.35,
		mouthFunnel: 1,
		browInnerUp: 1,
	},
	angry: {
		browDownLeft: 1,
		browDownRight: 1,
		eyeSquintLeft: 1,
		eyeSquintRight: 1,
		jawForward: 1,
		jawLeft: 1,
		mouthShrugLower: 1,
		noseSneerLeft: 1,
		noseSneerRight: 0.42,
		eyeLookDownLeft: 0.16,
		eyeLookDownRight: 0.16,
		cheekSquintLeft: 1,
		cheekSquintRight: 1,
		mouthClose: 0.23,
		mouthFunnel: 0.63,
		mouthDimpleRight: 1,
	},
};

/**
 * Optional: map our morph keys to your model’s exact morph target names.
 * If expressions still don’t apply, copy the names from the console log
 * "[AvatarGLB] Model morph target names" and add mappings here, e.g.:
 *   browInnerUp: "Brow_Inner_Up",
 *   mouthPressLeft: "Mouth_Press_L",
 */
export const MORPH_NAME_ALIASES: Record<string, string> = {};

/** Expression keys for test buttons and API (same keys as FACIAL_EXPRESSIONS). */
export const EXPRESSION_KEYS = Object.keys(
	FACIAL_EXPRESSIONS,
) as (keyof typeof FACIAL_EXPRESSIONS)[];

/** All morph target names used in any expression (for resetting when switching expression). */
export const ALL_EXPRESSION_MORPH_NAMES = [
	...new Set(
		Object.values(FACIAL_EXPRESSIONS).flatMap((expr) => Object.keys(expr)),
	),
];

/** Rhubarb viseme value -> morph target name (for lip sync) */
export const VISEME_TO_MORPH: Record<string, string> = {
	A: "viseme_PP",
	B: "viseme_kk",
	C: "viseme_I",
	D: "viseme_AA",
	E: "viseme_O",
	F: "viseme_U",
	G: "viseme_FF",
	H: "viseme_TH",
	X: "viseme_PP",
};
