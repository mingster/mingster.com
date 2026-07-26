/**
 * Silences THREE.Clock deprecation warning.
 * @react-three/fiber still constructs `new THREE.Clock()`; the console warn
 * will go away when R3F migrates to THREE.Timer. Three.js r183+ changed the
 * warn text from "THREE.Clock:" to "Clock:" — match both forms.
 */
const fs = require("fs");
const path = require("path");

const threeDir = path.join(__dirname, "..", "node_modules", "three");

/** @type {{ file: string; find: RegExp; replace: string }[]} */
const patches = [
	{
		file: "build/three.core.js",
		find: /\twarn\(\s*'(?:THREE\.)?Clock: This module has been deprecated\. Please use THREE\.Timer instead\.'\s*\);\s*\/\/ @deprecated, r183/,
		replace:
			"\t\t// Deprecation warning silenced: @react-three/fiber still uses Clock until it migrates to Timer",
	},
	{
		file: "build/three.cjs",
		find: /\twarn\(\s*'(?:THREE\.)?Clock: This module has been deprecated\. Please use THREE\.Timer instead\.'\s*\);\s*\/\/ @deprecated, r183/,
		replace:
			"\t\t// Deprecation warning silenced: @react-three/fiber still uses Clock until it migrates to Timer",
	},
	{
		file: "build/three.core.min.js",
		find: /([a-zA-Z_$][\w$]*)\(\s*"(?:THREE\.)?Clock: This module has been deprecated\. Please use THREE\.Timer instead\."\s*\)/,
		replace: "/* clock deprecation silenced */void 0",
	},
	{
		file: "src/core/Clock.js",
		find: /\twarn\(\s*'(?:THREE\.)?Clock: This module has been deprecated\. Please use THREE\.Timer instead\.'\s*\);\s*\/\/ @deprecated, r183/,
		replace:
			"\t\t// Deprecation warning silenced: @react-three/fiber still uses Clock until it migrates to Timer",
	},
];

let patched = 0;
for (const { file, find, replace } of patches) {
	const filePath = path.join(threeDir, file);
	if (!fs.existsSync(filePath)) continue;

	const content = fs.readFileSync(filePath, "utf8");
	if (!find.test(content)) {
		// Already patched, or unexpected three.js layout
		if (content.includes("clock deprecation silenced") || content.includes("Deprecation warning silenced")) {
			continue;
		}
		console.warn(`[patch-three-clock] Pattern not found in ${file}`);
		continue;
	}

	fs.writeFileSync(filePath, content.replace(find, replace));
	console.log("[patch-three-clock] Patched", file);
	patched += 1;
}

if (patched === 0) {
	console.log("[patch-three-clock] Nothing to patch (already applied or missing files)");
}
