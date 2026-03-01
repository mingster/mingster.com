---
name: three-js
description: Work with Three.js and React Three Fiber (R3F) for 3D scenes, GLB/skinned avatars, skeleton and bone manipulation, and morph targets. Use when editing or adding 3D features, avatar poses, animations, Scene lighting, OrbitControls, or when the user mentions R3F, GLB, skeleton, bones, or 3D.
---

# Three.js / React Three Fiber

## Stack

- **React Three Fiber (R3F)**: `@react-three/fiber` — React renderer for Three.js.
- **Drei**: `@react-three/drei` — helpers: `useGLTF`, `OrbitControls`, `Stage`, etc.
- **Three.js**: `three` — `THREE.Bone`, `THREE.Skeleton`, `THREE.SkinnedMesh`, `THREE.Vector3`, `THREE.Quaternion`, etc.

Import pattern:

```ts
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import * as THREE from "three";
```

## Key files

| File | Purpose |
|------|---------|
| `web/src/components/virtual-experience/Scene.tsx` | Canvas, lights, Stage, OrbitControls, background. |
| `web/src/components/virtual-experience/AvatarGLB.tsx` | GLB avatar, skeleton pose, morph targets, audio. |
| `web/src/components/virtual-experience/Avatar.tsx` | Chooses AvatarGLB vs fallback by model availability. |

## Skeleton and bones

**Get skeleton from loaded GLB root:**

```ts
function getSkeleton(root: THREE.Object3D): THREE.Skeleton | null {
  let sk: THREE.Skeleton | null = null;
  root.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh && child.skeleton) sk = child.skeleton;
  });
  return sk;
}
```

**Find bones by name** (rigs vary; use lowercase + substring):

- Arms/hands: `name.includes("left")`, `name.includes("right")`, `name.includes("upperarm")`, `name.includes("forearm")`, `name.includes("hand")`.
- Head/neck: `name.includes("head")`, `name.includes("neck")` or `name === "upperneck"`.
- Eyes: `name.includes("eye")` and left/right.
- Chest/spine: `name.includes("chest")` or `name.includes("spine")`, exclude neck/head.

**Capture and restore base pose:**

- Store **quaternions** in a `Map<uuid, THREE.Quaternion>` (e.g. `tPoseArmRef`) when capturing; restore with `bone.quaternion.copy(base)`.
- For **position** (e.g. hand rest), store `bone.position.clone()` in a ref; restore with `bone.position.copy(ref.current)` when leaving idle.

## Bone manipulation

**Rotation (world axis, applied on top of base):**

```ts
const _axis = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion();
const angle = (degrees * Math.PI) / 180;
_q.setFromAxisAngle(_axis, angle);
bone.quaternion.copy(base).premultiply(_q);
```

**Position:** Use `bone.position` (in parent space). To place a bone at a **world** target:

```ts
root.updateMatrixWorld(true);
bone.getWorldPosition(_worldPos);
_targetWorld.set(desiredX, _worldPos.y, _worldPos.z);
bone.position.copy(bone.parent.worldToLocal(_targetWorld.clone()));
```

**Non-accumulating procedural offset** (e.g. breathing): store previous scalar in a ref; subtract previous offset from `bone.position`, compute new offset, add it, then update ref.

**Reuse vectors/quaternions** outside the component or in module scope to avoid allocations inside `useFrame`.

## Morph targets

Used for face (blink, visemes, expressions). SkinnedMesh has `morphTargetDictionary` (name → index) and `morphTargetInfluences` (array). Lerp for smooth transitions:

```ts
scene.traverse((child) => {
  if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
    const index = child.morphTargetDictionary[targetName];
    if (index !== undefined)
      child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
        child.morphTargetInfluences[index],
        value,
        speed,
      );
  }
});
```

## Scene and camera

- **Canvas** from R3F; set `camera={{ position, fov }}` on `<Canvas>` if needed.
- **Lights**: `ambientLight`, `directionalLight`; use constants for intensity/position (see Scene.tsx).
- **Stage** (drei): wraps content, optional `adjustCamera`, `intensity`, `shadows={false}`.
- **OrbitControls**: `target`, `minPolarAngle`, `maxPolarAngle`, `minDistance`, `maxDistance`, `enablePan={false}`, `enableDamping`, `dampingFactor`.

## Animation flow (Three.js 動畫處理核心)

1. **加載模型 (Load model)**  
   Use **GLTFLoader** (or `useGLTF` from drei) to load the avatar GLB; the root is the `scene` to animate.

2. **管理動畫 (Manage animation)**  
   - **AnimationMixer(scene)** + **mixer.clipAction(clip, scene)** + **action.play()** — play a clip on the character.  
   - Same-rig: clip bone names must match the character skeleton (we use `filterClipForRoot` to drop tracks for missing bones).  
   - **Different rig / scale:** use **SkeletonUtils.retargetClip(target, source, clip, options)** so a generic clip (e.g. Mixamo walk, wave) applies to another skeleton:

   ```ts
   import { retargetClip } from "three/examples/jsm/utils/SkeletonUtils.js";
   // source = object that has the clip’s skeleton (e.g. FBX root); target = our character scene
   const retargetedClip = retargetClip(targetScene, sourceScene, clip, { names: boneNameMap });
   const action = mixer.clipAction(retargetedClip, targetScene);
   action.play();
   ```

3. **臉部表情 (Facial expressions)**  
   Control via **mesh.morphTargetInfluences[index]** (and **morphTargetDictionary** for name → index). Use lerp for smooth transitions; see `lerpMorphTarget` in AvatarGLB. Expressions and visemes (lip sync) are driven by `FACIAL_EXPRESSIONS` and `VISEME_TO_MORPH`.

## GLB loading

- **useGLTF(url, true)** for suspense; destructure `{ scene }`.
- **Draco**: If using compressed GLB, set decoder once: `useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/")` (guard with `typeof window !== "undefined"`).
- Models live under `web/public/models/` (e.g. `character.glb`).

## useFrame and state

- **useFrame((state) => { ... })** runs every frame. Use for skeleton pose, morph lerp, etc.
- Get time: `state.clock.elapsedTime`.
- Capture base pose once (e.g. when `tPoseRef.current.size === 0`); then in idle branch apply procedural pose and rest positions; in non-idle branch restore quaternions and positions.

## Checklist for new pose or bone behavior

- [ ] Get skeleton via `getSkeleton(scene)` (from GLB root).
- [ ] Find bones by name (case-insensitive, substring).
- [ ] Capture base quaternion/position once; restore when not applying the pose.
- [ ] Reuse `THREE.Vector3` / `THREE.Quaternion` in module or ref to avoid per-frame allocations.
- [ ] For world-space target position: `updateMatrixWorld(true)`, then `parent.worldToLocal(target)` for `bone.position`.
