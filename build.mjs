import { build } from "esbuild";

build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/neptune.js",
  sourcemap: "external",
  minify: true,
});