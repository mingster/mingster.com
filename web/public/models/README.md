# 3D models for Virtual Companion

To enable the full avatar with animations and lip sync:

1. **Character GLB**: Place your character model as `character.glb` in this folder.
   - **Avaturn (realistic look)**: Create and export from [Avaturn](https://hub.avaturn.me/). Use “Export” to download GLB, then save it as `character.glb`. The scene is set up with studio lighting and tone mapping so Avaturn-style avatars look realistic.
   - **Ready Player Me (or compatible)**: Use a model with morph targets for facial expressions and visemes (e.g. `viseme_PP`, `viseme_kk`, `viseme_AA`, etc.) if you need lip sync and expressions.

2. **Animations GLB**: Place an `animations.glb` file with the **same rig** as your character, containing clips such as `Idle`, `Talking_0`, `Talking_1`, `Talking_2`, `Laughing`, `Crying`. If your character is from Avaturn, use [Mixamo](https://www.mixamo.com/) or another source that matches the rig (e.g. generic humanoid).

3. **Dance animation (like Avaturn)**
   The UI has a **Dance** button that plays a clip named `Dance` from your `animations.glb`. To add it:
   - Go to [Mixamo](https://www.mixamo.com/), search for a dance (e.g. **Hip Hop Dancing**, **Salsa Dancing**), and download as **FBX for Unity** or **FBX for Other** (choose **Without Skin** so you get only the animation).
   - Convert FBX → GLB: use [mixamo-to-glb.com](https://www.mixamo-to-glb.com/) or Blender (File → Import → FBX, then File → Export → glTF 2.0).
   - In Blender: open your existing `animations.glb` and import the dance GLB. Retarget/copy the dance keyframes onto your character's armature (same rig as `character.glb`). Name the action **`Dance`**, then export as `animations.glb` again.
   - Optional: to download a dance GLB to this folder, run:
     `DANCE_GLB_URL="https://your-dance-glb-url" bun run bin/download-dance-glb.ts`
     then merge the clip into `animations.glb` in Blender as above.
   - **Or use an FBX directly:** Place e.g. `dancing.fbx` in `public/animations/`. The "Animations" test buttons load FBX from that folder (same rig as your character).

4. **FBX animations**  
   Place FBX files in `public/animations/` (e.g. `dancing.fbx`, `idle.fbx`, `salute.fbx`). Add entries in `AvatarGLB.tsx` → `ANIMATION_FBX` to map keys to paths (e.g. `Dancing: "animations/dancing.fbx"`). Chat UI has test buttons for each entry.

You can also use assets from the reference project: [r3f-virtual-girlfriend-frontend](https://github.com/wass08/r3f-virtual-girlfriend-frontend) (see `public/models/`).

**Compress character.glb (optional):** To reduce file size with Draco mesh compression, run from the `web` directory:
`bun run compress:character`
This overwrites `character.glb`. The app already uses the Draco decoder to load it.

If these files are missing, the homepage will show a placeholder capsule avatar and chat will still work (text + optional voice).
