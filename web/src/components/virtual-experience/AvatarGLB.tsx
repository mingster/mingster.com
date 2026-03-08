"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";

const CHARACTER_URL = "/models/character.glb";

/** Mixamo FBX in public/animations/. Playback: FBXLoader → retargetClip or filterClipForRoot → AnimationMixer → play. */
const ANIMATION_FBX: Record<string, string> = {
	Dancing: "animations/dancing.fbx",
	Defeated: "animations/defeated.fbx",
	Idle: "animations/idle.fbx",
	Salute: "animations/salute.fbx",
	HappyIdle: "animations/happyidle.fbx",
	Hook: "animations/hook.fbx",
};

export const ANIMATION_KEYS = Object.keys(ANIMATION_FBX);

/** Idle when no current message. */
const STANDING_IDLE_FBX = "animations/standing-idle.fbx";

/** Message animations: play at least this many frames (at 60fps) and slow down a bit. */
const MIN_PLAY_FRAMES = 150;
const MAX_TIMESCALE = 0.75; // cap speed so animation is a bit slower

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

function getFirstSkinnedMesh(root: THREE.Object3D): THREE.SkinnedMesh | null {
	let mesh: THREE.SkinnedMesh | null = null;
	root.traverse((child) => {
		if (mesh) return;
		if (child instanceof THREE.SkinnedMesh && child.skeleton) mesh = child;
	});
	return mesh;
}

/** Avaturn (target) bone name → Mixamo (source) bone name for retargetClip. */
const AVATURN_TO_MIXAMO_NAMES: Record<string, string> = {
	Hips: "mixamorigHips",
	Spine: "mixamorigSpine",
	Spine1: "mixamorigSpine1",
	Spine2: "mixamorigSpine2",
	Chest: "mixamorigSpine2",
	Neck: "mixamorigNeck",
	Head: "mixamorigHead",
	LeftUpperArm: "mixamorigLeftArm",
	LeftArm: "mixamorigLeftArm",
	LeftLowerArm: "mixamorigLeftForeArm",
	LeftForeArm: "mixamorigLeftForeArm",
	LeftHand: "mixamorigLeftHand",
	RightUpperArm: "mixamorigRightArm",
	RightArm: "mixamorigRightArm",
	RightLowerArm: "mixamorigRightForeArm",
	RightForeArm: "mixamorigRightForeArm",
	RightHand: "mixamorigRightHand",
	LeftUpperLeg: "mixamorigLeftUpLeg",
	LeftUpLeg: "mixamorigLeftUpLeg",
	LeftLowerLeg: "mixamorigLeftLeg",
	LeftLeg: "mixamorigLeftLeg",
	LeftFoot: "mixamorigLeftFoot",
	LeftToeBase: "mixamorigLeftToeBase",
	RightUpperLeg: "mixamorigRightUpLeg",
	RightUpLeg: "mixamorigRightUpLeg",
	RightLowerLeg: "mixamorigRightLeg",
	RightLeg: "mixamorigRightLeg",
	RightFoot: "mixamorigRightFoot",
	RightToeBase: "mixamorigRightToeBase",
};

export function AvatarGLB() {
	const character = useGLTF(CHARACTER_URL, true);
	const { scene } = character;
	const groupRef = useRef<THREE.Group>(null);
	const mixerRef = useRef<THREE.AnimationMixer | null>(null);
	const mixerRootRef = useRef<THREE.Object3D | null>(null);
	const fbxActionRef = useRef<THREE.AnimationAction | null>(null);
	const onAnimationFinishedRef = useRef<(() => void) | null>(null);
	const idleMixerRef = useRef<THREE.AnimationMixer | null>(null);
	const idleActionRef = useRef<THREE.AnimationAction | null>(null);
	const idleMixerRootRef = useRef<THREE.Object3D | null>(null);

	const { currentMessage, onMessagePlayed } = useChat();
	const isIdle = currentMessage === null;
	const animationKey = currentMessage?.animation;
	const fbxPath =
		!currentMessage?.animationGlb && animationKey
			? ANIMATION_FBX[animationKey] ??
				ANIMATION_FBX[
					animationKey.charAt(0).toUpperCase() +
						animationKey.slice(1).toLowerCase()
				] ??
				(animationKey.endsWith(".fbx") ? animationKey : undefined)
			: undefined;

	// Message-driven Mixamo FBX: load, retarget or filter, play once
	useEffect(() => {
		if (!fbxPath || !scene) return;
		let cancelled = false;
		(async () => {
			try {
				const [{ FBXLoader }, { retargetClip }] = await Promise.all([
					import("three/examples/jsm/loaders/FBXLoader.js"),
					import("three/examples/jsm/utils/SkeletonUtils.js"),
				]);
				const loader = new FBXLoader();
				const fbx = await loader.loadAsync(`/${fbxPath}`);
				if (cancelled || !fbx.animations?.length) return;
				if (fbxActionRef.current) {
					fbxActionRef.current.stop();
					fbxActionRef.current = null;
				}
				if (mixerRef.current && mixerRootRef.current) {
					mixerRef.current.uncacheRoot(mixerRootRef.current);
				}
				const charMesh = getFirstSkinnedMesh(scene);
				const fbxMesh = getFirstSkinnedMesh(fbx);
				const rawClip = fbx.animations[0];
				let clip: THREE.AnimationClip;
				let mixerRoot: THREE.Object3D;
				if (charMesh && fbxMesh) {
					const hipBone = charMesh.skeleton.bones.find((b) =>
						b.name.toLowerCase().includes("hip"),
					);
					clip = retargetClip(charMesh, fbxMesh, rawClip, {
						names: AVATURN_TO_MIXAMO_NAMES,
						hip: hipBone?.name ?? "Hips",
					});
					mixerRoot = scene;
				} else {
					clip = filterClipForRoot(rawClip, scene);
					mixerRoot = scene;
				}
				const mixer = new THREE.AnimationMixer(mixerRoot);
				mixerRef.current = mixer;
				mixerRootRef.current = mixerRoot;
				const action = mixer.clipAction(clip, mixerRoot);
				action.setLoop(THREE.LoopRepeat, 1);
				action.clampWhenFinished = true;
				// Slow down so we play at least MIN_PLAY_FRAMES and never faster than MAX_TIMESCALE
				const timeScaleForMinFrames = (clip.duration * 60) / MIN_PLAY_FRAMES;
				action.timeScale = Math.min(1, MAX_TIMESCALE, timeScaleForMinFrames);
				action.play();
				fbxActionRef.current = action;
				// Advance message only after animation finishes (all 3 loops)
				const handler = () => onMessagePlayed();
				onAnimationFinishedRef.current = handler;
				mixer.addEventListener("finished", handler);
			} catch (err) {
				if (!cancelled) console.warn("FBX animation load failed:", err);
			}
		})();
		return () => {
			cancelled = true;
			const mixer = mixerRef.current;
			const handler = onAnimationFinishedRef.current;
			if (mixer && handler) mixer.removeEventListener("finished", handler);
			onAnimationFinishedRef.current = null;
			if (fbxActionRef.current) {
				fbxActionRef.current.stop();
				fbxActionRef.current = null;
			}
			if (mixerRef.current && mixerRootRef.current) {
				mixerRef.current.uncacheRoot(mixerRootRef.current);
				mixerRef.current = null;
				mixerRootRef.current = null;
			}
		};
	}, [fbxPath, scene, onMessagePlayed]);

	// Idle: play standing-idle FBX in a loop
	useEffect(() => {
		if (!isIdle || fbxPath || !scene) {
			if (idleActionRef.current) {
				idleActionRef.current.stop();
				idleActionRef.current = null;
			}
			if (idleMixerRef.current && idleMixerRootRef.current) {
				idleMixerRef.current.uncacheRoot(idleMixerRootRef.current);
				idleMixerRef.current = null;
				idleMixerRootRef.current = null;
			}
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const [{ FBXLoader }, { retargetClip }] = await Promise.all([
					import("three/examples/jsm/loaders/FBXLoader.js"),
					import("three/examples/jsm/utils/SkeletonUtils.js"),
				]);
				const loader = new FBXLoader();
				const fbx = await loader.loadAsync(`/${STANDING_IDLE_FBX}`);
				if (cancelled || !fbx.animations?.length) return;
				if (idleActionRef.current) {
					idleActionRef.current.stop();
					idleActionRef.current = null;
				}
				if (idleMixerRef.current && idleMixerRootRef.current) {
					idleMixerRef.current.uncacheRoot(idleMixerRootRef.current);
				}
				const charMesh = getFirstSkinnedMesh(scene);
				const fbxMesh = getFirstSkinnedMesh(fbx);
				const rawClip = fbx.animations[0];
				let clip: THREE.AnimationClip;
				let mixerRoot: THREE.Object3D;
				if (charMesh && fbxMesh) {
					const hipBone = charMesh.skeleton.bones.find((b) =>
						b.name.toLowerCase().includes("hip"),
					);
					clip = retargetClip(charMesh, fbxMesh, rawClip, {
						names: AVATURN_TO_MIXAMO_NAMES,
						hip: hipBone?.name ?? "Hips",
					});
					mixerRoot = scene;
				} else {
					clip = filterClipForRoot(rawClip, scene);
					mixerRoot = scene;
				}
				const mixer = new THREE.AnimationMixer(mixerRoot);
				idleMixerRef.current = mixer;
				idleMixerRootRef.current = mixerRoot;
				const action = mixer.clipAction(clip, mixerRoot);
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
			if (idleMixerRef.current && idleMixerRootRef.current) {
				idleMixerRef.current.uncacheRoot(idleMixerRootRef.current);
				idleMixerRef.current = null;
				idleMixerRootRef.current = null;
			}
		};
	}, [isIdle, fbxPath, scene]);

	// Play message audio when present; message advances when animation finishes (mixer 'finished')
	useEffect(() => {
		if (!currentMessage?.audio) return;
		const mime = currentMessage.audioMime ?? "audio/wav";
		const audio = new Audio(`data:${mime};base64,${currentMessage.audio}`);
		audio.play().catch(() => {});
	}, [currentMessage]);

	// Update Mixamo animation mixers only
	useFrame((_state, delta) => {
		if (mixerRef.current) mixerRef.current.update(delta);
		if (idleMixerRef.current) idleMixerRef.current.update(delta);
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
