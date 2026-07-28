# New Beansland 3D Asset Rules

This folder is the public, deployable home for future New Beansland 3D assets.

The Founder’s Office currently builds its room with lightweight Three.js geometry and existing image artwork. There are no large `.glb` or `.gltf` room models in production yet. These rules protect the free GitHub/Cloudflare hosting setup when physical 3D objects are added later.

## Folder structure

- `models/` — final browser-ready `.glb` files only
- `textures/` — final `.ktx2`, `.webp`, or `.avif` textures
- `posters/` — lightweight fallback images shown while a model loads or when WebGL is unavailable

Keep editable source files such as `.blend`, `.fbx`, `.obj`, layered PSD files, and uncompressed texture masters outside the public website repository.

## Permanent budgets

- One `.glb`: target 2–5 MB; hard repository budget 8 MB
- One texture: target under 1 MB; hard repository budget 2 MB
- One fallback poster: target under 500 KB; hard repository budget 1 MB
- Entire `assets/3d/` folder: hard repository budget 30 MB

These are New Beansland performance budgets, not claims about a hosting provider’s absolute limits. They are intentionally strict so the room remains usable on phones and free hosting.

## Required export format

1. Export one browser-ready `.glb` per object or tightly related object group.
2. Remove hidden geometry, unused materials, unused animations, and duplicate meshes.
3. Apply transforms before export.
4. Use mesh compression such as Meshopt or Draco when the loader supports it.
5. Use KTX2/Basis textures when possible. Otherwise use WebP or AVIF.
6. Limit ordinary textures to 1024×1024. Use 2048×2048 only where close inspection truly requires it.
7. Reuse materials and textures across repeated objects.
8. Provide a small poster image for slow devices and loading states.
9. Load objects only when the visitor approaches or requests inspection.
10. Do not use Git LFS for files that must be served directly by the public website.

## Naming

Use lowercase names with hyphens:

- `founder-chair.glb`
- `founder-chair-basecolor.ktx2`
- `founder-chair-poster.webp`

Avoid automatic upload names, spaces, dates, and version words such as `final-final-2`.

## Founder’s Office protection rule

Do not remove, replace, flatten, or redesign the lamp sequence, chair unlock, clues, certificates, keepsakes, or inspection behavior merely to reduce file size. Optimization must preserve the meaning and interaction first.

The automated asset-budget check in this repository blocks oversized future files before they are merged.