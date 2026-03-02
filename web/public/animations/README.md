# FBX animations for the virtual companion

Place FBX files in **`public/animations/`** (this folder). Playback: FBXLoader → **AnimationMixer** → clip (with optional **retargeting** when using Mixamo on Avaturn) → `clipAction(clip).play()`.

**Mixamo + Avaturn:** Avaturn and Mixamo use different bone names, so raw Mixamo FBX often doesn’t move an Avaturn avatar. See **[doc/MIXAMO_AVATURN_ANIMATIONS.md](../doc/MIXAMO_AVATURN_ANIMATIONS.md)** for (1) Blender retargeting and (2) runtime retargeting with a bone name map.

| File | Key | Purpose |
|------|-----|---------|
| `standing-idle.fbx` | (idle) | No current message: plays in a loop. |
| `dancing.fbx` | Dancing | Test button "Dancing"; chat keyword `dancing` or `dance`. |
| `defeated.fbx` | Defeated | Test button "Defeated". |
| `idle.fbx` | Idle | Test button "Idle". |
| `salute.fbx` | Salute | Test button "Salute". |

**Test buttons:** Chat UI has an "Animations (animations/):" row; each button plays that clip via the mixer.

## Compatible avatars (avoid "No target node found" warnings)

If your FBX comes from **Mixamo** (e.g. Y Bot rig), it may include bones your character doesn’t have (e.g. `LeftHandRing4`, `LeftToe_End`). The app **filters out** tracks for bones that don’t exist on your character, so those warnings are suppressed and the animation still runs on the bones that match.

For the fewest warnings and best match:

- **Same rig as the FBX**  
  Use a character that shares the exact skeleton and bone names as the animation (e.g. Mixamo character + Mixamo animations).
- **Mixamo**  
  [mixamo.com](https://www.mixamo.com): pick a character (e.g. Y Bot), download as FBX, then in Blender or another tool export to GLB and use that as `character.glb`. Use Mixamo animations as your FBX files.
- **Avaturn / other rigs**  
  Avaturn and similar tools often use different bone names. Either:
  - Retarget Mixamo (or other) animations to your rig in Blender and export FBX with your rig’s bone names, or  
  - Use animations authored for that rig. Filtering will still drop tracks for missing bones (e.g. finger tips) and avoid console noise.

To add more animations, add the FBX here and a mapping in `AvatarGLB.tsx` → `ANIMATION_FBX`, e.g. `Happy: "animations/happy.fbx"`.
