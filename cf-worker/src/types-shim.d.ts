// Wrangler's `[[rules]] type = "CompiledWasm"` resolves any `.wasm` import
// to a pre-compiled `WebAssembly.Module` at build time.
declare module '*.wasm' {
  const module: WebAssembly.Module;
  export default module;
}

// satori 0.26 publishes a `./standalone` subpath alongside the root entry —
// same surface (default + init), but the standalone entry doesn't auto-init
// the WASM, which is what we need on Cloudflare Workers. Its own .d.ts is
// shipped, but we add a fallback declaration here so tsc never gets confused.
declare module 'satori/standalone' {
  export { default, init, type SatoriOptions } from 'satori';
}
