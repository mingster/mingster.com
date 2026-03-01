"use client";

import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { Avatar } from "./Avatar";

// Match glTF Viewer (https://gltf-viewer.donmccurdy.com) defaults from three-gltf-viewer
const AMBIENT_INTENSITY = 0.3;
const DIRECT_INTENSITY = 0.8 * Math.PI;
const DIRECT_POSITION: [number, number, number] = [0.6, 0, 0.666]; // ~60° front
// Face fill: front, slightly above, soft white so face tone is slightly whiter
const FACE_FILL_POSITION: [number, number, number] = [0, 0.8, 1.2];
const FACE_FILL_INTENSITY = 0.5;

// OrbitControls like Avaturn editor (hub.avaturn.me/editor): orbit around upper body, zoom limits, polar limits
const ORBIT_TARGET: [number, number, number] = [0, 0, 0];
const ORBIT_MIN_POLAR = 0.25;
const ORBIT_MAX_POLAR = Math.PI / 2 - 0.15;
const ORBIT_MIN_DISTANCE = 1.2;
const ORBIT_MAX_DISTANCE = 4;

function SceneContent() {
	return (
		<>
			<ambientLight color="#ffffff" intensity={AMBIENT_INTENSITY} />
			<directionalLight
				color="#ffffff"
				position={DIRECT_POSITION}
				intensity={DIRECT_INTENSITY}
			/>
			<directionalLight
				color="#ffffff"
				position={FACE_FILL_POSITION}
				intensity={FACE_FILL_INTENSITY}
			/>
			<Stage adjustCamera={1.2} intensity={1} shadows={false}>
				<Avatar />
			</Stage>
			<OrbitControls
				enableDamping
				target={ORBIT_TARGET}
				minPolarAngle={ORBIT_MIN_POLAR}
				maxPolarAngle={ORBIT_MAX_POLAR}
				minDistance={ORBIT_MIN_DISTANCE}
				maxDistance={ORBIT_MAX_DISTANCE}
				enablePan={false}
				makeDefault
			/>
		</>
	);
}

// Avaturn-style background presets: image-based (hub.avaturn.me/editor)
const BACKGROUNDS_BASE = "/images/backgrounds";
export const BACKGROUND_PRESETS = [
	{ id: "studio", label: "Studio", image: `${BACKGROUNDS_BASE}/studio.jpg` },
	{ id: "outdoor", label: "Outdoor", image: `${BACKGROUNDS_BASE}/outdoor.jpg` },
	{ id: "indoor", label: "Indoor", image: `${BACKGROUNDS_BASE}/indoor.jpg` },
	{ id: "light", label: "Light", image: `${BACKGROUNDS_BASE}/light.jpg` },
	{ id: "dark", label: "Dark", image: `${BACKGROUNDS_BASE}/dark.jpg` },
] as const;

export type BackgroundPresetId = (typeof BACKGROUND_PRESETS)[number]["id"];

const DEFAULT_BACKGROUND = BACKGROUND_PRESETS[1].image;
const FALLBACK_BG_COLOR = "#1e2024";

export interface SceneProps {
	/** Selected background image URL (from BACKGROUND_PRESETS[].image). */
	background?: string;
}

export function Scene({ background = DEFAULT_BACKGROUND }: SceneProps) {
	return (
		<div
			className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-200"
			style={{
				backgroundColor: FALLBACK_BG_COLOR,
				backgroundImage: background ? `url(${background})` : undefined,
			}}
		>
			<Canvas
				camera={{ position: [0, 0, 2], fov: 50 }}
				gl={{
					preserveDrawingBuffer: true,
					alpha: true,
					antialias: true,
					toneMapping: THREE.LinearToneMapping,
					toneMappingExposure: 1,
					outputColorSpace: THREE.SRGBColorSpace,
				}}
			>
				<Suspense
					fallback={
						<mesh>
							<boxGeometry args={[0.1, 0.1, 0.1]} />
							<meshBasicMaterial color="hotpink" />
						</mesh>
					}
				>
					<SceneContent />
				</Suspense>
			</Canvas>
		</div>
	);
}
