"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import type { LipsyncData } from "@/types/virtual-experience";
import { FACIAL_EXPRESSIONS, VISEME_TO_MORPH } from "./avatar-expressions";

const CHARACTER_URL = "/models/character.glb";
const ANIMATIONS_URL = "/models/animations.glb";

// Draco decoder for compressed character.glb (see bin/compress-character-glb.ts)
if (typeof window !== "undefined") {
	useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
}

type RestPose = { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }[];

function getSkeleton(root: THREE.Object3D): THREE.Skeleton | null {
	let sk: THREE.Skeleton | null = null;
	root.traverse((child) => {
		if (child instanceof THREE.SkinnedMesh && child.skeleton) sk = child.skeleton;
	});
	return sk;
}

function saveRestPose(skeleton: THREE.Skeleton): RestPose {
	return skeleton.bones.map((bone) => ({
		position: bone.position.clone(),
		quaternion: bone.quaternion.clone(),
		scale: bone.scale.clone(),
	}));
}

function applyRestPose(skeleton: THREE.Skeleton, rest: RestPose) {
	rest.forEach((pose, i) => {
		const bone = skeleton.bones[i];
		if (bone && pose) {
			bone.position.copy(pose.position);
			bone.quaternion.copy(pose.quaternion);
			bone.scale.copy(pose.scale);
		}
	});
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
	const { animations } = useGLTF(ANIMATIONS_URL);
	const { actions, mixer } = useAnimations(animations, scene);

	const restPoseRef = useRef<RestPose | null>(null);
	const firstFrameRef = useRef(true);
	const restoreRequestedRef = useRef(false);

	const { currentMessage, onMessagePlayed, danceTrigger } = useChat();

	const [facialExpressionKey, setFacialExpressionKey] = useState("");
	const [lipsyncData, setLipsyncData] = useState<LipsyncData | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [blink, setBlink] = useState(false);

	// Resolve animation name: API may send "Talking_0" etc.; "Dance" for dance mode (like Avaturn)
	const animationNames = animations.map((a) => a.name);
	const resolveAnimation = useCallback(
		(name?: string) => {
			if (name && animationNames.includes(name)) return name;
			if (animationNames.includes("Idle")) return "Idle";
			return animationNames[0] ?? null;
		},
		[animationNames],
	);

	// Effective animation: message takes precedence; else dance if triggered; else rest pose
	const effectiveAnimation =
		currentMessage !== null
			? resolveAnimation(currentMessage.animation)
			: danceTrigger !== null
				? resolveAnimation("Dance")
				: null;

	// When current message changes: set expression, lipsync, play audio (animation driven by effectiveAnimation)
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
			// No audio: advance after a short delay (e.g. 2s)
			const t = setTimeout(() => onMessagePlayed(), 2000);
			return () => clearTimeout(t);
		}
	}, [currentMessage, onMessagePlayed]);

	// Play animation (message or Dance), or stop all and use rest pose
	useEffect(() => {
		if (effectiveAnimation === null) {
			mixer.stopAllAction();
			restoreRequestedRef.current = true;
			return;
		}
		const action = actions[effectiveAnimation];
		if (!action) return;
		if (effectiveAnimation === "Dance") {
			action.setLoop(THREE.LoopRepeat, Infinity);
		}
		action.reset().fadeIn(0.5).play();
		return () => {
			action.fadeOut(0.5);
		};
	}, [effectiveAnimation, actions, mixer]);

	// Blink
	useEffect(() => {
		let blinkTimeout: ReturnType<typeof setTimeout>;
		const nextBlink = () => {
			blinkTimeout = setTimeout(
				() => {
					setBlink(true);
					setTimeout(() => {
						setBlink(false);
						nextBlink();
					}, 200);
				},
				THREE.MathUtils.randInt(1000, 5000),
			);
		};
		nextBlink();
		return () => clearTimeout(blinkTimeout);
	}, []);

	// useFrame: save rest pose once, restore when idle, then apply facial expression and lipsync
	useFrame(() => {
		const skeleton = getSkeleton(scene);
		if (skeleton) {
			if (firstFrameRef.current) {
				restPoseRef.current = saveRestPose(skeleton);
				firstFrameRef.current = false;
			}
			if (restoreRequestedRef.current && restPoseRef.current) {
				applyRestPose(skeleton, restPoseRef.current);
				restoreRequestedRef.current = false;
			}
		}

		const expressionMap =
			FACIAL_EXPRESSIONS[facialExpressionKey] ?? FACIAL_EXPRESSIONS.default;
		const appliedVisemes: string[] = [];

		// Expression morph targets (skip eye blink; handled below)
		for (const [key, value] of Object.entries(expressionMap)) {
			if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") continue;
			lerpMorphTarget(scene, key, value, 0.1);
		}
		lerpMorphTarget(scene, "eyeBlinkLeft", blink ? 1 : 0, 0.5);
		lerpMorphTarget(scene, "eyeBlinkRight", blink ? 1 : 0, 0.5);

		// Lipsync from audio time
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

	return <primitive object={scene} />;
}

// Preload for faster display when model is available
if (typeof window !== "undefined") {
	useGLTF.preload(CHARACTER_URL, true);
	useGLTF.preload(ANIMATIONS_URL);
}
