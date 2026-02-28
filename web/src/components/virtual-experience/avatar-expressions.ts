/**
 * Morph target weights for facial expressions (Ready Player Me / similar rigs).
 * Keys match expression names from API; values are morph target name -> weight.
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
