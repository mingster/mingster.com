"use client";

import { OrbitControls, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { Avatar } from "./Avatar";

// Match glTF Viewer (https://gltf-viewer.donmccurdy.com) defaults from three-gltf-viewer
const AMBIENT_INTENSITY = 0.3;
const DIRECT_INTENSITY = 0.8 * Math.PI;
const DIRECT_POSITION: [number, number, number] = [0.5, 0, 0.866]; // ~60° front

function SceneContent() {
	return (
		<>
			<ambientLight color="#ffffff" intensity={AMBIENT_INTENSITY} />
			<directionalLight
				color="#ffffff"
				position={DIRECT_POSITION}
				intensity={DIRECT_INTENSITY}
			/>
			<Stage adjustCamera={1.2} intensity={1} shadows={false}>
				<Avatar />
			</Stage>
			<OrbitControls
				enableDamping
				dampingFactor={0.05}
				target={[0, 0, 0]}
				autoRotate
				autoRotateSpeed={0.5}
				makeDefault
			/>
		</>
	);
}

// glTF Viewer default background #191919 (https://gltf-viewer.donmccurdy.com)
const SCENE_BG = "#191919";

export function Scene() {
	return (
		<div className="absolute inset-0" style={{ background: SCENE_BG }}>
			<Canvas
				camera={{ position: [0, 0, 3], fov: 45 }}
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
