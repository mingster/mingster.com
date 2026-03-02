# Mixamo animations with Avaturn avatars

Avaturn avatars and Mixamo FBX animations use **different rigs and bone names**. Playing Mixamo clips directly on an Avaturn GLB usually fails because bone names don’t match (e.g. Mixamo: `mixamorigHips`, `mixamorigLeftArm`; Avaturn: `Hips`, `LeftUpperArm`). Two ways to fix this:

---

## 1. Blender retargeting (recommended by Avaturn)

**Best for:** One-time setup, highest quality, no runtime cost.

1. **Get Avaturn’s Mixamo-compatible FBX**  
   Download the [Avaturn mesh for Mixamo](https://assets.avaturn.me/mesh_for_mixamo_72940d11f8.fbx) (from [Avaturn docs](https://docs.avaturn.me/docs/importing/mixamo/)).

2. **In Mixamo**  
   Upload that FBX to [Mixamo](https://www.mixamo.com), pick an animation, export **with** or **without** skin (e.g. “Without Skin” for Blender).

3. **In Blender**  
   - Import your **Avaturn avatar** (GLB or the same FBX).  
   - Import the **Mixamo animation** (FBX with animation, or a second character with the animation).  
   - Use Blender’s **NLA / retarget** workflow (or add-on) to bake the animation onto the Avaturn rig.  
   - Export the result as **FBX** or **GLB** with the **Avaturn skeleton** and bone names.

4. **In the app**  
   Put the exported files in `public/animations/`. They already use Avaturn bone names, so the current playback (no retargeting) works.

**References:**  
- [Avaturn: How to use Mixamo animations](https://docs.avaturn.me/docs/importing/mixamo/)  
- [Blender: Retarget Mixamo to other armature](https://blender.stackexchange.com/questions/245138/how-to-retarget-mixamo-animations-in-blender-to-other-armatures-with-the-same-sk)

---

## 2. Runtime retargeting (Three.js)

**Best for:** Using raw Mixamo FBX without a Blender step. Requires a **bone name map** (Avaturn → Mixamo).

The app can use Three.js `SkeletonUtils.retargetClip(target, source, clip, options)` to convert a Mixamo clip to your avatar’s skeleton at runtime.

- **target** = your Avaturn character’s `SkinnedMesh` (has `.skeleton`).  
- **source** = the loaded Mixamo FBX’s `SkinnedMesh`.  
- **options.names** = map **Avaturn bone name → Mixamo bone name**, e.g.  
  `{ "Hips": "mixamorigHips", "Spine": "mixamorigSpine", "LeftUpperArm": "mixamorigLeftArm", ... }`.

Your Avaturn GLB may use different names (e.g. `Armature_Hips`, `Spine`, `LeftArm`). To build the map:

1. In the app, trigger a Mixamo animation (e.g. click “Dancing”) and open the browser console.  
   The app logs **Avatar bones** and **Mixamo bones** when retargeting runs. Use these to fill the map.

2. In `AvatarGLB.tsx`, edit **`AVATURN_TO_MIXAMO_NAMES`**: keys = your avatar’s bone names, values = Mixamo’s bone names (e.g. `mixamorigHips`). Add every bone that should be driven by the animation.

3. **options.hip** is set to `"Hips"` by default; if your avatar uses another hip name (e.g. `Armature_Hips`), change the `hip` option in the `retargetClip` call.

If both your character and the loaded FBX have a `SkinnedMesh` with a skeleton, the app tries retargeting first; if the map is incomplete, more bones will stay still until you add entries.

---

## Why “filter only” isn’t enough

The current fallback **filterClipForRoot** keeps only keyframe tracks whose **bone name exists on the character**. If the character uses `Hips` and the clip uses `mixamorigHips`, no track matches and the animation doesn’t apply. Retargeting (in Blender or via `retargetClip`) converts motion from the Mixamo rig to your Avaturn rig by mapping bone names and copying transforms.
