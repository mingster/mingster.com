"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { useChat } from "@/hooks/useChat";

/**
 * Placeholder avatar when GLB models are not available.
 * Shows a capsule that reacts to currentMessage; plays audio and advances queue.
 */
export function AvatarCapsule() {
	const meshRef = useRef<Mesh>(null);
	const { currentMessage, onMessagePlayed } = useChat();

	// Play audio and advance queue when message changes (same contract as AvatarGLB)
	useEffect(() => {
		if (!currentMessage) return;
		if (currentMessage.audio) {
			const mime = currentMessage.audioMime ?? "audio/wav";
			const audio = new Audio(
				`data:${mime};base64,${currentMessage.audio}`,
			);
			audio.play().catch((err) => {
				console.warn("Audio play failed:", err);
				onMessagePlayed();
			});
			audio.onended = () => onMessagePlayed();
		} else {
			const t = setTimeout(() => onMessagePlayed(), 2000);
			return () => clearTimeout(t);
		}
	}, [currentMessage, onMessagePlayed]);

	// Idle motion so the placeholder feels alive (bob + slow spin)
	useFrame((state, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += delta * 0.15;
			meshRef.current.position.y = 1.6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
		}
	});

	const color = currentMessage ? "#ff69b4" : "#87ceeb";

	return (
		<mesh ref={meshRef} position={[0, 1.6, 0]} castShadow receiveShadow>
			<capsuleGeometry args={[0.3, 0.8, 4, 8]} />
			<meshStandardMaterial color={color} />
		</mesh>
	);
}
