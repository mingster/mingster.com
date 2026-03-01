# FBX animations for the virtual companion

Place FBX animation files here. File names use **kebab-case** (e.g. `standing-idle.fbx`). They are played on the character when the chat API returns a message with an `animation` field, or when idle.

| File | Purpose |
|------|---------|
| `angry.fbx` | When a message has `animation: "Angry"`, plays once. |
| `standing-idle.fbx` | When there is no current message (idle), plays in a loop. |

Use the **same rig** as your character (e.g. Mixamo Y Bot or the rig your `character.glb` uses). Bone names in the FBX must match the character skeleton for the animation to apply correctly.

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

To add more animations, add a mapping in `AvatarGLB.tsx` → `ANIMATION_FBX`, e.g. `Happy: "animations/happy.fbx"`.
