"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import type { LipsyncData } from "@/types/virtual-experience";
import { FACIAL_EXPRESSIONS, VISEME_TO_MORPH } from "./avatar-expressions";

const CHARACTER_URL = "/models/character.glb";

/** Map message animation key to FBX path under public (kebab-case filenames). */
const ANIMATION_FBX: Record<string, string> = {
	Angry: "animations/angry.fbx",
};

/** FBX played in a loop when idle (no current message). Same rig as character. */
const STANDING_IDLE_FBX = "animations/standing-idle.fbx";

/** Collect all node/bone names under root (scene + skeleton bones) so we can filter clip tracks. */
function collectNodeNames(root: THREE.Object3D): Set<string> {
	const names = new Set<string>();
	root.traverse((obj) => {
		if (obj.name) names.add(obj.name);
		if (obj instanceof THREE.SkinnedMesh && obj.skeleton) {
			for (const bone of obj.skeleton.bones) {
				if (bone.name) names.add(bone.name);
			}
		}
	});
	return names;
}

/** Return a clip that only includes tracks whose target node exists under root. Silences "No target node found" warnings when FBX rig has more bones (e.g. finger/toe tips) than the character. */
function filterClipForRoot(
	clip: THREE.AnimationClip,
	root: THREE.Object3D,
): THREE.AnimationClip {
	const names = collectNodeNames(root);
	const keptTracks: THREE.KeyframeTrack[] = [];
	for (const track of clip.tracks) {
		const path = track.name.replace(/\.[^.]+$/, "");
		const lastSegment = path.split(/[./]/).pop() ?? path;
		if (names.has(path) || names.has(lastSegment)) {
			keptTracks.push(track);
		}
	}
	if (keptTracks.length === 0) return clip;
	return new THREE.AnimationClip(clip.name, clip.duration, keptTracks);
}

// Draco decoder for compressed character.glb (see bin/compress-character-glb.ts)
if (typeof window !== "undefined") {
	useGLTF.setDecoderPath(
		"https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
	);
}

function getSkeleton(root: THREE.Object3D): THREE.Skeleton | null {
	let sk: THREE.Skeleton | null = null;
	root.traverse((child) => {
		if (child instanceof THREE.SkinnedMesh && child.skeleton)
			sk = child.skeleton;
	});
	return sk;
}

const BREATH_AMPLITUDE = 0.004;
const BREATH_SPEED = 1.2;
const _breathAxis = new THREE.Vector3(0, 0, 1);
const _breathOffset = new THREE.Vector3();

function applyBreathing(
	skeleton: THREE.Skeleton,
	time: number,
	prevScalarRef: React.MutableRefObject<number>,
) {
	const scalar = Math.sin(time * BREATH_SPEED);
	for (const bone of skeleton.bones) {
		const name = bone.name.toLowerCase();
		const isChestOrSpine =
			(name.includes("chest") || name.includes("spine")) &&
			!name.includes("neck") &&
			!name.includes("head");
		if (!isChestOrSpine) continue;
		_breathAxis.set(0, 0, 1).applyQuaternion(bone.quaternion);
		_breathOffset
			.copy(_breathAxis)
			.multiplyScalar(BREATH_AMPLITUDE * prevScalarRef.current);
		bone.position.sub(_breathOffset);
		_breathOffset.copy(_breathAxis).multiplyScalar(BREATH_AMPLITUDE * scalar);
		bone.position.add(_breathOffset);
	}
	prevScalarRef.current = scalar;
}

// Idle look: head and eyes look right 5° then turn back (cycle with breathing)
const LOOK_RIGHT_ANGLE_MAX = (5 * Math.PI) / 180; // 5°
const LOOK_CYCLE_SPEED = 0.8;
const _lookY = new THREE.Vector3(0, 1, 0);
const _lookQ = new THREE.Quaternion();

// Idle eyes: look left then right every 5 sec
const EYE_GAZE_INTERVAL = 5;
const EYE_GAZE_ANGLE = (9 * Math.PI) / 180; // 6° left/right
const _gazeQ = new THREE.Quaternion();

function applyIdleLookRight(
	skeleton: THREE.Skeleton,
	time: number,
	headBaseRef: React.MutableRefObject<THREE.Quaternion | null>,
	neckBaseRef: React.MutableRefObject<THREE.Quaternion | null>,
	eyeBasesRef: React.MutableRefObject<Map<string, THREE.Quaternion>>,
) {
	// 0 → 5° right → 0 (turn back) in a smooth cycle
	const t = (1 + Math.sin(time * LOOK_CYCLE_SPEED)) / 2;
	const angle = -LOOK_RIGHT_ANGLE_MAX * t; // negative Y = right

	// Eyes: every 5 sec switch between look left and look right (phase 0 = left, 1 = right)
	const gazePhase = Math.floor(time / EYE_GAZE_INTERVAL) % 2;
	const gazeAngle = gazePhase === 0 ? -EYE_GAZE_ANGLE : EYE_GAZE_ANGLE;
	_gazeQ.setFromAxisAngle(_lookY, gazeAngle);

	let headBone: THREE.Bone | null = null;
	let neckBone: THREE.Bone | null = null;
	const eyeBones: THREE.Bone[] = [];
	for (const bone of skeleton.bones) {
		const name = bone.name.toLowerCase();
		if (name.includes("head") && !name.includes("upper")) headBone = bone;
		if ((name.includes("neck") || name === "upperneck") && !neckBone)
			neckBone = bone;
		if (
			name.includes("eye") &&
			(name.includes("left") || name.includes("right"))
		)
			eyeBones.push(bone);
	}
	_lookQ.setFromAxisAngle(_lookY, angle);
	if (headBone) {
		if (!headBaseRef.current) headBaseRef.current = headBone.quaternion.clone();
		headBone.quaternion.copy(headBaseRef.current).premultiply(_lookQ);
	}
	_lookQ.setFromAxisAngle(_lookY, angle * 0.4);
	if (neckBone) {
		if (!neckBaseRef.current) neckBaseRef.current = neckBone.quaternion.clone();
		neckBone.quaternion.copy(neckBaseRef.current).premultiply(_lookQ);
	}
	_lookQ.setFromAxisAngle(_lookY, angle * 0.5);
	for (const bone of eyeBones) {
		if (!eyeBasesRef.current.has(bone.uuid))
			eyeBasesRef.current.set(bone.uuid, bone.quaternion.clone());
		const base = eyeBasesRef.current.get(bone.uuid);
		if (base) {
			bone.quaternion.copy(base).premultiply(_lookQ).premultiply(_gazeQ);
		}
	}
}

function restoreIdleLook(
	skeleton: THREE.Skeleton,
	headBaseRef: React.MutableRefObject<THREE.Quaternion | null>,
	neckBaseRef: React.MutableRefObject<THREE.Quaternion | null>,
	eyeBasesRef: React.MutableRefObject<Map<string, THREE.Quaternion>>,
) {
	for (const bone of skeleton.bones) {
		const name = bone.name.toLowerCase();
		if (
			name.includes("head") &&
			!name.includes("upper") &&
			headBaseRef.current
		) {
			bone.quaternion.copy(headBaseRef.current);
		} else if (
			(name.includes("neck") || name === "upperneck") &&
			neckBaseRef.current
		) {
			bone.quaternion.copy(neckBaseRef.current);
		} else if (
			name.includes("eye") &&
			(name.includes("left") || name.includes("right"))
		) {
			const base = eyeBasesRef.current.get(bone.uuid);
			if (base) bone.quaternion.copy(base);
		}
	}
	headBaseRef.current = null;
	neckBaseRef.current = null;
	eyeBasesRef.current.clear();
}

// Idle: arms relaxed — down, slightly away, with a bit of bend at shoulder and elbow (not stick-straight).
const _ARMS_PARALLEL_ANGLE = Math.PI / 2;
const _ARM_AWAY_ANGLE = 0.18; // rad, ~10° — upper arms away from body
const _UPPER_ARM_BEND = 0.1; // rad, ~6° — slight bend at shoulder so upper arm not perfectly straight
const _FOREARM_BEND = 0.22; // rad, ~12° — elbow bend so forearm angles slightly (relaxed hang)
const _armX = new THREE.Vector3(1, 0, 0);
const _armY = new THREE.Vector3(0, 1, 0);
const _armZ = new THREE.Vector3(0, 0, 1);
const _armQ = new THREE.Quaternion();
const _armAwayQ = new THREE.Quaternion();
const _armBendQ = new THREE.Quaternion();

function isArmOrHandBone(name: string): boolean {
	const n = name.toLowerCase();
	const side =
		n.includes("left") ||
		n.includes("right") ||
		n.includes("_l") ||
		n.includes("_r") ||
		n.endsWith("l") ||
		n.endsWith("r");
	const limb = n.includes("arm") || n.includes("hand");
	return side && limb;
}

function captureTPose(
	skeleton: THREE.Skeleton,
	tPoseRef: React.MutableRefObject<Map<string, THREE.Quaternion>>,
) {
	for (const bone of skeleton.bones) {
		if (!isArmOrHandBone(bone.name)) continue;
		tPoseRef.current.set(bone.uuid, bone.quaternion.clone());
	}
}

/** Apply idle pose: arms and hands straight down, parallel with body. */
function _applyArmsParallelWithBody(
	skeleton: THREE.Skeleton,
	tPoseRef: React.MutableRefObject<Map<string, THREE.Quaternion>>,
) {
	for (const bone of skeleton.bones) {
		const name = bone.name.toLowerCase();
		const isLeft =
			name.includes("left") || name.includes("_l") || name.endsWith("l");
		const isRight =
			name.includes("right") || name.includes("_r") || name.endsWith("r");
		if (!isLeft && !isRight) continue;
		const isUpperArm =
			name.includes("upperarm") ||
			name.includes("upper_arm") ||
			(name.includes("arm") &&
				!name.includes("forearm") &&
				!name.includes("lower"));
		const isForearm =
			name.includes("forearm") ||
			name.includes("lowerarm") ||
			name.includes("lower_arm");
		const isHand = name.includes("hand");
		if (!isUpperArm && !isForearm && !isHand) continue;
		const base = tPoseRef.current.get(bone.uuid);
		if (!base) continue;
	}
}

function _restoreArmsToTPose(
	skeleton: THREE.Skeleton,
	tPoseRef: React.MutableRefObject<Map<string, THREE.Quaternion>>,
) {
	for (const bone of skeleton.bones) {
		if (!isArmOrHandBone(bone.name)) continue;
		const base = tPoseRef.current.get(bone.uuid);
		if (base) bone.quaternion.copy(base);
	}
}

const _leftHandWorldPos = new THREE.Vector3();

/** Get left hand bone world position (x, y, z). Call after skeleton pose is applied and scene.updateMatrixWorld(true) has run. */
function getLeftHandWorldPosition(
	skeleton: THREE.Skeleton,
	root: THREE.Object3D,
): { x: number; y: number; z: number } | null {
	const name = (n: string) => n.toLowerCase();
	for (const bone of skeleton.bones) {
		if (name(bone.name).includes("left") && name(bone.name).includes("hand")) {
			root.updateMatrixWorld(true);
			bone.getWorldPosition(_leftHandWorldPos);
			return {
				x: _leftHandWorldPos.x,
				y: _leftHandWorldPos.y,
				z: _leftHandWorldPos.z,
			};
		}
	}
	return null;
}

function lerpMorphTarget(
	scene: THREE.Group,
	target: string,
	value: number,
	speed: number,
) {
	scene.traverse((child) => {
		if (
			child instanceof THREE.SkinnedMesh &&
			child.morphTargetDictionary &&
			child.morphTargetInfluences
		) {
			const index = child.morphTargetDictionary[target];
			if (
				index === undefined ||
				child.morphTargetInfluences[index] === undefined
			)
				return;
			child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
				child.morphTargetInfluences[index],
				value,
				speed,
			);
		}
	});
}

export function AvatarGLB() {
	const character = useGLTF(CHARACTER_URL, true);
	const { scene } = character;
	const groupRef = useRef<THREE.Group>(null);
	const prevBreathScalarRef = useRef(0);
	const headBaseRef = useRef<THREE.Quaternion | null>(null);
	const neckBaseRef = useRef<THREE.Quaternion | null>(null);
	const eyeBasesRef = useRef<Map<string, THREE.Quaternion>>(new Map());
	const tPoseArmRef = useRef<Map<string, THREE.Quaternion>>(new Map());
	const leftHandPositionLoggedRef = useRef(false);
	const mixerRef = useRef<THREE.AnimationMixer | null>(null);
	const fbxActionRef = useRef<THREE.AnimationAction | null>(null);
	const idleMixerRef = useRef<THREE.AnimationMixer | null>(null);
	const idleActionRef = useRef<THREE.AnimationAction | null>(null);

	const { currentMessage, onMessagePlayed } = useChat();
	const isIdle = currentMessage === null;
	const animationKey = currentMessage?.animation;
	const fbxPath = animationKey
		? ANIMATION_FBX[animationKey] ??
			ANIMATION_FBX[animationKey.charAt(0).toUpperCase() + animationKey.slice(1).toLowerCase()]
		: undefined;

	const [facialExpressionKey, setFacialExpressionKey] = useState("");
	const [lipsyncData, setLipsyncData] = useState<LipsyncData | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [blink, setBlink] = useState(false);

	// Eye blink when idle (part of breathing / idle behavior)
	useEffect(() => {
		if (!isIdle) return;
		let blinkTimeout: ReturnType<typeof setTimeout>;
		const scheduleNext = () => {
			blinkTimeout = setTimeout(
				() => {
					setBlink(true);
					setTimeout(() => {
						setBlink(false);
						scheduleNext();
					}, 200);
				},
				THREE.MathUtils.randInt(2000, 5000),
			);
		};
		scheduleNext();
		return () => clearTimeout(blinkTimeout);
	}, [isIdle]);

	// When message requests an FBX animation (e.g. Angry), load and play it on the character
	useEffect(() => {
		if (!fbxPath || !scene) return;
		let cancelled = false;
		(async () => {
			try {
				const { FBXLoader } = await import(
					"three/examples/jsm/loaders/FBXLoader.js"
				);
				const loader = new FBXLoader();
				const fbx = await loader.loadAsync(`/${fbxPath}`);
				if (cancelled || !fbx.animations?.length) return;
				// Stop previous action
				if (fbxActionRef.current) {
					fbxActionRef.current.stop();
					fbxActionRef.current = null;
				}
				if (mixerRef.current) mixerRef.current.uncacheRoot(scene);
				const mixer = new THREE.AnimationMixer(scene);
				mixerRef.current = mixer;
				const rawClip = fbx.animations[0];
				const clip = filterClipForRoot(rawClip, scene);
				const action = mixer.clipAction(clip, scene);
				action.setLoop(THREE.LoopOnce, 1);
				action.clampWhenFinished = true;
				action.play();
				fbxActionRef.current = action;
			} catch (err) {
				if (!cancelled) console.warn("FBX animation load failed:", err);
			}
		})();
		return () => {
			cancelled = true;
			if (fbxActionRef.current) {
				fbxActionRef.current.stop();
				fbxActionRef.current = null;
			}
			if (mixerRef.current) {
				mixerRef.current.uncacheRoot(scene);
				mixerRef.current = null;
			}
		};
	}, [fbxPath, scene]);

	// When idle (no current message), play Standing Idle FBX in a loop
	useEffect(() => {
		if (!isIdle || fbxPath || !scene) {
			if (idleActionRef.current) {
				idleActionRef.current.stop();
				idleActionRef.current = null;
			}
			if (idleMixerRef.current) {
				idleMixerRef.current.uncacheRoot(scene);
				idleMixerRef.current = null;
			}
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const { FBXLoader } = await import(
					"three/examples/jsm/loaders/FBXLoader.js"
				);
				const loader = new FBXLoader();
				const fbx = await loader.loadAsync(`/${STANDING_IDLE_FBX}`);
				if (cancelled || !fbx.animations?.length) return;
				if (idleActionRef.current) {
					idleActionRef.current.stop();
					idleActionRef.current = null;
				}
				if (idleMixerRef.current) idleMixerRef.current.uncacheRoot(scene);
				const mixer = new THREE.AnimationMixer(scene);
				idleMixerRef.current = mixer;
				const rawClip = fbx.animations[0];
				const clip = filterClipForRoot(rawClip, scene);
				const action = mixer.clipAction(clip, scene);
				action.setLoop(THREE.LoopRepeat, Infinity);
				action.play();
				idleActionRef.current = action;
			} catch (err) {
				if (!cancelled) console.warn("Standing Idle FBX load failed:", err);
			}
		})();
		return () => {
			cancelled = true;
			if (idleActionRef.current) {
				idleActionRef.current.stop();
				idleActionRef.current = null;
			}
			if (idleMixerRef.current) {
				idleMixerRef.current.uncacheRoot(scene);
				idleMixerRef.current = null;
			}
		};
	}, [isIdle, fbxPath, scene]);

	// When current message changes: set expression, lipsync, play audio
	useEffect(() => {
		if (!currentMessage) {
			setFacialExpressionKey("default");
			setLipsyncData(null);
			return;
		}
		setFacialExpressionKey(currentMessage.facialExpression ?? "default");
		setLipsyncData(currentMessage.lipsync ?? null);

		if (currentMessage.audio) {
			const mime = currentMessage.audioMime ?? "audio/wav";
			const audio = new Audio(`data:${mime};base64,${currentMessage.audio}`);
			audioRef.current = audio;
			audio.play().catch((err) => {
				console.warn("Audio play failed:", err);
				onMessagePlayed();
			});
			audio.onended = () => {
				audioRef.current = null;
				onMessagePlayed();
			};
		} else {
			const t = setTimeout(() => onMessagePlayed(), 2000);
			return () => clearTimeout(t);
		}
	}, [currentMessage, onMessagePlayed]);

	// useFrame: update FBX mixers (message clip + idle clip); when no clip playing apply procedural pose
	useFrame((state) => {
		const delta = state.clock.getDelta();
		if (mixerRef.current) mixerRef.current.update(delta);
		if (idleMixerRef.current) idleMixerRef.current.update(delta);

		const skeleton = getSkeleton(scene);
		const fbxPlaying =
			fbxActionRef.current?.isRunning() || idleActionRef.current?.isRunning();
		if (skeleton && !fbxPlaying) {
			if (tPoseArmRef.current.size === 0) captureTPose(skeleton, tPoseArmRef);
			if (isIdle) {
				applyBreathing(skeleton, state.clock.elapsedTime, prevBreathScalarRef);
				applyIdleLookRight(
					skeleton,
					state.clock.elapsedTime,
					headBaseRef,
					neckBaseRef,
					eyeBasesRef,
				);
				_applyArmsParallelWithBody(skeleton, tPoseArmRef);
				// Log left hand world position (x, y, z) once for debugging
				if (!leftHandPositionLoggedRef.current) {
					const pos = getLeftHandWorldPosition(skeleton, scene);
					if (pos) {
						// eslint-disable-next-line no-console
						console.log("Left hand world position (x, y, z):", pos);
						leftHandPositionLoggedRef.current = true;
					}
				}
			} else {
				if (
					headBaseRef.current ??
					neckBaseRef.current ??
					eyeBasesRef.current.size > 0
				) {
					restoreIdleLook(skeleton, headBaseRef, neckBaseRef, eyeBasesRef);
				}
				_restoreArmsToTPose(skeleton, tPoseArmRef);
			}
		}

		const expressionMap =
			FACIAL_EXPRESSIONS[facialExpressionKey] ?? FACIAL_EXPRESSIONS.default;
		const appliedVisemes: string[] = [];

		for (const [key, value] of Object.entries(expressionMap)) {
			if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") continue;
			lerpMorphTarget(scene, key, value, 0.1);
		}
		// Blink when idle (part of breathing); otherwise use expression map
		const blinkValue = isIdle
			? blink
				? 1
				: 0
			: (expressionMap.eyeBlinkLeft ?? 0);
		lerpMorphTarget(scene, "eyeBlinkLeft", blinkValue, 0.5);
		lerpMorphTarget(scene, "eyeBlinkRight", blinkValue, 0.5);

		const audio = audioRef.current;
		if (currentMessage && lipsyncData?.mouthCues && audio) {
			const time = audio.currentTime;
			for (const cue of lipsyncData.mouthCues) {
				if (time >= cue.start && time <= cue.end) {
					const morph = VISEME_TO_MORPH[cue.value];
					if (morph) {
						appliedVisemes.push(morph);
						lerpMorphTarget(scene, morph, 1, 0.2);
					}
					break;
				}
			}
		}
		for (const morph of Object.values(VISEME_TO_MORPH)) {
			if (!appliedVisemes.includes(morph)) {
				lerpMorphTarget(scene, morph, 0, 0.1);
			}
		}
	});

	return (
		<group ref={groupRef}>
			<primitive object={scene} />
		</group>
	);
}

if (typeof window !== "undefined") {
	useGLTF.preload(CHARACTER_URL, true);
}
