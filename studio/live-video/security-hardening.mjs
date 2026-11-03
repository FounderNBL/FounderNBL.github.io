// Build-time hardening for two security findings in the pinned Stream Video SDK bundle.
// Fail closed if a dependency update changes the generated shape; do not silently ship unsafe assets.
const propertyWrite = 'o[c][l] = u;';
const safePropertyWrite = 'if (l === "prototype" || Object.prototype.hasOwnProperty.call(Object.prototype, l)) throw Error("Unsafe protobuf map key");\n\t\t\t\t\tObject.defineProperty(o[c], l, { value: u, writable: true, enumerable: true, configurable: true });';
const insecureRandom = 'var Pd = typeof crypto < "u" && crypto.getRandomValues ? crypto.getRandomValues.bind(crypto) : function(e) {\n\tlet t = 2 ** (8 * e.byteLength / e.length);\n\tfor (let n = 0; n < e.length; n++) e[n] = Math.random() * t;\n};';
const secureRandom = 'var Pd = typeof crypto < "u" && crypto.getRandomValues ? crypto.getRandomValues.bind(crypto) : function() {\n\tthrow Error("Secure random generation required for NBL Studios LIVE sessions");\n};';

function replaceExactlyOnce(code, needle, replacement, name) {
  if (code.split(needle).length !== 2) {
    throw Error(`NBL Studios LIVE SDK security build guard: unexpected ${name} pattern; audit SDK before building`);
  }
  return code.replace(needle, replacement);
}

export function hardenStreamSdkBundle(code) {
  let secured = replaceExactlyOnce(code, propertyWrite, safePropertyWrite, "protobuf map write");
  secured = replaceExactlyOnce(secured, insecureRandom, secureRandom, "insecure random fallback");
  return secured;
}

export function hardenStreamSdkBuild(output) {
  const chunks = Object.values(output).filter((item) => item.type === "chunk" && typeof item.code === "string");
  const affected = chunks.filter((item) => item.code.includes(propertyWrite) || item.code.includes(insecureRandom));
  if (affected.length !== 1 || !affected[0].code.includes(propertyWrite) || !affected[0].code.includes(insecureRandom)) {
    throw Error("NBL Studios LIVE SDK security build guard: pinned vendor code changed; review and repin");
  }
  affected[0].code = hardenStreamSdkBundle(affected[0].code);
}
