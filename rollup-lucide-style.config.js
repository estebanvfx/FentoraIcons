const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const dts = require("rollup-plugin-dts");
const terser = require("@rollup/plugin-terser");

const packageName = "LineIconsReact";
const outputFileName = "index";

const external = ["react"];

const plugins = (minify = false) => [
  resolve(),
  typescript({
    tsconfig: "./tsconfig.json",
    exclude: ["**/*.test.ts", "**/*.test.tsx"],
  }),
  ...(minify ? [terser()] : []),
];

// Configuración estilo Lucide: preserveModules para ESM
module.exports = [
  // ES Module Bundle con preserveModules (como Lucide)
  {
    input: "src/index.ts",
    output: {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
      entryFileNames: "[name].js",
    },
    plugins: plugins(),
    external,
  },

  // CommonJS Bundle (sin preserveModules para compatibilidad)
  {
    input: "src/index.ts",
    output: {
      file: "dist/cjs/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    plugins: plugins(),
    external,
  },

  // UMD Bundle (development)
  {
    input: "src/index.ts",
    output: {
      file: "dist/umd/index.js",
      format: "umd",
      name: packageName,
      sourcemap: true,
      globals: {
        react: "React",
      },
    },
    plugins: plugins(),
    external,
  },

  // UMD Bundle (minified)
  {
    input: "src/index.ts",
    output: {
      file: "dist/umd/index.min.js",
      format: "umd",
      name: packageName,
      sourcemap: true,
      globals: {
        react: "React",
      },
    },
    plugins: plugins(true),
    external,
  },

  // TypeScript Definitions
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
