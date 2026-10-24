import { r as e } from "./nbl-studios-live-chunk-rolldown-runtime.js";
import { M as t, N as n, P as r, g as i, j as a, k as o, n as s, t as c } from "./nbl-studios-live-chunk-clsx.js";
//#region node_modules/wasm-feature-detect/dist/esm/index.js
var l = async () => WebAssembly.validate(new Uint8Array([
	0,
	97,
	115,
	109,
	1,
	0,
	0,
	0,
	1,
	5,
	1,
	96,
	0,
	1,
	123,
	3,
	2,
	1,
	0,
	10,
	10,
	1,
	8,
	0,
	65,
	0,
	253,
	15,
	253,
	98,
	11
])), u = () => /Mobi/i.test(navigator.userAgent), d = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent), f = async ({ forceMobileSupport: e = !1, forceSafariSupport: t = !1 } = {}) => typeof document < "u" && typeof window < "u" && typeof navigator < "u" && (e || !u()) && (t || !d()) && typeof WebAssembly < "u" && !!window.WebGL2RenderingContext && !!document.createElement("canvas").getContext("webgl2") && await l(), p = async ({ forceMobileSupport: e = !1, forceSafariSupport: t = !1 } = {}) => typeof document < "u" && typeof window < "u" && typeof navigator < "u" && (e || !u()) && (t || !d()) && typeof WebAssembly < "u" && typeof OffscreenCanvas < "u" && !!window.WebGL2RenderingContext && !!new OffscreenCanvas(1, 1).getContext("webgl2") && typeof VideoFrame < "u" && typeof createImageBitmap < "u", m = String.raw;
function h(e, t, n, r, i) {
	let a = g(e, t, n), o = e.getAttribLocation(a, "a_position");
	e.enableVertexAttribArray(o), e.bindBuffer(e.ARRAY_BUFFER, r), e.vertexAttribPointer(o, 2, e.FLOAT, !1, 0, 0);
	let s = e.getAttribLocation(a, "a_texCoord");
	return e.enableVertexAttribArray(s), e.bindBuffer(e.ARRAY_BUFFER, i), e.vertexAttribPointer(s, 2, e.FLOAT, !1, 0, 0), a;
}
function g(e, t, n) {
	let r = e.createProgram();
	if (e.attachShader(r, t), e.attachShader(r, n), e.linkProgram(r), !e.getProgramParameter(r, e.LINK_STATUS)) throw Error(`Could not link WebGL program: ${e.getProgramInfoLog(r)}`);
	return r;
}
function _(e, t, n) {
	let r = e.createShader(t);
	if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) throw Error(`Could not compile shader: ${e.getShaderInfoLog(r)}`);
	return r;
}
function ee(e, t, n, r, i = e.NEAREST, a = e.NEAREST) {
	let o = e.createTexture();
	return e.bindTexture(e.TEXTURE_2D, o), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, i), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, a), e.texStorage2D(e.TEXTURE_2D, 1, t, n, r), o;
}
async function v(e, t, n, r, i, a, o, s) {
	let c = e.createBuffer();
	return e.bindBuffer(e.PIXEL_PACK_BUFFER, c), e.bufferData(e.PIXEL_PACK_BUFFER, s.byteLength, e.STREAM_READ), e.readPixels(t, n, r, i, a, o, 0), e.bindBuffer(e.PIXEL_PACK_BUFFER, null), await y(e, e.PIXEL_PACK_BUFFER, c, 0, s), e.deleteBuffer(c), s;
}
async function y(e, t, n, r, i, a, o) {
	let s = e.fenceSync(e.SYNC_GPU_COMMANDS_COMPLETE, 0);
	if (e.flush(), !s) return;
	let c = await b(e, s);
	e.deleteSync(s), c !== e.WAIT_FAILED && (e.bindBuffer(t, n), e.getBufferSubData(t, r, i, a, o), e.bindBuffer(t, null));
}
function b(e, t) {
	return new Promise((n) => {
		function r() {
			let i = e.clientWaitSync(t, 0, 0);
			i === e.WAIT_FAILED ? n(i) : i === e.TIMEOUT_EXPIRED ? setTimeout(r) : n(i);
		}
		setTimeout(r);
	});
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/webgl2/backgroundBlurStage.js
function te(e, t, n, r, i, a, o) {
	let s = x(e, t, n, r, i, a, o), c = ne(e, n, r, a);
	function l() {
		s.render(), c.render();
	}
	function u(e) {
		c.updateCoverage(e);
	}
	function d() {
		c.cleanUp(), s.cleanUp();
	}
	return {
		render: l,
		updateCoverage: u,
		cleanUp: d
	};
}
function x(e, t, n, r, i, a, o) {
	let s = typeof o == "number" ? o : o === "low" ? 2 : o === "medium" ? 4 : 6, c = Math.max(1, Math.floor(s * 3)), l = Array(c).fill(0).map((e, t) => t), u = s ** 2, d = l.map((e) => {
		let t = s * Math.sqrt(2 * Math.PI);
		return Math.exp(-(e ** 2) / (2 * u)) / t;
	}), f = m`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_personMask;
    uniform vec2 u_texelSize;

    in vec2 v_texCoord;
    out vec4 outColor;

    const float offset[${c}] = float[](${l.map((e) => e.toFixed(10)).join(", ")});
    const float weight[${c}] = float[](${d.map((e) => e.toFixed(10)).join(", ")});

    void main() {
      vec4 centerColor = texture(u_inputFrame, v_texCoord);
      float personMask = texture(u_personMask, v_texCoord).a;

      vec4 frameColor = centerColor * weight[0] * (1.0 - personMask);

      for (int i = 1; i < ${c}; i++) {
        vec2 offset = vec2(offset[i]) * u_texelSize;

        vec2 texCoord = v_texCoord + offset;
        frameColor += texture(u_inputFrame, texCoord)
           * weight[i]
           * (1.0 - texture(u_personMask, texCoord).a);

        texCoord = v_texCoord - offset;
        frameColor += texture(u_inputFrame, texCoord)
          * weight[i]
          * (1.0 - texture(u_personMask, texCoord).a);
      }
      outColor = vec4(frameColor.rgb + (1.0 - frameColor.a) * centerColor.rgb, 1.0);
    }
  `, p = .5, g = a.width * p, v = a.height * p, y = 1 / g, b = 1 / v, te = _(e, e.FRAGMENT_SHADER, f), x = h(e, t, te, n, r), ne = e.getUniformLocation(x, "u_inputFrame"), re = e.getUniformLocation(x, "u_personMask"), ie = e.getUniformLocation(x, "u_texelSize"), ae = ee(e, e.RGBA8, g, v, e.NEAREST, e.LINEAR), oe = ee(e, e.RGBA8, g, v, e.NEAREST, e.LINEAR), se = e.createFramebuffer();
	e.bindFramebuffer(e.FRAMEBUFFER, se), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, ae, 0);
	let ce = e.createFramebuffer();
	e.bindFramebuffer(e.FRAMEBUFFER, ce), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, oe, 0), e.useProgram(x), e.uniform1i(re, 1);
	function le() {
		e.viewport(0, 0, g, v), e.useProgram(x), e.uniform1i(ne, 0), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, i);
		for (let t = 0; t < 3; t++) e.uniform2f(ie, 0, b), e.bindFramebuffer(e.FRAMEBUFFER, se), e.drawArrays(e.TRIANGLE_STRIP, 0, 4), e.activeTexture(e.TEXTURE2), e.bindTexture(e.TEXTURE_2D, ae), e.uniform1i(ne, 2), e.uniform2f(ie, y, 0), e.bindFramebuffer(e.FRAMEBUFFER, ce), e.drawArrays(e.TRIANGLE_STRIP, 0, 4), e.bindTexture(e.TEXTURE_2D, oe);
	}
	function S() {
		e.deleteFramebuffer(ce), e.deleteFramebuffer(se), e.deleteTexture(oe), e.deleteTexture(ae), e.deleteProgram(x), e.deleteShader(te);
	}
	return {
		render: le,
		cleanUp: S
	};
}
function ne(e, t, n, r) {
	let i = m`#version 300 es

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;

    void main() {
      // Flipping Y is required when rendering to canvas
      gl_Position = vec4(a_position * vec2(1.0, -1.0), 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `, a = m`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_personMask;
    uniform sampler2D u_blurredInputFrame;
    uniform vec2 u_coverage;

    in vec2 v_texCoord;

    out vec4 outColor;

    void main() {
      vec3 color = texture(u_inputFrame, v_texCoord).rgb;
      vec3 blurredColor = texture(u_blurredInputFrame, v_texCoord).rgb;
      float personMask = texture(u_personMask, v_texCoord).a;
      personMask = smoothstep(u_coverage.x, u_coverage.y, personMask);
      outColor = vec4(mix(blurredColor, color, personMask), 1.0);
    }
  `, { width: o, height: s } = r, c = _(e, e.VERTEX_SHADER, i), l = _(e, e.FRAGMENT_SHADER, a), u = h(e, c, l, t, n), d = e.getUniformLocation(u, "u_inputFrame"), f = e.getUniformLocation(u, "u_personMask"), p = e.getUniformLocation(u, "u_blurredInputFrame"), g = e.getUniformLocation(u, "u_coverage");
	e.useProgram(u), e.uniform1i(d, 0), e.uniform1i(f, 1), e.uniform1i(p, 2), e.uniform2f(g, 0, 1);
	function ee() {
		e.viewport(0, 0, o, s), e.useProgram(u), e.bindFramebuffer(e.FRAMEBUFFER, null), e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
	}
	function v(t) {
		e.useProgram(u), e.uniform2f(g, t[0], t[1]);
	}
	function y() {
		e.deleteProgram(u), e.deleteShader(l), e.deleteShader(c);
	}
	return {
		render: ee,
		updateCoverage: v,
		cleanUp: y
	};
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/webgl2/backgroundImageStage.js
function re(e, t, n, r, i, a) {
	let o = m`#version 300 es

    uniform vec2 u_backgroundScale;
    uniform vec2 u_backgroundOffset;

    in vec2 a_position;
    in vec2 a_texCoord;

    out vec2 v_texCoord;
    out vec2 v_backgroundCoord;

    void main() {
      // Flipping Y is required when rendering to canvas
      gl_Position = vec4(a_position * vec2(1.0, -1.0), 0.0, 1.0);
      v_texCoord = a_texCoord;
      v_backgroundCoord = a_texCoord * u_backgroundScale + u_backgroundOffset;
    }
  `, s = m`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_personMask;
    uniform sampler2D u_background;
    uniform vec2 u_coverage;
    uniform float u_lightWrapping;
    uniform float u_blendMode;

    in vec2 v_texCoord;
    in vec2 v_backgroundCoord;

    out vec4 outColor;

    vec3 screen(vec3 a, vec3 b) {
      return 1.0 - (1.0 - a) * (1.0 - b);
    }

    vec3 linearDodge(vec3 a, vec3 b) {
      return a + b;
    }

    void main() {
      vec3 frameColor = texture(u_inputFrame, v_texCoord).rgb;
      vec3 backgroundColor = texture(u_background, v_backgroundCoord).rgb;
      float personMask = texture(u_personMask, v_texCoord).a;
      float lightWrapMask = 1.0 - max(0.0, personMask - u_coverage.y) / (1.0 - u_coverage.y);
      vec3 lightWrap = u_lightWrapping * lightWrapMask * backgroundColor;

      frameColor = u_blendMode * linearDodge(frameColor, lightWrap)
        + (1.0 - u_blendMode) * screen(frameColor, lightWrap);
      personMask = smoothstep(u_coverage.x, u_coverage.y, personMask);
      outColor = vec4(frameColor * personMask + backgroundColor * (1.0 - personMask), 1.0);
    }
  `, { width: c, height: l } = a, u = c / l, d = _(e, e.VERTEX_SHADER, o), f = _(e, e.FRAGMENT_SHADER, s), p = h(e, d, f, t, n), g = e.getUniformLocation(p, "u_backgroundScale"), v = e.getUniformLocation(p, "u_backgroundOffset"), y = e.getUniformLocation(p, "u_inputFrame"), b = e.getUniformLocation(p, "u_personMask"), te = e.getUniformLocation(p, "u_background"), x = e.getUniformLocation(p, "u_coverage"), ne = e.getUniformLocation(p, "u_lightWrapping"), re = e.getUniformLocation(p, "u_blendMode");
	e.useProgram(p), e.uniform2f(g, 1, 1), e.uniform2f(v, 0, 0), e.uniform1i(y, 0), e.uniform1i(b, 1), e.uniform2f(x, 0, 1), e.uniform1f(ne, 0), e.uniform1f(re, 0);
	let ie = null;
	i?.complete ? oe(i) : i && (i.onload = () => {
		oe(i);
	});
	function ae() {
		e.viewport(0, 0, c, l), e.useProgram(p), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, r), ie !== null && (e.activeTexture(e.TEXTURE2), e.bindTexture(e.TEXTURE_2D, ie), e.uniform1i(te, 2)), e.bindFramebuffer(e.FRAMEBUFFER, null), e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
	}
	function oe(t) {
		ie = ee(e, e.RGBA8, t.naturalWidth, t.naturalHeight, e.LINEAR, e.LINEAR), e.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, t.naturalWidth, t.naturalHeight, e.RGBA, e.UNSIGNED_BYTE, t);
		let n = 0, r = 0, i = t.naturalWidth, a = t.naturalHeight;
		i / a < u ? (a = i / u, r = (t.naturalHeight - a) / 2) : (i = a * u, n = (t.naturalWidth - i) / 2);
		let o = i / t.naturalWidth, s = a / t.naturalHeight;
		n /= t.naturalWidth, r /= t.naturalHeight, e.uniform2f(g, o, s), e.uniform2f(v, n, r);
	}
	function se(t) {
		e.useProgram(p), e.uniform2f(x, t[0], t[1]);
	}
	function ce(t) {
		e.useProgram(p), e.uniform1f(ne, t);
	}
	function le(t) {
		e.useProgram(p), e.uniform1f(re, t === "screen" ? 0 : 1);
	}
	function S() {
		e.deleteTexture(ie), e.deleteProgram(p), e.deleteShader(f), e.deleteShader(d);
	}
	return {
		render: ae,
		updateCoverage: se,
		updateLightWrapping: ce,
		updateBlendMode: le,
		cleanUp: S
	};
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/webgl2/jointBilateralFilterStage.js
function ie(e, t, n, r, i, a, o, s) {
	let c = m`#version 300 es

    precision highp float;

    uniform sampler2D u_inputFrame;
    uniform sampler2D u_segmentationMask;
    uniform vec2 u_texelSize;
    uniform float u_step;
    uniform float u_radius;
    uniform float u_offset;
    uniform float u_sigmaTexel;
    uniform float u_sigmaColor;

    in vec2 v_texCoord;
    out vec4 outColor;

    float gaussian(float x, float sigma) {
      float coeff = -0.5 / (sigma * sigma * 4.0 + 1.0e-6);
      return exp((x * x) * coeff);
    }

    void main() {
      vec2 centerCoord = v_texCoord;
      vec3 centerColor = texture(u_inputFrame, centerCoord).rgb;
      float newVal = 0.0;

      float spaceWeight = 0.0;
      float colorWeight = 0.0;
      float totalWeight = 0.0;

      // Subsample kernel space.
      for (float i = -u_radius + u_offset; i <= u_radius; i += u_step) {
        for (float j = -u_radius + u_offset; j <= u_radius; j += u_step) {
          vec2 shift = vec2(j, i) * u_texelSize;
          vec2 coord = vec2(centerCoord + shift);
          vec3 frameColor = texture(u_inputFrame, coord).rgb;
          float outVal = texture(u_segmentationMask, coord).a;

          spaceWeight = gaussian(distance(centerCoord, coord), u_sigmaTexel);
          colorWeight = gaussian(distance(centerColor, frameColor), u_sigmaColor);
          totalWeight += spaceWeight * colorWeight;

          newVal += spaceWeight * colorWeight * outVal;
        }
      }
      newVal /= totalWeight;

      outColor = vec4(vec3(0.0), newVal);
    }
  `, { width: l, height: u } = s, { width: d, height: f } = o, p = 1 / d, g = 1 / f, ee = _(e, e.FRAGMENT_SHADER, c), v = h(e, t, ee, n, r), y = e.getUniformLocation(v, "u_inputFrame"), b = e.getUniformLocation(v, "u_segmentationMask"), te = e.getUniformLocation(v, "u_texelSize"), x = e.getUniformLocation(v, "u_step"), ne = e.getUniformLocation(v, "u_radius"), re = e.getUniformLocation(v, "u_offset"), ie = e.getUniformLocation(v, "u_sigmaTexel"), ae = e.getUniformLocation(v, "u_sigmaColor"), oe = e.createFramebuffer();
	e.bindFramebuffer(e.FRAMEBUFFER, oe), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, a, 0), e.useProgram(v), e.uniform1i(y, 0), e.uniform1i(b, 1), e.uniform2f(te, p, g), ce(0), le(0);
	function se() {
		e.viewport(0, 0, d, f), e.useProgram(v), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, i), e.bindFramebuffer(e.FRAMEBUFFER, oe), e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
	}
	function ce(t) {
		t *= Math.max(d / l, f / u);
		let n = Math.max(1, Math.sqrt(t) * .66), r = t, i = n > 1 ? n * .5 : 0, a = Math.max(p, g) * t;
		e.useProgram(v), e.uniform1f(x, n), e.uniform1f(ne, r), e.uniform1f(re, i), e.uniform1f(ie, a);
	}
	function le(t) {
		e.useProgram(v), e.uniform1f(ae, t);
	}
	function S() {
		e.deleteFramebuffer(oe), e.deleteProgram(v), e.deleteShader(ee);
	}
	return {
		render: se,
		updateSigmaSpace: ce,
		updateSigmaColor: le,
		cleanUp: S
	};
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/webgl2/resizingStage.js
function ae(e, t, n, r, i, a, o) {
	let s = m`#version 300 es

    precision highp float;
    uniform sampler2D u_inputFrame;
    in vec2 v_texCoord;
    out vec4 outColor;

    void main() {
      outColor = texture(u_inputFrame, v_texCoord);
    }
  `, c = i._getInputMemoryOffset() / 4, { width: l, height: u } = a, d = l * u, f = _(e, e.FRAGMENT_SHADER, s), p = h(e, t, f, n, r), g = e.getUniformLocation(p, "u_inputFrame"), y = ee(e, e.RGBA8, l, u), b = e.createFramebuffer();
	e.bindFramebuffer(e.FRAMEBUFFER, b), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, y, 0);
	let te = new Uint8Array(d * 4);
	e.useProgram(p), e.uniform1i(g, 0);
	function x() {
		e.viewport(0, 0, l, u), e.useProgram(p), e.bindFramebuffer(e.FRAMEBUFFER, b), e.drawArrays(e.TRIANGLE_STRIP, 0, 4), v(e, 0, 0, l, u, e.RGBA, e.UNSIGNED_BYTE, te).catch((e) => {});
		for (let e = 0; e < d; e++) {
			let t = c + e * 3, n = e * 4;
			i.HEAPF32[t] = te[n] / 255, i.HEAPF32[t + 1] = te[n + 1] / 255, i.HEAPF32[t + 2] = te[n + 2] / 255;
		}
	}
	function ne() {
		e.deleteFramebuffer(b), e.deleteTexture(y), e.deleteProgram(p), e.deleteShader(f);
	}
	return {
		render: x,
		cleanUp: ne
	};
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/webgl2/softmaxStage.js
function oe(e, t, n, r, i, a, o) {
	let s = m`#version 300 es

    precision highp float;

    uniform sampler2D u_inputSegmentation;
    in vec2 v_texCoord;
    out vec4 outColor;

    void main() {
      vec2 segmentation = texture(u_inputSegmentation, v_texCoord).rg;
      float shift = max(segmentation.r, segmentation.g);
      float backgroundExp = exp(segmentation.r - shift);
      float personExp = exp(segmentation.g - shift);
      outColor = vec4(vec3(0.0), personExp / (backgroundExp + personExp));
    }
  `, c = i._getOutputMemoryOffset() / 4, { width: l, height: u } = o, d = _(e, e.FRAGMENT_SHADER, s), f = h(e, t, d, n, r), p = e.getUniformLocation(f, "u_inputSegmentation"), g = ee(e, e.RG32F, l, u), v = e.createFramebuffer();
	e.bindFramebuffer(e.FRAMEBUFFER, v), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, a, 0), e.useProgram(f), e.uniform1i(p, 1);
	function y() {
		e.viewport(0, 0, l, u), e.useProgram(f), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, g), e.texSubImage2D(e.TEXTURE_2D, 0, 0, 0, l, u, e.RG, e.FLOAT, i.HEAPF32, c), e.bindFramebuffer(e.FRAMEBUFFER, v), e.drawArrays(e.TRIANGLE_STRIP, 0, 4);
	}
	function b() {
		e.deleteFramebuffer(v), e.deleteTexture(g), e.deleteProgram(f), e.deleteShader(d);
	}
	return {
		render: y,
		cleanUp: b
	};
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/webgl2/webgl2Pipeline.js
function se(e, t, n, r, i, a, o, s) {
	let c = i.getContext("webgl2");
	if (!c) throw Error("WebGL2 is not supported");
	if (c.isContextLost()) throw Error("WebGL2 context was lost");
	let { width: l, height: u } = e, { width: d, height: f } = o, p = m`#version 300 es

    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `, h = _(c, c.VERTEX_SHADER, p), g = c.createVertexArray();
	c.bindVertexArray(g);
	let v = c.createBuffer();
	c.bindBuffer(c.ARRAY_BUFFER, v), c.bufferData(c.ARRAY_BUFFER, new Float32Array([
		-1,
		-1,
		1,
		-1,
		-1,
		1,
		1,
		1
	]), c.STATIC_DRAW);
	let y = c.createBuffer();
	c.bindBuffer(c.ARRAY_BUFFER, y), c.bufferData(c.ARRAY_BUFFER, new Float32Array([
		0,
		0,
		1,
		0,
		0,
		1,
		1,
		1
	]), c.STATIC_DRAW);
	let b = c.createTexture();
	c.bindTexture(c.TEXTURE_2D, b), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.CLAMP_TO_EDGE), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.NEAREST), c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.NEAREST);
	let x = ee(c, c.RGBA8, d, f), ne = ee(c, c.RGBA8, l, u), se = ae(c, h, v, y, a, o), ce = oe(c, h, v, y, a, x, o), le = ie(c, h, v, y, x, ne, i, o), S = r === "blur" ? te(c, h, v, y, ne, i, n || "high") : re(c, v, y, ne, t, i);
	function ue() {
		c.activeTexture(c.TEXTURE0), c.bindTexture(c.TEXTURE_2D, b), c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, e), c.bindVertexArray(g), se.render(), a._runInference(), ce.render(), le.render(), S.render();
	}
	function de() {
		if (le.updateSigmaSpace(1), le.updateSigmaColor(.1), r === "image") {
			let e = S;
			e.updateCoverage([.5, .75]), e.updateLightWrapping(.3), e.updateBlendMode("screen");
		} else if (r === "blur") S.updateCoverage([.5, .75]);
		else {
			let e = S;
			e.updateCoverage([0, .9999]), e.updateLightWrapping(0);
		}
	}
	function fe() {
		S.cleanUp(), le.cleanUp(), ce.cleanUp(), se.cleanUp(), c.deleteTexture(ne), c.deleteTexture(x), c.deleteTexture(b), c.deleteBuffer(y), c.deleteBuffer(v), c.deleteVertexArray(g), c.deleteShader(h);
	}
	return {
		render: ue,
		updatePostProcessingConfig: de,
		cleanUp: fe
	};
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/segmentation.js
var ce;
(function(e) {
	e.LOW = "low", e.HIGH = "high";
})(ce ||= {});
var le = (e) => e === ce.HIGH ? {
	width: 256,
	height: 144
} : {
	width: 160,
	height: 96
};
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/createRenderer.js
function S(e, t, n, r, i) {
	let { backgroundFilter: a, backgroundImage: s, backgroundBlurLevel: c, segmentationLevel: l = ce.HIGH, fps: u = 30 } = r;
	if (a === "image" && !s) throw Error("backgroundImage element is required when backgroundFilter is image");
	let d = se(t, s, c, a, n, e, le(l)), f = new o({ useWorker: !0 }), p = f.setInterval(() => {
		try {
			d.render(), a === "image" && d.updatePostProcessingConfig();
		} catch (e) {
			i?.(e);
		}
	}, Math.floor(1e3 / (u <= 0 ? 30 : u)));
	return { dispose: () => {
		d.cleanUp(), f.clearInterval(p), f.destroy();
	} };
}
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/legacy/tflite-simd.js
var ue = (e) => {
	e ||= {};
	var t = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0, n = e === void 0 ? {} : e, r, i;
	n.ready = new Promise(function(e, t) {
		r = e, i = t;
	});
	var a = Object.assign({}, n), o = "./this.program", s = (e, t) => {
		throw t;
	}, c = !0, l = "";
	function u(e) {
		return n.locateFile ? n.locateFile(e, l) : l + e;
	}
	typeof document < "u" && document.currentScript && (l = document.currentScript.src), t && (l = t), l = l.indexOf("blob:") === 0 ? "" : l.substr(0, l.replace(/[?#].*/, "").lastIndexOf("/") + 1);
	var d = n.print || console.log.bind(console), f = n.printErr || console.warn.bind(console);
	Object.assign(n, a), a = null, n.arguments && n.arguments, n.thisProgram && (o = n.thisProgram), n.quit && (s = n.quit);
	var p;
	n.wasmBinary && (p = n.wasmBinary), n.noExitRuntime, typeof WebAssembly != "object" && pe("no native wasm support detected");
	var m, h = !1, g = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0;
	function _(e, t, n) {
		for (var r = t + n, i = t; e[i] && !(i >= r);) ++i;
		if (i - t > 16 && e.buffer && g) return g.decode(e.subarray(t, i));
		for (var a = ""; t < i;) {
			var o = e[t++];
			if (!(o & 128)) a += String.fromCharCode(o);
			else {
				var s = e[t++] & 63;
				if ((o & 224) == 192) a += String.fromCharCode((o & 31) << 6 | s);
				else {
					var c = e[t++] & 63;
					if (o = (o & 240) == 224 ? (o & 15) << 12 | s << 6 | c : (o & 7) << 18 | s << 12 | c << 6 | e[t++] & 63, o < 65536) a += String.fromCharCode(o);
					else {
						var l = o - 65536;
						a += String.fromCharCode(55296 | l >> 10, 56320 | l & 1023);
					}
				}
			}
		}
		return a;
	}
	var ee, v, y, b;
	function te(e) {
		ee = e, n.HEAP8 = v = new Int8Array(e), n.HEAP16 = new Int16Array(e), n.HEAP32 = new Int32Array(e), n.HEAPU8 = y = new Uint8Array(e), n.HEAPU16 = new Uint16Array(e), n.HEAPU32 = b = new Uint32Array(e), n.HEAPF32 = new Float32Array(e), n.HEAPF64 = new Float64Array(e);
	}
	n.INITIAL_MEMORY;
	var x = [], ne = [], re = [];
	function ie() {
		if (n.preRun) for (typeof n.preRun == "function" && (n.preRun = [n.preRun]); n.preRun.length;) se(n.preRun.shift());
		xe(x);
	}
	function ae() {
		xe(ne);
	}
	function oe() {
		if (n.postRun) for (typeof n.postRun == "function" && (n.postRun = [n.postRun]); n.postRun.length;) le(n.postRun.shift());
		xe(re);
	}
	function se(e) {
		x.unshift(e);
	}
	function ce(e) {
		ne.unshift(e);
	}
	function le(e) {
		re.unshift(e);
	}
	var S = 0, ue = null;
	function de(e) {
		S++, n.monitorRunDependencies && n.monitorRunDependencies(S);
	}
	function fe(e) {
		if (S--, n.monitorRunDependencies && n.monitorRunDependencies(S), S == 0 && ue) {
			var t = ue;
			ue = null, t();
		}
	}
	function pe(e) {
		n.onAbort && n.onAbort(e), e = "Aborted(" + e + ")", f(e), h = !0, e += ". Build with -sASSERTIONS for more info.";
		var t = new WebAssembly.RuntimeError(e);
		throw i(t), t;
	}
	var me = "data:application/octet-stream;base64,";
	function he(e) {
		return e.startsWith(me);
	}
	var ge = "tflite-simd.wasm";
	he(ge) || (ge = u(ge));
	function _e(e) {
		try {
			if (e == ge && p) return new Uint8Array(p);
			throw "both async and sync fetching of the wasm failed";
		} catch (e) {
			pe(e);
		}
	}
	function ve() {
		return !p && c && typeof fetch == "function" ? fetch(ge, { credentials: "same-origin" }).then(function(e) {
			if (!e.ok) throw "failed to load wasm binary file at '" + ge + "'";
			return e.arrayBuffer();
		}).catch(function() {
			return _e(ge);
		}) : Promise.resolve().then(function() {
			return _e(ge);
		});
	}
	function ye() {
		var e = {
			env: et,
			wasi_snapshot_preview1: et
		};
		function t(e, t) {
			n.asm = e.exports, m = n.asm.memory, te(m.buffer), n.asm.__indirect_function_table, ce(n.asm.__wasm_call_ctors), fe();
		}
		de();
		function r(e) {
			t(e.instance);
		}
		function a(t) {
			return ve().then(function(t) {
				return WebAssembly.instantiate(t, e);
			}).then(function(e) {
				return e;
			}).then(t, function(e) {
				f("failed to asynchronously prepare wasm: " + e), pe(e);
			});
		}
		function o() {
			return !p && typeof WebAssembly.instantiateStreaming == "function" && !he(ge) && typeof fetch == "function" ? fetch(ge, { credentials: "same-origin" }).then(function(t) {
				return WebAssembly.instantiateStreaming(t, e).then(r, function(e) {
					return f("wasm streaming compile failed: " + e), f("falling back to ArrayBuffer instantiation"), a(r);
				});
			}) : a(r);
		}
		if (n.instantiateWasm) try {
			return n.instantiateWasm(e, t);
		} catch (e) {
			f("Module.instantiateWasm callback failed with error: " + e), i(e);
		}
		return o().catch(i), {};
	}
	function be(e) {
		this.name = "ExitStatus", this.message = "Program terminated with exit(" + e + ")", this.status = e;
	}
	function xe(e) {
		for (; e.length > 0;) e.shift()(n);
	}
	function Se(e) {}
	var Ce = "To use dlopen, you need enable dynamic linking, see https://github.com/emscripten-core/emscripten/wiki/Linking";
	function we(e, t) {
		pe(Ce);
	}
	function Te(e, t) {
		pe(Ce);
	}
	var Ee = !0;
	function De() {
		return Ee;
	}
	function Oe(e, t, n, r, i, a) {
		return -52;
	}
	function ke(e, t, n, r, i, a) {}
	function Ae() {
		pe("");
	}
	function je() {
		return Date.now();
	}
	function Me() {
		return 2147483648;
	}
	function Ne() {
		return Me();
	}
	var Pe = () => performance.now();
	function Fe(e, t, n) {
		y.copyWithin(e, t, t + n);
	}
	function Ie(e) {
		try {
			return m.grow(e - ee.byteLength + 65535 >>> 16), te(m.buffer), 1;
		} catch {}
	}
	function Le(e) {
		var t = y.length;
		e >>>= 0;
		var n = Me();
		if (e > n) return !1;
		let r = (e, t) => e + (t - e % t) % t;
		for (var i = 1; i <= 4; i *= 2) {
			var a = t * (1 + .2 / i);
			if (a = Math.min(a, e + 100663296), Ie(Math.min(n, r(Math.max(e, a), 65536)))) return !0;
		}
		return !1;
	}
	var Re = {};
	function ze() {
		return o || "./this.program";
	}
	function Be() {
		if (!Be.strings) {
			var e = {
				USER: "web_user",
				LOGNAME: "web_user",
				PATH: "/",
				PWD: "/",
				HOME: "/home/web_user",
				LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
				_: ze()
			};
			for (var t in Re) Re[t] === void 0 ? delete e[t] : e[t] = Re[t];
			var n = [];
			for (var t in e) n.push(t + "=" + e[t]);
			Be.strings = n;
		}
		return Be.strings;
	}
	function Ve(e, t, n) {
		for (var r = 0; r < e.length; ++r) v[t++ | 0] = e.charCodeAt(r);
		v[t | 0] = 0;
	}
	function He(e, t) {
		var n = 0;
		return Be().forEach(function(r, i) {
			var a = t + n;
			b[e + i * 4 >> 2] = a, Ve(r, a), n += r.length + 1;
		}), 0;
	}
	function Ue(e, t) {
		var n = Be();
		b[e >> 2] = n.length;
		var r = 0;
		return n.forEach(function(e) {
			r += e.length + 1;
		}), b[t >> 2] = r, 0;
	}
	function We(e) {
		s(e, new be(e));
	}
	function Ge(e, t) {
		We(e);
	}
	var Ke = Ge;
	function qe(e) {
		return 52;
	}
	function Je(e, t, n, r, i) {
		return 70;
	}
	var Ye = [
		null,
		[],
		[]
	];
	function Xe(e, t) {
		var n = Ye[e];
		t === 0 || t === 10 ? ((e === 1 ? d : f)(_(n, 0)), n.length = 0) : n.push(t);
	}
	function Ze(e, t, n, r) {
		for (var i = 0, a = 0; a < n; a++) {
			var o = b[t >> 2], s = b[t + 4 >> 2];
			t += 8;
			for (var c = 0; c < s; c++) Xe(e, y[o + c]);
			i += s;
		}
		return b[r >> 2] = i, 0;
	}
	function Qe() {
		if (typeof crypto == "object" && typeof crypto.getRandomValues == "function") {
			var e = /* @__PURE__ */ new Uint8Array(1);
			return () => (crypto.getRandomValues(e), e[0]);
		}
		return () => pe("randomDevice");
	}
	function $e(e, t) {
		$e.randomDevice ||= Qe();
		for (var n = 0; n < t; n++) v[e + n | 0] = $e.randomDevice();
		return 0;
	}
	var et = {
		_dlinit: Se,
		_dlopen_js: we,
		_dlsym_js: Te,
		_emscripten_get_now_is_monotonic: De,
		_mmap_js: Oe,
		_munmap_js: ke,
		abort: Ae,
		emscripten_date_now: je,
		emscripten_get_heap_max: Ne,
		emscripten_get_now: Pe,
		emscripten_memcpy_big: Fe,
		emscripten_resize_heap: Le,
		environ_get: He,
		environ_sizes_get: Ue,
		exit: Ke,
		fd_close: qe,
		fd_seek: Je,
		fd_write: Ze,
		getentropy: $e
	};
	ye(), n.___wasm_call_ctors = function() {
		return (n.___wasm_call_ctors = n.asm.__wasm_call_ctors).apply(null, arguments);
	}, n._getModelBufferMemoryOffset = function() {
		return (n._getModelBufferMemoryOffset = n.asm.getModelBufferMemoryOffset).apply(null, arguments);
	}, n._getInputMemoryOffset = function() {
		return (n._getInputMemoryOffset = n.asm.getInputMemoryOffset).apply(null, arguments);
	}, n._getInputHeight = function() {
		return (n._getInputHeight = n.asm.getInputHeight).apply(null, arguments);
	}, n._getInputWidth = function() {
		return (n._getInputWidth = n.asm.getInputWidth).apply(null, arguments);
	}, n._getInputChannelCount = function() {
		return (n._getInputChannelCount = n.asm.getInputChannelCount).apply(null, arguments);
	}, n._getOutputMemoryOffset = function() {
		return (n._getOutputMemoryOffset = n.asm.getOutputMemoryOffset).apply(null, arguments);
	}, n._getOutputHeight = function() {
		return (n._getOutputHeight = n.asm.getOutputHeight).apply(null, arguments);
	}, n._getOutputWidth = function() {
		return (n._getOutputWidth = n.asm.getOutputWidth).apply(null, arguments);
	}, n._getOutputChannelCount = function() {
		return (n._getOutputChannelCount = n.asm.getOutputChannelCount).apply(null, arguments);
	}, n._loadModel = function() {
		return (n._loadModel = n.asm.loadModel).apply(null, arguments);
	}, n._runInference = function() {
		return (n._runInference = n.asm.runInference).apply(null, arguments);
	}, n._malloc = function() {
		return (n._malloc = n.asm.malloc).apply(null, arguments);
	}, n.___errno_location = function() {
		return (n.___errno_location = n.asm.__errno_location).apply(null, arguments);
	}, n.___dl_seterr = function() {
		return (n.___dl_seterr = n.asm.__dl_seterr).apply(null, arguments);
	}, n.stackSave = function() {
		return (n.stackSave = n.asm.stackSave).apply(null, arguments);
	}, n.stackRestore = function() {
		return (n.stackRestore = n.asm.stackRestore).apply(null, arguments);
	}, n.stackAlloc = function() {
		return (n.stackAlloc = n.asm.stackAlloc).apply(null, arguments);
	}, n.dynCall_jjj = function() {
		return (n.dynCall_jjj = n.asm.dynCall_jjj).apply(null, arguments);
	}, n.dynCall_jiii = function() {
		return (n.dynCall_jiii = n.asm.dynCall_jiii).apply(null, arguments);
	}, n.dynCall_iiiijj = function() {
		return (n.dynCall_iiiijj = n.asm.dynCall_iiiijj).apply(null, arguments);
	}, n.dynCall_viijj = function() {
		return (n.dynCall_viijj = n.asm.dynCall_viijj).apply(null, arguments);
	}, n.dynCall_viiijjj = function() {
		return (n.dynCall_viiijjj = n.asm.dynCall_viiijjj).apply(null, arguments);
	}, n.dynCall_iijjiiii = function() {
		return (n.dynCall_iijjiiii = n.asm.dynCall_iijjiiii).apply(null, arguments);
	}, n.dynCall_jiji = function() {
		return (n.dynCall_jiji = n.asm.dynCall_jiji).apply(null, arguments);
	};
	var tt;
	ue = function e() {
		tt || nt(), tt || (ue = e);
	};
	function nt(e) {
		if (S > 0 || (ie(), S > 0)) return;
		function t() {
			tt || (tt = !0, n.calledRun = !0, !h && (ae(), r(n), n.onRuntimeInitialized && n.onRuntimeInitialized(), oe()));
		}
		n.setStatus ? (n.setStatus("Running..."), setTimeout(function() {
			setTimeout(function() {
				n.setStatus("");
			}, 1), t();
		}, 1)) : t();
	}
	if (n.preInit) for (typeof n.preInit == "function" && (n.preInit = [n.preInit]); n.preInit.length > 0;) n.preInit.pop()();
	return nt(), e.ready;
}, de = "0.10.0", fe = "@stream-io/video-filters-web", pe = ue, me = async (e = {}) => {
	let { basePath: t = `https://unpkg.com/${fe}@${de}/tf`, tfFilePath: n = `${t}/tflite/tflite-simd.wasm`, modelFilePath: r = `${t}/models/segm_full_v679.tflite` } = e, [i, a] = await Promise.all([pe({ locateFile: () => n }), _e(r)]), o = i._getModelBufferMemoryOffset();
	return i.HEAPU8.set(new Uint8Array(a), o), i._loadModel(a.byteLength), i;
}, he = "", ge, _e = async (e) => {
	let t = e === he && ge ? ge : await fetch(e).then((e) => e.arrayBuffer());
	return ge = t, he = e, t;
}, ve = "", ye, be = async (e = {}) => {
	let { basePath: t = `https://unpkg.com/${fe}@${de}/mediapipe`, modelPath: n = `${t}/models/selfie_segmenter_landscape.tflite` } = e, r = n === ve && ye ? ye : await fetch(n).then((e) => e.arrayBuffer());
	return ye = r, ve = n, r;
}, xe = {
	low: 3,
	medium: 5,
	high: 7
}, Se = class {
	constructor({ kind: e, signalTarget: t }) {
		if (e !== "video") throw Error("Only video tracks are supported");
		let n = document.createElement("canvas"), r = n.getContext("2d", { desynchronized: !0 });
		if (!r) throw Error("Failed to get 2D context from canvas");
		let i = n.captureStream().getVideoTracks()[0], a = t?.getSettings().height, o = t?.getSettings().width;
		if (a && o && (n.height = a, n.width = o), !i) throw Error("Failed to create canvas track");
		return t && t.addEventListener("ended", () => {
			i.stop();
		}), i.writable = new WritableStream({
			write: (e) => {
				(n.width !== e.displayWidth || n.height !== e.displayHeight) && (n.width = e.displayWidth, n.height = e.displayHeight), r.drawImage(e, 0, 0, n.width, n.height), e.close();
			},
			abort: () => {
				i.stop();
			},
			close: () => {
				i.stop();
			}
		}), i;
	}
}, Ce = typeof MediaStreamTrackGenerator < "u" ? MediaStreamTrackGenerator : Se, we = class {
	readable;
	workerTimer;
	video;
	constructor({ track: e }) {
		if (!e) throw Error("MediaStreamTrack is required");
		if (e.kind !== "video") throw Error("MediaStreamTrack must be video");
		let t = !0;
		this.video = document.createElement("video"), this.video.muted = !0, this.video.playsInline = !0, this.video.srcObject = new MediaStream([e]);
		let n = new OffscreenCanvas(1, 1), r = n.getContext("2d");
		if (!r) throw Error("Failed to get 2D context from OffscreenCanvas");
		let i = 0, a = 1e3 / (e.getSettings().frameRate || 30);
		this.workerTimer = new o({ useWorker: !0 }), this.readable = new ReadableStream({
			start: async () => {
				await Promise.all([this.video.play(), new Promise((e) => this.video.addEventListener("loadeddata", e, { once: !0 }))]), a = 1e3 / (e.getSettings().frameRate || 30), i = performance.now();
			},
			pull: async (e) => {
				if (!t) {
					e.close(), this.close();
					return;
				}
				let o = performance.now() - i;
				o <= a && await new Promise((e) => this.workerTimer.setTimeout(e, a - o)), i = performance.now(), (n.width !== this.video.videoWidth || n.height !== this.video.videoHeight) && (n.width = this.video.videoWidth, n.height = this.video.videoHeight), r.drawImage(this.video, 0, 0);
				try {
					let t = new VideoFrame(n, { timestamp: Math.round(this.video.currentTime * 1e6) });
					e.enqueue(t);
				} catch (n) {
					t = !1, e.error(n), this.close();
				}
			},
			cancel: () => {
				t = !1, this.close();
			}
		});
	}
	close = () => {
		this.video.pause(), this.video.srcObject = null, this.video.src = "", this.workerTimer.destroy();
	};
}, Te = typeof MediaStreamTrackProcessor < "u" ? MediaStreamTrackProcessor : we, Ee = class {
	track;
	processor;
	generator;
	hooks;
	abortController = new AbortController();
	canvas;
	frames = 0;
	delayTotal = 0;
	lastStatsTime = 0;
	constructor(e, t = {}) {
		this.track = e, this.processor = new Te({ track: e }), this.generator = new Ce({
			kind: "video",
			signalTarget: e
		}), this.hooks = t;
	}
	async start() {
		let { readable: e } = this.processor, { writable: t } = this.generator, { width: n = 1280, height: r = 720 } = this.track.getSettings();
		this.canvas = new OffscreenCanvas(n, r), await this.initialize();
		let i = new TransformStream({
			transform: async (e, t) => {
				try {
					if (this.abortController.signal.aborted) return e.close();
					(this.canvas.width !== e.displayWidth || this.canvas.height !== e.displayHeight) && (this.canvas.width = e.displayWidth, this.canvas.height = e.displayHeight);
					let n = await this.transform(e);
					t.enqueue(n);
				} catch (e) {
					this.hooks.onError?.(e);
				} finally {
					e.close();
				}
			},
			flush: () => this.onFlush()
		});
		return e.pipeThrough(i, { signal: this.abortController.signal }).pipeTo(t, { signal: this.abortController.signal }).catch((e) => {
			e.name !== "AbortError" && e.name !== "InvalidStateError" && (console.error(`[${this.processorName}] Error processing track:`, e), this.hooks.onError?.(e));
		}), this.generator;
	}
	stop() {
		this.abortController.abort(), this.generator.stop(), this.onStop();
	}
	updateStats(e) {
		this.frames++, this.delayTotal += e;
		let t = performance.now();
		if (this.lastStatsTime === 0) this.lastStatsTime = t;
		else if (t - this.lastStatsTime >= 1e3) {
			let e = Math.round(this.delayTotal / this.frames * 100) / 100, n = Math.round(1e3 * this.frames / (t - this.lastStatsTime));
			this.hooks.onStats?.({
				delay: e,
				fps: n,
				timestamp: t
			}), this.frames = 0, this.delayTotal = 0, this.lastStatsTime = t;
		}
	}
	onFlush() {}
	onStop() {}
	get processorName() {
		return "base-processor";
	}
}, De = typeof self < "u" ? self : {};
function Oe(e, t) {
	t: {
		for (var n = ["CLOSURE_FLAGS"], r = De, i = 0; i < n.length; i++) if ((r = r[n[i]]) == null) {
			n = null;
			break t;
		}
		n = r;
	}
	return (e = n && n[e]) ?? t;
}
function ke() {
	throw Error("Invalid UTF8");
}
function Ae(e, t) {
	return t = String.fromCharCode.apply(null, t), e == null ? t : e + t;
}
var je, Me, Ne = typeof TextDecoder < "u", Pe, Fe = typeof TextEncoder < "u";
function Ie(e) {
	if (Fe) e = (Pe ||= new TextEncoder()).encode(e);
	else {
		let n = 0, r = new Uint8Array(3 * e.length);
		for (let i = 0; i < e.length; i++) {
			var t = e.charCodeAt(i);
			if (t < 128) r[n++] = t;
			else {
				if (t < 2048) r[n++] = t >> 6 | 192;
				else {
					if (t >= 55296 && t <= 57343) {
						if (t <= 56319 && i < e.length) {
							let a = e.charCodeAt(++i);
							if (a >= 56320 && a <= 57343) {
								t = 1024 * (t - 55296) + a - 56320 + 65536, r[n++] = t >> 18 | 240, r[n++] = t >> 12 & 63 | 128, r[n++] = t >> 6 & 63 | 128, r[n++] = 63 & t | 128;
								continue;
							}
							i--;
						}
						t = 65533;
					}
					r[n++] = t >> 12 | 224, r[n++] = t >> 6 & 63 | 128;
				}
				r[n++] = 63 & t | 128;
			}
		}
		e = n === r.length ? r : r.subarray(0, n);
	}
	return e;
}
function Le(e) {
	De.setTimeout((() => {
		throw e;
	}), 0);
}
var Re, ze = Oe(610401301, !1), Be = Oe(748402147, !0);
function Ve() {
	var e = De.navigator;
	return (e &&= e.userAgent) ? e : "";
}
var He = De.navigator;
function Ue(e) {
	return Ue[" "](e), e;
}
Re = He && He.userAgentData || null, Ue[" "] = function() {};
var We = {}, Ge = null;
function Ke(e) {
	let t = e.length, n = 3 * t / 4;
	n % 3 ? n = Math.floor(n) : "=.".indexOf(e[t - 1]) != -1 && (n = "=.".indexOf(e[t - 2]) == -1 ? n - 1 : n - 2);
	let r = new Uint8Array(n), i = 0;
	return function(e, t) {
		function n(t) {
			for (; r < e.length;) {
				let t = e.charAt(r++), n = Ge[t];
				if (n != null) return n;
				if (!/^[\s\xa0]*$/.test(t)) throw Error("Unknown base64 encoding at char: " + t);
			}
			return t;
		}
		qe();
		let r = 0;
		for (;;) {
			let e = n(-1), r = n(0), i = n(64), a = n(64);
			if (a === 64 && e === -1) break;
			t(e << 2 | r >> 4), i != 64 && (t(r << 4 & 240 | i >> 2), a != 64 && t(i << 6 & 192 | a));
		}
	}(e, (function(e) {
		r[i++] = e;
	})), i === n ? r : r.subarray(0, i);
}
function qe() {
	if (!Ge) {
		Ge = {};
		var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), t = [
			"+/=",
			"+/",
			"-_=",
			"-_.",
			"-_"
		];
		for (let n = 0; n < 5; n++) {
			let r = e.concat(t[n].split(""));
			We[n] = r;
			for (let e = 0; e < r.length; e++) {
				let t = r[e];
				Ge[t] === void 0 && (Ge[t] = e);
			}
		}
	}
}
var Je = typeof Uint8Array < "u", Ye = (!!(ze && Re && Re.brands.length > 0) || Ve().indexOf("Trident") == -1 && Ve().indexOf("MSIE") == -1) && typeof btoa == "function", Xe = /[-_.]/g, Ze = {
	"-": "+",
	_: "/",
	".": "="
};
function Qe(e) {
	return Ze[e] || "";
}
function $e(e) {
	if (!Ye) return Ke(e);
	e = Xe.test(e) ? e.replace(Xe, Qe) : e, e = atob(e);
	let t = new Uint8Array(e.length);
	for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n);
	return t;
}
function et(e) {
	return Je && e != null && e instanceof Uint8Array;
}
var tt = {};
function nt() {
	return at ||= new it(null, tt);
}
function rt(e) {
	st(tt);
	var t = e.g;
	return (t = t == null || et(t) ? t : typeof t == "string" ? $e(t) : null) == null ? t : e.g = t;
}
var it = class {
	h() {
		return new Uint8Array(rt(this) || 0);
	}
	constructor(e, t) {
		if (st(t), this.g = e, e != null && e.length === 0) throw Error("ByteString should be constructed with non-empty values");
	}
}, at, ot;
function st(e) {
	if (e !== tt) throw Error("illegal external caller");
}
function ct(e, t) {
	e.__closure__error__context__984382 ||= {}, e.__closure__error__context__984382.severity = t;
}
function lt(e) {
	return ct(e = Error(e), "warning"), e;
}
function ut(e, t) {
	if (e != null) {
		var n = ot ??= {}, r = n[e] || 0;
		r >= t || (n[e] = r + 1, ct(e = Error(), "incident"), Le(e));
	}
}
function dt() {
	return typeof BigInt == "function";
}
var ft = typeof Symbol == "function" && typeof Symbol() == "symbol";
function pt(e, t, n = !1) {
	return typeof Symbol == "function" && typeof Symbol() == "symbol" ? n && Symbol.for && e ? Symbol.for(e) : e == null ? Symbol() : Symbol(e) : t;
}
var mt = pt("jas", void 0, !0), ht = pt(void 0, "0di"), gt = pt(void 0, "1oa"), _t = pt(void 0, Symbol()), vt = pt(void 0, "0ub"), yt = pt(void 0, "0ubs"), bt = pt(void 0, "0ubsb"), xt = pt(void 0, "0actk"), St = pt("m_m", "Pa", !0), Ct = pt(), wt = { Ga: {
	value: 0,
	configurable: !0,
	writable: !0,
	enumerable: !1
} }, Tt = Object.defineProperties, C = ft ? mt : "Ga", Et, Dt = [];
function Ot(e, t) {
	ft || C in e || Tt(e, wt), e[C] |= t;
}
function w(e, t) {
	ft || C in e || Tt(e, wt), e[C] = t;
}
function kt(e) {
	return Ot(e, 34), e;
}
function At(e) {
	return Ot(e, 8192), e;
}
w(Dt, 7), Et = Object.freeze(Dt);
var jt = {};
function Mt(e, t) {
	return t === void 0 ? e.h !== Nt && !!(2 & (0 | e.v[C])) : !!(2 & t) && e.h !== Nt;
}
var Nt = {};
function Pt(e, t) {
	if (e != null) {
		if (typeof e == "string") e = e ? new it(e, tt) : nt();
		else if (e.constructor !== it) {
			if (et(e)) e = e.length ? new it(new Uint8Array(e), tt) : nt();
			else {
				if (!t) throw Error();
				e = void 0;
			}
		}
	}
	return e;
}
var Ft = class {
	constructor(e, t, n) {
		this.g = e, this.h = t, this.l = n;
	}
	next() {
		let e = this.g.next();
		return e.done || (e.value = this.h.call(this.l, e.value)), e;
	}
	[Symbol.iterator]() {
		return this;
	}
}, It = Object.freeze({});
function Lt(e, t, n) {
	let r = 128 & t ? 0 : -1, i = e.length;
	var a;
	(a = !!i) && (a = (a = e[i - 1]) != null && typeof a == "object" && a.constructor === Object);
	let o = i + (a ? -1 : 0);
	for (t = 128 & t ? 1 : 0; t < o; t++) n(t - r, e[t]);
	if (a) {
		e = e[i - 1];
		for (let t in e) !isNaN(t) && n(+t, e[t]);
	}
}
var Rt = {};
function zt(e) {
	return 128 & e ? Rt : void 0;
}
function Bt(e) {
	return e.Na = !0, e;
}
var Vt = Bt(((e) => typeof e == "number")), Ht = Bt(((e) => typeof e == "string")), Ut = Bt(((e) => typeof e == "boolean")), Wt = typeof De.BigInt == "function" && typeof De.BigInt(0) == "bigint";
function Gt(e) {
	var t = e;
	if (Ht(t)) {
		if (!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(t)) throw Error(String(t));
	} else if (Vt(t) && !Number.isSafeInteger(t)) throw Error(String(t));
	return Wt ? BigInt(e) : e = Ut(e) ? e ? "1" : "0" : Ht(e) ? e.trim() || "0" : String(e);
}
var Kt = Bt(((e) => Wt ? e >= Jt && e <= Xt : e[0] === "-" ? Zt(e, qt) : Zt(e, Yt))), qt = (-(2 ** 53 - 1)).toString(), Jt = Wt ? BigInt(-(2 ** 53 - 1)) : void 0, Yt = (2 ** 53 - 1).toString(), Xt = Wt ? BigInt(2 ** 53 - 1) : void 0;
function Zt(e, t) {
	if (e.length > t.length) return !1;
	if (e.length < t.length || e === t) return !0;
	for (let n = 0; n < e.length; n++) {
		let r = e[n], i = t[n];
		if (r > i) return !1;
		if (r < i) return !0;
	}
}
var Qt = typeof Uint8Array.prototype.slice == "function", $t, T = 0, E = 0;
function en(e) {
	let t = e >>> 0;
	T = t, E = (e - t) / 4294967296 >>> 0;
}
function tn(e) {
	if (e < 0) {
		en(-e);
		let [t, n] = dn(T, E);
		T = t >>> 0, E = n >>> 0;
	} else en(e);
}
function nn(e) {
	let t = $t ||= /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
	t.setFloat32(0, +e, !0), E = 0, T = t.getUint32(0, !0);
}
function rn(e, t) {
	let n = 4294967296 * t + (e >>> 0);
	return Number.isSafeInteger(n) ? n : sn(e, t);
}
function an(e, t) {
	return Gt(dt() ? BigInt.asUintN(64, (BigInt(t >>> 0) << BigInt(32)) + BigInt(e >>> 0)) : sn(e, t));
}
function on(e, t) {
	return dt() ? Gt(BigInt.asIntN(64, (BigInt.asUintN(32, BigInt(t)) << BigInt(32)) + BigInt.asUintN(32, BigInt(e)))) : Gt(ln(e, t));
}
function sn(e, t) {
	if (e >>>= 0, (t >>>= 0) <= 2097151) var n = "" + (4294967296 * t + e);
	else dt() ? n = "" + (BigInt(t) << BigInt(32) | BigInt(e)) : (e = (16777215 & e) + 6777216 * (n = 16777215 & (e >>> 24 | t << 8)) + 6710656 * (t = t >> 16 & 65535), n += 8147497 * t, t *= 2, e >= 1e7 && (n += e / 1e7 >>> 0, e %= 1e7), n >= 1e7 && (t += n / 1e7 >>> 0, n %= 1e7), n = t + cn(n) + cn(e));
	return n;
}
function cn(e) {
	return e = String(e), "0000000".slice(e.length) + e;
}
function ln(e, t) {
	if (2147483648 & t) {
		if (dt()) e = "" + (BigInt(0 | t) << BigInt(32) | BigInt(e >>> 0));
		else {
			let [n, r] = dn(e, t);
			e = "-" + sn(n, r);
		}
	} else e = sn(e, t);
	return e;
}
function un(e) {
	if (e.length < 16) tn(Number(e));
	else if (dt()) e = BigInt(e), T = Number(e & BigInt(4294967295)) >>> 0, E = Number(e >> BigInt(32) & BigInt(4294967295));
	else {
		let t = +(e[0] === "-");
		E = T = 0;
		let n = e.length;
		for (let r = t, i = (n - t) % 6 + t; i <= n; r = i, i += 6) {
			let t = Number(e.slice(r, i));
			E *= 1e6, T = 1e6 * T + t, T >= 4294967296 && (E += Math.trunc(T / 4294967296), E >>>= 0, T >>>= 0);
		}
		if (t) {
			let [e, t] = dn(T, E);
			T = e, E = t;
		}
	}
}
function dn(e, t) {
	return t = ~t, e ? e = 1 + ~e : t += 1, [e, t];
}
function fn(e) {
	return Array.prototype.slice.call(e);
}
var pn = typeof BigInt == "function" ? BigInt.asIntN : void 0, mn = typeof BigInt == "function" ? BigInt.asUintN : void 0, hn = Number.isSafeInteger, gn = Number.isFinite, _n = Math.trunc, vn = Gt(0);
function yn(e) {
	if (e != null && typeof e != "number") throw Error(`Value of float/double field must be a number, found ${typeof e}: ${e}`);
	return e;
}
function bn(e) {
	return e == null || typeof e == "number" ? e : e === "NaN" || e === "Infinity" || e === "-Infinity" ? Number(e) : void 0;
}
function xn(e) {
	if (e != null && typeof e != "boolean") {
		var t = typeof e;
		throw Error(`Expected boolean but got ${t == "object" ? e ? Array.isArray(e) ? "array" : t : "null" : t}: ${e}`);
	}
	return e;
}
function Sn(e) {
	return e == null || typeof e == "boolean" ? e : typeof e == "number" ? !!e : void 0;
}
var Cn = /^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;
function wn(e) {
	switch (typeof e) {
		case "bigint": return !0;
		case "number": return gn(e);
		case "string": return Cn.test(e);
		default: return !1;
	}
}
function Tn(e) {
	if (e == null) return e;
	if (typeof e == "string" && e) e = +e;
	else if (typeof e != "number") return;
	return gn(e) ? 0 | e : void 0;
}
function En(e) {
	if (e == null) return e;
	if (typeof e == "string" && e) e = +e;
	else if (typeof e != "number") return;
	return gn(e) ? e >>> 0 : void 0;
}
function Dn(e) {
	let t = e.length;
	return (e[0] === "-" ? t < 20 || t === 20 && e <= "-9223372036854775808" : t < 19 || t === 19 && e <= "9223372036854775807") ? e : (un(e), ln(T, E));
}
function On(e) {
	if (e = _n(e), !hn(e)) {
		tn(e);
		var t = T, n = E;
		(e = 2147483648 & n) && (n = ~n >>> 0, (t = 1 + ~t >>> 0) == 0 && (n = n + 1 >>> 0)), e = typeof (t = rn(t, n)) == "number" ? e ? -t : t : e ? "-" + t : t;
	}
	return e;
}
function kn(e) {
	var t = _n(Number(e));
	return hn(t) ? String(t) : ((t = e.indexOf(".")) !== -1 && (e = e.substring(0, t)), Dn(e));
}
function An(e) {
	var t = _n(Number(e));
	return hn(t) ? Gt(t) : ((t = e.indexOf(".")) !== -1 && (e = e.substring(0, t)), dt() ? Gt(pn(64, BigInt(e))) : Gt(Dn(e)));
}
function jn(e) {
	return hn(e) ? e = Gt(On(e)) : (e = _n(e), hn(e) ? e = String(e) : (tn(e), e = ln(T, E)), e = Gt(e)), e;
}
function Mn(e) {
	let t = typeof e;
	return e == null ? e : t === "bigint" ? Gt(pn(64, e)) : wn(e) ? t === "string" ? An(e) : jn(e) : void 0;
}
function Nn(e) {
	if (typeof e != "string") throw Error();
	return e;
}
function Pn(e) {
	if (e != null && typeof e != "string") throw Error();
	return e;
}
function Fn(e) {
	return e == null || typeof e == "string" ? e : void 0;
}
function In(e, t, n, r) {
	return e != null && e[St] === jt ? e : Array.isArray(e) ? ((r = (n = 0 | e[C]) | 32 & r | 2 & r) !== n && w(e, r), new t(e)) : (n ? 2 & r ? ((e = t[ht]) || (kt((e = new t()).v), e = t[ht] = e), t = e) : t = new t() : t = void 0, t);
}
function Ln(e, t, n) {
	if (t) t: {
		if (!wn(t = e)) throw lt("int64");
		switch (typeof t) {
			case "string":
				t = An(t);
				break t;
			case "bigint":
				t = Gt(pn(64, t));
				break t;
			default: t = jn(t);
		}
	}
	else t = Mn(e);
	return (e = t) ?? (n ? vn : void 0);
}
var Rn = {}, zn = function() {
	try {
		return Ue(new class extends Map {
			constructor() {
				super();
			}
		}()), !1;
	} catch {
		return !0;
	}
}(), Bn = class {
	constructor() {
		this.g = /* @__PURE__ */ new Map();
	}
	get(e) {
		return this.g.get(e);
	}
	set(e, t) {
		return this.g.set(e, t), this.size = this.g.size, this;
	}
	delete(e) {
		return e = this.g.delete(e), this.size = this.g.size, e;
	}
	clear() {
		this.g.clear(), this.size = this.g.size;
	}
	has(e) {
		return this.g.has(e);
	}
	entries() {
		return this.g.entries();
	}
	keys() {
		return this.g.keys();
	}
	values() {
		return this.g.values();
	}
	forEach(e, t) {
		return this.g.forEach(e, t);
	}
	[Symbol.iterator]() {
		return this.entries();
	}
}, Vn = zn ? (Object.setPrototypeOf(Bn.prototype, Map.prototype), Object.defineProperties(Bn.prototype, { size: {
	value: 0,
	configurable: !0,
	enumerable: !0,
	writable: !0
} }), Bn) : class extends Map {
	constructor() {
		super();
	}
};
function Hn(e) {
	return e;
}
function Un(e) {
	if (2 & e.J) throw Error("Cannot mutate an immutable Map");
}
var Wn = class extends Vn {
	constructor(e, t, n = Hn, r = Hn) {
		super(), this.J = 0 | e[C], this.K = t, this.S = n, this.fa = this.K ? Gn : r;
		for (let i = 0; i < e.length; i++) {
			let a = e[i], o = n(a[0], !1, !0), s = a[1];
			t ? s === void 0 && (s = null) : s = r(a[1], !1, !0, void 0, void 0, this.J), super.set(o, s);
		}
	}
	V(e) {
		return At(Array.from(super.entries(), e));
	}
	clear() {
		Un(this), super.clear();
	}
	delete(e) {
		return Un(this), super.delete(this.S(e, !0, !1));
	}
	entries() {
		if (this.K) {
			var e = super.keys();
			e = new Ft(e, Kn, this);
		} else e = super.entries();
		return e;
	}
	values() {
		if (this.K) {
			var e = super.keys();
			e = new Ft(e, Wn.prototype.get, this);
		} else e = super.values();
		return e;
	}
	forEach(e, t) {
		this.K ? super.forEach(((n, r, i) => {
			e.call(t, i.get(r), r, i);
		})) : super.forEach(e, t);
	}
	set(e, t) {
		return Un(this), (e = this.S(e, !0, !1)) == null ? this : t == null ? (super.delete(e), this) : super.set(e, this.fa(t, !0, !0, this.K, !1, this.J));
	}
	Ma(e) {
		let t = this.S(e[0], !1, !0);
		e = e[1], e = this.K ? e === void 0 ? null : e : this.fa(e, !1, !0, void 0, !1, this.J), super.set(t, e);
	}
	has(e) {
		return super.has(this.S(e, !1, !1));
	}
	get(e) {
		e = this.S(e, !1, !1);
		let t = super.get(e);
		if (t !== void 0) {
			var n = this.K;
			return n ? ((n = this.fa(t, !1, !0, n, this.ra, this.J)) !== t && super.set(e, n), n) : t;
		}
	}
	[Symbol.iterator]() {
		return this.entries();
	}
};
function Gn(e, t, n, r, i, a) {
	return e = In(e, r, n, a), i && (e = pr(e)), e;
}
function Kn(e) {
	return [e, this.get(e)];
}
var qn;
function Jn() {
	return qn ||= new Wn(kt([]), void 0, void 0, void 0, Rn);
}
function Yn(e) {
	return _t ? e[_t] : void 0;
}
function Xn(e, t) {
	for (let n in e) !isNaN(n) && t(e, +n, e[n]);
}
Wn.prototype.toJSON = void 0;
var Zn = class {}, Qn = { Ka: !0 };
function $n(e, t) {
	t < 100 || ut(yt, 1);
}
function er(e, t, n, r) {
	let i = r !== void 0;
	r = !!r;
	var a, o = _t;
	!i && ft && o && (a = e[o]) && Xn(a, $n), o = [];
	var s = e.length;
	let c;
	a = 4294967295;
	let l = !1, u = !!(64 & t), d = u ? 128 & t ? 0 : -1 : void 0;
	1 & t || (c = s && e[s - 1], typeof c == "object" && c && c.constructor === Object ? a = --s : c = void 0, !u || 128 & t || i || (l = !0, a = a - d + d)), t = void 0;
	for (var f = 0; f < s; f++) {
		let i = e[f];
		if (i != null && (i = n(i, r)) != null) {
			if (u && f >= a) {
				let e = f - d;
				(t ??= {})[e] = i;
			} else o[f] = i;
		}
	}
	if (c) for (let e in c) {
		if ((s = c[e]) == null || (s = n(s, r)) == null) continue;
		let i;
		f = +e, u && !Number.isNaN(f) && (i = f + d) < a ? o[i] = s : (t ??= {})[e] = s;
	}
	return t && (l ? o.push(t) : o[a] = t), i && _t && (e = Yn(e)) && e instanceof Zn && (o[_t] = function(e) {
		let t = new Zn();
		return Xn(e, ((e, n, r) => {
			t[n] = fn(r);
		})), t.da = e.da, t;
	}(e)), o;
}
function tr(e) {
	return e[0] = nr(e[0]), e[1] = nr(e[1]), e;
}
function nr(e) {
	switch (typeof e) {
		case "number": return Number.isFinite(e) ? e : "" + e;
		case "bigint": return Kt(e) ? Number(e) : "" + e;
		case "boolean": return +!!e;
		case "object":
			if (Array.isArray(e)) {
				var t = 0 | e[C];
				return e.length === 0 && 1 & t ? void 0 : er(e, t, nr);
			}
			if (e != null && e[St] === jt) return ar(e);
			if (e instanceof it) {
				if ((t = e.g) == null) e = "";
				else if (typeof t == "string") e = t;
				else {
					if (Ye) {
						for (var n = "", r = 0, i = t.length - 10240; r < i;) n += String.fromCharCode.apply(null, t.subarray(r, r += 10240));
						n += String.fromCharCode.apply(null, r ? t.subarray(r) : t), t = btoa(n);
					} else {
						n === void 0 && (n = 0), qe(), n = We[n], r = Array(Math.floor(t.length / 3)), i = n[64] || "";
						let e = 0, l = 0;
						for (; e < t.length - 2; e += 3) {
							var a = t[e], o = t[e + 1], s = t[e + 2], c = n[a >> 2];
							a = n[(3 & a) << 4 | o >> 4], o = n[(15 & o) << 2 | s >> 6], s = n[63 & s], r[l++] = c + a + o + s;
						}
						switch (c = 0, s = i, t.length - e) {
							case 2: s = n[(15 & (c = t[e + 1])) << 2] || i;
							case 1: t = t[e], r[l] = n[t >> 2] + n[(3 & t) << 4 | c >> 4] + s + i;
						}
						t = r.join("");
					}
					e = e.g = t;
				}
				return e;
			}
			return e instanceof Wn ? e = e.size === 0 ? void 0 : e.V(tr) : void 0;
	}
	return e;
}
var rr, ir;
function ar(e) {
	return er(e = e.v, 0 | e[C], nr);
}
function or(e, t) {
	return sr(e, t[0], t[1]);
}
function sr(e, t, n, r = 0) {
	if (e == null) {
		var i = 32;
		n ? (e = [n], i |= 128) : e = [], t && (i = -16760833 & i | (1023 & t) << 14);
	} else {
		if (!Array.isArray(e)) throw Error("narr");
		if (i = 0 | e[C], Be && 1 & i) throw Error("rfarr");
		if (2048 & i && !(2 & i) && function() {
			if (Be) throw Error("carr");
			ut(xt, 5);
		}(), 256 & i) throw Error("farr");
		if (64 & i) return (i | r) !== i && w(e, i | r), e;
		if (n && (i |= 128, n !== e[0])) throw Error("mid");
		t: {
			i |= 64;
			var a = (n = e).length;
			if (a) {
				var o = a - 1;
				let e = n[o];
				if (typeof e == "object" && e && e.constructor === Object) {
					if ((o -= t = 128 & i ? 0 : -1) >= 1024) throw Error("pvtlmt");
					for (var s in e) (a = +s) < o && (n[a + t] = e[s], delete e[s]);
					i = -16760833 & i | (1023 & o) << 14;
					break t;
				}
			}
			if (t) {
				if ((s = Math.max(t, a - (128 & i ? 0 : -1))) > 1024) throw Error("spvt");
				i = -16760833 & i | (1023 & s) << 14;
			}
		}
	}
	return w(e, 64 | i | r), e;
}
function cr(e, t) {
	if (typeof e != "object") return e;
	if (Array.isArray(e)) {
		var n = 0 | e[C];
		return e.length === 0 && 1 & n ? void 0 : lr(e, n, t);
	}
	if (e != null && e[St] === jt) return dr(e);
	if (e instanceof Wn) {
		if (2 & (t = e.J)) return e;
		if (!e.size) return;
		if (n = kt(e.V()), e.K) for (e = 0; e < n.length; e++) {
			let r = n[e], i = r[1];
			i = typeof i != "object" || !i ? void 0 : i != null && i[St] === jt ? dr(i) : Array.isArray(i) ? lr(i, 0 | i[C], !!(32 & t)) : void 0, r[1] = i;
		}
		return n;
	}
	return e instanceof it ? e : void 0;
}
function lr(e, t, n) {
	return 2 & t || (!n || 4096 & t || 16 & t ? e = fr(e, t, !1, n && !(16 & t)) : (Ot(e, 34), 4 & t && Object.freeze(e))), e;
}
function ur(e, t, n) {
	return e = new e.constructor(t), n && (e.h = Nt), e.m = Nt, e;
}
function dr(e) {
	let t = e.v, n = 0 | t[C];
	return Mt(e, n) ? e : _r(e, t, n) ? ur(e, t) : fr(t, n);
}
function fr(e, t, n, r) {
	return r ??= !!(34 & t), e = er(e, t, cr, r), r = 32, n && (r |= 2), w(e, t = 16769217 & t | r), e;
}
function pr(e) {
	let t = e.v, n = 0 | t[C];
	return Mt(e, n) ? _r(e, t, n) ? ur(e, t, !0) : new e.constructor(fr(t, n, !1)) : e;
}
function mr(e) {
	if (e.h !== Nt) return !1;
	var t = e.v;
	return Ot(t = fr(t, 0 | t[C]), 2048), e.v = t, e.h = void 0, e.m = void 0, !0;
}
function hr(e) {
	if (!mr(e) && Mt(e, 0 | e.v[C])) throw Error();
}
function gr(e, t) {
	t === void 0 && (t = 0 | e[C]), 32 & t && !(4096 & t) && w(e, 4096 | t);
}
function _r(e, t, n) {
	return !!(2 & n) || !(!(32 & n) || 4096 & n) && (w(t, 2 | n), e.h = Nt, !0);
}
var vr = Gt(0), yr = {};
function D(e, t, n, r, i) {
	if ((t = br(e.v, t, n, i)) !== null || r && e.m !== Nt) return t;
}
function br(e, t, n, r) {
	if (t === -1) return null;
	let i = t + (n ? 0 : -1), a = e.length - 1, o, s;
	if (!(a < 1 + (n ? 0 : -1))) {
		if (i >= a) {
			if (o = e[a], typeof o == "object" && o && o.constructor === Object) n = o[t], s = !0;
			else {
				if (i !== a) return;
				n = o;
			}
		} else n = e[i];
		if (r && n != null) {
			if ((r = r(n)) == null) return r;
			if (!Object.is(r, n)) return s ? o[t] = r : e[i] = r, r;
		}
		return n;
	}
}
function O(e, t, n, r) {
	hr(e), k(e = e.v, 0 | e[C], t, n, r);
}
function k(e, t, n, r, i) {
	let a = n + (i ? 0 : -1);
	var o = e.length - 1;
	if (o >= 1 + (i ? 0 : -1) && a >= o) {
		let i = e[o];
		if (typeof i == "object" && i && i.constructor === Object) return i[n] = r, t;
	}
	return a <= o ? (e[a] = r, t) : (r !== void 0 && (n >= (o = (t ??= 0 | e[C]) >> 14 & 1023 || 536870912) ? r != null && (e[o + (i ? 0 : -1)] = { [n]: r }) : e[a] = r), t);
}
function xr() {
	return It === void 0 ? 2 : 4;
}
function Sr(e, t, n, r, i) {
	let a = e.v, o = 0 | a[C];
	r = Mt(e, o) ? 1 : r, i = !!i || r === 3, r === 2 && mr(e) && (a = e.v, o = 0 | a[C]);
	let s = (e = wr(a, t)) === Et ? 7 : 0 | e[C], c = Tr(s, o);
	var l = !(4 & c);
	if (l) {
		4 & c && (e = fn(e), s = 0, c = Vr(c, o), o = k(a, o, t, e));
		let r = 0, i = 0;
		for (; r < e.length; r++) {
			let t = n(e[r]);
			t != null && (e[i++] = t);
		}
		i < r && (e.length = i), n = -513 & (4 | c), c = n &= -1025, c &= -4097;
	}
	return c !== s && (w(e, c), 2 & c && Object.freeze(e)), Cr(e, c, a, o, t, r, l, i);
}
function Cr(e, t, n, r, i, a, o, s) {
	let c = t;
	return a === 1 || a === 4 && (2 & t || !(16 & t) && 32 & r) ? Er(t) || ((t |= !e.length || o && !(4096 & t) || 32 & r && !(4096 & t || 16 & t) ? 2 : 256) !== c && w(e, t), Object.freeze(e)) : (a === 2 && Er(t) && (e = fn(e), c = 0, t = Vr(t, r), r = k(n, r, i, e)), Er(t) || (s || (t |= 16), t !== c && w(e, t))), 2 & t || !(4096 & t || 16 & t) || gr(n, r), e;
}
function wr(e, t, n) {
	return e = br(e, t, n), Array.isArray(e) ? e : Et;
}
function Tr(e, t) {
	return 2 & t && (e |= 2), 1 | e;
}
function Er(e) {
	return !!(2 & e) && !!(4 & e) || !!(256 & e);
}
function Dr(e) {
	return Pt(e, !0);
}
function Or(e) {
	e = fn(e);
	for (let t = 0; t < e.length; t++) {
		let n = e[t] = fn(e[t]);
		Array.isArray(n[1]) && (n[1] = kt(n[1]));
	}
	return At(e);
}
function kr(e, t, n, r) {
	hr(e), k(e = e.v, 0 | e[C], t, (r === "0" ? Number(n) === 0 : n === r) ? void 0 : n);
}
function Ar(e, t, n) {
	if (2 & t) throw Error();
	let r = zt(t), i = wr(e, n, r), a = i === Et ? 7 : 0 | i[C], o = Tr(a, t);
	return (2 & o || Er(o) || 16 & o) && (o === a || Er(o) || w(i, o), i = fn(i), a = 0, o = Vr(o, t), k(e, t, n, i, r)), o &= -13, o !== a && w(i, o), i;
}
function jr(e, t) {
	var n = Bo;
	return Pr(Mr(e = e.v), e, void 0, n) === t ? t : -1;
}
function Mr(e) {
	if (ft) return e[gt] ?? (e[gt] = /* @__PURE__ */ new Map());
	if (gt in e) return e[gt];
	let t = /* @__PURE__ */ new Map();
	return Object.defineProperty(e, gt, { value: t }), t;
}
function Nr(e, t, n, r, i) {
	let a = Mr(e), o = Pr(a, e, t, n, i);
	return o !== r && (o && (t = k(e, t, o, void 0, i)), a.set(n, r)), t;
}
function Pr(e, t, n, r, i) {
	let a = e.get(r);
	if (a != null) return a;
	a = 0;
	for (let e = 0; e < r.length; e++) {
		let o = r[e];
		br(t, o, i) != null && (a !== 0 && (n = k(t, n, a, void 0, i)), a = o);
	}
	return e.set(r, a), a;
}
function Fr(e, t, n) {
	let r = 0 | e[C], i = zt(r), a = br(e, n, i), o;
	if (a != null && a[St] === jt) {
		if (!Mt(a)) return mr(a), a.v;
		o = a.v;
	} else Array.isArray(a) && (o = a);
	if (o) {
		let e = 0 | o[C];
		2 & e && (o = fr(o, e));
	}
	return o = or(o, t), o !== a && k(e, r, n, o, i), o;
}
function Ir(e, t, n, r, i) {
	let a = !1;
	if ((r = br(e, r, i, ((e) => {
		let r = In(e, n, !1, t);
		return a = r !== e && r != null, r;
	}))) != null) return a && !Mt(r) && gr(e, t), r;
}
function A(e, t, n, r) {
	let i = e.v, a = 0 | i[C];
	if ((t = Ir(i, a, t, n, r)) == null) return t;
	if (a = 0 | i[C], !Mt(e, a)) {
		let o = pr(t);
		o !== t && (mr(e) && (i = e.v, a = 0 | i[C]), a = k(i, a, n, t = o, r), gr(i, a));
	}
	return t;
}
function Lr(e, t, n, r, i, a, o, s) {
	var c = Mt(e, n);
	a = c ? 1 : a, o = !!o || a === 3, c = s && !c, (a === 2 || c) && mr(e) && (n = 0 | (t = e.v)[C]);
	var l = (e = wr(t, i)) === Et ? 7 : 0 | e[C], u = Tr(l, n);
	if (s = !(4 & u)) {
		var d = e, f = n;
		let t = !!(2 & u);
		t && (f |= 2);
		let i = !t, a = !0, o = 0, s = 0;
		for (; o < d.length; o++) {
			let e = In(d[o], r, !1, f);
			if (e instanceof r) {
				if (!t) {
					let t = Mt(e);
					i &&= !t, a &&= t;
				}
				d[s++] = e;
			}
		}
		s < o && (d.length = s), u |= 4, u = a ? -4097 & u : 4096 | u, u = i ? 8 | u : -9 & u;
	}
	if (u !== l && (w(e, u), 2 & u && Object.freeze(e)), c && !(8 & u || !e.length && (a === 1 || a === 4 && (2 & u || !(16 & u) && 32 & n)))) {
		for (Er(u) && (e = fn(e), u = Vr(u, n), n = k(t, n, i, e)), r = e, c = u, l = 0; l < r.length; l++) (d = r[l]) !== (u = pr(d)) && (r[l] = u);
		c |= 8, w(e, u = c = r.length ? 4096 | c : -4097 & c);
	}
	return Cr(e, u, t, n, i, a, s, o);
}
function Rr(e, t, n) {
	let r = e.v;
	return Lr(e, r, 0 | r[C], t, n, xr(), !1, !0);
}
function zr(e) {
	return e ??= void 0, e;
}
function j(e, t, n, r, i) {
	return O(e, n, r = zr(r), i), r && !Mt(r) && gr(e.v), e;
}
function Br(e, t, n, r) {
	t: {
		var i = r = zr(r);
		hr(e);
		let a = e.v, o = 0 | a[C];
		if (i == null) {
			let e = Mr(a);
			if (Pr(e, a, o, n) !== t) break t;
			e.set(n, 0);
		} else o = Nr(a, o, n, t);
		k(a, o, t, i);
	}
	r && !Mt(r) && gr(e.v);
}
function Vr(e, t) {
	return -273 & (2 & t ? 2 | e : -3 & e);
}
function Hr(e, t, n, r) {
	var i = r;
	hr(e), e = Lr(e, r = e.v, 0 | r[C], n, t, 2, !0), i ??= new n(), e.push(i), t = n = e === Et ? 7 : 0 | e[C], (i = Mt(i)) ? (n &= -9, e.length === 1 && (n &= -4097)) : n |= 4096, n !== t && w(e, n), i || gr(r);
}
function Ur(e, t, n) {
	return Tn(D(e, t, void 0, n));
}
function M(e, t) {
	return D(e, t, void 0, void 0, bn) ?? 0;
}
function Wr(e, t, n) {
	if (n != null) {
		if (typeof n != "number" || !gn(n)) throw lt("int32");
		n |= 0;
	}
	O(e, t, n);
}
function N(e, t, n) {
	O(e, t, yn(n));
}
function Gr(e, t, n) {
	kr(e, t, Pn(n), "");
}
function Kr(e, t, n) {
	{
		hr(e);
		let o = e.v, s = 0 | o[C];
		if (n == null) k(o, s, t);
		else {
			var r = e = n === Et ? 7 : 0 | n[C], i = Er(e), a = i || Object.isFrozen(n);
			for (i || (e = 0), a ||= (n = fn(n), r = 0, e = Vr(e, s), !1), e |= 5, e |= (4 & e ? 512 & e ? 512 : 1024 & e ? 1024 : 0 : void 0) ?? 1024, i = 0; i < n.length; i++) {
				let t = n[i], o = Nn(t);
				Object.is(t, o) || (a &&= (n = fn(n), r = 0, e = Vr(e, s), !1), n[i] = o);
			}
			e !== r && (a && (n = fn(n), e = Vr(e, s)), w(n, e)), k(o, s, t, n);
		}
	}
}
function qr(e, t, n) {
	hr(e), Sr(e, t, Fn, 2, !0).push(Nn(n));
}
var Jr = class {
	constructor(e, t, n) {
		if (this.buffer = e, n && !t) throw Error();
		this.g = t;
	}
};
function Yr(e, t) {
	if (typeof e == "string") return new Jr($e(e), t);
	if (Array.isArray(e)) return new Jr(new Uint8Array(e), t);
	if (e.constructor === Uint8Array) return new Jr(e, !1);
	if (e.constructor === ArrayBuffer) return e = new Uint8Array(e), new Jr(e, !1);
	if (e.constructor === it) return t = rt(e) || /* @__PURE__ */ new Uint8Array(), new Jr(t, !0, e);
	if (e instanceof Uint8Array) return e = e.constructor === Uint8Array ? e : new Uint8Array(e.buffer, e.byteOffset, e.byteLength), new Jr(e, !1);
	throw Error();
}
function Xr(e, t) {
	let n, r = 0, i = 0, a = 0, o = e.h, s = e.g;
	do
		n = o[s++], r |= (127 & n) << a, a += 7;
	while (a < 32 && 128 & n);
	if (a > 32) for (i |= (127 & n) >> 4, a = 3; a < 32 && 128 & n; a += 7) n = o[s++], i |= (127 & n) << a;
	if (ni(e, s), !(128 & n)) return t(r >>> 0, i >>> 0);
	throw Error();
}
function Zr(e) {
	let t = 0, n = e.g, r = n + 10, i = e.h;
	for (; n < r;) {
		let r = i[n++];
		if (t |= r, !(128 & r)) return ni(e, n), !!(127 & t);
	}
	throw Error();
}
function Qr(e) {
	let t = e.h, n = e.g, r = t[n++], i = 127 & r;
	if (128 & r && (r = t[n++], i |= (127 & r) << 7, 128 & r && (r = t[n++], i |= (127 & r) << 14, 128 & r && (r = t[n++], i |= (127 & r) << 21, 128 & r && (r = t[n++], i |= r << 28, 128 & r && 128 & t[n++] && 128 & t[n++] && 128 & t[n++] && 128 & t[n++] && 128 & t[n++]))))) throw Error();
	return ni(e, n), i;
}
function $r(e) {
	return Qr(e) >>> 0;
}
function ei(e) {
	var t = e.h;
	let n = e.g;
	var r = t[n], i = t[n + 1];
	let a = t[n + 2];
	return t = t[n + 3], ni(e, e.g + 4), e = 2 * ((i = (r | 0 | i << 8 | a << 16 | t << 24) >>> 0) >> 31) + 1, r = i >>> 23 & 255, i &= 8388607, r == 255 ? i ? NaN : 1 / 0 * e : r == 0 ? 1401298464324817e-60 * e * i : e * 2 ** (r - 150) * (i + 8388608);
}
function ti(e) {
	return Qr(e);
}
function ni(e, t) {
	if (e.g = t, t > e.l) throw Error();
}
function ri(e, t) {
	if (t < 0) throw Error();
	let n = e.g;
	if ((t = n + t) > e.l) throw Error();
	return e.g = t, n;
}
function ii(e, t) {
	if (t == 0) return nt();
	var n = ri(e, t);
	return e.Y && e.j ? n = e.h.subarray(n, n + t) : (e = e.h, n = n === (t = n + t) ? /* @__PURE__ */ new Uint8Array() : Qt ? e.slice(n, t) : new Uint8Array(e.subarray(n, t))), n.length == 0 ? nt() : new it(n, tt);
}
var ai = [];
function oi(e, t, n, r) {
	if (hi.length) {
		let i = hi.pop();
		return i.o(r), i.g.init(e, t, n, r), i;
	}
	return new mi(e, t, n, r);
}
function si(e) {
	e.g.clear(), e.l = -1, e.h = -1, hi.length < 100 && hi.push(e);
}
function ci(e) {
	var t = e.g;
	if (t.g == t.l) return !1;
	e.m = e.g.g;
	var n = $r(e.g);
	if (t = n >>> 3, !((n &= 7) >= 0 && n <= 5) || t < 1) throw Error();
	return e.l = t, e.h = n, !0;
}
function li(e) {
	switch (e.h) {
		case 0:
			e.h == 0 ? Zr(e.g) : li(e);
			break;
		case 1:
			ni(e = e.g, e.g + 8);
			break;
		case 2:
			if (e.h != 2) li(e);
			else {
				var t = $r(e.g);
				ni(e = e.g, e.g + t);
			}
			break;
		case 5:
			ni(e = e.g, e.g + 4);
			break;
		case 3:
			for (t = e.l;;) {
				if (!ci(e)) throw Error();
				if (e.h == 4) {
					if (e.l != t) throw Error();
					break;
				}
				li(e);
			}
			break;
		default: throw Error();
	}
}
function ui(e, t, n) {
	let r = e.g.l;
	var i = $r(e.g);
	let a = (i = e.g.g + i) - r;
	if (a <= 0 && (e.g.l = i, n(t, e, void 0, void 0, void 0), a = i - e.g.g), a) throw Error();
	return e.g.g = i, e.g.l = r, t;
}
function di(e) {
	var t = $r(e.g), n = ri(e = e.g, t);
	if (e = e.h, Ne) {
		var r, i = e;
		(r = Me) || (r = Me = new TextDecoder("utf-8", { fatal: !0 })), t = n + t, i = n === 0 && t === i.length ? i : i.subarray(n, t);
		try {
			var a = r.decode(i);
		} catch (e) {
			if (je === void 0) {
				try {
					r.decode(new Uint8Array([128]));
				} catch {}
				try {
					r.decode(new Uint8Array([97])), je = !0;
				} catch {
					je = !1;
				}
			}
			throw !je && (Me = void 0), e;
		}
	} else {
		t = (a = n) + t, n = [];
		let s, c = null;
		for (; a < t;) {
			var o = e[a++];
			o < 128 ? n.push(o) : o < 224 ? a >= t ? ke() : (s = e[a++], o < 194 || (192 & s) != 128 ? (a--, ke()) : n.push((31 & o) << 6 | 63 & s)) : o < 240 ? a >= t - 1 ? ke() : (s = e[a++], (192 & s) != 128 || o === 224 && s < 160 || o === 237 && s >= 160 || (192 & (r = e[a++])) != 128 ? (a--, ke()) : n.push((15 & o) << 12 | (63 & s) << 6 | 63 & r)) : o <= 244 ? a >= t - 2 ? ke() : (s = e[a++], (192 & s) != 128 || s - 144 + (o << 28) >> 30 || (192 & (r = e[a++])) != 128 || (192 & (i = e[a++])) != 128 ? (a--, ke()) : (o = (7 & o) << 18 | (63 & s) << 12 | (63 & r) << 6 | 63 & i, o -= 65536, n.push(55296 + (o >> 10 & 1023), 56320 + (1023 & o)))) : ke(), n.length >= 8192 && (c = Ae(c, n), n.length = 0);
		}
		a = Ae(c, n);
	}
	return a;
}
function fi(e) {
	let t = $r(e.g);
	return ii(e.g, t);
}
function pi(e, t, n) {
	var r = $r(e.g);
	for (r = e.g.g + r; e.g.g < r;) n.push(t(e.g));
}
var mi = class {
	constructor(e, t, n, r) {
		if (ai.length) {
			let i = ai.pop();
			i.init(e, t, n, r), e = i;
		} else e = new class {
			constructor(e, t, n, r) {
				this.h = null, this.j = !1, this.g = this.l = this.m = 0, this.init(e, t, n, r);
			}
			init(e, t, n, { Y: r = !1, ea: i = !1 } = {}) {
				this.Y = r, this.ea = i, e && (e = Yr(e, this.ea), this.h = e.buffer, this.j = e.g, this.m = t || 0, this.l = n === void 0 ? this.h.length : this.m + n, this.g = this.m);
			}
			clear() {
				this.h = null, this.j = !1, this.g = this.l = this.m = 0, this.Y = !1;
			}
		}(e, t, n, r);
		this.g = e, this.m = this.g.g, this.h = this.l = -1, this.o(r);
	}
	o({ ha: e = !1 } = {}) {
		this.ha = e;
	}
}, hi = [];
function gi(e) {
	return e ? /^\d+$/.test(e) ? (un(e), new _i(T, E)) : null : vi ||= new _i(0, 0);
}
var _i = class {
	constructor(e, t) {
		this.h = e >>> 0, this.g = t >>> 0;
	}
}, vi;
function yi(e) {
	return e ? /^-?\d+$/.test(e) ? (un(e), new bi(T, E)) : null : xi ||= new bi(0, 0);
}
var bi = class {
	constructor(e, t) {
		this.h = e >>> 0, this.g = t >>> 0;
	}
}, xi;
function Si(e, t, n) {
	for (; n > 0 || t > 127;) e.g.push(127 & t | 128), t = (t >>> 7 | n << 25) >>> 0, n >>>= 7;
	e.g.push(t);
}
function Ci(e, t) {
	for (; t > 127;) e.g.push(127 & t | 128), t >>>= 7;
	e.g.push(t);
}
function wi(e, t) {
	if (t >= 0) Ci(e, t);
	else {
		for (let n = 0; n < 9; n++) e.g.push(127 & t | 128), t >>= 7;
		e.g.push(1);
	}
}
function Ti(e) {
	var t = T;
	e.g.push(t >>> 0 & 255), e.g.push(t >>> 8 & 255), e.g.push(t >>> 16 & 255), e.g.push(t >>> 24 & 255);
}
function Ei(e, t) {
	t.length !== 0 && (e.l.push(t), e.h += t.length);
}
function Di(e, t, n) {
	Ci(e.g, 8 * t + n);
}
function Oi(e, t) {
	return Di(e, t, 2), t = e.g.end(), Ei(e, t), t.push(e.h), t;
}
function ki(e, t) {
	var n = t.pop();
	for (n = e.h + e.g.length() - n; n > 127;) t.push(127 & n | 128), n >>>= 7, e.h++;
	t.push(n), e.h++;
}
function Ai(e, t, n) {
	Di(e, t, 2), Ci(e.g, n.length), Ei(e, e.g.end()), Ei(e, n);
}
function ji(e, t, n, r) {
	n != null && (t = Oi(e, t), r(n, e), ki(e, t));
}
function Mi() {
	let e = class {
		constructor() {
			throw Error();
		}
	};
	return Object.setPrototypeOf(e, e.prototype), e;
}
var Ni = Mi(), Pi = Mi(), Fi = Mi(), Ii = Mi(), Li = Mi(), Ri = Mi(), zi = Mi(), Bi = Mi(), Vi = Mi(), Hi = Mi();
function Ui(e, t, n) {
	var r = e.v;
	_t && _t in r && (r = r[_t]) && delete r[t.g], t.h ? t.j(e, t.h, t.g, n, t.l) : t.j(e, t.g, n, t.l);
}
var P = class {
	constructor(e, t) {
		this.v = sr(e, t, void 0, 2048);
	}
	toJSON() {
		return ar(this);
	}
	j() {
		var e = As, t = this.v, n = e.g, r = _t;
		if (ft && r && t[r]?.[n] != null && ut(vt, 3), t = e.g, Ct && _t && Ct === void 0 && (r = (n = this.v)[_t]) && (r = r.da)) try {
			r(n, t, Qn);
		} catch (e) {
			Le(e);
		}
		return e.h ? e.m(this, e.h, e.g, e.l) : e.m(this, e.g, e.defaultValue, e.l);
	}
	clone() {
		let e = this.v, t = 0 | e[C];
		return _r(this, e, t) ? ur(this, e, !0) : new this.constructor(fr(e, t, !1));
	}
};
P.prototype[St] = jt, P.prototype.toString = function() {
	return this.v.toString();
};
var Wi = class {
	constructor(e, t, n) {
		this.g = e, this.h = t, e = Ni, this.l = !!e && n === e || !1;
	}
};
function Gi(e, t) {
	return new Wi(e, t, Ni);
}
function Ki(e, t, n, r, i) {
	ji(e, n, ia(t, r), i);
}
var qi = Gi((function(e, t, n, r, i) {
	return e.h === 2 && (ui(e, Fr(t, r, n), i), !0);
}), Ki), Ji = Gi((function(e, t, n, r, i) {
	return e.h === 2 && (ui(e, Fr(t, r, n), i), !0);
}), Ki), Yi = Symbol(), Xi = Symbol(), Zi = Symbol(), Qi = Symbol(), $i = Symbol(), ea, ta;
function na(e, t, n, r) {
	var i = r[e];
	if (i) return i;
	(i = {}).qa = r, i.T = function(e) {
		switch (typeof e) {
			case "boolean": return rr ||= [
				0,
				void 0,
				!0
			];
			case "number": return e > 0 ? void 0 : e === 0 ? ir ||= [0, void 0] : [-e, void 0];
			case "string": return [0, e];
			case "object": return e;
		}
	}(r[0]);
	var a = r[1];
	let o = 1;
	a && a.constructor === Object && (i.ba = a, typeof (a = r[++o]) == "function" && (i.ma = !0, ea ??= a, ta ??= r[o + 1], a = r[o += 2]));
	let s = {};
	for (; a && Array.isArray(a) && a.length && typeof a[0] == "number" && a[0] > 0;) {
		for (var c = 0; c < a.length; c++) s[a[c]] = a;
		a = r[++o];
	}
	for (c = 1; a !== void 0;) {
		let e;
		typeof a == "number" && (c += a, a = r[++o]);
		var l = void 0;
		if (a instanceof Wi ? e = a : (e = qi, o--), e?.l) {
			a = r[++o], l = r;
			var u = o;
			typeof a == "function" && (a = a(), l[u] = a), l = a;
		}
		for (u = c + 1, typeof (a = r[++o]) == "number" && a < 0 && (u -= a, a = r[++o]); c < u; c++) {
			let r = s[c];
			l ? n(i, c, e, l, r) : t(i, c, e, r);
		}
	}
	return r[e] = i;
}
function ra(e) {
	return Array.isArray(e) ? e[0] instanceof Wi ? e : [Ji, e] : [e, void 0];
}
function ia(e, t) {
	return e instanceof P ? e.v : Array.isArray(e) ? or(e, t) : void 0;
}
function aa(e, t, n, r) {
	let i = n.g;
	e[t] = r ? (e, t, n) => i(e, t, n, r) : i;
}
function oa(e, t, n, r, i) {
	let a = n.g, o, s;
	e[t] = (e, t, n) => a(e, t, n, s ||= na(Xi, aa, oa, r).T, o ||= sa(r), i);
}
function sa(e) {
	let t = e[Zi];
	if (t != null) return t;
	let n = na(Xi, aa, oa, e);
	return t = n.ma ? (e, t) => ea(e, t, n) : (e, t) => {
		for (; ci(t) && t.h != 4;) {
			var r = t.l, i = n[r];
			if (i == null) {
				var a = n.ba;
				(a &&= a[r]) && (a = la(a)) != null && (i = n[r] = a);
			}
			if (i == null || !i(t, e, r)) {
				if (i = (a = t).m, li(a), a.ha) var o = void 0;
				else o = a.g.g - i, a.g.g = i, o = ii(a.g, o);
				i = void 0, a = e, o && ((i = a[_t] ?? (a[_t] = new Zn()))[r] ?? (i[r] = [])).push(o);
			}
		}
		return (e = Yn(e)) && (e.da = n.qa[$i]), !0;
	}, e[Zi] = t, e[$i] = ca.bind(e), t;
}
function ca(e, t, n, r) {
	var i = this[Xi];
	let a = this[Zi], o = or(void 0, i.T), s = Yn(e);
	if (s) {
		var c = !1, l = i.ba;
		if (l) {
			if (i = (t, n, i) => {
				if (i.length !== 0) {
					if (l[n]) for (let e of i) {
						t = oi(e);
						try {
							c = !0, a(o, t);
						} finally {
							si(t);
						}
					}
					else r?.(e, n, i);
				}
			}, t == null) Xn(s, i);
			else if (s != null) {
				let e = s[t];
				e && i(s, t, e);
			}
			if (c) {
				let r = 0 | e[C];
				if (2 & r && 2048 & r && !n?.Ka) throw Error();
				let i = zt(r), a = (t, a) => {
					if (br(e, t, i) != null) {
						if (n?.Qa === 1) return;
						throw Error();
					}
					a != null && (r = k(e, r, t, a, i)), delete s[t];
				};
				t == null ? Lt(o, 0 | o[C], ((e, t) => {
					a(e, t);
				})) : a(t, br(o, t, i));
			}
		}
	}
}
function la(e) {
	let t = (e = ra(e))[0].g;
	if (e = e[1]) {
		let n = sa(e), r = na(Xi, aa, oa, e).T;
		return (e, i, a) => t(e, i, a, r, n);
	}
	return t;
}
function ua(e, t, n) {
	e[t] = n.h;
}
function da(e, t, n, r) {
	let i, a, o = n.h;
	e[t] = (e, t, n) => o(e, t, n, a ||= na(Yi, ua, da, r).T, i ||= fa(r));
}
function fa(e) {
	let t = e[Qi];
	if (!t) {
		let n = na(Yi, ua, da, e);
		t = (e, t) => pa(e, t, n), e[Qi] = t;
	}
	return t;
}
function pa(e, t, n) {
	Lt(e, 0 | e[C], ((e, r) => {
		if (r != null) {
			var i = function(e, t) {
				var n = e[t];
				if (n) return n;
				if ((n = e.ba) && (n = n[t])) {
					var r = (n = ra(n))[0].h;
					if (n = n[1]) {
						let t = fa(n), i = na(Yi, ua, da, n).T;
						n = e.ma ? ta(i, t) : (e, n, a) => r(e, n, a, i, t);
					} else n = r;
					return e[t] = n;
				}
			}(n, e);
			i ? i(t, r, e) : e < 500 || ut(bt, 3);
		}
	})), (e = Yn(e)) && Xn(e, ((e, n, r) => {
		for (Ei(t, t.g.end()), e = 0; e < r.length; e++) Ei(t, rt(r[e]) || /* @__PURE__ */ new Uint8Array());
	}));
}
var ma = Gt(0);
function ha(e, t) {
	if (Array.isArray(t)) {
		var n = 0 | t[C];
		if (4 & n) return t;
		for (var r = 0, i = 0; r < t.length; r++) {
			let n = e(t[r]);
			n != null && (t[i++] = n);
		}
		return i < r && (t.length = i), (e = -1537 & (5 | n)) !== n && w(t, e), 2 & e && Object.freeze(t), t;
	}
}
function ga(e, t, n) {
	return new Wi(e, t, n);
}
function _a(e, t, n) {
	return new Wi(e, t, n);
}
function va(e, t, n) {
	k(e, 0 | e[C], t, n, zt(0 | e[C]));
}
var ya = Gi((function(e, t, n, r, i) {
	if (e.h !== 2) return !1;
	if (e = fn(e = ui(e, or([void 0, void 0], r), i)), i = zt(r = 0 | t[C]), 2 & r) throw Error();
	let a = br(t, n, i);
	if (a instanceof Wn) 2 & a.J ? (a = a.V(), a.push(e), k(t, r, n, a, i)) : a.Ma(e);
	else if (Array.isArray(a)) {
		var o = 0 | a[C];
		8192 & o || w(a, o |= 8192), 2 & o && (a = Or(a), k(t, r, n, a, i)), a.push(e);
	} else k(t, r, n, At([e]), i);
	return !0;
}), (function(e, t, n, r, i) {
	if (t instanceof Wn) t.forEach(((t, a) => {
		ji(e, n, or([a, t], r), i);
	}));
	else if (Array.isArray(t)) {
		for (let a = 0; a < t.length; a++) {
			let o = t[a];
			Array.isArray(o) && ji(e, n, or(o, r), i);
		}
		At(t);
	}
}));
function ba(e, t, n) {
	(t = bn(t)) != null && (Di(e, n, 5), e = e.g, nn(t), Ti(e));
}
function xa(e, t, n) {
	if (t = function(e) {
		if (e == null) return e;
		let t = typeof e;
		if (t === "bigint") return String(pn(64, e));
		if (wn(e)) {
			if (t === "string") return kn(e);
			if (t === "number") return On(e);
		}
	}(t), t != null && (typeof t == "string" && yi(t), t != null)) switch (Di(e, n, 0), typeof t) {
		case "number":
			e = e.g, tn(t), Si(e, T, E);
			break;
		case "bigint":
			n = BigInt.asUintN(64, t), n = new bi(Number(n & BigInt(4294967295)), Number(n >> BigInt(32))), Si(e.g, n.h, n.g);
			break;
		default: n = yi(t), Si(e.g, n.h, n.g);
	}
}
function Sa(e, t, n) {
	(t = Tn(t)) != null && t != null && (Di(e, n, 0), wi(e.g, t));
}
function Ca(e, t, n) {
	(t = Sn(t)) != null && (Di(e, n, 0), e.g.g.push(+!!t));
}
function wa(e, t, n) {
	(t = Fn(t)) != null && Ai(e, n, Ie(t));
}
function Ta(e, t, n, r, i) {
	ji(e, n, ia(t, r), i);
}
function Ea(e, t, n) {
	(t = t == null || typeof t == "string" || t instanceof it ? t : void 0) != null && Ai(e, n, Yr(t, !0).buffer);
}
function Da(e, t, n) {
	(t = En(t)) != null && t != null && (Di(e, n, 0), Ci(e.g, t));
}
function Oa(e, t, n) {
	return (e.h === 5 || e.h === 2) && (t = Ar(t, 0 | t[C], n), e.h == 2 ? pi(e, ei, t) : t.push(ei(e.g)), !0);
}
var F = ga((function(e, t, n) {
	return e.h === 5 && (va(t, n, ei(e.g)), !0);
}), ba, Bi), ka = _a(Oa, (function(e, t, n) {
	if ((t = ha(bn, t)) != null) for (let o = 0; o < t.length; o++) {
		var r = e, i = n, a = t[o];
		a != null && (Di(r, i, 5), r = r.g, nn(a), Ti(r));
	}
}), Bi), Aa = _a(Oa, (function(e, t, n) {
	if ((t = ha(bn, t)) != null && t.length) {
		Di(e, n, 2), Ci(e.g, 4 * t.length);
		for (let r = 0; r < t.length; r++) n = e.g, nn(t[r]), Ti(n);
	}
}), Bi), ja = ga((function(e, t, n) {
	return e.h === 5 && (va(t, n, (e = ei(e.g)) === 0 ? void 0 : e), !0);
}), ba, Bi), Ma = ga((function(e, t, n) {
	return e.h === 0 ? (va(t, n, Xr(e.g, on)), e = !0) : e = !1, e;
}), xa, Ri), Na = ga((function(e, t, n) {
	return e.h === 0 ? (va(t, n, (e = Xr(e.g, on)) === ma ? void 0 : e), t = !0) : t = !1, t;
}), xa, Ri), Pa = ga((function(e, t, n) {
	return e.h === 0 ? (va(t, n, Xr(e.g, an)), e = !0) : e = !1, e;
}), (function(e, t, n) {
	if (t = function(e) {
		if (e == null) return e;
		var t = typeof e;
		if (t === "bigint") return String(mn(64, e));
		if (wn(e)) {
			if (t === "string") return t = _n(Number(e)), hn(t) && t >= 0 ? e = String(t) : ((t = e.indexOf(".")) !== -1 && (e = e.substring(0, t)), (t = e[0] !== "-" && ((t = e.length) < 20 || t === 20 && e <= "18446744073709551615")) || (un(e), e = sn(T, E))), e;
			if (t === "number") return (e = _n(e)) >= 0 && hn(e) || (tn(e), e = rn(T, E)), e;
		}
	}(t), t != null && (typeof t == "string" && gi(t), t != null)) switch (Di(e, n, 0), typeof t) {
		case "number":
			e = e.g, tn(t), Si(e, T, E);
			break;
		case "bigint":
			n = BigInt.asUintN(64, t), n = new _i(Number(n & BigInt(4294967295)), Number(n >> BigInt(32))), Si(e.g, n.h, n.g);
			break;
		default: n = gi(t), Si(e.g, n.h, n.g);
	}
}), zi), I = ga((function(e, t, n) {
	return e.h === 0 && (va(t, n, Qr(e.g)), !0);
}), Sa, Ii), Fa = _a((function(e, t, n) {
	return (e.h === 0 || e.h === 2) && (t = Ar(t, 0 | t[C], n), e.h == 2 ? pi(e, Qr, t) : t.push(Qr(e.g)), !0);
}), (function(e, t, n) {
	if ((t = ha(Tn, t)) != null && t.length) {
		n = Oi(e, n);
		for (let n = 0; n < t.length; n++) wi(e.g, t[n]);
		ki(e, n);
	}
}), Ii), Ia = ga((function(e, t, n) {
	return e.h === 0 && (va(t, n, (e = Qr(e.g)) === 0 ? void 0 : e), !0);
}), Sa, Ii), L = ga((function(e, t, n) {
	return e.h === 0 && (va(t, n, Zr(e.g)), !0);
}), Ca, Pi), La = ga((function(e, t, n) {
	return e.h === 0 && (va(t, n, !1 === (e = Zr(e.g)) ? void 0 : e), !0);
}), Ca, Pi), Ra = _a((function(e, t, n) {
	return e.h === 2 && (e = di(e), Ar(t, 0 | t[C], n).push(e), !0);
}), (function(e, t, n) {
	if ((t = ha(Fn, t)) != null) for (let o = 0; o < t.length; o++) {
		var r = e, i = n, a = t[o];
		a != null && Ai(r, i, Ie(a));
	}
}), Fi), za = ga((function(e, t, n) {
	return e.h === 2 && (va(t, n, (e = di(e)) === "" ? void 0 : e), !0);
}), wa, Fi), R = ga((function(e, t, n) {
	return e.h === 2 && (va(t, n, di(e)), !0);
}), wa, Fi), Ba = function(e, t, n = Ni) {
	return new Wi(e, t, n);
}((function(e, t, n, r, i) {
	return e.h === 2 && (r = or(void 0, r), Ar(t, 0 | t[C], n).push(r), ui(e, r, i), !0);
}), (function(e, t, n, r, i) {
	if (Array.isArray(t)) {
		for (let a = 0; a < t.length; a++) Ta(e, t[a], n, r, i);
		1 & (e = 0 | t[C]) || w(t, 1 | e);
	}
})), z = Gi((function(e, t, n, r, i, a) {
	if (e.h !== 2) return !1;
	let o = 0 | t[C];
	return Nr(t, o, a, n, zt(o)), ui(e, t = Fr(t, r, n), i), !0;
}), Ta), Va = ga((function(e, t, n) {
	return e.h === 2 && (va(t, n, fi(e)), !0);
}), Ea, Vi), Ha = _a((function(e, t, n) {
	return (e.h === 0 || e.h === 2) && (t = Ar(t, 0 | t[C], n), e.h == 2 ? pi(e, $r, t) : t.push($r(e.g)), !0);
}), (function(e, t, n) {
	if ((t = ha(En, t)) != null) for (let o = 0; o < t.length; o++) {
		var r = e, i = n, a = t[o];
		a != null && (Di(r, i, 0), Ci(r.g, a));
	}
}), Li), Ua = ga((function(e, t, n) {
	return e.h === 0 && (va(t, n, (e = $r(e.g)) === 0 ? void 0 : e), !0);
}), Da, Li), Wa = ga((function(e, t, n) {
	return e.h === 0 && (va(t, n, Qr(e.g)), !0);
}), (function(e, t, n) {
	(t = Tn(t)) != null && (t = parseInt(t, 10), Di(e, n, 0), wi(e.g, t));
}), Hi), Ga = class {
	constructor(e, t) {
		var n = lo;
		this.g = e, this.h = t, this.m = A, this.j = j, this.defaultValue = void 0, this.l = n.Oa == null ? void 0 : Rt;
	}
	register() {
		Ue(this);
	}
};
function Ka(e, t) {
	return new Ga(e, t);
}
function qa(e, t) {
	return (n, r) => {
		{
			let a = { ea: !0 };
			r && Object.assign(a, r), n = oi(n, void 0, void 0, a);
			try {
				let r = new e(), a = r.v;
				sa(t)(a, n);
				var i = r;
			} finally {
				si(n);
			}
		}
		return i;
	};
}
function Ja(e) {
	return function() {
		let t = new class {
			constructor() {
				this.l = [], this.h = 0, this.g = new class {
					constructor() {
						this.g = [];
					}
					length() {
						return this.g.length;
					}
					end() {
						let e = this.g;
						return this.g = [], e;
					}
				}();
			}
		}();
		pa(this.v, t, na(Yi, ua, da, e)), Ei(t, t.g.end());
		let n = new Uint8Array(t.h), r = t.l, i = r.length, a = 0;
		for (let e = 0; e < i; e++) {
			let t = r[e];
			n.set(t, a), a += t.length;
		}
		return t.l = [n], n;
	};
}
var Ya = class extends P {
	constructor(e) {
		super(e);
	}
}, Xa = [
	0,
	za,
	ga((function(e, t, n) {
		return e.h === 2 && (va(t, n, (e = fi(e)) === nt() ? void 0 : e), !0);
	}), (function(e, t, n) {
		if (t != null) {
			if (t instanceof P) {
				let r = t.Ra;
				r ? (t = r(t), t != null && Ai(e, n, Yr(t, !0).buffer)) : ut(bt, 3);
				return;
			}
			if (Array.isArray(t)) return void ut(bt, 3);
		}
		Ea(e, t, n);
	}), Vi)
], Za, Qa = globalThis.trustedTypes;
function $a(e) {
	var t;
	return Za === void 0 && (Za = function() {
		let e = null;
		if (!Qa) return e;
		try {
			let t = (e) => e;
			e = Qa.createPolicy("goog#html", {
				createHTML: t,
				createScript: t,
				createScriptURL: t
			});
		} catch {}
		return e;
	}()), e = (t = Za) ? t.createScriptURL(e) : e, new class {
		constructor(e) {
			this.g = e;
		}
		toString() {
			return this.g + "";
		}
	}(e);
}
function eo(e, ...t) {
	if (t.length === 0) return $a(e[0]);
	let n = e[0];
	for (let r = 0; r < t.length; r++) n += encodeURIComponent(t[r]) + e[r + 1];
	return $a(n);
}
var to = [
	0,
	I,
	Wa,
	L,
	-1,
	Fa,
	Wa,
	-1,
	L
], no = class extends P {
	constructor(e) {
		super(e);
	}
}, ro = [
	0,
	L,
	R,
	L,
	Wa,
	-1,
	_a((function(e, t, n) {
		return (e.h === 0 || e.h === 2) && (t = Ar(t, 0 | t[C], n), e.h == 2 ? pi(e, ti, t) : t.push(Qr(e.g)), !0);
	}), (function(e, t, n) {
		if ((t = ha(Tn, t)) != null && t.length) {
			n = Oi(e, n);
			for (let n = 0; n < t.length; n++) wi(e.g, t[n]);
			ki(e, n);
		}
	}), Hi),
	R,
	-1,
	[
		0,
		L,
		-1
	],
	Wa,
	L,
	-1
], io = [
	0,
	3,
	L,
	-1,
	2,
	[
		0,
		[2],
		I,
		z,
		[0, ga((function(e, t, n) {
			return e.h === 0 && (va(t, n, $r(e.g)), !0);
		}), Da, Li)]
	],
	[
		0,
		Wa,
		L,
		Wa,
		L,
		Wa,
		L,
		R,
		-1
	],
	[
		0,
		[3, 4],
		R,
		-1,
		z,
		[0, I],
		z,
		[0, Wa]
	],
	[0]
], ao = [
	0,
	R,
	-2
], oo = class extends P {
	constructor(e) {
		super(e);
	}
}, so = [0], co = [
	0,
	I,
	L,
	1,
	L,
	-4
], lo = class extends P {
	constructor(e) {
		super(e, 2);
	}
}, B = {};
B[336783863] = [
	0,
	R,
	L,
	-1,
	I,
	[
		0,
		[
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			8,
			9
		],
		z,
		so,
		z,
		ro,
		z,
		ao,
		z,
		co,
		z,
		to,
		z,
		[
			0,
			R,
			-2
		],
		z,
		[
			0,
			R,
			Wa
		],
		z,
		io,
		z,
		[
			0,
			Wa,
			-1,
			L
		]
	],
	[0, R],
	L,
	[
		0,
		[1, 3],
		[2, 4],
		z,
		[0, Fa],
		-1,
		z,
		[0, Ra],
		-1,
		Ba,
		[
			0,
			R,
			-1
		]
	],
	R
];
var uo = [
	0,
	Na,
	-1,
	La,
	-3,
	Na,
	Fa,
	za,
	Ia,
	Na,
	-1,
	La,
	Ia,
	La,
	-2,
	za
];
function V(e, t) {
	qr(e, 3, t);
}
function H(e, t) {
	qr(e, 4, t);
}
var fo = class extends P {
	constructor(e) {
		super(e, 500);
	}
	o(e) {
		return j(this, 0, 7, e);
	}
}, po = [-1, {}], mo = [
	0,
	R,
	1,
	po
], ho = [
	0,
	R,
	Ra,
	po
];
function go(e, t) {
	Hr(e, 1, fo, t);
}
function U(e, t) {
	qr(e, 10, t);
}
function W(e, t) {
	qr(e, 15, t);
}
var _o = class extends P {
	constructor(e) {
		super(e, 500);
	}
	o(e) {
		return j(this, 0, 1001, e);
	}
}, vo = [
	-500,
	Ba,
	[
		-500,
		za,
		-1,
		Ra,
		-3,
		[
			-2,
			B,
			L
		],
		Ba,
		Xa,
		Ia,
		-1,
		mo,
		ho,
		Ba,
		[
			0,
			za,
			La
		],
		za,
		uo,
		Ia,
		Ra,
		987,
		Ra
	],
	4,
	Ba,
	[
		-500,
		R,
		-1,
		[-1, {}],
		998,
		R
	],
	Ba,
	[
		-500,
		R,
		Ra,
		-1,
		[
			-2,
			{},
			L
		],
		997,
		Ra,
		-1
	],
	Ia,
	Ba,
	[
		-500,
		R,
		Ra,
		po,
		998,
		Ra
	],
	Ra,
	Ia,
	mo,
	ho,
	Ba,
	[
		0,
		za,
		-1,
		po
	],
	Ra,
	-2,
	uo,
	za,
	-1,
	La,
	[
		0,
		La,
		Ua
	],
	978,
	po,
	Ba,
	Xa
];
_o.prototype.g = Ja(vo);
var yo = qa(_o, vo), bo = class extends P {
	constructor(e) {
		super(e);
	}
}, xo = class extends P {
	constructor(e) {
		super(e);
	}
	g() {
		return Rr(this, bo, 1);
	}
}, So = [
	0,
	Ba,
	[
		0,
		I,
		F,
		R,
		-1
	]
], Co = qa(xo, So), wo = class extends P {
	constructor(e) {
		super(e);
	}
}, To = class extends P {
	constructor(e) {
		super(e);
	}
}, Eo = class extends P {
	constructor(e) {
		super(e);
	}
	l() {
		return A(this, wo, 2);
	}
	g() {
		return Rr(this, To, 5);
	}
}, Do = qa(class extends P {
	constructor(e) {
		super(e);
	}
}, [
	0,
	Ra,
	Fa,
	Aa,
	[
		0,
		Wa,
		[
			0,
			I,
			-3
		],
		[
			0,
			F,
			-3
		],
		[
			0,
			I,
			-1,
			[
				0,
				Ba,
				[
					0,
					I,
					-2
				]
			]
		],
		Ba,
		[
			0,
			F,
			-1,
			R,
			F
		]
	],
	R,
	-1,
	Ma,
	Ba,
	[
		0,
		I,
		F
	],
	Ra,
	Ma
]), Oo = class extends P {
	constructor(e) {
		super(e);
	}
}, ko = qa(class extends P {
	constructor(e) {
		super(e);
	}
}, [
	0,
	Ba,
	[
		0,
		F,
		-4
	]
]), Ao = class extends P {
	constructor(e) {
		super(e);
	}
}, jo = qa(class extends P {
	constructor(e) {
		super(e);
	}
}, [
	0,
	Ba,
	[
		0,
		F,
		-4
	]
]), Mo = class extends P {
	constructor(e) {
		super(e);
	}
}, No = [
	0,
	I,
	-1,
	Aa,
	Wa
], Po = class extends P {
	constructor(e) {
		super(e);
	}
};
Po.prototype.g = Ja([
	0,
	F,
	-4,
	Ma
]);
var Fo = class extends P {
	constructor(e) {
		super(e);
	}
}, Io = qa(class extends P {
	constructor(e) {
		super(e);
	}
}, [
	0,
	Ba,
	[
		0,
		1,
		I,
		R,
		So
	],
	Ma
]), Lo = class extends P {
	constructor(e) {
		super(e);
	}
}, Ro = class extends P {
	constructor(e) {
		super(e);
	}
	na() {
		return D(this, 1, void 0, void 0, Dr) ?? nt();
	}
}, zo = class extends P {
	constructor(e) {
		super(e);
	}
}, Bo = [1, 2], Vo = qa(class extends P {
	constructor(e) {
		super(e);
	}
}, [
	0,
	Ba,
	[
		0,
		Bo,
		z,
		[0, Aa],
		z,
		[0, Va],
		I,
		R
	],
	Ma
]), Ho = class extends P {
	constructor(e) {
		super(e);
	}
}, Uo = [
	0,
	R,
	I,
	F,
	Ra,
	-1
], Wo = class extends P {
	constructor(e) {
		super(e);
	}
}, Go = [
	0,
	L,
	-1
], Ko = class extends P {
	constructor(e) {
		super(e);
	}
}, qo = [
	1,
	2,
	3,
	4,
	5,
	6
], Jo = class extends P {
	constructor(e) {
		super(e);
	}
	g() {
		return D(this, 1, void 0, void 0, Dr) != null;
	}
	l() {
		return Fn(D(this, 2)) != null;
	}
}, G = class extends P {
	constructor(e) {
		super(e);
	}
	g() {
		return Sn(D(this, 2)) ?? !1;
	}
}, Yo = [
	0,
	Va,
	R,
	[
		0,
		I,
		Ma,
		-1
	],
	[
		0,
		Pa,
		Ma
	]
], K = [
	0,
	Yo,
	L,
	[
		0,
		qo,
		z,
		co,
		z,
		ro,
		z,
		to,
		z,
		so,
		z,
		ao,
		z,
		io
	],
	Wa
], Xo = class extends P {
	constructor(e) {
		super(e);
	}
}, Zo = [
	0,
	K,
	F,
	-1,
	I
], Qo = Ka(502141897, Xo);
B[502141897] = Zo;
var $o = qa(class extends P {
	constructor(e) {
		super(e);
	}
}, [
	0,
	[
		0,
		Wa,
		-1,
		ka,
		Ha
	],
	No
]), es = class extends P {
	constructor(e) {
		super(e);
	}
}, ts = class extends P {
	constructor(e) {
		super(e);
	}
}, ns = [
	0,
	K,
	F,
	[0, K],
	L
], rs = Ka(508968150, ts);
B[508968150] = [
	0,
	K,
	Zo,
	ns,
	F,
	[0, [0, Yo]]
], B[508968149] = ns;
var is = class extends P {
	constructor(e) {
		super(e);
	}
	l() {
		return A(this, Ho, 2);
	}
	g() {
		O(this, 2);
	}
}, as = [
	0,
	K,
	Uo
];
B[478825465] = as;
var os = class extends P {
	constructor(e) {
		super(e);
	}
}, ss = class extends P {
	constructor(e) {
		super(e);
	}
}, cs = class extends P {
	constructor(e) {
		super(e);
	}
}, ls = class extends P {
	constructor(e) {
		super(e);
	}
}, us = class extends P {
	constructor(e) {
		super(e);
	}
}, ds = [
	0,
	K,
	[0, K],
	as,
	-1
], fs = [
	0,
	K,
	F,
	I
], ps = [
	0,
	K,
	F
], ms = [
	0,
	K,
	fs,
	ps,
	F
], hs = Ka(479097054, us);
B[479097054] = [
	0,
	K,
	ms,
	ds
], B[463370452] = ds, B[464864288] = fs;
var gs = Ka(462713202, ls);
B[462713202] = ms, B[474472470] = ps;
var _s = class extends P {
	constructor(e) {
		super(e);
	}
}, vs = class extends P {
	constructor(e) {
		super(e);
	}
}, ys = class extends P {
	constructor(e) {
		super(e);
	}
}, bs = class extends P {
	constructor(e) {
		super(e);
	}
}, xs = [
	0,
	K,
	F,
	-1,
	I
], Ss = [
	0,
	K,
	F,
	L
];
bs.prototype.g = Ja([
	0,
	K,
	ps,
	[0, K],
	Zo,
	ns,
	xs,
	Ss
]);
var Cs = class extends P {
	constructor(e) {
		super(e);
	}
}, ws = Ka(456383383, Cs);
B[456383383] = [
	0,
	K,
	Uo
];
var Ts = class extends P {
	constructor(e) {
		super(e);
	}
}, Es = Ka(476348187, Ts);
B[476348187] = [
	0,
	K,
	Go
];
var Ds = class extends P {
	constructor(e) {
		super(e);
	}
}, Os = class extends P {
	constructor(e) {
		super(e);
	}
}, ks = [
	0,
	Wa,
	-1
], As = Ka(458105876, class extends P {
	constructor(e) {
		super(e);
	}
	g() {
		let e;
		var t = this.v;
		let n = 0 | t[C];
		return e = Mt(this, n), t = function(e, t, n, r) {
			var i = Os;
			!r && mr(e) && (n = 0 | (t = e.v)[C]);
			var a = br(t, 2);
			if (e = !1, a == null) {
				if (r) return Jn();
				a = [];
			} else if (a.constructor === Wn) {
				if (!(2 & a.J) || r) return a;
				a = a.V();
			} else Array.isArray(a) ? e = !!(2 & (0 | a[C])) : a = [];
			if (r) {
				if (!a.length) return Jn();
				e || (e = !0, kt(a));
			} else e && (e = !1, At(a), a = Or(a));
			return !e && 32 & n && Ot(a, 32), n = k(t, n, 2, r = new Wn(a, i, Ln, void 0)), e || gr(t, n), r;
		}(this, t, n, e), !e && Os && (t.ra = !0), t;
	}
});
B[458105876] = [
	0,
	ks,
	ya,
	[
		!0,
		Ma,
		[
			0,
			R,
			-1,
			Ra
		]
	],
	[
		0,
		Fa,
		L,
		Wa
	]
];
var js = class extends P {
	constructor(e) {
		super(e);
	}
}, Ms = Ka(458105758, js);
B[458105758] = [
	0,
	K,
	R,
	ks
];
var Ns = class extends P {
	constructor(e) {
		super(e);
	}
}, Ps = [
	0,
	ja,
	-1,
	La
], Fs = class extends P {
	constructor(e) {
		super(e);
	}
}, Is = class extends P {
	constructor(e) {
		super(e);
	}
}, Ls = [1, 2];
Is.prototype.g = Ja([
	0,
	Ls,
	z,
	Ps,
	z,
	[
		0,
		Ba,
		Ps
	]
]);
var Rs = class extends P {
	constructor(e) {
		super(e);
	}
}, zs = Ka(443442058, Rs);
B[443442058] = [
	0,
	K,
	R,
	I,
	F,
	Ra,
	-1,
	L,
	F
], B[514774813] = xs;
var Bs = class extends P {
	constructor(e) {
		super(e);
	}
}, Vs = Ka(516587230, Bs);
function Hs(e, t) {
	return t = t ? t.clone() : new Ho(), e.displayNamesLocale === void 0 ? e.displayNamesLocale === void 0 && O(t, 1) : O(t, 1, Pn(e.displayNamesLocale)), e.maxResults === void 0 ? "maxResults" in e && O(t, 2) : Wr(t, 2, e.maxResults), e.scoreThreshold === void 0 ? "scoreThreshold" in e && O(t, 3) : N(t, 3, e.scoreThreshold), e.categoryAllowlist === void 0 ? "categoryAllowlist" in e && O(t, 4) : Kr(t, 4, e.categoryAllowlist), e.categoryDenylist === void 0 ? "categoryDenylist" in e && O(t, 5) : Kr(t, 5, e.categoryDenylist), t;
}
function Us(e) {
	let t = Number(e);
	return Number.isSafeInteger(t) ? t : String(e);
}
function Ws(e, t = -1, n = "") {
	return {
		categories: e.map(((e) => ({
			index: Ur(e, 1) ?? 0 ?? -1,
			score: M(e, 2) ?? 0,
			categoryName: Fn(D(e, 3)) ?? "" ?? "",
			displayName: Fn(D(e, 4)) ?? "" ?? ""
		}))),
		headIndex: t,
		headName: n
	};
}
function Gs(e) {
	let t = { classifications: Rr(e, Fo, 1).map(((e) => Ws(A(e, xo, 4)?.g() ?? [], Ur(e, 2) ?? 0, Fn(D(e, 3)) ?? ""))) };
	return function(e) {
		return e == null ? e : typeof e == "bigint" ? (Kt(e) ? e = Number(e) : (e = pn(64, e), e = Kt(e) ? Number(e) : String(e)), e) : wn(e) ? typeof e == "number" ? On(e) : kn(e) : void 0;
	}(D(e, 2, void 0, void 0, Mn)) != null && (t.timestampMs = Us(D(e, 2, void 0, void 0, Mn) ?? vr)), t;
}
function Ks(e) {
	var t = Sr(e, 3, bn, xr()), n = Sr(e, 2, Tn, xr()), r = Sr(e, 1, Fn, xr()), i = Sr(e, 9, Fn, xr());
	let a = {
		categories: [],
		keypoints: []
	};
	for (let e = 0; e < t.length; e++) a.categories.push({
		score: t[e],
		index: n[e] ?? -1,
		categoryName: r[e] ?? "",
		displayName: i[e] ?? ""
	});
	if ((t = A(e, Eo, 4)?.l()) && (a.boundingBox = {
		originX: Ur(t, 1, yr) ?? 0,
		originY: Ur(t, 2, yr) ?? 0,
		width: Ur(t, 3, yr) ?? 0,
		height: Ur(t, 4, yr) ?? 0,
		angle: 0
	}), A(e, Eo, 4)?.g().length) for (let t of A(e, Eo, 4).g()) a.keypoints.push({
		x: D(t, 1, void 0, yr, bn) ?? 0,
		y: D(t, 2, void 0, yr, bn) ?? 0,
		score: D(t, 4, void 0, yr, bn) ?? 0,
		label: Fn(D(t, 3, void 0, yr)) ?? ""
	});
	return a;
}
function qs(e) {
	let t = [];
	for (let n of Rr(e, Ao, 1)) t.push({
		x: M(n, 1) ?? 0,
		y: M(n, 2) ?? 0,
		z: M(n, 3) ?? 0,
		visibility: M(n, 4) ?? 0
	});
	return t;
}
function Js(e) {
	let t = [];
	for (let n of Rr(e, Oo, 1)) t.push({
		x: M(n, 1) ?? 0,
		y: M(n, 2) ?? 0,
		z: M(n, 3) ?? 0,
		visibility: M(n, 4) ?? 0
	});
	return t;
}
function Ys(e) {
	return Array.from(e, ((e) => e > 127 ? e - 256 : e));
}
function Xs(e, t) {
	if (e.length !== t.length) throw Error(`Cannot compute cosine similarity between embeddings of different sizes (${e.length} vs. ${t.length}).`);
	let n = 0, r = 0, i = 0;
	for (let a = 0; a < e.length; a++) n += e[a] * t[a], r += e[a] * e[a], i += t[a] * t[a];
	if (r <= 0 || i <= 0) throw Error("Cannot compute cosine similarity on embedding with 0 norm.");
	return n / Math.sqrt(r * i);
}
var Zs;
B[516587230] = [
	0,
	K,
	xs,
	Ss,
	F
], B[518928384] = Ss;
var Qs = new Uint8Array([
	0,
	97,
	115,
	109,
	1,
	0,
	0,
	0,
	1,
	5,
	1,
	96,
	0,
	1,
	123,
	3,
	2,
	1,
	0,
	10,
	10,
	1,
	8,
	0,
	65,
	0,
	253,
	15,
	253,
	98,
	11
]);
async function $s(e) {
	if (e) return !0;
	if (Zs === void 0) try {
		await WebAssembly.instantiate(Qs), Zs = !0;
	} catch {
		Zs = !1;
	}
	return Zs;
}
async function ec(e, t, n) {
	return {
		wasmLoaderPath: `${t}/${e}_${n = `wasm${n ? "_module" : ""}${await $s(n) ? "" : "_nosimd"}_internal`}.js`,
		wasmBinaryPath: `${t}/${e}_${n}.wasm`
	};
}
var tc = class {};
function nc() {
	var e = navigator;
	return typeof OffscreenCanvas < "u" && (!function(e = navigator) {
		return (e = e.userAgent).includes("Safari") && !e.includes("Chrome");
	}(e) || !!((e = e.userAgent.match(/Version\/([\d]+).*Safari/)) && e.length >= 1 && Number(e[1]) >= 17));
}
async function rc(e) {
	if (typeof importScripts != "function") {
		let t = document.createElement("script");
		return t.src = e.toString(), t.crossOrigin = "anonymous", new Promise(((e, n) => {
			t.addEventListener("load", (() => {
				e();
			}), !1), t.addEventListener("error", ((e) => {
				n(e);
			}), !1), document.body.appendChild(t);
		}));
	}
	try {
		importScripts(e.toString());
	} catch (t) {
		if (!(t instanceof TypeError)) throw t;
		{
			let t = self.import;
			t ? await t(e.toString()) : await import(e.toString());
		}
	}
}
function ic(e) {
	return e.videoWidth === void 0 ? e.naturalWidth === void 0 ? e.displayWidth === void 0 ? [e.width, e.height] : [e.displayWidth, e.displayHeight] : [e.naturalWidth, e.naturalHeight] : [e.videoWidth, e.videoHeight];
}
function q(e, t, n) {
	e.m || console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target"), n(t = e.i.stringToNewUTF8(t)), e.i._free(t);
}
function ac(e, t, n) {
	if (!e.i.canvas) throw Error("No OpenGL canvas configured.");
	if (n ? e.i._bindTextureToStream(n) : e.i._bindTextureToCanvas(), !(n = e.i.canvas.getContext("webgl2") || e.i.canvas.getContext("webgl"))) throw Error("Failed to obtain WebGL context from the provided canvas. `getContext()` should only be invoked with `webgl` or `webgl2`.");
	e.i.gpuOriginForWebTexturesIsBottomLeft && n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, !0), n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, t), e.i.gpuOriginForWebTexturesIsBottomLeft && n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, !1);
	let [r, i] = ic(t);
	return !e.l || r === e.i.canvas.width && i === e.i.canvas.height || (e.i.canvas.width = r, e.i.canvas.height = i), [r, i];
}
function oc(e, t, n) {
	e.m || console.error("No wasm multistream support detected: ensure dependency inclusion of :gl_graph_runner_internal_multi_input target");
	let r = new Uint32Array(t.length);
	for (let n = 0; n < t.length; n++) r[n] = e.i.stringToNewUTF8(t[n]);
	t = e.i._malloc(4 * r.length), e.i.HEAPU32.set(r, t >> 2), n(t);
	for (let t of r) e.i._free(t);
	e.i._free(t);
}
function sc(e, t, n) {
	e.i.simpleListeners = e.i.simpleListeners || {}, e.i.simpleListeners[t] = n;
}
function cc(e, t, n) {
	let r = [];
	e.i.simpleListeners = e.i.simpleListeners || {}, e.i.simpleListeners[t] = (e, t, i) => {
		t ? (n(r, i), r = []) : r.push(e);
	};
}
tc.forVisionTasks = function(e, t = !1) {
	return ec("vision", e ?? eo``, t);
}, tc.forTextTasks = function(e, t = !1) {
	return ec("text", e ?? eo``, t);
}, tc.forGenAiTasks = function(e, t = !1) {
	return ec("genai", e ?? eo``, t);
}, tc.forAudioTasks = function(e, t = !1) {
	return ec("audio", e ?? eo``, t);
}, tc.isSimdSupported = function(e = !1) {
	return $s(e);
};
async function lc(e, t, n, r) {
	return e = await (async (e, t, n, r, i) => {
		if (t && await rc(t), !self.ModuleFactory || n && (await rc(n), !self.ModuleFactory)) throw Error("ModuleFactory not set.");
		return self.Module && i && ((t = self.Module).locateFile = i.locateFile, i.mainScriptUrlOrBlob && (t.mainScriptUrlOrBlob = i.mainScriptUrlOrBlob)), i = await self.ModuleFactory(self.Module || i), self.ModuleFactory = self.Module = void 0, new e(i, r);
	})(e, n.wasmLoaderPath, n.assetLoaderPath, t, { locateFile: (e) => e.endsWith(".wasm") ? n.wasmBinaryPath.toString() : n.assetBinaryPath && e.endsWith(".data") ? n.assetBinaryPath.toString() : e }), await e.o(r), e;
}
function uc(e, t) {
	let n = A(e.baseOptions, Jo, 1) || new Jo();
	typeof t == "string" ? (O(n, 2, Pn(t)), O(n, 1)) : t instanceof Uint8Array && (O(n, 1, Pt(t, !1)), O(n, 2)), j(e.baseOptions, 0, 1, n);
}
function dc(e) {
	try {
		let t = e.H.length;
		if (t === 1) throw Error(e.H[0].message);
		if (t > 1) throw Error("Encountered multiple errors: " + e.H.map(((e) => e.message)).join(", "));
	} finally {
		e.H = [];
	}
}
function J(e, t) {
	e.C = Math.max(e.C, t);
}
function fc(e, t) {
	e.B = new fo(), Gr(e.B, 2, "PassThroughCalculator"), V(e.B, "free_memory"), H(e.B, "free_memory_unused_out"), U(t, "free_memory"), go(t, e.B);
}
function pc(e, t) {
	V(e.B, t), H(e.B, t + "_unused_out");
}
function mc(e) {
	e.g.addBoolToStream(!0, "free_memory", e.C);
}
var hc = class {
	constructor(e) {
		this.g = e, this.H = [], this.C = 0, this.g.setAutoRenderToScreen(!1);
	}
	l(e, t = !0) {
		if (t) {
			let t = e.baseOptions || {};
			if (e.baseOptions?.modelAssetBuffer && e.baseOptions?.modelAssetPath) throw Error("Cannot set both baseOptions.modelAssetPath and baseOptions.modelAssetBuffer");
			if (!(A(this.baseOptions, Jo, 1)?.g() || A(this.baseOptions, Jo, 1)?.l() || e.baseOptions?.modelAssetBuffer || e.baseOptions?.modelAssetPath)) throw Error("Either baseOptions.modelAssetPath or baseOptions.modelAssetBuffer must be set");
			if (function(e, t) {
				let n = A(e.baseOptions, Ko, 3);
				if (!n) {
					var r = n = new Ko(), i = new oo();
					Br(r, 4, qo, i);
				}
				"delegate" in t && (t.delegate === "GPU" ? (t = n, r = new no(), Br(t, 2, qo, r)) : (t = n, r = new oo(), Br(t, 4, qo, r))), j(e.baseOptions, 0, 3, n);
			}(this, t), t.modelAssetPath) return fetch(t.modelAssetPath.toString()).then(((e) => {
				if (e.ok) return e.arrayBuffer();
				throw Error(`Failed to fetch model: ${t.modelAssetPath} (${e.status})`);
			})).then(((e) => {
				try {
					this.g.i.FS_unlink("/model.dat");
				} catch {}
				this.g.i.FS_createDataFile("/", "model.dat", new Uint8Array(e), !0, !1, !1), uc(this, "/model.dat"), this.m(), this.L();
			}));
			if (t.modelAssetBuffer instanceof Uint8Array) uc(this, t.modelAssetBuffer);
			else if (t.modelAssetBuffer) return async function(e) {
				let t = [];
				for (var n = 0;;) {
					let { done: r, value: i } = await e.read();
					if (r) break;
					t.push(i), n += i.length;
				}
				if (t.length === 0) return /* @__PURE__ */ new Uint8Array();
				if (t.length === 1) return t[0];
				e = new Uint8Array(n), n = 0;
				for (let r of t) e.set(r, n), n += r.length;
				return e;
			}(t.modelAssetBuffer).then(((e) => {
				uc(this, e), this.m(), this.L();
			}));
		}
		return this.m(), this.L(), Promise.resolve();
	}
	L() {}
	ca() {
		let e;
		if (this.g.ca(((t) => {
			e = yo(t);
		})), !e) throw Error("Failed to retrieve CalculatorGraphConfig");
		return e;
	}
	setGraph(e, t) {
		this.g.attachErrorListener(((e, t) => {
			this.H.push(Error(t));
		})), this.g.Ja(), this.g.setGraph(e, t), this.B = void 0, dc(this);
	}
	finishProcessing() {
		this.g.finishProcessing(), dc(this);
	}
	close() {
		this.B = void 0, this.g.closeGraph();
	}
};
function gc(e, t) {
	if (!e) throw Error(`Unable to obtain required WebGL resource: ${t}`);
	return e;
}
hc.prototype.close = hc.prototype.close;
var _c = class {
	constructor(e, t, n, r) {
		this.g = e, this.h = t, this.m = n, this.l = r;
	}
	bind() {
		this.g.bindVertexArray(this.h);
	}
	close() {
		this.g.deleteVertexArray(this.h), this.g.deleteBuffer(this.m), this.g.deleteBuffer(this.l);
	}
};
function vc(e, t, n) {
	let r = e.g;
	if (n = gc(r.createShader(n), "Failed to create WebGL shader"), r.shaderSource(n, t), r.compileShader(n), !r.getShaderParameter(n, r.COMPILE_STATUS)) throw Error(`Could not compile WebGL shader: ${r.getShaderInfoLog(n)}`);
	return r.attachShader(e.h, n), n;
}
function yc(e, t) {
	let n = e.g, r = gc(n.createVertexArray(), "Failed to create vertex array");
	n.bindVertexArray(r);
	let i = gc(n.createBuffer(), "Failed to create buffer");
	n.bindBuffer(n.ARRAY_BUFFER, i), n.enableVertexAttribArray(e.O), n.vertexAttribPointer(e.O, 2, n.FLOAT, !1, 0, 0), n.bufferData(n.ARRAY_BUFFER, new Float32Array([
		-1,
		-1,
		-1,
		1,
		1,
		1,
		1,
		-1
	]), n.STATIC_DRAW);
	let a = gc(n.createBuffer(), "Failed to create buffer");
	return n.bindBuffer(n.ARRAY_BUFFER, a), n.enableVertexAttribArray(e.L), n.vertexAttribPointer(e.L, 2, n.FLOAT, !1, 0, 0), n.bufferData(n.ARRAY_BUFFER, new Float32Array(t ? [
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		1
	] : [
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		0
	]), n.STATIC_DRAW), n.bindBuffer(n.ARRAY_BUFFER, null), n.bindVertexArray(null), new _c(n, r, i, a);
}
function bc(e, t) {
	if (e.g) {
		if (t !== e.g) throw Error("Cannot change GL context once initialized");
	} else e.g = t;
}
function xc(e, t, n, r) {
	return bc(e, t), e.h || (e.m(), e.D()), n ? (e.u || (e.u = yc(e, !0)), n = e.u) : (e.A || (e.A = yc(e, !1)), n = e.A), t.useProgram(e.h), n.bind(), e.l(), e = r(), n.g.bindVertexArray(null), e;
}
function Sc(e, t, n) {
	return bc(e, t), e = gc(t.createTexture(), "Failed to create texture"), t.bindTexture(t.TEXTURE_2D, e), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, n ?? t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, n ?? t.LINEAR), t.bindTexture(t.TEXTURE_2D, null), e;
}
function Cc(e, t, n) {
	bc(e, t), e.B ||= gc(t.createFramebuffer(), "Failed to create framebuffe."), t.bindFramebuffer(t.FRAMEBUFFER, e.B), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, n, 0);
}
function wc(e) {
	e.g?.bindFramebuffer(e.g.FRAMEBUFFER, null);
}
var Tc = class {
	H() {
		return "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D inputTexture;\n  void main() {\n    gl_FragColor = texture2D(inputTexture, vTex);\n  }\n ";
	}
	m() {
		let e = this.g;
		if (this.h = gc(e.createProgram(), "Failed to create WebGL program"), this.X = vc(this, "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }", e.VERTEX_SHADER), this.W = vc(this, this.H(), e.FRAGMENT_SHADER), e.linkProgram(this.h), !e.getProgramParameter(this.h, e.LINK_STATUS)) throw Error(`Error during program linking: ${e.getProgramInfoLog(this.h)}`);
		this.O = e.getAttribLocation(this.h, "aVertex"), this.L = e.getAttribLocation(this.h, "aTex");
	}
	D() {}
	l() {}
	close() {
		if (this.h) {
			let e = this.g;
			e.deleteProgram(this.h), e.deleteShader(this.X), e.deleteShader(this.W);
		}
		this.B && this.g.deleteFramebuffer(this.B), this.A && this.A.close(), this.u && this.u.close();
	}
}, Ec = class extends Tc {
	H() {
		return "\n  precision mediump float;\n  uniform sampler2D backgroundTexture;\n  uniform sampler2D maskTexture;\n  uniform sampler2D colorMappingTexture;\n  varying vec2 vTex;\n  void main() {\n    vec4 backgroundColor = texture2D(backgroundTexture, vTex);\n    float category = texture2D(maskTexture, vTex).r;\n    vec4 categoryColor = texture2D(colorMappingTexture, vec2(category, 0.0));\n    gl_FragColor = mix(backgroundColor, categoryColor, categoryColor.a);\n  }\n ";
	}
	D() {
		let e = this.g;
		e.activeTexture(e.TEXTURE1), this.C = Sc(this, e, e.LINEAR), e.activeTexture(e.TEXTURE2), this.j = Sc(this, e, e.NEAREST);
	}
	m() {
		super.m();
		let e = this.g;
		this.P = gc(e.getUniformLocation(this.h, "backgroundTexture"), "Uniform location"), this.U = gc(e.getUniformLocation(this.h, "colorMappingTexture"), "Uniform location"), this.M = gc(e.getUniformLocation(this.h, "maskTexture"), "Uniform location");
	}
	l() {
		super.l();
		let e = this.g;
		e.uniform1i(this.M, 0), e.uniform1i(this.P, 1), e.uniform1i(this.U, 2);
	}
	close() {
		this.C && this.g.deleteTexture(this.C), this.j && this.g.deleteTexture(this.j), super.close();
	}
}, Dc = class extends Tc {
	H() {
		return "\n  precision mediump float;\n  uniform sampler2D maskTexture;\n  uniform sampler2D defaultTexture;\n  uniform sampler2D overlayTexture;\n  varying vec2 vTex;\n  void main() {\n    float confidence = texture2D(maskTexture, vTex).r;\n    vec4 defaultColor = texture2D(defaultTexture, vTex);\n    vec4 overlayColor = texture2D(overlayTexture, vTex);\n    // Apply the alpha from the overlay and merge in the default color\n    overlayColor = mix(defaultColor, overlayColor, overlayColor.a);\n    gl_FragColor = mix(defaultColor, overlayColor, confidence);\n  }\n ";
	}
	D() {
		let e = this.g;
		e.activeTexture(e.TEXTURE1), this.j = Sc(this, e), e.activeTexture(e.TEXTURE2), this.C = Sc(this, e);
	}
	m() {
		super.m();
		let e = this.g;
		this.M = gc(e.getUniformLocation(this.h, "defaultTexture"), "Uniform location"), this.P = gc(e.getUniformLocation(this.h, "overlayTexture"), "Uniform location"), this.I = gc(e.getUniformLocation(this.h, "maskTexture"), "Uniform location");
	}
	l() {
		super.l();
		let e = this.g;
		e.uniform1i(this.I, 0), e.uniform1i(this.M, 1), e.uniform1i(this.P, 2);
	}
	close() {
		this.j && this.g.deleteTexture(this.j), this.C && this.g.deleteTexture(this.C), super.close();
	}
};
function Oc(e, t) {
	switch (t) {
		case 0: return e.g.find(((e) => e instanceof Uint8Array));
		case 1: return e.g.find(((e) => e instanceof Float32Array));
		case 2: return e.g.find(((e) => typeof WebGLTexture < "u" && e instanceof WebGLTexture));
		default: throw Error(`Type is not supported: ${t}`);
	}
}
function kc(e) {
	var t = Oc(e, 1);
	if (!t) {
		if (t = Oc(e, 0)) t = new Float32Array(t).map(((e) => e / 255));
		else {
			t = new Float32Array(e.width * e.height);
			let r = jc(e);
			var n = Nc(e);
			if (Cc(n, r, Ac(e)), "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform) || navigator.userAgent.includes("Mac") && "document" in self && "ontouchend" in self.document) {
				n = new Float32Array(e.width * e.height * 4), r.readPixels(0, 0, e.width, e.height, r.RGBA, r.FLOAT, n);
				for (let e = 0, r = 0; e < t.length; ++e, r += 4) t[e] = n[r];
			} else r.readPixels(0, 0, e.width, e.height, r.RED, r.FLOAT, t);
		}
		e.g.push(t);
	}
	return t;
}
function Ac(e) {
	let t = Oc(e, 2);
	if (!t) {
		let n = jc(e);
		t = Pc(e);
		let r = kc(e), i = Mc(e);
		n.texImage2D(n.TEXTURE_2D, 0, i, e.width, e.height, 0, n.RED, n.FLOAT, r), Fc(e);
	}
	return t;
}
function jc(e) {
	if (!e.canvas) throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");
	return e.h ||= gc(e.canvas.getContext("webgl2"), "You cannot use a canvas that is already bound to a different type of rendering context."), e.h;
}
function Mc(e) {
	if (e = jc(e), !Ic) {
		if (e.getExtension("EXT_color_buffer_float") && e.getExtension("OES_texture_float_linear") && e.getExtension("EXT_float_blend")) Ic = e.R32F;
		else {
			if (!e.getExtension("EXT_color_buffer_half_float")) throw Error("GPU does not fully support 4-channel float32 or float16 formats");
			Ic = e.R16F;
		}
	}
	return Ic;
}
function Nc(e) {
	return e.l ||= new Tc(), e.l;
}
function Pc(e) {
	let t = jc(e);
	t.viewport(0, 0, e.width, e.height), t.activeTexture(t.TEXTURE0);
	let n = Oc(e, 2);
	return n || (n = Sc(Nc(e), t, e.m ? t.LINEAR : t.NEAREST), e.g.push(n), e.j = !0), t.bindTexture(t.TEXTURE_2D, n), n;
}
function Fc(e) {
	e.h.bindTexture(e.h.TEXTURE_2D, null);
}
var Ic, Y = class {
	constructor(e, t, n, r, i, a, o) {
		this.g = e, this.m = t, this.j = n, this.canvas = r, this.l = i, this.width = a, this.height = o, this.j && --Lc === 0 && console.error("You seem to be creating MPMask instances without invoking .close(). This leaks resources.");
	}
	Fa() {
		return !!Oc(this, 0);
	}
	ka() {
		return !!Oc(this, 1);
	}
	R() {
		return !!Oc(this, 2);
	}
	ja() {
		return (t = Oc(e = this, 0)) || (t = kc(e), t = new Uint8Array(t.map(((e) => Math.round(255 * e)))), e.g.push(t)), t;
		var e, t;
	}
	ia() {
		return kc(this);
	}
	N() {
		return Ac(this);
	}
	clone() {
		let e = [];
		for (let t of this.g) {
			let n;
			if (t instanceof Uint8Array) n = new Uint8Array(t);
			else if (t instanceof Float32Array) n = new Float32Array(t);
			else {
				if (!(t instanceof WebGLTexture)) throw Error(`Type is not supported: ${t}`);
				{
					let e = jc(this), t = Nc(this);
					e.activeTexture(e.TEXTURE1), n = Sc(t, e, this.m ? e.LINEAR : e.NEAREST), e.bindTexture(e.TEXTURE_2D, n);
					let r = Mc(this);
					e.texImage2D(e.TEXTURE_2D, 0, r, this.width, this.height, 0, e.RED, e.FLOAT, null), e.bindTexture(e.TEXTURE_2D, null), Cc(t, e, n), xc(t, e, !1, (() => {
						Pc(this), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), e.drawArrays(e.TRIANGLE_FAN, 0, 4), Fc(this);
					})), wc(t), Fc(this);
				}
			}
			e.push(n);
		}
		return new Y(e, this.m, this.R(), this.canvas, this.l, this.width, this.height);
	}
	close() {
		this.j && jc(this).deleteTexture(Oc(this, 2)), Lc = -1;
	}
};
Y.prototype.close = Y.prototype.close, Y.prototype.clone = Y.prototype.clone, Y.prototype.getAsWebGLTexture = Y.prototype.N, Y.prototype.getAsFloat32Array = Y.prototype.ia, Y.prototype.getAsUint8Array = Y.prototype.ja, Y.prototype.hasWebGLTexture = Y.prototype.R, Y.prototype.hasFloat32Array = Y.prototype.ka, Y.prototype.hasUint8Array = Y.prototype.Fa;
var Lc = 250, Rc = {
	color: "white",
	lineWidth: 4,
	radius: 6
};
function zc(e) {
	return {
		...Rc,
		fillColor: (e ||= {}).color,
		...e
	};
}
function Bc(e, t) {
	return e instanceof Function ? e(t) : e;
}
function Vc(e, t, n) {
	return Math.max(Math.min(t, n), Math.min(Math.max(t, n), e));
}
function Hc(e) {
	if (!e.l) throw Error("CPU rendering requested but CanvasRenderingContext2D not provided.");
	return e.l;
}
function Uc(e) {
	if (!e.j) throw Error("GPU rendering requested but WebGL2RenderingContext not provided.");
	return e.j;
}
function Wc(e, t, n) {
	if (t.R()) n(t.N());
	else {
		let r = t.ka() ? t.ia() : t.ja();
		e.m = e.m ?? new Tc();
		let i = Uc(e);
		n((e = new Y([r], t.m, !1, i.canvas, e.m, t.width, t.height)).N()), e.close();
	}
}
function Gc(e, t, n, r) {
	let i = function(e) {
		return e.g ||= new Ec(), e.g;
	}(e), a = Uc(e), o = Array.isArray(n) ? new ImageData(new Uint8ClampedArray(n), 1, 1) : n;
	xc(i, a, !0, (() => {
		(function(e, t, n, r) {
			let i = e.g;
			if (i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, t), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, e.C), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, n), e.I && function(e, t) {
				if (e !== t) return !1;
				e = e.entries(), t = t.entries();
				for (let [n, r] of e) {
					e = n;
					let i = r, a = t.next();
					if (a.done) return !1;
					let [o, s] = a.value;
					if (e !== o || i[0] !== s[0] || i[1] !== s[1] || i[2] !== s[2] || i[3] !== s[3]) return !1;
				}
				return !!t.next().done;
			}(e.I, r)) i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, e.j);
			else {
				e.I = r;
				let t = Array(1024).fill(0);
				r.forEach(((e, n) => {
					if (e.length !== 4) throw Error(`Color at index ${n} is not a four-channel value.`);
					t[4 * n] = e[0], t[4 * n + 1] = e[1], t[4 * n + 2] = e[2], t[4 * n + 3] = e[3];
				})), i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, e.j), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, 256, 1, 0, i.RGBA, i.UNSIGNED_BYTE, new Uint8Array(t));
			}
		})(i, t, o, r), a.clearColor(0, 0, 0, 0), a.clear(a.COLOR_BUFFER_BIT), a.drawArrays(a.TRIANGLE_FAN, 0, 4);
		let e = i.g;
		e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, null), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, null), e.activeTexture(e.TEXTURE2), e.bindTexture(e.TEXTURE_2D, null);
	}));
}
function Kc(e, t, n, r) {
	let i = Uc(e), a = function(e) {
		return e.h ||= new Dc(), e.h;
	}(e), o = Array.isArray(n) ? new ImageData(new Uint8ClampedArray(n), 1, 1) : n, s = Array.isArray(r) ? new ImageData(new Uint8ClampedArray(r), 1, 1) : r;
	xc(a, i, !0, (() => {
		var e = a.g;
		e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, t), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, a.j), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, o), e.activeTexture(e.TEXTURE2), e.bindTexture(e.TEXTURE_2D, a.C), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, s), i.clearColor(0, 0, 0, 0), i.clear(i.COLOR_BUFFER_BIT), i.drawArrays(i.TRIANGLE_FAN, 0, 4), i.bindTexture(i.TEXTURE_2D, null), (e = a.g).activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, null), e.activeTexture(e.TEXTURE1), e.bindTexture(e.TEXTURE_2D, null), e.activeTexture(e.TEXTURE2), e.bindTexture(e.TEXTURE_2D, null);
	}));
}
var qc = class {
	constructor(e, t) {
		typeof CanvasRenderingContext2D < "u" && e instanceof CanvasRenderingContext2D || e instanceof OffscreenCanvasRenderingContext2D ? (this.l = e, this.j = t) : this.j = e;
	}
	ya(e, t) {
		if (e) {
			var n = Hc(this);
			t = zc(t), n.save();
			var r = n.canvas, i = 0;
			for (let a of e) n.fillStyle = Bc(t.fillColor, {
				index: i,
				from: a
			}), n.strokeStyle = Bc(t.color, {
				index: i,
				from: a
			}), n.lineWidth = Bc(t.lineWidth, {
				index: i,
				from: a
			}), (e = new Path2D()).arc(a.x * r.width, a.y * r.height, Bc(t.radius, {
				index: i,
				from: a
			}), 0, 2 * Math.PI), n.fill(e), n.stroke(e), ++i;
			n.restore();
		}
	}
	xa(e, t, n) {
		if (e && t) {
			var r = Hc(this);
			n = zc(n), r.save();
			var i = r.canvas, a = 0;
			for (let o of t) {
				r.beginPath(), t = e[o.start];
				let s = e[o.end];
				t && s && (r.strokeStyle = Bc(n.color, {
					index: a,
					from: t,
					to: s
				}), r.lineWidth = Bc(n.lineWidth, {
					index: a,
					from: t,
					to: s
				}), r.moveTo(t.x * i.width, t.y * i.height), r.lineTo(s.x * i.width, s.y * i.height)), ++a, r.stroke();
			}
			r.restore();
		}
	}
	ua(e, t) {
		let n = Hc(this);
		t = zc(t), n.save(), n.beginPath(), n.lineWidth = Bc(t.lineWidth, {}), n.strokeStyle = Bc(t.color, {}), n.fillStyle = Bc(t.fillColor, {}), n.moveTo(e.originX, e.originY), n.lineTo(e.originX + e.width, e.originY), n.lineTo(e.originX + e.width, e.originY + e.height), n.lineTo(e.originX, e.originY + e.height), n.lineTo(e.originX, e.originY), n.stroke(), n.fill(), n.restore();
	}
	va(e, t, n = [
		0,
		0,
		0,
		255
	]) {
		this.l ? function(e, t, n, r) {
			let i = Uc(e);
			Wc(e, t, ((t) => {
				Gc(e, t, n, r), (t = Hc(e)).drawImage(i.canvas, 0, 0, t.canvas.width, t.canvas.height);
			}));
		}(this, e, n, t) : Gc(this, e.N(), n, t);
	}
	wa(e, t, n) {
		this.l ? function(e, t, n, r) {
			let i = Uc(e);
			Wc(e, t, ((t) => {
				Kc(e, t, n, r), (t = Hc(e)).drawImage(i.canvas, 0, 0, t.canvas.width, t.canvas.height);
			}));
		}(this, e, t, n) : Kc(this, e.N(), t, n);
	}
	close() {
		this.g?.close(), this.g = void 0, this.h?.close(), this.h = void 0, this.m?.close(), this.m = void 0;
	}
};
function Jc(e, t) {
	switch (t) {
		case 0: return e.g.find(((e) => e instanceof ImageData));
		case 1: return e.g.find(((e) => typeof ImageBitmap < "u" && e instanceof ImageBitmap));
		case 2: return e.g.find(((e) => typeof WebGLTexture < "u" && e instanceof WebGLTexture));
		default: throw Error(`Type is not supported: ${t}`);
	}
}
function Yc(e) {
	var t = Jc(e, 0);
	if (!t) {
		t = Zc(e);
		let n = Qc(e), r = new Uint8Array(e.width * e.height * 4);
		Cc(n, t, Xc(e)), t.readPixels(0, 0, e.width, e.height, t.RGBA, t.UNSIGNED_BYTE, r), wc(n), t = new ImageData(new Uint8ClampedArray(r.buffer), e.width, e.height), e.g.push(t);
	}
	return t;
}
function Xc(e) {
	let t = Jc(e, 2);
	if (!t) {
		let n = Zc(e);
		t = $c(e);
		let r = Jc(e, 1) || Yc(e);
		n.texImage2D(n.TEXTURE_2D, 0, n.RGBA, n.RGBA, n.UNSIGNED_BYTE, r), el(e);
	}
	return t;
}
function Zc(e) {
	if (!e.canvas) throw Error("Conversion to different image formats require that a canvas is passed when initializing the image.");
	return e.h ||= gc(e.canvas.getContext("webgl2"), "You cannot use a canvas that is already bound to a different type of rendering context."), e.h;
}
function Qc(e) {
	return e.l ||= new Tc(), e.l;
}
function $c(e) {
	let t = Zc(e);
	t.viewport(0, 0, e.width, e.height), t.activeTexture(t.TEXTURE0);
	let n = Jc(e, 2);
	return n || (n = Sc(Qc(e), t), e.g.push(n), e.m = !0), t.bindTexture(t.TEXTURE_2D, n), n;
}
function el(e) {
	e.h.bindTexture(e.h.TEXTURE_2D, null);
}
function tl(e) {
	let t = Zc(e);
	return xc(Qc(e), t, !0, (() => function(e, t) {
		let n = e.canvas;
		if (n.width === e.width && n.height === e.height) return t();
		let r = n.width, i = n.height;
		return n.width = e.width, n.height = e.height, e = t(), n.width = r, n.height = i, e;
	}(e, (() => {
		if (t.bindFramebuffer(t.FRAMEBUFFER, null), t.clearColor(0, 0, 0, 0), t.clear(t.COLOR_BUFFER_BIT), t.drawArrays(t.TRIANGLE_FAN, 0, 4), !(e.canvas instanceof OffscreenCanvas)) throw Error("Conversion to ImageBitmap requires that the MediaPipe Tasks is initialized with an OffscreenCanvas");
		return e.canvas.transferToImageBitmap();
	}))));
}
qc.prototype.close = qc.prototype.close, qc.prototype.drawConfidenceMask = qc.prototype.wa, qc.prototype.drawCategoryMask = qc.prototype.va, qc.prototype.drawBoundingBox = qc.prototype.ua, qc.prototype.drawConnectors = qc.prototype.xa, qc.prototype.drawLandmarks = qc.prototype.ya, qc.lerp = function(e, t, n, r, i) {
	return Vc(r * (1 - (e - t) / (n - t)) + i * (1 - (n - e) / (n - t)), r, i);
}, qc.clamp = Vc;
var nl = class {
	constructor(e, t, n, r, i, a, o) {
		this.g = e, this.j = t, this.m = n, this.canvas = r, this.l = i, this.width = a, this.height = o, (this.j || this.m) && --rl === 0 && console.error("You seem to be creating MPImage instances without invoking .close(). This leaks resources.");
	}
	Ea() {
		return !!Jc(this, 0);
	}
	la() {
		return !!Jc(this, 1);
	}
	R() {
		return !!Jc(this, 2);
	}
	Ca() {
		return Yc(this);
	}
	Ba() {
		var e = Jc(this, 1);
		return e || (Xc(this), $c(this), e = tl(this), el(this), this.g.push(e), this.j = !0), e;
	}
	N() {
		return Xc(this);
	}
	clone() {
		let e = [];
		for (let t of this.g) {
			let n;
			if (t instanceof ImageData) n = new ImageData(t.data, this.width, this.height);
			else if (t instanceof WebGLTexture) {
				let e = Zc(this), t = Qc(this);
				e.activeTexture(e.TEXTURE1), n = Sc(t, e), e.bindTexture(e.TEXTURE_2D, n), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, this.width, this.height, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.bindTexture(e.TEXTURE_2D, null), Cc(t, e, n), xc(t, e, !1, (() => {
					$c(this), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), e.drawArrays(e.TRIANGLE_FAN, 0, 4), el(this);
				})), wc(t), el(this);
			} else {
				if (!(t instanceof ImageBitmap)) throw Error(`Type is not supported: ${t}`);
				Xc(this), $c(this), n = tl(this), el(this);
			}
			e.push(n);
		}
		return new nl(e, this.la(), this.R(), this.canvas, this.l, this.width, this.height);
	}
	close() {
		this.j && Jc(this, 1).close(), this.m && Zc(this).deleteTexture(Jc(this, 2)), rl = -1;
	}
};
nl.prototype.close = nl.prototype.close, nl.prototype.clone = nl.prototype.clone, nl.prototype.getAsWebGLTexture = nl.prototype.N, nl.prototype.getAsImageBitmap = nl.prototype.Ba, nl.prototype.getAsImageData = nl.prototype.Ca, nl.prototype.hasWebGLTexture = nl.prototype.R, nl.prototype.hasImageBitmap = nl.prototype.la, nl.prototype.hasImageData = nl.prototype.Ea;
var rl = 250;
function il(...e) {
	return e.map((([e, t]) => ({
		start: e,
		end: t
	})));
}
var al = function(e) {
	return class extends e {
		Ja() {
			this.i._registerModelResourcesGraphService();
		}
	};
}((ol = class {
	constructor(e, t) {
		this.l = !0, this.i = e, this.g = null, this.h = 0, this.m = typeof this.i._addIntToInputStream == "function", t === void 0 ? nc() ? this.i.canvas = new OffscreenCanvas(1, 1) : (console.warn("OffscreenCanvas not supported and GraphRunner constructor glCanvas parameter is undefined. Creating backup canvas."), this.i.canvas = document.createElement("canvas")) : this.i.canvas = t;
	}
	async initializeGraph(e) {
		let t = await (await fetch(e)).arrayBuffer();
		e = !(e.endsWith(".pbtxt") || e.endsWith(".textproto")), this.setGraph(new Uint8Array(t), e);
	}
	setGraphFromString(e) {
		this.setGraph(new TextEncoder().encode(e), !1);
	}
	setGraph(e, t) {
		let n = e.length, r = this.i._malloc(n);
		this.i.HEAPU8.set(e, r), t ? this.i._changeBinaryGraph(n, r) : this.i._changeTextGraph(n, r), this.i._free(r);
	}
	configureAudio(e, t, n, r, i) {
		this.i._configureAudio || console.warn("Attempting to use configureAudio without support for input audio. Is build dep \":gl_graph_runner_audio\" missing?"), q(this, r || "input_audio", ((r) => {
			q(this, i ||= "audio_header", ((i) => {
				this.i._configureAudio(r, i, e, t ?? 0, n);
			}));
		}));
	}
	setAutoResizeCanvas(e) {
		this.l = e;
	}
	setAutoRenderToScreen(e) {
		this.i._setAutoRenderToScreen(e);
	}
	setGpuBufferVerticalFlip(e) {
		this.i.gpuOriginForWebTexturesIsBottomLeft = e;
	}
	ca(e) {
		sc(this, "__graph_config__", ((t) => {
			e(t);
		})), q(this, "__graph_config__", ((e) => {
			this.i._getGraphConfig(e, void 0);
		})), delete this.i.simpleListeners.__graph_config__;
	}
	attachErrorListener(e) {
		this.i.errorListener = e;
	}
	attachEmptyPacketListener(e, t) {
		this.i.emptyPacketListeners = this.i.emptyPacketListeners || {}, this.i.emptyPacketListeners[e] = t;
	}
	addAudioToStream(e, t, n) {
		this.addAudioToStreamWithShape(e, 0, 0, t, n);
	}
	addAudioToStreamWithShape(e, t, n, r, i) {
		let a = 4 * e.length;
		this.h !== a && (this.g && this.i._free(this.g), this.g = this.i._malloc(a), this.h = a), this.i.HEAPF32.set(e, this.g / 4), q(this, r, ((e) => {
			this.i._addAudioToInputStream(this.g, t, n, e, i);
		}));
	}
	addGpuBufferToStream(e, t, n) {
		q(this, t, ((t) => {
			let [r, i] = ac(this, e, t);
			this.i._addBoundTextureToStream(t, r, i, n);
		}));
	}
	addBoolToStream(e, t, n) {
		q(this, t, ((t) => {
			this.i._addBoolToInputStream(e, t, n);
		}));
	}
	addDoubleToStream(e, t, n) {
		q(this, t, ((t) => {
			this.i._addDoubleToInputStream(e, t, n);
		}));
	}
	addFloatToStream(e, t, n) {
		q(this, t, ((t) => {
			this.i._addFloatToInputStream(e, t, n);
		}));
	}
	addIntToStream(e, t, n) {
		q(this, t, ((t) => {
			this.i._addIntToInputStream(e, t, n);
		}));
	}
	addUintToStream(e, t, n) {
		q(this, t, ((t) => {
			this.i._addUintToInputStream(e, t, n);
		}));
	}
	addStringToStream(e, t, n) {
		q(this, t, ((t) => {
			q(this, e, ((e) => {
				this.i._addStringToInputStream(e, t, n);
			}));
		}));
	}
	addStringRecordToStream(e, t, n) {
		q(this, t, ((t) => {
			oc(this, Object.keys(e), ((r) => {
				oc(this, Object.values(e), ((i) => {
					this.i._addFlatHashMapToInputStream(r, i, Object.keys(e).length, t, n);
				}));
			}));
		}));
	}
	addProtoToStream(e, t, n, r) {
		q(this, n, ((n) => {
			q(this, t, ((t) => {
				let i = this.i._malloc(e.length);
				this.i.HEAPU8.set(e, i), this.i._addProtoToInputStream(i, e.length, t, n, r), this.i._free(i);
			}));
		}));
	}
	addEmptyPacketToStream(e, t) {
		q(this, e, ((e) => {
			this.i._addEmptyPacketToInputStream(e, t);
		}));
	}
	addBoolVectorToStream(e, t, n) {
		q(this, t, ((t) => {
			let r = this.i._allocateBoolVector(e.length);
			if (!r) throw Error("Unable to allocate new bool vector on heap.");
			for (let t of e) this.i._addBoolVectorEntry(r, t);
			this.i._addBoolVectorToInputStream(r, t, n);
		}));
	}
	addDoubleVectorToStream(e, t, n) {
		q(this, t, ((t) => {
			let r = this.i._allocateDoubleVector(e.length);
			if (!r) throw Error("Unable to allocate new double vector on heap.");
			for (let t of e) this.i._addDoubleVectorEntry(r, t);
			this.i._addDoubleVectorToInputStream(r, t, n);
		}));
	}
	addFloatVectorToStream(e, t, n) {
		q(this, t, ((t) => {
			let r = this.i._allocateFloatVector(e.length);
			if (!r) throw Error("Unable to allocate new float vector on heap.");
			for (let t of e) this.i._addFloatVectorEntry(r, t);
			this.i._addFloatVectorToInputStream(r, t, n);
		}));
	}
	addIntVectorToStream(e, t, n) {
		q(this, t, ((t) => {
			let r = this.i._allocateIntVector(e.length);
			if (!r) throw Error("Unable to allocate new int vector on heap.");
			for (let t of e) this.i._addIntVectorEntry(r, t);
			this.i._addIntVectorToInputStream(r, t, n);
		}));
	}
	addUintVectorToStream(e, t, n) {
		q(this, t, ((t) => {
			let r = this.i._allocateUintVector(e.length);
			if (!r) throw Error("Unable to allocate new unsigned int vector on heap.");
			for (let t of e) this.i._addUintVectorEntry(r, t);
			this.i._addUintVectorToInputStream(r, t, n);
		}));
	}
	addStringVectorToStream(e, t, n) {
		q(this, t, ((t) => {
			let r = this.i._allocateStringVector(e.length);
			if (!r) throw Error("Unable to allocate new string vector on heap.");
			for (let t of e) q(this, t, ((e) => {
				this.i._addStringVectorEntry(r, e);
			}));
			this.i._addStringVectorToInputStream(r, t, n);
		}));
	}
	addBoolToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			this.i._addBoolToInputSidePacket(e, t);
		}));
	}
	addDoubleToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			this.i._addDoubleToInputSidePacket(e, t);
		}));
	}
	addFloatToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			this.i._addFloatToInputSidePacket(e, t);
		}));
	}
	addIntToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			this.i._addIntToInputSidePacket(e, t);
		}));
	}
	addUintToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			this.i._addUintToInputSidePacket(e, t);
		}));
	}
	addStringToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			q(this, e, ((e) => {
				this.i._addStringToInputSidePacket(e, t);
			}));
		}));
	}
	addProtoToInputSidePacket(e, t, n) {
		q(this, n, ((n) => {
			q(this, t, ((t) => {
				let r = this.i._malloc(e.length);
				this.i.HEAPU8.set(e, r), this.i._addProtoToInputSidePacket(r, e.length, t, n), this.i._free(r);
			}));
		}));
	}
	addBoolVectorToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			let n = this.i._allocateBoolVector(e.length);
			if (!n) throw Error("Unable to allocate new bool vector on heap.");
			for (let t of e) this.i._addBoolVectorEntry(n, t);
			this.i._addBoolVectorToInputSidePacket(n, t);
		}));
	}
	addDoubleVectorToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			let n = this.i._allocateDoubleVector(e.length);
			if (!n) throw Error("Unable to allocate new double vector on heap.");
			for (let t of e) this.i._addDoubleVectorEntry(n, t);
			this.i._addDoubleVectorToInputSidePacket(n, t);
		}));
	}
	addFloatVectorToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			let n = this.i._allocateFloatVector(e.length);
			if (!n) throw Error("Unable to allocate new float vector on heap.");
			for (let t of e) this.i._addFloatVectorEntry(n, t);
			this.i._addFloatVectorToInputSidePacket(n, t);
		}));
	}
	addIntVectorToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			let n = this.i._allocateIntVector(e.length);
			if (!n) throw Error("Unable to allocate new int vector on heap.");
			for (let t of e) this.i._addIntVectorEntry(n, t);
			this.i._addIntVectorToInputSidePacket(n, t);
		}));
	}
	addUintVectorToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			let n = this.i._allocateUintVector(e.length);
			if (!n) throw Error("Unable to allocate new unsigned int vector on heap.");
			for (let t of e) this.i._addUintVectorEntry(n, t);
			this.i._addUintVectorToInputSidePacket(n, t);
		}));
	}
	addStringVectorToInputSidePacket(e, t) {
		q(this, t, ((t) => {
			let n = this.i._allocateStringVector(e.length);
			if (!n) throw Error("Unable to allocate new string vector on heap.");
			for (let t of e) q(this, t, ((e) => {
				this.i._addStringVectorEntry(n, e);
			}));
			this.i._addStringVectorToInputSidePacket(n, t);
		}));
	}
	attachBoolListener(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachBoolListener(e);
		}));
	}
	attachBoolVectorListener(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachBoolVectorListener(e);
		}));
	}
	attachIntListener(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachIntListener(e);
		}));
	}
	attachIntVectorListener(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachIntVectorListener(e);
		}));
	}
	attachUintListener(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachUintListener(e);
		}));
	}
	attachUintVectorListener(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachUintVectorListener(e);
		}));
	}
	attachDoubleListener(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachDoubleListener(e);
		}));
	}
	attachDoubleVectorListener(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachDoubleVectorListener(e);
		}));
	}
	attachFloatListener(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachFloatListener(e);
		}));
	}
	attachFloatVectorListener(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachFloatVectorListener(e);
		}));
	}
	attachStringListener(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachStringListener(e);
		}));
	}
	attachStringVectorListener(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachStringVectorListener(e);
		}));
	}
	attachProtoListener(e, t, n) {
		sc(this, e, t), q(this, e, ((e) => {
			this.i._attachProtoListener(e, n || !1);
		}));
	}
	attachProtoVectorListener(e, t, n) {
		cc(this, e, t), q(this, e, ((e) => {
			this.i._attachProtoVectorListener(e, n || !1);
		}));
	}
	attachAudioListener(e, t, n) {
		this.i._attachAudioListener || console.warn("Attempting to use attachAudioListener without support for output audio. Is build dep \":gl_graph_runner_audio_out\" missing?"), sc(this, e, ((e, n) => {
			e = new Float32Array(e.buffer, e.byteOffset, e.length / 4), t(e, n);
		})), q(this, e, ((e) => {
			this.i._attachAudioListener(e, n || !1);
		}));
	}
	finishProcessing() {
		this.i._waitUntilIdle();
	}
	closeGraph() {
		this.i._closeGraph(), this.i.simpleListeners = void 0, this.i.emptyPacketListeners = void 0;
	}
}, class extends ol {
	get ga() {
		return this.i;
	}
	pa(e, t, n) {
		q(this, t, ((t) => {
			let [r, i] = ac(this, e, t);
			this.ga._addBoundTextureAsImageToStream(t, r, i, n);
		}));
	}
	Z(e, t) {
		sc(this, e, t), q(this, e, ((e) => {
			this.ga._attachImageListener(e);
		}));
	}
	aa(e, t) {
		cc(this, e, t), q(this, e, ((e) => {
			this.ga._attachImageVectorListener(e);
		}));
	}
})), ol, sl = class extends al {};
async function X(e, t, n) {
	return async function(e, t, n, r) {
		return lc(e, t, n, r);
	}(e, n.canvas ?? (nc() ? void 0 : document.createElement("canvas")), t, n);
}
function cl(e, t, n, r) {
	if (e.U) {
		let a = new Po();
		if (n?.regionOfInterest) {
			if (!e.oa) throw Error("This task doesn't support region-of-interest.");
			var i = n.regionOfInterest;
			if (i.left >= i.right || i.top >= i.bottom) throw Error("Expected RectF with left < right and top < bottom.");
			if (i.left < 0 || i.top < 0 || i.right > 1 || i.bottom > 1) throw Error("Expected RectF values to be in [0,1].");
			N(a, 1, (i.left + i.right) / 2), N(a, 2, (i.top + i.bottom) / 2), N(a, 4, i.right - i.left), N(a, 3, i.bottom - i.top);
		} else N(a, 1, .5), N(a, 2, .5), N(a, 4, 1), N(a, 3, 1);
		if (n?.rotationDegrees) {
			if (n?.rotationDegrees % 90 != 0) throw Error("Expected rotation to be a multiple of 90°.");
			if (N(a, 5, -Math.PI * n.rotationDegrees / 180), n?.rotationDegrees % 180 != 0) {
				let [e, r] = ic(t);
				n = M(a, 3) * r / e, i = M(a, 4) * e / r, N(a, 4, n), N(a, 3, i);
			}
		}
		e.g.addProtoToStream(a.g(), "mediapipe.NormalizedRect", e.U, r);
	}
	e.g.pa(t, e.X, r ?? performance.now()), e.finishProcessing();
}
function ll(e, t, n) {
	if (e.baseOptions?.g()) throw Error("Task is not initialized with image mode. 'runningMode' must be set to 'IMAGE'.");
	cl(e, t, n, e.C + 1);
}
function ul(e, t, n, r) {
	if (!e.baseOptions?.g()) throw Error("Task is not initialized with video mode. 'runningMode' must be set to 'VIDEO'.");
	cl(e, t, n, r);
}
function dl(e, t, n, r) {
	var i = t.data;
	let a = t.width, o = a * (t = t.height);
	if ((i instanceof Uint8Array || i instanceof Float32Array) && i.length !== o) throw Error("Unsupported channel count: " + i.length / o);
	return e = new Y([i], n, !1, e.g.i.canvas, e.P, a, t), r ? e.clone() : e;
}
var fl = class extends hc {
	constructor(e, t, n, r) {
		super(e), this.g = e, this.X = t, this.U = n, this.oa = r, this.P = new Tc();
	}
	l(e, t = !0) {
		if ("runningMode" in e && O(this.baseOptions, 2, xn(!!e.runningMode && e.runningMode !== "IMAGE")), e.canvas !== void 0 && this.g.i.canvas !== e.canvas) throw Error("You must create a new task to reset the canvas.");
		return super.l(e, t);
	}
	close() {
		this.P.close(), super.close();
	}
};
fl.prototype.close = fl.prototype.close;
var pl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect_in", !1), this.j = { detections: [] }, j(e = this.h = new Xo(), 0, 1, t = new G()), N(this.h, 2, .5), N(this.h, 3, .3);
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return "minDetectionConfidence" in e && N(this.h, 2, e.minDetectionConfidence ?? .5), "minSuppressionThreshold" in e && N(this.h, 3, e.minSuppressionThreshold ?? .3), this.l(e);
	}
	F(e, t) {
		return this.j = { detections: [] }, ll(this, e, t), this.j;
	}
	G(e, t, n) {
		return this.j = { detections: [] }, ul(this, e, n, t), this.j;
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect_in"), W(e, "detections");
		let t = new lo();
		Ui(t, Qo, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.face_detector.FaceDetectorGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect_in"), H(n, "DETECTIONS:detections"), n.o(t), go(e, n), this.g.attachProtoVectorListener("detections", ((e, t) => {
			for (let t of e) e = Do(t), this.j.detections.push(Ks(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("detections", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
pl.prototype.detectForVideo = pl.prototype.G, pl.prototype.detect = pl.prototype.F, pl.prototype.setOptions = pl.prototype.o, pl.createFromModelPath = async function(e, t) {
	return X(pl, e, { baseOptions: { modelAssetPath: t } });
}, pl.createFromModelBuffer = function(e, t) {
	return X(pl, e, { baseOptions: { modelAssetBuffer: t } });
}, pl.createFromOptions = function(e, t) {
	return X(pl, e, t);
};
var ml = il([61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291], [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291], [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308], [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308]), hl = il([263, 249], [249, 390], [390, 373], [373, 374], [374, 380], [380, 381], [381, 382], [382, 362], [263, 466], [466, 388], [388, 387], [387, 386], [386, 385], [385, 384], [384, 398], [398, 362]), gl = il([276, 283], [283, 282], [282, 295], [295, 285], [300, 293], [293, 334], [334, 296], [296, 336]), _l = il([474, 475], [475, 476], [476, 477], [477, 474]), vl = il([33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133], [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133]), yl = il([46, 53], [53, 52], [52, 65], [65, 55], [70, 63], [63, 105], [105, 66], [66, 107]), bl = il([469, 470], [470, 471], [471, 472], [472, 469]), xl = il([10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454], [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400], [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172], [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10]), Sl = [
	...ml,
	...hl,
	...gl,
	...vl,
	...yl,
	...xl
], Cl = il([127, 34], [34, 139], [139, 127], [11, 0], [0, 37], [37, 11], [232, 231], [231, 120], [120, 232], [72, 37], [37, 39], [39, 72], [128, 121], [121, 47], [47, 128], [232, 121], [121, 128], [128, 232], [104, 69], [69, 67], [67, 104], [175, 171], [171, 148], [148, 175], [118, 50], [50, 101], [101, 118], [73, 39], [39, 40], [40, 73], [9, 151], [151, 108], [108, 9], [48, 115], [115, 131], [131, 48], [194, 204], [204, 211], [211, 194], [74, 40], [40, 185], [185, 74], [80, 42], [42, 183], [183, 80], [40, 92], [92, 186], [186, 40], [230, 229], [229, 118], [118, 230], [202, 212], [212, 214], [214, 202], [83, 18], [18, 17], [17, 83], [76, 61], [61, 146], [146, 76], [160, 29], [29, 30], [30, 160], [56, 157], [157, 173], [173, 56], [106, 204], [204, 194], [194, 106], [135, 214], [214, 192], [192, 135], [203, 165], [165, 98], [98, 203], [21, 71], [71, 68], [68, 21], [51, 45], [45, 4], [4, 51], [144, 24], [24, 23], [23, 144], [77, 146], [146, 91], [91, 77], [205, 50], [50, 187], [187, 205], [201, 200], [200, 18], [18, 201], [91, 106], [106, 182], [182, 91], [90, 91], [91, 181], [181, 90], [85, 84], [84, 17], [17, 85], [206, 203], [203, 36], [36, 206], [148, 171], [171, 140], [140, 148], [92, 40], [40, 39], [39, 92], [193, 189], [189, 244], [244, 193], [159, 158], [158, 28], [28, 159], [247, 246], [246, 161], [161, 247], [236, 3], [3, 196], [196, 236], [54, 68], [68, 104], [104, 54], [193, 168], [168, 8], [8, 193], [117, 228], [228, 31], [31, 117], [189, 193], [193, 55], [55, 189], [98, 97], [97, 99], [99, 98], [126, 47], [47, 100], [100, 126], [166, 79], [79, 218], [218, 166], [155, 154], [154, 26], [26, 155], [209, 49], [49, 131], [131, 209], [135, 136], [136, 150], [150, 135], [47, 126], [126, 217], [217, 47], [223, 52], [52, 53], [53, 223], [45, 51], [51, 134], [134, 45], [211, 170], [170, 140], [140, 211], [67, 69], [69, 108], [108, 67], [43, 106], [106, 91], [91, 43], [230, 119], [119, 120], [120, 230], [226, 130], [130, 247], [247, 226], [63, 53], [53, 52], [52, 63], [238, 20], [20, 242], [242, 238], [46, 70], [70, 156], [156, 46], [78, 62], [62, 96], [96, 78], [46, 53], [53, 63], [63, 46], [143, 34], [34, 227], [227, 143], [123, 117], [117, 111], [111, 123], [44, 125], [125, 19], [19, 44], [236, 134], [134, 51], [51, 236], [216, 206], [206, 205], [205, 216], [154, 153], [153, 22], [22, 154], [39, 37], [37, 167], [167, 39], [200, 201], [201, 208], [208, 200], [36, 142], [142, 100], [100, 36], [57, 212], [212, 202], [202, 57], [20, 60], [60, 99], [99, 20], [28, 158], [158, 157], [157, 28], [35, 226], [226, 113], [113, 35], [160, 159], [159, 27], [27, 160], [204, 202], [202, 210], [210, 204], [113, 225], [225, 46], [46, 113], [43, 202], [202, 204], [204, 43], [62, 76], [76, 77], [77, 62], [137, 123], [123, 116], [116, 137], [41, 38], [38, 72], [72, 41], [203, 129], [129, 142], [142, 203], [64, 98], [98, 240], [240, 64], [49, 102], [102, 64], [64, 49], [41, 73], [73, 74], [74, 41], [212, 216], [216, 207], [207, 212], [42, 74], [74, 184], [184, 42], [169, 170], [170, 211], [211, 169], [170, 149], [149, 176], [176, 170], [105, 66], [66, 69], [69, 105], [122, 6], [6, 168], [168, 122], [123, 147], [147, 187], [187, 123], [96, 77], [77, 90], [90, 96], [65, 55], [55, 107], [107, 65], [89, 90], [90, 180], [180, 89], [101, 100], [100, 120], [120, 101], [63, 105], [105, 104], [104, 63], [93, 137], [137, 227], [227, 93], [15, 86], [86, 85], [85, 15], [129, 102], [102, 49], [49, 129], [14, 87], [87, 86], [86, 14], [55, 8], [8, 9], [9, 55], [100, 47], [47, 121], [121, 100], [145, 23], [23, 22], [22, 145], [88, 89], [89, 179], [179, 88], [6, 122], [122, 196], [196, 6], [88, 95], [95, 96], [96, 88], [138, 172], [172, 136], [136, 138], [215, 58], [58, 172], [172, 215], [115, 48], [48, 219], [219, 115], [42, 80], [80, 81], [81, 42], [195, 3], [3, 51], [51, 195], [43, 146], [146, 61], [61, 43], [171, 175], [175, 199], [199, 171], [81, 82], [82, 38], [38, 81], [53, 46], [46, 225], [225, 53], [144, 163], [163, 110], [110, 144], [52, 65], [65, 66], [66, 52], [229, 228], [228, 117], [117, 229], [34, 127], [127, 234], [234, 34], [107, 108], [108, 69], [69, 107], [109, 108], [108, 151], [151, 109], [48, 64], [64, 235], [235, 48], [62, 78], [78, 191], [191, 62], [129, 209], [209, 126], [126, 129], [111, 35], [35, 143], [143, 111], [117, 123], [123, 50], [50, 117], [222, 65], [65, 52], [52, 222], [19, 125], [125, 141], [141, 19], [221, 55], [55, 65], [65, 221], [3, 195], [195, 197], [197, 3], [25, 7], [7, 33], [33, 25], [220, 237], [237, 44], [44, 220], [70, 71], [71, 139], [139, 70], [122, 193], [193, 245], [245, 122], [247, 130], [130, 33], [33, 247], [71, 21], [21, 162], [162, 71], [170, 169], [169, 150], [150, 170], [188, 174], [174, 196], [196, 188], [216, 186], [186, 92], [92, 216], [2, 97], [97, 167], [167, 2], [141, 125], [125, 241], [241, 141], [164, 167], [167, 37], [37, 164], [72, 38], [38, 12], [12, 72], [38, 82], [82, 13], [13, 38], [63, 68], [68, 71], [71, 63], [226, 35], [35, 111], [111, 226], [101, 50], [50, 205], [205, 101], [206, 92], [92, 165], [165, 206], [209, 198], [198, 217], [217, 209], [165, 167], [167, 97], [97, 165], [220, 115], [115, 218], [218, 220], [133, 112], [112, 243], [243, 133], [239, 238], [238, 241], [241, 239], [214, 135], [135, 169], [169, 214], [190, 173], [173, 133], [133, 190], [171, 208], [208, 32], [32, 171], [125, 44], [44, 237], [237, 125], [86, 87], [87, 178], [178, 86], [85, 86], [86, 179], [179, 85], [84, 85], [85, 180], [180, 84], [83, 84], [84, 181], [181, 83], [201, 83], [83, 182], [182, 201], [137, 93], [93, 132], [132, 137], [76, 62], [62, 183], [183, 76], [61, 76], [76, 184], [184, 61], [57, 61], [61, 185], [185, 57], [212, 57], [57, 186], [186, 212], [214, 207], [207, 187], [187, 214], [34, 143], [143, 156], [156, 34], [79, 239], [239, 237], [237, 79], [123, 137], [137, 177], [177, 123], [44, 1], [1, 4], [4, 44], [201, 194], [194, 32], [32, 201], [64, 102], [102, 129], [129, 64], [213, 215], [215, 138], [138, 213], [59, 166], [166, 219], [219, 59], [242, 99], [99, 97], [97, 242], [2, 94], [94, 141], [141, 2], [75, 59], [59, 235], [235, 75], [24, 110], [110, 228], [228, 24], [25, 130], [130, 226], [226, 25], [23, 24], [24, 229], [229, 23], [22, 23], [23, 230], [230, 22], [26, 22], [22, 231], [231, 26], [112, 26], [26, 232], [232, 112], [189, 190], [190, 243], [243, 189], [221, 56], [56, 190], [190, 221], [28, 56], [56, 221], [221, 28], [27, 28], [28, 222], [222, 27], [29, 27], [27, 223], [223, 29], [30, 29], [29, 224], [224, 30], [247, 30], [30, 225], [225, 247], [238, 79], [79, 20], [20, 238], [166, 59], [59, 75], [75, 166], [60, 75], [75, 240], [240, 60], [147, 177], [177, 215], [215, 147], [20, 79], [79, 166], [166, 20], [187, 147], [147, 213], [213, 187], [112, 233], [233, 244], [244, 112], [233, 128], [128, 245], [245, 233], [128, 114], [114, 188], [188, 128], [114, 217], [217, 174], [174, 114], [131, 115], [115, 220], [220, 131], [217, 198], [198, 236], [236, 217], [198, 131], [131, 134], [134, 198], [177, 132], [132, 58], [58, 177], [143, 35], [35, 124], [124, 143], [110, 163], [163, 7], [7, 110], [228, 110], [110, 25], [25, 228], [356, 389], [389, 368], [368, 356], [11, 302], [302, 267], [267, 11], [452, 350], [350, 349], [349, 452], [302, 303], [303, 269], [269, 302], [357, 343], [343, 277], [277, 357], [452, 453], [453, 357], [357, 452], [333, 332], [332, 297], [297, 333], [175, 152], [152, 377], [377, 175], [347, 348], [348, 330], [330, 347], [303, 304], [304, 270], [270, 303], [9, 336], [336, 337], [337, 9], [278, 279], [279, 360], [360, 278], [418, 262], [262, 431], [431, 418], [304, 408], [408, 409], [409, 304], [310, 415], [415, 407], [407, 310], [270, 409], [409, 410], [410, 270], [450, 348], [348, 347], [347, 450], [422, 430], [430, 434], [434, 422], [313, 314], [314, 17], [17, 313], [306, 307], [307, 375], [375, 306], [387, 388], [388, 260], [260, 387], [286, 414], [414, 398], [398, 286], [335, 406], [406, 418], [418, 335], [364, 367], [367, 416], [416, 364], [423, 358], [358, 327], [327, 423], [251, 284], [284, 298], [298, 251], [281, 5], [5, 4], [4, 281], [373, 374], [374, 253], [253, 373], [307, 320], [320, 321], [321, 307], [425, 427], [427, 411], [411, 425], [421, 313], [313, 18], [18, 421], [321, 405], [405, 406], [406, 321], [320, 404], [404, 405], [405, 320], [315, 16], [16, 17], [17, 315], [426, 425], [425, 266], [266, 426], [377, 400], [400, 369], [369, 377], [322, 391], [391, 269], [269, 322], [417, 465], [465, 464], [464, 417], [386, 257], [257, 258], [258, 386], [466, 260], [260, 388], [388, 466], [456, 399], [399, 419], [419, 456], [284, 332], [332, 333], [333, 284], [417, 285], [285, 8], [8, 417], [346, 340], [340, 261], [261, 346], [413, 441], [441, 285], [285, 413], [327, 460], [460, 328], [328, 327], [355, 371], [371, 329], [329, 355], [392, 439], [439, 438], [438, 392], [382, 341], [341, 256], [256, 382], [429, 420], [420, 360], [360, 429], [364, 394], [394, 379], [379, 364], [277, 343], [343, 437], [437, 277], [443, 444], [444, 283], [283, 443], [275, 440], [440, 363], [363, 275], [431, 262], [262, 369], [369, 431], [297, 338], [338, 337], [337, 297], [273, 375], [375, 321], [321, 273], [450, 451], [451, 349], [349, 450], [446, 342], [342, 467], [467, 446], [293, 334], [334, 282], [282, 293], [458, 461], [461, 462], [462, 458], [276, 353], [353, 383], [383, 276], [308, 324], [324, 325], [325, 308], [276, 300], [300, 293], [293, 276], [372, 345], [345, 447], [447, 372], [352, 345], [345, 340], [340, 352], [274, 1], [1, 19], [19, 274], [456, 248], [248, 281], [281, 456], [436, 427], [427, 425], [425, 436], [381, 256], [256, 252], [252, 381], [269, 391], [391, 393], [393, 269], [200, 199], [199, 428], [428, 200], [266, 330], [330, 329], [329, 266], [287, 273], [273, 422], [422, 287], [250, 462], [462, 328], [328, 250], [258, 286], [286, 384], [384, 258], [265, 353], [353, 342], [342, 265], [387, 259], [259, 257], [257, 387], [424, 431], [431, 430], [430, 424], [342, 353], [353, 276], [276, 342], [273, 335], [335, 424], [424, 273], [292, 325], [325, 307], [307, 292], [366, 447], [447, 345], [345, 366], [271, 303], [303, 302], [302, 271], [423, 266], [266, 371], [371, 423], [294, 455], [455, 460], [460, 294], [279, 278], [278, 294], [294, 279], [271, 272], [272, 304], [304, 271], [432, 434], [434, 427], [427, 432], [272, 407], [407, 408], [408, 272], [394, 430], [430, 431], [431, 394], [395, 369], [369, 400], [400, 395], [334, 333], [333, 299], [299, 334], [351, 417], [417, 168], [168, 351], [352, 280], [280, 411], [411, 352], [325, 319], [319, 320], [320, 325], [295, 296], [296, 336], [336, 295], [319, 403], [403, 404], [404, 319], [330, 348], [348, 349], [349, 330], [293, 298], [298, 333], [333, 293], [323, 454], [454, 447], [447, 323], [15, 16], [16, 315], [315, 15], [358, 429], [429, 279], [279, 358], [14, 15], [15, 316], [316, 14], [285, 336], [336, 9], [9, 285], [329, 349], [349, 350], [350, 329], [374, 380], [380, 252], [252, 374], [318, 402], [402, 403], [403, 318], [6, 197], [197, 419], [419, 6], [318, 319], [319, 325], [325, 318], [367, 364], [364, 365], [365, 367], [435, 367], [367, 397], [397, 435], [344, 438], [438, 439], [439, 344], [272, 271], [271, 311], [311, 272], [195, 5], [5, 281], [281, 195], [273, 287], [287, 291], [291, 273], [396, 428], [428, 199], [199, 396], [311, 271], [271, 268], [268, 311], [283, 444], [444, 445], [445, 283], [373, 254], [254, 339], [339, 373], [282, 334], [334, 296], [296, 282], [449, 347], [347, 346], [346, 449], [264, 447], [447, 454], [454, 264], [336, 296], [296, 299], [299, 336], [338, 10], [10, 151], [151, 338], [278, 439], [439, 455], [455, 278], [292, 407], [407, 415], [415, 292], [358, 371], [371, 355], [355, 358], [340, 345], [345, 372], [372, 340], [346, 347], [347, 280], [280, 346], [442, 443], [443, 282], [282, 442], [19, 94], [94, 370], [370, 19], [441, 442], [442, 295], [295, 441], [248, 419], [419, 197], [197, 248], [263, 255], [255, 359], [359, 263], [440, 275], [275, 274], [274, 440], [300, 383], [383, 368], [368, 300], [351, 412], [412, 465], [465, 351], [263, 467], [467, 466], [466, 263], [301, 368], [368, 389], [389, 301], [395, 378], [378, 379], [379, 395], [412, 351], [351, 419], [419, 412], [436, 426], [426, 322], [322, 436], [2, 164], [164, 393], [393, 2], [370, 462], [462, 461], [461, 370], [164, 0], [0, 267], [267, 164], [302, 11], [11, 12], [12, 302], [268, 12], [12, 13], [13, 268], [293, 300], [300, 301], [301, 293], [446, 261], [261, 340], [340, 446], [330, 266], [266, 425], [425, 330], [426, 423], [423, 391], [391, 426], [429, 355], [355, 437], [437, 429], [391, 327], [327, 326], [326, 391], [440, 457], [457, 438], [438, 440], [341, 382], [382, 362], [362, 341], [459, 457], [457, 461], [461, 459], [434, 430], [430, 394], [394, 434], [414, 463], [463, 362], [362, 414], [396, 369], [369, 262], [262, 396], [354, 461], [461, 457], [457, 354], [316, 403], [403, 402], [402, 316], [315, 404], [404, 403], [403, 315], [314, 405], [405, 404], [404, 314], [313, 406], [406, 405], [405, 313], [421, 418], [418, 406], [406, 421], [366, 401], [401, 361], [361, 366], [306, 408], [408, 407], [407, 306], [291, 409], [409, 408], [408, 291], [287, 410], [410, 409], [409, 287], [432, 436], [436, 410], [410, 432], [434, 416], [416, 411], [411, 434], [264, 368], [368, 383], [383, 264], [309, 438], [438, 457], [457, 309], [352, 376], [376, 401], [401, 352], [274, 275], [275, 4], [4, 274], [421, 428], [428, 262], [262, 421], [294, 327], [327, 358], [358, 294], [433, 416], [416, 367], [367, 433], [289, 455], [455, 439], [439, 289], [462, 370], [370, 326], [326, 462], [2, 326], [326, 370], [370, 2], [305, 460], [460, 455], [455, 305], [254, 449], [449, 448], [448, 254], [255, 261], [261, 446], [446, 255], [253, 450], [450, 449], [449, 253], [252, 451], [451, 450], [450, 252], [256, 452], [452, 451], [451, 256], [341, 453], [453, 452], [452, 341], [413, 464], [464, 463], [463, 413], [441, 413], [413, 414], [414, 441], [258, 442], [442, 441], [441, 258], [257, 443], [443, 442], [442, 257], [259, 444], [444, 443], [443, 259], [260, 445], [445, 444], [444, 260], [467, 342], [342, 445], [445, 467], [459, 458], [458, 250], [250, 459], [289, 392], [392, 290], [290, 289], [290, 328], [328, 460], [460, 290], [376, 433], [433, 435], [435, 376], [250, 290], [290, 392], [392, 250], [411, 416], [416, 433], [433, 411], [341, 463], [463, 464], [464, 341], [453, 464], [464, 465], [465, 453], [357, 465], [465, 412], [412, 357], [343, 412], [412, 399], [399, 343], [360, 363], [363, 440], [440, 360], [437, 399], [399, 456], [456, 437], [420, 456], [456, 363], [363, 420], [401, 435], [435, 288], [288, 401], [372, 383], [383, 353], [353, 372], [339, 255], [255, 249], [249, 339], [448, 261], [261, 255], [255, 448], [133, 243], [243, 190], [190, 133], [133, 155], [155, 112], [112, 133], [33, 246], [246, 247], [247, 33], [33, 130], [130, 25], [25, 33], [398, 384], [384, 286], [286, 398], [362, 398], [398, 414], [414, 362], [362, 463], [463, 341], [341, 362], [263, 359], [359, 467], [467, 263], [263, 249], [249, 255], [255, 263], [466, 467], [467, 260], [260, 466], [75, 60], [60, 166], [166, 75], [238, 239], [239, 79], [79, 238], [162, 127], [127, 139], [139, 162], [72, 11], [11, 37], [37, 72], [121, 232], [232, 120], [120, 121], [73, 72], [72, 39], [39, 73], [114, 128], [128, 47], [47, 114], [233, 232], [232, 128], [128, 233], [103, 104], [104, 67], [67, 103], [152, 175], [175, 148], [148, 152], [119, 118], [118, 101], [101, 119], [74, 73], [73, 40], [40, 74], [107, 9], [9, 108], [108, 107], [49, 48], [48, 131], [131, 49], [32, 194], [194, 211], [211, 32], [184, 74], [74, 185], [185, 184], [191, 80], [80, 183], [183, 191], [185, 40], [40, 186], [186, 185], [119, 230], [230, 118], [118, 119], [210, 202], [202, 214], [214, 210], [84, 83], [83, 17], [17, 84], [77, 76], [76, 146], [146, 77], [161, 160], [160, 30], [30, 161], [190, 56], [56, 173], [173, 190], [182, 106], [106, 194], [194, 182], [138, 135], [135, 192], [192, 138], [129, 203], [203, 98], [98, 129], [54, 21], [21, 68], [68, 54], [5, 51], [51, 4], [4, 5], [145, 144], [144, 23], [23, 145], [90, 77], [77, 91], [91, 90], [207, 205], [205, 187], [187, 207], [83, 201], [201, 18], [18, 83], [181, 91], [91, 182], [182, 181], [180, 90], [90, 181], [181, 180], [16, 85], [85, 17], [17, 16], [205, 206], [206, 36], [36, 205], [176, 148], [148, 140], [140, 176], [165, 92], [92, 39], [39, 165], [245, 193], [193, 244], [244, 245], [27, 159], [159, 28], [28, 27], [30, 247], [247, 161], [161, 30], [174, 236], [236, 196], [196, 174], [103, 54], [54, 104], [104, 103], [55, 193], [193, 8], [8, 55], [111, 117], [117, 31], [31, 111], [221, 189], [189, 55], [55, 221], [240, 98], [98, 99], [99, 240], [142, 126], [126, 100], [100, 142], [219, 166], [166, 218], [218, 219], [112, 155], [155, 26], [26, 112], [198, 209], [209, 131], [131, 198], [169, 135], [135, 150], [150, 169], [114, 47], [47, 217], [217, 114], [224, 223], [223, 53], [53, 224], [220, 45], [45, 134], [134, 220], [32, 211], [211, 140], [140, 32], [109, 67], [67, 108], [108, 109], [146, 43], [43, 91], [91, 146], [231, 230], [230, 120], [120, 231], [113, 226], [226, 247], [247, 113], [105, 63], [63, 52], [52, 105], [241, 238], [238, 242], [242, 241], [124, 46], [46, 156], [156, 124], [95, 78], [78, 96], [96, 95], [70, 46], [46, 63], [63, 70], [116, 143], [143, 227], [227, 116], [116, 123], [123, 111], [111, 116], [1, 44], [44, 19], [19, 1], [3, 236], [236, 51], [51, 3], [207, 216], [216, 205], [205, 207], [26, 154], [154, 22], [22, 26], [165, 39], [39, 167], [167, 165], [199, 200], [200, 208], [208, 199], [101, 36], [36, 100], [100, 101], [43, 57], [57, 202], [202, 43], [242, 20], [20, 99], [99, 242], [56, 28], [28, 157], [157, 56], [124, 35], [35, 113], [113, 124], [29, 160], [160, 27], [27, 29], [211, 204], [204, 210], [210, 211], [124, 113], [113, 46], [46, 124], [106, 43], [43, 204], [204, 106], [96, 62], [62, 77], [77, 96], [227, 137], [137, 116], [116, 227], [73, 41], [41, 72], [72, 73], [36, 203], [203, 142], [142, 36], [235, 64], [64, 240], [240, 235], [48, 49], [49, 64], [64, 48], [42, 41], [41, 74], [74, 42], [214, 212], [212, 207], [207, 214], [183, 42], [42, 184], [184, 183], [210, 169], [169, 211], [211, 210], [140, 170], [170, 176], [176, 140], [104, 105], [105, 69], [69, 104], [193, 122], [122, 168], [168, 193], [50, 123], [123, 187], [187, 50], [89, 96], [96, 90], [90, 89], [66, 65], [65, 107], [107, 66], [179, 89], [89, 180], [180, 179], [119, 101], [101, 120], [120, 119], [68, 63], [63, 104], [104, 68], [234, 93], [93, 227], [227, 234], [16, 15], [15, 85], [85, 16], [209, 129], [129, 49], [49, 209], [15, 14], [14, 86], [86, 15], [107, 55], [55, 9], [9, 107], [120, 100], [100, 121], [121, 120], [153, 145], [145, 22], [22, 153], [178, 88], [88, 179], [179, 178], [197, 6], [6, 196], [196, 197], [89, 88], [88, 96], [96, 89], [135, 138], [138, 136], [136, 135], [138, 215], [215, 172], [172, 138], [218, 115], [115, 219], [219, 218], [41, 42], [42, 81], [81, 41], [5, 195], [195, 51], [51, 5], [57, 43], [43, 61], [61, 57], [208, 171], [171, 199], [199, 208], [41, 81], [81, 38], [38, 41], [224, 53], [53, 225], [225, 224], [24, 144], [144, 110], [110, 24], [105, 52], [52, 66], [66, 105], [118, 229], [229, 117], [117, 118], [227, 34], [34, 234], [234, 227], [66, 107], [107, 69], [69, 66], [10, 109], [109, 151], [151, 10], [219, 48], [48, 235], [235, 219], [183, 62], [62, 191], [191, 183], [142, 129], [129, 126], [126, 142], [116, 111], [111, 143], [143, 116], [118, 117], [117, 50], [50, 118], [223, 222], [222, 52], [52, 223], [94, 19], [19, 141], [141, 94], [222, 221], [221, 65], [65, 222], [196, 3], [3, 197], [197, 196], [45, 220], [220, 44], [44, 45], [156, 70], [70, 139], [139, 156], [188, 122], [122, 245], [245, 188], [139, 71], [71, 162], [162, 139], [149, 170], [170, 150], [150, 149], [122, 188], [188, 196], [196, 122], [206, 216], [216, 92], [92, 206], [164, 2], [2, 167], [167, 164], [242, 141], [141, 241], [241, 242], [0, 164], [164, 37], [37, 0], [11, 72], [72, 12], [12, 11], [12, 38], [38, 13], [13, 12], [70, 63], [63, 71], [71, 70], [31, 226], [226, 111], [111, 31], [36, 101], [101, 205], [205, 36], [203, 206], [206, 165], [165, 203], [126, 209], [209, 217], [217, 126], [98, 165], [165, 97], [97, 98], [237, 220], [220, 218], [218, 237], [237, 239], [239, 241], [241, 237], [210, 214], [214, 169], [169, 210], [140, 171], [171, 32], [32, 140], [241, 125], [125, 237], [237, 241], [179, 86], [86, 178], [178, 179], [180, 85], [85, 179], [179, 180], [181, 84], [84, 180], [180, 181], [182, 83], [83, 181], [181, 182], [194, 201], [201, 182], [182, 194], [177, 137], [137, 132], [132, 177], [184, 76], [76, 183], [183, 184], [185, 61], [61, 184], [184, 185], [186, 57], [57, 185], [185, 186], [216, 212], [212, 186], [186, 216], [192, 214], [214, 187], [187, 192], [139, 34], [34, 156], [156, 139], [218, 79], [79, 237], [237, 218], [147, 123], [123, 177], [177, 147], [45, 44], [44, 4], [4, 45], [208, 201], [201, 32], [32, 208], [98, 64], [64, 129], [129, 98], [192, 213], [213, 138], [138, 192], [235, 59], [59, 219], [219, 235], [141, 242], [242, 97], [97, 141], [97, 2], [2, 141], [141, 97], [240, 75], [75, 235], [235, 240], [229, 24], [24, 228], [228, 229], [31, 25], [25, 226], [226, 31], [230, 23], [23, 229], [229, 230], [231, 22], [22, 230], [230, 231], [232, 26], [26, 231], [231, 232], [233, 112], [112, 232], [232, 233], [244, 189], [189, 243], [243, 244], [189, 221], [221, 190], [190, 189], [222, 28], [28, 221], [221, 222], [223, 27], [27, 222], [222, 223], [224, 29], [29, 223], [223, 224], [225, 30], [30, 224], [224, 225], [113, 247], [247, 225], [225, 113], [99, 60], [60, 240], [240, 99], [213, 147], [147, 215], [215, 213], [60, 20], [20, 166], [166, 60], [192, 187], [187, 213], [213, 192], [243, 112], [112, 244], [244, 243], [244, 233], [233, 245], [245, 244], [245, 128], [128, 188], [188, 245], [188, 114], [114, 174], [174, 188], [134, 131], [131, 220], [220, 134], [174, 217], [217, 236], [236, 174], [236, 198], [198, 134], [134, 236], [215, 177], [177, 58], [58, 215], [156, 143], [143, 124], [124, 156], [25, 110], [110, 7], [7, 25], [31, 228], [228, 25], [25, 31], [264, 356], [356, 368], [368, 264], [0, 11], [11, 267], [267, 0], [451, 452], [452, 349], [349, 451], [267, 302], [302, 269], [269, 267], [350, 357], [357, 277], [277, 350], [350, 452], [452, 357], [357, 350], [299, 333], [333, 297], [297, 299], [396, 175], [175, 377], [377, 396], [280, 347], [347, 330], [330, 280], [269, 303], [303, 270], [270, 269], [151, 9], [9, 337], [337, 151], [344, 278], [278, 360], [360, 344], [424, 418], [418, 431], [431, 424], [270, 304], [304, 409], [409, 270], [272, 310], [310, 407], [407, 272], [322, 270], [270, 410], [410, 322], [449, 450], [450, 347], [347, 449], [432, 422], [422, 434], [434, 432], [18, 313], [313, 17], [17, 18], [291, 306], [306, 375], [375, 291], [259, 387], [387, 260], [260, 259], [424, 335], [335, 418], [418, 424], [434, 364], [364, 416], [416, 434], [391, 423], [423, 327], [327, 391], [301, 251], [251, 298], [298, 301], [275, 281], [281, 4], [4, 275], [254, 373], [373, 253], [253, 254], [375, 307], [307, 321], [321, 375], [280, 425], [425, 411], [411, 280], [200, 421], [421, 18], [18, 200], [335, 321], [321, 406], [406, 335], [321, 320], [320, 405], [405, 321], [314, 315], [315, 17], [17, 314], [423, 426], [426, 266], [266, 423], [396, 377], [377, 369], [369, 396], [270, 322], [322, 269], [269, 270], [413, 417], [417, 464], [464, 413], [385, 386], [386, 258], [258, 385], [248, 456], [456, 419], [419, 248], [298, 284], [284, 333], [333, 298], [168, 417], [417, 8], [8, 168], [448, 346], [346, 261], [261, 448], [417, 413], [413, 285], [285, 417], [326, 327], [327, 328], [328, 326], [277, 355], [355, 329], [329, 277], [309, 392], [392, 438], [438, 309], [381, 382], [382, 256], [256, 381], [279, 429], [429, 360], [360, 279], [365, 364], [364, 379], [379, 365], [355, 277], [277, 437], [437, 355], [282, 443], [443, 283], [283, 282], [281, 275], [275, 363], [363, 281], [395, 431], [431, 369], [369, 395], [299, 297], [297, 337], [337, 299], [335, 273], [273, 321], [321, 335], [348, 450], [450, 349], [349, 348], [359, 446], [446, 467], [467, 359], [283, 293], [293, 282], [282, 283], [250, 458], [458, 462], [462, 250], [300, 276], [276, 383], [383, 300], [292, 308], [308, 325], [325, 292], [283, 276], [276, 293], [293, 283], [264, 372], [372, 447], [447, 264], [346, 352], [352, 340], [340, 346], [354, 274], [274, 19], [19, 354], [363, 456], [456, 281], [281, 363], [426, 436], [436, 425], [425, 426], [380, 381], [381, 252], [252, 380], [267, 269], [269, 393], [393, 267], [421, 200], [200, 428], [428, 421], [371, 266], [266, 329], [329, 371], [432, 287], [287, 422], [422, 432], [290, 250], [250, 328], [328, 290], [385, 258], [258, 384], [384, 385], [446, 265], [265, 342], [342, 446], [386, 387], [387, 257], [257, 386], [422, 424], [424, 430], [430, 422], [445, 342], [342, 276], [276, 445], [422, 273], [273, 424], [424, 422], [306, 292], [292, 307], [307, 306], [352, 366], [366, 345], [345, 352], [268, 271], [271, 302], [302, 268], [358, 423], [423, 371], [371, 358], [327, 294], [294, 460], [460, 327], [331, 279], [279, 294], [294, 331], [303, 271], [271, 304], [304, 303], [436, 432], [432, 427], [427, 436], [304, 272], [272, 408], [408, 304], [395, 394], [394, 431], [431, 395], [378, 395], [395, 400], [400, 378], [296, 334], [334, 299], [299, 296], [6, 351], [351, 168], [168, 6], [376, 352], [352, 411], [411, 376], [307, 325], [325, 320], [320, 307], [285, 295], [295, 336], [336, 285], [320, 319], [319, 404], [404, 320], [329, 330], [330, 349], [349, 329], [334, 293], [293, 333], [333, 334], [366, 323], [323, 447], [447, 366], [316, 15], [15, 315], [315, 316], [331, 358], [358, 279], [279, 331], [317, 14], [14, 316], [316, 317], [8, 285], [285, 9], [9, 8], [277, 329], [329, 350], [350, 277], [253, 374], [374, 252], [252, 253], [319, 318], [318, 403], [403, 319], [351, 6], [6, 419], [419, 351], [324, 318], [318, 325], [325, 324], [397, 367], [367, 365], [365, 397], [288, 435], [435, 397], [397, 288], [278, 344], [344, 439], [439, 278], [310, 272], [272, 311], [311, 310], [248, 195], [195, 281], [281, 248], [375, 273], [273, 291], [291, 375], [175, 396], [396, 199], [199, 175], [312, 311], [311, 268], [268, 312], [276, 283], [283, 445], [445, 276], [390, 373], [373, 339], [339, 390], [295, 282], [282, 296], [296, 295], [448, 449], [449, 346], [346, 448], [356, 264], [264, 454], [454, 356], [337, 336], [336, 299], [299, 337], [337, 338], [338, 151], [151, 337], [294, 278], [278, 455], [455, 294], [308, 292], [292, 415], [415, 308], [429, 358], [358, 355], [355, 429], [265, 340], [340, 372], [372, 265], [352, 346], [346, 280], [280, 352], [295, 442], [442, 282], [282, 295], [354, 19], [19, 370], [370, 354], [285, 441], [441, 295], [295, 285], [195, 248], [248, 197], [197, 195], [457, 440], [440, 274], [274, 457], [301, 300], [300, 368], [368, 301], [417, 351], [351, 465], [465, 417], [251, 301], [301, 389], [389, 251], [394, 395], [395, 379], [379, 394], [399, 412], [412, 419], [419, 399], [410, 436], [436, 322], [322, 410], [326, 2], [2, 393], [393, 326], [354, 370], [370, 461], [461, 354], [393, 164], [164, 267], [267, 393], [268, 302], [302, 12], [12, 268], [312, 268], [268, 13], [13, 312], [298, 293], [293, 301], [301, 298], [265, 446], [446, 340], [340, 265], [280, 330], [330, 425], [425, 280], [322, 426], [426, 391], [391, 322], [420, 429], [429, 437], [437, 420], [393, 391], [391, 326], [326, 393], [344, 440], [440, 438], [438, 344], [458, 459], [459, 461], [461, 458], [364, 434], [434, 394], [394, 364], [428, 396], [396, 262], [262, 428], [274, 354], [354, 457], [457, 274], [317, 316], [316, 402], [402, 317], [316, 315], [315, 403], [403, 316], [315, 314], [314, 404], [404, 315], [314, 313], [313, 405], [405, 314], [313, 421], [421, 406], [406, 313], [323, 366], [366, 361], [361, 323], [292, 306], [306, 407], [407, 292], [306, 291], [291, 408], [408, 306], [291, 287], [287, 409], [409, 291], [287, 432], [432, 410], [410, 287], [427, 434], [434, 411], [411, 427], [372, 264], [264, 383], [383, 372], [459, 309], [309, 457], [457, 459], [366, 352], [352, 401], [401, 366], [1, 274], [274, 4], [4, 1], [418, 421], [421, 262], [262, 418], [331, 294], [294, 358], [358, 331], [435, 433], [433, 367], [367, 435], [392, 289], [289, 439], [439, 392], [328, 462], [462, 326], [326, 328], [94, 2], [2, 370], [370, 94], [289, 305], [305, 455], [455, 289], [339, 254], [254, 448], [448, 339], [359, 255], [255, 446], [446, 359], [254, 253], [253, 449], [449, 254], [253, 252], [252, 450], [450, 253], [252, 256], [256, 451], [451, 252], [256, 341], [341, 452], [452, 256], [414, 413], [413, 463], [463, 414], [286, 441], [441, 414], [414, 286], [286, 258], [258, 441], [441, 286], [258, 257], [257, 442], [442, 258], [257, 259], [259, 443], [443, 257], [259, 260], [260, 444], [444, 259], [260, 467], [467, 445], [445, 260], [309, 459], [459, 250], [250, 309], [305, 289], [289, 290], [290, 305], [305, 290], [290, 460], [460, 305], [401, 376], [376, 435], [435, 401], [309, 250], [250, 392], [392, 309], [376, 411], [411, 433], [433, 376], [453, 341], [341, 464], [464, 453], [357, 453], [453, 465], [465, 357], [343, 357], [357, 412], [412, 343], [437, 343], [343, 399], [399, 437], [344, 360], [360, 440], [440, 344], [420, 437], [437, 456], [456, 420], [360, 420], [420, 363], [363, 360], [361, 401], [401, 288], [288, 361], [265, 372], [372, 353], [353, 265], [390, 339], [339, 249], [249, 390], [339, 448], [448, 255], [255, 339]);
function wl(e) {
	e.j = {
		faceLandmarks: [],
		faceBlendshapes: [],
		facialTransformationMatrixes: []
	};
}
var Z = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect", !1), this.j = {
			faceLandmarks: [],
			faceBlendshapes: [],
			facialTransformationMatrixes: []
		}, this.outputFacialTransformationMatrixes = this.outputFaceBlendshapes = !1, j(e = this.h = new ts(), 0, 1, t = new G()), this.A = new es(), j(this.h, 0, 3, this.A), this.u = new Xo(), j(this.h, 0, 2, this.u), Wr(this.u, 4, 1), N(this.u, 2, .5), N(this.A, 2, .5), N(this.h, 4, .5);
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return "numFaces" in e && Wr(this.u, 4, e.numFaces ?? 1), "minFaceDetectionConfidence" in e && N(this.u, 2, e.minFaceDetectionConfidence ?? .5), "minTrackingConfidence" in e && N(this.h, 4, e.minTrackingConfidence ?? .5), "minFacePresenceConfidence" in e && N(this.A, 2, e.minFacePresenceConfidence ?? .5), "outputFaceBlendshapes" in e && (this.outputFaceBlendshapes = !!e.outputFaceBlendshapes), "outputFacialTransformationMatrixes" in e && (this.outputFacialTransformationMatrixes = !!e.outputFacialTransformationMatrixes), this.l(e);
	}
	F(e, t) {
		return wl(this), ll(this, e, t), this.j;
	}
	G(e, t, n) {
		return wl(this), ul(this, e, n, t), this.j;
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect"), W(e, "face_landmarks");
		let t = new lo();
		Ui(t, rs, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.face_landmarker.FaceLandmarkerGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect"), H(n, "NORM_LANDMARKS:face_landmarks"), n.o(t), go(e, n), this.g.attachProtoVectorListener("face_landmarks", ((e, t) => {
			for (let t of e) e = jo(t), this.j.faceLandmarks.push(qs(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("face_landmarks", ((e) => {
			J(this, e);
		})), this.outputFaceBlendshapes && (W(e, "blendshapes"), H(n, "BLENDSHAPES:blendshapes"), this.g.attachProtoVectorListener("blendshapes", ((e, t) => {
			if (this.outputFaceBlendshapes) for (let t of e) e = Co(t), this.j.faceBlendshapes.push(Ws(e.g() ?? []));
			J(this, t);
		})), this.g.attachEmptyPacketListener("blendshapes", ((e) => {
			J(this, e);
		}))), this.outputFacialTransformationMatrixes && (W(e, "face_geometry"), H(n, "FACE_GEOMETRY:face_geometry"), this.g.attachProtoVectorListener("face_geometry", ((e, t) => {
			if (this.outputFacialTransformationMatrixes) for (let t of e) (e = A(e = $o(t), Mo, 2)) && this.j.facialTransformationMatrixes.push({
				rows: Ur(e, 1) ?? 0 ?? 0,
				columns: Ur(e, 2) ?? 0 ?? 0,
				data: Sr(e, 3, bn, xr()).slice() ?? []
			});
			J(this, t);
		})), this.g.attachEmptyPacketListener("face_geometry", ((e) => {
			J(this, e);
		}))), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Z.prototype.detectForVideo = Z.prototype.G, Z.prototype.detect = Z.prototype.F, Z.prototype.setOptions = Z.prototype.o, Z.createFromModelPath = function(e, t) {
	return X(Z, e, { baseOptions: { modelAssetPath: t } });
}, Z.createFromModelBuffer = function(e, t) {
	return X(Z, e, { baseOptions: { modelAssetBuffer: t } });
}, Z.createFromOptions = function(e, t) {
	return X(Z, e, t);
}, Z.FACE_LANDMARKS_LIPS = ml, Z.FACE_LANDMARKS_LEFT_EYE = hl, Z.FACE_LANDMARKS_LEFT_EYEBROW = gl, Z.FACE_LANDMARKS_LEFT_IRIS = _l, Z.FACE_LANDMARKS_RIGHT_EYE = vl, Z.FACE_LANDMARKS_RIGHT_EYEBROW = yl, Z.FACE_LANDMARKS_RIGHT_IRIS = bl, Z.FACE_LANDMARKS_FACE_OVAL = xl, Z.FACE_LANDMARKS_CONTOURS = Sl, Z.FACE_LANDMARKS_TESSELATION = Cl;
var Tl = il([0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]);
function El(e) {
	e.gestures = [], e.landmarks = [], e.worldLandmarks = [], e.handedness = [];
}
function Dl(e) {
	return e.gestures.length === 0 ? {
		gestures: [],
		landmarks: [],
		worldLandmarks: [],
		handedness: [],
		handednesses: []
	} : {
		gestures: e.gestures,
		landmarks: e.landmarks,
		worldLandmarks: e.worldLandmarks,
		handedness: e.handedness,
		handednesses: e.handedness
	};
}
function Ol(e, t = !0) {
	let n = [];
	for (let i of e) {
		var r = Co(i);
		e = [];
		for (let n of r.g()) r = t && Ur(n, 1) != null ? Ur(n, 1) ?? 0 : -1, e.push({
			score: M(n, 2) ?? 0,
			index: r,
			categoryName: Fn(D(n, 3)) ?? "" ?? "",
			displayName: Fn(D(n, 4)) ?? "" ?? ""
		});
		n.push(e);
	}
	return n;
}
var kl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect", !1), this.gestures = [], this.landmarks = [], this.worldLandmarks = [], this.handedness = [], j(e = this.j = new us(), 0, 1, t = new G()), this.u = new ls(), j(this.j, 0, 2, this.u), this.D = new cs(), j(this.u, 0, 3, this.D), this.A = new ss(), j(this.u, 0, 2, this.A), this.h = new os(), j(this.j, 0, 3, this.h), N(this.A, 2, .5), N(this.u, 4, .5), N(this.D, 2, .5);
	}
	get baseOptions() {
		return A(this.j, G, 1);
	}
	set baseOptions(e) {
		j(this.j, 0, 1, e);
	}
	o(e) {
		if (Wr(this.A, 3, e.numHands ?? 1), "minHandDetectionConfidence" in e && N(this.A, 2, e.minHandDetectionConfidence ?? .5), "minTrackingConfidence" in e && N(this.u, 4, e.minTrackingConfidence ?? .5), "minHandPresenceConfidence" in e && N(this.D, 2, e.minHandPresenceConfidence ?? .5), e.cannedGesturesClassifierOptions) {
			var t = new is(), n = t, r = Hs(e.cannedGesturesClassifierOptions, A(this.h, is, 3)?.l());
			j(n, 0, 2, r), j(this.h, 0, 3, t);
		} else e.cannedGesturesClassifierOptions === void 0 && A(this.h, is, 3)?.g();
		return e.customGesturesClassifierOptions ? (j(n = t = new is(), 0, 2, r = Hs(e.customGesturesClassifierOptions, A(this.h, is, 4)?.l())), j(this.h, 0, 4, t)) : e.customGesturesClassifierOptions === void 0 && A(this.h, is, 4)?.g(), this.l(e);
	}
	Ha(e, t) {
		return El(this), ll(this, e, t), Dl(this);
	}
	Ia(e, t, n) {
		return El(this), ul(this, e, n, t), Dl(this);
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect"), W(e, "hand_gestures"), W(e, "hand_landmarks"), W(e, "world_hand_landmarks"), W(e, "handedness");
		let t = new lo();
		Ui(t, hs, this.j);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.gesture_recognizer.GestureRecognizerGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect"), H(n, "HAND_GESTURES:hand_gestures"), H(n, "LANDMARKS:hand_landmarks"), H(n, "WORLD_LANDMARKS:world_hand_landmarks"), H(n, "HANDEDNESS:handedness"), n.o(t), go(e, n), this.g.attachProtoVectorListener("hand_landmarks", ((e, t) => {
			for (let t of e) {
				e = jo(t);
				let n = [];
				for (let t of Rr(e, Ao, 1)) n.push({
					x: M(t, 1) ?? 0,
					y: M(t, 2) ?? 0,
					z: M(t, 3) ?? 0,
					visibility: M(t, 4) ?? 0
				});
				this.landmarks.push(n);
			}
			J(this, t);
		})), this.g.attachEmptyPacketListener("hand_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoVectorListener("world_hand_landmarks", ((e, t) => {
			for (let t of e) {
				e = ko(t);
				let n = [];
				for (let t of Rr(e, Oo, 1)) n.push({
					x: M(t, 1) ?? 0,
					y: M(t, 2) ?? 0,
					z: M(t, 3) ?? 0,
					visibility: M(t, 4) ?? 0
				});
				this.worldLandmarks.push(n);
			}
			J(this, t);
		})), this.g.attachEmptyPacketListener("world_hand_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoVectorListener("hand_gestures", ((e, t) => {
			this.gestures.push(...Ol(e, !1)), J(this, t);
		})), this.g.attachEmptyPacketListener("hand_gestures", ((e) => {
			J(this, e);
		})), this.g.attachProtoVectorListener("handedness", ((e, t) => {
			this.handedness.push(...Ol(e)), J(this, t);
		})), this.g.attachEmptyPacketListener("handedness", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
function Al(e) {
	return {
		landmarks: e.landmarks,
		worldLandmarks: e.worldLandmarks,
		handednesses: e.handedness,
		handedness: e.handedness
	};
}
kl.prototype.recognizeForVideo = kl.prototype.Ia, kl.prototype.recognize = kl.prototype.Ha, kl.prototype.setOptions = kl.prototype.o, kl.createFromModelPath = function(e, t) {
	return X(kl, e, { baseOptions: { modelAssetPath: t } });
}, kl.createFromModelBuffer = function(e, t) {
	return X(kl, e, { baseOptions: { modelAssetBuffer: t } });
}, kl.createFromOptions = function(e, t) {
	return X(kl, e, t);
}, kl.HAND_CONNECTIONS = Tl;
var jl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect", !1), this.landmarks = [], this.worldLandmarks = [], this.handedness = [], j(e = this.h = new ls(), 0, 1, t = new G()), this.u = new cs(), j(this.h, 0, 3, this.u), this.j = new ss(), j(this.h, 0, 2, this.j), Wr(this.j, 3, 1), N(this.j, 2, .5), N(this.u, 2, .5), N(this.h, 4, .5);
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return "numHands" in e && Wr(this.j, 3, e.numHands ?? 1), "minHandDetectionConfidence" in e && N(this.j, 2, e.minHandDetectionConfidence ?? .5), "minTrackingConfidence" in e && N(this.h, 4, e.minTrackingConfidence ?? .5), "minHandPresenceConfidence" in e && N(this.u, 2, e.minHandPresenceConfidence ?? .5), this.l(e);
	}
	F(e, t) {
		return this.landmarks = [], this.worldLandmarks = [], this.handedness = [], ll(this, e, t), Al(this);
	}
	G(e, t, n) {
		return this.landmarks = [], this.worldLandmarks = [], this.handedness = [], ul(this, e, n, t), Al(this);
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect"), W(e, "hand_landmarks"), W(e, "world_hand_landmarks"), W(e, "handedness");
		let t = new lo();
		Ui(t, gs, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.hand_landmarker.HandLandmarkerGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect"), H(n, "LANDMARKS:hand_landmarks"), H(n, "WORLD_LANDMARKS:world_hand_landmarks"), H(n, "HANDEDNESS:handedness"), n.o(t), go(e, n), this.g.attachProtoVectorListener("hand_landmarks", ((e, t) => {
			for (let t of e) e = jo(t), this.landmarks.push(qs(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("hand_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoVectorListener("world_hand_landmarks", ((e, t) => {
			for (let t of e) e = ko(t), this.worldLandmarks.push(Js(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("world_hand_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoVectorListener("handedness", ((e, t) => {
			var n = this.handedness, r = n.push;
			let i = [];
			for (let t of e) {
				e = Co(t);
				let n = [];
				for (let t of e.g()) n.push({
					score: M(t, 2) ?? 0,
					index: Ur(t, 1) ?? 0 ?? -1,
					categoryName: Fn(D(t, 3)) ?? "" ?? "",
					displayName: Fn(D(t, 4)) ?? "" ?? ""
				});
				i.push(n);
			}
			r.call(n, ...i), J(this, t);
		})), this.g.attachEmptyPacketListener("handedness", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
jl.prototype.detectForVideo = jl.prototype.G, jl.prototype.detect = jl.prototype.F, jl.prototype.setOptions = jl.prototype.o, jl.createFromModelPath = function(e, t) {
	return X(jl, e, { baseOptions: { modelAssetPath: t } });
}, jl.createFromModelBuffer = function(e, t) {
	return X(jl, e, { baseOptions: { modelAssetBuffer: t } });
}, jl.createFromOptions = function(e, t) {
	return X(jl, e, t);
}, jl.HAND_CONNECTIONS = Tl;
var Ml = il([0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]);
function Nl(e) {
	e.h = {
		faceLandmarks: [],
		faceBlendshapes: [],
		poseLandmarks: [],
		poseWorldLandmarks: [],
		poseSegmentationMasks: [],
		leftHandLandmarks: [],
		leftHandWorldLandmarks: [],
		rightHandLandmarks: [],
		rightHandWorldLandmarks: []
	};
}
function Pl(e) {
	try {
		if (!e.D) return e.h;
		e.D(e.h);
	} finally {
		mc(e);
	}
}
function Fl(e, t) {
	e = jo(e), t.push(qs(e));
}
var Q = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "input_frames_image", null, !1), this.h = {
			faceLandmarks: [],
			faceBlendshapes: [],
			poseLandmarks: [],
			poseWorldLandmarks: [],
			poseSegmentationMasks: [],
			leftHandLandmarks: [],
			leftHandWorldLandmarks: [],
			rightHandLandmarks: [],
			rightHandWorldLandmarks: []
		}, this.outputPoseSegmentationMasks = this.outputFaceBlendshapes = !1, j(e = this.j = new bs(), 0, 1, t = new G()), this.I = new cs(), j(this.j, 0, 2, this.I), this.W = new _s(), j(this.j, 0, 3, this.W), this.u = new Xo(), j(this.j, 0, 4, this.u), this.O = new es(), j(this.j, 0, 5, this.O), this.A = new vs(), j(this.j, 0, 6, this.A), this.M = new ys(), j(this.j, 0, 7, this.M), N(this.u, 2, .5), N(this.u, 3, .3), N(this.O, 2, .5), N(this.A, 2, .5), N(this.A, 3, .3), N(this.M, 2, .5), N(this.I, 2, .5);
	}
	get baseOptions() {
		return A(this.j, G, 1);
	}
	set baseOptions(e) {
		j(this.j, 0, 1, e);
	}
	o(e) {
		return "minFaceDetectionConfidence" in e && N(this.u, 2, e.minFaceDetectionConfidence ?? .5), "minFaceSuppressionThreshold" in e && N(this.u, 3, e.minFaceSuppressionThreshold ?? .3), "minFacePresenceConfidence" in e && N(this.O, 2, e.minFacePresenceConfidence ?? .5), "outputFaceBlendshapes" in e && (this.outputFaceBlendshapes = !!e.outputFaceBlendshapes), "minPoseDetectionConfidence" in e && N(this.A, 2, e.minPoseDetectionConfidence ?? .5), "minPoseSuppressionThreshold" in e && N(this.A, 3, e.minPoseSuppressionThreshold ?? .3), "minPosePresenceConfidence" in e && N(this.M, 2, e.minPosePresenceConfidence ?? .5), "outputPoseSegmentationMasks" in e && (this.outputPoseSegmentationMasks = !!e.outputPoseSegmentationMasks), "minHandLandmarksConfidence" in e && N(this.I, 2, e.minHandLandmarksConfidence ?? .5), this.l(e);
	}
	F(e, t, n) {
		let r = typeof t == "function" ? {} : t;
		return this.D = typeof t == "function" ? t : n, Nl(this), ll(this, e, r), Pl(this);
	}
	G(e, t, n, r) {
		let i = typeof n == "function" ? {} : n;
		return this.D = typeof n == "function" ? n : r, Nl(this), ul(this, e, i, t), Pl(this);
	}
	m() {
		var e = new _o();
		U(e, "input_frames_image"), W(e, "pose_landmarks"), W(e, "pose_world_landmarks"), W(e, "face_landmarks"), W(e, "left_hand_landmarks"), W(e, "left_hand_world_landmarks"), W(e, "right_hand_landmarks"), W(e, "right_hand_world_landmarks");
		let t = new lo(), n = new Ya();
		Gr(n, 1, "type.googleapis.com/mediapipe.tasks.vision.holistic_landmarker.proto.HolisticLandmarkerGraphOptions"), function(e, t) {
			if (t != null) {
				if (Array.isArray(t)) O(e, 2, er(t, 0, nr));
				else {
					if (!(typeof t == "string" || t instanceof it || et(t))) throw Error("invalid value in Any.value field: " + t + " expected a ByteString, a base64 encoded string, a Uint8Array or a jspb array");
					kr(e, 2, Pt(t, !1), nt());
				}
			}
		}(n, this.j.g());
		let r = new fo();
		Gr(r, 2, "mediapipe.tasks.vision.holistic_landmarker.HolisticLandmarkerGraph"), Hr(r, 8, Ya, n), V(r, "IMAGE:input_frames_image"), H(r, "POSE_LANDMARKS:pose_landmarks"), H(r, "POSE_WORLD_LANDMARKS:pose_world_landmarks"), H(r, "FACE_LANDMARKS:face_landmarks"), H(r, "LEFT_HAND_LANDMARKS:left_hand_landmarks"), H(r, "LEFT_HAND_WORLD_LANDMARKS:left_hand_world_landmarks"), H(r, "RIGHT_HAND_LANDMARKS:right_hand_landmarks"), H(r, "RIGHT_HAND_WORLD_LANDMARKS:right_hand_world_landmarks"), r.o(t), go(e, r), fc(this, e), this.g.attachProtoListener("pose_landmarks", ((e, t) => {
			Fl(e, this.h.poseLandmarks), J(this, t);
		})), this.g.attachEmptyPacketListener("pose_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoListener("pose_world_landmarks", ((e, t) => {
			var n = this.h.poseWorldLandmarks;
			e = ko(e), n.push(Js(e)), J(this, t);
		})), this.g.attachEmptyPacketListener("pose_world_landmarks", ((e) => {
			J(this, e);
		})), this.outputPoseSegmentationMasks && (H(r, "POSE_SEGMENTATION_MASK:pose_segmentation_mask"), pc(this, "pose_segmentation_mask"), this.g.Z("pose_segmentation_mask", ((e, t) => {
			this.h.poseSegmentationMasks = [dl(this, e, !0, !this.D)], J(this, t);
		})), this.g.attachEmptyPacketListener("pose_segmentation_mask", ((e) => {
			this.h.poseSegmentationMasks = [], J(this, e);
		}))), this.g.attachProtoListener("face_landmarks", ((e, t) => {
			Fl(e, this.h.faceLandmarks), J(this, t);
		})), this.g.attachEmptyPacketListener("face_landmarks", ((e) => {
			J(this, e);
		})), this.outputFaceBlendshapes && (W(e, "extra_blendshapes"), H(r, "FACE_BLENDSHAPES:extra_blendshapes"), this.g.attachProtoListener("extra_blendshapes", ((e, t) => {
			var n = this.h.faceBlendshapes;
			this.outputFaceBlendshapes && (e = Co(e), n.push(Ws(e.g() ?? []))), J(this, t);
		})), this.g.attachEmptyPacketListener("extra_blendshapes", ((e) => {
			J(this, e);
		}))), this.g.attachProtoListener("left_hand_landmarks", ((e, t) => {
			Fl(e, this.h.leftHandLandmarks), J(this, t);
		})), this.g.attachEmptyPacketListener("left_hand_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoListener("left_hand_world_landmarks", ((e, t) => {
			var n = this.h.leftHandWorldLandmarks;
			e = ko(e), n.push(Js(e)), J(this, t);
		})), this.g.attachEmptyPacketListener("left_hand_world_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoListener("right_hand_landmarks", ((e, t) => {
			Fl(e, this.h.rightHandLandmarks), J(this, t);
		})), this.g.attachEmptyPacketListener("right_hand_landmarks", ((e) => {
			J(this, e);
		})), this.g.attachProtoListener("right_hand_world_landmarks", ((e, t) => {
			var n = this.h.rightHandWorldLandmarks;
			e = ko(e), n.push(Js(e)), J(this, t);
		})), this.g.attachEmptyPacketListener("right_hand_world_landmarks", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Q.prototype.detectForVideo = Q.prototype.G, Q.prototype.detect = Q.prototype.F, Q.prototype.setOptions = Q.prototype.o, Q.createFromModelPath = function(e, t) {
	return X(Q, e, { baseOptions: { modelAssetPath: t } });
}, Q.createFromModelBuffer = function(e, t) {
	return X(Q, e, { baseOptions: { modelAssetBuffer: t } });
}, Q.createFromOptions = function(e, t) {
	return X(Q, e, t);
}, Q.HAND_CONNECTIONS = Tl, Q.POSE_CONNECTIONS = Ml, Q.FACE_LANDMARKS_LIPS = ml, Q.FACE_LANDMARKS_LEFT_EYE = hl, Q.FACE_LANDMARKS_LEFT_EYEBROW = gl, Q.FACE_LANDMARKS_LEFT_IRIS = _l, Q.FACE_LANDMARKS_RIGHT_EYE = vl, Q.FACE_LANDMARKS_RIGHT_EYEBROW = yl, Q.FACE_LANDMARKS_RIGHT_IRIS = bl, Q.FACE_LANDMARKS_FACE_OVAL = xl, Q.FACE_LANDMARKS_CONTOURS = Sl, Q.FACE_LANDMARKS_TESSELATION = Cl;
var Il = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "input_image", "norm_rect", !0), this.j = { classifications: [] }, j(e = this.h = new Cs(), 0, 1, t = new G());
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return j(this.h, 0, 2, Hs(e, A(this.h, Ho, 2))), this.l(e);
	}
	sa(e, t) {
		return this.j = { classifications: [] }, ll(this, e, t), this.j;
	}
	ta(e, t, n) {
		return this.j = { classifications: [] }, ul(this, e, n, t), this.j;
	}
	m() {
		var e = new _o();
		U(e, "input_image"), U(e, "norm_rect"), W(e, "classifications");
		let t = new lo();
		Ui(t, ws, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.image_classifier.ImageClassifierGraph"), V(n, "IMAGE:input_image"), V(n, "NORM_RECT:norm_rect"), H(n, "CLASSIFICATIONS:classifications"), n.o(t), go(e, n), this.g.attachProtoListener("classifications", ((e, t) => {
			this.j = Gs(Io(e)), J(this, t);
		})), this.g.attachEmptyPacketListener("classifications", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Il.prototype.classifyForVideo = Il.prototype.ta, Il.prototype.classify = Il.prototype.sa, Il.prototype.setOptions = Il.prototype.o, Il.createFromModelPath = function(e, t) {
	return X(Il, e, { baseOptions: { modelAssetPath: t } });
}, Il.createFromModelBuffer = function(e, t) {
	return X(Il, e, { baseOptions: { modelAssetBuffer: t } });
}, Il.createFromOptions = function(e, t) {
	return X(Il, e, t);
};
var Ll = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect", !0), this.h = new Ts(), this.embeddings = { embeddings: [] }, j(e = this.h, 0, 1, t = new G());
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		var t = this.h, n = A(this.h, Wo, 2);
		return n = n ? n.clone() : new Wo(), e.l2Normalize === void 0 ? "l2Normalize" in e && O(n, 1) : O(n, 1, xn(e.l2Normalize)), e.quantize === void 0 ? "quantize" in e && O(n, 2) : O(n, 2, xn(e.quantize)), j(t, 0, 2, n), this.l(e);
	}
	za(e, t) {
		return ll(this, e, t), this.embeddings;
	}
	Aa(e, t, n) {
		return ul(this, e, n, t), this.embeddings;
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect"), W(e, "embeddings_out");
		let t = new lo();
		Ui(t, Es, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.image_embedder.ImageEmbedderGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect"), H(n, "EMBEDDINGS:embeddings_out"), n.o(t), go(e, n), this.g.attachProtoListener("embeddings_out", ((e, t) => {
			e = Vo(e), this.embeddings = function(e) {
				return {
					embeddings: Rr(e, zo, 1).map(((e) => {
						let t = {
							headIndex: Ur(e, 3) ?? 0 ?? -1,
							headName: Fn(D(e, 4)) ?? "" ?? ""
						};
						var n = e.v;
						return Ir(n, 0 | n[C], Lo, jr(e, 1)) === void 0 ? (n = /* @__PURE__ */ new Uint8Array(), t.quantizedEmbedding = A(e, Ro, jr(e, 2), void 0)?.na()?.h() ?? n) : (e = Sr(e = A(e, Lo, jr(e, 1), void 0), 1, bn, xr()), t.floatEmbedding = e.slice()), t;
					})),
					timestampMs: Us(D(e, 2, void 0, void 0, Mn) ?? vr)
				};
			}(e), J(this, t);
		})), this.g.attachEmptyPacketListener("embeddings_out", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Ll.cosineSimilarity = function(e, t) {
	if (e.floatEmbedding && t.floatEmbedding) e = Xs(e.floatEmbedding, t.floatEmbedding);
	else {
		if (!e.quantizedEmbedding || !t.quantizedEmbedding) throw Error("Cannot compute cosine similarity between quantized and float embeddings.");
		e = Xs(Ys(e.quantizedEmbedding), Ys(t.quantizedEmbedding));
	}
	return e;
}, Ll.prototype.embedForVideo = Ll.prototype.Aa, Ll.prototype.embed = Ll.prototype.za, Ll.prototype.setOptions = Ll.prototype.o, Ll.createFromModelPath = function(e, t) {
	return X(Ll, e, { baseOptions: { modelAssetPath: t } });
}, Ll.createFromModelBuffer = function(e, t) {
	return X(Ll, e, { baseOptions: { modelAssetBuffer: t } });
}, Ll.createFromOptions = function(e, t) {
	return X(Ll, e, t);
};
var Rl = class {
	constructor(e, t, n) {
		this.confidenceMasks = e, this.categoryMask = t, this.qualityScores = n;
	}
	close() {
		this.confidenceMasks?.forEach(((e) => {
			e.close();
		})), this.categoryMask?.close();
	}
};
function zl(e) {
	let t = function(e) {
		return Rr(e, fo, 1);
	}(e.ca()).filter(((e) => (Fn(D(e, 1)) ?? "").includes("mediapipe.tasks.TensorsToSegmentationCalculator")));
	if (e.u = [], t.length > 1) throw Error("The graph has more than one mediapipe.tasks.TensorsToSegmentationCalculator.");
	t.length === 1 && (A(t[0], lo, 7)?.j()?.g() ?? /* @__PURE__ */ new Map()).forEach(((t, n) => {
		e.u[Number(n)] = Fn(D(t, 1)) ?? "";
	}));
}
function Bl(e) {
	e.categoryMask = void 0, e.confidenceMasks = void 0, e.qualityScores = void 0;
}
function Vl(e) {
	try {
		let t = new Rl(e.confidenceMasks, e.categoryMask, e.qualityScores);
		if (!e.j) return t;
		e.j(t);
	} finally {
		mc(e);
	}
}
Rl.prototype.close = Rl.prototype.close;
var Hl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect", !1), this.u = [], this.outputCategoryMask = !1, this.outputConfidenceMasks = !0, this.h = new js(), this.A = new Ds(), j(this.h, 0, 3, this.A), j(e = this.h, 0, 1, t = new G());
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return e.displayNamesLocale === void 0 ? "displayNamesLocale" in e && O(this.h, 2) : O(this.h, 2, Pn(e.displayNamesLocale)), "outputCategoryMask" in e && (this.outputCategoryMask = e.outputCategoryMask ?? !1), "outputConfidenceMasks" in e && (this.outputConfidenceMasks = e.outputConfidenceMasks ?? !0), super.l(e);
	}
	L() {
		zl(this);
	}
	segment(e, t, n) {
		let r = typeof t == "function" ? {} : t;
		return this.j = typeof t == "function" ? t : n, Bl(this), ll(this, e, r), Vl(this);
	}
	La(e, t, n, r) {
		let i = typeof n == "function" ? {} : n;
		return this.j = typeof n == "function" ? n : r, Bl(this), ul(this, e, i, t), Vl(this);
	}
	Da() {
		return this.u;
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect");
		let t = new lo();
		Ui(t, Ms, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.image_segmenter.ImageSegmenterGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect"), n.o(t), go(e, n), fc(this, e), this.outputConfidenceMasks && (W(e, "confidence_masks"), H(n, "CONFIDENCE_MASKS:confidence_masks"), pc(this, "confidence_masks"), this.g.aa("confidence_masks", ((e, t) => {
			this.confidenceMasks = e.map(((e) => dl(this, e, !0, !this.j))), J(this, t);
		})), this.g.attachEmptyPacketListener("confidence_masks", ((e) => {
			this.confidenceMasks = [], J(this, e);
		}))), this.outputCategoryMask && (W(e, "category_mask"), H(n, "CATEGORY_MASK:category_mask"), pc(this, "category_mask"), this.g.Z("category_mask", ((e, t) => {
			this.categoryMask = dl(this, e, !1, !this.j), J(this, t);
		})), this.g.attachEmptyPacketListener("category_mask", ((e) => {
			this.categoryMask = void 0, J(this, e);
		}))), W(e, "quality_scores"), H(n, "QUALITY_SCORES:quality_scores"), this.g.attachFloatVectorListener("quality_scores", ((e, t) => {
			this.qualityScores = e, J(this, t);
		})), this.g.attachEmptyPacketListener("quality_scores", ((e) => {
			this.categoryMask = void 0, J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Hl.prototype.getLabels = Hl.prototype.Da, Hl.prototype.segmentForVideo = Hl.prototype.La, Hl.prototype.segment = Hl.prototype.segment, Hl.prototype.setOptions = Hl.prototype.o, Hl.createFromModelPath = function(e, t) {
	return X(Hl, e, { baseOptions: { modelAssetPath: t } });
}, Hl.createFromModelBuffer = function(e, t) {
	return X(Hl, e, { baseOptions: { modelAssetBuffer: t } });
}, Hl.createFromOptions = function(e, t) {
	return X(Hl, e, t);
};
var Ul = class {
	constructor(e, t, n) {
		this.confidenceMasks = e, this.categoryMask = t, this.qualityScores = n;
	}
	close() {
		this.confidenceMasks?.forEach(((e) => {
			e.close();
		})), this.categoryMask?.close();
	}
};
Ul.prototype.close = Ul.prototype.close;
var Wl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect_in", !1), this.outputCategoryMask = !1, this.outputConfidenceMasks = !0, this.h = new js(), this.u = new Ds(), j(this.h, 0, 3, this.u), j(e = this.h, 0, 1, t = new G());
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return "outputCategoryMask" in e && (this.outputCategoryMask = e.outputCategoryMask ?? !1), "outputConfidenceMasks" in e && (this.outputConfidenceMasks = e.outputConfidenceMasks ?? !0), super.l(e);
	}
	segment(e, t, n, r) {
		let i = typeof n == "function" ? {} : n;
		if (this.j = typeof n == "function" ? n : r, this.qualityScores = this.categoryMask = this.confidenceMasks = void 0, n = this.C + 1, r = new Is(), t.keypoint && t.scribble) throw Error("Cannot provide both keypoint and scribble.");
		if (t.keypoint) {
			var a = new Ns();
			kr(a, 3, xn(!0), !1), kr(a, 1, yn(t.keypoint.x), 0), kr(a, 2, yn(t.keypoint.y), 0), Br(r, 1, Ls, a);
		} else {
			if (!t.scribble) throw Error("Must provide either a keypoint or a scribble.");
			{
				let e = new Fs();
				for (a of t.scribble) kr(t = new Ns(), 3, xn(!0), !1), kr(t, 1, yn(a.x), 0), kr(t, 2, yn(a.y), 0), Hr(e, 1, Ns, t);
				Br(r, 2, Ls, e);
			}
		}
		this.g.addProtoToStream(r.g(), "mediapipe.tasks.vision.interactive_segmenter.proto.RegionOfInterest", "roi_in", n), ll(this, e, i);
		t: {
			try {
				let e = new Ul(this.confidenceMasks, this.categoryMask, this.qualityScores);
				if (!this.j) {
					var o = e;
					break t;
				}
				this.j(e);
			} finally {
				mc(this);
			}
			o = void 0;
		}
		return o;
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "roi_in"), U(e, "norm_rect_in");
		let t = new lo();
		Ui(t, Ms, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.interactive_segmenter.InteractiveSegmenterGraphV2"), V(n, "IMAGE:image_in"), V(n, "ROI:roi_in"), V(n, "NORM_RECT:norm_rect_in"), n.o(t), go(e, n), fc(this, e), this.outputConfidenceMasks && (W(e, "confidence_masks"), H(n, "CONFIDENCE_MASKS:confidence_masks"), pc(this, "confidence_masks"), this.g.aa("confidence_masks", ((e, t) => {
			this.confidenceMasks = e.map(((e) => dl(this, e, !0, !this.j))), J(this, t);
		})), this.g.attachEmptyPacketListener("confidence_masks", ((e) => {
			this.confidenceMasks = [], J(this, e);
		}))), this.outputCategoryMask && (W(e, "category_mask"), H(n, "CATEGORY_MASK:category_mask"), pc(this, "category_mask"), this.g.Z("category_mask", ((e, t) => {
			this.categoryMask = dl(this, e, !1, !this.j), J(this, t);
		})), this.g.attachEmptyPacketListener("category_mask", ((e) => {
			this.categoryMask = void 0, J(this, e);
		}))), W(e, "quality_scores"), H(n, "QUALITY_SCORES:quality_scores"), this.g.attachFloatVectorListener("quality_scores", ((e, t) => {
			this.qualityScores = e, J(this, t);
		})), this.g.attachEmptyPacketListener("quality_scores", ((e) => {
			this.categoryMask = void 0, J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Wl.prototype.segment = Wl.prototype.segment, Wl.prototype.setOptions = Wl.prototype.o, Wl.createFromModelPath = function(e, t) {
	return X(Wl, e, { baseOptions: { modelAssetPath: t } });
}, Wl.createFromModelBuffer = function(e, t) {
	return X(Wl, e, { baseOptions: { modelAssetBuffer: t } });
}, Wl.createFromOptions = function(e, t) {
	return X(Wl, e, t);
};
var Gl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "input_frame_gpu", "norm_rect", !1), this.j = { detections: [] }, j(e = this.h = new Rs(), 0, 1, t = new G());
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return e.displayNamesLocale === void 0 ? "displayNamesLocale" in e && O(this.h, 2) : O(this.h, 2, Pn(e.displayNamesLocale)), e.maxResults === void 0 ? "maxResults" in e && O(this.h, 3) : Wr(this.h, 3, e.maxResults), e.scoreThreshold === void 0 ? "scoreThreshold" in e && O(this.h, 4) : N(this.h, 4, e.scoreThreshold), e.categoryAllowlist === void 0 ? "categoryAllowlist" in e && O(this.h, 5) : Kr(this.h, 5, e.categoryAllowlist), e.categoryDenylist === void 0 ? "categoryDenylist" in e && O(this.h, 6) : Kr(this.h, 6, e.categoryDenylist), this.l(e);
	}
	F(e, t) {
		return this.j = { detections: [] }, ll(this, e, t), this.j;
	}
	G(e, t, n) {
		return this.j = { detections: [] }, ul(this, e, n, t), this.j;
	}
	m() {
		var e = new _o();
		U(e, "input_frame_gpu"), U(e, "norm_rect"), W(e, "detections");
		let t = new lo();
		Ui(t, zs, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.ObjectDetectorGraph"), V(n, "IMAGE:input_frame_gpu"), V(n, "NORM_RECT:norm_rect"), H(n, "DETECTIONS:detections"), n.o(t), go(e, n), this.g.attachProtoVectorListener("detections", ((e, t) => {
			for (let t of e) e = Do(t), this.j.detections.push(Ks(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("detections", ((e) => {
			J(this, e);
		})), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Gl.prototype.detectForVideo = Gl.prototype.G, Gl.prototype.detect = Gl.prototype.F, Gl.prototype.setOptions = Gl.prototype.o, Gl.createFromModelPath = async function(e, t) {
	return X(Gl, e, { baseOptions: { modelAssetPath: t } });
}, Gl.createFromModelBuffer = function(e, t) {
	return X(Gl, e, { baseOptions: { modelAssetBuffer: t } });
}, Gl.createFromOptions = function(e, t) {
	return X(Gl, e, t);
};
var Kl = class {
	constructor(e, t, n) {
		this.landmarks = e, this.worldLandmarks = t, this.segmentationMasks = n;
	}
	close() {
		this.segmentationMasks?.forEach(((e) => {
			e.close();
		}));
	}
};
function ql(e) {
	e.landmarks = [], e.worldLandmarks = [], e.segmentationMasks = void 0;
}
function Jl(e) {
	try {
		let t = new Kl(e.landmarks, e.worldLandmarks, e.segmentationMasks);
		if (!e.u) return t;
		e.u(t);
	} finally {
		mc(e);
	}
}
Kl.prototype.close = Kl.prototype.close;
var Yl = class extends fl {
	constructor(e, t) {
		super(new sl(e, t), "image_in", "norm_rect", !1), this.landmarks = [], this.worldLandmarks = [], this.outputSegmentationMasks = !1, j(e = this.h = new Bs(), 0, 1, t = new G()), this.A = new ys(), j(this.h, 0, 3, this.A), this.j = new vs(), j(this.h, 0, 2, this.j), Wr(this.j, 4, 1), N(this.j, 2, .5), N(this.A, 2, .5), N(this.h, 4, .5);
	}
	get baseOptions() {
		return A(this.h, G, 1);
	}
	set baseOptions(e) {
		j(this.h, 0, 1, e);
	}
	o(e) {
		return "numPoses" in e && Wr(this.j, 4, e.numPoses ?? 1), "minPoseDetectionConfidence" in e && N(this.j, 2, e.minPoseDetectionConfidence ?? .5), "minTrackingConfidence" in e && N(this.h, 4, e.minTrackingConfidence ?? .5), "minPosePresenceConfidence" in e && N(this.A, 2, e.minPosePresenceConfidence ?? .5), "outputSegmentationMasks" in e && (this.outputSegmentationMasks = e.outputSegmentationMasks ?? !1), this.l(e);
	}
	F(e, t, n) {
		let r = typeof t == "function" ? {} : t;
		return this.u = typeof t == "function" ? t : n, ql(this), ll(this, e, r), Jl(this);
	}
	G(e, t, n, r) {
		let i = typeof n == "function" ? {} : n;
		return this.u = typeof n == "function" ? n : r, ql(this), ul(this, e, i, t), Jl(this);
	}
	m() {
		var e = new _o();
		U(e, "image_in"), U(e, "norm_rect"), W(e, "normalized_landmarks"), W(e, "world_landmarks"), W(e, "segmentation_masks");
		let t = new lo();
		Ui(t, Vs, this.h);
		let n = new fo();
		Gr(n, 2, "mediapipe.tasks.vision.pose_landmarker.PoseLandmarkerGraph"), V(n, "IMAGE:image_in"), V(n, "NORM_RECT:norm_rect"), H(n, "NORM_LANDMARKS:normalized_landmarks"), H(n, "WORLD_LANDMARKS:world_landmarks"), n.o(t), go(e, n), fc(this, e), this.g.attachProtoVectorListener("normalized_landmarks", ((e, t) => {
			this.landmarks = [];
			for (let t of e) e = jo(t), this.landmarks.push(qs(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("normalized_landmarks", ((e) => {
			this.landmarks = [], J(this, e);
		})), this.g.attachProtoVectorListener("world_landmarks", ((e, t) => {
			this.worldLandmarks = [];
			for (let t of e) e = ko(t), this.worldLandmarks.push(Js(e));
			J(this, t);
		})), this.g.attachEmptyPacketListener("world_landmarks", ((e) => {
			this.worldLandmarks = [], J(this, e);
		})), this.outputSegmentationMasks && (H(n, "SEGMENTATION_MASK:segmentation_masks"), pc(this, "segmentation_masks"), this.g.aa("segmentation_masks", ((e, t) => {
			this.segmentationMasks = e.map(((e) => dl(this, e, !0, !this.u))), J(this, t);
		})), this.g.attachEmptyPacketListener("segmentation_masks", ((e) => {
			this.segmentationMasks = [], J(this, e);
		}))), e = e.g(), this.setGraph(new Uint8Array(e), !0);
	}
};
Yl.prototype.detectForVideo = Yl.prototype.G, Yl.prototype.detect = Yl.prototype.F, Yl.prototype.setOptions = Yl.prototype.o, Yl.createFromModelPath = function(e, t) {
	return X(Yl, e, { baseOptions: { modelAssetPath: t } });
}, Yl.createFromModelBuffer = function(e, t) {
	return X(Yl, e, { baseOptions: { modelAssetBuffer: t } });
}, Yl.createFromOptions = function(e, t) {
	return X(Yl, e, t);
}, Yl.POSE_CONNECTIONS = Ml;
//#endregion
//#region node_modules/@stream-io/video-filters-web/dist/esm/src/WebGLRenderer.js
var Xl = class e {
	canvas;
	gl;
	stateUpdateProgram;
	maskRefineProgram;
	blurProgram;
	blendProgram;
	stateUpdateLocations;
	maskRefineLocations;
	blurLocations;
	blendLocations;
	positionBuffer;
	texCoordBuffer;
	storedStateTextures;
	fbo;
	refineFbo;
	refinedMaskTexture;
	frameTexture;
	blurTexture1;
	blurTexture2;
	blurFbo1;
	blurFbo2;
	running = !1;
	static DEFAULT_BG_COLOR = [
		33,
		150,
		243,
		255
	];
	currentStateIndex = 0;
	backgroundRenderInfo = null;
	activeBackgroundSourceIdentifier = null;
	constructor(e) {
		this.canvas = e;
		let t = this.canvas.getContext("webgl2", {
			alpha: !1,
			antialias: !1,
			desynchronized: !0
		});
		if (!t) throw Error("WebGL2 not supported");
		this.gl = t, this.stateUpdateProgram = this.createAndLinkProgram("attribute vec2 a_position; attribute vec2 a_texCoord; varying vec2 v_texCoord; void main() { gl_Position = vec4(a_position, 0.0, 1.0); v_texCoord = a_texCoord; }", "\n      precision mediump float;\n      varying vec2 v_texCoord;\n      uniform sampler2D u_categoryTexture;\n      uniform sampler2D u_confidenceTexture;\n      uniform sampler2D u_prevStateTexture;\n      uniform float u_smoothingFactor;\n      uniform float u_smoothstepMin;\n      uniform float u_smoothstepMax;\n      uniform int u_selfieModel;\n\n      void main() {\n        vec2 prevCoord = vec2(v_texCoord.x, 1.0 - v_texCoord.y);\n        float categoryValue = texture2D(u_categoryTexture, v_texCoord).r;\n        float confidenceValue = texture2D(u_confidenceTexture, v_texCoord).r;\n\n        if (u_selfieModel == 1) {\n            categoryValue = 1.0 - categoryValue;\n            confidenceValue = 1.0 - confidenceValue;\n        }\n\n        if (categoryValue > 0.0) {\n            categoryValue = 1.0;\n            confidenceValue = 1.0 - confidenceValue;\n        }\n\n        float nonLinearConfidence = smoothstep(u_smoothstepMin, u_smoothstepMax, confidenceValue);\n        float prevCategoryValue = texture2D(u_prevStateTexture, prevCoord).r;\n        float alpha = u_smoothingFactor * nonLinearConfidence;\n        float newCategoryValue = alpha * categoryValue + (1.0 - alpha) * prevCategoryValue;\n\n        gl_FragColor = vec4(newCategoryValue, 0.0, 0.0, 0.0);\n      }\n    "), this.stateUpdateLocations = {
			position: t.getAttribLocation(this.stateUpdateProgram, "a_position"),
			texCoord: t.getAttribLocation(this.stateUpdateProgram, "a_texCoord"),
			categoryTexture: t.getUniformLocation(this.stateUpdateProgram, "u_categoryTexture"),
			confidenceTexture: t.getUniformLocation(this.stateUpdateProgram, "u_confidenceTexture"),
			prevStateTexture: t.getUniformLocation(this.stateUpdateProgram, "u_prevStateTexture"),
			smoothingFactor: t.getUniformLocation(this.stateUpdateProgram, "u_smoothingFactor"),
			smoothstepMin: t.getUniformLocation(this.stateUpdateProgram, "u_smoothstepMin"),
			smoothstepMax: t.getUniformLocation(this.stateUpdateProgram, "u_smoothstepMax"),
			selfieModel: t.getUniformLocation(this.stateUpdateProgram, "u_selfieModel")
		}, this.maskRefineProgram = this.createAndLinkProgram("attribute vec2 a_position; attribute vec2 a_texCoord; varying vec2 v_texCoord; void main() { gl_Position = vec4(a_position, 0.0, 1.0); v_texCoord = a_texCoord; }", "\n      precision mediump float;\n      varying vec2 v_texCoord;\n\n      uniform sampler2D u_maskTexture;\n      uniform sampler2D u_frameTexture;\n      uniform vec2 u_texelSize;\n      uniform float u_sigmaSpatial;\n      uniform float u_sigmaRange;\n\n      void main() {\n        vec2 flippedCoord = v_texCoord;\n        vec3 centerPixelColor = texture2D(u_frameTexture, v_texCoord).rgb;\n        float totalWeight = 0.0;\n        float weightedMaskSum = 0.0;\n\n        for (int offsetX = -2; offsetX <= 2; offsetX++) {\n          for (int offsetY = -2; offsetY <= 2; offsetY++) {\n            vec2 shift = vec2(float(offsetX), float(offsetY)) * u_texelSize;\n            vec2 frameCoord = v_texCoord + shift;\n            vec2 maskCoord = flippedCoord + shift;\n\n            vec3 neighborPixelColor = texture2D(u_frameTexture, frameCoord).rgb;\n            float neighborMaskValue = texture2D(u_maskTexture, maskCoord).r;\n\n            float spatialWeight = exp(-dot(shift, shift) / (2.0 * u_sigmaSpatial * u_sigmaSpatial));\n            vec3 colorDifference = neighborPixelColor - centerPixelColor;\n            float rangeWeight = exp(-(dot(colorDifference, colorDifference)) / (2.0 * u_sigmaRange * u_sigmaRange));\n\n            float combinedWeight = spatialWeight * rangeWeight;\n            weightedMaskSum += neighborMaskValue * combinedWeight;\n            totalWeight += combinedWeight;\n          }\n        }\n\n        float refinedMaskValue = weightedMaskSum / max(totalWeight, 1e-6);\n        gl_FragColor = vec4(refinedMaskValue, refinedMaskValue, refinedMaskValue, 1.0);\n      }\n    "), this.maskRefineLocations = {
			position: t.getAttribLocation(this.maskRefineProgram, "a_position"),
			texCoord: t.getAttribLocation(this.maskRefineProgram, "a_texCoord"),
			maskTexture: t.getUniformLocation(this.maskRefineProgram, "u_maskTexture"),
			frameTexture: t.getUniformLocation(this.maskRefineProgram, "u_frameTexture"),
			texelSize: t.getUniformLocation(this.maskRefineProgram, "u_texelSize"),
			sigmaSpatial: t.getUniformLocation(this.maskRefineProgram, "u_sigmaSpatial"),
			sigmaRange: t.getUniformLocation(this.maskRefineProgram, "u_sigmaRange")
		}, this.blurProgram = this.createAndLinkProgram("attribute vec2 a_position; attribute vec2 a_texCoord; varying vec2 v_texCoord; void main() { gl_Position = vec4(a_position, 0.0, 1.0); v_texCoord = a_texCoord; }", "\n      precision highp float;\n      varying vec2 v_texCoord;\n\n      uniform sampler2D u_image;\n      uniform sampler2D u_personMask;\n      uniform vec2 u_texelSize;\n      uniform float u_sigma;\n      uniform float u_radiusScale;\n      uniform vec2 u_direction;\n\n      const int KERNEL_RADIUS = 10;\n\n      float gauss(float x, float s) {\n        return exp(-(x * x) / (2.0 * s * s));\n      }\n\n      void main() {\n        vec2 maskCoord = u_direction.y > 0.5 ? vec2(v_texCoord.x, 1.0 - v_texCoord.y) : v_texCoord;\n        float mCenter = texture2D(u_personMask, maskCoord).r;\n        float wCenter = gauss(0.0, u_sigma);\n        vec4 accum = texture2D(u_image, v_texCoord) * wCenter * (1.0 - mCenter);\n        float weightSum = wCenter * (1.0 - mCenter);\n\n        for (int i = 1; i <= KERNEL_RADIUS; i++) {\n          float f = float(i);\n          float offset = f * u_radiusScale;\n          float w = gauss(offset, u_sigma);\n          vec2 texOffset = u_direction * offset * u_texelSize;\n\n          vec2 uvPlus = v_texCoord + texOffset;\n          vec2 maskCoordPlus = u_direction.y > 0.5 ? vec2(uvPlus.x, 1.0 - uvPlus.y) : uvPlus;\n          float mPlus = texture2D(u_personMask, maskCoordPlus).r;\n          accum += texture2D(u_image, uvPlus) * w * (1.0 - mPlus);\n          weightSum += w * (1.0 - mPlus);\n\n          vec2 uvMinus = v_texCoord - texOffset;\n          vec2 maskCoordMinus = u_direction.y > 0.5 ? vec2(uvMinus.x, 1.0 - uvMinus.y) : uvMinus;\n          float mMinus = texture2D(u_personMask, maskCoordMinus).r;\n          accum += texture2D(u_image, uvMinus) * w * (1.0 - mMinus);\n          weightSum += w * (1.0 - mMinus);\n        }\n\n        vec4 blurred = accum / max(weightSum, 1e-6);\n        gl_FragColor = blurred;\n      }\n    "), this.blurLocations = {
			position: t.getAttribLocation(this.blurProgram, "a_position"),
			texCoord: t.getAttribLocation(this.blurProgram, "a_texCoord"),
			image: t.getUniformLocation(this.blurProgram, "u_image"),
			personMask: t.getUniformLocation(this.blurProgram, "u_personMask"),
			texelSize: t.getUniformLocation(this.blurProgram, "u_texelSize"),
			sigma: t.getUniformLocation(this.blurProgram, "u_sigma"),
			radiusScale: t.getUniformLocation(this.blurProgram, "u_radiusScale"),
			direction: t.getUniformLocation(this.blurProgram, "u_direction")
		}, this.blendProgram = this.createAndLinkProgram("attribute vec2 a_position; attribute vec2 a_texCoord; varying vec2 v_texCoord; void main() { gl_Position = vec4(a_position, 0.0, 1.0); v_texCoord = a_texCoord; }", "\n      precision mediump float;\n      varying vec2 v_texCoord;\n\n      uniform sampler2D u_frameTexture;\n      uniform sampler2D u_currentStateTexture;\n      uniform sampler2D u_backgroundTexture;\n      uniform vec2 u_bgImageDimensions;\n      uniform vec2 u_canvasDimensions;\n      uniform float u_borderSmooth;\n      uniform float u_bgBlur;\n      uniform float u_bgBlurRadius;\n      uniform int u_enabled;\n\n      vec4 getMixedFragColor(vec2 bgTexCoord, vec2 categoryCoord, vec2 offset) {\n          vec4 backgroundColor = texture2D(u_backgroundTexture, bgTexCoord + offset);\n          vec4 frameColor = texture2D(u_frameTexture, v_texCoord + offset);\n          float categoryValue = texture2D(u_currentStateTexture, categoryCoord + offset).r;\n          return mix(backgroundColor, frameColor, categoryValue);\n      }\n\n      void main() {\n        if (u_enabled == 0) {\n          gl_FragColor = texture2D(u_frameTexture, v_texCoord);\n          return;\n        }\n\n        vec2 categoryCoord = v_texCoord;\n        float categoryValue = texture2D(u_currentStateTexture, categoryCoord).r;\n\n        float canvasAspect = u_canvasDimensions.x / u_canvasDimensions.y;\n          float bgAspect = u_bgImageDimensions.x / u_bgImageDimensions.y;\n\n          vec2 bgTexCoord = v_texCoord;\n          float scaleX = 1.0;\n          float scaleY = 1.0;\n          float offsetX = 0.0;\n          float offsetY = 0.0;\n\n          if (canvasAspect < bgAspect) {\n              scaleY = 1.0;\n              scaleX = bgAspect / canvasAspect;\n              offsetX = (1.0 - scaleX) / 2.0;\n          } else {\n              scaleX = 1.0;\n              scaleY = canvasAspect / bgAspect;\n              offsetY = (1.0 - scaleY) / 2.0;\n          }\n\n          bgTexCoord = vec2((v_texCoord.x - offsetX) / scaleX, (v_texCoord.y - offsetY) / scaleY);\n          gl_FragColor = getMixedFragColor(bgTexCoord, categoryCoord, vec2(0.0, 0.0));\n    }"), this.blendLocations = {
			position: t.getAttribLocation(this.blendProgram, "a_position"),
			texCoord: t.getAttribLocation(this.blendProgram, "a_texCoord"),
			frameTexture: t.getUniformLocation(this.blendProgram, "u_frameTexture"),
			currentStateTexture: t.getUniformLocation(this.blendProgram, "u_currentStateTexture"),
			backgroundTexture: t.getUniformLocation(this.blendProgram, "u_backgroundTexture"),
			bgImageDimensions: t.getUniformLocation(this.blendProgram, "u_bgImageDimensions"),
			canvasDimensions: t.getUniformLocation(this.blendProgram, "u_canvasDimensions"),
			borderSmooth: t.getUniformLocation(this.blendProgram, "u_borderSmooth"),
			bgBlur: t.getUniformLocation(this.blendProgram, "u_bgBlur"),
			bgBlurRadius: t.getUniformLocation(this.blendProgram, "u_bgBlurRadius"),
			enabled: t.getUniformLocation(this.blendProgram, "u_enabled")
		}, this.positionBuffer = t.createBuffer(), t.bindBuffer(t.ARRAY_BUFFER, this.positionBuffer), t.bufferData(t.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			-1,
			1,
			1,
			-1,
			1,
			1
		]), t.STATIC_DRAW), this.texCoordBuffer = t.createBuffer(), t.bindBuffer(t.ARRAY_BUFFER, this.texCoordBuffer), t.bufferData(t.ARRAY_BUFFER, new Float32Array([
			0,
			1,
			1,
			1,
			0,
			0,
			0,
			0,
			1,
			1,
			1,
			0
		]), t.STATIC_DRAW), this.storedStateTextures = Array.from({ length: 2 }, () => {
			let e = t.createTexture();
			return t.bindTexture(t.TEXTURE_2D, e), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, 1, 1, 0, t.RGBA, t.UNSIGNED_BYTE, new Uint8Array([
				0,
				0,
				0,
				255
			])), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), e;
		}), t.bindTexture(t.TEXTURE_2D, null), this.fbo = t.createFramebuffer(), this.refineFbo = t.createFramebuffer();
		let n = t.createTexture();
		if (this.frameTexture = t.createTexture(), !n) throw Error("Failed to create refined mask texture");
		t.bindTexture(t.TEXTURE_2D, n), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, 1, 1, 0, t.RGBA, t.UNSIGNED_BYTE, null), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.bindTexture(t.TEXTURE_2D, null), this.refinedMaskTexture = n;
		let r = () => {
			let e = t.createTexture();
			if (!e) throw Error("Failed to create blur texture");
			return t.bindTexture(t.TEXTURE_2D, e), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, 1, 1, 0, t.RGBA, t.UNSIGNED_BYTE, null), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.bindTexture(t.TEXTURE_2D, null), e;
		};
		this.blurTexture1 = r(), this.blurTexture2 = r();
		let i = (e) => {
			let n = t.createFramebuffer();
			if (!n || !e) throw Error("Failed to create blur FBO");
			return t.bindFramebuffer(t.FRAMEBUFFER, n), t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, e, 0), t.bindFramebuffer(t.FRAMEBUFFER, null), n;
		};
		this.blurFbo1 = i(this.blurTexture1), this.blurFbo2 = i(this.blurTexture2), this.running = !0;
	}
	createAndLinkProgram(e, t) {
		let n = this.createShader(this.gl.VERTEX_SHADER, e), r = this.createShader(this.gl.FRAGMENT_SHADER, t), i = this.gl.createProgram();
		if (!i) throw Error("Failed to create program");
		if (this.gl.attachShader(i, n), this.gl.attachShader(i, r), this.gl.linkProgram(i), !this.gl.getProgramParameter(i, this.gl.LINK_STATUS)) throw console.error("Program link error:", this.gl.getProgramInfoLog(i)), this.gl.deleteProgram(i), Error("Link fail");
		return this.gl.detachShader(i, n), this.gl.detachShader(i, r), this.gl.deleteShader(n), this.gl.deleteShader(r), i;
	}
	createShader(e, t) {
		let n = this.gl.createShader(e);
		if (!n) throw Error(`Failed to create shader type: ${e}`);
		if (this.gl.shaderSource(n, t), this.gl.compileShader(n), !this.gl.getShaderParameter(n, this.gl.COMPILE_STATUS)) throw console.error("Shader compile error:", this.gl.getShaderInfoLog(n)), this.gl.deleteShader(n), Error("Failed to compile shader");
		return n;
	}
	createColorTexture(e, t, n, r) {
		let i = this.gl.createTexture();
		if (!i) throw Error("Failed to create texture for color");
		this.gl.bindTexture(this.gl.TEXTURE_2D, i);
		let a = new Uint8Array([
			e,
			t,
			n,
			r
		]);
		return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, a), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST), this.gl.bindTexture(this.gl.TEXTURE_2D, null), {
			texture: i,
			color: [
				e,
				t,
				n,
				r
			]
		};
	}
	updateBackgroundIfNeeded(t) {
		let n = this.gl, r;
		if (t) r = t.url;
		else {
			let [t, n, i, a] = e.DEFAULT_BG_COLOR;
			r = `color(${t},${n},${i},${a})`;
		}
		if (!(r === this.activeBackgroundSourceIdentifier && this.backgroundRenderInfo)) {
			if (this.backgroundRenderInfo &&= (n.deleteTexture(this.backgroundRenderInfo.texture), null), this.activeBackgroundSourceIdentifier = r, !t) {
				let [t, n, r, i] = e.DEFAULT_BG_COLOR, a = this.createColorTexture(t, n, r, i);
				this.backgroundRenderInfo = {
					type: "color",
					texture: a.texture,
					color: a.color
				}, this.activeBackgroundSourceIdentifier = `color(${t},${n},${r},${i})`;
			} else if (t.type === "image") {
				let { media: e, url: n } = t, r = this.gl.createTexture();
				if (!r) throw Error("Failed to create texture object for image.");
				this.gl.bindTexture(this.gl.TEXTURE_2D, r), this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, e), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR), this.gl.bindTexture(this.gl.TEXTURE_2D, null), this.backgroundRenderInfo = {
					type: "image",
					texture: r,
					width: e.width,
					height: e.height,
					url: n
				};
			} else if (t.type === "video") {
				let { media: e, url: n } = t, r = new OffscreenCanvas(1, 1), i = r.getContext("2d"), a = new WritableStream({
					write(e) {
						r.width = e.codedWidth, r.height = e.codedHeight, i?.drawImage(e, 0, 0), e.close();
					},
					close() {
						console.log("[virtual-background] video background close");
					}
				});
				e.pipeTo(a).catch((e) => {
					console.error("media.pipeTo(writer) error", e);
				});
				let o = this.gl.createTexture();
				if (!o) throw Error("Failed to create texture for video");
				this.gl.bindTexture(this.gl.TEXTURE_2D, o), this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR), this.gl.bindTexture(this.gl.TEXTURE_2D, null), this.backgroundRenderInfo = {
					type: "video",
					texture: o,
					url: n,
					media: e,
					canvas: r
				};
			}
			if (!this.backgroundRenderInfo) {
				console.error("Critical: backgroundRenderInfo is null after processing new source. Setting default color.");
				let [t, n, r, i] = e.DEFAULT_BG_COLOR, a = this.createColorTexture(t, n, r, i);
				this.backgroundRenderInfo = {
					type: "color",
					texture: a.texture,
					color: a.color
				}, this.activeBackgroundSourceIdentifier = `color(${t},${n},${r},${i})`;
			}
		}
	}
	render(e, t, n, r) {
		if (!this.running) return;
		let { gl: i, fbo: a, frameTexture: o, storedStateTextures: s, stateUpdateProgram: c, stateUpdateLocations: l, refineFbo: u, refinedMaskTexture: d, maskRefineProgram: f, maskRefineLocations: p, blendProgram: m, blendLocations: h, blurFbo1: g, blurFbo2: _, blurTexture1: ee, blurTexture2: v } = this, { displayWidth: y, displayHeight: b } = e;
		if ((this.canvas.width !== y || this.canvas.height !== b) && (this.canvas.width = y, this.canvas.height = b), !n || !r) {
			i.viewport(0, 0, i.drawingBufferWidth, i.drawingBufferHeight), i.useProgram(m);
			let t = i.createTexture();
			i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, t), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, e), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.uniform1i(h.frameTexture, 0), i.uniform1i(h.enabled, 0), i.enableVertexAttribArray(h.position), i.bindBuffer(i.ARRAY_BUFFER, this.positionBuffer), i.vertexAttribPointer(h.position, 2, i.FLOAT, !1, 0, 0), i.enableVertexAttribArray(h.texCoord), i.bindBuffer(i.ARRAY_BUFFER, this.texCoordBuffer), i.vertexAttribPointer(h.texCoord, 2, i.FLOAT, !1, 0, 0), i.drawArrays(i.TRIANGLES, 0, 6), i.deleteTexture(t), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, null);
			return;
		}
		let te = this.currentStateIndex, x = (this.currentStateIndex + 1) % 2, ne = s[te], re = s[x];
		this.updateBackgroundIfNeeded(t.backgroundSource), i.bindFramebuffer(i.FRAMEBUFFER, a), i.framebufferTexture2D(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, re, 0), i.bindTexture(i.TEXTURE_2D, re), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, y, b, 0, i.RGBA, i.UNSIGNED_BYTE, null), i.viewport(0, 0, y, b), i.useProgram(c), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, n), i.uniform1i(l.categoryTexture, 0), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, r), i.uniform1i(l.confidenceTexture, 1), i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, ne), i.uniform1i(l.prevStateTexture, 2), i.uniform1f(l.smoothingFactor, t.segmentationOptions?.smoothingFactor ?? .8), i.uniform1f(l.smoothstepMin, t.segmentationOptions?.smoothstepMin ?? .6), i.uniform1f(l.smoothstepMax, t.segmentationOptions?.smoothstepMax ?? .9), i.uniform1i(l.selfieModel, +!!t.isSelfieMode), i.enableVertexAttribArray(l.position), i.bindBuffer(i.ARRAY_BUFFER, this.positionBuffer), i.vertexAttribPointer(l.position, 2, i.FLOAT, !1, 0, 0), i.enableVertexAttribArray(l.texCoord), i.bindBuffer(i.ARRAY_BUFFER, this.texCoordBuffer), i.vertexAttribPointer(l.texCoord, 2, i.FLOAT, !1, 0, 0), i.drawArrays(i.TRIANGLES, 0, 6), i.bindFramebuffer(i.FRAMEBUFFER, u), i.framebufferTexture2D(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, d, 0), i.bindTexture(i.TEXTURE_2D, d), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, y, b, 0, i.RGBA, i.UNSIGNED_BYTE, null), i.viewport(0, 0, y, b), i.useProgram(f), i.enableVertexAttribArray(p.position), i.bindBuffer(i.ARRAY_BUFFER, this.positionBuffer), i.vertexAttribPointer(p.position, 2, i.FLOAT, !1, 0, 0), i.enableVertexAttribArray(p.texCoord), i.bindBuffer(i.ARRAY_BUFFER, this.texCoordBuffer), i.vertexAttribPointer(p.texCoord, 2, i.FLOAT, !1, 0, 0), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, re), i.uniform1i(p.maskTexture, 0), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, o), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, e), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, i.NEAREST), i.uniform1i(p.frameTexture, 1), i.uniform2f(p.texelSize, 1 / y, 1 / b), i.uniform1f(p.sigmaSpatial, 2), i.uniform1f(p.sigmaRange, .1), i.drawArrays(i.TRIANGLES, 0, 6), i.disableVertexAttribArray(p.position), i.disableVertexAttribArray(p.texCoord);
		let ie, ae = y, oe = b;
		if (t.bgBlur > 0 && t.bgBlurRadius > 0) {
			let e = .5, n = Math.floor(y * e), r = Math.floor(b * e);
			i.bindTexture(i.TEXTURE_2D, ee), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, n, r, 0, i.RGBA, i.UNSIGNED_BYTE, null), i.bindTexture(i.TEXTURE_2D, v), i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, n, r, 0, i.RGBA, i.UNSIGNED_BYTE, null);
			let a = Math.max(0, t.bgBlurRadius) / 10;
			i.useProgram(this.blurProgram), i.enableVertexAttribArray(this.blurLocations.position), i.bindBuffer(i.ARRAY_BUFFER, this.positionBuffer), i.vertexAttribPointer(this.blurLocations.position, 2, i.FLOAT, !1, 0, 0), i.enableVertexAttribArray(this.blurLocations.texCoord), i.bindBuffer(i.ARRAY_BUFFER, this.texCoordBuffer), i.vertexAttribPointer(this.blurLocations.texCoord, 2, i.FLOAT, !1, 0, 0), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, d), i.uniform1i(this.blurLocations.personMask, 1), i.uniform1f(this.blurLocations.sigma, t.bgBlur * .7), i.uniform1f(this.blurLocations.radiusScale, a);
			let s = [
				{
					direction: [1, 0],
					input: o,
					output: g,
					texelSize: [1 / y, 1 / b]
				},
				{
					direction: [0, 1],
					input: ee,
					output: _,
					texelSize: [1 / n, 1 / r]
				},
				{
					direction: [1, 0],
					input: v,
					output: g,
					texelSize: [1 / n, 1 / r]
				},
				{
					direction: [0, 1],
					input: ee,
					output: _,
					texelSize: [1 / n, 1 / r]
				}
			];
			for (let e of s) i.bindFramebuffer(i.FRAMEBUFFER, e.output), i.viewport(0, 0, n, r), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, e.input), i.uniform1i(this.blurLocations.image, 0), i.uniform2f(this.blurLocations.texelSize, e.texelSize[0], e.texelSize[1]), i.uniform2f(this.blurLocations.direction, e.direction[0], e.direction[1]), i.drawArrays(i.TRIANGLES, 0, 6);
			ie = v, ae = n, oe = r;
		} else if (t.backgroundSource && this.backgroundRenderInfo) {
			if (ie = this.backgroundRenderInfo.texture, this.backgroundRenderInfo.type === "video") {
				let { canvas: e } = this.backgroundRenderInfo;
				ae = e.width || y, oe = e.height || b;
			} else this.backgroundRenderInfo.type === "image" ? (ae = this.backgroundRenderInfo.width, oe = this.backgroundRenderInfo.height) : (ae = y, oe = b);
		} else ie = this.backgroundRenderInfo?.texture ?? null;
		i.bindFramebuffer(i.FRAMEBUFFER, null), i.viewport(0, 0, i.drawingBufferWidth, i.drawingBufferHeight), i.useProgram(m), i.activeTexture(i.TEXTURE0), i.bindTexture(i.TEXTURE_2D, o), i.uniform1i(h.frameTexture, 0), i.uniform1f(h.borderSmooth, 0), i.uniform1f(h.bgBlur, t.bgBlur), i.uniform1f(h.bgBlurRadius, t.bgBlurRadius), i.uniform1i(h.enabled, 1), i.activeTexture(i.TEXTURE1), i.bindTexture(i.TEXTURE_2D, d), i.uniform1i(h.currentStateTexture, 1), ie ? (i.activeTexture(i.TEXTURE2), i.bindTexture(i.TEXTURE_2D, ie), i.uniform1i(h.backgroundTexture, 2), i.uniform2f(h.bgImageDimensions, ae, oe), i.uniform2f(h.canvasDimensions, y, b)) : (i.uniform2f(h.bgImageDimensions, y, b), i.uniform2f(h.canvasDimensions, y, b)), i.enableVertexAttribArray(h.position), i.bindBuffer(i.ARRAY_BUFFER, this.positionBuffer), i.vertexAttribPointer(h.position, 2, i.FLOAT, !1, 0, 0), i.enableVertexAttribArray(h.texCoord), i.bindBuffer(i.ARRAY_BUFFER, this.texCoordBuffer), i.vertexAttribPointer(h.texCoord, 2, i.FLOAT, !1, 0, 0), i.drawArrays(i.TRIANGLES, 0, 6);
		for (let e = 0; e < 3; ++e) i.activeTexture(i.TEXTURE0 + e), i.bindTexture(i.TEXTURE_2D, null);
		this.currentStateIndex = x;
	}
	close() {
		if (!this.running) return;
		this.running = !1;
		let { gl: e, fbo: t, refineFbo: n, refinedMaskTexture: r, blurFbo1: i, blurFbo2: a } = this;
		e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT), e.bindFramebuffer(e.FRAMEBUFFER, null), t && e.deleteFramebuffer(t), n && e.deleteFramebuffer(n), i && e.deleteFramebuffer(i), a && e.deleteFramebuffer(a), e.deleteProgram(this.stateUpdateProgram), e.deleteProgram(this.maskRefineProgram), e.deleteProgram(this.blurProgram), e.deleteProgram(this.blendProgram), this.positionBuffer && e.deleteBuffer(this.positionBuffer), this.texCoordBuffer && e.deleteBuffer(this.texCoordBuffer), r && e.deleteTexture(r), this.blurTexture1 && e.deleteTexture(this.blurTexture1), this.blurTexture2 && e.deleteTexture(this.blurTexture2), this.storedStateTextures.forEach((t) => t && e.deleteTexture(t)), this.storedStateTextures.splice(0, this.storedStateTextures.length), this.backgroundRenderInfo?.texture && (e.deleteTexture(this.backgroundRenderInfo.texture), this.backgroundRenderInfo = null), this.activeBackgroundSourceIdentifier = null;
	}
}, Zl = class extends Ee {
	options;
	segmenter = null;
	isSegmenterReady = !1;
	webGlRenderer;
	opts;
	latestCategoryMask = void 0;
	latestConfidenceMask = void 0;
	lastFrameTime = -1;
	constructor(e, t = {}, n = {}) {
		super(e, n), this.options = t;
	}
	async updateOptions(e) {
		let { basePath: t, modelPath: n } = this.options, r = this.options, i = {
			basePath: t,
			modelPath: n,
			...e
		};
		this.options = i;
		try {
			let e = await this.initializeSegmenterOptions();
			if (this.options === i) {
				let t = this.opts?.backgroundSource?.media;
				this.opts = e, t instanceof ImageBitmap && t !== e.backgroundSource?.media && t.close();
			}
		} catch (e) {
			throw this.options === i && (this.options = r), e;
		}
	}
	async initialize() {
		this.webGlRenderer = new Xl(this.canvas), await this.initializeSegmenter();
	}
	async initializeSegmenter() {
		try {
			this.opts = await this.initializeSegmenterOptions();
			let e = this.options.basePath || "https://unpkg.com/@stream-io/video-filters-web@0.10.0/mediapipe", t = this.options.modelPath || `${e}/models/selfie_segmenter_landscape.tflite`, n = await tc.forVisionTasks(`${e}/wasm`);
			this.segmenter = await Hl.createFromOptions(n, {
				baseOptions: {
					modelAssetPath: t,
					delegate: "GPU"
				},
				runningMode: "VIDEO",
				outputCategoryMask: !0,
				outputConfidenceMasks: !0,
				canvas: this.canvas
			}), this.isSegmenterReady = !0;
		} catch (e) {
			throw this.isSegmenterReady = !1, this.hooks.onError?.(e), e;
		}
	}
	async transform(e) {
		let t = e.timestamp, n = t - this.lastFrameTime > 1e3;
		if (this.lastFrameTime = t, n && this.isSegmenterReady && this.segmenter) {
			let t = performance.now();
			await this.runSegmentation(e), this.webGlRenderer.render(e, this.opts, this.latestCategoryMask, this.latestConfidenceMask), this.updateStats(performance.now() - t);
		}
		return new VideoFrame(this.canvas, { timestamp: e.timestamp });
	}
	async runSegmentation(e) {
		if (this.segmenter) return new Promise((t) => {
			let n = Math.floor(performance.now());
			this.segmenter.segmentForVideo(e, n, (e) => {
				try {
					this.latestCategoryMask = e.categoryMask?.getAsWebGLTexture(), this.latestConfidenceMask = e.confidenceMasks?.[0]?.getAsWebGLTexture();
				} catch (e) {
					console.error("[virtual-background] segmentation error:", e), this.hooks.onError?.(e);
				} finally {
					e.close(), t();
				}
			});
		});
	}
	async initializeSegmenterOptions() {
		let e = !this.options.modelPath || this.options.modelPath.includes("selfie_segmenter");
		if (this.options.backgroundFilter === "image") return {
			backgroundSource: await this.loadBackground(this.options.backgroundImage),
			bgBlur: 0,
			bgBlurRadius: 0,
			isSelfieMode: e,
			segmentationOptions: this.options.segmentationOptions
		};
		let t = this.options.backgroundBlurLevel, n = typeof t == "string" ? xe[t] : Math.round(t ?? 5);
		return {
			backgroundSource: void 0,
			bgBlur: Math.min(n * 1.5, 20),
			bgBlurRadius: Math.min(n, 10),
			isSelfieMode: e,
			segmentationOptions: this.options.segmentationOptions
		};
	}
	async loadBackground(e) {
		if (!e) return null;
		let t = this.opts?.backgroundSource;
		if (t?.url === e) return t;
		let n = await fetch(e, { signal: this.abortController.signal });
		if (!n.ok) throw Error(`[virtual-background] Failed to load background image: ${n.status} ${n.statusText}`);
		return {
			type: "image",
			media: await createImageBitmap(await n.blob()),
			url: e
		};
	}
	onFlush() {
		this.destroySegmenter();
	}
	onStop() {
		this.webGlRenderer?.close(), this.destroySegmenter();
	}
	destroySegmenter() {
		this.segmenter?.close(), this.segmenter = null, this.isSegmenterReady = !1;
	}
	get processorName() {
		return "background-processor";
	}
}, Ql = t(), $ = /* @__PURE__ */ e(r()), $l = /* @__PURE__ */ e(n()), eu = .2, tu = .75, nu = .85, ru = [], iu;
(function(e) {
	e[e.TF = 0] = "TF", e[e.MEDIA_PIPE = 1] = "MEDIA_PIPE", e[e.NONE = 2] = "NONE";
})(iu ||= {});
var au = async (e, t, n) => e ? await f({
	forceSafariSupport: t,
	forceMobileSupport: n
}) ? iu.TF : iu.NONE : await p({
	forceSafariSupport: t,
	forceMobileSupport: n
}) ? iu.MEDIA_PIPE : iu.NONE, ou = (e) => {
	let { useCameraState: t } = s(), { rootMediaStream: n } = t(), [r, i] = (0, $.useState)(void 0), a = n?.getVideoTracks()[0]?.id;
	return (0, $.useEffect)(() => {
		if (!e) {
			i(void 0);
			return;
		}
		let t, r, a = setInterval(() => {
			let e = n?.getVideoTracks()[0], a = e?.stats;
			if (!e || !a) {
				t = void 0, i(void 0);
				return;
			}
			e.id !== r && (r = e.id, t = void 0, i(void 0));
			let o = {
				deliveredFrames: a.deliveredFrames,
				discardedFrames: a.discardedFrames,
				totalFrames: a.totalFrames,
				capturedAt: performance.now()
			};
			if (t) {
				let e = (o.capturedAt - t.capturedAt) / 1e3, n = o.deliveredFrames - t.deliveredFrames, r = Math.round(n / e);
				i(r);
			}
			t = o;
		}, 1e3);
		return () => {
			clearInterval(a), i(void 0);
		};
	}, [
		e,
		n,
		a
	]), r;
}, su = (e) => {
	let { ContextProvider: t, children: n, backgroundImages: r = ru, backgroundFilter: i = void 0, backgroundImage: o = void 0, backgroundBlurLevel: c = void 0, tfFilePath: l, modelFilePath: u, useLegacyFilter: d, basePath: f, onError: p, forceSafariSupport: m, forceMobileSupport: h, segmentationOptions: g } = e, _ = a(), { useCallStatsReport: ee } = s(), v = ee(), [y, b] = (0, $.useState)(i), [te, x] = (0, $.useState)(o), [ne, re] = (0, $.useState)(c), [ie, ae] = (0, $.useState)(!1), [oe, se] = (0, $.useState)(!1), ce = ou(_), le = v?.publisherStats?.camera?.frameRate, S = ce ?? le, ue = (0, $.useRef)(void 0), de = (0, $.useCallback)((e) => {
		let t = e?.fps;
		if (t == null || !S) {
			ue.current = void 0, ae(!1);
			return;
		}
		let n = t / S, r = ue.current ?? n, i = eu * n + .8 * r;
		ue.current = i, ae((e) => e && i > nu ? !1 : !e && i < tu || e);
	}, [S]), fe = (0, $.useMemo)(() => {
		if (!y) return { degraded: !1 };
		let e = [];
		ie && e.push("frame-drop");
		let t = v?.publisherStats?.qualityLimitationReasons;
		return ie && t && t?.includes("cpu") && e.push("cpu-throttling"), {
			degraded: e.length > 0,
			reason: e.length > 0 ? e : void 0
		};
	}, [
		ie,
		v?.publisherStats?.qualityLimitationReasons,
		y
	]), pe = (0, $.useRef)(void 0);
	(0, $.useEffect)(() => {
		let e = fe.degraded, t = pe.current;
		y && t !== void 0 && t !== e && _?.tracer.trace("backgroundFilters.performance", {
			degraded: e,
			reason: fe?.reason,
			ratio: ue.current,
			sourceFps: S
		}), pe.current = e;
	}, [
		fe.degraded,
		fe.reason,
		y,
		_?.tracer,
		S
	]);
	let he = (0, $.useCallback)((e) => {
		b("image"), x(e);
	}, []), ge = (0, $.useCallback)((e = "high") => {
		b("blur"), re(e);
	}, []), _e = (0, $.useCallback)(() => {
		b(void 0), x(void 0), re(void 0), ue.current = void 0, ae(!1);
	}, []), [ve, ye] = (0, $.useState)(iu.NONE), [xe, Se] = (0, $.useState)(!1);
	(0, $.useEffect)(() => {
		au(d, m, h).then((e) => {
			ye(e), Se(e !== iu.NONE);
		});
	}, [
		h,
		m,
		d
	]);
	let [Ce, we] = (0, $.useState)();
	(0, $.useEffect)(() => {
		ve === iu.TF && me({
			basePath: f,
			modelFilePath: u,
			tfFilePath: l
		}).then(we).catch((e) => console.error("Failed to load TFLite", e));
	}, [
		f,
		ve,
		u,
		l
	]);
	let [Te, Ee] = (0, $.useState)();
	(0, $.useEffect)(() => {
		ve === iu.MEDIA_PIPE && be({
			basePath: f,
			modelPath: u
		}).then(Ee).catch((e) => console.error("Failed to preload MediaPipe", e));
	}, [
		ve,
		u,
		f
	]);
	let De = (0, $.useCallback)((e) => {
		console.warn("[filters] Filter encountered an error and will be disabled"), _e(), p?.(e);
	}, [_e, p]), Oe = d ? !!Ce : !!Te, ke = (0, $.useMemo)(() => ({
		isSupported: xe,
		performance: fe,
		isReady: Oe,
		isLoading: oe,
		backgroundImage: te,
		backgroundBlurLevel: ne,
		backgroundFilter: y,
		disableBackgroundFilter: _e,
		applyBackgroundBlurFilter: ge,
		applyBackgroundImageFilter: he,
		backgroundImages: r,
		tfFilePath: l,
		modelFilePath: u,
		basePath: f,
		onError: De,
		segmentationOptions: g
	}), [
		xe,
		fe,
		Oe,
		oe,
		te,
		ne,
		y,
		_e,
		ge,
		he,
		r,
		l,
		u,
		f,
		De,
		g
	]);
	return (0, Ql.jsxs)(t.Provider, {
		value: ke,
		children: [n, Oe && (0, Ql.jsx)(cu, {
			api: ke,
			tfLite: Ce,
			engine: ve,
			onStats: de,
			setIsLoading: se
		})]
	});
}, cu = (e) => {
	let t = a(), { engine: n, api: r, tfLite: i, onStats: o, setIsLoading: s } = e, { children: c, start: l } = lu(r, i, t, n), { onError: u, backgroundFilter: d } = r, f = (0, $.useRef)(void 0);
	f.current = u;
	let p = (0, $.useRef)(void 0);
	p.current = o;
	let m = !!d;
	return (0, $.useEffect)(() => {
		if (!t || !m) return;
		s(!0);
		let { unregister: e, registered: n } = t.camera.registerFilter((e) => l(e, (e) => f.current?.(e), (e) => p.current?.(e)));
		return n.finally(() => {
			s(!1);
		}), () => {
			e().catch((e) => console.warn("Can't unregister filter", e));
		};
	}, [
		t,
		l,
		m,
		s
	]), c;
}, lu = (e, t, n, r) => {
	let { backgroundFilter: a, backgroundBlurLevel: o, backgroundImage: s, modelFilePath: l, basePath: u, segmentationOptions: d } = e, f = (0, $.useRef)({});
	f.current = {
		backgroundFilter: a,
		backgroundBlurLevel: o,
		backgroundImage: s,
		segmentationOptions: d
	};
	let p = (0, $.useRef)(void 0), m = (0, $.useRef)(null), h = (0, $.useRef)(null), g = (0, $.useRef)(null), [_, ee] = (0, $.useState)({
		width: 1920,
		height: 1080
	}), v = (0, $.useCallback)((e, t, r) => {
		let a, o;
		return {
			output: new Promise((i, s) => {
				let c = f.current;
				if (!c.backgroundFilter) {
					s(/* @__PURE__ */ Error("No filter specified"));
					return;
				}
				let [d] = e.getVideoTracks();
				if (!d) {
					s(/* @__PURE__ */ Error("No video tracks in input media stream"));
					return;
				}
				n?.tracer.trace("backgroundFilters.enable", {
					...c,
					engine: iu.MEDIA_PIPE,
					modelFilePath: l
				});
				let m = d.getSettings();
				(0, $l.flushSync)(() => ee({
					width: m.width ?? 0,
					height: m.height ?? 0
				})), o = new Zl(d, {
					...c,
					basePath: u,
					modelPath: l
				}, {
					onError: t,
					onStats: r
				}), p.current = o, o.start().then((e) => {
					a = new MediaStream([e]), i(a);
				}).catch(s);
			}),
			stop: () => {
				n?.tracer.trace("backgroundFilters.disable", null), p.current = void 0, o?.stop(), a && i(a);
			}
		};
	}, [
		n?.tracer,
		l,
		u
	]), y = (0, $.useCallback)((e, r) => {
		let c, l;
		return {
			output: new Promise((i, u) => {
				if (!a) {
					u(/* @__PURE__ */ Error("No filter specified"));
					return;
				}
				let d = m.current, f = h.current, p = g.current, [_] = e.getVideoTracks();
				_ ? !d || !f || s && !p ? u(/* @__PURE__ */ Error("Renderer started before elements are ready")) : (d.srcObject = e, d.play().then(() => {
					let e = _.getSettings();
					(0, $l.flushSync)(() => ee({
						width: e.width ?? 0,
						height: e.height ?? 0
					})), n?.tracer.trace("backgroundFilters.enable", {
						backgroundFilter: a,
						backgroundBlurLevel: o,
						backgroundImage: s,
						engine: iu.TF
					}), t ? (l = S(t, d, f, {
						backgroundFilter: a,
						backgroundBlurLevel: o,
						backgroundImage: p ?? void 0
					}, r), c = f.captureStream(), i(c)) : u(/* @__PURE__ */ Error("TensorFlow Lite not loaded"));
				}, () => {
					u(/* @__PURE__ */ Error("Could not play the source video stream"));
				})) : u(/* @__PURE__ */ Error("No video tracks in input media stream"));
			}),
			stop: () => {
				n?.tracer.trace("backgroundFilters.disable", null), l?.dispose(), m.current && (m.current.srcObject = null), c && i(c);
			}
		};
	}, [
		n?.tracer,
		t,
		a,
		o,
		s
	]), b = r === iu.TF ? y : v;
	return (0, $.useEffect)(() => {
		a && p.current?.updateOptions({
			backgroundFilter: a,
			backgroundBlurLevel: o,
			backgroundImage: s,
			segmentationOptions: d
		}).catch((e) => console.warn("[filters] Can't apply the background options", e));
	}, [
		a,
		o,
		s,
		d
	]), {
		start: b,
		children: (0, Ql.jsxs)("div", {
			className: "str-video__background-filters",
			children: [
				(0, Ql.jsx)("video", {
					className: c("str-video__background-filters__video", _.height > _.width && "str-video__background-filters__video--tall"),
					ref: m,
					playsInline: !0,
					muted: !0,
					controls: !1,
					..._
				}),
				s && (0, Ql.jsx)("img", {
					className: "str-video__background-filters__background-image",
					alt: "Background",
					ref: g,
					crossOrigin: "anonymous",
					src: s,
					..._
				}),
				(0, Ql.jsx)("canvas", {
					className: "str-video__background-filters__target-canvas",
					..._,
					ref: h
				})
			]
		})
	};
};
//#endregion
export { su as BackgroundFiltersProvider };
