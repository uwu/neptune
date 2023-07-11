import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: {
    file: "dist/neptune.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [
    resolve({ browser: true }),
    terser(),
  ],
};
