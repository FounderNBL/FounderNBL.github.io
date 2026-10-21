import { n as e, r as t, t as n } from "./nbl-studios-live-chunk-rolldown-runtime.js";
//#region node_modules/react/cjs/react.production.js
var r = /* @__PURE__ */ n(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.for("react.view_transition"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var ee = x.prototype = new b();
	ee.constructor = x, _(ee, y.prototype), ee.isPureReactComponent = !0;
	var te = Array.isArray;
	function S() {}
	var C = {
		H: null,
		A: null,
		T: null,
		S: null
	}, ne = Object.prototype.hasOwnProperty;
	function re(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function w(e, t) {
		return re(e.type, t, e.props);
	}
	function ie(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function ae(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var T = /\/+/g;
	function E(e, t) {
		return typeof e == "object" && e && e.key != null ? ae("" + e.key) : t.toString(36);
	}
	function oe(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(S, S) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function se(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, se(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + E(e, 0) : a, te(o) ? (i = "", c != null && (i = c.replace(T, "$&/") + "/"), se(o, r, i, "", function(e) {
			return e;
		})) : o != null && (ie(o) && (o = w(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(T, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (te(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + E(a, u), c += se(a, r, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + E(a, u++), c += se(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return se(oe(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ce(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return se(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function le(e) {
		if (e._status === -1) {
			var t = e._result, n = t();
			n.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t, n.status === void 0 && (n.status = "fulfilled", n.value = t));
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t, n.status === void 0 && (n.status = "rejected", n.reason = t));
			}), e._status === -1 && (e._status = 0, e._result = n);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var ue = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	};
	function D(e) {
		var t = C.T, n = {};
		n.types = t === null ? null : t.types, C.T = n;
		try {
			var r = e(), i = C.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(S, ue);
		} catch (e) {
			ue(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), C.T = t;
		}
	}
	function de(e) {
		var t = C.T;
		if (t !== null) {
			var n = t.types;
			n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
		} else D(de.bind(null, e));
	}
	var fe = {
		map: ce,
		forEach: function(e, t, n) {
			ce(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ce(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ce(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!ie(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = fe, e.Component = y, e.Fragment = r, e.Profiler = a, e.PureComponent = x, e.StrictMode = i, e.Suspense = l, e.ViewTransition = p, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = C, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return C.H.useMemoCache(e);
		}
	}, e.addTransitionType = de, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !ne.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return re(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) ne.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return re(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = ie, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: le
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = D, e.unstable_useCacheRefresh = function() {
		return C.H.useCacheRefresh();
	}, e.use = function(e) {
		return C.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return C.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return C.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return C.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return C.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return C.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return C.H.useEffectEvent(e);
	}, e.useId = function() {
		return C.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return C.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return C.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return C.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return C.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return C.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return C.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return C.H.useRef(e);
	}, e.useState = function(e) {
		return C.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return C.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return C.H.useTransition();
	}, e.version = "19.3.1";
})), i = /* @__PURE__ */ n(((e, t) => {
	process.env.NODE_ENV !== "production" && (function() {
		function n(e, t) {
			Object.defineProperty(a.prototype, e, { get: function() {
				console.warn("%s(...) is deprecated in plain JavaScript React classes. %s", t[0], t[1]);
			} });
		}
		function r(e) {
			return typeof e != "object" || !e ? null : (e = Ce && e[Ce] || e["@@iterator"], typeof e == "function" ? e : null);
		}
		function i(e, t) {
			e = (e = e.constructor) && (e.displayName || e.name) || "ReactClass";
			var n = e + "." + t;
			we[n] || (console.error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", t, e), we[n] = !0);
		}
		function a(e, t, n) {
			this.props = e, this.context = t, this.refs = De, this.updater = n || Te;
		}
		function o() {}
		function s(e, t, n) {
			this.props = e, this.context = t, this.refs = De, this.updater = n || Te;
		}
		function c() {}
		function l(e) {
			return "" + e;
		}
		function u(e) {
			try {
				l(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var n = t.error, r = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return n.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", r), l(e);
			}
		}
		function d(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === Ae ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case de: return "Fragment";
				case pe: return "Profiler";
				case fe: return "StrictMode";
				case _e: return "Suspense";
				case ve: return "SuspenseList";
				case xe: return "Activity";
				case Se: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case D: return "Portal";
				case he: return e.displayName || "Context";
				case me: return (e._context.displayName || "Context") + ".Consumer";
				case ge:
					var t = e.render;
					return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case ye: return t = e.displayName || null, t === null ? d(e.type) || "Memo" : t;
				case be:
					t = e._payload, e = e._init;
					try {
						return d(e(t));
					} catch {}
			}
			return null;
		}
		function f(e) {
			if (e === de) return "<>";
			if (typeof e == "object" && e && e.$$typeof === be) return "<...>";
			try {
				var t = d(e);
				return t ? "<" + t + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function p() {
			var e = O.A;
			return e === null ? null : e.getOwner();
		}
		function m() {
			return Error("react-stack-top-frame");
		}
		function h(e) {
			if (je.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function g(e, t) {
			function n() {
				Ne || (Ne = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function _() {
			var e = d(this.type);
			return Fe[e] || (Fe[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function v(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: ue,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: _
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function y(e, t) {
			return t = v(e.type, t, e.props, e._owner, e._debugStack, e._debugTask), e._store && (t._store.validated = e._store.validated), t;
		}
		function b(e) {
			x(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === be && (e._payload.status === "fulfilled" ? x(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function x(e) {
			return typeof e == "object" && !!e && e.$$typeof === ue;
		}
		function ee(e) {
			var t = {
				"=": "=0",
				":": "=2"
			};
			return "$" + e.replace(/[=:]/g, function(e) {
				return t[e];
			});
		}
		function te(e, t) {
			return typeof e == "object" && e && e.key != null ? (u(e.key), ee("" + e.key)) : t.toString(36);
		}
		function S(e) {
			switch (e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
				default: switch (typeof e.status == "string" ? e.then(c, c) : (e.status = "pending", e.then(function(t) {
					e.status === "pending" && (e.status = "fulfilled", e.value = t);
				}, function(t) {
					e.status === "pending" && (e.status = "rejected", e.reason = t);
				})), e.status) {
					case "fulfilled": return e.value;
					case "rejected": throw e.reason;
				}
			}
			throw e;
		}
		function C(e, t, n, i, a) {
			var o = typeof e;
			(o === "undefined" || o === "boolean") && (e = null);
			var s = !1;
			if (e === null) s = !0;
			else switch (o) {
				case "bigint":
				case "string":
				case "number":
					s = !0;
					break;
				case "object": switch (e.$$typeof) {
					case ue:
					case D:
						s = !0;
						break;
					case be: return s = e._init, C(s(e._payload), t, n, i, a);
				}
			}
			if (s) {
				s = e, a = a(s);
				var c = i === "" ? "." + te(s, 0) : i;
				return ke(a) ? (n = "", c != null && (n = c.replace(ze, "$&/") + "/"), C(a, t, n, "", function(e) {
					return e;
				})) : a != null && (x(a) && (a.key != null && (s && s.key === a.key || u(a.key)), n = y(a, n + (a.key == null || s && s.key === a.key ? "" : ("" + a.key).replace(ze, "$&/") + "/") + c), i !== "" && s != null && x(s) && s.key == null && s._store && !s._store.validated && (n._store.validated = 2), a = n), t.push(a)), 1;
			}
			if (s = 0, c = i === "" ? "." : i + ":", ke(e)) for (var l = 0; l < e.length; l++) i = e[l], o = c + te(i, l), s += C(i, t, n, o, a);
			else if (l = r(e), typeof l == "function") for (l === e.entries && (Re || console.warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Re = !0), e = l.call(e), l = 0; !(i = e.next()).done;) i = i.value, o = c + te(i, l++), s += C(i, t, n, o, a);
			else if (o === "object") {
				if (typeof e.then == "function") return C(S(e), t, n, i, a);
				throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
			}
			return s;
		}
		function ne(e, t, n) {
			if (e == null) return e;
			var r = [], i = 0;
			return C(e, r, "", "", function(e) {
				return t.call(n, e, i++);
			}), r;
		}
		function re(e) {
			if (e._status === -1) {
				var t = null, n = null, r = e._ioInfo;
				r != null && (r.start = r.end = performance.now(), r.value = new Promise(function(e, r) {
					t = e, n = r;
				})), r = e._result;
				var i = r();
				if (i.then(function(n) {
					if (e._status === 0 || e._status === -1) {
						e._status = 1, e._result = n;
						var r = e._ioInfo;
						if (r != null) {
							r.end = performance.now();
							var a = n?.default;
							t(a), r.value.status = "fulfilled", r.value.value = a;
						}
						i.status === void 0 && (i.status = "fulfilled", i.value = n);
					}
				}, function(t) {
					if (e._status === 0 || e._status === -1) {
						e._status = 2, e._result = t;
						var r = e._ioInfo;
						r != null && (r.end = performance.now(), r.value.then(c, c), n(t), r.value.status = "rejected", r.value.reason = t), i.status === void 0 && (i.status = "rejected", i.reason = t);
					}
				}), r = e._ioInfo, r != null) {
					var a = i.displayName;
					typeof a == "string" && (r.name = a);
				}
				e._status === -1 && (e._status = 0, e._result = i);
			}
			if (e._status === 1) return r = e._result, r === void 0 && console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", r), "default" in r || console.error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", r), r.default;
			throw e._result;
		}
		function w() {
			var e = O.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		function ie() {
			O.asyncTransitions--;
		}
		function ae(e) {
			var t = O.T, n = {};
			n.types = t === null ? null : t.types, n._updatedFibers = /* @__PURE__ */ new Set(), O.T = n;
			try {
				var r = e(), i = O.S;
				i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && (O.asyncTransitions++, r.then(ie, ie), r.then(c, Be));
			} catch (e) {
				Be(e);
			} finally {
				t === null && n._updatedFibers && (e = n._updatedFibers.size, n._updatedFibers.clear(), 10 < e && console.warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.")), t !== null && n.types !== null && (t.types !== null && t.types !== n.types && console.error("We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."), t.types = n.types), O.T = t;
			}
		}
		function T(e) {
			var t = O.T;
			if (t !== null) {
				var n = t.types;
				n === null ? t.types = [e] : n.indexOf(e) === -1 && n.push(e);
			} else O.asyncTransitions === 0 && console.error("addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition."), ae(T.bind(null, e));
		}
		function E(e) {
			if (He === null) try {
				var n = ("require" + Math.random()).slice(0, 7);
				He = (t && t[n]).call(t, "timers").setImmediate;
			} catch {
				He = function(e) {
					!1 === Ve && (Ve = !0, typeof MessageChannel > "u" && console.error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
					var t = new MessageChannel();
					t.port1.onmessage = e, t.port2.postMessage(void 0);
				};
			}
			return He(e);
		}
		function oe(e) {
			return 1 < e.length && typeof AggregateError == "function" ? AggregateError(e) : e[0];
		}
		function se(e, t) {
			t !== Ue - 1 && console.error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), Ue = t;
		}
		function ce(e, t, n) {
			var r = O.actQueue;
			if (r !== null) {
				if (r.length !== 0) try {
					le(r), E(function() {
						return ce(e, t, n);
					});
					return;
				} catch (e) {
					O.thrownErrors.push(e);
				}
				else O.actQueue = null;
			}
			0 < O.thrownErrors.length ? (r = oe(O.thrownErrors), O.thrownErrors.length = 0, n(r)) : t(e);
		}
		function le(e) {
			if (!Ge) {
				Ge = !0;
				var t = 0;
				try {
					for (; t < e.length; t++) {
						var n = e[t];
						do {
							O.didUsePromise = !1;
							var r = n(!1);
							if (r !== null) {
								if (O.didUsePromise) {
									e[t] = n, e.splice(0, t);
									return;
								}
								n = r;
							} else break;
						} while (1);
					}
					e.length = 0;
				} catch (n) {
					e.splice(0, t + 1), O.thrownErrors.push(n);
				} finally {
					Ge = !1;
				}
			}
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var ue = Symbol.for("react.transitional.element"), D = Symbol.for("react.portal"), de = Symbol.for("react.fragment"), fe = Symbol.for("react.strict_mode"), pe = Symbol.for("react.profiler"), me = Symbol.for("react.consumer"), he = Symbol.for("react.context"), ge = Symbol.for("react.forward_ref"), _e = Symbol.for("react.suspense"), ve = Symbol.for("react.suspense_list"), ye = Symbol.for("react.memo"), be = Symbol.for("react.lazy"), xe = Symbol.for("react.activity"), Se = Symbol.for("react.view_transition"), Ce = Symbol.iterator, we = {}, Te = {
			isMounted: function() {
				return !1;
			},
			enqueueForceUpdate: function(e) {
				i(e, "forceUpdate");
			},
			enqueueReplaceState: function(e) {
				i(e, "replaceState");
			},
			enqueueSetState: function(e) {
				i(e, "setState");
			}
		}, Ee = Object.assign, De = {};
		Object.freeze(De), a.prototype.isReactComponent = {}, a.prototype.setState = function(e, t) {
			if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
			this.updater.enqueueSetState(this, e, t, "setState");
		}, a.prototype.forceUpdate = function(e) {
			this.updater.enqueueForceUpdate(this, e, "forceUpdate");
		};
		var Oe = {
			isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
			replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
		};
		for (qe in Oe) Oe.hasOwnProperty(qe) && n(qe, Oe[qe]);
		o.prototype = a.prototype, Oe = s.prototype = new o(), Oe.constructor = s, Ee(Oe, a.prototype), Oe.isPureReactComponent = !0;
		var ke = Array.isArray, Ae = Symbol.for("react.client.reference"), O = {
			H: null,
			A: null,
			T: null,
			S: null,
			actQueue: null,
			asyncTransitions: 0,
			isBatchingLegacy: !1,
			didScheduleLegacyUpdate: !1,
			didUsePromise: !1,
			thrownErrors: [],
			getCurrentStack: null,
			recentlyCreatedOwnerStacks: 0
		}, je = Object.prototype.hasOwnProperty, Me = console.createTask ? console.createTask : function() {
			return null;
		};
		Oe = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var Ne, Pe, Fe = {}, Ie = Oe.react_stack_bottom_frame.bind(Oe, m)(), Le = Me(f(m)), Re = !1, ze = /\/+/g, Be = typeof reportError == "function" ? reportError : function(e) {
			if (typeof window == "object" && typeof window.ErrorEvent == "function") {
				var t = new window.ErrorEvent("error", {
					bubbles: !0,
					cancelable: !0,
					message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
					error: e
				});
				if (!window.dispatchEvent(t)) return;
			} else if (typeof process == "object" && typeof process.emit == "function") {
				process.emit("uncaughtException", e);
				return;
			}
			console.error(e);
		}, Ve = !1, He = null, Ue = 0, We = !1, Ge = !1, Ke = typeof queueMicrotask == "function" ? function(e) {
			queueMicrotask(function() {
				return queueMicrotask(e);
			});
		} : E;
		Oe = Object.freeze({
			__proto__: null,
			c: function(e) {
				return w().useMemoCache(e);
			}
		});
		var qe = {
			map: ne,
			forEach: function(e, t, n) {
				ne(e, function() {
					t.apply(this, arguments);
				}, n);
			},
			count: function(e) {
				var t = 0;
				return ne(e, function() {
					t++;
				}), t;
			},
			toArray: function(e) {
				return ne(e, function(e) {
					return e;
				}) || [];
			},
			only: function(e) {
				if (!x(e)) throw Error("React.Children.only expected to receive a single React element child.");
				return e;
			}
		};
		e.Activity = xe, e.Children = qe, e.Component = a, e.Fragment = de, e.Profiler = pe, e.PureComponent = s, e.StrictMode = fe, e.Suspense = _e, e.ViewTransition = Se, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = O, e.__COMPILER_RUNTIME = Oe, e.act = function(e) {
			var t = O.actQueue, n = Ue;
			Ue++;
			var r = O.actQueue = t === null ? [] : t, i = !1;
			try {
				var a = e();
			} catch (e) {
				O.thrownErrors.push(e);
			}
			if (0 < O.thrownErrors.length) throw se(t, n), e = oe(O.thrownErrors), O.thrownErrors.length = 0, e;
			if (typeof a == "object" && a && typeof a.then == "function") {
				var o = a;
				return Ke(function() {
					i || We || (We = !0, console.error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
				}), { then: function(e, a) {
					i = !0, o.then(function(i) {
						if (se(t, n), n === 0) {
							try {
								le(r), E(function() {
									return ce(i, e, a);
								});
							} catch (e) {
								O.thrownErrors.push(e);
							}
							if (0 < O.thrownErrors.length) {
								var o = oe(O.thrownErrors);
								O.thrownErrors.length = 0, a(o);
							}
						} else e(i);
					}, function(e) {
						se(t, n), 0 < O.thrownErrors.length && (e = oe(O.thrownErrors), O.thrownErrors.length = 0), a(e);
					});
				} };
			}
			var s = a;
			if (se(t, n), n === 0 && (le(r), r.length !== 0 && Ke(function() {
				i || We || (We = !0, console.error("A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"));
			}), O.actQueue = null), 0 < O.thrownErrors.length) throw e = oe(O.thrownErrors), O.thrownErrors.length = 0, e;
			return { then: function(e, t) {
				i = !0, n === 0 ? (O.actQueue = r, E(function() {
					return ce(s, e, t);
				})) : e(s);
			} };
		}, e.addTransitionType = T, e.cache = function(e) {
			return function() {
				return e.apply(null, arguments);
			};
		}, e.cacheSignal = function() {
			return null;
		}, e.captureOwnerStack = function() {
			var e = O.getCurrentStack;
			return e === null ? null : e();
		}, e.cloneElement = function(e, t, n) {
			if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
			var r = Ee({}, e.props), i = e.key, a = e._owner;
			if (t != null) {
				var o;
				a: {
					if (je.call(t, "ref") && (o = Object.getOwnPropertyDescriptor(t, "ref").get) && o.isReactWarning) {
						o = !1;
						break a;
					}
					o = t.ref !== void 0;
				}
				for (s in o && (a = p()), h(t) && (u(t.key), i = "" + t.key), t) !je.call(t, s) || s === "key" || s === "__self" || s === "__source" || s === "ref" && t.ref === void 0 || (r[s] = t[s]);
			}
			var s = arguments.length - 2;
			if (s === 1) r.children = n;
			else if (1 < s) {
				o = Array(s);
				for (var c = 0; c < s; c++) o[c] = arguments[c + 2];
				r.children = o;
			}
			for (r = v(e.type, i, r, a, e._debugStack, e._debugTask), i = 2; i < arguments.length; i++) b(arguments[i]);
			return r;
		}, e.createContext = function(e) {
			return e = {
				$$typeof: he,
				_currentValue: e,
				_currentValue2: e,
				_threadCount: 0,
				Provider: null,
				Consumer: null
			}, e.Provider = e, e.Consumer = {
				$$typeof: me,
				_context: e
			}, e._currentRenderer = null, e._currentRenderer2 = null, e;
		}, e.createElement = function(e, t, n) {
			for (var r = 2; r < arguments.length; r++) b(arguments[r]);
			var i;
			r = {};
			var a = null;
			if (t != null) for (i in Pe || !("__self" in t) || "key" in t || (Pe = !0, console.warn("Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform")), h(t) && (u(t.key), a = "" + t.key), t) je.call(t, i) && i !== "key" && i !== "__self" && i !== "__source" && (r[i] = t[i]);
			var o = arguments.length - 2;
			if (o === 1) r.children = n;
			else if (1 < o) {
				for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
				Object.freeze && Object.freeze(s), r.children = s;
			}
			if (e && e.defaultProps) for (i in o = e.defaultProps, o) r[i] === void 0 && (r[i] = o[i]);
			return a && g(r, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), (i = 1e4 > O.recentlyCreatedOwnerStacks++) ? (s = Error.stackTraceLimit, Error.stackTraceLimit = 10, o = Error("react-stack-top-frame"), Error.stackTraceLimit = s) : o = Ie, v(e, a, r, p(), o, i ? Me(f(e)) : Le);
		}, e.createRef = function() {
			var e = { current: null };
			return Object.seal(e), e;
		}, e.forwardRef = function(e) {
			e != null && e.$$typeof === ye ? console.error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof e == "function" ? e.length !== 0 && e.length !== 2 && console.error("forwardRef render functions accept exactly two parameters: props and ref. %s", e.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.") : console.error("forwardRef requires a render function but was given %s.", e === null ? "null" : typeof e), e != null && e.defaultProps != null && console.error("forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?");
			var t = {
				$$typeof: ge,
				render: e
			}, n;
			return Object.defineProperty(t, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return n;
				},
				set: function(t) {
					n = t, e.name || e.displayName || (Object.defineProperty(e, "name", { value: t }), e.displayName = t);
				}
			}), t;
		}, e.isValidElement = x, e.lazy = function(e) {
			e = {
				_status: -1,
				_result: e
			};
			var t = {
				$$typeof: be,
				_payload: e,
				_init: re
			}, n = {
				name: "lazy",
				start: -1,
				end: -1,
				value: null,
				owner: null,
				debugStack: Error("react-stack-top-frame"),
				debugTask: console.createTask ? console.createTask("lazy()") : null
			};
			return e._ioInfo = n, t._debugInfo = [{ awaited: n }], t;
		}, e.memo = function(e, t) {
			e ?? console.error("memo: The first argument must be a component. Instead received: %s", e === null ? "null" : typeof e), t = {
				$$typeof: ye,
				type: e,
				compare: t === void 0 ? null : t
			};
			var n;
			return Object.defineProperty(t, "displayName", {
				enumerable: !1,
				configurable: !0,
				get: function() {
					return n;
				},
				set: function(t) {
					n = t, e.name || e.displayName || (Object.defineProperty(e, "name", { value: t }), e.displayName = t);
				}
			}), t;
		}, e.startTransition = ae, e.unstable_useCacheRefresh = function() {
			return w().useCacheRefresh();
		}, e.use = function(e) {
			return w().use(e);
		}, e.useActionState = function(e, t, n) {
			return w().useActionState(e, t, n);
		}, e.useCallback = function(e, t) {
			return w().useCallback(e, t);
		}, e.useContext = function(e) {
			var t = w();
			return e.$$typeof === me && console.error("Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"), t.useContext(e);
		}, e.useDebugValue = function(e, t) {
			return w().useDebugValue(e, t);
		}, e.useDeferredValue = function(e, t) {
			return w().useDeferredValue(e, t);
		}, e.useEffect = function(e, t) {
			return e ?? console.warn("React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"), w().useEffect(e, t);
		}, e.useEffectEvent = function(e) {
			return w().useEffectEvent(e);
		}, e.useId = function() {
			return w().useId();
		}, e.useImperativeHandle = function(e, t, n) {
			return w().useImperativeHandle(e, t, n);
		}, e.useInsertionEffect = function(e, t) {
			return e ?? console.warn("React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"), w().useInsertionEffect(e, t);
		}, e.useLayoutEffect = function(e, t) {
			return e ?? console.warn("React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"), w().useLayoutEffect(e, t);
		}, e.useMemo = function(e, t) {
			return w().useMemo(e, t);
		}, e.useOptimistic = function(e, t) {
			return w().useOptimistic(e, t);
		}, e.useReducer = function(e, t, n) {
			return w().useReducer(e, t, n);
		}, e.useRef = function(e) {
			return w().useRef(e);
		}, e.useState = function(e) {
			return w().useState(e);
		}, e.useSyncExternalStore = function(e, t, n) {
			return w().useSyncExternalStore(e, t, n);
		}, e.useTransition = function() {
			return w().useTransition();
		}, e.version = "19.3.1", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), a = /* @__PURE__ */ n(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? r() : i();
})), o = /* @__PURE__ */ n(((e) => {
	var t = a();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, o = Symbol.for("react.portal"), s = Symbol.for("react.recoverable"), c = Symbol.for("react.optimistic_key");
	function l(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: o,
			key: r == null ? null : r === c ? c : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var u = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function d(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.browser = function(e) {
		return {
			$$typeof: s,
			_reason: e
		};
	}, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return l(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = u.T, n = i.p;
		try {
			if (u.T = null, i.p = 2, e) return e();
		} finally {
			u.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = d(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = d(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0,
						fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = d(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = d(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return u.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return u.H.useHostTransitionStatus();
	}, e.version = "19.3.1";
})), s = /* @__PURE__ */ n(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t() {}
		function n(e) {
			return "" + e;
		}
		function r(e, t, r) {
			var i = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
			if (i == null) i = null;
			else if (i === p) i = p;
			else {
				try {
					n(i);
					var a = !1;
				} catch {
					a = !0;
				}
				a && (console.error("The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", typeof Symbol == "function" && Symbol.toStringTag && i[Symbol.toStringTag] || i.constructor.name || "Object"), n(i)), i = "" + i;
			}
			return {
				$$typeof: d,
				key: i,
				children: e,
				containerInfo: t,
				implementation: r
			};
		}
		function i(e, t) {
			if (e === "font") return "";
			if (typeof t == "string") return t === "use-credentials" ? t : "";
		}
		function o(e) {
			return e === null ? "`null`" : e === void 0 ? "`undefined`" : e === "" ? "an empty string" : "something with type \"" + typeof e + "\"";
		}
		function s(e) {
			return e === null ? "`null`" : e === void 0 ? "`undefined`" : e === "" ? "an empty string" : typeof e == "string" ? JSON.stringify(e) : typeof e == "number" ? "`" + e + "`" : "something with type \"" + typeof e + "\"";
		}
		function c() {
			var e = m.H;
			return e === null && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."), e;
		}
		typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
		var l = a(), u = {
			d: {
				f: t,
				r: function() {
					throw Error("Invalid form element. requestFormReset must be passed a form that was rendered by React.");
				},
				D: t,
				C: t,
				L: t,
				m: t,
				X: t,
				S: t,
				M: t
			},
			p: 0,
			findDOMNode: null
		}, d = Symbol.for("react.portal"), f = Symbol.for("react.recoverable"), p = Symbol.for("react.optimistic_key"), m = l.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
		typeof Map == "function" && Map.prototype != null && typeof Map.prototype.forEach == "function" && typeof Set == "function" && Set.prototype != null && typeof Set.prototype.clear == "function" && typeof Set.prototype.forEach == "function" || console.error("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"), e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u, e.browser = function(e) {
			return {
				$$typeof: f,
				_reason: e
			};
		}, e.createPortal = function(e, t) {
			var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
			if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error("Target container is not a DOM element.");
			return r(e, t, null, n);
		}, e.flushSync = function(e) {
			var t = m.T, n = u.p;
			try {
				if (m.T = null, u.p = 2, e) return e();
			} finally {
				m.T = t, u.p = n, u.d.f() && console.error("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.");
			}
		}, e.preconnect = function(e, t) {
			typeof e == "string" && e ? t != null && typeof t != "object" ? console.error("ReactDOM.preconnect(): Expected the `options` argument (second) to be an object but encountered %s instead. The only supported option at this time is `crossOrigin` which accepts a string.", s(t)) : t != null && typeof t.crossOrigin != "string" && console.error("ReactDOM.preconnect(): Expected the `crossOrigin` option (second argument) to be a string but encountered %s instead. Try removing this option or passing a string value instead.", o(t.crossOrigin)) : console.error("ReactDOM.preconnect(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", o(e)), typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, u.d.C(e, t));
		}, e.prefetchDNS = function(e) {
			if (typeof e != "string" || !e) console.error("ReactDOM.prefetchDNS(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", o(e));
			else if (1 < arguments.length) {
				var t = arguments[1];
				typeof t == "object" && t.hasOwnProperty("crossOrigin") ? console.error("ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. It looks like the you are attempting to set a crossOrigin property for this DNS lookup hint. Browsers do not perform DNS queries using CORS and setting this attribute on the resource hint has no effect. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.", s(t)) : console.error("ReactDOM.prefetchDNS(): Expected only one argument, `href`, but encountered %s as a second argument instead. This argument is reserved for future options and is currently disallowed. Try calling ReactDOM.prefetchDNS() with just a single string argument, `href`.", s(t));
			}
			typeof e == "string" && u.d.D(e);
		}, e.preinit = function(e, t) {
			if (typeof e == "string" && e ? typeof t != "object" || !t ? console.error("ReactDOM.preinit(): Expected the `options` argument (second) to be an object with an `as` property describing the type of resource to be preinitialized but encountered %s instead.", s(t)) : t.as !== "style" && t.as !== "script" && console.error("ReactDOM.preinit(): Expected the `as` property in the `options` argument (second) to contain a valid value describing the type of resource to be preinitialized but encountered %s instead. Valid values for `as` are \"style\" and \"script\".", s(t.as)) : console.error("ReactDOM.preinit(): Expected the `href` argument (first) to be a non-empty string but encountered %s instead.", o(e)), typeof e == "string" && t && typeof t.as == "string") {
				var n = t.as, r = i(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, c = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
				n === "style" ? u.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
					crossOrigin: r,
					integrity: a,
					fetchPriority: c
				}) : n === "script" && u.d.X(e, {
					crossOrigin: r,
					integrity: a,
					fetchPriority: c,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0
				});
			}
		}, e.preinitModule = function(e, t) {
			var n = "";
			if (typeof e == "string" && e || (n += " The `href` argument encountered was " + o(e) + "."), t !== void 0 && typeof t != "object" ? n += " The `options` argument encountered was " + o(t) + "." : t && "as" in t && t.as !== "script" && (n += " The `as` option encountered was " + s(t.as) + "."), n) console.error("ReactDOM.preinitModule(): Expected up to two arguments, a non-empty `href` string and, optionally, an `options` object with a valid `as` property.%s", n);
			else switch (n = t && typeof t.as == "string" ? t.as : "script", n) {
				case "script": break;
				default: n = s(n), console.error("ReactDOM.preinitModule(): Currently the only supported \"as\" type for this function is \"script\" but received \"%s\" instead. This warning was generated for `href` \"%s\". In the future other module types will be supported, aligning with the import-attributes proposal. Learn more here: (https://github.com/tc39/proposal-import-attributes)", n, e);
			}
			typeof e == "string" && (typeof t == "object" && t ? (t.as == null || t.as === "script") && (n = i(t.as, t.crossOrigin), u.d.M(e, {
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
			})) : t ?? u.d.M(e));
		}, e.preload = function(e, t) {
			var n = "";
			if (typeof e == "string" && e || (n += " The `href` argument encountered was " + o(e) + "."), typeof t != "object" || !t ? n += " The `options` argument encountered was " + o(t) + "." : typeof t.as == "string" && t.as || (n += " The `as` option encountered was " + o(t.as) + "."), n && console.error("ReactDOM.preload(): Expected two arguments, a non-empty `href` string and an `options` object with an `as` property valid for a `<link rel=\"preload\" as=\"...\" />` tag.%s", n), typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
				n = t.as;
				var r = i(n, t.crossOrigin);
				u.d.L(e, n, {
					crossOrigin: r,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0,
					type: typeof t.type == "string" ? t.type : void 0,
					fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
					referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
					imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
					imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
					media: typeof t.media == "string" ? t.media : void 0
				});
			}
		}, e.preloadModule = function(e, t) {
			var n = "";
			typeof e == "string" && e || (n += " The `href` argument encountered was " + o(e) + "."), t !== void 0 && typeof t != "object" ? n += " The `options` argument encountered was " + o(t) + "." : t && "as" in t && typeof t.as != "string" && (n += " The `as` option encountered was " + o(t.as) + "."), n && console.error("ReactDOM.preloadModule(): Expected two arguments, a non-empty `href` string and, optionally, an `options` object with an `as` property valid for a `<link rel=\"modulepreload\" as=\"...\" />` tag.%s", n), typeof e == "string" && (t ? (n = i(t.as, t.crossOrigin), u.d.m(e, {
				as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0
			})) : u.d.m(e));
		}, e.requestFormReset = function(e) {
			u.d.r(e);
		}, e.unstable_batchedUpdates = function(e, t) {
			return e(t);
		}, e.useFormState = function(e, t, n) {
			return c().useFormState(e, t, n);
		}, e.useFormStatus = function() {
			return c().useHostTransitionStatus();
		}, e.version = "19.3.1", typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
	})();
})), c = /* @__PURE__ */ n(((e, t) => {
	function n() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == "function") {
			if (process.env.NODE_ENV !== "production") throw Error("^_^");
			try {
				__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
			} catch (e) {
				console.error(e);
			}
		}
	}
	process.env.NODE_ENV === "production" ? (n(), t.exports = o()) : t.exports = s();
})), l = /* @__PURE__ */ n(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), u = /* @__PURE__ */ n(((e) => {
	process.env.NODE_ENV !== "production" && (function() {
		function t(e) {
			if (e == null) return null;
			if (typeof e == "function") return e.$$typeof === ae ? null : e.displayName || e.name || null;
			if (typeof e == "string") return e;
			switch (e) {
				case v: return "Fragment";
				case b: return "Profiler";
				case y: return "StrictMode";
				case S: return "Suspense";
				case C: return "SuspenseList";
				case w: return "Activity";
				case ie: return "ViewTransition";
			}
			if (typeof e == "object") switch (typeof e.tag == "number" && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), e.$$typeof) {
				case _: return "Portal";
				case ee: return e.displayName || "Context";
				case x: return (e._context.displayName || "Context") + ".Consumer";
				case te:
					var n = e.render;
					return e = e.displayName, e ||= (e = n.displayName || n.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
				case ne: return n = e.displayName || null, n === null ? t(e.type) || "Memo" : n;
				case re:
					n = e._payload, e = e._init;
					try {
						return t(e(n));
					} catch {}
			}
			return null;
		}
		function n(e) {
			return "" + e;
		}
		function r(e) {
			try {
				n(e);
				var t = !1;
			} catch {
				t = !0;
			}
			if (t) {
				t = console;
				var r = t.error, i = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
				return r.call(t, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", i), n(e);
			}
		}
		function i(e) {
			if (e === v) return "<>";
			if (typeof e == "object" && e && e.$$typeof === re) return "<...>";
			try {
				var n = t(e);
				return n ? "<" + n + ">" : "<...>";
			} catch {
				return "<...>";
			}
		}
		function o() {
			var e = T.A;
			return e === null ? null : e.getOwner();
		}
		function s() {
			return Error("react-stack-top-frame");
		}
		function c(e) {
			if (E.call(e, "key")) {
				var t = Object.getOwnPropertyDescriptor(e, "key").get;
				if (t && t.isReactWarning) return !1;
			}
			return e.key !== void 0;
		}
		function l(e, t) {
			function n() {
				ce || (ce = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", t));
			}
			n.isReactWarning = !0, Object.defineProperty(e, "key", {
				get: n,
				configurable: !0
			});
		}
		function u() {
			var e = t(this.type);
			return le[e] || (le[e] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")), e = this.props.ref, e === void 0 ? null : e;
		}
		function d(e, t, n, r, i, a) {
			var o = n.ref;
			return e = {
				$$typeof: g,
				type: e,
				key: t,
				props: n,
				_owner: r
			}, (o === void 0 ? null : o) === null ? Object.defineProperty(e, "ref", {
				enumerable: !1,
				value: null
			}) : Object.defineProperty(e, "ref", {
				enumerable: !1,
				get: u
			}), e._store = {}, Object.defineProperty(e._store, "validated", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: 0
			}), Object.defineProperty(e, "_debugInfo", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: null
			}), Object.defineProperty(e, "_debugStack", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: i
			}), Object.defineProperty(e, "_debugTask", {
				configurable: !1,
				enumerable: !1,
				writable: !0,
				value: a
			}), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
		}
		function f(e, n, i, a, s, u) {
			var f = n.children;
			if (f !== void 0) {
				if (a) {
					if (oe(f)) {
						for (a = 0; a < f.length; a++) p(f[a]);
						Object.freeze && Object.freeze(f);
					} else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
				} else p(f);
			}
			if (E.call(n, "key")) {
				f = t(e);
				var m = Object.keys(n).filter(function(e) {
					return e !== "key";
				});
				a = 0 < m.length ? "{key: someKey, " + m.join(": ..., ") + ": ...}" : "{key: someKey}", de[f + a] || (m = 0 < m.length ? "{" + m.join(": ..., ") + ": ...}" : "{}", console.error("A props object containing a \"key\" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />", a, f, m, f), de[f + a] = !0);
			}
			if (f = null, i !== void 0 && (r(i), f = "" + i), c(n) && (r(n.key), f = "" + n.key), "key" in n) for (var h in i = {}, n) h !== "key" && (i[h] = n[h]);
			else i = n;
			return f && l(i, typeof e == "function" ? e.displayName || e.name || "Unknown" : e), d(e, f, i, o(), s, u);
		}
		function p(e) {
			m(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e && e.$$typeof === re && (e._payload.status === "fulfilled" ? m(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
		}
		function m(e) {
			return typeof e == "object" && !!e && e.$$typeof === g;
		}
		var h = a(), g = Symbol.for("react.transitional.element"), _ = Symbol.for("react.portal"), v = Symbol.for("react.fragment"), y = Symbol.for("react.strict_mode"), b = Symbol.for("react.profiler"), x = Symbol.for("react.consumer"), ee = Symbol.for("react.context"), te = Symbol.for("react.forward_ref"), S = Symbol.for("react.suspense"), C = Symbol.for("react.suspense_list"), ne = Symbol.for("react.memo"), re = Symbol.for("react.lazy"), w = Symbol.for("react.activity"), ie = Symbol.for("react.view_transition"), ae = Symbol.for("react.client.reference"), T = h.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, E = Object.prototype.hasOwnProperty, oe = Array.isArray, se = console.createTask ? console.createTask : function() {
			return null;
		};
		h = { react_stack_bottom_frame: function(e) {
			return e();
		} };
		var ce, le = {}, ue = h.react_stack_bottom_frame.bind(h, s)(), D = se(i(s)), de = {};
		e.Fragment = v, e.jsx = function(e, t, n) {
			var r = 1e4 > T.recentlyCreatedOwnerStacks++;
			if (r) {
				var a = Error.stackTraceLimit;
				Error.stackTraceLimit = 10;
				var o = Error("react-stack-top-frame");
				Error.stackTraceLimit = a;
			} else o = ue;
			return f(e, t, n, !1, o, r ? se(i(e)) : D);
		}, e.jsxs = function(e, t, n) {
			var r = 1e4 > T.recentlyCreatedOwnerStacks++;
			if (r) {
				var a = Error.stackTraceLimit;
				Error.stackTraceLimit = 10;
				var o = Error("react-stack-top-frame");
				Error.stackTraceLimit = a;
			} else o = ue;
			return f(e, t, n, !0, o, r ? se(i(e)) : D);
		};
	})();
})), d = /* @__PURE__ */ n(((e, t) => {
	t.exports = process.env.NODE_ENV === "production" ? l() : u();
})), f = d(), p = /* @__PURE__ */ t(a()), m = parseInt(p.version, 10) >= 19, h = /* @__PURE__ */ new WeakSet(), g = /* @__PURE__ */ new WeakSet(), _ = 0, v = (e) => typeof e == "object" && !!e || typeof e == "function", y = (e) => e?.slice(0, 2048), b = (e, t, n) => {
	if (e) {
		if (v(t)) {
			if (h.has(t)) return;
			h.add(t);
		}
		try {
			let r = t instanceof Error ? {
				name: t.name,
				message: y(t.message),
				stack: y(t.stack),
				componentStack: y(n)
			} : {
				message: y(String(t)),
				componentStack: y(n)
			};
			e.tracer.trace("react.renderError", r);
		} catch {}
	}
}, x = (e) => Object.keys(e).filter((e) => e.startsWith("captured:")).map((t) => e[t]), ee = class extends p.Component {
	state = { phase: "ok" };
	componentStacks = /* @__PURE__ */ new Map();
	static getDerivedStateFromError = (e) => ({
		phase: m || v(e) && g.has(e) ? "rethrow" : "captured",
		[`captured:${_++}`]: e
	});
	componentDidCatch = (e, t) => {
		this.componentStacks.set(e, t.componentStack ?? void 0), this.setState({ phase: "rethrow" });
	};
	render = () => {
		let { state: e } = this;
		if (e.phase === "rethrow") {
			let t = x(e);
			for (let e of t) {
				let t = this.componentStacks.get(e);
				b(this.props.call, e, t);
			}
			let [n] = t;
			throw v(n) && g.add(n), n;
		}
		return e.phase === "captured" ? null : this.props.children;
	};
}, te = (0, p.createContext)(void 0), S = (e) => {
	let { call: t, children: n } = e;
	return (0, f.jsx)(te.Provider, {
		value: t,
		children: (0, f.jsx)(ee, {
			call: t,
			children: n
		})
	});
}, C = () => (0, p.useContext)(te), ne = !0, re = !0;
function w(e, t, n) {
	let r = e.match(t);
	return r && r.length >= n && parseFloat(r[n], 10);
}
function ie(e, t, n) {
	if (!e.RTCPeerConnection) return;
	let r = e.RTCPeerConnection.prototype, i = r.addEventListener;
	r.addEventListener = function(e, r) {
		if (e !== t) return i.apply(this, arguments);
		let a = (e) => {
			let t = n(e);
			t && (r.handleEvent ? r.handleEvent(t) : r(t));
		};
		return this._eventMap = this._eventMap || {}, this._eventMap[t] || (this._eventMap[t] = /* @__PURE__ */ new Map()), this._eventMap[t].set(r, a), i.apply(this, [e, a]);
	};
	let a = r.removeEventListener;
	r.removeEventListener = function(e, n) {
		if (e !== t || !this._eventMap || !this._eventMap[t] || !this._eventMap[t].has(n)) return a.apply(this, arguments);
		let r = this._eventMap[t].get(n);
		return this._eventMap[t].delete(n), this._eventMap[t].size === 0 && delete this._eventMap[t], Object.keys(this._eventMap).length === 0 && delete this._eventMap, a.apply(this, [e, r]);
	}, Object.defineProperty(r, "on" + t, {
		get() {
			return this["_on" + t];
		},
		set(e) {
			this["_on" + t] && (this.removeEventListener(t, this["_on" + t]), delete this["_on" + t]), e && this.addEventListener(t, this["_on" + t] = e);
		},
		enumerable: !0,
		configurable: !0
	});
}
function ae(e) {
	return typeof e == "boolean" ? (ne = e, e ? "adapter.js logging disabled" : "adapter.js logging enabled") : /* @__PURE__ */ Error("Argument type: " + typeof e + ". Please use a boolean.");
}
function T(e) {
	return typeof e == "boolean" ? (re = !e, "adapter.js deprecation warnings " + (e ? "disabled" : "enabled")) : /* @__PURE__ */ Error("Argument type: " + typeof e + ". Please use a boolean.");
}
function E() {
	if (typeof window == "object") {
		if (ne) return;
		typeof console < "u" && typeof console.log == "function" && console.log.apply(console, arguments);
	}
}
function oe(e, t) {
	re && console.warn(e + " is deprecated, please use " + t + " instead.");
}
function se(e) {
	let t = {
		browser: null,
		version: null
	};
	if (e === void 0 || !e.navigator || !e.navigator.userAgent) return t.browser = "Not a browser.", t;
	let { navigator: n } = e;
	if (n.mozGetUserMedia) t.browser = "firefox", t.version = parseInt(w(n.userAgent, /Firefox\/(\d+)\./, 1));
	else if (n.webkitGetUserMedia || e.isSecureContext === !1 && e.webkitRTCPeerConnection) t.browser = "chrome", t.version = parseInt(w(n.userAgent, /Chrom(e|ium)\/(\d+)\./, 2));
	else if (e.RTCPeerConnection && n.userAgent.match(/AppleWebKit\/(\d+)\./)) t.browser = "safari", t.version = parseInt(w(n.userAgent, /AppleWebKit\/(\d+)\./, 1)), t.supportsUnifiedPlan = e.RTCRtpTransceiver && "currentDirection" in e.RTCRtpTransceiver.prototype, t._safariVersion = w(n.userAgent, /Version\/(\d+(\.?\d+))/, 1);
	else return t.browser = "Not a supported browser.", t;
	return t;
}
function ce(e) {
	return Object.prototype.toString.call(e) === "[object Object]";
}
function le(e) {
	return ce(e) ? Object.keys(e).reduce(function(t, n) {
		let r = ce(e[n]), i = r ? le(e[n]) : e[n], a = r && !Object.keys(i).length;
		return i === void 0 || a ? t : Object.assign(t, { [n]: i });
	}, {}) : e;
}
function ue(e, t, n) {
	t && !n.has(t.id) && (n.set(t.id, t), Object.keys(t).forEach((r) => {
		r.endsWith("Id") ? ue(e, e.get(t[r]), n) : r.endsWith("Ids") && t[r].forEach((t) => {
			ue(e, e.get(t), n);
		});
	}));
}
function D(e, t, n) {
	let r = n ? "outbound-rtp" : "inbound-rtp", i = /* @__PURE__ */ new Map();
	if (t === null) return i;
	let a = [];
	return e.forEach((e) => {
		e.type === "track" && e.trackIdentifier === t.id && a.push(e);
	}), a.forEach((t) => {
		e.forEach((n) => {
			n.type === r && n.trackId === t.id && ue(e, n, i);
		});
	}), i;
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
var de = E;
function fe(e, t) {
	let n = e && e.navigator;
	if (!n.mediaDevices) return;
	let r = function(e) {
		if (typeof e != "object" || e.mandatory || e.optional) return e;
		let t = {};
		return Object.keys(e).forEach((n) => {
			if (n === "require" || n === "advanced" || n === "mediaSource") return;
			let r = typeof e[n] == "object" ? e[n] : { ideal: e[n] };
			r.exact !== void 0 && typeof r.exact == "number" && (r.min = r.max = r.exact);
			let i = function(e, t) {
				return e ? e + t.charAt(0).toUpperCase() + t.slice(1) : t === "deviceId" ? "sourceId" : t;
			};
			if (r.ideal !== void 0) {
				t.optional = t.optional || [];
				let e = {};
				typeof r.ideal == "number" ? (e[i("min", n)] = r.ideal, t.optional.push(e), e = {}, e[i("max", n)] = r.ideal, t.optional.push(e)) : (e[i("", n)] = r.ideal, t.optional.push(e));
			}
			r.exact !== void 0 && typeof r.exact != "number" ? (t.mandatory = t.mandatory || {}, t.mandatory[i("", n)] = r.exact) : ["min", "max"].forEach((e) => {
				r[e] !== void 0 && (t.mandatory = t.mandatory || {}, t.mandatory[i(e, n)] = r[e]);
			});
		}), e.advanced && (t.optional = (t.optional || []).concat(e.advanced)), t;
	}, i = function(e, i) {
		if (t.version >= 61) return i(e);
		if (e = JSON.parse(JSON.stringify(e)), e && typeof e.audio == "object") {
			let t = function(e, t, n) {
				t in e && !(n in e) && (e[n] = e[t], delete e[t]);
			};
			e = JSON.parse(JSON.stringify(e)), t(e.audio, "autoGainControl", "googAutoGainControl"), t(e.audio, "noiseSuppression", "googNoiseSuppression"), e.audio = r(e.audio);
		}
		if (e && typeof e.video == "object") {
			let a = e.video.facingMode;
			a &&= typeof a == "object" ? a : { ideal: a };
			let o = t.version < 66;
			if (a && (a.exact === "user" || a.exact === "environment" || a.ideal === "user" || a.ideal === "environment") && !(n.mediaDevices.getSupportedConstraints && n.mediaDevices.getSupportedConstraints().facingMode && !o)) {
				delete e.video.facingMode;
				let t;
				if (a.exact === "environment" || a.ideal === "environment" ? t = ["back", "rear"] : (a.exact === "user" || a.ideal === "user") && (t = ["front"]), t) return n.mediaDevices.enumerateDevices().then((n) => {
					n = n.filter((e) => e.kind === "videoinput");
					let o = n.find((e) => t.some((t) => e.label.toLowerCase().includes(t)));
					return !o && n.length && t.includes("back") && (o = n[n.length - 1]), o && (e.video.deviceId = a.exact ? { exact: o.deviceId } : { ideal: o.deviceId }), e.video = r(e.video), de("chrome: " + JSON.stringify(e)), i(e);
				});
			}
			e.video = r(e.video);
		}
		return de("chrome: " + JSON.stringify(e)), i(e);
	}, a = function(e) {
		return t.version >= 64 ? e : {
			name: {
				PermissionDeniedError: "NotAllowedError",
				PermissionDismissedError: "NotAllowedError",
				InvalidStateError: "NotAllowedError",
				DevicesNotFoundError: "NotFoundError",
				ConstraintNotSatisfiedError: "OverconstrainedError",
				TrackStartError: "NotReadableError",
				MediaDeviceFailedDueToShutdown: "NotAllowedError",
				MediaDeviceKillSwitchOn: "NotAllowedError",
				TabCaptureError: "AbortError",
				ScreenCaptureError: "AbortError",
				DeviceCaptureError: "AbortError"
			}[e.name] || e.name,
			message: e.message,
			constraint: e.constraint || e.constraintName,
			toString() {
				return this.name + (this.message && ": ") + this.message;
			}
		};
	};
	if (n.getUserMedia = function(e, t, r) {
		i(e, (e) => {
			n.webkitGetUserMedia(e, t, (e) => {
				r && r(a(e));
			});
		});
	}.bind(n), n.mediaDevices.getUserMedia) {
		let e = n.mediaDevices.getUserMedia.bind(n.mediaDevices);
		n.mediaDevices.getUserMedia = function(t) {
			return i(t, (t) => e(t).then((e) => {
				if (t.audio && !e.getAudioTracks().length || t.video && !e.getVideoTracks().length) throw e.getTracks().forEach((e) => {
					e.stop();
				}), new DOMException("", "NotFoundError");
				return e;
			}, (e) => Promise.reject(a(e))));
		};
	}
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/chrome/getdisplaymedia.js
function pe(e, t) {
	e.navigator.mediaDevices && "getDisplayMedia" in e.navigator.mediaDevices || e.navigator.mediaDevices && (typeof t == "function" ? e.navigator.mediaDevices.getDisplayMedia = function(n) {
		return t(n).then((t) => {
			let r = n.video && n.video.width, i = n.video && n.video.height;
			return n.video = { mandatory: {
				chromeMediaSource: "desktop",
				chromeMediaSourceId: t,
				maxFrameRate: n.video && n.video.frameRate || 3
			} }, r && (n.video.mandatory.maxWidth = r), i && (n.video.mandatory.maxHeight = i), e.navigator.mediaDevices.getUserMedia(n);
		});
	} : console.error("shimGetDisplayMedia: getSourceId argument is not a function"));
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
var me = /* @__PURE__ */ e({
	fixNegotiationNeeded: () => Ce,
	shimAddTrackRemoveTrack: () => xe,
	shimAddTrackRemoveTrackWithNative: () => be,
	shimGetDisplayMedia: () => pe,
	shimGetSendersWithDtmf: () => _e,
	shimGetStats: () => ve,
	shimGetUserMedia: () => fe,
	shimMediaStream: () => he,
	shimOnTrack: () => ge,
	shimPeerConnection: () => Se,
	shimSenderReceiverGetStats: () => ye
});
function he(e) {
	e.MediaStream = e.MediaStream || e.webkitMediaStream;
}
function ge(e) {
	if (typeof e == "object" && e.RTCPeerConnection && !("ontrack" in e.RTCPeerConnection.prototype)) {
		Object.defineProperty(e.RTCPeerConnection.prototype, "ontrack", {
			get() {
				return this._ontrack;
			},
			set(e) {
				this._ontrack && this.removeEventListener("track", this._ontrack), this.addEventListener("track", this._ontrack = e);
			},
			enumerable: !0,
			configurable: !0
		});
		let t = e.RTCPeerConnection.prototype.setRemoteDescription;
		e.RTCPeerConnection.prototype.setRemoteDescription = function() {
			return this._ontrackpoly || (this._ontrackpoly = (t) => {
				t.stream.addEventListener("addtrack", (n) => {
					let r;
					r = e.RTCPeerConnection.prototype.getReceivers ? this.getReceivers().find((e) => e.track && e.track.id === n.track.id) : { track: n.track };
					let i = new Event("track");
					i.track = n.track, i.receiver = r, i.transceiver = { receiver: r }, i.streams = [t.stream], this.dispatchEvent(i);
				}), t.stream.getTracks().forEach((n) => {
					let r;
					r = e.RTCPeerConnection.prototype.getReceivers ? this.getReceivers().find((e) => e.track && e.track.id === n.id) : { track: n };
					let i = new Event("track");
					i.track = n, i.receiver = r, i.transceiver = { receiver: r }, i.streams = [t.stream], this.dispatchEvent(i);
				});
			}, this.addEventListener("addstream", this._ontrackpoly)), t.apply(this, arguments);
		};
	} else ie(e, "track", (e) => (e.transceiver || Object.defineProperty(e, "transceiver", { value: { receiver: e.receiver } }), e));
}
function _e(e) {
	if (typeof e == "object" && e.RTCPeerConnection && !("getSenders" in e.RTCPeerConnection.prototype) && "createDTMFSender" in e.RTCPeerConnection.prototype) {
		let t = function(e, t) {
			return {
				track: t,
				get dtmf() {
					return this._dtmf === void 0 && (this._dtmf = t.kind === "audio" ? e.createDTMFSender(t) : null), this._dtmf;
				},
				_pc: e
			};
		};
		if (!e.RTCPeerConnection.prototype.getSenders) {
			e.RTCPeerConnection.prototype.getSenders = function() {
				return this._senders = this._senders || [], this._senders.slice();
			};
			let n = e.RTCPeerConnection.prototype.addTrack;
			e.RTCPeerConnection.prototype.addTrack = function(e, r) {
				let i = n.apply(this, arguments);
				return i || (i = t(this, e), this._senders.push(i)), i;
			};
			let r = e.RTCPeerConnection.prototype.removeTrack;
			e.RTCPeerConnection.prototype.removeTrack = function(e) {
				r.apply(this, arguments);
				let t = this._senders.indexOf(e);
				t !== -1 && this._senders.splice(t, 1);
			};
		}
		let n = e.RTCPeerConnection.prototype.addStream;
		e.RTCPeerConnection.prototype.addStream = function(e) {
			this._senders = this._senders || [], n.apply(this, [e]), e.getTracks().forEach((e) => {
				this._senders.push(t(this, e));
			});
		};
		let r = e.RTCPeerConnection.prototype.removeStream;
		e.RTCPeerConnection.prototype.removeStream = function(e) {
			this._senders = this._senders || [], r.apply(this, [e]), e.getTracks().forEach((e) => {
				let t = this._senders.find((t) => t.track === e);
				t && this._senders.splice(this._senders.indexOf(t), 1);
			});
		};
	} else if (typeof e == "object" && e.RTCPeerConnection && "getSenders" in e.RTCPeerConnection.prototype && "createDTMFSender" in e.RTCPeerConnection.prototype && e.RTCRtpSender && !("dtmf" in e.RTCRtpSender.prototype)) {
		let t = e.RTCPeerConnection.prototype.getSenders;
		e.RTCPeerConnection.prototype.getSenders = function() {
			let e = t.apply(this, []);
			return e.forEach((e) => e._pc = this), e;
		}, Object.defineProperty(e.RTCRtpSender.prototype, "dtmf", { get() {
			return this._dtmf === void 0 && (this._dtmf = this.track.kind === "audio" ? this._pc.createDTMFSender(this.track) : null), this._dtmf;
		} });
	}
}
function ve(e) {
	if (!e.RTCPeerConnection) return;
	let t = e.RTCPeerConnection.prototype.getStats;
	e.RTCPeerConnection.prototype.getStats = function() {
		let [e, n, r] = arguments;
		if (arguments.length > 0 && typeof e == "function") return t.apply(this, arguments);
		if (t.length === 0 && (arguments.length === 0 || typeof e != "function")) return t.apply(this, []);
		let i = function(e) {
			let t = {};
			return e.result().forEach((e) => {
				let n = {
					id: e.id,
					timestamp: e.timestamp,
					type: {
						localcandidate: "local-candidate",
						remotecandidate: "remote-candidate"
					}[e.type] || e.type
				};
				e.names().forEach((t) => {
					n[t] = e.stat(t);
				}), t[n.id] = n;
			}), t;
		}, a = function(e) {
			return new Map(Object.keys(e).map((t) => [t, e[t]]));
		};
		return arguments.length >= 2 ? t.apply(this, [function(e) {
			n(a(i(e)));
		}, e]) : new Promise((e, n) => {
			t.apply(this, [function(t) {
				e(a(i(t)));
			}, n]);
		}).then(n, r);
	};
}
function ye(e) {
	if (!(typeof e == "object" && e.RTCPeerConnection && e.RTCRtpSender && e.RTCRtpReceiver)) return;
	if (!("getStats" in e.RTCRtpSender.prototype)) {
		let t = e.RTCPeerConnection.prototype.getSenders;
		t && (e.RTCPeerConnection.prototype.getSenders = function() {
			let e = t.apply(this, []);
			return e.forEach((e) => e._pc = this), e;
		});
		let n = e.RTCPeerConnection.prototype.addTrack;
		n && (e.RTCPeerConnection.prototype.addTrack = function() {
			let e = n.apply(this, arguments);
			return e._pc = this, e;
		}), e.RTCRtpSender.prototype.getStats = function() {
			let e = this;
			return this._pc.getStats().then((t) => D(t, e.track, !0));
		};
	}
	if (!("getStats" in e.RTCRtpReceiver.prototype)) {
		let t = e.RTCPeerConnection.prototype.getReceivers;
		t && (e.RTCPeerConnection.prototype.getReceivers = function() {
			let e = t.apply(this, []);
			return e.forEach((e) => e._pc = this), e;
		}), ie(e, "track", (e) => (e.receiver._pc = e.srcElement, e)), e.RTCRtpReceiver.prototype.getStats = function() {
			let e = this;
			return this._pc.getStats().then((t) => D(t, e.track, !1));
		};
	}
	if (!("getStats" in e.RTCRtpSender.prototype && "getStats" in e.RTCRtpReceiver.prototype)) return;
	let t = e.RTCPeerConnection.prototype.getStats;
	e.RTCPeerConnection.prototype.getStats = function() {
		if (arguments.length > 0 && arguments[0] instanceof e.MediaStreamTrack) {
			let e = arguments[0], t, n, r;
			return this.getSenders().forEach((n) => {
				n.track === e && (t ? r = !0 : t = n);
			}), this.getReceivers().forEach((t) => (t.track === e && (n ? r = !0 : n = t), t.track === e)), r || t && n ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : t ? t.getStats() : n ? n.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"));
		}
		return t.apply(this, arguments);
	};
}
function be(e) {
	e.RTCPeerConnection.prototype.getLocalStreams = function() {
		return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, Object.keys(this._shimmedLocalStreams).map((e) => this._shimmedLocalStreams[e][0]);
	};
	let t = e.RTCPeerConnection.prototype.addTrack;
	e.RTCPeerConnection.prototype.addTrack = function(e, n) {
		if (!n) return t.apply(this, arguments);
		this._shimmedLocalStreams = this._shimmedLocalStreams || {};
		let r = t.apply(this, arguments);
		return this._shimmedLocalStreams[n.id] ? this._shimmedLocalStreams[n.id].indexOf(r) === -1 && this._shimmedLocalStreams[n.id].push(r) : this._shimmedLocalStreams[n.id] = [n, r], r;
	};
	let n = e.RTCPeerConnection.prototype.addStream;
	e.RTCPeerConnection.prototype.addStream = function(e) {
		this._shimmedLocalStreams = this._shimmedLocalStreams || {}, e.getTracks().forEach((e) => {
			if (this.getSenders().find((t) => t.track === e)) throw new DOMException("Track already exists.", "InvalidAccessError");
		});
		let t = this.getSenders();
		n.apply(this, arguments);
		let r = this.getSenders().filter((e) => t.indexOf(e) === -1);
		this._shimmedLocalStreams[e.id] = [e].concat(r);
	};
	let r = e.RTCPeerConnection.prototype.removeStream;
	e.RTCPeerConnection.prototype.removeStream = function(e) {
		return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, delete this._shimmedLocalStreams[e.id], r.apply(this, arguments);
	};
	let i = e.RTCPeerConnection.prototype.removeTrack;
	e.RTCPeerConnection.prototype.removeTrack = function(e) {
		return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, e && Object.keys(this._shimmedLocalStreams).forEach((t) => {
			let n = this._shimmedLocalStreams[t].indexOf(e);
			n !== -1 && this._shimmedLocalStreams[t].splice(n, 1), this._shimmedLocalStreams[t].length === 1 && delete this._shimmedLocalStreams[t];
		}), i.apply(this, arguments);
	};
}
function xe(e, t) {
	if (!e.RTCPeerConnection) return;
	if (e.RTCPeerConnection.prototype.addTrack && t.version >= 65) return be(e);
	let n = e.RTCPeerConnection.prototype.getLocalStreams;
	e.RTCPeerConnection.prototype.getLocalStreams = function() {
		let e = n.apply(this);
		return this._reverseStreams = this._reverseStreams || {}, e.map((e) => this._reverseStreams[e.id]);
	};
	let r = e.RTCPeerConnection.prototype.addStream;
	e.RTCPeerConnection.prototype.addStream = function(t) {
		if (this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, t.getTracks().forEach((e) => {
			if (this.getSenders().find((t) => t.track === e)) throw new DOMException("Track already exists.", "InvalidAccessError");
		}), !this._reverseStreams[t.id]) {
			let n = new e.MediaStream(t.getTracks());
			this._streams[t.id] = n, this._reverseStreams[n.id] = t, t = n;
		}
		r.apply(this, [t]);
	};
	let i = e.RTCPeerConnection.prototype.removeStream;
	e.RTCPeerConnection.prototype.removeStream = function(e) {
		this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, i.apply(this, [this._streams[e.id] || e]), delete this._reverseStreams[this._streams[e.id] ? this._streams[e.id].id : e.id], delete this._streams[e.id];
	}, e.RTCPeerConnection.prototype.addTrack = function(t, n) {
		if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
		let r = [].slice.call(arguments, 1);
		if (r.length !== 1 || !r[0].getTracks().find((e) => e === t)) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
		if (this.getSenders().find((e) => e.track === t)) throw new DOMException("Track already exists.", "InvalidAccessError");
		this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {};
		let i = this._streams[n.id];
		if (i) i.addTrack(t), Promise.resolve().then(() => {
			this.dispatchEvent(new Event("negotiationneeded"));
		});
		else {
			let r = new e.MediaStream([t]);
			this._streams[n.id] = r, this._reverseStreams[r.id] = n, this.addStream(r);
		}
		return this.getSenders().find((e) => e.track === t);
	};
	function a(e, t) {
		let n = t.sdp;
		return Object.keys(e._reverseStreams || []).forEach((t) => {
			let r = e._reverseStreams[t], i = e._streams[r.id];
			n = n.replace(new RegExp(i.id, "g"), r.id);
		}), new RTCSessionDescription({
			type: t.type,
			sdp: n
		});
	}
	function o(e, t) {
		let n = t.sdp;
		return Object.keys(e._reverseStreams || []).forEach((t) => {
			let r = e._reverseStreams[t], i = e._streams[r.id];
			n = n.replace(new RegExp(r.id, "g"), i.id);
		}), new RTCSessionDescription({
			type: t.type,
			sdp: n
		});
	}
	["createOffer", "createAnswer"].forEach(function(t) {
		let n = e.RTCPeerConnection.prototype[t], r = { [t]() {
			let e = arguments;
			return arguments.length && typeof arguments[0] == "function" ? n.apply(this, [
				(t) => {
					let n = a(this, t);
					e[0].apply(null, [n]);
				},
				(t) => {
					e[1] && e[1].apply(null, t);
				},
				arguments[2]
			]) : n.apply(this, arguments).then((e) => a(this, e));
		} };
		e.RTCPeerConnection.prototype[t] = r[t];
	});
	let s = e.RTCPeerConnection.prototype.setLocalDescription;
	e.RTCPeerConnection.prototype.setLocalDescription = function() {
		return !arguments.length || !arguments[0].type || (arguments[0] = o(this, arguments[0])), s.apply(this, arguments);
	};
	let c = Object.getOwnPropertyDescriptor(e.RTCPeerConnection.prototype, "localDescription");
	Object.defineProperty(e.RTCPeerConnection.prototype, "localDescription", { get() {
		let e = c.get.apply(this);
		return e.type === "" ? e : a(this, e);
	} }), e.RTCPeerConnection.prototype.removeTrack = function(e) {
		if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
		if (!e._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
		if (e._pc !== this) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
		this._streams = this._streams || {};
		let t;
		Object.keys(this._streams).forEach((n) => {
			this._streams[n].getTracks().find((t) => e.track === t) && (t = this._streams[n]);
		}), t && (t.getTracks().length === 1 ? this.removeStream(this._reverseStreams[t.id]) : t.removeTrack(e.track), this.dispatchEvent(new Event("negotiationneeded")));
	};
}
function Se(e, t) {
	!e.RTCPeerConnection && e.webkitRTCPeerConnection && (e.RTCPeerConnection = e.webkitRTCPeerConnection), e.RTCPeerConnection && t.version < 53 && [
		"setLocalDescription",
		"setRemoteDescription",
		"addIceCandidate"
	].forEach(function(t) {
		let n = e.RTCPeerConnection.prototype[t], r = { [t]() {
			return arguments[0] = new (t === "addIceCandidate" ? e.RTCIceCandidate : e.RTCSessionDescription)(arguments[0]), n.apply(this, arguments);
		} };
		e.RTCPeerConnection.prototype[t] = r[t];
	});
}
function Ce(e, t) {
	ie(e, "negotiationneeded", (e) => {
		let n = e.target;
		if (!((t.version < 72 || n.getConfiguration && n.getConfiguration().sdpSemantics === "plan-b") && n.signalingState !== "stable")) return e;
	});
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
function we(e, t) {
	let n = e && e.navigator, r = e && e.MediaStreamTrack;
	if (n.getUserMedia = function(e, t, r) {
		oe("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), n.mediaDevices.getUserMedia(e).then(t, r);
	}, !(t.version > 55 && "autoGainControl" in n.mediaDevices.getSupportedConstraints())) {
		let e = function(e, t, n) {
			t in e && !(n in e) && (e[n] = e[t], delete e[t]);
		}, t = n.mediaDevices.getUserMedia.bind(n.mediaDevices);
		if (n.mediaDevices.getUserMedia = function(n) {
			return typeof n == "object" && typeof n.audio == "object" && (n = JSON.parse(JSON.stringify(n)), e(n.audio, "autoGainControl", "mozAutoGainControl"), e(n.audio, "noiseSuppression", "mozNoiseSuppression")), t(n);
		}, r && r.prototype.getSettings) {
			let t = r.prototype.getSettings;
			r.prototype.getSettings = function() {
				let n = t.apply(this, arguments);
				return e(n, "mozAutoGainControl", "autoGainControl"), e(n, "mozNoiseSuppression", "noiseSuppression"), n;
			};
		}
		if (r && r.prototype.applyConstraints) {
			let t = r.prototype.applyConstraints;
			r.prototype.applyConstraints = function(n) {
				return this.kind === "audio" && typeof n == "object" && (n = JSON.parse(JSON.stringify(n)), e(n, "autoGainControl", "mozAutoGainControl"), e(n, "noiseSuppression", "mozNoiseSuppression")), t.apply(this, [n]);
			};
		}
	}
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
function Te(e, t) {
	e.navigator.mediaDevices && "getDisplayMedia" in e.navigator.mediaDevices || e.navigator.mediaDevices && (e.navigator.mediaDevices.getDisplayMedia = function(n) {
		if (!(n && n.video)) {
			let e = new DOMException("getDisplayMedia without video constraints is undefined");
			return e.name = "NotFoundError", e.code = 8, Promise.reject(e);
		}
		return n.video === !0 ? n.video = { mediaSource: t } : n.video.mediaSource = t, e.navigator.mediaDevices.getUserMedia(n);
	});
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
var Ee = /* @__PURE__ */ e({
	shimAddTransceiver: () => Me,
	shimCreateAnswer: () => Fe,
	shimCreateOffer: () => Pe,
	shimGetDisplayMedia: () => Te,
	shimGetParameters: () => Ne,
	shimGetUserMedia: () => we,
	shimOnTrack: () => De,
	shimPeerConnection: () => Oe,
	shimRTCDataChannel: () => je,
	shimReceiverGetStats: () => Ae,
	shimRemoveStream: () => O,
	shimSenderGetStats: () => ke
});
function De(e) {
	typeof e == "object" && e.RTCTrackEvent && "receiver" in e.RTCTrackEvent.prototype && !("transceiver" in e.RTCTrackEvent.prototype) && Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver", { get() {
		return { receiver: this.receiver };
	} });
}
function Oe(e, t) {
	if (typeof e != "object" || !(e.RTCPeerConnection || e.mozRTCPeerConnection)) return;
	!e.RTCPeerConnection && e.mozRTCPeerConnection && (e.RTCPeerConnection = e.mozRTCPeerConnection), t.version < 53 && [
		"setLocalDescription",
		"setRemoteDescription",
		"addIceCandidate"
	].forEach(function(t) {
		let n = e.RTCPeerConnection.prototype[t], r = { [t]() {
			return arguments[0] = new (t === "addIceCandidate" ? e.RTCIceCandidate : e.RTCSessionDescription)(arguments[0]), n.apply(this, arguments);
		} };
		e.RTCPeerConnection.prototype[t] = r[t];
	});
	let n = {
		inboundrtp: "inbound-rtp",
		outboundrtp: "outbound-rtp",
		candidatepair: "candidate-pair",
		localcandidate: "local-candidate",
		remotecandidate: "remote-candidate"
	}, r = e.RTCPeerConnection.prototype.getStats;
	e.RTCPeerConnection.prototype.getStats = function() {
		let [e, i, a] = arguments;
		return r.apply(this, [e || null]).then((e) => {
			if (t.version < 53 && !i) try {
				e.forEach((e) => {
					e.type = n[e.type] || e.type;
				});
			} catch (t) {
				if (t.name !== "TypeError") throw t;
				e.forEach((t, r) => {
					e.set(r, Object.assign({}, t, { type: n[t.type] || t.type }));
				});
			}
			return e;
		}).then(i, a);
	};
}
function ke(e) {
	if (!(typeof e == "object" && e.RTCPeerConnection && e.RTCRtpSender) || e.RTCRtpSender && "getStats" in e.RTCRtpSender.prototype) return;
	let t = e.RTCPeerConnection.prototype.getSenders;
	t && (e.RTCPeerConnection.prototype.getSenders = function() {
		let e = t.apply(this, []);
		return e.forEach((e) => e._pc = this), e;
	});
	let n = e.RTCPeerConnection.prototype.addTrack;
	n && (e.RTCPeerConnection.prototype.addTrack = function() {
		let e = n.apply(this, arguments);
		return e._pc = this, e;
	}), e.RTCRtpSender.prototype.getStats = function() {
		return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
	};
}
function Ae(e) {
	if (!(typeof e == "object" && e.RTCPeerConnection && e.RTCRtpSender) || e.RTCRtpSender && "getStats" in e.RTCRtpReceiver.prototype) return;
	let t = e.RTCPeerConnection.prototype.getReceivers;
	t && (e.RTCPeerConnection.prototype.getReceivers = function() {
		let e = t.apply(this, []);
		return e.forEach((e) => e._pc = this), e;
	}), ie(e, "track", (e) => (e.receiver._pc = e.srcElement, e)), e.RTCRtpReceiver.prototype.getStats = function() {
		return this._pc.getStats(this.track);
	};
}
function O(e) {
	!e.RTCPeerConnection || "removeStream" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.removeStream = function(e) {
		oe("removeStream", "removeTrack"), this.getSenders().forEach((t) => {
			t.track && e.getTracks().includes(t.track) && this.removeTrack(t);
		});
	});
}
function je(e) {
	e.DataChannel && !e.RTCDataChannel && (e.RTCDataChannel = e.DataChannel);
}
function Me(e) {
	if (!(typeof e == "object" && e.RTCPeerConnection)) return;
	let t = e.RTCPeerConnection.prototype.addTransceiver;
	t && (e.RTCPeerConnection.prototype.addTransceiver = function() {
		this.setParametersPromises = [];
		let e = arguments[1] && arguments[1].sendEncodings;
		e === void 0 && (e = []), e = [...e];
		let n = e.length > 0;
		n && e.forEach((e) => {
			if ("rid" in e && !/^[a-z0-9]{0,16}$/i.test(e.rid)) throw TypeError("Invalid RID value provided.");
			if ("scaleResolutionDownBy" in e && !(parseFloat(e.scaleResolutionDownBy) >= 1)) throw RangeError("scale_resolution_down_by must be >= 1.0");
			if ("maxFramerate" in e && !(parseFloat(e.maxFramerate) >= 0)) throw RangeError("max_framerate must be >= 0.0");
		});
		let r = t.apply(this, arguments);
		if (n) {
			let { sender: t } = r, n = t.getParameters();
			(!("encodings" in n) || n.encodings.length === 1 && Object.keys(n.encodings[0]).length === 0) && (n.encodings = e, t.sendEncodings = e, this.setParametersPromises.push(t.setParameters(n).then(() => {
				delete t.sendEncodings;
			}).catch(() => {
				delete t.sendEncodings;
			})));
		}
		return r;
	});
}
function Ne(e) {
	if (!(typeof e == "object" && e.RTCRtpSender)) return;
	let t = e.RTCRtpSender.prototype.getParameters;
	t && (e.RTCRtpSender.prototype.getParameters = function() {
		let e = t.apply(this, arguments);
		return "encodings" in e || (e.encodings = [].concat(this.sendEncodings || [{}])), e;
	});
}
function Pe(e) {
	if (!(typeof e == "object" && e.RTCPeerConnection)) return;
	let t = e.RTCPeerConnection.prototype.createOffer;
	e.RTCPeerConnection.prototype.createOffer = function() {
		return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => t.apply(this, arguments)).finally(() => {
			this.setParametersPromises = [];
		}) : t.apply(this, arguments);
	};
}
function Fe(e) {
	if (!(typeof e == "object" && e.RTCPeerConnection)) return;
	let t = e.RTCPeerConnection.prototype.createAnswer;
	e.RTCPeerConnection.prototype.createAnswer = function() {
		return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => t.apply(this, arguments)).finally(() => {
			this.setParametersPromises = [];
		}) : t.apply(this, arguments);
	};
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/safari/safari_shim.js
var Ie = /* @__PURE__ */ e({
	shimAudioContext: () => Ge,
	shimCallbacksAPI: () => ze,
	shimConstraints: () => Ve,
	shimCreateOfferLegacy: () => We,
	shimGetUserMedia: () => Be,
	shimLocalStreamsAPI: () => Le,
	shimRTCIceServerUrls: () => He,
	shimRemoteStreamsAPI: () => Re,
	shimTrackEventTransceiver: () => Ue
});
function Le(e) {
	if (typeof e == "object" && e.RTCPeerConnection) {
		if ("getLocalStreams" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getLocalStreams = function() {
			return this._localStreams ||= [], this._localStreams;
		}), !("addStream" in e.RTCPeerConnection.prototype)) {
			let t = e.RTCPeerConnection.prototype.addTrack;
			e.RTCPeerConnection.prototype.addStream = function(e) {
				this._localStreams ||= [], this._localStreams.includes(e) || this._localStreams.push(e), e.getAudioTracks().forEach((n) => t.call(this, n, e)), e.getVideoTracks().forEach((n) => t.call(this, n, e));
			}, e.RTCPeerConnection.prototype.addTrack = function(e, ...n) {
				return n && n.forEach((e) => {
					this._localStreams ? this._localStreams.includes(e) || this._localStreams.push(e) : this._localStreams = [e];
				}), t.apply(this, arguments);
			};
		}
		"removeStream" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.removeStream = function(e) {
			this._localStreams ||= [];
			let t = this._localStreams.indexOf(e);
			if (t === -1) return;
			this._localStreams.splice(t, 1);
			let n = e.getTracks();
			this.getSenders().forEach((e) => {
				n.includes(e.track) && this.removeTrack(e);
			});
		});
	}
}
function Re(e) {
	if (typeof e == "object" && e.RTCPeerConnection && ("getRemoteStreams" in e.RTCPeerConnection.prototype || (e.RTCPeerConnection.prototype.getRemoteStreams = function() {
		return this._remoteStreams ? this._remoteStreams : [];
	}), !("onaddstream" in e.RTCPeerConnection.prototype))) {
		Object.defineProperty(e.RTCPeerConnection.prototype, "onaddstream", {
			get() {
				return this._onaddstream;
			},
			set(e) {
				this._onaddstream && (this.removeEventListener("addstream", this._onaddstream), this.removeEventListener("track", this._onaddstreampoly)), this.addEventListener("addstream", this._onaddstream = e), this.addEventListener("track", this._onaddstreampoly = (e) => {
					e.streams.forEach((e) => {
						if (this._remoteStreams ||= [], this._remoteStreams.includes(e)) return;
						this._remoteStreams.push(e);
						let t = new Event("addstream");
						t.stream = e, this.dispatchEvent(t);
					});
				});
			}
		});
		let t = e.RTCPeerConnection.prototype.setRemoteDescription;
		e.RTCPeerConnection.prototype.setRemoteDescription = function() {
			let e = this;
			return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function(t) {
				t.streams.forEach((t) => {
					if (e._remoteStreams ||= [], e._remoteStreams.indexOf(t) >= 0) return;
					e._remoteStreams.push(t);
					let n = new Event("addstream");
					n.stream = t, e.dispatchEvent(n);
				});
			}), t.apply(e, arguments);
		};
	}
}
function ze(e) {
	if (typeof e != "object" || !e.RTCPeerConnection) return;
	let t = e.RTCPeerConnection.prototype, n = t.createOffer, r = t.createAnswer, i = t.setLocalDescription, a = t.setRemoteDescription, o = t.addIceCandidate;
	t.createOffer = function(e, t) {
		let r = arguments.length >= 2 ? arguments[2] : arguments[0], i = n.apply(this, [r]);
		return t ? (i.then(e, t), Promise.resolve()) : i;
	}, t.createAnswer = function(e, t) {
		let n = arguments.length >= 2 ? arguments[2] : arguments[0], i = r.apply(this, [n]);
		return t ? (i.then(e, t), Promise.resolve()) : i;
	};
	let s = function(e, t, n) {
		let r = i.apply(this, [e]);
		return n ? (r.then(t, n), Promise.resolve()) : r;
	};
	t.setLocalDescription = s, s = function(e, t, n) {
		let r = a.apply(this, [e]);
		return n ? (r.then(t, n), Promise.resolve()) : r;
	}, t.setRemoteDescription = s, s = function(e, t, n) {
		let r = o.apply(this, [e]);
		return n ? (r.then(t, n), Promise.resolve()) : r;
	}, t.addIceCandidate = s;
}
function Be(e) {
	let t = e && e.navigator;
	if (t.mediaDevices && t.mediaDevices.getUserMedia) {
		let e = t.mediaDevices, n = e.getUserMedia.bind(e);
		t.mediaDevices.getUserMedia = (e) => n(Ve(e));
	}
	!t.getUserMedia && t.mediaDevices && t.mediaDevices.getUserMedia && (t.getUserMedia = function(e, n, r) {
		t.mediaDevices.getUserMedia(e).then(n, r);
	}.bind(t));
}
function Ve(e) {
	return e && e.video !== void 0 ? Object.assign({}, e, { video: le(e.video) }) : e;
}
function He(e) {
	if (!e.RTCPeerConnection) return;
	let t = e.RTCPeerConnection;
	e.RTCPeerConnection = function(e, n) {
		if (e && e.iceServers) {
			let t = [];
			for (let n = 0; n < e.iceServers.length; n++) {
				let r = e.iceServers[n];
				r.urls === void 0 && r.url ? (oe("RTCIceServer.url", "RTCIceServer.urls"), r = JSON.parse(JSON.stringify(r)), r.urls = r.url, delete r.url, t.push(r)) : t.push(e.iceServers[n]);
			}
			e.iceServers = t;
		}
		return new t(e, n);
	}, e.RTCPeerConnection.prototype = t.prototype, "generateCertificate" in t && Object.defineProperty(e.RTCPeerConnection, "generateCertificate", { get() {
		return t.generateCertificate;
	} });
}
function Ue(e) {
	typeof e == "object" && e.RTCTrackEvent && "receiver" in e.RTCTrackEvent.prototype && !("transceiver" in e.RTCTrackEvent.prototype) && Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver", { get() {
		return { receiver: this.receiver };
	} });
}
function We(e) {
	let t = e.RTCPeerConnection.prototype.createOffer;
	e.RTCPeerConnection.prototype.createOffer = function(e) {
		if (e) {
			e.offerToReceiveAudio !== void 0 && (e.offerToReceiveAudio = !!e.offerToReceiveAudio);
			let t = this.getTransceivers().find((e) => e.receiver.track.kind === "audio");
			e.offerToReceiveAudio === !1 && t ? t.direction === "sendrecv" ? t.setDirection ? t.setDirection("sendonly") : t.direction = "sendonly" : t.direction === "recvonly" && (t.setDirection ? t.setDirection("inactive") : t.direction = "inactive") : e.offerToReceiveAudio === !0 && !t && this.addTransceiver("audio", { direction: "recvonly" }), e.offerToReceiveVideo !== void 0 && (e.offerToReceiveVideo = !!e.offerToReceiveVideo);
			let n = this.getTransceivers().find((e) => e.receiver.track.kind === "video");
			e.offerToReceiveVideo === !1 && n ? n.direction === "sendrecv" ? n.setDirection ? n.setDirection("sendonly") : n.direction = "sendonly" : n.direction === "recvonly" && (n.setDirection ? n.setDirection("inactive") : n.direction = "inactive") : e.offerToReceiveVideo === !0 && !n && this.addTransceiver("video", { direction: "recvonly" });
		}
		return t.apply(this, arguments);
	};
}
function Ge(e) {
	typeof e != "object" || e.AudioContext || (e.AudioContext = e.webkitAudioContext);
}
//#endregion
//#region node_modules/sdp/sdp.js
var Ke = /* @__PURE__ */ n(((e, t) => {
	var n = {};
	n.generateIdentifier = function() {
		return Math.random().toString(36).substring(2, 12);
	}, n.localCName = n.generateIdentifier(), n.splitLines = function(e) {
		return e.trim().split("\n").map((e) => e.trim());
	}, n.splitSections = function(e) {
		return e.split("\nm=").map((e, t) => (t > 0 ? "m=" + e : e).trim() + "\r\n");
	}, n.getDescription = function(e) {
		let t = n.splitSections(e);
		return t && t[0];
	}, n.getMediaSections = function(e) {
		let t = n.splitSections(e);
		return t.shift(), t;
	}, n.matchPrefix = function(e, t) {
		return n.splitLines(e).filter((e) => e.indexOf(t) === 0);
	}, n.parseCandidate = function(e) {
		let t;
		t = e.indexOf("a=candidate:") === 0 ? e.substring(12).split(" ") : e.substring(10).split(" ");
		let n = {
			foundation: t[0],
			component: {
				1: "rtp",
				2: "rtcp"
			}[t[1]] || t[1],
			protocol: t[2].toLowerCase(),
			priority: parseInt(t[3], 10),
			ip: t[4],
			address: t[4],
			port: parseInt(t[5], 10),
			type: t[7]
		};
		for (let e = 8; e < t.length; e += 2) switch (t[e]) {
			case "raddr":
				n.relatedAddress = t[e + 1];
				break;
			case "rport":
				n.relatedPort = parseInt(t[e + 1], 10);
				break;
			case "tcptype":
				n.tcpType = t[e + 1];
				break;
			case "ufrag":
				n.ufrag = t[e + 1], n.usernameFragment = t[e + 1];
				break;
			default: n[t[e]] === void 0 && (n[t[e]] = t[e + 1]);
		}
		return n;
	}, n.writeCandidate = function(e) {
		let t = [];
		t.push(e.foundation);
		let n = e.component;
		n === "rtp" ? t.push(1) : n === "rtcp" ? t.push(2) : t.push(n), t.push(e.protocol.toUpperCase()), t.push(e.priority), t.push(e.address || e.ip), t.push(e.port);
		let r = e.type;
		return t.push("typ"), t.push(r), r !== "host" && e.relatedAddress && e.relatedPort !== void 0 && (t.push("raddr"), t.push(e.relatedAddress), t.push("rport"), t.push(e.relatedPort)), e.tcpType && e.protocol.toLowerCase() === "tcp" && (t.push("tcptype"), t.push(e.tcpType)), (e.usernameFragment || e.ufrag) && (t.push("ufrag"), t.push(e.usernameFragment || e.ufrag)), "candidate:" + t.join(" ");
	}, n.parseIceOptions = function(e) {
		return e.substring(14).split(" ");
	}, n.parseRtpMap = function(e) {
		let t = e.substring(9).split(" "), n = { payloadType: parseInt(t.shift(), 10) };
		return t = t[0].split("/"), n.name = t[0], n.clockRate = parseInt(t[1], 10), n.channels = t.length === 3 ? parseInt(t[2], 10) : 1, n.numChannels = n.channels, n;
	}, n.writeRtpMap = function(e) {
		let t = e.payloadType;
		e.preferredPayloadType !== void 0 && (t = e.preferredPayloadType);
		let n = e.channels || e.numChannels || 1;
		return "a=rtpmap:" + t + " " + e.name + "/" + e.clockRate + (n === 1 ? "" : "/" + n) + "\r\n";
	}, n.parseExtmap = function(e) {
		let t = e.substring(9).split(" ");
		return {
			id: parseInt(t[0], 10),
			direction: t[0].indexOf("/") > 0 ? t[0].split("/")[1] : "sendrecv",
			uri: t[1],
			attributes: t.slice(2).join(" ")
		};
	}, n.writeExtmap = function(e) {
		return "a=extmap:" + (e.id || e.preferredId) + (e.direction && e.direction !== "sendrecv" ? "/" + e.direction : "") + " " + e.uri + (e.attributes ? " " + e.attributes : "") + "\r\n";
	}, n.parseFmtp = function(e) {
		let t = {}, n, r = e.substring(e.indexOf(" ") + 1).split(";");
		for (let e = 0; e < r.length; e++) n = r[e].trim().split("="), t[n[0].trim()] = n[1];
		return t;
	}, n.writeFmtp = function(e) {
		let t = "", n = e.payloadType;
		if (e.preferredPayloadType !== void 0 && (n = e.preferredPayloadType), e.parameters && Object.keys(e.parameters).length) {
			let r = [];
			Object.keys(e.parameters).forEach((t) => {
				e.parameters[t] === void 0 ? r.push(t) : r.push(t + "=" + e.parameters[t]);
			}), t += "a=fmtp:" + n + " " + r.join(";") + "\r\n";
		}
		return t;
	}, n.parseRtcpFb = function(e) {
		let t = e.substring(e.indexOf(" ") + 1).split(" ");
		return {
			type: t.shift(),
			parameter: t.join(" ")
		};
	}, n.writeRtcpFb = function(e) {
		let t = "", n = e.payloadType;
		return e.preferredPayloadType !== void 0 && (n = e.preferredPayloadType), e.rtcpFeedback && e.rtcpFeedback.length && e.rtcpFeedback.forEach((e) => {
			t += "a=rtcp-fb:" + n + " " + e.type + (e.parameter && e.parameter.length ? " " + e.parameter : "") + "\r\n";
		}), t;
	}, n.parseSsrcMedia = function(e) {
		let t = e.indexOf(" "), n = { ssrc: parseInt(e.substring(7, t), 10) }, r = e.indexOf(":", t);
		return r > -1 ? (n.attribute = e.substring(t + 1, r), n.value = e.substring(r + 1)) : n.attribute = e.substring(t + 1), n;
	}, n.parseSsrcGroup = function(e) {
		let t = e.substring(13).split(" ");
		return {
			semantics: t.shift(),
			ssrcs: t.map((e) => parseInt(e, 10))
		};
	}, n.getMid = function(e) {
		let t = n.matchPrefix(e, "a=mid:")[0];
		if (t) return t.substring(6);
	}, n.parseFingerprint = function(e) {
		let t = e.substring(14).split(" ");
		return {
			algorithm: t[0].toLowerCase(),
			value: t[1].toUpperCase()
		};
	}, n.getDtlsParameters = function(e, t) {
		return {
			role: "auto",
			fingerprints: n.matchPrefix(e + t, "a=fingerprint:").map(n.parseFingerprint)
		};
	}, n.writeDtlsParameters = function(e, t) {
		let n = "a=setup:" + t + "\r\n";
		return e.fingerprints.forEach((e) => {
			n += "a=fingerprint:" + e.algorithm + " " + e.value + "\r\n";
		}), n;
	}, n.parseCryptoLine = function(e) {
		let t = e.substring(9).split(" ");
		return {
			tag: parseInt(t[0], 10),
			cryptoSuite: t[1],
			keyParams: t[2],
			sessionParams: t.slice(3)
		};
	}, n.writeCryptoLine = function(e) {
		return "a=crypto:" + e.tag + " " + e.cryptoSuite + " " + (typeof e.keyParams == "object" ? n.writeCryptoKeyParams(e.keyParams) : e.keyParams) + (e.sessionParams ? " " + e.sessionParams.join(" ") : "") + "\r\n";
	}, n.parseCryptoKeyParams = function(e) {
		if (e.indexOf("inline:") !== 0) return null;
		let t = e.substring(7).split("|");
		return {
			keyMethod: "inline",
			keySalt: t[0],
			lifeTime: t[1],
			mkiValue: t[2] ? t[2].split(":")[0] : void 0,
			mkiLength: t[2] ? t[2].split(":")[1] : void 0
		};
	}, n.writeCryptoKeyParams = function(e) {
		return e.keyMethod + ":" + e.keySalt + (e.lifeTime ? "|" + e.lifeTime : "") + (e.mkiValue && e.mkiLength ? "|" + e.mkiValue + ":" + e.mkiLength : "");
	}, n.getCryptoParameters = function(e, t) {
		return n.matchPrefix(e + t, "a=crypto:").map(n.parseCryptoLine);
	}, n.getIceParameters = function(e, t) {
		let r = n.matchPrefix(e + t, "a=ice-ufrag:")[0], i = n.matchPrefix(e + t, "a=ice-pwd:")[0];
		return r && i ? {
			usernameFragment: r.substring(12),
			password: i.substring(10)
		} : null;
	}, n.writeIceParameters = function(e) {
		let t = "a=ice-ufrag:" + e.usernameFragment + "\r\na=ice-pwd:" + e.password + "\r\n";
		return e.iceLite && (t += "a=ice-lite\r\n"), t;
	}, n.parseRtpParameters = function(e) {
		let t = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: [],
			rtcp: []
		}, r = n.splitLines(e)[0].split(" ");
		t.profile = r[2];
		for (let i = 3; i < r.length; i++) {
			let a = r[i], o = n.matchPrefix(e, "a=rtpmap:" + a + " ")[0];
			if (o) {
				let r = n.parseRtpMap(o), i = n.matchPrefix(e, "a=fmtp:" + a + " ");
				switch (r.parameters = i.length ? n.parseFmtp(i[0]) : {}, r.rtcpFeedback = n.matchPrefix(e, "a=rtcp-fb:" + a + " ").map(n.parseRtcpFb), t.codecs.push(r), r.name.toUpperCase()) {
					case "RED":
					case "ULPFEC": t.fecMechanisms.push(r.name.toUpperCase());
				}
			}
		}
		n.matchPrefix(e, "a=extmap:").forEach((e) => {
			t.headerExtensions.push(n.parseExtmap(e));
		});
		let i = n.matchPrefix(e, "a=rtcp-fb:* ").map(n.parseRtcpFb);
		return t.codecs.forEach((e) => {
			i.forEach((t) => {
				e.rtcpFeedback.find((e) => e.type === t.type && e.parameter === t.parameter) || e.rtcpFeedback.push(t);
			});
		}), t;
	}, n.writeRtpDescription = function(e, t) {
		let r = "";
		r += "m=" + e + " ", r += t.codecs.length > 0 ? "9" : "0", r += " " + (t.profile || "UDP/TLS/RTP/SAVPF") + " ", r += t.codecs.map((e) => e.preferredPayloadType === void 0 ? e.payloadType : e.preferredPayloadType).join(" ") + "\r\n", r += "c=IN IP4 0.0.0.0\r\n", r += "a=rtcp:9 IN IP4 0.0.0.0\r\n", t.codecs.forEach((e) => {
			r += n.writeRtpMap(e), r += n.writeFmtp(e), r += n.writeRtcpFb(e);
		});
		let i = 0;
		return t.codecs.forEach((e) => {
			e.maxptime > i && (i = e.maxptime);
		}), i > 0 && (r += "a=maxptime:" + i + "\r\n"), t.headerExtensions && t.headerExtensions.forEach((e) => {
			r += n.writeExtmap(e);
		}), r;
	}, n.parseRtpEncodingParameters = function(e) {
		let t = [], r = n.parseRtpParameters(e), i = r.fecMechanisms.indexOf("RED") !== -1, a = r.fecMechanisms.indexOf("ULPFEC") !== -1, o = n.matchPrefix(e, "a=ssrc:").map((e) => n.parseSsrcMedia(e)).filter((e) => e.attribute === "cname"), s = o.length > 0 && o[0].ssrc, c, l = n.matchPrefix(e, "a=ssrc-group:FID").map((e) => e.substring(17).split(" ").map((e) => parseInt(e, 10)));
		l.length > 0 && l[0].length > 1 && l[0][0] === s && (c = l[0][1]), r.codecs.forEach((e) => {
			if (e.name.toUpperCase() === "RTX" && e.parameters.apt) {
				let n = {
					ssrc: s,
					codecPayloadType: parseInt(e.parameters.apt, 10)
				};
				s && c && (n.rtx = { ssrc: c }), t.push(n), i && (n = JSON.parse(JSON.stringify(n)), n.fec = {
					ssrc: s,
					mechanism: a ? "red+ulpfec" : "red"
				}, t.push(n));
			}
		}), t.length === 0 && s && t.push({ ssrc: s });
		let u = n.matchPrefix(e, "b=");
		return u.length && (u = u[0].indexOf("b=TIAS:") === 0 ? parseInt(u[0].substring(7), 10) : u[0].indexOf("b=AS:") === 0 ? parseInt(u[0].substring(5), 10) * 1e3 * .95 - 16e3 : void 0, t.forEach((e) => {
			e.maxBitrate = u;
		})), t;
	}, n.parseRtcpParameters = function(e) {
		let t = {}, r = n.matchPrefix(e, "a=ssrc:").map((e) => n.parseSsrcMedia(e)).filter((e) => e.attribute === "cname")[0];
		r && (t.cname = r.value, t.ssrc = r.ssrc);
		let i = n.matchPrefix(e, "a=rtcp-rsize");
		return t.reducedSize = i.length > 0, t.compound = i.length === 0, t.mux = n.matchPrefix(e, "a=rtcp-mux").length > 0, t;
	}, n.writeRtcpParameters = function(e) {
		let t = "";
		return e.reducedSize && (t += "a=rtcp-rsize\r\n"), e.mux && (t += "a=rtcp-mux\r\n"), e.ssrc !== void 0 && e.cname && (t += "a=ssrc:" + e.ssrc + " cname:" + e.cname + "\r\n"), t;
	}, n.parseMsid = function(e) {
		let t, r = n.matchPrefix(e, "a=msid:");
		if (r.length === 1) return t = r[0].substring(7).split(" "), {
			stream: t[0],
			track: t[1]
		};
		let i = n.matchPrefix(e, "a=ssrc:").map((e) => n.parseSsrcMedia(e)).filter((e) => e.attribute === "msid");
		if (i.length > 0) return t = i[0].value.split(" "), {
			stream: t[0],
			track: t[1]
		};
	}, n.parseSctpDescription = function(e) {
		let t = n.parseMLine(e), r = n.matchPrefix(e, "a=max-message-size:"), i;
		r.length > 0 && (i = parseInt(r[0].substring(19), 10)), isNaN(i) && (i = 65536);
		let a = n.matchPrefix(e, "a=sctp-port:");
		if (a.length > 0) return {
			port: parseInt(a[0].substring(12), 10),
			protocol: t.fmt,
			maxMessageSize: i
		};
		let o = n.matchPrefix(e, "a=sctpmap:");
		if (o.length > 0) {
			let e = o[0].substring(10).split(" ");
			return {
				port: parseInt(e[0], 10),
				protocol: e[1],
				maxMessageSize: i
			};
		}
	}, n.writeSctpDescription = function(e, t) {
		let n = [];
		return n = e.protocol === "DTLS/SCTP" ? [
			"m=" + e.kind + " 9 " + e.protocol + " " + t.port + "\r\n",
			"c=IN IP4 0.0.0.0\r\n",
			"a=sctpmap:" + t.port + " " + t.protocol + " 65535\r\n"
		] : [
			"m=" + e.kind + " 9 " + e.protocol + " " + t.protocol + "\r\n",
			"c=IN IP4 0.0.0.0\r\n",
			"a=sctp-port:" + t.port + "\r\n"
		], t.maxMessageSize !== void 0 && n.push("a=max-message-size:" + t.maxMessageSize + "\r\n"), n.join("");
	}, n.generateSessionId = function() {
		return Math.random().toString().substr(2, 22);
	}, n.writeSessionBoilerplate = function(e, t, r) {
		let i, a = t === void 0 ? 2 : t;
		return i = e || n.generateSessionId(), "v=0\r\no=" + (r || "thisisadapterortc") + " " + i + " " + a + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
	}, n.getDirection = function(e, t) {
		let r = n.splitLines(e);
		for (let e = 0; e < r.length; e++) switch (r[e]) {
			case "a=sendrecv":
			case "a=sendonly":
			case "a=recvonly":
			case "a=inactive": return r[e].substring(2);
		}
		return t ? n.getDirection(t) : "sendrecv";
	}, n.getKind = function(e) {
		return n.splitLines(e)[0].split(" ")[0].substring(2);
	}, n.isRejected = function(e) {
		return e.split(" ", 2)[1] === "0";
	}, n.parseMLine = function(e) {
		let t = n.splitLines(e)[0].substring(2).split(" ");
		return {
			kind: t[0],
			port: parseInt(t[1], 10),
			protocol: t[2],
			fmt: t.slice(3).join(" ")
		};
	}, n.parseOLine = function(e) {
		let t = n.matchPrefix(e, "o=")[0].substring(2).split(" ");
		return {
			username: t[0],
			sessionId: t[1],
			sessionVersion: parseInt(t[2], 10),
			netType: t[3],
			addressType: t[4],
			address: t[5]
		};
	}, n.isValidSDP = function(e) {
		if (typeof e != "string" || e.length === 0) return !1;
		let t = n.splitLines(e);
		for (let e = 0; e < t.length; e++) if (t[e].length < 2 || t[e].charAt(1) !== "=") return !1;
		return !0;
	}, typeof t == "object" && (t.exports = n);
})), qe = /* @__PURE__ */ e({
	removeExtmapAllowMixed: () => et,
	shimAddIceCandidateNullOrEmpty: () => tt,
	shimConnectionState: () => $e,
	shimMaxMessageSize: () => Ze,
	shimParameterlessSetLocalDescription: () => nt,
	shimRTCIceCandidate: () => Ye,
	shimRTCIceCandidateRelayProtocol: () => Xe,
	shimSendThrowTypeError: () => Qe
}), Je = /* @__PURE__ */ t(Ke());
function Ye(e) {
	if (!e.RTCIceCandidate || e.RTCIceCandidate && "foundation" in e.RTCIceCandidate.prototype) return;
	let t = e.RTCIceCandidate;
	e.RTCIceCandidate = function(e) {
		if (typeof e == "object" && e.candidate && e.candidate.indexOf("a=") === 0 && (e = JSON.parse(JSON.stringify(e)), e.candidate = e.candidate.substring(2)), e.candidate && e.candidate.length) {
			let n = new t(e), r = Je.default.parseCandidate(e.candidate);
			for (let e in r) e in n || Object.defineProperty(n, e, { value: r[e] });
			return n.toJSON = function() {
				return {
					candidate: n.candidate,
					sdpMid: n.sdpMid,
					sdpMLineIndex: n.sdpMLineIndex,
					usernameFragment: n.usernameFragment
				};
			}, n;
		}
		return new t(e);
	}, e.RTCIceCandidate.prototype = t.prototype, ie(e, "icecandidate", (t) => (t.candidate && Object.defineProperty(t, "candidate", {
		value: new e.RTCIceCandidate(t.candidate),
		writable: "false"
	}), t));
}
function Xe(e) {
	!e.RTCIceCandidate || e.RTCIceCandidate && "relayProtocol" in e.RTCIceCandidate.prototype || ie(e, "icecandidate", (e) => {
		if (e.candidate) {
			let t = Je.default.parseCandidate(e.candidate.candidate);
			t.type === "relay" && (e.candidate.relayProtocol = {
				0: "tls",
				1: "tcp",
				2: "udp"
			}[t.priority >> 24]);
		}
		return e;
	});
}
function Ze(e, t) {
	if (!e.RTCPeerConnection) return;
	"sctp" in e.RTCPeerConnection.prototype || Object.defineProperty(e.RTCPeerConnection.prototype, "sctp", { get() {
		return this._sctp === void 0 ? null : this._sctp;
	} });
	let n = function(e) {
		if (!e || !e.sdp) return !1;
		let t = Je.default.splitSections(e.sdp);
		return t.shift(), t.some((e) => {
			let t = Je.default.parseMLine(e);
			return t && t.kind === "application" && t.protocol.indexOf("SCTP") !== -1;
		});
	}, r = function(e) {
		let t = e.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
		if (t === null || t.length < 2) return -1;
		let n = parseInt(t[1], 10);
		return n === n ? n : -1;
	}, i = function(e) {
		let n = 65536;
		return t.browser === "firefox" && (n = t.version < 57 ? e === -1 ? 16384 : 2147483637 : t.version < 60 ? t.version === 57 ? 65535 : 65536 : 2147483637), n;
	}, a = function(e, n) {
		let r = 65536;
		t.browser === "firefox" && t.version === 57 && (r = 65535);
		let i = Je.default.matchPrefix(e.sdp, "a=max-message-size:");
		return i.length > 0 ? r = parseInt(i[0].substring(19), 10) : t.browser === "firefox" && n !== -1 && (r = 2147483637), r;
	}, o = e.RTCPeerConnection.prototype.setRemoteDescription;
	e.RTCPeerConnection.prototype.setRemoteDescription = function() {
		if (this._sctp = null, t.browser === "chrome" && t.version >= 76) {
			let { sdpSemantics: e } = this.getConfiguration();
			e === "plan-b" && Object.defineProperty(this, "sctp", {
				get() {
					return this._sctp === void 0 ? null : this._sctp;
				},
				enumerable: !0,
				configurable: !0
			});
		}
		if (n(arguments[0])) {
			let e = r(arguments[0]), t = i(e), n = a(arguments[0], e), o;
			o = t === 0 && n === 0 ? Infinity : t === 0 || n === 0 ? Math.max(t, n) : Math.min(t, n);
			let s = {};
			Object.defineProperty(s, "maxMessageSize", { get() {
				return o;
			} }), this._sctp = s;
		}
		return o.apply(this, arguments);
	};
}
function Qe(e) {
	if (!(e.RTCPeerConnection && "createDataChannel" in e.RTCPeerConnection.prototype)) return;
	function t(e, t) {
		let n = e.send;
		e.send = function() {
			let r = arguments[0], i = r.length || r.size || r.byteLength;
			if (e.readyState === "open" && t.sctp && i > t.sctp.maxMessageSize) throw TypeError("Message too large (can send a maximum of " + t.sctp.maxMessageSize + " bytes)");
			return n.apply(e, arguments);
		};
	}
	let n = e.RTCPeerConnection.prototype.createDataChannel;
	e.RTCPeerConnection.prototype.createDataChannel = function() {
		let e = n.apply(this, arguments);
		return t(e, this), e;
	}, ie(e, "datachannel", (e) => (t(e.channel, e.target), e));
}
function $e(e) {
	if (!e.RTCPeerConnection || "connectionState" in e.RTCPeerConnection.prototype) return;
	let t = e.RTCPeerConnection.prototype;
	Object.defineProperty(t, "connectionState", {
		get() {
			return {
				completed: "connected",
				checking: "connecting"
			}[this.iceConnectionState] || this.iceConnectionState;
		},
		enumerable: !0,
		configurable: !0
	}), Object.defineProperty(t, "onconnectionstatechange", {
		get() {
			return this._onconnectionstatechange || null;
		},
		set(e) {
			this._onconnectionstatechange && (this.removeEventListener("connectionstatechange", this._onconnectionstatechange), delete this._onconnectionstatechange), e && this.addEventListener("connectionstatechange", this._onconnectionstatechange = e);
		},
		enumerable: !0,
		configurable: !0
	}), ["setLocalDescription", "setRemoteDescription"].forEach((e) => {
		let n = t[e];
		t[e] = function() {
			return this._connectionstatechangepoly || (this._connectionstatechangepoly = (e) => {
				let t = e.target;
				if (t._lastConnectionState !== t.connectionState) {
					t._lastConnectionState = t.connectionState;
					let n = new Event("connectionstatechange", e);
					t.dispatchEvent(n);
				}
				return e;
			}, this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly)), n.apply(this, arguments);
		};
	});
}
function et(e, t) {
	if (!e.RTCPeerConnection || t.browser === "chrome" && t.version >= 71 || t.browser === "safari" && t._safariVersion >= 13.1) return;
	let n = e.RTCPeerConnection.prototype.setRemoteDescription;
	e.RTCPeerConnection.prototype.setRemoteDescription = function(t) {
		if (t && t.sdp && t.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
			let n = t.sdp.split("\n").filter((e) => e.trim() !== "a=extmap-allow-mixed").join("\n");
			e.RTCSessionDescription && t instanceof e.RTCSessionDescription ? arguments[0] = new e.RTCSessionDescription({
				type: t.type,
				sdp: n
			}) : t.sdp = n;
		}
		return n.apply(this, arguments);
	};
}
function tt(e, t) {
	if (!(e.RTCPeerConnection && e.RTCPeerConnection.prototype)) return;
	let n = e.RTCPeerConnection.prototype.addIceCandidate;
	n && n.length !== 0 && (e.RTCPeerConnection.prototype.addIceCandidate = function() {
		return arguments[0] ? (t.browser === "chrome" && t.version < 78 || t.browser === "firefox" && t.version < 68 || t.browser === "safari") && arguments[0] && arguments[0].candidate === "" ? Promise.resolve() : n.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve());
	});
}
function nt(e, t) {
	if (!(e.RTCPeerConnection && e.RTCPeerConnection.prototype)) return;
	let n = e.RTCPeerConnection.prototype.setLocalDescription;
	n && n.length !== 0 && (e.RTCPeerConnection.prototype.setLocalDescription = function() {
		let e = arguments[0] || {};
		if (typeof e != "object" || e.type && e.sdp) return n.apply(this, arguments);
		if (e = {
			type: e.type,
			sdp: e.sdp
		}, !e.type) switch (this.signalingState) {
			case "stable":
			case "have-local-offer":
			case "have-remote-pranswer":
				e.type = "offer";
				break;
			default: e.type = "answer";
		}
		return e.sdp || e.type !== "offer" && e.type !== "answer" ? n.apply(this, [e]) : (e.type === "offer" ? this.createOffer : this.createAnswer).apply(this).then((e) => n.apply(this, [e]));
	});
}
//#endregion
//#region node_modules/webrtc-adapter/src/js/adapter_factory.js
function rt({ window: e } = {}, t = {
	shimChrome: !0,
	shimFirefox: !0,
	shimSafari: !0
}) {
	let n = E, r = se(e), i = {
		browserDetails: r,
		commonShim: qe,
		extractVersion: w,
		disableLog: ae,
		disableWarnings: T,
		sdp: Je
	};
	switch (r.browser) {
		case "chrome":
			if (!me || !Se || !t.shimChrome) return n("Chrome shim is not included in this adapter release."), i;
			if (r.version === null) return n("Chrome shim can not determine version, not shimming."), i;
			n("adapter.js shimming chrome."), i.browserShim = me, tt(e, r), nt(e, r), fe(e, r), he(e, r), Se(e, r), ge(e, r), xe(e, r), _e(e, r), ve(e, r), ye(e, r), Ce(e, r), Ye(e, r), Xe(e, r), $e(e, r), Ze(e, r), Qe(e, r), et(e, r);
			break;
		case "firefox":
			if (!Ee || !Oe || !t.shimFirefox) return n("Firefox shim is not included in this adapter release."), i;
			n("adapter.js shimming firefox."), i.browserShim = Ee, tt(e, r), nt(e, r), we(e, r), Oe(e, r), De(e, r), O(e, r), ke(e, r), Ae(e, r), je(e, r), Me(e, r), Ne(e, r), Pe(e, r), Fe(e, r), Ye(e, r), $e(e, r), Ze(e, r), Qe(e, r);
			break;
		case "safari":
			if (!Ie || !t.shimSafari) return n("Safari shim is not included in this adapter release."), i;
			n("adapter.js shimming safari."), i.browserShim = Ie, tt(e, r), nt(e, r), He(e, r), We(e, r), ze(e, r), Le(e, r), Re(e, r), Ue(e, r), Be(e, r), Ge(e, r), Ye(e, r), Xe(e, r), Ze(e, r), Qe(e, r), et(e, r);
			break;
		default: n("Unsupported browser!");
	}
	return i;
}
rt({ window: typeof window > "u" ? void 0 : window });
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/json-typings.js
function it(e) {
	let t = typeof e;
	if (t == "object") {
		if (Array.isArray(e)) return "array";
		if (e === null) return "null";
	}
	return t;
}
function at(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/base64.js
var ot = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""), st = [];
for (let e = 0; e < ot.length; e++) st[ot[e].charCodeAt(0)] = e;
st[45] = ot.indexOf("+"), st[95] = ot.indexOf("/");
function ct(e) {
	let t = e.length * 3 / 4;
	e[e.length - 2] == "=" ? t -= 2 : e[e.length - 1] == "=" && --t;
	let n = new Uint8Array(t), r = 0, i = 0, a, o = 0;
	for (let t = 0; t < e.length; t++) {
		if (a = st[e.charCodeAt(t)], a === void 0) switch (e[t]) {
			case "=": i = 0;
			case "\n":
			case "\r":
			case "	":
			case " ": continue;
			default: throw Error("invalid base64 string.");
		}
		switch (i) {
			case 0:
				o = a, i = 1;
				break;
			case 1:
				n[r++] = o << 2 | (a & 48) >> 4, o = a, i = 2;
				break;
			case 2:
				n[r++] = (o & 15) << 4 | (a & 60) >> 2, o = a, i = 3;
				break;
			case 3: n[r++] = (o & 3) << 6 | a, i = 0;
		}
	}
	if (i == 1) throw Error("invalid base64 string.");
	return n.subarray(0, r);
}
function lt(e) {
	let t = "", n = 0, r, i = 0;
	for (let a = 0; a < e.length; a++) switch (r = e[a], n) {
		case 0:
			t += ot[r >> 2], i = (r & 3) << 4, n = 1;
			break;
		case 1:
			t += ot[i | r >> 4], i = (r & 15) << 2, n = 2;
			break;
		case 2: t += ot[i | r >> 6], t += ot[r & 63], n = 0;
	}
	return n && (t += ot[i], t += "=", n == 1 && (t += "=")), t;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/binary-format-contract.js
var ut;
(function(e) {
	e.symbol = Symbol.for("protobuf-ts/unknown"), e.onRead = (n, r, i, a, o) => {
		(t(r) ? r[e.symbol] : r[e.symbol] = []).push({
			no: i,
			wireType: a,
			data: o
		});
	}, e.onWrite = (t, n, r) => {
		for (let { no: t, wireType: i, data: a } of e.list(n)) r.tag(t, i).raw(a);
	}, e.list = (n, r) => {
		if (t(n)) {
			let t = n[e.symbol];
			return r ? t.filter((e) => e.no == r) : t;
		}
		return [];
	}, e.last = (t, n) => e.list(t, n).slice(-1)[0];
	let t = (t) => t && Array.isArray(t[e.symbol]);
})(ut ||= {});
function dt(e, t) {
	return Object.assign(Object.assign({}, e), t);
}
var ft;
(function(e) {
	e[e.Varint = 0] = "Varint", e[e.Bit64 = 1] = "Bit64", e[e.LengthDelimited = 2] = "LengthDelimited", e[e.StartGroup = 3] = "StartGroup", e[e.EndGroup = 4] = "EndGroup", e[e.Bit32 = 5] = "Bit32";
})(ft ||= {});
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/goog-varint.js
function pt() {
	let e = 0, t = 0;
	for (let n = 0; n < 28; n += 7) {
		let r = this.buf[this.pos++];
		if (e |= (r & 127) << n, !(r & 128)) return this.assertBounds(), [e, t];
	}
	let n = this.buf[this.pos++];
	if (e |= (n & 15) << 28, t = (n & 112) >> 4, !(n & 128)) return this.assertBounds(), [e, t];
	for (let n = 3; n <= 31; n += 7) {
		let r = this.buf[this.pos++];
		if (t |= (r & 127) << n, !(r & 128)) return this.assertBounds(), [e, t];
	}
	throw Error("invalid varint");
}
function mt(e, t, n) {
	for (let r = 0; r < 28; r += 7) {
		let i = e >>> r, a = !(!(i >>> 7) && t == 0), o = (a ? i | 128 : i) & 255;
		if (n.push(o), !a) return;
	}
	let r = e >>> 28 & 15 | (t & 7) << 4, i = !!(t >> 3);
	if (n.push((i ? r | 128 : r) & 255), i) {
		for (let e = 3; e < 31; e += 7) {
			let r = t >>> e, i = !!(r >>> 7), a = (i ? r | 128 : r) & 255;
			if (n.push(a), !i) return;
		}
		n.push(t >>> 31 & 1);
	}
}
var ht = 4294967296;
function gt(e) {
	let t = e[0] == "-";
	t && (e = e.slice(1));
	let n = 1e6, r = 0, i = 0;
	function a(t, a) {
		let o = Number(e.slice(t, a));
		i *= n, r = r * n + o, r >= ht && (i += r / ht | 0, r %= ht);
	}
	return a(-24, -18), a(-18, -12), a(-12, -6), a(-6), [
		t,
		r,
		i
	];
}
function _t(e, t) {
	if (t >>> 0 <= 2097151) return "" + (ht * t + (e >>> 0));
	let n = e & 16777215, r = (e >>> 24 | t << 8) >>> 0 & 16777215, i = t >> 16 & 65535, a = n + r * 6777216 + i * 6710656, o = r + i * 8147497, s = i * 2, c = 1e7;
	a >= c && (o += Math.floor(a / c), a %= c), o >= c && (s += Math.floor(o / c), o %= c);
	function l(e, t) {
		let n = e ? String(e) : "";
		return t ? "0000000".slice(n.length) + n : n;
	}
	return l(s, 0) + l(o, s) + l(a, 1);
}
function vt(e, t) {
	if (e >= 0) {
		for (; e > 127;) t.push(e & 127 | 128), e >>>= 7;
		t.push(e);
	} else {
		for (let n = 0; n < 9; n++) t.push(e & 127 | 128), e >>= 7;
		t.push(1);
	}
}
function yt() {
	let e = this.buf[this.pos++], t = e & 127;
	if (!(e & 128) || (e = this.buf[this.pos++], t |= (e & 127) << 7, !(e & 128)) || (e = this.buf[this.pos++], t |= (e & 127) << 14, !(e & 128)) || (e = this.buf[this.pos++], t |= (e & 127) << 21, !(e & 128))) return this.assertBounds(), t;
	e = this.buf[this.pos++], t |= (e & 15) << 28;
	for (let t = 5; e & 128 && t < 10; t++) e = this.buf[this.pos++];
	if (e & 128) throw Error("invalid varint");
	return this.assertBounds(), t >>> 0;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/pb-long.js
var k;
function bt() {
	let e = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
	k = globalThis.BigInt !== void 0 && typeof e.getBigInt64 == "function" && typeof e.getBigUint64 == "function" && typeof e.setBigInt64 == "function" && typeof e.setBigUint64 == "function" ? {
		MIN: BigInt("-9223372036854775808"),
		MAX: BigInt("9223372036854775807"),
		UMIN: BigInt("0"),
		UMAX: BigInt("18446744073709551615"),
		C: BigInt,
		V: e
	} : void 0;
}
bt();
function xt(e) {
	if (!e) throw Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
}
var St = /^-?[0-9]+$/, Ct = 4294967296, wt = 2147483648, Tt = class {
	constructor(e, t) {
		this.lo = e | 0, this.hi = t | 0;
	}
	isZero() {
		return this.lo == 0 && this.hi == 0;
	}
	toNumber() {
		let e = this.hi * Ct + (this.lo >>> 0);
		if (!Number.isSafeInteger(e)) throw Error("cannot convert to safe number");
		return e;
	}
}, Et = class e extends Tt {
	static from(t) {
		if (k) switch (typeof t) {
			case "string":
				if (t == "0") return this.ZERO;
				if (t == "") throw Error("string is no integer");
				t = k.C(t);
			case "number":
				if (t === 0) return this.ZERO;
				t = k.C(t);
			case "bigint":
				if (!t) return this.ZERO;
				if (t < k.UMIN) throw Error("signed value for ulong");
				if (t > k.UMAX) throw Error("ulong too large");
				return k.V.setBigUint64(0, t, !0), new e(k.V.getInt32(0, !0), k.V.getInt32(4, !0));
		}
		else switch (typeof t) {
			case "string":
				if (t == "0") return this.ZERO;
				if (t = t.trim(), !St.test(t)) throw Error("string is no integer");
				let [n, r, i] = gt(t);
				if (n) throw Error("signed value for ulong");
				return new e(r, i);
			case "number":
				if (t == 0) return this.ZERO;
				if (!Number.isSafeInteger(t)) throw Error("number is no integer");
				if (t < 0) throw Error("signed value for ulong");
				return new e(t, t / Ct);
		}
		throw Error("unknown value " + typeof t);
	}
	toString() {
		return k ? this.toBigInt().toString() : _t(this.lo, this.hi);
	}
	toBigInt() {
		return xt(k), k.V.setInt32(0, this.lo, !0), k.V.setInt32(4, this.hi, !0), k.V.getBigUint64(0, !0);
	}
};
Et.ZERO = new Et(0, 0);
var A = class e extends Tt {
	static from(t) {
		if (k) switch (typeof t) {
			case "string":
				if (t == "0") return this.ZERO;
				if (t == "") throw Error("string is no integer");
				t = k.C(t);
			case "number":
				if (t === 0) return this.ZERO;
				t = k.C(t);
			case "bigint":
				if (!t) return this.ZERO;
				if (t < k.MIN) throw Error("signed long too small");
				if (t > k.MAX) throw Error("signed long too large");
				return k.V.setBigInt64(0, t, !0), new e(k.V.getInt32(0, !0), k.V.getInt32(4, !0));
		}
		else switch (typeof t) {
			case "string":
				if (t == "0") return this.ZERO;
				if (t = t.trim(), !St.test(t)) throw Error("string is no integer");
				let [n, r, i] = gt(t);
				if (n) {
					if (i > wt || i == wt && r != 0) throw Error("signed long too small");
				} else if (i >= wt) throw Error("signed long too large");
				let a = new e(r, i);
				return n ? a.negate() : a;
			case "number":
				if (t == 0) return this.ZERO;
				if (!Number.isSafeInteger(t)) throw Error("number is no integer");
				return t > 0 ? new e(t, t / Ct) : new e(-t, -t / Ct).negate();
		}
		throw Error("unknown value " + typeof t);
	}
	isNegative() {
		return (this.hi & wt) !== 0;
	}
	negate() {
		let t = ~this.hi, n = this.lo;
		return n ? n = ~n + 1 : t += 1, new e(n, t);
	}
	toString() {
		if (k) return this.toBigInt().toString();
		if (this.isNegative()) {
			let e = this.negate();
			return "-" + _t(e.lo, e.hi);
		}
		return _t(this.lo, this.hi);
	}
	toBigInt() {
		return xt(k), k.V.setInt32(0, this.lo, !0), k.V.setInt32(4, this.hi, !0), k.V.getBigInt64(0, !0);
	}
};
A.ZERO = new A(0, 0);
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/binary-reader.js
var Dt = {
	readUnknownField: !0,
	readerFactory: (e) => new kt(e)
};
function Ot(e) {
	return e ? Object.assign(Object.assign({}, Dt), e) : Dt;
}
var kt = class {
	constructor(e, t) {
		this.varint64 = pt, this.uint32 = yt, this.buf = e, this.len = e.length, this.pos = 0, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.textDecoder = t ?? new TextDecoder("utf-8", {
			fatal: !0,
			ignoreBOM: !0
		});
	}
	tag() {
		let e = this.uint32(), t = e >>> 3, n = e & 7;
		if (t <= 0 || n < 0 || n > 5) throw Error("illegal tag: field no " + t + " wire type " + n);
		return [t, n];
	}
	skip(e) {
		let t = this.pos;
		switch (e) {
			case ft.Varint:
				for (; this.buf[this.pos++] & 128;);
				break;
			case ft.Bit64: this.pos += 4;
			case ft.Bit32:
				this.pos += 4;
				break;
			case ft.LengthDelimited:
				let t = this.uint32();
				this.pos += t;
				break;
			case ft.StartGroup:
				let n;
				for (; (n = this.tag()[1]) !== ft.EndGroup;) this.skip(n);
				break;
			default: throw Error("cant skip wire type " + e);
		}
		return this.assertBounds(), this.buf.subarray(t, this.pos);
	}
	assertBounds() {
		if (this.pos > this.len) throw RangeError("premature EOF");
	}
	int32() {
		return this.uint32() | 0;
	}
	sint32() {
		let e = this.uint32();
		return e >>> 1 ^ -(e & 1);
	}
	int64() {
		return new A(...this.varint64());
	}
	uint64() {
		return new Et(...this.varint64());
	}
	sint64() {
		let [e, t] = this.varint64(), n = -(e & 1);
		return e = (e >>> 1 | (t & 1) << 31) ^ n, t = t >>> 1 ^ n, new A(e, t);
	}
	bool() {
		let [e, t] = this.varint64();
		return e !== 0 || t !== 0;
	}
	fixed32() {
		return this.view.getUint32((this.pos += 4) - 4, !0);
	}
	sfixed32() {
		return this.view.getInt32((this.pos += 4) - 4, !0);
	}
	fixed64() {
		return new Et(this.sfixed32(), this.sfixed32());
	}
	sfixed64() {
		return new A(this.sfixed32(), this.sfixed32());
	}
	float() {
		return this.view.getFloat32((this.pos += 4) - 4, !0);
	}
	double() {
		return this.view.getFloat64((this.pos += 8) - 8, !0);
	}
	bytes() {
		let e = this.uint32(), t = this.pos;
		return this.pos += e, this.assertBounds(), this.buf.subarray(t, t + e);
	}
	string() {
		return this.textDecoder.decode(this.bytes());
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/assert.js
function j(e, t) {
	if (!e) throw Error(t);
}
function At(e, t) {
	throw Error(t ?? "Unexpected object: " + e);
}
var jt = 34028234663852886e22, Mt = -34028234663852886e22, Nt = 4294967295, Pt = 2147483647, Ft = -2147483648;
function It(e) {
	if (typeof e != "number") throw Error("invalid int 32: " + typeof e);
	if (!Number.isInteger(e) || e > Pt || e < Ft) throw Error("invalid int 32: " + e);
}
function Lt(e) {
	if (typeof e != "number") throw Error("invalid uint 32: " + typeof e);
	if (!Number.isInteger(e) || e > Nt || e < 0) throw Error("invalid uint 32: " + e);
}
function Rt(e) {
	if (typeof e != "number") throw Error("invalid float 32: " + typeof e);
	if (Number.isFinite(e) && (e > jt || e < Mt)) throw Error("invalid float 32: " + e);
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/binary-writer.js
var zt = {
	writeUnknownFields: !0,
	writerFactory: () => new Vt()
};
function Bt(e) {
	return e ? Object.assign(Object.assign({}, zt), e) : zt;
}
var Vt = class {
	constructor(e) {
		this.stack = [], this.textEncoder = e ?? new TextEncoder(), this.chunks = [], this.buf = [];
	}
	finish() {
		this.chunks.push(new Uint8Array(this.buf));
		let e = 0;
		for (let t = 0; t < this.chunks.length; t++) e += this.chunks[t].length;
		let t = new Uint8Array(e), n = 0;
		for (let e = 0; e < this.chunks.length; e++) t.set(this.chunks[e], n), n += this.chunks[e].length;
		return this.chunks = [], t;
	}
	fork() {
		return this.stack.push({
			chunks: this.chunks,
			buf: this.buf
		}), this.chunks = [], this.buf = [], this;
	}
	join() {
		let e = this.finish(), t = this.stack.pop();
		if (!t) throw Error("invalid state, fork stack empty");
		return this.chunks = t.chunks, this.buf = t.buf, this.uint32(e.byteLength), this.raw(e);
	}
	tag(e, t) {
		return this.uint32((e << 3 | t) >>> 0);
	}
	raw(e) {
		return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(e), this;
	}
	uint32(e) {
		for (Lt(e); e > 127;) this.buf.push(e & 127 | 128), e >>>= 7;
		return this.buf.push(e), this;
	}
	int32(e) {
		return It(e), vt(e, this.buf), this;
	}
	bool(e) {
		return this.buf.push(+!!e), this;
	}
	bytes(e) {
		return this.uint32(e.byteLength), this.raw(e);
	}
	string(e) {
		let t = this.textEncoder.encode(e);
		return this.uint32(t.byteLength), this.raw(t);
	}
	float(e) {
		Rt(e);
		let t = /* @__PURE__ */ new Uint8Array(4);
		return new DataView(t.buffer).setFloat32(0, e, !0), this.raw(t);
	}
	double(e) {
		let t = /* @__PURE__ */ new Uint8Array(8);
		return new DataView(t.buffer).setFloat64(0, e, !0), this.raw(t);
	}
	fixed32(e) {
		Lt(e);
		let t = /* @__PURE__ */ new Uint8Array(4);
		return new DataView(t.buffer).setUint32(0, e, !0), this.raw(t);
	}
	sfixed32(e) {
		It(e);
		let t = /* @__PURE__ */ new Uint8Array(4);
		return new DataView(t.buffer).setInt32(0, e, !0), this.raw(t);
	}
	sint32(e) {
		return It(e), e = (e << 1 ^ e >> 31) >>> 0, vt(e, this.buf), this;
	}
	sfixed64(e) {
		let t = /* @__PURE__ */ new Uint8Array(8), n = new DataView(t.buffer), r = A.from(e);
		return n.setInt32(0, r.lo, !0), n.setInt32(4, r.hi, !0), this.raw(t);
	}
	fixed64(e) {
		let t = /* @__PURE__ */ new Uint8Array(8), n = new DataView(t.buffer), r = Et.from(e);
		return n.setInt32(0, r.lo, !0), n.setInt32(4, r.hi, !0), this.raw(t);
	}
	int64(e) {
		let t = A.from(e);
		return mt(t.lo, t.hi, this.buf), this;
	}
	sint64(e) {
		let t = A.from(e), n = t.hi >> 31;
		return mt(t.lo << 1 ^ n, (t.hi << 1 | t.lo >>> 31) ^ n, this.buf), this;
	}
	uint64(e) {
		let t = Et.from(e);
		return mt(t.lo, t.hi, this.buf), this;
	}
}, Ht = {
	emitDefaultValues: !1,
	enumAsInteger: !1,
	useProtoFieldName: !1,
	prettySpaces: 0
}, Ut = { ignoreUnknownFields: !1 };
function Wt(e) {
	return e ? Object.assign(Object.assign({}, Ut), e) : Ut;
}
function Gt(e) {
	return e ? Object.assign(Object.assign({}, Ht), e) : Ht;
}
function Kt(e, t) {
	let n = Object.assign(Object.assign({}, e), t);
	return n.typeRegistry = [...e?.typeRegistry ?? [], ...t?.typeRegistry ?? []], n;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/message-type-contract.js
var qt = Symbol.for("protobuf-ts/message-type");
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/lower-camel-case.js
function Jt(e) {
	let t = !1, n = [];
	for (let r = 0; r < e.length; r++) {
		let i = e.charAt(r);
		i == "_" ? t = !0 : /\d/.test(i) ? (n.push(i), t = !0) : t ? (n.push(i.toUpperCase()), t = !1) : r == 0 ? n.push(i.toLowerCase()) : n.push(i);
	}
	return n.join("");
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-info.js
var M;
(function(e) {
	e[e.DOUBLE = 1] = "DOUBLE", e[e.FLOAT = 2] = "FLOAT", e[e.INT64 = 3] = "INT64", e[e.UINT64 = 4] = "UINT64", e[e.INT32 = 5] = "INT32", e[e.FIXED64 = 6] = "FIXED64", e[e.FIXED32 = 7] = "FIXED32", e[e.BOOL = 8] = "BOOL", e[e.STRING = 9] = "STRING", e[e.BYTES = 12] = "BYTES", e[e.UINT32 = 13] = "UINT32", e[e.SFIXED32 = 15] = "SFIXED32", e[e.SFIXED64 = 16] = "SFIXED64", e[e.SINT32 = 17] = "SINT32", e[e.SINT64 = 18] = "SINT64";
})(M ||= {});
var Yt;
(function(e) {
	e[e.BIGINT = 0] = "BIGINT", e[e.STRING = 1] = "STRING", e[e.NUMBER = 2] = "NUMBER";
})(Yt ||= {});
var Xt;
(function(e) {
	e[e.NO = 0] = "NO", e[e.PACKED = 1] = "PACKED", e[e.UNPACKED = 2] = "UNPACKED";
})(Xt ||= {});
function Zt(e) {
	return e.localName = e.localName ?? Jt(e.name), e.jsonName = e.jsonName ?? Jt(e.name), e.repeat = e.repeat ?? Xt.NO, e.opt = e.opt ?? (!e.repeat && !e.oneof && e.kind == "message"), e;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/oneof.js
function Qt(e) {
	if (typeof e != "object" || !e || !e.hasOwnProperty("oneofKind")) return !1;
	switch (typeof e.oneofKind) {
		case "string": return e[e.oneofKind] !== void 0 && Object.keys(e).length == 2;
		case "undefined": return Object.keys(e).length == 1;
		default: return !1;
	}
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-type-check.js
var $t = class {
	constructor(e) {
		this.fields = e.fields ?? [];
	}
	prepare() {
		if (this.data) return;
		let e = [], t = [], n = [];
		for (let r of this.fields) if (r.oneof) n.includes(r.oneof) || (n.push(r.oneof), e.push(r.oneof), t.push(r.oneof));
		else switch (t.push(r.localName), r.kind) {
			case "scalar":
			case "enum":
				(!r.opt || r.repeat) && e.push(r.localName);
				break;
			case "message":
				r.repeat && e.push(r.localName);
				break;
			case "map": e.push(r.localName);
		}
		this.data = {
			req: e,
			known: t,
			oneofs: Object.values(n)
		};
	}
	is(e, t, n = !1) {
		if (t < 0) return !0;
		if (typeof e != "object" || !e) return !1;
		this.prepare();
		let r = Object.keys(e), i = this.data;
		if (r.length < i.req.length || i.req.some((e) => !r.includes(e)) || !n && r.some((e) => !i.known.includes(e))) return !1;
		if (t < 1) return !0;
		for (let r of i.oneofs) {
			let i = e[r];
			if (!Qt(i)) return !1;
			if (i.oneofKind === void 0) continue;
			let a = this.fields.find((e) => e.localName === i.oneofKind);
			if (!a || !this.field(i[i.oneofKind], a, n, t)) return !1;
		}
		for (let r of this.fields) if (r.oneof === void 0 && !this.field(e[r.localName], r, n, t)) return !1;
		return !0;
	}
	field(e, t, n, r) {
		let i = t.repeat;
		switch (t.kind) {
			case "scalar": return e === void 0 ? t.opt : i ? this.scalars(e, t.T, r, t.L) : this.scalar(e, t.T, t.L);
			case "enum": return e === void 0 ? t.opt : i ? this.scalars(e, M.INT32, r) : this.scalar(e, M.INT32);
			case "message": return e === void 0 ? !0 : i ? this.messages(e, t.T(), n, r) : this.message(e, t.T(), n, r);
			case "map":
				if (typeof e != "object" || !e) return !1;
				if (r < 2) return !0;
				if (!this.mapKeys(e, t.K, r)) return !1;
				switch (t.V.kind) {
					case "scalar": return this.scalars(Object.values(e), t.V.T, r, t.V.L);
					case "enum": return this.scalars(Object.values(e), M.INT32, r);
					case "message": return this.messages(Object.values(e), t.V.T(), n, r);
				}
		}
		return !0;
	}
	message(e, t, n, r) {
		return n ? t.isAssignable(e, r) : t.is(e, r);
	}
	messages(e, t, n, r) {
		if (!Array.isArray(e)) return !1;
		if (r < 2) return !0;
		if (n) {
			for (let n = 0; n < e.length && n < r; n++) if (!t.isAssignable(e[n], r - 1)) return !1;
		} else for (let n = 0; n < e.length && n < r; n++) if (!t.is(e[n], r - 1)) return !1;
		return !0;
	}
	scalar(e, t, n) {
		let r = typeof e;
		switch (t) {
			case M.UINT64:
			case M.FIXED64:
			case M.INT64:
			case M.SFIXED64:
			case M.SINT64: switch (n) {
				case Yt.BIGINT: return r == "bigint";
				case Yt.NUMBER: return r == "number" && !isNaN(e);
				default: return r == "string";
			}
			case M.BOOL: return r == "boolean";
			case M.STRING: return r == "string";
			case M.BYTES: return e instanceof Uint8Array;
			case M.DOUBLE:
			case M.FLOAT: return r == "number" && !isNaN(e);
			default: return r == "number" && Number.isInteger(e);
		}
	}
	scalars(e, t, n, r) {
		if (!Array.isArray(e)) return !1;
		if (n < 2) return !0;
		if (Array.isArray(e)) {
			for (let i = 0; i < e.length && i < n; i++) if (!this.scalar(e[i], t, r)) return !1;
		}
		return !0;
	}
	mapKeys(e, t, n) {
		let r = Object.keys(e);
		switch (t) {
			case M.INT32:
			case M.FIXED32:
			case M.SFIXED32:
			case M.SINT32:
			case M.UINT32: return this.scalars(r.slice(0, n).map((e) => parseInt(e)), t, n);
			case M.BOOL: return this.scalars(r.slice(0, n).map((e) => e == "true" || e != "false" && e), t, n);
			default: return this.scalars(r, t, n, Yt.STRING);
		}
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-long-convert.js
function en(e, t) {
	switch (t) {
		case Yt.BIGINT: return e.toBigInt();
		case Yt.NUMBER: return e.toNumber();
		default: return e.toString();
	}
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-json-reader.js
var tn = class {
	constructor(e) {
		this.info = e;
	}
	prepare() {
		if (this.fMap === void 0) {
			this.fMap = {};
			let e = this.info.fields ?? [];
			for (let t of e) this.fMap[t.name] = t, this.fMap[t.jsonName] = t, this.fMap[t.localName] = t;
		}
	}
	assert(e, t, n) {
		if (!e) {
			let e = it(n);
			throw (e == "number" || e == "boolean") && (e = n.toString()), Error(`Cannot parse JSON ${e} for ${this.info.typeName}#${t}`);
		}
	}
	read(e, t, n) {
		this.prepare();
		let r = [];
		for (let [i, a] of Object.entries(e)) {
			let e = this.fMap[i];
			if (!e) {
				if (!n.ignoreUnknownFields) throw Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${i}`);
				continue;
			}
			let o = e.localName, s;
			if (e.oneof) {
				if (a === null && (e.kind !== "enum" || e.T()[0] !== "google.protobuf.NullValue")) continue;
				if (r.includes(e.oneof)) throw Error(`Multiple members of the oneof group "${e.oneof}" of ${this.info.typeName} are present in JSON.`);
				r.push(e.oneof), s = t[e.oneof] = { oneofKind: o };
			} else s = t;
			if (e.kind == "map") {
				if (a === null) continue;
				this.assert(at(a), e.name, a);
				let t = s[o];
				for (let [r, i] of Object.entries(a)) {
					this.assert(i !== null, e.name + " map value", null);
					let a;
					switch (e.V.kind) {
						case "message":
							a = e.V.T().internalJsonRead(i, n);
							break;
						case "enum":
							if (a = this.enum(e.V.T(), i, e.name, n.ignoreUnknownFields), a === !1) continue;
							break;
						case "scalar": a = this.scalar(i, e.V.T, e.V.L, e.name);
					}
					this.assert(a !== void 0, e.name + " map value", i);
					let o = r;
					e.K == M.BOOL && (o = o == "true" || o != "false" && o), o = this.scalar(o, e.K, Yt.STRING, e.name).toString(), t[o] = a;
				}
			} else if (e.repeat) {
				if (a === null) continue;
				this.assert(Array.isArray(a), e.name, a);
				let t = s[o];
				for (let r of a) {
					this.assert(r !== null, e.name, null);
					let i;
					switch (e.kind) {
						case "message":
							i = e.T().internalJsonRead(r, n);
							break;
						case "enum":
							if (i = this.enum(e.T(), r, e.name, n.ignoreUnknownFields), i === !1) continue;
							break;
						case "scalar": i = this.scalar(r, e.T, e.L, e.name);
					}
					this.assert(i !== void 0, e.name, a), t.push(i);
				}
			} else switch (e.kind) {
				case "message":
					if (a === null && e.T().typeName != "google.protobuf.Value") {
						this.assert(e.oneof === void 0, e.name + " (oneof member)", null);
						continue;
					}
					s[o] = e.T().internalJsonRead(a, n, s[o]);
					break;
				case "enum":
					if (a === null) continue;
					let t = this.enum(e.T(), a, e.name, n.ignoreUnknownFields);
					if (t === !1) continue;
					s[o] = t;
					break;
				case "scalar":
					if (a === null) continue;
					s[o] = this.scalar(a, e.T, e.L, e.name);
			}
		}
	}
	enum(e, t, n, r) {
		if (e[0] == "google.protobuf.NullValue" && j(t === null || t === "NULL_VALUE", `Unable to parse field ${this.info.typeName}#${n}, enum ${e[0]} only accepts null.`), t === null) return 0;
		switch (typeof t) {
			case "number": return j(Number.isInteger(t), `Unable to parse field ${this.info.typeName}#${n}, enum can only be integral number, got ${t}.`), t;
			case "string":
				let i = t;
				e[2] && t.substring(0, e[2].length) === e[2] && (i = t.substring(e[2].length));
				let a = e[1][i];
				return a === void 0 && r ? !1 : (j(typeof a == "number", `Unable to parse field ${this.info.typeName}#${n}, enum ${e[0]} has no value for "${t}".`), a);
		}
		j(!1, `Unable to parse field ${this.info.typeName}#${n}, cannot parse enum value from ${typeof t}".`);
	}
	scalar(e, t, n, r) {
		let i;
		try {
			switch (t) {
				case M.DOUBLE:
				case M.FLOAT:
					if (e === null) return 0;
					if (e === "NaN") return NaN;
					if (e === "Infinity") return Infinity;
					if (e === "-Infinity") return -Infinity;
					if (e === "") {
						i = "empty string";
						break;
					}
					if (typeof e == "string" && e.trim().length !== e.length) {
						i = "extra whitespace";
						break;
					}
					if (typeof e != "string" && typeof e != "number") break;
					let r = Number(e);
					if (Number.isNaN(r)) {
						i = "not a number";
						break;
					}
					if (!Number.isFinite(r)) {
						i = "too large or small";
						break;
					}
					return t == M.FLOAT && Rt(r), r;
				case M.INT32:
				case M.FIXED32:
				case M.SFIXED32:
				case M.SINT32:
				case M.UINT32:
					if (e === null) return 0;
					let a;
					if (typeof e == "number" ? a = e : e === "" ? i = "empty string" : typeof e == "string" && (e.trim().length === e.length ? a = Number(e) : i = "extra whitespace"), a === void 0) break;
					return t == M.UINT32 ? Lt(a) : It(a), a;
				case M.INT64:
				case M.SFIXED64:
				case M.SINT64:
					if (e === null) return en(A.ZERO, n);
					if (typeof e != "number" && typeof e != "string") break;
					return en(A.from(e), n);
				case M.FIXED64:
				case M.UINT64:
					if (e === null) return en(Et.ZERO, n);
					if (typeof e != "number" && typeof e != "string") break;
					return en(Et.from(e), n);
				case M.BOOL:
					if (e === null) return !1;
					if (typeof e != "boolean") break;
					return e;
				case M.STRING:
					if (e === null) return "";
					if (typeof e != "string") {
						i = "extra whitespace";
						break;
					}
					return e;
				case M.BYTES:
					if (e === null || e === "") return /* @__PURE__ */ new Uint8Array();
					if (typeof e != "string") break;
					return ct(e);
			}
		} catch (e) {
			i = e.message;
		}
		this.assert(!1, r + (i ? " - " + i : ""), e);
	}
}, nn = class {
	constructor(e) {
		this.fields = e.fields ?? [];
	}
	write(e, t) {
		let n = {}, r = e;
		for (let e of this.fields) {
			if (!e.oneof) {
				let i = this.field(e, r[e.localName], t);
				i !== void 0 && (n[t.useProtoFieldName ? e.name : e.jsonName] = i);
				continue;
			}
			let i = r[e.oneof];
			if (i.oneofKind !== e.localName) continue;
			let a = e.kind == "scalar" || e.kind == "enum" ? Object.assign(Object.assign({}, t), { emitDefaultValues: !0 }) : t, o = this.field(e, i[e.localName], a);
			j(o !== void 0), n[t.useProtoFieldName ? e.name : e.jsonName] = o;
		}
		return n;
	}
	field(e, t, n) {
		let r;
		if (e.kind == "map") {
			j(typeof t == "object" && !!t);
			let i = {};
			switch (e.V.kind) {
				case "scalar":
					for (let [n, r] of Object.entries(t)) {
						let t = this.scalar(e.V.T, r, e.name, !1, !0);
						j(t !== void 0), i[n.toString()] = t;
					}
					break;
				case "message":
					let r = e.V.T();
					for (let [a, o] of Object.entries(t)) {
						let t = this.message(r, o, e.name, n);
						j(t !== void 0), i[a.toString()] = t;
					}
					break;
				case "enum":
					let a = e.V.T();
					for (let [r, o] of Object.entries(t)) {
						j(o === void 0 || typeof o == "number");
						let t = this.enum(a, o, e.name, !1, !0, n.enumAsInteger);
						j(t !== void 0), i[r.toString()] = t;
					}
			}
			(n.emitDefaultValues || Object.keys(i).length > 0) && (r = i);
		} else if (e.repeat) {
			j(Array.isArray(t));
			let i = [];
			switch (e.kind) {
				case "scalar":
					for (let n = 0; n < t.length; n++) {
						let r = this.scalar(e.T, t[n], e.name, e.opt, !0);
						j(r !== void 0), i.push(r);
					}
					break;
				case "enum":
					let r = e.T();
					for (let a = 0; a < t.length; a++) {
						j(t[a] === void 0 || typeof t[a] == "number");
						let o = this.enum(r, t[a], e.name, e.opt, !0, n.enumAsInteger);
						j(o !== void 0), i.push(o);
					}
					break;
				case "message":
					let a = e.T();
					for (let r = 0; r < t.length; r++) {
						let o = this.message(a, t[r], e.name, n);
						j(o !== void 0), i.push(o);
					}
			}
			(n.emitDefaultValues || i.length > 0 || n.emitDefaultValues) && (r = i);
		} else switch (e.kind) {
			case "scalar":
				r = this.scalar(e.T, t, e.name, e.opt, n.emitDefaultValues);
				break;
			case "enum":
				r = this.enum(e.T(), t, e.name, e.opt, n.emitDefaultValues, n.enumAsInteger);
				break;
			case "message": r = this.message(e.T(), t, e.name, n);
		}
		return r;
	}
	enum(e, t, n, r, i, a) {
		if (e[0] == "google.protobuf.NullValue") return !i && !r ? void 0 : null;
		if (t === void 0) j(r);
		else if (t !== 0 || i || r) return j(typeof t == "number"), j(Number.isInteger(t)), a || !e[1].hasOwnProperty(t) ? t : e[2] ? e[2] + e[1][t] : e[1][t];
	}
	message(e, t, n, r) {
		return t === void 0 ? r.emitDefaultValues ? null : void 0 : e.internalJsonWrite(t, r);
	}
	scalar(e, t, n, r, i) {
		if (t === void 0) {
			j(r);
			return;
		}
		let a = i || r;
		switch (e) {
			case M.INT32:
			case M.SFIXED32:
			case M.SINT32: return t === 0 ? a ? 0 : void 0 : (It(t), t);
			case M.FIXED32:
			case M.UINT32: return t === 0 ? a ? 0 : void 0 : (Lt(t), t);
			case M.FLOAT: Rt(t);
			case M.DOUBLE: return t === 0 ? a ? 0 : void 0 : (j(typeof t == "number"), Number.isNaN(t) ? "NaN" : t === Infinity ? "Infinity" : t === -Infinity ? "-Infinity" : t);
			case M.STRING: return t === "" ? a ? "" : void 0 : (j(typeof t == "string"), t);
			case M.BOOL: return t === !1 ? !a && void 0 : (j(typeof t == "boolean"), t);
			case M.UINT64:
			case M.FIXED64:
				j(typeof t == "number" || typeof t == "string" || typeof t == "bigint");
				let e = Et.from(t);
				return e.isZero() && !a ? void 0 : e.toString();
			case M.INT64:
			case M.SFIXED64:
			case M.SINT64:
				j(typeof t == "number" || typeof t == "string" || typeof t == "bigint");
				let n = A.from(t);
				return n.isZero() && !a ? void 0 : n.toString();
			case M.BYTES: return j(t instanceof Uint8Array), t.byteLength ? lt(t) : a ? "" : void 0;
		}
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-scalar-default.js
function rn(e, t = Yt.STRING) {
	switch (e) {
		case M.BOOL: return !1;
		case M.UINT64:
		case M.FIXED64: return en(Et.ZERO, t);
		case M.INT64:
		case M.SFIXED64:
		case M.SINT64: return en(A.ZERO, t);
		case M.DOUBLE:
		case M.FLOAT: return 0;
		case M.BYTES: return /* @__PURE__ */ new Uint8Array();
		case M.STRING: return "";
		default: return 0;
	}
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-binary-reader.js
var an = class {
	constructor(e) {
		this.info = e;
	}
	prepare() {
		if (!this.fieldNoToField) {
			let e = this.info.fields ?? [];
			this.fieldNoToField = new Map(e.map((e) => [e.no, e]));
		}
	}
	read(e, t, n, r) {
		this.prepare();
		let i = r === void 0 ? e.len : e.pos + r;
		for (; e.pos < i;) {
			let [r, i] = e.tag(), a = this.fieldNoToField.get(r);
			if (!a) {
				let a = n.readUnknownField;
				if (a == "throw") throw Error(`Unknown field ${r} (wire type ${i}) for ${this.info.typeName}`);
				let o = e.skip(i);
				a !== !1 && (a === !0 ? ut.onRead : a)(this.info.typeName, t, r, i, o);
				continue;
			}
			let o = t, s = a.repeat, c = a.localName;
			switch (a.oneof && (o = o[a.oneof], o.oneofKind !== c && (o = t[a.oneof] = { oneofKind: c })), a.kind) {
				case "scalar":
				case "enum":
					let t = a.kind == "enum" ? M.INT32 : a.T, r = a.kind == "scalar" ? a.L : void 0;
					if (s) {
						let n = o[c];
						if (i == ft.LengthDelimited && t != M.STRING && t != M.BYTES) {
							let i = e.uint32() + e.pos;
							for (; e.pos < i;) n.push(this.scalar(e, t, r));
						} else n.push(this.scalar(e, t, r));
					} else o[c] = this.scalar(e, t, r);
					break;
				case "message":
					if (s) {
						let t = o[c], r = a.T().internalBinaryRead(e, e.uint32(), n);
						t.push(r);
					} else o[c] = a.T().internalBinaryRead(e, e.uint32(), n, o[c]);
					break;
				case "map":
					let [l, u] = this.mapEntry(a, e, n);
					o[c][l] = u;
			}
		}
	}
	mapEntry(e, t, n) {
		let r = t.uint32(), i = t.pos + r, a, o;
		for (; t.pos < i;) {
			let [r, i] = t.tag();
			switch (r) {
				case 1:
					a = e.K == M.BOOL ? t.bool().toString() : this.scalar(t, e.K, Yt.STRING);
					break;
				case 2:
					switch (e.V.kind) {
						case "scalar":
							o = this.scalar(t, e.V.T, e.V.L);
							break;
						case "enum":
							o = t.int32();
							break;
						case "message": o = e.V.T().internalBinaryRead(t, t.uint32(), n);
					}
					break;
				default: throw Error(`Unknown field ${r} (wire type ${i}) in map entry for ${this.info.typeName}#${e.name}`);
			}
		}
		if (a === void 0) {
			let t = rn(e.K);
			a = e.K == M.BOOL ? t.toString() : t;
		}
		if (o === void 0) switch (e.V.kind) {
			case "scalar":
				o = rn(e.V.T, e.V.L);
				break;
			case "enum":
				o = 0;
				break;
			case "message": o = e.V.T().create();
		}
		return [a, o];
	}
	scalar(e, t, n) {
		switch (t) {
			case M.INT32: return e.int32();
			case M.STRING: return e.string();
			case M.BOOL: return e.bool();
			case M.DOUBLE: return e.double();
			case M.FLOAT: return e.float();
			case M.INT64: return en(e.int64(), n);
			case M.UINT64: return en(e.uint64(), n);
			case M.FIXED64: return en(e.fixed64(), n);
			case M.FIXED32: return e.fixed32();
			case M.BYTES: return e.bytes();
			case M.UINT32: return e.uint32();
			case M.SFIXED32: return e.sfixed32();
			case M.SFIXED64: return en(e.sfixed64(), n);
			case M.SINT32: return e.sint32();
			case M.SINT64: return en(e.sint64(), n);
		}
	}
}, on = class {
	constructor(e) {
		this.info = e;
	}
	prepare() {
		if (!this.fields) {
			let e = this.info.fields ? this.info.fields.concat() : [];
			this.fields = e.sort((e, t) => e.no - t.no);
		}
	}
	write(e, t, n) {
		this.prepare();
		for (let r of this.fields) {
			let i, a, o = r.repeat, s = r.localName;
			if (r.oneof) {
				let t = e[r.oneof];
				if (t.oneofKind !== s) continue;
				i = t[s], a = !0;
			} else i = e[s], a = !1;
			switch (r.kind) {
				case "scalar":
				case "enum":
					let e = r.kind == "enum" ? M.INT32 : r.T;
					if (o) {
						if (j(Array.isArray(i)), o == Xt.PACKED) this.packed(t, e, r.no, i);
						else for (let n of i) this.scalar(t, e, r.no, n, !0);
					} else i === void 0 ? j(r.opt) : this.scalar(t, e, r.no, i, a || r.opt);
					break;
				case "message":
					if (o) {
						j(Array.isArray(i));
						for (let e of i) this.message(t, n, r.T(), r.no, e);
					} else this.message(t, n, r.T(), r.no, i);
					break;
				case "map":
					j(typeof i == "object" && !!i);
					for (let [e, a] of Object.entries(i)) this.mapEntry(t, n, r, e, a);
			}
		}
		let r = n.writeUnknownFields;
		r !== !1 && (r === !0 ? ut.onWrite : r)(this.info.typeName, e, t);
	}
	mapEntry(e, t, n, r, i) {
		e.tag(n.no, ft.LengthDelimited), e.fork();
		let a = r;
		switch (n.K) {
			case M.INT32:
			case M.FIXED32:
			case M.UINT32:
			case M.SFIXED32:
			case M.SINT32:
				a = Number.parseInt(r);
				break;
			case M.BOOL: j(r == "true" || r == "false"), a = r == "true";
		}
		switch (this.scalar(e, n.K, 1, a, !0), n.V.kind) {
			case "scalar":
				this.scalar(e, n.V.T, 2, i, !0);
				break;
			case "enum":
				this.scalar(e, M.INT32, 2, i, !0);
				break;
			case "message": this.message(e, t, n.V.T(), 2, i);
		}
		e.join();
	}
	message(e, t, n, r, i) {
		i !== void 0 && (n.internalBinaryWrite(i, e.tag(r, ft.LengthDelimited).fork(), t), e.join());
	}
	scalar(e, t, n, r, i) {
		let [a, o, s] = this.scalarInfo(t, r);
		(!s || i) && (e.tag(n, a), e[o](r));
	}
	packed(e, t, n, r) {
		if (!r.length) return;
		j(t !== M.BYTES && t !== M.STRING), e.tag(n, ft.LengthDelimited), e.fork();
		let [, i] = this.scalarInfo(t);
		for (let t = 0; t < r.length; t++) e[i](r[t]);
		e.join();
	}
	scalarInfo(e, t) {
		let n = ft.Varint, r, i = t === void 0, a = t === 0;
		switch (e) {
			case M.INT32:
				r = "int32";
				break;
			case M.STRING:
				a = i || !t.length, n = ft.LengthDelimited, r = "string";
				break;
			case M.BOOL:
				a = t === !1, r = "bool";
				break;
			case M.UINT32:
				r = "uint32";
				break;
			case M.DOUBLE:
				n = ft.Bit64, r = "double";
				break;
			case M.FLOAT:
				n = ft.Bit32, r = "float";
				break;
			case M.INT64:
				a = i || A.from(t).isZero(), r = "int64";
				break;
			case M.UINT64:
				a = i || Et.from(t).isZero(), r = "uint64";
				break;
			case M.FIXED64:
				a = i || Et.from(t).isZero(), n = ft.Bit64, r = "fixed64";
				break;
			case M.BYTES:
				a = i || !t.byteLength, n = ft.LengthDelimited, r = "bytes";
				break;
			case M.FIXED32:
				n = ft.Bit32, r = "fixed32";
				break;
			case M.SFIXED32:
				n = ft.Bit32, r = "sfixed32";
				break;
			case M.SFIXED64:
				a = i || A.from(t).isZero(), n = ft.Bit64, r = "sfixed64";
				break;
			case M.SINT32:
				r = "sint32";
				break;
			case M.SINT64: a = i || A.from(t).isZero(), r = "sint64";
		}
		return [
			n,
			r,
			i || a
		];
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-create.js
function sn(e) {
	let t = e.messagePrototype ? Object.create(e.messagePrototype) : Object.defineProperty({}, qt, { value: e });
	for (let n of e.fields) {
		let e = n.localName;
		if (!n.opt) {
			if (n.oneof) t[n.oneof] = { oneofKind: void 0 };
			else if (n.repeat) t[e] = [];
			else switch (n.kind) {
				case "scalar":
					t[e] = rn(n.T, n.L);
					break;
				case "enum":
					t[e] = 0;
					break;
				case "map": t[e] = {};
			}
		}
	}
	return t;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-merge-partial.js
function cn(e, t, n) {
	let r, i = n, a;
	for (let n of e.fields) {
		let e = n.localName;
		if (n.oneof) {
			let o = i[n.oneof];
			if (o?.oneofKind == null) continue;
			if (r = o[e], a = t[n.oneof], a.oneofKind = o.oneofKind, r == null) {
				delete a[e];
				continue;
			}
		} else if (r = i[e], a = t, r == null) continue;
		switch (n.repeat && (a[e].length = r.length), n.kind) {
			case "scalar":
			case "enum":
				if (n.repeat) for (let t = 0; t < r.length; t++) a[e][t] = r[t];
				else a[e] = r;
				break;
			case "message":
				let t = n.T();
				if (n.repeat) for (let n = 0; n < r.length; n++) a[e][n] = t.create(r[n]);
				else a[e] === void 0 ? a[e] = t.create(r) : t.mergePartial(a[e], r);
				break;
			case "map": switch (n.V.kind) {
				case "scalar":
				case "enum":
					Object.assign(a[e], r);
					break;
				case "message":
					let t = n.V.T();
					for (let n of Object.keys(r)) a[e][n] = t.create(r[n]);
			}
		}
	}
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/reflection-equals.js
function ln(e, t, n) {
	if (t === n) return !0;
	if (!t || !n) return !1;
	for (let r of e.fields) {
		let e = r.localName, i = r.oneof ? t[r.oneof][e] : t[e], a = r.oneof ? n[r.oneof][e] : n[e];
		switch (r.kind) {
			case "enum":
			case "scalar":
				let e = r.kind == "enum" ? M.INT32 : r.T;
				if (!(r.repeat ? fn(e, i, a) : dn(e, i, a))) return !1;
				break;
			case "map":
				if (!(r.V.kind == "message" ? pn(r.V.T(), un(i), un(a)) : fn(r.V.kind == "enum" ? M.INT32 : r.V.T, un(i), un(a)))) return !1;
				break;
			case "message":
				let t = r.T();
				if (!(r.repeat ? pn(t, i, a) : t.equals(i, a))) return !1;
		}
	}
	return !0;
}
var un = Object.values;
function dn(e, t, n) {
	if (t === n) return !0;
	if (e !== M.BYTES) return !1;
	let r = t, i = n;
	if (r.length !== i.length) return !1;
	for (let e = 0; e < r.length; e++) if (r[e] != i[e]) return !1;
	return !0;
}
function fn(e, t, n) {
	if (t.length !== n.length) return !1;
	for (let r = 0; r < t.length; r++) if (!dn(e, t[r], n[r])) return !1;
	return !0;
}
function pn(e, t, n) {
	if (t.length !== n.length) return !1;
	for (let r = 0; r < t.length; r++) if (!e.equals(t[r], n[r])) return !1;
	return !0;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime/build/es2015/message-type.js
var mn = Object.getOwnPropertyDescriptors(Object.getPrototypeOf({})), hn = mn[qt] = {}, N = class {
	constructor(e, t, n) {
		this.defaultCheckDepth = 16, this.typeName = e, this.fields = t.map(Zt), this.options = n ?? {}, hn.value = this, this.messagePrototype = Object.create(null, mn), this.refTypeCheck = new $t(this), this.refJsonReader = new tn(this), this.refJsonWriter = new nn(this), this.refBinReader = new an(this), this.refBinWriter = new on(this);
	}
	create(e) {
		let t = sn(this);
		return e !== void 0 && cn(this, t, e), t;
	}
	clone(e) {
		let t = this.create();
		return cn(this, t, e), t;
	}
	equals(e, t) {
		return ln(this, e, t);
	}
	is(e, t = this.defaultCheckDepth) {
		return this.refTypeCheck.is(e, t, !1);
	}
	isAssignable(e, t = this.defaultCheckDepth) {
		return this.refTypeCheck.is(e, t, !0);
	}
	mergePartial(e, t) {
		cn(this, e, t);
	}
	fromBinary(e, t) {
		let n = Ot(t);
		return this.internalBinaryRead(n.readerFactory(e), e.byteLength, n);
	}
	fromJson(e, t) {
		return this.internalJsonRead(e, Wt(t));
	}
	fromJsonString(e, t) {
		let n = JSON.parse(e);
		return this.fromJson(n, t);
	}
	toJson(e, t) {
		return this.internalJsonWrite(e, Gt(t));
	}
	toJsonString(e, t) {
		let n = this.toJson(e, t);
		return JSON.stringify(n, null, t?.prettySpaces ?? 0);
	}
	toBinary(e, t) {
		let n = Bt(t);
		return this.internalBinaryWrite(e, n.writerFactory(), n).finish();
	}
	internalJsonRead(e, t, n) {
		if (typeof e == "object" && e && !Array.isArray(e)) {
			let r = n ?? this.create();
			return this.refJsonReader.read(e, r, t), r;
		}
		throw Error(`Unable to parse message ${this.typeName} from JSON ${it(e)}.`);
	}
	internalJsonWrite(e, t) {
		return this.refJsonWriter.write(e, t);
	}
	internalBinaryWrite(e, t, n) {
		return this.refBinWriter.write(e, t, n), t;
	}
	internalBinaryRead(e, t, n, r) {
		let i = r ?? this.create();
		return this.refBinReader.read(e, i, n, t), i;
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime-rpc/build/es2015/reflection-info.js
function gn(e, t) {
	let n = e;
	return n.service = t, n.localName = n.localName ?? Jt(n.name), n.serverStreaming = !!n.serverStreaming, n.clientStreaming = !!n.clientStreaming, n.options = n.options ?? {}, n.idempotency = n.idempotency ?? void 0, n;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime-rpc/build/es2015/service-type.js
var _n = class {
	constructor(e, t, n) {
		this.typeName = e, this.methods = t.map((e) => gn(e, this)), this.options = n ?? {};
	}
}, vn = class extends Error {
	constructor(e, t = "UNKNOWN", n) {
		super(e), this.name = "RpcError", Object.setPrototypeOf(this, new.target.prototype), this.code = t, this.meta = n ?? {};
	}
	toString() {
		let e = [this.name + ": " + this.message];
		this.code && (e.push(""), e.push("Code: " + this.code)), this.serviceName && this.methodName && e.push("Method: " + this.serviceName + "/" + this.methodName);
		let t = Object.entries(this.meta);
		if (t.length) {
			e.push(""), e.push("Meta:");
			for (let [n, r] of t) e.push(`  ${n}: ${r}`);
		}
		return e.join("\n");
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime-rpc/build/es2015/rpc-options.js
function yn(e, t) {
	if (!t) return e;
	let n = {};
	bn(e, n), bn(t, n);
	for (let r of Object.keys(t)) {
		let i = t[r];
		switch (r) {
			case "jsonOptions":
				n.jsonOptions = Kt(e.jsonOptions, n.jsonOptions);
				break;
			case "binaryOptions":
				n.binaryOptions = dt(e.binaryOptions, n.binaryOptions);
				break;
			case "meta":
				n.meta = {}, bn(e.meta, n.meta), bn(t.meta, n.meta);
				break;
			case "interceptors": n.interceptors = e.interceptors ? e.interceptors.concat(i) : i.concat();
		}
	}
	return n;
}
function bn(e, t) {
	if (!e) return;
	let n = t;
	for (let [t, r] of Object.entries(e)) n[t] = r instanceof Date ? new Date(r.getTime()) : Array.isArray(r) ? r.concat() : r;
}
//#endregion
//#region node_modules/@protobuf-ts/runtime-rpc/build/es2015/deferred.js
var xn;
(function(e) {
	e[e.PENDING = 0] = "PENDING", e[e.REJECTED = 1] = "REJECTED", e[e.RESOLVED = 2] = "RESOLVED";
})(xn ||= {});
var Sn = class {
	constructor(e = !0) {
		this._state = xn.PENDING, this._promise = new Promise((e, t) => {
			this._resolve = e, this._reject = t;
		}), e && this._promise.catch((e) => {});
	}
	get state() {
		return this._state;
	}
	get promise() {
		return this._promise;
	}
	resolve(e) {
		if (this.state !== xn.PENDING) throw Error(`cannot resolve ${xn[this.state].toLowerCase()}`);
		this._resolve(e), this._state = xn.RESOLVED;
	}
	reject(e) {
		if (this.state !== xn.PENDING) throw Error(`cannot reject ${xn[this.state].toLowerCase()}`);
		this._reject(e), this._state = xn.REJECTED;
	}
	resolvePending(e) {
		this._state === xn.PENDING && this.resolve(e);
	}
	rejectPending(e) {
		this._state === xn.PENDING && this.reject(e);
	}
}, Cn = function(e, t, n, r) {
	function i(e) {
		return e instanceof n ? e : new n(function(t) {
			t(e);
		});
	}
	return new (n ||= Promise)(function(n, a) {
		function o(e) {
			try {
				c(r.next(e));
			} catch (e) {
				a(e);
			}
		}
		function s(e) {
			try {
				c(r.throw(e));
			} catch (e) {
				a(e);
			}
		}
		function c(e) {
			e.done ? n(e.value) : i(e.value).then(o, s);
		}
		c((r = r.apply(e, t || [])).next());
	});
}, wn = class {
	constructor(e, t, n, r, i, a, o) {
		this.method = e, this.requestHeaders = t, this.request = n, this.headers = r, this.response = i, this.status = a, this.trailers = o;
	}
	then(e, t) {
		return this.promiseFinished().then((t) => e ? Promise.resolve(e(t)) : t, (e) => t ? Promise.resolve(t(e)) : Promise.reject(e));
	}
	promiseFinished() {
		return Cn(this, void 0, void 0, function* () {
			let [e, t, n, r] = yield Promise.all([
				this.headers,
				this.response,
				this.status,
				this.trailers
			]);
			return {
				method: this.method,
				requestHeaders: this.requestHeaders,
				request: this.request,
				headers: e,
				response: t,
				status: n,
				trailers: r
			};
		});
	}
};
//#endregion
//#region node_modules/@protobuf-ts/runtime-rpc/build/es2015/rpc-interceptor.js
function Tn(e, t, n, r, i) {
	if (e == "unary") {
		let e = (e, n, r) => t.unary(e, n, r);
		for (let t of (r.interceptors ?? []).filter((e) => e.interceptUnary).reverse()) {
			let n = e;
			e = (e, r, i) => t.interceptUnary(n, e, r, i);
		}
		return e(n, i, r);
	}
	if (e == "serverStreaming") {
		let e = (e, n, r) => t.serverStreaming(e, n, r);
		for (let t of (r.interceptors ?? []).filter((e) => e.interceptServerStreaming).reverse()) {
			let n = e;
			e = (e, r, i) => t.interceptServerStreaming(n, e, r, i);
		}
		return e(n, i, r);
	}
	if (e == "clientStreaming") {
		let e = (e, n) => t.clientStreaming(e, n);
		for (let t of (r.interceptors ?? []).filter((e) => e.interceptClientStreaming).reverse()) {
			let n = e;
			e = (e, r) => t.interceptClientStreaming(n, e, r);
		}
		return e(n, r);
	}
	if (e == "duplex") {
		let e = (e, n) => t.duplex(e, n);
		for (let t of (r.interceptors ?? []).filter((e) => e.interceptDuplex).reverse()) {
			let n = e;
			e = (e, r) => t.interceptDuplex(n, e, r);
		}
		return e(n, r);
	}
	At(e);
}
//#endregion
//#region node_modules/axios/lib/helpers/bind.js
function En(e, t) {
	return function() {
		return e.apply(t, arguments);
	};
}
//#endregion
//#region node_modules/axios/lib/utils.js
var { toString: Dn } = Object.prototype, { getPrototypeOf: On } = Object, { iterator: kn, toStringTag: An } = Symbol, jn = (({ hasOwnProperty: e }) => (t, n) => e.call(t, n))(Object.prototype), Mn = (e) => typeof e == "string" && (e === "__proto__" || e === "constructor" || e === "prototype"), Nn = (e, t, n) => e === Object.prototype || !n && t === null, Pn = (e) => {
	if (!Object.isExtensible(e)) return !1;
	let t = Object.getOwnPropertyNames(e);
	return Object.getOwnPropertySymbols && t.push(...Object.getOwnPropertySymbols(e)), t.every((t) => {
		if (Mn(t)) return !1;
		let n = Object.getOwnPropertyDescriptor(e, t);
		return !!n && n.configurable && n.writable === !0;
	});
}, Fn = (e, t) => {
	let n = e, r = [];
	for (; n != null;) {
		if (r.indexOf(n) !== -1) return !1;
		r.push(n);
		let i = On(n);
		if (Nn(n, i, n === e)) return !1;
		if (jn(n, t)) return !0;
		n = i;
	}
	return !1;
}, In = (e, t) => e != null && Fn(e, t) ? e[t] : void 0, Ln = (e) => {
	if (e == null || typeof e != "object" && typeof e != "function") return e;
	let t = On(e);
	if (t === null && Pn(e)) return e;
	let n = Object.create(null), r = Object.create(null), i = [], a = e;
	for (; a != null && i.indexOf(a) === -1;) {
		i.push(a);
		let o = a === e ? t : On(a);
		if (Nn(a, o, a === e)) break;
		let s = Object.getOwnPropertyNames(a);
		Object.getOwnPropertySymbols && s.push(...Object.getOwnPropertySymbols(a));
		for (let t of s) Mn(t) || jn(r, t) || (n[t] = e[t], r[t] = !0);
		a = o;
	}
	return n;
}, Rn = ((e) => (t) => {
	let n = Dn.call(t);
	return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
})(Object.create(null)), zn = (e) => (e = e.toLowerCase(), (t) => Rn(t) === e), Bn = (e) => (t) => typeof t === e, { isArray: Vn } = Array, Hn = Bn("undefined");
function Un(e) {
	return e !== null && !Hn(e) && e.constructor !== null && !Hn(e.constructor) && qn(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
var Wn = zn("ArrayBuffer");
function Gn(e) {
	let t;
	return t = typeof ArrayBuffer < "u" && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && Wn(e.buffer), t;
}
var Kn = Bn("string"), qn = Bn("function"), Jn = Bn("number"), Yn = (e) => typeof e == "object" && !!e, Xn = (e) => e === !0 || e === !1, Zn = (e) => {
	if (!Yn(e)) return !1;
	let t = On(e);
	return (t === null || t === Object.prototype || On(t) === null) && !Fn(e, An) && !Fn(e, kn);
}, Qn = (e) => {
	if (!Yn(e) || Un(e)) return !1;
	try {
		return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
	} catch {
		return !1;
	}
}, $n = zn("Date"), er = zn("File"), tr = (e) => !!(e && e.uri !== void 0), nr = (e) => e && e.getParts !== void 0, rr = zn("Blob"), ir = zn("FileList"), ar = zn("Set"), or = (e) => Yn(e) && qn(e.pipe);
function sr() {
	return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
var cr = sr(), lr = cr.FormData === void 0 ? void 0 : cr.FormData, ur = (e) => {
	if (!e) return !1;
	if (lr && e instanceof lr) return !0;
	let t = On(e);
	if (!t || t === Object.prototype || !qn(e.append)) return !1;
	let n = Rn(e);
	return n === "formdata" || n === "object" && qn(e.toString) && e.toString() === "[object FormData]";
}, dr = zn("URLSearchParams"), [fr, pr, mr, hr] = [
	"ReadableStream",
	"Request",
	"Response",
	"Headers"
].map(zn), gr = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function _r(e, t, { allOwnKeys: n = !1 } = {}) {
	if (e == null) return;
	let r, i;
	if (typeof e != "object" && (e = [e]), Vn(e)) for (r = 0, i = e.length; r < i; r++) t.call(null, e[r], r, e);
	else {
		if (Un(e)) return;
		let i = n ? Object.getOwnPropertyNames(e) : Object.keys(e), a = i.length, o;
		for (r = 0; r < a; r++) o = i[r], t.call(null, e[o], o, e);
	}
}
function vr(e, t) {
	if (Un(e)) return null;
	t = t.toLowerCase();
	let n = Object.keys(e), r = n.length, i;
	for (; r-- > 0;) if (i = n[r], t === i.toLowerCase()) return i;
	return null;
}
var yr = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, br = (e) => !Hn(e) && e !== yr;
function xr(...e) {
	let { caseless: t, skipUndefined: n } = br(this) && this || {}, r = {}, i = (e, i) => {
		if (i === "__proto__" || i === "constructor" || i === "prototype") return;
		let a = t && typeof i == "string" && vr(r, i) || i, o = jn(r, a) ? r[a] : void 0;
		Zn(o) && Zn(e) ? r[a] = xr(o, e) : Zn(e) ? r[a] = xr({}, e) : Vn(e) ? r[a] = e.slice() : (!n || !Hn(e)) && (r[a] = e);
	};
	for (let t = 0, n = e.length; t < n; t++) {
		let n = e[t];
		if (!n || Un(n) || (_r(n, i), typeof n != "object" || Vn(n))) continue;
		let r = Object.getOwnPropertySymbols(n);
		for (let e = 0; e < r.length; e++) {
			let t = r[e];
			Nr.call(n, t) && i(n[t], t);
		}
	}
	return r;
}
var Sr = (e, t, n, { allOwnKeys: r } = {}) => (_r(t, (t, r) => {
	n && qn(t) ? Object.defineProperty(e, r, {
		__proto__: null,
		value: En(t, n),
		writable: !0,
		enumerable: !0,
		configurable: !0
	}) : Object.defineProperty(e, r, {
		__proto__: null,
		value: t,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}, { allOwnKeys: r }), e), Cr = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), wr = (e, t, n, r) => {
	e.prototype = Object.create(t.prototype, r), Object.defineProperty(e.prototype, "constructor", {
		__proto__: null,
		value: e,
		writable: !0,
		enumerable: !1,
		configurable: !0
	}), Object.defineProperty(e, "super", {
		__proto__: null,
		value: t.prototype
	}), n && Object.assign(e.prototype, n);
}, Tr = (e, t, n, r) => {
	let i, a, o, s = {};
	if (t ||= {}, e == null) return t;
	do {
		for (i = Object.getOwnPropertyNames(e), a = i.length; a-- > 0;) o = i[a], (!r || r(o, e, t)) && !s[o] && (t[o] = e[o], s[o] = !0);
		e = n !== !1 && On(e);
	} while (e && (!n || n(e, t)) && e !== Object.prototype);
	return t;
}, Er = (e, t, n) => {
	e = String(e), (n === void 0 || n > e.length) && (n = e.length), n -= t.length;
	let r = e.indexOf(t, n);
	return r !== -1 && r === n;
}, Dr = (e) => {
	if (!e) return null;
	if (Vn(e)) return e;
	let t = e.length;
	if (!Jn(t)) return null;
	let n = Array(t);
	for (; t-- > 0;) n[t] = e[t];
	return n;
}, Or = ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && On(Uint8Array)), kr = (e, t) => {
	let n = (e && e[kn]).call(e), r;
	for (; (r = n.next()) && !r.done;) {
		let n = r.value;
		t.call(e, n[0], n[1]);
	}
}, Ar = (e, t) => {
	let n, r = [];
	for (; (n = e.exec(t)) !== null;) r.push(n);
	return r;
}, jr = zn("HTMLFormElement"), Mr = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(e, t, n) {
	return t.toUpperCase() + n;
}), { propertyIsEnumerable: Nr } = Object.prototype, Pr = zn("RegExp"), Fr = (e, t) => {
	let n = Object.getOwnPropertyDescriptors(e), r = {};
	_r(n, (n, i) => {
		let a;
		(a = t(n, i, e)) !== !1 && (r[i] = a || n);
	}), Object.defineProperties(e, r);
}, Ir = (e) => {
	Fr(e, (t, n) => {
		if (qn(e) && [
			"arguments",
			"caller",
			"callee"
		].includes(n)) return !1;
		let r = e[n];
		qn(r) && (t.enumerable = !1, "writable" in t ? t.writable = !1 : t.set ||= () => {
			throw Error("Can not rewrite read-only method '" + n + "'");
		});
	});
}, Lr = (e, t) => {
	let n = {}, r = (e) => {
		e.forEach((e) => {
			n[e] = !0;
		});
	};
	return Vn(e) ? r(e) : r(String(e).split(t)), n;
}, Rr = () => {}, zr = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function Br(e) {
	return !!(e && qn(e.append) && e[An] === "FormData" && e[kn]);
}
var Vr = (e) => {
	let t = /* @__PURE__ */ new WeakSet(), n = (e) => {
		if (Yn(e)) {
			if (t.has(e)) return;
			if (Un(e)) return e;
			if (!("toJSON" in e)) {
				t.add(e);
				let r;
				if (ar(e)) {
					r = [];
					for (let t of e) {
						let e = n(t);
						!Hn(e) && r.push(e);
					}
				} else r = Vn(e) ? [] : {}, _r(e, (e, t) => {
					let i = n(e);
					!Hn(i) && (r[t] = i);
				});
				return t.delete(e), r;
			}
		}
		return e;
	};
	return n(e);
}, Hr = zn("AsyncFunction"), Ur = (e) => e && (Yn(e) || qn(e)) && qn(e.then) && qn(e.catch), Wr = ((e, t) => e ? setImmediate : t ? ((e, t) => (yr.addEventListener("message", ({ source: n, data: r }) => {
	n === yr && r === e && t.length && t.shift()();
}, !1), (n) => {
	t.push(n), yr.postMessage(e, "*");
}))(`axios@${Math.random()}`, []) : (e) => setTimeout(e))(typeof setImmediate == "function", qn(yr.postMessage)), Gr = typeof queueMicrotask < "u" ? queueMicrotask.bind(yr) : typeof process < "u" && process.nextTick || Wr, Kr = (e) => e != null && qn(e[kn]), P = {
	isArray: Vn,
	isArrayBuffer: Wn,
	isBuffer: Un,
	isFormData: ur,
	isArrayBufferView: Gn,
	isString: Kn,
	isNumber: Jn,
	isBoolean: Xn,
	isObject: Yn,
	isPlainObject: Zn,
	isEmptyObject: Qn,
	isReadableStream: fr,
	isRequest: pr,
	isResponse: mr,
	isHeaders: hr,
	isUndefined: Hn,
	isDate: $n,
	isFile: er,
	isReactNativeBlob: tr,
	isReactNative: nr,
	isBlob: rr,
	isRegExp: Pr,
	isFunction: qn,
	isStream: or,
	isURLSearchParams: dr,
	isTypedArray: Or,
	isFileList: ir,
	forEach: _r,
	merge: xr,
	extend: Sr,
	trim: gr,
	stripBOM: Cr,
	inherits: wr,
	toFlatObject: Tr,
	kindOf: Rn,
	kindOfTest: zn,
	endsWith: Er,
	toArray: Dr,
	forEachEntry: kr,
	matchAll: Ar,
	isHTMLForm: jr,
	hasOwnProperty: jn,
	hasOwnProp: jn,
	hasOwnInPrototypeChain: Fn,
	getSafeProp: In,
	toSafeFlatObject: Ln,
	reduceDescriptors: Fr,
	freezeMethods: Ir,
	toObjectSet: Lr,
	toCamelCase: Mr,
	noop: Rr,
	toFiniteNumber: zr,
	findKey: vr,
	global: yr,
	isContextDefined: br,
	isSpecCompliantForm: Br,
	toJSONObject: Vr,
	isAsyncFn: Hr,
	isThenable: Ur,
	setImmediate: Wr,
	asap: Gr,
	isIterable: Kr,
	isSafeIterable: (e) => e != null && Fn(e, kn) && Kr(e)
}, qr = P.toObjectSet([
	"age",
	"authorization",
	"content-length",
	"content-type",
	"etag",
	"expires",
	"from",
	"host",
	"if-modified-since",
	"if-unmodified-since",
	"last-modified",
	"location",
	"max-forwards",
	"proxy-authorization",
	"referer",
	"retry-after",
	"user-agent"
]), Jr = (e) => {
	let t = {}, n, r, i;
	return e && e.split("\n").forEach(function(e) {
		i = e.indexOf(":"), n = e.substring(0, i).trim().toLowerCase(), r = e.substring(i + 1).trim();
		let a = P.hasOwnProp(t, n);
		!n || a && P.hasOwnProp(qr, n) || (n === "set-cookie" ? a ? t[n].push(r) : t[n] = [r] : t[n] = a ? t[n] + ", " + r : r);
	}), t;
};
//#endregion
//#region node_modules/axios/lib/helpers/sanitizeHeaderValue.js
function Yr(e) {
	let t = 0, n = e.length;
	for (; t < n;) {
		let n = e.charCodeAt(t);
		if (n !== 9 && n !== 32) break;
		t += 1;
	}
	for (; n > t;) {
		let t = e.charCodeAt(n - 1);
		if (t !== 9 && t !== 32) break;
		--n;
	}
	return t === 0 && n === e.length ? e : e.slice(t, n);
}
var Xr = /* @__PURE__ */ RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"), Zr = /* @__PURE__ */ RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
function Qr(e, t) {
	return P.isArray(e) ? e.map((e) => Qr(e, t)) : Yr(String(e).replace(t, ""));
}
var $r = (e) => Qr(e, Xr), ei = (e) => Qr(e, Zr);
function ti(e) {
	let t = Object.create(null);
	return P.forEach(e.toJSON(), (e, n) => {
		t[n] = ei(e);
	}), t;
}
//#endregion
//#region node_modules/axios/lib/core/AxiosHeaders.js
var ni = Symbol("internals");
function ri(e) {
	return e && String(e).trim().toLowerCase();
}
function ii(e) {
	return e === !1 || e == null ? e : P.isArray(e) ? e.map(ii) : $r(String(e));
}
function ai(e) {
	let t = Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g, r;
	for (; r = n.exec(e);) t[r[1]] = r[2];
	return t;
}
var oi = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function si(e) {
	let t = 0, n = e.length;
	for (; t < n;) {
		let n = e.charCodeAt(t);
		if (n !== 9 && n !== 32) break;
		t += 1;
	}
	for (; n > t;) {
		let t = e.charCodeAt(n - 1);
		if (t !== 9 && t !== 32) break;
		--n;
	}
	return t === 0 && n === e.length ? e : e.slice(t, n);
}
function ci(e) {
	let t = e.length - 1;
	if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34) return e;
	let n = "";
	for (let r = 1; r < t; r++) {
		let i = e.charCodeAt(r);
		if (i === 34 || i === 92 && (r += 1, r >= t)) return e;
		n += e[r];
	}
	return n;
}
function li(e) {
	let t = Object.create(null), n = String(e), r = 0, i = !1, a = !1;
	function o(e) {
		let i = si(n.slice(r, e)), a = i.indexOf("=");
		if (a < 1) return;
		let o = si(i.slice(0, a));
		if (!oi.test(o)) return;
		let s = o.toLowerCase();
		if (s === "__proto__" || s === "constructor" || s === "prototype") return;
		let c = si(i.slice(a + 1));
		t[s] = ci(c);
	}
	for (let e = 0; e < n.length; e++) {
		let t = n.charCodeAt(e);
		i ? a ? a = !1 : t === 92 ? a = !0 : t === 34 && (i = !1) : t === 34 ? i = !0 : (t === 44 || t === 59) && (o(e), r = e + 1);
	}
	return o(n.length), t;
}
var ui = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function di(e, t, n, r, i) {
	if (P.isFunction(r)) return r.call(this, t, n);
	if (i && (t = n), P.isString(t)) {
		if (P.isString(r)) return t.indexOf(r) !== -1;
		if (P.isRegExp(r)) return r.test(t);
	}
}
function fi(e) {
	return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (e, t, n) => t.toUpperCase() + n);
}
function pi(e, t) {
	let n = P.toCamelCase(" " + t);
	[
		"get",
		"set",
		"has"
	].forEach((r) => {
		Object.defineProperty(e, r + n, {
			__proto__: null,
			value: function(e, n, i) {
				return this[r].call(this, t, e, n, i);
			},
			configurable: !0
		});
	});
}
var mi = class {
	constructor(e) {
		e && this.set(e);
	}
	set(e, t, n) {
		let r = this;
		function i(e, t, n) {
			let i = ri(t);
			if (!i) return;
			let a = P.findKey(r, i);
			(!a || r[a] === void 0 || n === !0 || n === void 0 && r[a] !== !1) && (r[a || t] = ii(e));
		}
		let a = (e, t) => P.forEach(e, (e, n) => i(e, n, t));
		if (P.isPlainObject(e) || e instanceof this.constructor) a(e, t);
		else if (P.isString(e) && (e = e.trim()) && !ui(e)) a(Jr(e), t);
		else if (P.isObject(e) && P.isSafeIterable(e)) {
			let n = Object.create(null), r, i;
			for (let t of e) {
				if (!P.isArray(t)) throw TypeError("Object iterator must return a key-value pair");
				i = t[0], P.hasOwnProp(n, i) ? (r = n[i], n[i] = P.isArray(r) ? [...r, t[1]] : [r, t[1]]) : n[i] = t[1];
			}
			a(n, t);
		} else e != null && i(t, e, n);
		return this;
	}
	get(e, t) {
		if (e = ri(e), e) {
			let n = P.findKey(this, e);
			if (n) {
				let e = this[n];
				if (!t) return e;
				if (t === !0) return ai(e);
				if (P.isFunction(t)) return t.call(this, e, n);
				if (P.isRegExp(t)) return t.exec(e);
				throw TypeError("parser must be boolean|regexp|function");
			}
		}
	}
	has(e, t) {
		if (e = ri(e), e) {
			let n = P.findKey(this, e);
			return !(!n || this[n] === void 0 || t && !di(this, this[n], n, t));
		}
		return !1;
	}
	delete(e, t) {
		let n = this, r = !1;
		function i(e) {
			if (e = ri(e), e) {
				let i = P.findKey(n, e);
				i && (!t || di(n, n[i], i, t)) && (delete n[i], r = !0);
			}
		}
		return P.isArray(e) ? e.forEach(i) : i(e), r;
	}
	clear(e) {
		let t = Object.keys(this), n = t.length, r = !1;
		for (; n--;) {
			let i = t[n];
			(!e || di(this, this[i], i, e, !0)) && (delete this[i], r = !0);
		}
		return r;
	}
	normalize(e) {
		let t = this, n = {};
		return P.forEach(this, (r, i) => {
			let a = P.findKey(n, i);
			if (a) {
				t[a] = ii(r), delete t[i];
				return;
			}
			let o = e ? fi(i) : String(i).trim();
			o !== i && delete t[i], t[o] = ii(r), n[o] = !0;
		}), this;
	}
	concat(...e) {
		return this.constructor.concat(this, ...e);
	}
	toJSON(e) {
		let t = Object.create(null);
		return P.forEach(this, (n, r) => {
			n != null && n !== !1 && (t[r] = e && P.isArray(n) ? n.join(", ") : n);
		}), t;
	}
	[Symbol.iterator]() {
		return Object.entries(this.toJSON())[Symbol.iterator]();
	}
	toString() {
		return Object.entries(this.toJSON()).map(([e, t]) => e + ": " + t).join("\n");
	}
	getSetCookie() {
		let e = this.get("set-cookie");
		return P.isArray(e) ? e : e == null || e === !1 ? [] : [e];
	}
	get [Symbol.toStringTag]() {
		return "AxiosHeaders";
	}
	static from(e) {
		return e instanceof this ? e : new this(e);
	}
	static parseParameters(e) {
		return li(e);
	}
	static concat(e, ...t) {
		let n = new this(e);
		return t.forEach((e) => n.set(e)), n;
	}
	static accessor(e) {
		let t = (this[ni] = this[ni] = { accessors: {} }).accessors, n = this.prototype;
		function r(e) {
			let r = ri(e);
			t[r] || (pi(n, e), t[r] = !0);
		}
		return P.isArray(e) ? e.forEach(r) : r(e), this;
	}
};
mi.accessor([
	"Content-Type",
	"Content-Length",
	"Accept",
	"Accept-Encoding",
	"User-Agent",
	"Authorization"
]), P.reduceDescriptors(mi.prototype, ({ value: e }, t) => {
	let n = t[0].toUpperCase() + t.slice(1);
	return {
		get: () => e,
		set(e) {
			this[n] = e;
		}
	};
}), P.freezeMethods(mi);
//#endregion
//#region node_modules/axios/lib/core/AxiosError.js
var hi = "[REDACTED ****]";
function gi(e) {
	if (P.hasOwnProp(e, "toJSON")) return !0;
	let t = Object.getPrototypeOf(e);
	for (; t && t !== Object.prototype;) {
		if (P.hasOwnProp(t, "toJSON")) return !0;
		t = Object.getPrototypeOf(t);
	}
	return !1;
}
function _i(e, t) {
	let n = new Set(t.map((e) => String(e).toLowerCase())), r = [], i = (e) => {
		if (typeof e != "object" || !e || P.isBuffer(e)) return e;
		if (r.indexOf(e) !== -1) return;
		e instanceof mi && (e = e.toJSON()), r.push(e);
		let t;
		if (P.isArray(e)) t = [], e.forEach((e, n) => {
			let r = i(e);
			P.isUndefined(r) || (t[n] = r);
		});
		else {
			if (!P.isPlainObject(e) && gi(e)) return r.pop(), e;
			t = Object.create(null);
			for (let [r, a] of Object.entries(e)) {
				let e = n.has(r.toLowerCase()) ? hi : i(a);
				P.isUndefined(e) || (t[r] = e);
			}
		}
		return r.pop(), t;
	};
	return i(e);
}
function vi(e) {
	try {
		return String(e);
	} catch {
		return "";
	}
}
function yi(e) {
	return e.errors.map((e) => {
		try {
			return e && e.message ? vi(e.message) : vi(e);
		} catch {
			return "";
		}
	}).filter(Boolean).join("; ") || e.name || "AggregateError";
}
var F = class e extends Error {
	static from(t, n, r, i, a, o) {
		let s = t.message;
		!s && P.isArray(t.errors) && t.errors.length && (s = yi(t));
		let c = new e(s, n || t.code, r, i, a);
		return Object.defineProperty(c, "cause", {
			__proto__: null,
			value: t,
			writable: !0,
			enumerable: !1,
			configurable: !0
		}), c.name = t.name, t.status != null && c.status == null && (c.status = t.status), o && Object.assign(c, o), c;
	}
	constructor(e, t, n, r, i) {
		super(e), Object.defineProperty(this, "message", {
			__proto__: null,
			value: e,
			enumerable: !0,
			writable: !0,
			configurable: !0
		}), this.name = "AxiosError", this.isAxiosError = !0, t && (this.code = t), n && (this.config = n), r && (this.request = r), i && (this.response = i, this.status = i.status);
	}
	toJSON() {
		let e = this.config, t = e && P.hasOwnProp(e, "redact") ? e.redact : void 0, n = P.isArray(t) && t.length > 0 ? _i(e, t) : P.toJSONObject(e);
		return {
			message: this.message,
			name: this.name,
			description: this.description,
			number: this.number,
			fileName: this.fileName,
			lineNumber: this.lineNumber,
			columnNumber: this.columnNumber,
			stack: this.stack,
			config: n,
			code: this.code,
			status: this.status
		};
	}
};
F.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE", F.ERR_BAD_OPTION = "ERR_BAD_OPTION", F.ECONNABORTED = "ECONNABORTED", F.ETIMEDOUT = "ETIMEDOUT", F.ECONNREFUSED = "ECONNREFUSED", F.ERR_NETWORK = "ERR_NETWORK", F.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS", F.ERR_DEPRECATED = "ERR_DEPRECATED", F.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE", F.ERR_BAD_REQUEST = "ERR_BAD_REQUEST", F.ERR_CANCELED = "ERR_CANCELED", F.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT", F.ERR_INVALID_URL = "ERR_INVALID_URL", F.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
function bi(e) {
	return P.isPlainObject(e) || P.isArray(e);
}
function xi(e) {
	return P.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Si(e, t, n) {
	return e ? e.concat(t).map(function(e, t) {
		return e = xi(e), !n && t ? "[" + e + "]" : e;
	}).join(n ? "." : "") : t;
}
function Ci(e) {
	return P.isArray(e) && !e.some(bi);
}
var wi = P.toFlatObject(P, {}, null, function(e) {
	return /^is[A-Z]/.test(e);
});
function Ti(e, t, n) {
	if (!P.isObject(e)) throw TypeError("target must be an object");
	t ||= new FormData();
	let r = (e, t) => {
		let r = P.getSafeProp(n, e);
		return P.isUndefined(r) ? t : r;
	}, i = r("metaTokens", !0), a = r("visitor") || h, o = r("dots", !1), s = r("indexes", !1), c = r("Blob") || typeof Blob < "u" && Blob, l = r("maxDepth", 100), u = c && P.isSpecCompliantForm(t), d = [];
	if (!P.isFunction(a)) throw TypeError("visitor must be a function");
	function f(e) {
		if (e === null) return "";
		if (P.isDate(e)) return e.toISOString();
		if (P.isBoolean(e)) return e.toString();
		if (!u && P.isBlob(e)) throw new F("Blob is not supported. Use a Buffer instead.");
		if (P.isArrayBuffer(e) || P.isTypedArray(e)) {
			if (u && typeof c == "function") return new c([e]);
			throw new F("Blob is not supported. Use a Buffer instead.", F.ERR_NOT_SUPPORT);
		}
		return e;
	}
	function p(e) {
		if (e > l) throw new F("Object is too deeply nested (" + e + " levels). Max depth: " + l, F.ERR_FORM_DATA_DEPTH_EXCEEDED);
	}
	function m(e, t) {
		if (l === Infinity) return JSON.stringify(e);
		let n = [];
		return JSON.stringify(e, function(e, r) {
			if (!P.isObject(r)) return r;
			for (; n.length && n[n.length - 1] !== this;) n.pop();
			return n.push(r), p(t + n.length - 1), r;
		});
	}
	function h(e, n, r) {
		let a = e;
		if (P.isReactNative(t) && P.isReactNativeBlob(e)) return t.append(Si(r, n, o), f(e)), !1;
		if (e && !r && typeof e == "object") {
			if (P.endsWith(n, "{}")) n = i ? n : n.slice(0, -2), e = m(e, 1);
			else if (P.isArray(e) && Ci(e) || (P.isFileList(e) || P.endsWith(n, "[]")) && (a = P.toArray(e))) return n = xi(n), a.forEach(function(e, r) {
				!(P.isUndefined(e) || e === null) && t.append(s === !0 ? Si([n], r, o) : s === null ? n : n + "[]", f(e));
			}), !1;
		}
		return bi(e) ? !0 : (t.append(Si(r, n, o), f(e)), !1);
	}
	let g = Object.assign(wi, {
		defaultVisitor: h,
		convertValue: f,
		isVisitable: bi
	});
	function _(e, n, r = 0) {
		if (!P.isUndefined(e)) {
			if (p(r), d.indexOf(e) !== -1) throw Error("Circular reference detected in " + n.join("."));
			d.push(e), P.forEach(e, function(e, i) {
				(!(P.isUndefined(e) || e === null) && a.call(t, e, P.isString(i) ? i.trim() : i, n, g)) === !0 && _(e, n ? n.concat(i) : [i], r + 1);
			}), d.pop();
		}
	}
	if (!P.isObject(e)) throw TypeError("data must be an object");
	return _(e), t;
}
//#endregion
//#region node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function Ei(e) {
	let t = {
		"!": "%21",
		"'": "%27",
		"(": "%28",
		")": "%29",
		"~": "%7E",
		"%20": "+"
	};
	return encodeURIComponent(e).replace(/[!'()~]|%20/g, function(e) {
		return t[e];
	});
}
function Di(e, t) {
	this._pairs = [], e && Ti(e, this, t);
}
var Oi = Di.prototype;
Oi.append = function(e, t) {
	this._pairs.push([e, t]);
}, Oi.toString = function(e) {
	let t = e ? (t) => e.call(this, t, Ei) : Ei;
	return this._pairs.map(function(e) {
		return t(e[0]) + "=" + t(e[1]);
	}, "").join("&");
};
//#endregion
//#region node_modules/axios/lib/helpers/buildURL.js
function ki(e) {
	return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function Ai(e, t, n) {
	if (!t) return e;
	e ||= "";
	let r = P.isFunction(n) ? { serialize: n } : n, i = P.getSafeProp(r, "encode") || ki, a = P.getSafeProp(r, "serialize"), o;
	if (o = a ? a(t, r) : P.isURLSearchParams(t) ? t.toString() : new Di(t, r).toString(i), o) {
		let t = e.indexOf("#");
		t !== -1 && (e = e.slice(0, t)), e += (e.indexOf("?") === -1 ? "?" : "&") + o;
	}
	return e;
}
//#endregion
//#region node_modules/axios/lib/core/InterceptorManager.js
var ji = Symbol("internals");
function Mi(e) {
	return e ? e.length : 0;
}
function Ni(e) {
	if (e) for (; e.length && e[e.length - 1] === null;) e.pop();
}
function Pi(e, t) {
	let n = e.handlers, r = Mi(n);
	n === t.handlersRef ? r !== t.handlersLength && (r ? t.handlerEntries.forEach(function(e, r) {
		n[e.index] !== e.handler && t.handlerEntries.delete(r);
	}) : t.handlerEntries.clear()) : (t.handlersRef = n, t.handlerEntries.clear()), t.handlersLength = r;
}
var Fi = class {
	constructor() {
		this.handlers = [], this[ji] = {
			handlersRef: this.handlers,
			handlersLength: this.handlers.length,
			handlerEntries: /* @__PURE__ */ new Map(),
			iterationDepth: 0,
			nextId: 0
		};
	}
	use(e, t, n) {
		let r = {
			fulfilled: e,
			rejected: t,
			synchronous: n ? n.synchronous : !1,
			runWhen: n ? n.runWhen : null
		}, i = this[ji];
		this.handlers ??= [], Pi(this, i);
		let a = i.nextId++;
		return this.handlers.push(r), i.handlerEntries.set(a, {
			handler: r,
			index: this.handlers.length - 1
		}), i.handlersLength = this.handlers.length, a;
	}
	eject(e) {
		let t = this[ji];
		Pi(this, t);
		let n = t.handlerEntries.get(e);
		if (n) {
			if (t.handlerEntries.delete(e), this.handlers[n.index] !== n.handler) return;
			this.handlers[n.index] = null, t.iterationDepth || (Ni(this.handlers), t.handlersLength = this.handlers.length);
		}
	}
	clear() {
		this.handlers && (this.handlers = [], Pi(this, this[ji]));
	}
	forEach(e) {
		let t = this[ji];
		Pi(this, t), t.iterationDepth++;
		try {
			P.forEach(this.handlers, function(t) {
				t !== null && e(t);
			});
		} finally {
			--t.iterationDepth || (Pi(this, t), Ni(this.handlers), t.handlersLength = Mi(this.handlers));
		}
	}
}, Ii = {
	silentJSONParsing: !0,
	forcedJSONParsing: !0,
	clarifyTimeoutError: !1,
	legacyInterceptorReqResOrdering: !0,
	advertiseZstdAcceptEncoding: !1,
	validateStatusUndefinedResolves: !0
}, Li = {
	isBrowser: !0,
	classes: {
		URLSearchParams: typeof URLSearchParams < "u" ? URLSearchParams : Di,
		FormData: typeof FormData < "u" ? FormData : null,
		Blob: typeof Blob < "u" ? Blob : null
	},
	protocols: [
		"http",
		"https",
		"file",
		"blob",
		"url",
		"data"
	]
}, Ri = /* @__PURE__ */ e({
	hasBrowserEnv: () => zi,
	hasStandardBrowserEnv: () => Vi,
	hasStandardBrowserWebWorkerEnv: () => Hi,
	navigator: () => Bi,
	origin: () => Ui
}), zi = typeof window < "u" && typeof document < "u", Bi = typeof navigator == "object" && navigator || void 0, Vi = zi && (!Bi || [
	"ReactNative",
	"NativeScript",
	"NS"
].indexOf(Bi.product) < 0), Hi = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope && typeof self.importScripts == "function", Ui = zi && window.location.href || "http://localhost", Wi = {
	...Ri,
	...Li
};
//#endregion
//#region node_modules/axios/lib/helpers/toURLEncodedForm.js
function Gi(e, t) {
	return Ti(e, new Wi.classes.URLSearchParams(), {
		visitor: function(e, t, n, r) {
			return Wi.isNode && P.isBuffer(e) ? (this.append(t, e.toString("base64")), !1) : r.defaultVisitor.apply(this, arguments);
		},
		...t
	});
}
//#endregion
//#region node_modules/axios/lib/helpers/formDataToJSON.js
var Ki = 100;
function qi(e) {
	if (e > Ki) throw new F("FormData field is too deeply nested (" + e + " levels). Max depth: " + Ki, F.ERR_FORM_DATA_DEPTH_EXCEEDED);
}
function Ji(e) {
	let t = [], n = /[^.[\]]+|\[([^.[\]]*)]/g, r;
	for (; (r = n.exec(e)) !== null;) qi(t.length), t.push(r[0] === "[]" ? "" : r[1] || r[0]);
	return t;
}
function Yi(e) {
	let t = {}, n = Object.keys(e), r, i = n.length, a;
	for (r = 0; r < i; r++) a = n[r], t[a] = e[a];
	return t;
}
function Xi(e) {
	function t(e, n, r, i) {
		qi(i);
		let a = e[i++];
		if (a === "__proto__") return !0;
		let o = Number.isFinite(+a), s = i >= e.length;
		return a = !a && P.isArray(r) ? r.length : a, s ? (P.hasOwnProp(r, a) ? r[a] = P.isArray(r[a]) ? r[a].concat(n) : [r[a], n] : r[a] = n, !o) : ((!P.hasOwnProp(r, a) || !P.isObject(r[a])) && (r[a] = []), t(e, n, r[a], i) && P.isArray(r[a]) && (r[a] = Yi(r[a])), !o);
	}
	if (P.isFormData(e) && P.isFunction(e.entries)) {
		let n = {};
		return P.forEachEntry(e, (e, r) => {
			t(Ji(e), r, n, 0);
		}), n;
	}
	return null;
}
//#endregion
//#region node_modules/axios/lib/core/methodList.js
var Zi = Object.freeze([
	"get",
	"delete",
	"head",
	"options",
	"post",
	"put",
	"patch",
	"purge",
	"link",
	"unlink",
	"query"
]), Qi = (e, t) => e != null && P.hasOwnProp(e, t) ? e[t] : void 0;
function $i(e, t, n) {
	if (P.isString(e)) try {
		return (t || JSON.parse)(e), P.trim(e);
	} catch (e) {
		if (e.name !== "SyntaxError") throw e;
	}
	return (n || JSON.stringify)(e);
}
var ea = {
	transitional: Ii,
	adapter: [
		"xhr",
		"http",
		"fetch"
	],
	transformRequest: [function(e, t) {
		let n = t.getContentType() || "", r = n.indexOf("application/json") > -1, i = P.isObject(e);
		if (i && P.isHTMLForm(e) && (e = new FormData(e)), P.isFormData(e)) return r ? JSON.stringify(Xi(e)) : e;
		if (P.isArrayBuffer(e) || P.isBuffer(e) || P.isStream(e) || P.isFile(e) || P.isBlob(e) || P.isReadableStream(e)) return e;
		if (P.isArrayBufferView(e)) return e.buffer;
		if (P.isURLSearchParams(e)) return t.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
		let a;
		if (i) {
			let t = Qi(this, "formSerializer");
			if (n.indexOf("application/x-www-form-urlencoded") > -1) return Gi(e, t).toString();
			if ((a = P.isFileList(e)) || n.indexOf("multipart/form-data") > -1) {
				let n = Qi(this, "env"), r = n && n.FormData;
				return Ti(a ? { "files[]": e } : e, r && new r(), t);
			}
		}
		return i || r ? (t.setContentType("application/json", !1), $i(e)) : e;
	}],
	transformResponse: [function(e) {
		let t = Qi(this, "transitional") || ea.transitional, n = t && t.forcedJSONParsing, r = Qi(this, "responseType"), i = r === "json";
		if (P.isResponse(e) || P.isReadableStream(e)) return e;
		if (e && P.isString(e) && (n && !r || i)) {
			let n = !(t && t.silentJSONParsing) && i;
			try {
				return JSON.parse(e, Qi(this, "parseReviver"));
			} catch (e) {
				if (n) throw e.name === "SyntaxError" ? F.from(e, F.ERR_BAD_RESPONSE, this, null, Qi(this, "response")) : e;
			}
		}
		return e;
	}],
	timeout: 0,
	xsrfCookieName: "XSRF-TOKEN",
	xsrfHeaderName: "X-XSRF-TOKEN",
	maxContentLength: -1,
	maxBodyLength: -1,
	env: {
		FormData: Wi.classes.FormData,
		Blob: Wi.classes.Blob
	},
	validateStatus: function(e) {
		return e >= 200 && e < 300;
	},
	headers: { common: {
		Accept: "application/json, text/plain, */*",
		"Content-Type": void 0
	} }
};
P.forEach(Zi, (e) => {
	ea.headers[e] = {};
});
//#endregion
//#region node_modules/axios/lib/core/transformData.js
function ta(e, t) {
	let n = this || ea, r = t || n, i = mi.from(r.headers), a = r.data;
	return P.forEach(e, function(e) {
		a = e.call(n, a, i.normalize(), t ? t.status : void 0);
	}), i.normalize(), a;
}
//#endregion
//#region node_modules/axios/lib/cancel/isCancel.js
function na(e) {
	return !!(e && e.__CANCEL__);
}
//#endregion
//#region node_modules/axios/lib/cancel/CanceledError.js
var ra = class extends F {
	constructor(e, t, n) {
		super(e ?? "canceled", F.ERR_CANCELED, t, n), this.name = "CanceledError", this.__CANCEL__ = !0;
	}
};
//#endregion
//#region node_modules/axios/lib/core/settle.js
function ia(e, t, n) {
	let r = n.config.validateStatus;
	!n.status || !r || r(n.status) ? e(n) : t(new F("Request failed with status code " + n.status, n.status >= 400 && n.status < 500 ? F.ERR_BAD_REQUEST : F.ERR_BAD_RESPONSE, n.config, n.request, n));
}
//#endregion
//#region node_modules/axios/lib/helpers/normalizeURLForProtocolCheck.js
var aa = /[\t\n\r]/g;
function oa(e) {
	if (typeof e != "string") return e;
	let t = 0;
	for (; t < e.length && e.charCodeAt(t) <= 32;) t++;
	return e.slice(t).replace(aa, "");
}
//#endregion
//#region node_modules/axios/lib/helpers/parseProtocol.js
function sa(e) {
	let t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
	return t && t[1] || "";
}
//#endregion
//#region node_modules/axios/lib/helpers/speedometer.js
function ca(e, t) {
	e ||= 10;
	let n = Array(e), r = Array(e), i = 0, a = 0, o;
	return t = t === void 0 ? 1e3 : t, function(s) {
		let c = Date.now(), l = r[a];
		o ||= c, n[i] = s, r[i] = c;
		let u = a, d = 0;
		for (; u !== i;) d += n[u++], u %= e;
		if (i = (i + 1) % e, i === a && (a = (a + 1) % e), c - o < t) return;
		let f = l && c - l;
		return f ? Math.round(d * 1e3 / f) : void 0;
	};
}
//#endregion
//#region node_modules/axios/lib/helpers/throttle.js
function la(e, t) {
	let n = 0, r = 1e3 / t, i, a, o = (t, r = Date.now()) => {
		n = r, i = null, a &&= (clearTimeout(a), null), e(...t);
	};
	return [
		(...e) => {
			let t = Date.now(), s = t - n;
			s >= r ? o(e, t) : (i = e, a ||= setTimeout(() => {
				a = null, o(i);
			}, r - s));
		},
		() => i && o(i),
		(...e) => o(e)
	];
}
//#endregion
//#region node_modules/axios/lib/helpers/progressEventReducer.js
var ua = (e, t, n = 3) => {
	let r = 0, i = ca(50, 250);
	return la((n) => {
		if (!n || !P.isNumber(n.loaded)) return;
		let a = n.loaded, o = n.lengthComputable ? n.total : void 0, s = Math.max(0, o == null ? a : Math.min(a, o)), c = Math.max(0, s - r), l = i(c);
		r = Math.max(r, s), e({
			loaded: s,
			total: o,
			progress: o ? s / o : void 0,
			bytes: c,
			rate: l || void 0,
			estimated: l && o ? (o - s) / l : void 0,
			event: n,
			lengthComputable: o != null,
			[t ? "download" : "upload"]: !0
		});
	}, n);
}, da = (e, t) => {
	let n = e != null;
	return [(r) => t[0]({
		lengthComputable: n,
		total: e,
		loaded: r
	}), t[1]];
}, fa = (e, t = P.asap) => (...n) => t(() => e(...n)), pa = Wi.hasStandardBrowserEnv ? ((e, t) => (n) => (n = new URL(n, Wi.origin), e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)))(new URL(Wi.origin), Wi.navigator && /(msie|trident)/i.test(Wi.navigator.userAgent)) : () => !0, ma = Wi.hasStandardBrowserEnv ? {
	write(e, t, n, r, i, a, o) {
		if (typeof document > "u") return;
		let s = [`${e}=${encodeURIComponent(t)}`];
		P.isNumber(n) && s.push(`expires=${new Date(n).toUTCString()}`), P.isString(r) && s.push(`path=${r}`), P.isString(i) && s.push(`domain=${i}`), a === !0 && s.push("secure"), P.isString(o) && s.push(`SameSite=${o}`), document.cookie = s.join("; ");
	},
	read(e) {
		if (typeof document > "u") return null;
		let t = document.cookie.split(";");
		for (let n = 0; n < t.length; n++) {
			let r = t[n].replace(/^\s+/, ""), i = r.indexOf("=");
			if (i !== -1 && r.slice(0, i) === e) try {
				return decodeURIComponent(r.slice(i + 1));
			} catch {
				return r.slice(i + 1);
			}
		}
		return null;
	},
	remove(e) {
		this.write(e, "", Date.now() - 864e5, "/");
	}
} : {
	write() {},
	read() {
		return null;
	},
	remove() {}
};
//#endregion
//#region node_modules/axios/lib/helpers/isAbsoluteURL.js
function ha(e) {
	return typeof e == "string" && /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
//#endregion
//#region node_modules/axios/lib/helpers/combineURLs.js
function ga(e, t) {
	if (!t) return e;
	let n = e.length;
	for (; n > 0 && e.charCodeAt(n - 1) === 47;) n--;
	return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
}
//#endregion
//#region node_modules/axios/lib/core/buildFullPath.js
var _a = /^https?:(?!\/\/)/i;
function va(e) {
	return e && e.replace(/(^|&)([^=&]*=)?[^&]+/g, (e, t, n = "") => `${t}${n}${hi}`);
}
function ya(e) {
	let t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${hi}@`), n = t.indexOf("#"), r = (n === -1 ? t : t.slice(0, n)).replace(/([?&][^=&#]*=)[^&#]*/g, `$1${hi}`);
	return n === -1 ? r : `${r}#${va(t.slice(n + 1))}`;
}
function ba(e, t) {
	if (typeof e == "string") {
		let n = oa(e);
		if (_a.test(n)) throw new F(`Invalid URL ${JSON.stringify(ya(n))}: missing "//" after protocol`, F.ERR_INVALID_URL, t);
	}
}
function xa(e, t, n, r) {
	ba(t, r);
	let i = !ha(t);
	return e && (i || n === !1) ? (ba(e, r), ga(e, t)) : t;
}
//#endregion
//#region node_modules/axios/lib/core/mergeConfig.js
var Sa = (e) => e instanceof mi ? { ...e } : e, Ca = (e) => Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor ? Object.keys(e).concat(Object.getOwnPropertySymbols(e).filter((t) => Object.getOwnPropertyDescriptor(e, t).enumerable)) : Object.keys(e);
function wa(e, t) {
	e ||= {}, t ||= {};
	let n = Object.create(null);
	Object.defineProperty(n, "hasOwnProperty", {
		__proto__: null,
		value: Object.prototype.hasOwnProperty,
		enumerable: !1,
		writable: !0,
		configurable: !0
	});
	function r(e, t, n, r) {
		return P.isPlainObject(e) && P.isPlainObject(t) ? P.merge.call({ caseless: r }, e, t) : P.isPlainObject(t) ? P.merge({}, t) : P.isArray(t) ? t.slice() : t;
	}
	function i(e, t, n, i) {
		if (!P.isUndefined(t)) return r(e, t, n, i);
		if (!P.isUndefined(e)) return r(void 0, e, n, i);
	}
	function a(e, t) {
		if (!P.isUndefined(t)) return r(void 0, t);
	}
	function o(e, t) {
		if (!P.isUndefined(t)) return r(void 0, t);
		if (!P.isUndefined(e)) return r(void 0, e);
	}
	function s(n) {
		let r = P.hasOwnProp(t, "transitional") ? t.transitional : void 0;
		if (!P.isUndefined(r)) {
			if (P.isPlainObject(r)) {
				if (P.hasOwnProp(r, n)) return r[n];
			} else return;
		}
		let i = P.hasOwnProp(e, "transitional") ? e.transitional : void 0;
		if (P.isPlainObject(i) && P.hasOwnProp(i, n)) return i[n];
	}
	function c(n, i, a) {
		if (P.hasOwnProp(t, a)) return r(n, i);
		if (P.hasOwnProp(e, a)) return r(void 0, n);
	}
	let l = {
		url: a,
		method: a,
		data: a,
		baseURL: o,
		transformRequest: o,
		transformResponse: o,
		paramsSerializer: o,
		timeout: o,
		timeoutErrorMessage: o,
		withCredentials: o,
		withXSRFToken: o,
		adapter: o,
		responseType: o,
		xsrfCookieName: o,
		xsrfHeaderName: o,
		onUploadProgress: o,
		onDownloadProgress: o,
		decompress: o,
		maxContentLength: o,
		maxBodyLength: o,
		beforeRedirect: o,
		transport: o,
		httpAgent: o,
		httpsAgent: o,
		cancelToken: o,
		socketPath: o,
		allowedSocketPaths: o,
		responseEncoding: o,
		validateStatus: c,
		headers: (e, t, n) => i(Sa(e), Sa(t), n, !0)
	};
	return P.forEach(Ca({
		...e,
		...t
	}), function(r) {
		if (r === "__proto__" || r === "constructor" || r === "prototype") return;
		let a = P.hasOwnProp(l, r) ? l[r] : i, o = a(P.hasOwnProp(e, r) ? e[r] : void 0, P.hasOwnProp(t, r) ? t[r] : void 0, r);
		P.isUndefined(o) && a !== c || (n[r] = o);
	}), P.hasOwnProp(t, "validateStatus") && P.isUndefined(t.validateStatus) && s("validateStatusUndefinedResolves") === !1 && (P.hasOwnProp(e, "validateStatus") ? n.validateStatus = r(void 0, e.validateStatus) : delete n.validateStatus), n;
}
//#endregion
//#region node_modules/axios/lib/core/setFormDataHeaders.js
var Ta = ["content-type", "content-length"];
function Ea(e, t, n) {
	n === "content-only" ? Object.entries(t || {}).forEach(([t, n]) => {
		Ta.includes(t.toLowerCase()) && e.set(t, n);
	}) : e.set(t);
}
//#endregion
//#region node_modules/axios/lib/helpers/resolveConfig.js
var Da = (e) => encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi, (e, t) => String.fromCharCode(parseInt(t, 16)));
function Oa(e) {
	let t = wa({}, e), n = (e) => P.hasOwnProp(t, e) ? t[e] : void 0, r = n("data"), i = n("withXSRFToken"), a = n("xsrfHeaderName"), o = n("xsrfCookieName"), s = n("headers"), c = n("auth"), l = n("baseURL"), u = n("allowAbsoluteUrls"), d = n("url");
	if (t.headers = s = mi.from(s), t.url = Ai(xa(l, d, u, t), n("params"), n("paramsSerializer")), c) {
		let t = P.getSafeProp(c, "username") || "", n = P.getSafeProp(c, "password") || "";
		try {
			s.set("Authorization", "Basic " + btoa(t + ":" + (n ? Da(n) : "")));
		} catch (t) {
			throw F.from(t, F.ERR_BAD_OPTION_VALUE, e);
		}
	}
	if (P.isFormData(r)) {
		let e = P.getSafeProp(r, "getHeaders");
		Wi.hasStandardBrowserEnv || Wi.hasStandardBrowserWebWorkerEnv || P.isReactNative(r) ? s.setContentType(void 0) : P.isFunction(e) && Ea(s, e.call(r), n("formDataHeaderPolicy"));
	}
	if (Wi.hasStandardBrowserEnv && (P.isFunction(i) && (i = i(t)), i === !0 || i == null && pa(t.url))) {
		let e = a && o && ma.read(o);
		e && s.set(a, e);
	}
	return t;
}
var ka = typeof XMLHttpRequest < "u" && function(e) {
	return new Promise(function(t, n) {
		let r = Oa(e), i = r.data, a = mi.from(r.headers).normalize(), { responseType: o, onUploadProgress: s, onDownloadProgress: c } = r, l, u, d, f, p, m;
		function h() {
			f && f(), p && p(), r.cancelToken && r.cancelToken.unsubscribe(l), r.signal && r.signal.removeEventListener("abort", l);
		}
		let g = new XMLHttpRequest();
		g.open(r.method.toUpperCase(), r.url, !0), g.timeout = r.timeout;
		function _(i) {
			if (!g) return;
			if (g.status === 0 && (sa(oa(r.url)) || sa(Wi.origin)) !== "file" && !(g.responseURL && g.responseURL.startsWith("file:"))) {
				n(new F("Request aborted", F.ECONNABORTED, e, g)), h(), g = null;
				return;
			}
			try {
				i ? m && m(i) : p && p();
			} catch (e) {
				setTimeout(() => {
					throw e;
				});
			}
			if (!g) return;
			let a = mi.from("getAllResponseHeaders" in g && g.getAllResponseHeaders());
			ia(function(e) {
				t(e), h();
			}, function(e) {
				n(e), h();
			}, {
				data: !o || o === "text" || o === "json" ? g.responseText : g.response,
				status: g.status,
				statusText: g.statusText,
				headers: a,
				config: e,
				request: g
			}), g = null;
		}
		"onloadend" in g ? g.onloadend = _ : g.onreadystatechange = function() {
			g && g.readyState === 4 && (g.status !== 0 || g.responseURL && g.responseURL.startsWith("file:")) && setTimeout(_);
		}, g.onabort = function() {
			g &&= (n(new F("Request aborted", F.ECONNABORTED, e, g)), h(), null);
		}, g.onerror = function(t) {
			let r = new F(t && t.message ? t.message : "Network Error", F.ERR_NETWORK, e, g);
			r.event = t || null, n(r), h(), g = null;
		}, g.ontimeout = function() {
			let t = r.timeout ? "timeout of " + r.timeout + "ms exceeded" : "timeout exceeded", i = r.transitional || Ii;
			r.timeoutErrorMessage && (t = r.timeoutErrorMessage), n(new F(t, i.clarifyTimeoutError ? F.ETIMEDOUT : F.ECONNABORTED, e, g)), h(), g = null;
		}, i === void 0 && a.setContentType(null), "setRequestHeader" in g && P.forEach(ti(a), function(e, t) {
			g.setRequestHeader(t, e);
		}), P.isUndefined(r.withCredentials) || (g.withCredentials = !!r.withCredentials), o && o !== "json" && (g.responseType = r.responseType), c && ([d, p, m] = ua(c, !0), g.addEventListener("progress", d)), s && g.upload && ([u, f] = ua(s), g.upload.addEventListener("progress", u), g.upload.addEventListener("loadend", f)), (r.cancelToken || r.signal) && (l = (t) => {
			g &&= (n(!t || t.type ? new ra(null, e, g) : t), g.abort(), h(), null);
		}, r.cancelToken && r.cancelToken.subscribe(l), r.signal && (r.signal.aborted ? l() : r.signal.addEventListener("abort", l)));
		let v = sa(r.url);
		v && !Wi.protocols.includes(v) ? (n(new F("Unsupported protocol " + v + ":", F.ERR_BAD_REQUEST, e)), h()) : g.send(i || null);
	});
}, Aa = (e, t) => {
	if (e = e ? e.filter(Boolean) : [], !t && !e.length) return;
	let n = new AbortController(), r = !1, i = function(e) {
		if (!r) {
			r = !0, o();
			let t = e instanceof Error ? e : this.reason;
			n.abort(t instanceof F ? t : new ra(t instanceof Error ? t.message : t));
		}
	}, a = t && setTimeout(() => {
		a = null, i(new F(`timeout of ${t}ms exceeded`, F.ETIMEDOUT));
	}, t), o = () => {
		e &&= (a && clearTimeout(a), a = null, e.forEach((e) => {
			e.unsubscribe ? e.unsubscribe(i) : e.removeEventListener("abort", i);
		}), null);
	};
	e.forEach((e) => {
		r || (e.aborted ? i.call(e) : e.addEventListener("abort", i, { once: !0 }));
	});
	let { signal: s } = n;
	return s.unsubscribe = () => P.asap(o), s;
}, ja = function* (e, t) {
	let n = e.byteLength;
	if (!t || n < t) {
		yield e;
		return;
	}
	let r = 0, i;
	for (; r < n;) i = r + t, yield e.slice(r, i), r = i;
}, Ma = async function* (e, t) {
	for await (let n of Na(e)) yield* ja(n, t);
}, Na = async function* (e) {
	if (e[Symbol.asyncIterator]) {
		yield* e;
		return;
	}
	let t = e.getReader();
	try {
		for (;;) {
			let { done: e, value: n } = await t.read();
			if (e) break;
			yield n;
		}
	} finally {
		await t.cancel();
	}
}, Pa = (e, t, n, r) => {
	let i = Ma(e, t), a = 0, o, s = (e) => {
		o || (o = !0, r && r(e));
	};
	return new ReadableStream({
		async pull(e) {
			try {
				let { done: t, value: r } = await i.next();
				if (t) {
					s(), e.close();
					return;
				}
				let o = r.byteLength;
				n && n(a += o), e.enqueue(new Uint8Array(r));
			} catch (e) {
				throw s(e), e;
			}
		},
		cancel(e) {
			return s(e), i.return();
		}
	}, { highWaterMark: 2 });
}, Fa = (e) => e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102, Ia = (e, t, n) => t + 2 < n && Fa(e.charCodeAt(t + 1)) && Fa(e.charCodeAt(t + 2)), La = (e) => e <= 57 ? e - 48 : (e & 223) - 55, Ra = (e) => e >= 65 && e <= 90 || e >= 97 && e <= 122 || e >= 48 && e <= 57 || e === 43 || e === 47 || e === 45 || e === 95, za = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32, Ba = (e) => {
	let t = Math.floor(e / 4), n = e % 4;
	return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
}, Va = (e) => {
	let t = e.length, n = 0;
	return t > 0 && e.charCodeAt(t - 1) === 61 && (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++), Math.floor((t - n) * 3 / 4);
}, Ha = (e) => {
	let t = e.length, n = 0, r = 0, i = !1;
	for (let a = 0; a < t; a++) {
		let o = e.charCodeAt(a);
		o === 37 && Ia(e, a, t) && (o = La(e.charCodeAt(a + 1)) * 16 + La(e.charCodeAt(a + 2)), a += 2), !za(o) && (o === 61 ? r++ : !Ra(o) || r > 0 ? i = !0 : n++);
	}
	return i || r > 2 || r > 0 && (n + r) % 4 != 0 || n % 4 == 1 ? Va(e) : Ba(n);
}, Ua = (e, t) => {
	if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
	let n = e.indexOf(",");
	if (n < 0) return 0;
	let r = e.slice(5, n), i = e.slice(n + 1);
	if (/;base64/i.test(r)) return t(i);
	let a = 0;
	for (let e = 0, t = i.length; e < t; e++) {
		let n = i.charCodeAt(e);
		if (n === 37 && Ia(i, e, t)) a += 1, e += 2;
		else if (n < 128) a += 1;
		else if (n < 2048) a += 2;
		else if (n >= 55296 && n <= 56319 && e + 1 < t) {
			let t = i.charCodeAt(e + 1);
			t >= 56320 && t <= 57343 ? (a += 4, e++) : a += 3;
		} else a += 3;
	}
	return a;
};
function Wa(e) {
	let t = typeof e == "string" ? e.indexOf("#") : -1;
	return Ua(t === -1 ? e : e.slice(0, t), Ha);
}
//#endregion
//#region node_modules/axios/lib/env/data.js
var Ga = "1.20.0", Ka = 65536, qa = {
	cache: "default",
	redirect: "follow",
	referrer: "about:client",
	referrerPolicy: "",
	mode: "cors",
	integrity: "",
	keepalive: !1,
	priority: "auto",
	window: null
}, { isFunction: Ja } = P, Ya = (e) => encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi, (e, t) => String.fromCharCode(parseInt(t, 16))), Xa = (e) => {
	if (!P.isString(e)) return e;
	try {
		return decodeURIComponent(e);
	} catch {
		return e;
	}
}, Za = (e, ...t) => {
	try {
		return !!e(...t);
	} catch {
		return !1;
	}
}, Qa = (e) => {
	let t = e.indexOf("://"), n = e;
	return t !== -1 && (n = n.slice(t + 3)), n.includes("@") || n.includes(":");
}, $a = (e) => {
	let t = P.global !== void 0 && P.global !== null ? P.global : globalThis, { ReadableStream: n, TextEncoder: r } = t;
	e = P.merge.call({ skipUndefined: !0 }, {
		Request: t.Request,
		Response: t.Response
	}, e);
	let { fetch: i, Request: a, Response: o } = e, s = i ? Ja(i) : typeof fetch == "function", c = Ja(a), l = Ja(o);
	if (!s) return !1;
	let u = s && Ja(n), d = s && (typeof r == "function" ? ((e) => (t) => e.encode(t))(new r()) : async (e) => new Uint8Array(await new a(e).arrayBuffer())), f = c && u && Za(() => {
		let e = !1, t = new a(Wi.origin, {
			body: new n(),
			method: "POST",
			get duplex() {
				return e = !0, "half";
			}
		}), r = t.headers.has("Content-Type");
		return t.body != null && t.body.cancel(), e && !r;
	}), p = l && u && Za(() => P.isReadableStream(new o("").body)), m = { stream: p && ((e) => e.body) };
	s && [
		"text",
		"arrayBuffer",
		"blob",
		"formData",
		"stream"
	].forEach((e) => {
		!m[e] && (m[e] = (t, n) => {
			let r = t && t[e];
			if (r) return r.call(t);
			throw new F(`Response type '${e}' is not supported`, F.ERR_NOT_SUPPORT, n);
		});
	});
	let h = async (e) => {
		if (e == null) return 0;
		if (P.isBlob(e)) return e.size;
		if (P.isSpecCompliantForm(e)) return (await new a(Wi.origin, {
			method: "POST",
			body: e
		}).arrayBuffer()).byteLength;
		if (P.isArrayBufferView(e) || P.isArrayBuffer(e)) return e.byteLength;
		if (P.isURLSearchParams(e) && (e += ""), P.isString(e)) return (await d(e)).byteLength;
	}, g = async (e, t) => P.toFiniteNumber(e.getContentLength()) ?? h(t);
	return async (e) => {
		let { url: t, method: n, data: s, signal: l, cancelToken: d, timeout: _, onDownloadProgress: v, onUploadProgress: y, responseType: b, headers: x, withCredentials: ee = "same-origin", fetchOptions: te, maxContentLength: S, maxBodyLength: C, maxRedirects: ne } = Oa(e), re = P.isNumber(S) && S > -1, w = P.isNumber(C) && C > -1, ie = (t) => P.hasOwnProp(e, t) ? e[t] : void 0, ae = i || fetch;
		b = b ? (b + "").toLowerCase() : "text";
		let T = Aa([l, d && d.toAbortSignal()], _), E = null, oe = T && T.unsubscribe && (() => {
			T.unsubscribe();
		}), se, ce = null, le = () => new F("Request body larger than maxBodyLength limit", F.ERR_BAD_REQUEST, e, E);
		try {
			let i, l = ie("auth");
			if (l && (i = {
				username: P.getSafeProp(l, "username") || "",
				password: P.getSafeProp(l, "password") || ""
			}), Qa(t)) {
				let e = new URL(t, Wi.origin);
				!i && (e.username || e.password) && (i = {
					username: Xa(e.username),
					password: Xa(e.password)
				}), (e.username || e.password) && (e.username = "", e.password = "", t = e.href);
			}
			if (i && (x.delete("authorization"), x.set("Authorization", "Basic " + btoa(Ya((i.username || "") + ":" + (i.password || ""))))), re && typeof t == "string" && t.startsWith("data:") && Wa(t) > S) throw new F("maxContentLength size of " + S + " exceeded", F.ERR_BAD_RESPONSE, e, E);
			if (w && n !== "get" && n !== "head") {
				let e = await h(s);
				if (typeof e == "number" && isFinite(e) && (se = e, e > C)) throw le();
			}
			let d = w && (P.isReadableStream(s) || P.isStream(s)), _ = (e, t, n) => Pa(e, Ka, (e) => {
				if (w && e > C) throw ce = le();
				t && t(e);
			}, n);
			if (f && n !== "get" && n !== "head" && (y || d)) {
				if (se ??= await g(x, s), se !== 0 || d) {
					let e = new a(t, {
						method: "POST",
						body: s,
						duplex: "half"
					}), n;
					if (P.isFormData(s) && (n = e.headers.get("content-type")) && x.setContentType(n), e.body) {
						let [t, n] = y && da(se, ua(fa(y))) || [];
						s = _(e.body, t, n);
					}
				}
			} else if (d && !c && u && n !== "get" && n !== "head") s = _(s);
			else if (d && c && !f && n !== "get" && n !== "head") throw new F("Stream request bodies are not supported by the current fetch implementation", F.ERR_NOT_SUPPORT, e, E);
			P.isString(ee) || (ee = ee ? "include" : "omit");
			let ue = c && "credentials" in a.prototype;
			if (P.isFormData(s)) {
				let e = x.getContentType();
				e && /^multipart\/form-data/i.test(e) && !/boundary=/i.test(e) && x.delete("content-type");
			}
			x.set("User-Agent", "axios/" + Ga, !1);
			let D = te == null ? te : Object.assign(Object.create(null), te);
			D && (delete D.body, delete D.headers, delete D.method, delete D.signal, delete D.duplex, delete D.credentials);
			let de = Object.assign(Object.create(null), D, {
				signal: T,
				method: n.toUpperCase(),
				headers: ti(x.normalize()),
				body: s,
				duplex: "half",
				credentials: ue ? ee : void 0
			});
			c && (P.forEach(qa, (e, t) => {
				de[t] === void 0 && (de[t] = e);
			}), de.signal === void 0 && (de.signal = null), de.body === void 0 && (de.body = null)), ne === 0 && (de.redirect = "manual", D && (D.redirect = "manual")), E = c && new a(t, de);
			let fe = await (c ? ae(E, D) : ae(t, de)), pe = mi.from(fe.headers);
			if (re) {
				let t = P.toFiniteNumber(pe.getContentLength());
				if (t != null && t > S) throw new F("maxContentLength size of " + S + " exceeded", F.ERR_BAD_RESPONSE, e, E);
			}
			let me = p && (b === "stream" || b === "response");
			if (p && fe.body && (v || re || me && oe)) {
				let t = {};
				[
					"status",
					"statusText",
					"headers"
				].forEach((e) => {
					t[e] = fe[e];
				});
				let n = P.toFiniteNumber(pe.getContentLength()), [r, i] = v && da(n, ua(fa(v), !0)) || [], a = 0;
				fe = new o(Pa(fe.body, Ka, (t) => {
					if (re && (a = t, a > S)) throw new F("maxContentLength size of " + S + " exceeded", F.ERR_BAD_RESPONSE, e, E);
					r && r(t);
				}, () => {
					i && i(), oe && oe();
				}), t);
			}
			b ||= "text";
			let he = await m[P.findKey(m, b) || "text"](fe, e);
			if (re && !p && !me) {
				let t;
				if (he != null && (typeof he.byteLength == "number" ? t = he.byteLength : typeof he.size == "number" ? t = he.size : typeof he == "string" && (t = typeof r == "function" ? new r().encode(he).byteLength : he.length)), typeof t == "number" && t > S) throw new F("maxContentLength size of " + S + " exceeded", F.ERR_BAD_RESPONSE, e, E);
			}
			return !me && oe && oe(), await new Promise((t, n) => {
				ia(t, n, {
					data: he,
					headers: mi.from(fe.headers),
					status: fe.status,
					statusText: fe.statusText,
					config: e,
					request: E
				});
			});
		} catch (t) {
			if (oe && oe(), T && T.aborted && T.reason instanceof F) {
				let n = T.reason;
				throw n.config = e, E && (n.request = E), t !== n && Object.defineProperty(n, "cause", {
					__proto__: null,
					value: t,
					writable: !0,
					enumerable: !1,
					configurable: !0
				}), n;
			}
			if (ce) throw E && !ce.request && (ce.request = E), ce;
			if (t instanceof F) throw E && !t.request && (t.request = E), t;
			if (t && t.name === "TypeError" && /Load failed|fetch/i.test(t.message)) {
				let n = new F("Network Error", F.ERR_NETWORK, e, E, t && t.response);
				throw Object.defineProperty(n, "cause", {
					__proto__: null,
					value: t.cause || t,
					writable: !0,
					enumerable: !1,
					configurable: !0
				}), n;
			}
			throw F.from(t, t && t.code, e, E, t && t.response);
		}
	};
}, eo = /* @__PURE__ */ new Map(), to = (e) => {
	let t = e && e.env || {}, { fetch: n, Request: r, Response: i } = t, a = [
		r,
		i,
		n
	], o = a.length, s, c, l = eo;
	for (; o--;) s = a[o], c = l.get(s), c === void 0 && l.set(s, c = o ? /* @__PURE__ */ new Map() : $a(t)), l = c;
	return c;
};
to();
//#endregion
//#region node_modules/axios/lib/adapters/adapters.js
var no = {
	http: null,
	xhr: ka,
	fetch: { get: to }
};
P.forEach(no, (e, t) => {
	if (e) {
		try {
			Object.defineProperty(e, "name", {
				__proto__: null,
				value: t
			});
		} catch {}
		Object.defineProperty(e, "adapterName", {
			__proto__: null,
			value: t
		});
	}
});
var ro = (e) => `- ${e}`, io = (e) => P.isFunction(e) || e === null || e === !1;
function ao(e, t) {
	e = P.isArray(e) ? e : [e];
	let { length: n } = e, r, i, a = {};
	for (let o = 0; o < n; o++) {
		r = e[o];
		let n;
		if (i = r, !io(r) && (i = no[(n = String(r)).toLowerCase()], i === void 0)) throw new F(`Unknown adapter '${n}'`);
		if (i && (P.isFunction(i) || (i = i.get(t)))) break;
		a[n || "#" + o] = i;
	}
	if (!i) {
		let e = Object.entries(a).map(([e, t]) => `adapter ${e} ` + (t === !1 ? "is not supported by the environment" : "is not available in the build"));
		throw new F("There is no suitable adapter to dispatch the request " + (n ? e.length > 1 ? "since :\n" + e.map(ro).join("\n") : " " + ro(e[0]) : "as no adapter specified"), F.ERR_NOT_SUPPORT);
	}
	return i;
}
var oo = {
	getAdapter: ao,
	adapters: no
};
//#endregion
//#region node_modules/axios/lib/core/dispatchRequest.js
function so(e) {
	if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted) throw new ra(null, e);
}
function co(e) {
	let t = P.toSafeFlatObject(e);
	return so(t), t.headers = mi.from(P.getSafeProp(t, "headers")), t.data = ta.call(t, t.transformRequest), [
		"post",
		"put",
		"patch"
	].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), oo.getAdapter(t.adapter || ea.adapter, t)(t).then(function(e) {
		so(t), t.response = e;
		try {
			e.data = ta.call(t, t.transformResponse, e);
		} finally {
			delete t.response;
		}
		return e.headers = mi.from(e.headers), e;
	}, function(e) {
		if (!na(e) && (so(t), e && e.response)) {
			t.response = e.response;
			try {
				e.response.data = ta.call(t, t.transformResponse, e.response);
			} finally {
				delete t.response;
			}
			e.response.headers = mi.from(e.response.headers);
		}
		return Promise.reject(e);
	});
}
//#endregion
//#region node_modules/axios/lib/helpers/validator.js
var lo = {};
[
	"object",
	"boolean",
	"number",
	"function",
	"string",
	"symbol"
].forEach((e, t) => {
	lo[e] = function(n) {
		return typeof n === e || "a" + (t < 1 ? "n " : " ") + e;
	};
});
var uo = {};
lo.transitional = function(e, t, n) {
	function r(e, t) {
		return "[Axios v" + Ga + "] Transitional option '" + e + "'" + t + (n ? ". " + n : "");
	}
	return (n, i, a) => {
		if (e === !1) throw new F(r(i, " has been removed" + (t ? " in " + t : "")), F.ERR_DEPRECATED);
		return t && !uo[i] && (uo[i] = !0, console.warn(r(i, " has been deprecated since v" + t + " and will be removed in the near future"))), !e || e(n, i, a);
	};
}, lo.spelling = function(e) {
	return (t, n) => (console.warn(`${n} is likely a misspelling of ${e}`), !0);
};
function fo(e, t, n) {
	if (typeof e != "object" || !e) throw new F("options must be an object", F.ERR_BAD_OPTION_VALUE);
	let r = Object.keys(e), i = r.length;
	for (; i-- > 0;) {
		let a = r[i], o = Object.prototype.hasOwnProperty.call(t, a) ? t[a] : void 0;
		if (o) {
			let t = e[a], n = t === void 0 || o(t, a, e);
			if (n !== !0) throw new F("option " + a + " must be " + n, F.ERR_BAD_OPTION_VALUE);
		} else if (n !== !0) throw new F("Unknown option " + a, F.ERR_BAD_OPTION);
	}
}
var po = {
	assertOptions: fo,
	validators: lo
}, mo = po.validators, ho = class {
	constructor(e) {
		this.defaults = e || {}, this.interceptors = {
			request: new Fi(),
			response: new Fi()
		};
	}
	async request(e, t) {
		try {
			return await this._request(e, t);
		} catch (e) {
			if (e instanceof Error) try {
				let t = {};
				Error.captureStackTrace ? Error.captureStackTrace(t) : t = /* @__PURE__ */ Error();
				let n = t.stack, r = "";
				if (typeof n == "string") {
					let e = n.indexOf("\n");
					r = e === -1 ? "" : n.slice(e + 1);
				}
				if (!e.stack) e.stack = r;
				else if (r) {
					let t = r.indexOf("\n"), n = t === -1 ? -1 : r.indexOf("\n", t + 1), i = n === -1 ? "" : r.slice(n + 1);
					String(e.stack).endsWith(i) || (e.stack += "\n" + r);
				}
			} catch {}
			throw e;
		}
	}
	_request(e, t) {
		typeof e == "string" ? (t ||= {}, t.url = e) : t = e || {}, t = wa(this.defaults, t);
		let { transitional: n, paramsSerializer: r, headers: i } = t;
		n !== void 0 && po.assertOptions(n, {
			silentJSONParsing: mo.transitional(mo.boolean),
			forcedJSONParsing: mo.transitional(mo.boolean),
			clarifyTimeoutError: mo.transitional(mo.boolean),
			legacyInterceptorReqResOrdering: mo.transitional(mo.boolean),
			advertiseZstdAcceptEncoding: mo.transitional(mo.boolean),
			validateStatusUndefinedResolves: mo.transitional(mo.boolean)
		}, !1), r != null && (P.isFunction(r) ? t.paramsSerializer = { serialize: r } : po.assertOptions(r, {
			encode: mo.function,
			serialize: mo.function
		}, !0)), t.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls === void 0 ? t.allowAbsoluteUrls = !0 : t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls), po.assertOptions(t, {
			baseUrl: mo.spelling("baseURL"),
			withXsrfToken: mo.spelling("withXSRFToken")
		}, !0), t.method = (P.getSafeProp(t, "method") || P.getSafeProp(this.defaults, "method") || "get").toLowerCase();
		let a = i && P.merge(i.common, i[t.method]);
		i && P.forEach(Zi.concat("common"), (e) => {
			delete i[e];
		}), t.headers = mi.concat(a, i);
		let o = [], s = !0;
		this.interceptors.request.forEach(function(e) {
			if (typeof e.runWhen == "function" && e.runWhen(t) === !1) return;
			s &&= e.synchronous;
			let n = t.transitional || Ii;
			n && n.legacyInterceptorReqResOrdering ? o.unshift(e.fulfilled, e.rejected) : o.push(e.fulfilled, e.rejected);
		});
		let c = [];
		this.interceptors.response.forEach(function(e) {
			c.push(e.fulfilled, e.rejected);
		});
		let l, u = 0, d;
		if (!s) {
			let e = [co.bind(this), void 0];
			for (e.unshift(...o), e.push(...c), d = e.length, l = Promise.resolve(t); u < d;) l = l.then(e[u++], e[u++]);
			return l;
		}
		d = o.length;
		let f = t;
		for (; u < d;) {
			let e = o[u++], t = o[u++];
			try {
				f = e ? e(f) : f;
			} catch (e) {
				if (!t) {
					l = Promise.reject(e);
					break;
				}
				try {
					let n = t.call(this, e);
					P.isThenable(n) && (l = Promise.resolve(n).then(() => co.call(this, f)));
				} catch (e) {
					l = Promise.reject(e);
				}
				break;
			}
		}
		if (!l) try {
			l = co.call(this, f);
		} catch (e) {
			l = Promise.reject(e);
		}
		for (u = 0, d = c.length; u < d;) l = l.then(c[u++], c[u++]);
		return l;
	}
	getUri(e) {
		return e = wa(this.defaults, e), Ai(xa(e.baseURL, e.url, e.allowAbsoluteUrls, e), e.params, e.paramsSerializer);
	}
};
P.forEach([
	"delete",
	"get",
	"head",
	"options"
], function(e) {
	ho.prototype[e] = function(t, n) {
		return this.request(wa(n || {}, {
			method: e,
			url: t,
			data: n && P.hasOwnProp(n, "data") ? n.data : void 0
		}));
	};
}), P.forEach([
	"post",
	"put",
	"patch",
	"query"
], function(e) {
	function t(t) {
		return function(n, r, i) {
			return this.request(wa(i || {}, {
				method: e,
				headers: t ? { "Content-Type": "multipart/form-data" } : {},
				url: n,
				data: r
			}));
		};
	}
	ho.prototype[e] = t(), e !== "query" && (ho.prototype[e + "Form"] = t(!0));
});
//#endregion
//#region node_modules/axios/lib/cancel/CancelToken.js
var go = class e {
	constructor(e) {
		if (typeof e != "function") throw TypeError("executor must be a function.");
		let t;
		this.promise = new Promise(function(e) {
			t = e;
		});
		let n = this;
		this.promise.then((e) => {
			if (!n._listeners) return;
			let t = n._listeners.length;
			for (; t-- > 0;) n._listeners[t](e);
			n._listeners = null;
		}), this.promise.then = (e) => {
			let t, r = new Promise((e) => {
				n.subscribe(e), t = e;
			}).then(e);
			return r.cancel = function() {
				n.unsubscribe(t);
			}, r;
		}, e(function(e, r, i) {
			n.reason || (n.reason = new ra(e, r, i), t(n.reason));
		});
	}
	throwIfRequested() {
		if (this.reason) throw this.reason;
	}
	subscribe(e) {
		this.reason ? e(this.reason) : this._listeners ? this._listeners.push(e) : this._listeners = [e];
	}
	unsubscribe(e) {
		if (!this._listeners) return;
		let t = this._listeners.indexOf(e);
		t !== -1 && this._listeners.splice(t, 1);
	}
	toAbortSignal() {
		let e = new AbortController(), t = (t) => {
			e.abort(t);
		};
		return this.subscribe(t), e.signal.unsubscribe = () => this.unsubscribe(t), e.signal;
	}
	static source() {
		let t;
		return {
			token: new e(function(e) {
				t = e;
			}),
			cancel: t
		};
	}
};
//#endregion
//#region node_modules/axios/lib/helpers/spread.js
function _o(e) {
	return function(t) {
		return e.apply(null, t);
	};
}
//#endregion
//#region node_modules/axios/lib/helpers/isAxiosError.js
function vo(e) {
	return P.isObject(e) && e.isAxiosError === !0;
}
//#endregion
//#region node_modules/axios/lib/helpers/HttpStatusCode.js
var yo = {
	Continue: 100,
	SwitchingProtocols: 101,
	Processing: 102,
	EarlyHints: 103,
	Ok: 200,
	Created: 201,
	Accepted: 202,
	NonAuthoritativeInformation: 203,
	NoContent: 204,
	ResetContent: 205,
	PartialContent: 206,
	MultiStatus: 207,
	AlreadyReported: 208,
	ImUsed: 226,
	MultipleChoices: 300,
	MovedPermanently: 301,
	Found: 302,
	SeeOther: 303,
	NotModified: 304,
	UseProxy: 305,
	Unused: 306,
	TemporaryRedirect: 307,
	PermanentRedirect: 308,
	BadRequest: 400,
	Unauthorized: 401,
	PaymentRequired: 402,
	Forbidden: 403,
	NotFound: 404,
	MethodNotAllowed: 405,
	NotAcceptable: 406,
	ProxyAuthenticationRequired: 407,
	RequestTimeout: 408,
	Conflict: 409,
	Gone: 410,
	LengthRequired: 411,
	PreconditionFailed: 412,
	PayloadTooLarge: 413,
	ContentTooLarge: 413,
	UriTooLong: 414,
	UnsupportedMediaType: 415,
	RangeNotSatisfiable: 416,
	ExpectationFailed: 417,
	ImATeapot: 418,
	MisdirectedRequest: 421,
	UnprocessableEntity: 422,
	UnprocessableContent: 422,
	Locked: 423,
	FailedDependency: 424,
	TooEarly: 425,
	UpgradeRequired: 426,
	PreconditionRequired: 428,
	TooManyRequests: 429,
	RequestHeaderFieldsTooLarge: 431,
	UnavailableForLegalReasons: 451,
	InternalServerError: 500,
	NotImplemented: 501,
	BadGateway: 502,
	ServiceUnavailable: 503,
	GatewayTimeout: 504,
	HttpVersionNotSupported: 505,
	VariantAlsoNegotiates: 506,
	InsufficientStorage: 507,
	LoopDetected: 508,
	NotExtended: 510,
	NetworkAuthenticationRequired: 511,
	WebServerReturnsAnUnknownError: 520,
	WebServerIsDown: 521,
	ConnectionTimedOut: 522,
	OriginIsUnreachable: 523,
	TimeoutOccurred: 524,
	SslHandshakeFailed: 525,
	InvalidSslCertificate: 526
};
Object.entries(yo).forEach(([e, t]) => {
	yo[t] === void 0 && (yo[t] = e);
});
//#endregion
//#region node_modules/axios/lib/axios.js
function bo(e) {
	let t = new ho(e), n = En(ho.prototype.request, t);
	return P.extend(n, ho.prototype, t, { allOwnKeys: !0 }), P.extend(n, t, null, { allOwnKeys: !0 }), n.create = function(t) {
		return bo(wa(e, t));
	}, n;
}
var I = bo(ea);
I.Axios = ho, I.CanceledError = ra, I.CancelToken = go, I.isCancel = na, I.VERSION = Ga, I.toFormData = Ti, I.AxiosError = F, I.Cancel = I.CanceledError, I.all = function(e) {
	return Promise.all(e);
}, I.spread = _o, I.isAxiosError = vo, I.mergeConfig = wa, I.AxiosHeaders = mi, I.formToJSON = (e) => Xi(P.isHTMLForm(e) ? new FormData(e) : e), I.getAdapter = oo.getAdapter, I.HttpStatusCode = yo, I.default = I;
//#endregion
//#region node_modules/@protobuf-ts/twirp-transport/build/es2015/twitch-twirp-error-code.js
var L;
(function(e) {
	e[e.cancelled = 0] = "cancelled", e[e.unknown = 1] = "unknown", e[e.invalid_argument = 2] = "invalid_argument", e[e.malformed = 3] = "malformed", e[e.deadline_exceeded = 4] = "deadline_exceeded", e[e.not_found = 5] = "not_found", e[e.bad_route = 6] = "bad_route", e[e.already_exists = 7] = "already_exists", e[e.permission_denied = 8] = "permission_denied", e[e.unauthenticated = 9] = "unauthenticated", e[e.resource_exhausted = 10] = "resource_exhausted", e[e.failed_precondition = 11] = "failed_precondition", e[e.aborted = 12] = "aborted", e[e.out_of_range = 13] = "out_of_range", e[e.unimplemented = 14] = "unimplemented", e[e.internal = 15] = "internal", e[e.unavailable = 16] = "unavailable", e[e.dataloss = 17] = "dataloss";
})(L ||= {});
//#endregion
//#region node_modules/@protobuf-ts/twirp-transport/build/es2015/twirp-format.js
function xo(e, t, n) {
	if (n) for (let [t, r] of Object.entries(n)) if (typeof r == "string") e.append(t, r);
	else for (let n of r) e.append(t, n);
	return e.set("Content-Type", t ? "application/json" : "application/protobuf"), e.set("Accept", t ? "application/json" : "application/protobuf, application/json"), e;
}
function So(e) {
	if (!at(e) || typeof e.code != "string" || typeof e.msg != "string") return new vn("cannot read twirp error response", L[L.internal]);
	let t = {};
	if (at(e.meta)) for (let [n, r] of Object.entries(e.meta)) typeof r == "string" && (t[n] = r);
	return new vn(e.msg, e.code, t);
}
function Co(e) {
	let t = {};
	return e.forEach((e, n) => {
		n.toLowerCase() !== "content-type" && n.toLowerCase() !== "content-length" && (t.hasOwnProperty(n) ? t[n].push(e) : t[n] = e);
	}), t;
}
//#endregion
//#region node_modules/@protobuf-ts/twirp-transport/build/es2015/twirp-transport.js
var wo = class {
	constructor(e) {
		this.defaultOptions = e;
	}
	mergeOptions(e) {
		return yn(this.defaultOptions, e);
	}
	unary(e, t, n) {
		let r = n, i = this.makeUrl(e, r), a = r.fetchInit ?? {}, o = r.sendJson ? e.I.toJsonString(t, r.jsonOptions) : e.I.toBinary(t, r.binaryOptions), s = new Sn(), c = new Sn(), l = new Sn(), u = new Sn();
		return globalThis.fetch(i, Object.assign(Object.assign({}, a), {
			method: "POST",
			headers: xo(new globalThis.Headers(), !!r.sendJson, r.meta),
			body: o,
			signal: n.abort ?? null
		})).then((t) => {
			s.resolve(Co(t.headers));
			let n;
			try {
				n = t.type;
			} catch {}
			switch (n) {
				case "error":
				case "opaque":
				case "opaqueredirect": throw new vn(`fetch response type ${t.type}`, L[L.unknown]);
			}
			return t.ok ? r.sendJson ? t.json().then((t) => e.O.fromJson(t, r.jsonOptions), () => {
				throw new vn("unable to read response body as json", L[L.dataloss]);
			}) : t.arrayBuffer().then((t) => e.O.fromBinary(new Uint8Array(t), r.binaryOptions), () => {
				throw new vn("unable to read response body", L[L.dataloss]);
			}) : t.json().then((e) => {
				throw So(e);
			}, () => {
				throw new vn("received HTTP " + t.status + ", unable to read response body as json", L[L.internal]);
			});
		}, (e) => {
			throw e instanceof Error && e.name === "AbortError" ? new vn(e.message, L[L.cancelled]) : new vn(e instanceof Error ? e.message : e);
		}).then((e) => {
			c.resolve(e), l.resolve({
				code: "OK",
				detail: ""
			}), u.resolve({});
		}).catch((t) => {
			let n = t instanceof vn ? t : new vn(t instanceof Error ? t.message : t, L[L.internal]);
			n.methodName = e.name, n.serviceName = e.service.typeName, s.rejectPending(n), c.rejectPending(n), l.rejectPending(n), u.rejectPending(n);
		}), new wn(e, r.meta ?? {}, t, s.promise, c.promise, l.promise, u.promise);
	}
	makeUrl(e, t) {
		let n = t.baseUrl;
		n.endsWith("/") && (n = n.substring(0, n.length - 1));
		let r = e.name;
		return t.useProtoMethodName !== !0 && (r = Jt(r), r = r.substring(0, 1).toUpperCase() + r.substring(1)), `${n}/${e.service.typeName}/${r}`;
	}
	clientStreaming(e) {
		let t = new vn("Client streaming is not supported by Twirp", L[L.unimplemented]);
		throw t.methodName = e.name, t.serviceName = e.service.typeName, t;
	}
	duplex(e) {
		let t = new vn("Duplex streaming is not supported by Twirp", L[L.unimplemented]);
		throw t.methodName = e.name, t.serviceName = e.service.typeName, t;
	}
	serverStreaming(e) {
		let t = new vn("Server streaming is not supported by Twirp", L[L.unimplemented]);
		throw t.methodName = e.name, t.serviceName = e.service.typeName, t;
	}
}, To = () => typeof navigator > "u" ? !1 : navigator.product?.toLowerCase() === "reactnative", Eo;
(function(e) {
	e[e.trace = 0] = "trace", e[e.debug = 1] = "debug", e[e.info = 2] = "info", e[e.warn = 3] = "warn", e[e.error = 4] = "error";
})(Eo ||= {});
var Do = (e, t, ...n) => {
	let r;
	switch (e) {
		case "error":
			if (To()) {
				t = `ERROR: ${t}`, r = console.info;
				break;
			}
			r = console.error;
			break;
		case "warn":
			if (To()) {
				t = `WARN: ${t}`, r = console.info;
				break;
			}
			r = console.warn;
			break;
		case "info":
			r = console.info;
			break;
		case "trace":
			r = console.trace;
			break;
		default: r = console.log;
	}
	r(t, ...n);
}, Oo = "info", ko = Do, Ao = () => {
	let e = /* @__PURE__ */ new Map([["default", ko]]), t = /* @__PURE__ */ new Map([["default", Oo]]), n = (r, i = {}) => {
		let a = (i.tags ?? []).filter(Boolean).join(","), o = (n) => (i, ...o) => {
			let s = t.get(r) ?? t.get("default");
			Eo[n] >= Eo[s] && (e.get(r) ?? e.get("default"))(n, `[${r}]${a.length ? `(${a})` : ""}: ${i}`, ...o);
		};
		return {
			withExtraTags: (...e) => n(r, {
				...i,
				tags: i.tags ? i.tags.concat(e) : e
			}),
			getLogLevel: () => t.get(r) ?? t.get("default"),
			error: o("error"),
			trace: o("trace"),
			debug: o("debug"),
			info: o("info"),
			warn: o("warn")
		};
	};
	return {
		getLogger: n,
		configureLoggers: (n) => {
			for (let r in n) {
				let i = n[r];
				i.sink ? e.set(r, i.sink) : i.sink === null && r !== "default" && e.delete(r), i.level ? t.set(r, i.level) : i.level === null && r !== "default" && t.delete(r);
			}
		},
		restoreDefaults: () => {
			e.clear(), t.clear(), e.set("default", ko), t.set("default", Oo);
		}
	};
}, jo = /* @__PURE__ */ n(((e, t) => {
	var n = t.exports = {
		v: [{
			name: "version",
			reg: /^(\d*)$/
		}],
		o: [{
			name: "origin",
			reg: /^(\S*) (\d*) (\d*) (\S*) IP(\d) (\S*)/,
			names: [
				"username",
				"sessionId",
				"sessionVersion",
				"netType",
				"ipVer",
				"address"
			],
			format: "%s %s %d %s IP%d %s"
		}],
		s: [{ name: "name" }],
		i: [{ name: "description" }],
		u: [{ name: "uri" }],
		e: [{ name: "email" }],
		p: [{ name: "phone" }],
		z: [{ name: "timezones" }],
		r: [{ name: "repeats" }],
		t: [{
			name: "timing",
			reg: /^(\d*) (\d*)/,
			names: ["start", "stop"],
			format: "%d %d"
		}],
		c: [{
			name: "connection",
			reg: /^IN IP(\d) (\S*)/,
			names: ["version", "ip"],
			format: "IN IP%d %s"
		}],
		b: [{
			push: "bandwidth",
			reg: /^(TIAS|AS|CT|RR|RS):(\d*)/,
			names: ["type", "limit"],
			format: "%s:%s"
		}],
		m: [{
			reg: /^(\w*) (\d*) ([\w/]*)(?: (.*))?/,
			names: [
				"type",
				"port",
				"protocol",
				"payloads"
			],
			format: "%s %d %s %s"
		}],
		a: [
			{
				push: "rtp",
				reg: /^rtpmap:(\d*) ([\w\-.]*)(?:\s*\/(\d*)(?:\s*\/(\S*))?)?/,
				names: [
					"payload",
					"codec",
					"rate",
					"encoding"
				],
				format: function(e) {
					return e.encoding ? "rtpmap:%d %s/%s/%s" : e.rate ? "rtpmap:%d %s/%s" : "rtpmap:%d %s";
				}
			},
			{
				push: "fmtp",
				reg: /^fmtp:(\d*) ([\S| ]*)/,
				names: ["payload", "config"],
				format: "fmtp:%d %s"
			},
			{
				name: "control",
				reg: /^control:(.*)/,
				format: "control:%s"
			},
			{
				name: "rtcp",
				reg: /^rtcp:(\d*)(?: (\S*) IP(\d) (\S*))?/,
				names: [
					"port",
					"netType",
					"ipVer",
					"address"
				],
				format: function(e) {
					return e.address == null ? "rtcp:%d" : "rtcp:%d %s IP%d %s";
				}
			},
			{
				push: "rtcpFbTrrInt",
				reg: /^rtcp-fb:(\*|\d*) trr-int (\d*)/,
				names: ["payload", "value"],
				format: "rtcp-fb:%s trr-int %d"
			},
			{
				push: "rtcpFb",
				reg: /^rtcp-fb:(\*|\d*) ([\w-_]*)(?: ([\w-_]*))?/,
				names: [
					"payload",
					"type",
					"subtype"
				],
				format: function(e) {
					return e.subtype == null ? "rtcp-fb:%s %s" : "rtcp-fb:%s %s %s";
				}
			},
			{
				push: "ext",
				reg: /^extmap:(\d+)(?:\/(\w+))?(?: (urn:ietf:params:rtp-hdrext:encrypt))? (\S*)(?: (\S*))?/,
				names: [
					"value",
					"direction",
					"encrypt-uri",
					"uri",
					"config"
				],
				format: function(e) {
					return "extmap:%d" + (e.direction ? "/%s" : "%v") + (e["encrypt-uri"] ? " %s" : "%v") + " %s" + (e.config ? " %s" : "");
				}
			},
			{
				name: "extmapAllowMixed",
				reg: /^(extmap-allow-mixed)/
			},
			{
				push: "crypto",
				reg: /^crypto:(\d*) ([\w_]*) (\S*)(?: (\S*))?/,
				names: [
					"id",
					"suite",
					"config",
					"sessionConfig"
				],
				format: function(e) {
					return e.sessionConfig == null ? "crypto:%d %s %s" : "crypto:%d %s %s %s";
				}
			},
			{
				name: "setup",
				reg: /^setup:(\w*)/,
				format: "setup:%s"
			},
			{
				name: "connectionType",
				reg: /^connection:(new|existing)/,
				format: "connection:%s"
			},
			{
				name: "mid",
				reg: /^mid:([^\s]*)/,
				format: "mid:%s"
			},
			{
				name: "msid",
				reg: /^msid:(.*)/,
				format: "msid:%s"
			},
			{
				name: "ptime",
				reg: /^ptime:(\d*(?:\.\d*)*)/,
				format: "ptime:%d"
			},
			{
				name: "maxptime",
				reg: /^maxptime:(\d*(?:\.\d*)*)/,
				format: "maxptime:%d"
			},
			{
				name: "direction",
				reg: /^(sendrecv|recvonly|sendonly|inactive)/
			},
			{
				name: "icelite",
				reg: /^(ice-lite)/
			},
			{
				name: "iceUfrag",
				reg: /^ice-ufrag:(\S*)/,
				format: "ice-ufrag:%s"
			},
			{
				name: "icePwd",
				reg: /^ice-pwd:(\S*)/,
				format: "ice-pwd:%s"
			},
			{
				name: "fingerprint",
				reg: /^fingerprint:(\S*) (\S*)/,
				names: ["type", "hash"],
				format: "fingerprint:%s %s"
			},
			{
				push: "candidates",
				reg: /^candidate:(\S*) (\d*) (\S*) (\d*) (\S*) (\d*) typ (\S*)(?: raddr (\S*) rport (\d*))?(?: tcptype (\S*))?(?: generation (\d*))?(?: network-id (\d*))?(?: network-cost (\d*))?/,
				names: [
					"foundation",
					"component",
					"transport",
					"priority",
					"ip",
					"port",
					"type",
					"raddr",
					"rport",
					"tcptype",
					"generation",
					"network-id",
					"network-cost"
				],
				format: function(e) {
					var t = "candidate:%s %d %s %d %s %d typ %s";
					return t += e.raddr == null ? "%v%v" : " raddr %s rport %d", t += e.tcptype == null ? "%v" : " tcptype %s", e.generation != null && (t += " generation %d"), t += e["network-id"] == null ? "%v" : " network-id %d", t += e["network-cost"] == null ? "%v" : " network-cost %d", t;
				}
			},
			{
				name: "endOfCandidates",
				reg: /^(end-of-candidates)/
			},
			{
				name: "remoteCandidates",
				reg: /^remote-candidates:(.*)/,
				format: "remote-candidates:%s"
			},
			{
				name: "iceOptions",
				reg: /^ice-options:(\S*)/,
				format: "ice-options:%s"
			},
			{
				push: "ssrcs",
				reg: /^ssrc:(\d*) ([\w_-]*)(?::(.*))?/,
				names: [
					"id",
					"attribute",
					"value"
				],
				format: function(e) {
					var t = "ssrc:%d";
					return e.attribute != null && (t += " %s", e.value != null && (t += ":%s")), t;
				}
			},
			{
				push: "ssrcGroups",
				reg: /^ssrc-group:([\x21\x23\x24\x25\x26\x27\x2A\x2B\x2D\x2E\w]*) (.*)/,
				names: ["semantics", "ssrcs"],
				format: "ssrc-group:%s %s"
			},
			{
				name: "msidSemantic",
				reg: /^msid-semantic:\s?(\w*) (\S*)/,
				names: ["semantic", "token"],
				format: "msid-semantic: %s %s"
			},
			{
				push: "groups",
				reg: /^group:(\w*) (.*)/,
				names: ["type", "mids"],
				format: "group:%s %s"
			},
			{
				name: "rtcpMux",
				reg: /^(rtcp-mux)/
			},
			{
				name: "rtcpRsize",
				reg: /^(rtcp-rsize)/
			},
			{
				name: "sctpmap",
				reg: /^sctpmap:([\w_/]*) (\S*)(?: (\S*))?/,
				names: [
					"sctpmapNumber",
					"app",
					"maxMessageSize"
				],
				format: function(e) {
					return e.maxMessageSize == null ? "sctpmap:%s %s" : "sctpmap:%s %s %s";
				}
			},
			{
				name: "xGoogleFlag",
				reg: /^x-google-flag:([^\s]*)/,
				format: "x-google-flag:%s"
			},
			{
				push: "rids",
				reg: /^rid:([\d\w]+) (\w+)(?: ([\S| ]*))?/,
				names: [
					"id",
					"direction",
					"params"
				],
				format: function(e) {
					return e.params ? "rid:%s %s %s" : "rid:%s %s";
				}
			},
			{
				push: "imageattrs",
				reg: /* @__PURE__ */ RegExp("^imageattr:(\\d+|\\*)[\\s\\t]+(send|recv)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*)(?:[\\s\\t]+(recv|send)[\\s\\t]+(\\*|\\[\\S+\\](?:[\\s\\t]+\\[\\S+\\])*))?"),
				names: [
					"pt",
					"dir1",
					"attrs1",
					"dir2",
					"attrs2"
				],
				format: function(e) {
					return "imageattr:%s %s %s" + (e.dir2 ? " %s %s" : "");
				}
			},
			{
				name: "simulcast",
				reg: /* @__PURE__ */ RegExp("^simulcast:(send|recv) ([a-zA-Z0-9\\-_~;,]+)(?:\\s?(send|recv) ([a-zA-Z0-9\\-_~;,]+))?$"),
				names: [
					"dir1",
					"list1",
					"dir2",
					"list2"
				],
				format: function(e) {
					return "simulcast:%s %s" + (e.dir2 ? " %s %s" : "");
				}
			},
			{
				name: "simulcast_03",
				reg: /^simulcast:[\s\t]+([\S+\s\t]+)$/,
				names: ["value"],
				format: "simulcast: %s"
			},
			{
				name: "framerate",
				reg: /^framerate:(\d+(?:$|\.\d+))/,
				format: "framerate:%s"
			},
			{
				name: "sourceFilter",
				reg: /^source-filter: *(excl|incl) (\S*) (IP4|IP6|\*) (\S*) (.*)/,
				names: [
					"filterMode",
					"netType",
					"addressTypes",
					"destAddress",
					"srcList"
				],
				format: "source-filter: %s %s %s %s %s"
			},
			{
				name: "bundleOnly",
				reg: /^(bundle-only)/
			},
			{
				name: "label",
				reg: /^label:(.+)/,
				format: "label:%s"
			},
			{
				name: "sctpPort",
				reg: /^sctp-port:(\d+)$/,
				format: "sctp-port:%s"
			},
			{
				name: "maxMessageSize",
				reg: /^max-message-size:(\d+)$/,
				format: "max-message-size:%s"
			},
			{
				push: "tsRefClocks",
				reg: /^ts-refclk:([^\s=]*)(?:=(\S*))?/,
				names: ["clksrc", "clksrcExt"],
				format: function(e) {
					return "ts-refclk:%s" + (e.clksrcExt == null ? "" : "=%s");
				}
			},
			{
				name: "mediaClk",
				reg: /^mediaclk:(?:id=(\S*))? *([^\s=]*)(?:=(\S*))?(?: *rate=(\d+)\/(\d+))?/,
				names: [
					"id",
					"mediaClockName",
					"mediaClockValue",
					"rateNumerator",
					"rateDenominator"
				],
				format: function(e) {
					var t = "mediaclk:";
					return t += e.id == null ? "%v%s" : "id=%s %s", t += e.mediaClockValue == null ? "" : "=%s", t += e.rateNumerator == null ? "" : " rate=%s", t += e.rateDenominator == null ? "" : "/%s", t;
				}
			},
			{
				name: "keywords",
				reg: /^keywds:(.+)$/,
				format: "keywds:%s"
			},
			{
				name: "content",
				reg: /^content:(.+)/,
				format: "content:%s"
			},
			{
				name: "bfcpFloorCtrl",
				reg: /^floorctrl:(c-only|s-only|c-s)/,
				format: "floorctrl:%s"
			},
			{
				name: "bfcpConfId",
				reg: /^confid:(\d+)/,
				format: "confid:%s"
			},
			{
				name: "bfcpUserId",
				reg: /^userid:(\d+)/,
				format: "userid:%s"
			},
			{
				name: "bfcpFloorId",
				reg: /^floorid:(.+) (?:m-stream|mstrm):(.+)/,
				names: ["id", "mStream"],
				format: "floorid:%s mstrm:%s"
			},
			{
				push: "invalid",
				names: ["value"]
			}
		]
	};
	Object.keys(n).forEach(function(e) {
		n[e].forEach(function(e) {
			e.reg ||= /(.*)/, e.format ||= "%s";
		});
	});
})), Mo = /* @__PURE__ */ n(((e) => {
	var t = function(e) {
		return String(Number(e)) === e ? Number(e) : e;
	}, n = function(e, n, r, i) {
		if (i && !r) n[i] = t(e[1]);
		else for (var a = 0; a < r.length; a += 1) e[a + 1] != null && (n[r[a]] = t(e[a + 1]));
	}, r = function(e, t, r) {
		var i = e.name && e.names;
		e.push && !t[e.push] ? t[e.push] = [] : i && !t[e.name] && (t[e.name] = {});
		var a = e.push ? {} : i ? t[e.name] : t;
		n(r.match(e.reg), a, e.names, e.name), e.push && t[e.push].push(a);
	}, i = jo(), a = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
	e.parse = function(e) {
		var t = {}, n = [], o = t;
		return e.split(/(\r\n|\r|\n)/).filter(a).forEach(function(e) {
			var t = e[0], a = e.slice(2);
			t === "m" && (n.push({
				rtp: [],
				fmtp: []
			}), o = n[n.length - 1]);
			for (var s = 0; s < (i[t] || []).length; s += 1) {
				var c = i[t][s];
				if (c.reg.test(a)) return r(c, o, a);
			}
		}), t.media = n, t;
	};
	var o = function(e, n) {
		var r = n.split(/=(.+)/, 2);
		return r.length === 2 ? e[r[0]] = t(r[1]) : r.length === 1 && n.length > 1 && (e[r[0]] = void 0), e;
	};
	e.parseParams = function(e) {
		return e.split(/;\s?/).reduce(o, {});
	}, e.parseFmtpConfig = e.parseParams, e.parsePayloads = function(e) {
		return e.toString().split(" ").map(Number);
	}, e.parseRemoteCandidates = function(e) {
		for (var n = [], r = e.split(" ").map(t), i = 0; i < r.length; i += 3) n.push({
			component: r[i],
			ip: r[i + 1],
			port: r[i + 2]
		});
		return n;
	}, e.parseImageAttributes = function(e) {
		return e.split(" ").map(function(e) {
			return e.substring(1, e.length - 1).split(",").reduce(o, {});
		});
	}, e.parseSimulcastStreamList = function(e) {
		return e.split(";").map(function(e) {
			return e.split(",").map(function(e) {
				var n, r = !1;
				return e[0] === "~" ? (n = t(e.substring(1, e.length)), r = !0) : n = t(e), {
					scid: n,
					paused: r
				};
			});
		});
	};
})), No = /* @__PURE__ */ n(((e, t) => {
	var n = jo(), r = /%[sdv%]/g, i = function(e) {
		var t = 1, n = arguments, i = n.length;
		return e.replace(r, function(e) {
			if (t >= i) return e;
			var r = n[t];
			switch (t += 1, e) {
				case "%%": return "%";
				case "%s": return String(r);
				case "%d": return Number(r);
				case "%v": return "";
			}
		});
	}, a = function(e, t, n) {
		var r = t.format instanceof Function ? t.format(t.push ? n : n[t.name]) : t.format, a = [e + "=" + r];
		if (t.names) for (var o = 0; o < t.names.length; o += 1) {
			var s = t.names[o];
			t.name ? a.push(n[t.name][s]) : a.push(n[t.names[o]]);
		}
		else a.push(n[t.name]);
		return i.apply(null, a);
	}, o = [
		"v",
		"o",
		"s",
		"i",
		"u",
		"e",
		"p",
		"c",
		"b",
		"t",
		"r",
		"z",
		"a"
	], s = [
		"i",
		"c",
		"b",
		"a"
	];
	t.exports = function(e, t) {
		t ||= {}, e.version ??= 0, e.name ??= " ", e.media.forEach(function(e) {
			e.payloads ??= "";
		});
		var r = t.outerOrder || o, i = t.innerOrder || s, c = [];
		return r.forEach(function(t) {
			n[t].forEach(function(n) {
				n.name in e && e[n.name] != null ? c.push(a(t, n, e)) : n.push in e && e[n.push] != null && e[n.push].forEach(function(e) {
					c.push(a(t, n, e));
				});
			});
		}), e.media.forEach(function(e) {
			c.push(a("m", n.m[0], e)), i.forEach(function(t) {
				n[t].forEach(function(n) {
					n.name in e && e[n.name] != null ? c.push(a(t, n, e)) : n.push in e && e[n.push] != null && e[n.push].forEach(function(e) {
						c.push(a(t, n, e));
					});
				});
			});
		}), c.join("\r\n") + "\r\n";
	};
})), Po = /* @__PURE__ */ n(((e) => {
	var t = Mo(), n = No();
	jo(), e.write = n, e.parse = t.parse, e.parseParams = t.parseParams, e.parseFmtpConfig = t.parseFmtpConfig, e.parsePayloads = t.parsePayloads, e.parseRemoteCandidates = t.parseRemoteCandidates, e.parseImageAttributes = t.parseImageAttributes, e.parseSimulcastStreamList = t.parseSimulcastStreamList;
})), Fo = function(e, t) {
	return Fo = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, t) {
		e.__proto__ = t;
	} || function(e, t) {
		for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
	}, Fo(e, t);
};
function Io(e, t) {
	if (typeof t != "function" && t !== null) throw TypeError("Class extends value " + String(t) + " is not a constructor or null");
	Fo(e, t);
	function n() {
		this.constructor = e;
	}
	e.prototype = t === null ? Object.create(t) : (n.prototype = t.prototype, new n());
}
function Lo(e, t, n, r) {
	function i(e) {
		return e instanceof n ? e : new n(function(t) {
			t(e);
		});
	}
	return new (n ||= Promise)(function(n, a) {
		function o(e) {
			try {
				c(r.next(e));
			} catch (e) {
				a(e);
			}
		}
		function s(e) {
			try {
				c(r.throw(e));
			} catch (e) {
				a(e);
			}
		}
		function c(e) {
			e.done ? n(e.value) : i(e.value).then(o, s);
		}
		c((r = r.apply(e, t || [])).next());
	});
}
function Ro(e, t) {
	var n = {
		label: 0,
		sent: function() {
			if (a[0] & 1) throw a[1];
			return a[1];
		},
		trys: [],
		ops: []
	}, r, i, a, o = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
	return o.next = s(0), o.throw = s(1), o.return = s(2), typeof Symbol == "function" && (o[Symbol.iterator] = function() {
		return this;
	}), o;
	function s(e) {
		return function(t) {
			return c([e, t]);
		};
	}
	function c(s) {
		if (r) throw TypeError("Generator is already executing.");
		for (; o && (o = 0, s[0] && (n = 0)), n;) try {
			if (r = 1, i && (a = s[0] & 2 ? i.return : s[0] ? i.throw || ((a = i.return) && a.call(i), 0) : i.next) && !(a = a.call(i, s[1])).done) return a;
			switch (i = 0, a && (s = [s[0] & 2, a.value]), s[0]) {
				case 0:
				case 1:
					a = s;
					break;
				case 4: return n.label++, {
					value: s[1],
					done: !1
				};
				case 5:
					n.label++, i = s[1], s = [0];
					continue;
				case 7:
					s = n.ops.pop(), n.trys.pop();
					continue;
				default:
					if (a = n.trys, !(a = a.length > 0 && a[a.length - 1]) && (s[0] === 6 || s[0] === 2)) {
						n = 0;
						continue;
					}
					if (s[0] === 3 && (!a || s[1] > a[0] && s[1] < a[3])) {
						n.label = s[1];
						break;
					}
					if (s[0] === 6 && n.label < a[1]) {
						n.label = a[1], a = s;
						break;
					}
					if (a && n.label < a[2]) {
						n.label = a[2], n.ops.push(s);
						break;
					}
					a[2] && n.ops.pop(), n.trys.pop();
					continue;
			}
			s = t.call(e, n);
		} catch (e) {
			s = [6, e], i = 0;
		} finally {
			r = a = 0;
		}
		if (s[0] & 5) throw s[1];
		return {
			value: s[0] ? s[1] : void 0,
			done: !0
		};
	}
}
function zo(e) {
	var t = typeof Symbol == "function" && Symbol.iterator, n = t && e[t], r = 0;
	if (n) return n.call(e);
	if (e && typeof e.length == "number") return { next: function() {
		return e && r >= e.length && (e = void 0), {
			value: e && e[r++],
			done: !e
		};
	} };
	throw TypeError(t ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Bo(e, t) {
	var n = typeof Symbol == "function" && e[Symbol.iterator];
	if (!n) return e;
	var r = n.call(e), i, a = [], o;
	try {
		for (; (t === void 0 || t-- > 0) && !(i = r.next()).done;) a.push(i.value);
	} catch (e) {
		o = { error: e };
	} finally {
		try {
			i && !i.done && (n = r.return) && n.call(r);
		} finally {
			if (o) throw o.error;
		}
	}
	return a;
}
function Vo(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a ||= Array.prototype.slice.call(t, 0, r), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
function Ho(e) {
	return this instanceof Ho ? (this.v = e, this) : new Ho(e);
}
function Uo(e, t, n) {
	if (!Symbol.asyncIterator) throw TypeError("Symbol.asyncIterator is not defined.");
	var r = n.apply(e, t || []), i, a = [];
	return i = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), s("next"), s("throw"), s("return", o), i[Symbol.asyncIterator] = function() {
		return this;
	}, i;
	function o(e) {
		return function(t) {
			return Promise.resolve(t).then(e, d);
		};
	}
	function s(e, t) {
		r[e] && (i[e] = function(t) {
			return new Promise(function(n, r) {
				a.push([
					e,
					t,
					n,
					r
				]) > 1 || c(e, t);
			});
		}, t && (i[e] = t(i[e])));
	}
	function c(e, t) {
		try {
			l(r[e](t));
		} catch (e) {
			f(a[0][3], e);
		}
	}
	function l(e) {
		e.value instanceof Ho ? Promise.resolve(e.value.v).then(u, d) : f(a[0][2], e);
	}
	function u(e) {
		c("next", e);
	}
	function d(e) {
		c("throw", e);
	}
	function f(e, t) {
		e(t), a.shift(), a.length && c(a[0][0], a[0][1]);
	}
}
function Wo(e) {
	if (!Symbol.asyncIterator) throw TypeError("Symbol.asyncIterator is not defined.");
	var t = e[Symbol.asyncIterator], n;
	return t ? t.call(e) : (e = typeof zo == "function" ? zo(e) : e[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
		return this;
	}, n);
	function r(t) {
		n[t] = e[t] && function(n) {
			return new Promise(function(r, a) {
				n = e[t](n), i(r, a, n.done, n.value);
			});
		};
	}
	function i(e, t, n, r) {
		Promise.resolve(r).then(function(t) {
			e({
				value: t,
				done: n
			});
		}, t);
	}
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isFunction.js
function R(e) {
	return typeof e == "function";
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js
function Go(e) {
	var t = e(function(e) {
		Error.call(e), e.stack = (/* @__PURE__ */ Error()).stack;
	});
	return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js
var Ko = Go(function(e) {
	return function(t) {
		e(this), this.message = t ? t.length + " errors occurred during unsubscription:\n" + t.map(function(e, t) {
			return t + 1 + ") " + e.toString();
		}).join("\n  ") : "", this.name = "UnsubscriptionError", this.errors = t;
	};
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/arrRemove.js
function qo(e, t) {
	if (e) {
		var n = e.indexOf(t);
		0 <= n && e.splice(n, 1);
	}
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Subscription.js
var Jo = function() {
	function e(e) {
		this.initialTeardown = e, this.closed = !1, this._parentage = null, this._finalizers = null;
	}
	return e.prototype.unsubscribe = function() {
		var e, t, n, r, i;
		if (!this.closed) {
			this.closed = !0;
			var a = this._parentage;
			if (a) {
				if (this._parentage = null, Array.isArray(a)) try {
					for (var o = zo(a), s = o.next(); !s.done; s = o.next()) s.value.remove(this);
				} catch (t) {
					e = { error: t };
				} finally {
					try {
						s && !s.done && (t = o.return) && t.call(o);
					} finally {
						if (e) throw e.error;
					}
				}
				else a.remove(this);
			}
			var c = this.initialTeardown;
			if (R(c)) try {
				c();
			} catch (e) {
				i = e instanceof Ko ? e.errors : [e];
			}
			var l = this._finalizers;
			if (l) {
				this._finalizers = null;
				try {
					for (var u = zo(l), d = u.next(); !d.done; d = u.next()) {
						var f = d.value;
						try {
							Zo(f);
						} catch (e) {
							i ??= [], e instanceof Ko ? i = Vo(Vo([], Bo(i)), Bo(e.errors)) : i.push(e);
						}
					}
				} catch (e) {
					n = { error: e };
				} finally {
					try {
						d && !d.done && (r = u.return) && r.call(u);
					} finally {
						if (n) throw n.error;
					}
				}
			}
			if (i) throw new Ko(i);
		}
	}, e.prototype.add = function(t) {
		if (t && t !== this) {
			if (this.closed) Zo(t);
			else {
				if (t instanceof e) {
					if (t.closed || t._hasParent(this)) return;
					t._addParent(this);
				}
				(this._finalizers = this._finalizers ?? []).push(t);
			}
		}
	}, e.prototype._hasParent = function(e) {
		var t = this._parentage;
		return t === e || Array.isArray(t) && t.includes(e);
	}, e.prototype._addParent = function(e) {
		var t = this._parentage;
		this._parentage = Array.isArray(t) ? (t.push(e), t) : t ? [t, e] : e;
	}, e.prototype._removeParent = function(e) {
		var t = this._parentage;
		t === e ? this._parentage = null : Array.isArray(t) && qo(t, e);
	}, e.prototype.remove = function(t) {
		var n = this._finalizers;
		n && qo(n, t), t instanceof e && t._removeParent(this);
	}, e.EMPTY = (function() {
		var t = new e();
		return t.closed = !0, t;
	})(), e;
}(), Yo = Jo.EMPTY;
function Xo(e) {
	return e instanceof Jo || e && "closed" in e && R(e.remove) && R(e.add) && R(e.unsubscribe);
}
function Zo(e) {
	R(e) ? e() : e.unsubscribe();
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/config.js
var Qo = {
	onUnhandledError: null,
	onStoppedNotification: null,
	Promise: void 0,
	useDeprecatedSynchronousErrorHandling: !1,
	useDeprecatedNextContext: !1
}, $o = {
	setTimeout: function(e, t) {
		var n = [...arguments].slice(2), r = $o.delegate;
		return r?.setTimeout ? r.setTimeout.apply(r, Vo([e, t], Bo(n))) : setTimeout.apply(void 0, Vo([e, t], Bo(n)));
	},
	clearTimeout: function(e) {
		return ($o.delegate?.clearTimeout || clearTimeout)(e);
	},
	delegate: void 0
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js
function es(e) {
	$o.setTimeout(function() {
		var t = Qo.onUnhandledError;
		if (t) t(e);
		else throw e;
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/noop.js
function ts() {}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/NotificationFactories.js
var ns = (function() {
	return as("C", void 0, void 0);
})();
function rs(e) {
	return as("E", void 0, e);
}
function is(e) {
	return as("N", e, void 0);
}
function as(e, t, n) {
	return {
		kind: e,
		value: t,
		error: n
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/errorContext.js
var os = null;
function ss(e) {
	if (Qo.useDeprecatedSynchronousErrorHandling) {
		var t = !os;
		if (t && (os = {
			errorThrown: !1,
			error: null
		}), e(), t) {
			var n = os, r = n.errorThrown, i = n.error;
			if (os = null, r) throw i;
		}
	} else e();
}
function cs(e) {
	Qo.useDeprecatedSynchronousErrorHandling && os && (os.errorThrown = !0, os.error = e);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Subscriber.js
var ls = function(e) {
	Io(t, e);
	function t(t) {
		var n = e.call(this) || this;
		return n.isStopped = !1, t ? (n.destination = t, Xo(t) && t.add(n)) : n.destination = _s, n;
	}
	return t.create = function(e, t, n) {
		return new ps(e, t, n);
	}, t.prototype.next = function(e) {
		this.isStopped ? gs(is(e), this) : this._next(e);
	}, t.prototype.error = function(e) {
		this.isStopped ? gs(rs(e), this) : (this.isStopped = !0, this._error(e));
	}, t.prototype.complete = function() {
		this.isStopped ? gs(ns, this) : (this.isStopped = !0, this._complete());
	}, t.prototype.unsubscribe = function() {
		this.closed || (this.isStopped = !0, e.prototype.unsubscribe.call(this), this.destination = null);
	}, t.prototype._next = function(e) {
		this.destination.next(e);
	}, t.prototype._error = function(e) {
		try {
			this.destination.error(e);
		} finally {
			this.unsubscribe();
		}
	}, t.prototype._complete = function() {
		try {
			this.destination.complete();
		} finally {
			this.unsubscribe();
		}
	}, t;
}(Jo), us = Function.prototype.bind;
function ds(e, t) {
	return us.call(e, t);
}
var fs = function() {
	function e(e) {
		this.partialObserver = e;
	}
	return e.prototype.next = function(e) {
		var t = this.partialObserver;
		if (t.next) try {
			t.next(e);
		} catch (e) {
			ms(e);
		}
	}, e.prototype.error = function(e) {
		var t = this.partialObserver;
		if (t.error) try {
			t.error(e);
		} catch (e) {
			ms(e);
		}
		else ms(e);
	}, e.prototype.complete = function() {
		var e = this.partialObserver;
		if (e.complete) try {
			e.complete();
		} catch (e) {
			ms(e);
		}
	}, e;
}(), ps = function(e) {
	Io(t, e);
	function t(t, n, r) {
		var i = e.call(this) || this, a;
		if (R(t) || !t) a = {
			next: t ?? void 0,
			error: n ?? void 0,
			complete: r ?? void 0
		};
		else {
			var o;
			i && Qo.useDeprecatedNextContext ? (o = Object.create(t), o.unsubscribe = function() {
				return i.unsubscribe();
			}, a = {
				next: t.next && ds(t.next, o),
				error: t.error && ds(t.error, o),
				complete: t.complete && ds(t.complete, o)
			}) : a = t;
		}
		return i.destination = new fs(a), i;
	}
	return t;
}(ls);
function ms(e) {
	Qo.useDeprecatedSynchronousErrorHandling ? cs(e) : es(e);
}
function hs(e) {
	throw e;
}
function gs(e, t) {
	var n = Qo.onStoppedNotification;
	n && $o.setTimeout(function() {
		return n(e, t);
	});
}
var _s = {
	closed: !0,
	next: ts,
	error: hs,
	complete: ts
}, vs = (function() {
	return typeof Symbol == "function" && Symbol.observable || "@@observable";
})();
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/identity.js
function ys(e) {
	return e;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/pipe.js
function bs(e) {
	return e.length === 0 ? ys : e.length === 1 ? e[0] : function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/Observable.js
var xs = function() {
	function e(e) {
		e && (this._subscribe = e);
	}
	return e.prototype.lift = function(t) {
		var n = new e();
		return n.source = this, n.operator = t, n;
	}, e.prototype.subscribe = function(e, t, n) {
		var r = this, i = ws(e) ? e : new ps(e, t, n);
		return ss(function() {
			var e = r, t = e.operator, n = e.source;
			i.add(t ? t.call(i, n) : n ? r._subscribe(i) : r._trySubscribe(i));
		}), i;
	}, e.prototype._trySubscribe = function(e) {
		try {
			return this._subscribe(e);
		} catch (t) {
			e.error(t);
		}
	}, e.prototype.forEach = function(e, t) {
		var n = this;
		return t = Ss(t), new t(function(t, r) {
			var i = new ps({
				next: function(t) {
					try {
						e(t);
					} catch (e) {
						r(e), i.unsubscribe();
					}
				},
				error: r,
				complete: t
			});
			n.subscribe(i);
		});
	}, e.prototype._subscribe = function(e) {
		return this.source?.subscribe(e);
	}, e.prototype[vs] = function() {
		return this;
	}, e.prototype.pipe = function() {
		return bs([...arguments])(this);
	}, e.prototype.toPromise = function(e) {
		var t = this;
		return e = Ss(e), new e(function(e, n) {
			var r;
			t.subscribe(function(e) {
				return r = e;
			}, function(e) {
				return n(e);
			}, function() {
				return e(r);
			});
		});
	}, e.create = function(t) {
		return new e(t);
	}, e;
}();
function Ss(e) {
	return e ?? Qo.Promise ?? Promise;
}
function Cs(e) {
	return e && R(e.next) && R(e.error) && R(e.complete);
}
function ws(e) {
	return e && e instanceof ls || Cs(e) && Xo(e);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/lift.js
function Ts(e) {
	return R(e?.lift);
}
function Es(e) {
	return function(t) {
		if (Ts(t)) return t.lift(function(t) {
			try {
				return e(t, this);
			} catch (e) {
				this.error(e);
			}
		});
		throw TypeError("Unable to lift unknown Observable type");
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js
function Ds(e, t, n, r, i) {
	return new Os(e, t, n, r, i);
}
var Os = function(e) {
	Io(t, e);
	function t(t, n, r, i, a, o) {
		var s = e.call(this, t) || this;
		return s.onFinalize = a, s.shouldUnsubscribe = o, s._next = n ? function(e) {
			try {
				n(e);
			} catch (e) {
				t.error(e);
			}
		} : e.prototype._next, s._error = i ? function(e) {
			try {
				i(e);
			} catch (e) {
				t.error(e);
			} finally {
				this.unsubscribe();
			}
		} : e.prototype._error, s._complete = r ? function() {
			try {
				r();
			} catch (e) {
				t.error(e);
			} finally {
				this.unsubscribe();
			}
		} : e.prototype._complete, s;
	}
	return t.prototype.unsubscribe = function() {
		var t;
		if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
			var n = this.closed;
			e.prototype.unsubscribe.call(this), !n && ((t = this.onFinalize) == null || t.call(this));
		}
	}, t;
}(ls), ks = Go(function(e) {
	return function() {
		e(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
	};
}), As = function(e) {
	Io(t, e);
	function t() {
		var t = e.call(this) || this;
		return t.closed = !1, t.currentObservers = null, t.observers = [], t.isStopped = !1, t.hasError = !1, t.thrownError = null, t;
	}
	return t.prototype.lift = function(e) {
		var t = new js(this, this);
		return t.operator = e, t;
	}, t.prototype._throwIfClosed = function() {
		if (this.closed) throw new ks();
	}, t.prototype.next = function(e) {
		var t = this;
		ss(function() {
			var n, r;
			if (t._throwIfClosed(), !t.isStopped) {
				t.currentObservers ||= Array.from(t.observers);
				try {
					for (var i = zo(t.currentObservers), a = i.next(); !a.done; a = i.next()) a.value.next(e);
				} catch (e) {
					n = { error: e };
				} finally {
					try {
						a && !a.done && (r = i.return) && r.call(i);
					} finally {
						if (n) throw n.error;
					}
				}
			}
		});
	}, t.prototype.error = function(e) {
		var t = this;
		ss(function() {
			if (t._throwIfClosed(), !t.isStopped) {
				t.hasError = t.isStopped = !0, t.thrownError = e;
				for (var n = t.observers; n.length;) n.shift().error(e);
			}
		});
	}, t.prototype.complete = function() {
		var e = this;
		ss(function() {
			if (e._throwIfClosed(), !e.isStopped) {
				e.isStopped = !0;
				for (var t = e.observers; t.length;) t.shift().complete();
			}
		});
	}, t.prototype.unsubscribe = function() {
		this.isStopped = this.closed = !0, this.observers = this.currentObservers = null;
	}, Object.defineProperty(t.prototype, "observed", {
		get: function() {
			return this.observers?.length > 0;
		},
		enumerable: !1,
		configurable: !0
	}), t.prototype._trySubscribe = function(t) {
		return this._throwIfClosed(), e.prototype._trySubscribe.call(this, t);
	}, t.prototype._subscribe = function(e) {
		return this._throwIfClosed(), this._checkFinalizedStatuses(e), this._innerSubscribe(e);
	}, t.prototype._innerSubscribe = function(e) {
		var t = this, n = this, r = n.hasError, i = n.isStopped, a = n.observers;
		return r || i ? Yo : (this.currentObservers = null, a.push(e), new Jo(function() {
			t.currentObservers = null, qo(a, e);
		}));
	}, t.prototype._checkFinalizedStatuses = function(e) {
		var t = this, n = t.hasError, r = t.thrownError, i = t.isStopped;
		n ? e.error(r) : i && e.complete();
	}, t.prototype.asObservable = function() {
		var e = new xs();
		return e.source = this, e;
	}, t.create = function(e, t) {
		return new js(e, t);
	}, t;
}(xs), js = function(e) {
	Io(t, e);
	function t(t, n) {
		var r = e.call(this) || this;
		return r.destination = t, r.source = n, r;
	}
	return t.prototype.next = function(e) {
		var t, n;
		(n = (t = this.destination)?.next) == null || n.call(t, e);
	}, t.prototype.error = function(e) {
		var t, n;
		(n = (t = this.destination)?.error) == null || n.call(t, e);
	}, t.prototype.complete = function() {
		var e, t;
		(t = (e = this.destination)?.complete) == null || t.call(e);
	}, t.prototype._subscribe = function(e) {
		return this.source?.subscribe(e) ?? Yo;
	}, t;
}(As), z = function(e) {
	Io(t, e);
	function t(t) {
		var n = e.call(this) || this;
		return n._value = t, n;
	}
	return Object.defineProperty(t.prototype, "value", {
		get: function() {
			return this.getValue();
		},
		enumerable: !1,
		configurable: !0
	}), t.prototype._subscribe = function(t) {
		var n = e.prototype._subscribe.call(this, t);
		return !n.closed && t.next(this._value), n;
	}, t.prototype.getValue = function() {
		var e = this, t = e.hasError, n = e.thrownError, r = e._value;
		if (t) throw n;
		return this._throwIfClosed(), r;
	}, t.prototype.next = function(t) {
		e.prototype.next.call(this, this._value = t);
	}, t;
}(As), Ms = {
	now: function() {
		return (Ms.delegate || Date).now();
	},
	delegate: void 0
}, Ns = function(e) {
	Io(t, e);
	function t(t, n, r) {
		t === void 0 && (t = Infinity), n === void 0 && (n = Infinity), r === void 0 && (r = Ms);
		var i = e.call(this) || this;
		return i._bufferSize = t, i._windowTime = n, i._timestampProvider = r, i._buffer = [], i._infiniteTimeWindow = !0, i._infiniteTimeWindow = n === Infinity, i._bufferSize = Math.max(1, t), i._windowTime = Math.max(1, n), i;
	}
	return t.prototype.next = function(t) {
		var n = this, r = n.isStopped, i = n._buffer, a = n._infiniteTimeWindow, o = n._timestampProvider, s = n._windowTime;
		r || (i.push(t), !a && i.push(o.now() + s)), this._trimBuffer(), e.prototype.next.call(this, t);
	}, t.prototype._subscribe = function(e) {
		this._throwIfClosed(), this._trimBuffer();
		for (var t = this._innerSubscribe(e), n = this, r = n._infiniteTimeWindow, i = n._buffer.slice(), a = 0; a < i.length && !e.closed; a += r ? 1 : 2) e.next(i[a]);
		return this._checkFinalizedStatuses(e), t;
	}, t.prototype._trimBuffer = function() {
		var e = this, t = e._bufferSize, n = e._timestampProvider, r = e._buffer, i = e._infiniteTimeWindow, a = (i ? 1 : 2) * t;
		if (t < Infinity && a < r.length && r.splice(0, r.length - a), !i) {
			for (var o = n.now(), s = 0, c = 1; c < r.length && r[c] <= o; c += 2) s = c;
			s && r.splice(0, s + 1);
		}
	}, t;
}(As), Ps = function(e) {
	Io(t, e);
	function t(t, n) {
		return e.call(this) || this;
	}
	return t.prototype.schedule = function(e, t) {
		return t === void 0 && (t = 0), this;
	}, t;
}(Jo), Fs = {
	setInterval: function(e, t) {
		var n = [...arguments].slice(2), r = Fs.delegate;
		return r?.setInterval ? r.setInterval.apply(r, Vo([e, t], Bo(n))) : setInterval.apply(void 0, Vo([e, t], Bo(n)));
	},
	clearInterval: function(e) {
		return (Fs.delegate?.clearInterval || clearInterval)(e);
	},
	delegate: void 0
}, Is = function(e) {
	Io(t, e);
	function t(t, n) {
		var r = e.call(this, t, n) || this;
		return r.scheduler = t, r.work = n, r.pending = !1, r;
	}
	return t.prototype.schedule = function(e, t) {
		if (t === void 0 && (t = 0), this.closed) return this;
		this.state = e;
		var n = this.id, r = this.scheduler;
		return n != null && (this.id = this.recycleAsyncId(r, n, t)), this.pending = !0, this.delay = t, this.id = this.id ?? this.requestAsyncId(r, this.id, t), this;
	}, t.prototype.requestAsyncId = function(e, t, n) {
		return n === void 0 && (n = 0), Fs.setInterval(e.flush.bind(e, this), n);
	}, t.prototype.recycleAsyncId = function(e, t, n) {
		if (n === void 0 && (n = 0), n != null && this.delay === n && this.pending === !1) return t;
		t != null && Fs.clearInterval(t);
	}, t.prototype.execute = function(e, t) {
		if (this.closed) return /* @__PURE__ */ Error("executing a cancelled action");
		this.pending = !1;
		var n = this._execute(e, t);
		if (n) return n;
		this.pending === !1 && this.id != null && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
	}, t.prototype._execute = function(e, t) {
		var n = !1, r;
		try {
			this.work(e);
		} catch (e) {
			n = !0, r = e || /* @__PURE__ */ Error("Scheduled action threw falsy error");
		}
		if (n) return this.unsubscribe(), r;
	}, t.prototype.unsubscribe = function() {
		if (!this.closed) {
			var t = this, n = t.id, r = t.scheduler, i = r.actions;
			this.work = this.state = this.scheduler = null, this.pending = !1, qo(i, this), n != null && (this.id = this.recycleAsyncId(r, n, null)), this.delay = null, e.prototype.unsubscribe.call(this);
		}
	}, t;
}(Ps), Ls = function() {
	function e(t, n) {
		n === void 0 && (n = e.now), this.schedulerActionCtor = t, this.now = n;
	}
	return e.prototype.schedule = function(e, t, n) {
		return t === void 0 && (t = 0), new this.schedulerActionCtor(this, e).schedule(n, t);
	}, e.now = Ms.now, e;
}(), Rs = new (function(e) {
	Io(t, e);
	function t(t, n) {
		n === void 0 && (n = Ls.now);
		var r = e.call(this, t, n) || this;
		return r.actions = [], r._active = !1, r;
	}
	return t.prototype.flush = function(e) {
		var t = this.actions;
		if (this._active) t.push(e);
		else {
			var n;
			this._active = !0;
			do
				if (n = e.execute(e.state, e.delay)) break;
			while (e = t.shift());
			if (this._active = !1, n) {
				for (; e = t.shift();) e.unsubscribe();
				throw n;
			}
		}
	}, t;
}(Ls))(Is), zs = new xs(function(e) {
	return e.complete();
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isScheduler.js
function Bs(e) {
	return e && R(e.schedule);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/args.js
function Vs(e) {
	return e[e.length - 1];
}
function Hs(e) {
	return R(Vs(e)) ? e.pop() : void 0;
}
function Us(e) {
	return Bs(Vs(e)) ? e.pop() : void 0;
}
function Ws(e, t) {
	return typeof Vs(e) == "number" ? e.pop() : t;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js
var Gs = (function(e) {
	return e && typeof e.length == "number" && typeof e != "function";
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isPromise.js
function Ks(e) {
	return R(e?.then);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js
function qs(e) {
	return R(e[vs]);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js
function Js(e) {
	return Symbol.asyncIterator && R(e?.[Symbol.asyncIterator]);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js
function Ys(e) {
	return /* @__PURE__ */ TypeError("You provided " + (typeof e == "object" && e ? "an invalid object" : "'" + e + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/symbol/iterator.js
function Xs() {
	return typeof Symbol != "function" || !Symbol.iterator ? "@@iterator" : Symbol.iterator;
}
var Zs = Xs();
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isIterable.js
function Qs(e) {
	return R(e?.[Zs]);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js
function $s(e) {
	return Uo(this, arguments, function() {
		var t, n, r, i;
		return Ro(this, function(a) {
			switch (a.label) {
				case 0: t = e.getReader(), a.label = 1;
				case 1: a.trys.push([
					1,
					,
					9,
					10
				]), a.label = 2;
				case 2: return [4, Ho(t.read())];
				case 3: return n = a.sent(), r = n.value, i = n.done, i ? [4, Ho(void 0)] : [3, 5];
				case 4: return [2, a.sent()];
				case 5: return [4, Ho(r)];
				case 6: return [4, a.sent()];
				case 7: return a.sent(), [3, 2];
				case 8: return [3, 10];
				case 9: return t.releaseLock(), [7];
				case 10: return [2];
			}
		});
	});
}
function ec(e) {
	return R(e?.getReader);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js
function tc(e) {
	if (e instanceof xs) return e;
	if (e != null) {
		if (qs(e)) return nc(e);
		if (Gs(e)) return rc(e);
		if (Ks(e)) return ic(e);
		if (Js(e)) return oc(e);
		if (Qs(e)) return ac(e);
		if (ec(e)) return sc(e);
	}
	throw Ys(e);
}
function nc(e) {
	return new xs(function(t) {
		var n = e[vs]();
		if (R(n.subscribe)) return n.subscribe(t);
		throw TypeError("Provided object does not correctly implement Symbol.observable");
	});
}
function rc(e) {
	return new xs(function(t) {
		for (var n = 0; n < e.length && !t.closed; n++) t.next(e[n]);
		t.complete();
	});
}
function ic(e) {
	return new xs(function(t) {
		e.then(function(e) {
			t.closed || (t.next(e), t.complete());
		}, function(e) {
			return t.error(e);
		}).then(null, es);
	});
}
function ac(e) {
	return new xs(function(t) {
		var n, r;
		try {
			for (var i = zo(e), a = i.next(); !a.done; a = i.next()) {
				var o = a.value;
				if (t.next(o), t.closed) return;
			}
		} catch (e) {
			n = { error: e };
		} finally {
			try {
				a && !a.done && (r = i.return) && r.call(i);
			} finally {
				if (n) throw n.error;
			}
		}
		t.complete();
	});
}
function oc(e) {
	return new xs(function(t) {
		cc(e, t).catch(function(e) {
			return t.error(e);
		});
	});
}
function sc(e) {
	return oc($s(e));
}
function cc(e, t) {
	var n, r, i, a;
	return Lo(this, void 0, void 0, function() {
		var o, s;
		return Ro(this, function(c) {
			switch (c.label) {
				case 0: c.trys.push([
					0,
					5,
					6,
					11
				]), n = Wo(e), c.label = 1;
				case 1: return [4, n.next()];
				case 2:
					if (r = c.sent(), r.done) return [3, 4];
					if (o = r.value, t.next(o), t.closed) return [2];
					c.label = 3;
				case 3: return [3, 1];
				case 4: return [3, 11];
				case 5: return s = c.sent(), i = { error: s }, [3, 11];
				case 6: return c.trys.push([
					6,
					,
					9,
					10
				]), r && !r.done && (a = n.return) ? [4, a.call(n)] : [3, 8];
				case 7: c.sent(), c.label = 8;
				case 8: return [3, 10];
				case 9:
					if (i) throw i.error;
					return [7];
				case 10: return [7];
				case 11: return t.complete(), [2];
			}
		});
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/executeSchedule.js
function lc(e, t, n, r, i) {
	r === void 0 && (r = 0), i === void 0 && (i = !1);
	var a = t.schedule(function() {
		n(), i ? e.add(this.schedule(null, r)) : this.unsubscribe();
	}, r);
	if (e.add(a), !i) return a;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/observeOn.js
function uc(e, t) {
	return t === void 0 && (t = 0), Es(function(n, r) {
		n.subscribe(Ds(r, function(n) {
			return lc(r, e, function() {
				return r.next(n);
			}, t);
		}, function() {
			return lc(r, e, function() {
				return r.complete();
			}, t);
		}, function(n) {
			return lc(r, e, function() {
				return r.error(n);
			}, t);
		}));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js
function dc(e, t) {
	return t === void 0 && (t = 0), Es(function(n, r) {
		r.add(e.schedule(function() {
			return n.subscribe(r);
		}, t));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js
function fc(e, t) {
	return tc(e).pipe(dc(t), uc(t));
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js
function pc(e, t) {
	return tc(e).pipe(dc(t), uc(t));
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js
function mc(e, t) {
	return new xs(function(n) {
		var r = 0;
		return t.schedule(function() {
			r === e.length ? n.complete() : (n.next(e[r++]), n.closed || this.schedule());
		});
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js
function hc(e, t) {
	return new xs(function(n) {
		var r;
		return lc(n, t, function() {
			r = e[Zs](), lc(n, t, function() {
				var e, t, i;
				try {
					e = r.next(), t = e.value, i = e.done;
				} catch (e) {
					n.error(e);
					return;
				}
				i ? n.complete() : n.next(t);
			}, 0, !0);
		}), function() {
			return R(r?.return) && r.return();
		};
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js
function gc(e, t) {
	if (!e) throw Error("Iterable cannot be null");
	return new xs(function(n) {
		lc(n, t, function() {
			var r = e[Symbol.asyncIterator]();
			lc(n, t, function() {
				r.next().then(function(e) {
					e.done ? n.complete() : n.next(e.value);
				});
			}, 0, !0);
		});
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js
function _c(e, t) {
	return gc($s(e), t);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js
function vc(e, t) {
	if (e != null) {
		if (qs(e)) return fc(e, t);
		if (Gs(e)) return mc(e, t);
		if (Ks(e)) return pc(e, t);
		if (Js(e)) return gc(e, t);
		if (Qs(e)) return hc(e, t);
		if (ec(e)) return _c(e, t);
	}
	throw Ys(e);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/from.js
function yc(e, t) {
	return t ? vc(e, t) : tc(e);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/of.js
function bc() {
	var e = [...arguments];
	return yc(e, Us(e));
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/EmptyError.js
var xc = Go(function(e) {
	return function() {
		e(this), this.name = "EmptyError", this.message = "no elements in sequence";
	};
});
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/firstValueFrom.js
function Sc(e, t) {
	var n = typeof t == "object";
	return new Promise(function(r, i) {
		var a = new ps({
			next: function(e) {
				r(e), a.unsubscribe();
			},
			error: i,
			complete: function() {
				n ? r(t.defaultValue) : i(new xc());
			}
		});
		e.subscribe(a);
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/map.js
function B(e, t) {
	return Es(function(n, r) {
		var i = 0;
		n.subscribe(Ds(r, function(n) {
			r.next(e.call(t, n, i++));
		}));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/mapOneOrManyArgs.js
var Cc = Array.isArray;
function wc(e, t) {
	return Cc(t) ? e.apply(void 0, Vo([], Bo(t))) : e(t);
}
function Tc(e) {
	return B(function(t) {
		return wc(e, t);
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/argsArgArrayOrObject.js
var Ec = Array.isArray, Dc = Object.getPrototypeOf, Oc = Object.prototype, kc = Object.keys;
function Ac(e) {
	if (e.length === 1) {
		var t = e[0];
		if (Ec(t)) return {
			args: t,
			keys: null
		};
		if (jc(t)) {
			var n = kc(t);
			return {
				args: n.map(function(e) {
					return t[e];
				}),
				keys: n
			};
		}
	}
	return {
		args: e,
		keys: null
	};
}
function jc(e) {
	return e && typeof e == "object" && Dc(e) === Oc;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/util/createObject.js
function Mc(e, t) {
	return e.reduce(function(e, n, r) {
		return e[n] = t[r], e;
	}, {});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/combineLatest.js
function Nc() {
	var e = [...arguments], t = Us(e), n = Hs(e), r = Ac(e), i = r.args, a = r.keys;
	if (i.length === 0) return yc([], t);
	var o = new xs(Pc(i, t, a ? function(e) {
		return Mc(a, e);
	} : ys));
	return n ? o.pipe(Tc(n)) : o;
}
function Pc(e, t, n) {
	return n === void 0 && (n = ys), function(r) {
		Fc(t, function() {
			for (var i = e.length, a = Array(i), o = i, s = i, c = function(i) {
				Fc(t, function() {
					var c = yc(e[i], t), l = !1;
					c.subscribe(Ds(r, function(e) {
						a[i] = e, l || (l = !0, s--), s || r.next(n(a.slice()));
					}, function() {
						--o || r.complete();
					}));
				}, r);
			}, l = 0; l < i; l++) c(l);
		}, r);
	};
}
function Fc(e, t, n) {
	e ? lc(n, e, t) : t();
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js
function Ic(e, t, n, r, i, a, o, s) {
	var c = [], l = 0, u = 0, d = !1, f = function() {
		d && !c.length && !l && t.complete();
	}, p = function(e) {
		return l < r ? m(e) : c.push(e);
	}, m = function(e) {
		a && t.next(e), l++;
		var s = !1;
		tc(n(e, u++)).subscribe(Ds(t, function(e) {
			i?.(e), a ? p(e) : t.next(e);
		}, function() {
			s = !0;
		}, void 0, function() {
			if (s) try {
				l--;
				for (var e = function() {
					var e = c.shift();
					o ? lc(t, o, function() {
						return m(e);
					}) : m(e);
				}; c.length && l < r;) e();
				f();
			} catch (e) {
				t.error(e);
			}
		}));
	};
	return e.subscribe(Ds(t, p, function() {
		d = !0, f();
	})), function() {
		s?.();
	};
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js
function Lc(e, t, n) {
	return n === void 0 && (n = Infinity), R(t) ? Lc(function(n, r) {
		return B(function(e, i) {
			return t(n, e, r, i);
		})(tc(e(n, r)));
	}, n) : (typeof t == "number" && (n = t), Es(function(t, r) {
		return Ic(t, r, e, n);
	}));
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js
function Rc(e) {
	return e === void 0 && (e = Infinity), Lc(ys, e);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/concatAll.js
function zc() {
	return Rc(1);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/concat.js
function Bc() {
	var e = [...arguments];
	return zc()(yc(e, Us(e)));
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/fromEvent.js
var Vc = ["addListener", "removeListener"], Hc = ["addEventListener", "removeEventListener"], Uc = ["on", "off"];
function Wc(e, t, n, r) {
	if (R(n) && (r = n, n = void 0), r) return Wc(e, t, n).pipe(Tc(r));
	var i = Bo(Jc(e) ? Hc.map(function(r) {
		return function(i) {
			return e[r](t, i, n);
		};
	}) : Kc(e) ? Vc.map(Gc(e, t)) : qc(e) ? Uc.map(Gc(e, t)) : [], 2), a = i[0], o = i[1];
	if (!a && Gs(e)) return Lc(function(e) {
		return Wc(e, t, n);
	})(tc(e));
	if (!a) throw TypeError("Invalid event target");
	return new xs(function(e) {
		var t = function() {
			var t = [...arguments];
			return e.next(1 < t.length ? t : t[0]);
		};
		return a(t), function() {
			return o(t);
		};
	});
}
function Gc(e, t) {
	return function(n) {
		return function(r) {
			return e[n](t, r);
		};
	};
}
function Kc(e) {
	return R(e.addListener) && R(e.removeListener);
}
function qc(e) {
	return R(e.on) && R(e.off);
}
function Jc(e) {
	return R(e.addEventListener) && R(e.removeEventListener);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/fromEventPattern.js
function Yc(e, t, n) {
	return n ? Yc(e, t).pipe(Tc(n)) : new xs(function(n) {
		var r = function() {
			var e = [...arguments];
			return n.next(e.length === 1 ? e[0] : e);
		}, i = e(r);
		return R(t) ? function() {
			return t(r, i);
		} : void 0;
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/observable/merge.js
function Xc() {
	var e = [...arguments], t = Us(e), n = Ws(e, Infinity), r = e;
	return r.length ? r.length === 1 ? tc(r[0]) : Rc(n)(yc(r, t)) : zs;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/concatMap.js
function Zc(e, t) {
	return R(t) ? Lc(e, t, 1) : Lc(e, 1);
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/debounceTime.js
function Qc(e, t) {
	return t === void 0 && (t = Rs), Es(function(n, r) {
		var i = null, a = null, o = null, s = function() {
			if (i) {
				i.unsubscribe(), i = null;
				var e = a;
				a = null, r.next(e);
			}
		};
		function c() {
			var n = o + e, a = t.now();
			a < n ? (i = this.schedule(void 0, n - a), r.add(i)) : s();
		}
		n.subscribe(Ds(r, function(n) {
			a = n, o = t.now(), i || (i = t.schedule(c, e), r.add(i));
		}, function() {
			s(), r.complete();
		}, void 0, function() {
			a = i = null;
		}));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js
function V(e, t) {
	return t === void 0 && (t = ys), e ??= $c, Es(function(n, r) {
		var i, a = !0;
		n.subscribe(Ds(r, function(n) {
			var o = t(n);
			(a || !e(i, o)) && (a = !1, i = o, r.next(n));
		}));
	});
}
function $c(e, t) {
	return e === t;
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/distinctUntilKeyChanged.js
function el(e, t) {
	return V(function(n, r) {
		return t ? t(n[e], r[e]) : n[e] === r[e];
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/pairwise.js
function tl() {
	return Es(function(e, t) {
		var n, r = !1;
		e.subscribe(Ds(t, function(e) {
			var i = n;
			n = e, r && t.next([i, e]), r = !0;
		}));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/share.js
function nl(e) {
	e === void 0 && (e = {});
	var t = e.connector, n = t === void 0 ? function() {
		return new As();
	} : t, r = e.resetOnError, i = r === void 0 || r, a = e.resetOnComplete, o = a === void 0 || a, s = e.resetOnRefCountZero, c = s === void 0 || s;
	return function(e) {
		var t, r, a, s = 0, l = !1, u = !1, d = function() {
			r?.unsubscribe(), r = void 0;
		}, f = function() {
			d(), t = a = void 0, l = u = !1;
		}, p = function() {
			var e = t;
			f(), e?.unsubscribe();
		};
		return Es(function(e, m) {
			s++, !u && !l && d();
			var h = a ??= n();
			m.add(function() {
				s--, s === 0 && !u && !l && (r = rl(p, c));
			}), h.subscribe(m), !t && s > 0 && (t = new ps({
				next: function(e) {
					return h.next(e);
				},
				error: function(e) {
					u = !0, d(), r = rl(f, i, e), h.error(e);
				},
				complete: function() {
					l = !0, d(), r = rl(f, o), h.complete();
				}
			}), tc(e).subscribe(t));
		})(e);
	};
}
function rl(e, t) {
	var n = [...arguments].slice(2);
	if (t === !0) e();
	else if (t !== !1) {
		var r = new ps({ next: function() {
			r.unsubscribe(), e();
		} });
		return tc(t.apply(void 0, Vo([], Bo(n)))).subscribe(r);
	}
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/shareReplay.js
function il(e, t, n) {
	var r, i, a, o, s = !1;
	return e && typeof e == "object" ? (r = e.bufferSize, o = r === void 0 ? Infinity : r, i = e.windowTime, t = i === void 0 ? Infinity : i, a = e.refCount, s = a !== void 0 && a, n = e.scheduler) : o = e ?? Infinity, nl({
		connector: function() {
			return new Ns(o, t, n);
		},
		resetOnError: !0,
		resetOnComplete: !1,
		resetOnRefCountZero: s
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/startWith.js
function al() {
	var e = [...arguments], t = Us(e);
	return Es(function(n, r) {
		(t ? Bc(e, n, t) : Bc(e, n)).subscribe(r);
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/takeWhile.js
function ol(e, t) {
	return t === void 0 && (t = !1), Es(function(n, r) {
		var i = 0;
		n.subscribe(Ds(r, function(n) {
			var a = e(n, i++);
			(a || t) && r.next(n), !a && r.complete();
		}));
	});
}
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/tap.js
function sl(e, t, n) {
	var r = R(e) || t || n ? {
		next: e,
		error: t,
		complete: n
	} : e;
	return r ? Es(function(e, t) {
		var n;
		(n = r.subscribe) == null || n.call(r);
		var i = !0;
		e.subscribe(Ds(t, function(e) {
			var n;
			(n = r.next) == null || n.call(r, e), t.next(e);
		}, function() {
			var e;
			i = !1, (e = r.complete) == null || e.call(r), t.complete();
		}, function(e) {
			var n;
			i = !1, (n = r.error) == null || n.call(r, e), t.error(e);
		}, function() {
			var e, t;
			i && ((e = r.unsubscribe) == null || e.call(r)), (t = r.finalize) == null || t.call(r);
		}));
	}) : ys;
}
//#endregion
//#region node_modules/ua-parser-js/src/ua-parser.js
var cl = /* @__PURE__ */ n(((e, t, n) => {
	(function(n, r) {
		var i = "1.0.41", a = "", o = "function", s = "undefined", c = "object", l = "string", u = "major", d = "model", f = "name", p = "type", m = "vendor", h = "version", g = "architecture", _ = "console", v = "mobile", y = "tablet", b = "smarttv", x = "wearable", ee = "embedded", te = "Amazon", S = "Apple", C = "ASUS", ne = "BlackBerry", re = "Browser", w = "Chrome", ie = "Edge", ae = "Firefox", T = "Google", E = "Honor", oe = "Huawei", se = "Lenovo", ce = "LG", le = "Microsoft", ue = "Motorola", D = "Nvidia", de = "OnePlus", fe = "Opera", pe = "OPPO", me = "Samsung", he = "Sharp", ge = "Sony", _e = "Xiaomi", ve = "Zebra", ye = "Facebook", be = "Chromium OS", xe = "Mac OS", Se = " Browser", Ce = function(e, t) {
			var n = {};
			for (var r in e) n[r] = t[r] && t[r].length % 2 == 0 ? t[r].concat(e[r]) : e[r];
			return n;
		}, we = function(e) {
			for (var t = {}, n = 0; n < e.length; n++) t[e[n].toUpperCase()] = e[n];
			return t;
		}, Te = function(e, t) {
			return typeof e == l && Ee(t).indexOf(Ee(e)) !== -1;
		}, Ee = function(e) {
			return e.toLowerCase();
		}, De = function(e) {
			return typeof e == l ? e.replace(/[^\d\.]/g, a).split(".")[0] : r;
		}, Oe = function(e, t) {
			if (typeof e == l) return e = e.replace(/^\s\s*/, a), typeof t === s ? e : e.substring(0, 500);
		}, ke = function(e, t) {
			for (var n = 0, i, a, s, l, u, d; n < t.length && !u;) {
				var f = t[n], p = t[n + 1];
				for (i = a = 0; i < f.length && !u && f[i];) if (u = f[i++].exec(e), u) for (s = 0; s < p.length; s++) d = u[++a], l = p[s], typeof l == c && l.length > 0 ? l.length === 2 ? typeof l[1] == o ? this[l[0]] = l[1].call(this, d) : this[l[0]] = l[1] : l.length === 3 ? typeof l[1] === o && !(l[1].exec && l[1].test) ? this[l[0]] = d ? l[1].call(this, d, l[2]) : r : this[l[0]] = d ? d.replace(l[1], l[2]) : r : l.length === 4 && (this[l[0]] = d ? l[3].call(this, d.replace(l[1], l[2])) : r) : this[l] = d || r;
				n += 2;
			}
		}, Ae = function(e, t) {
			for (var n in t) if (typeof t[n] == c && t[n].length > 0) {
				for (var i = 0; i < t[n].length; i++) if (Te(t[n][i], e)) return n === "?" ? r : n;
			} else if (Te(t[n], e)) return n === "?" ? r : n;
			return t.hasOwnProperty("*") ? t["*"] : e;
		}, O = {
			"1.0": "/8",
			"1.2": "/1",
			"1.3": "/3",
			"2.0": "/412",
			"2.0.2": "/416",
			"2.0.3": "/417",
			"2.0.4": "/419",
			"?": "/"
		}, je = {
			ME: "4.90",
			"NT 3.11": "NT3.51",
			"NT 4.0": "NT4.0",
			2e3: "NT 5.0",
			XP: ["NT 5.1", "NT 5.2"],
			Vista: "NT 6.0",
			7: "NT 6.1",
			8: "NT 6.2",
			"8.1": "NT 6.3",
			10: ["NT 6.4", "NT 10.0"],
			RT: "ARM"
		}, Me = {
			browser: [
				[/\b(?:crmo|crios)\/([\w\.]+)/i],
				[h, [f, "Chrome"]],
				[/edg(?:e|ios|a)?\/([\w\.]+)/i],
				[h, [f, "Edge"]],
				[
					/(opera mini)\/([-\w\.]+)/i,
					/(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
					/(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
				],
				[f, h],
				[/opios[\/ ]+([\w\.]+)/i],
				[h, [f, fe + " Mini"]],
				[/\bop(?:rg)?x\/([\w\.]+)/i],
				[h, [f, fe + " GX"]],
				[/\bopr\/([\w\.]+)/i],
				[h, [f, fe]],
				[/\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[\/ ]?([\w\.]+)/i],
				[h, [f, "Baidu"]],
				[/\b(?:mxbrowser|mxios|myie2)\/?([-\w\.]*)\b/i],
				[h, [f, "Maxthon"]],
				[
					/(kindle)\/([\w\.]+)/i,
					/(lunascape|maxthon|netfront|jasmine|blazer|sleipnir)[\/ ]?([\w\.]*)/i,
					/(avant|iemobile|slim(?:browser|boat|jet))[\/ ]?([\d\.]*)/i,
					/(?:ms|\()(ie) ([\w\.]+)/i,
					/(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|duckduckgo|klar|helio|(?=comodo_)?dragon)\/([-\w\.]+)/i,
					/(heytap|ovi|115)browser\/([\d\.]+)/i,
					/(weibo)__([\d\.]+)/i
				],
				[f, h],
				[/quark(?:pc)?\/([-\w\.]+)/i],
				[h, [f, "Quark"]],
				[/\bddg\/([\w\.]+)/i],
				[h, [f, "DuckDuckGo"]],
				[/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
				[h, [f, "UC" + re]],
				[
					/microm.+\bqbcore\/([\w\.]+)/i,
					/\bqbcore\/([\w\.]+).+microm/i,
					/micromessenger\/([\w\.]+)/i
				],
				[h, [f, "WeChat"]],
				[/konqueror\/([\w\.]+)/i],
				[h, [f, "Konqueror"]],
				[/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
				[h, [f, "IE"]],
				[/ya(?:search)?browser\/([\w\.]+)/i],
				[h, [f, "Yandex"]],
				[/slbrowser\/([\w\.]+)/i],
				[h, [f, "Smart Lenovo " + re]],
				[/(avast|avg)\/([\w\.]+)/i],
				[[
					f,
					/(.+)/,
					"$1 Secure " + re
				], h],
				[/\bfocus\/([\w\.]+)/i],
				[h, [f, ae + " Focus"]],
				[/\bopt\/([\w\.]+)/i],
				[h, [f, fe + " Touch"]],
				[/coc_coc\w+\/([\w\.]+)/i],
				[h, [f, "Coc Coc"]],
				[/dolfin\/([\w\.]+)/i],
				[h, [f, "Dolphin"]],
				[/coast\/([\w\.]+)/i],
				[h, [f, fe + " Coast"]],
				[/miuibrowser\/([\w\.]+)/i],
				[h, [f, "MIUI" + Se]],
				[/fxios\/([\w\.-]+)/i],
				[h, [f, ae]],
				[/\bqihoobrowser\/?([\w\.]*)/i],
				[h, [f, "360"]],
				[/\b(qq)\/([\w\.]+)/i],
				[[
					f,
					/(.+)/,
					"$1Browser"
				], h],
				[/(oculus|sailfish|huawei|vivo|pico)browser\/([\w\.]+)/i],
				[[
					f,
					/(.+)/,
					"$1" + Se
				], h],
				[/samsungbrowser\/([\w\.]+)/i],
				[h, [f, me + " Internet"]],
				[/metasr[\/ ]?([\d\.]+)/i],
				[h, [f, "Sogou Explorer"]],
				[/(sogou)mo\w+\/([\d\.]+)/i],
				[[f, "Sogou Mobile"], h],
				[
					/(electron)\/([\w\.]+) safari/i,
					/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
					/m?(qqbrowser|2345(?=browser|chrome|explorer))\w*[\/ ]?v?([\w\.]+)/i
				],
				[f, h],
				[/(lbbrowser|rekonq)/i, /\[(linkedin)app\]/i],
				[f],
				[/ome\/([\w\.]+) \w* ?(iron) saf/i, /ome\/([\w\.]+).+qihu (360)[es]e/i],
				[h, f],
				[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
				[[f, ye], h],
				[
					/(Klarna)\/([\w\.]+)/i,
					/(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
					/(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
					/(daum)apps[\/ ]([\w\.]+)/i,
					/safari (line)\/([\w\.]+)/i,
					/\b(line)\/([\w\.]+)\/iab/i,
					/(alipay)client\/([\w\.]+)/i,
					/(twitter)(?:and| f.+e\/([\w\.]+))/i,
					/(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i
				],
				[f, h],
				[/\bgsa\/([\w\.]+) .*safari\//i],
				[h, [f, "GSA"]],
				[/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],
				[h, [f, "TikTok"]],
				[/headlesschrome(?:\/([\w\.]+)| )/i],
				[h, [f, w + " Headless"]],
				[/ wv\).+(chrome)\/([\w\.]+)/i],
				[[f, w + " WebView"], h],
				[/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
				[h, [f, "Android " + re]],
				[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
				[f, h],
				[/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],
				[h, [f, "Mobile Safari"]],
				[/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],
				[h, f],
				[/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
				[f, [
					h,
					Ae,
					O
				]],
				[/(webkit|khtml)\/([\w\.]+)/i],
				[f, h],
				[/(navigator|netscape\d?)\/([-\w\.]+)/i],
				[[f, "Netscape"], h],
				[/(wolvic|librewolf)\/([\w\.]+)/i],
				[f, h],
				[/mobile vr; rv:([\w\.]+)\).+firefox/i],
				[h, [f, ae + " Reality"]],
				[
					/ekiohf.+(flow)\/([\w\.]+)/i,
					/(swiftfox)/i,
					/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror)[\/ ]?([\w\.\+]+)/i,
					/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
					/(firefox)\/([\w\.]+)/i,
					/(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
					/(amaya|dillo|doris|icab|ladybird|lynx|mosaic|netsurf|obigo|polaris|w3m|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
					/\b(links) \(([\w\.]+)/i
				],
				[f, [
					h,
					/_/g,
					"."
				]],
				[/(cobalt)\/([\w\.]+)/i],
				[f, [
					h,
					/master.|lts./,
					""
				]]
			],
			cpu: [
				[/\b((amd|x|x86[-_]?|wow|win)64)\b/i],
				[[g, "amd64"]],
				[/(ia32(?=;))/i, /\b((i[346]|x)86)(pc)?\b/i],
				[[g, "ia32"]],
				[/\b(aarch64|arm(v?[89]e?l?|_?64))\b/i],
				[[g, "arm64"]],
				[/\b(arm(v[67])?ht?n?[fl]p?)\b/i],
				[[g, "armhf"]],
				[/( (ce|mobile); ppc;|\/[\w\.]+arm\b)/i],
				[[g, "arm"]],
				[/((ppc|powerpc)(64)?)( mac|;|\))/i],
				[[
					g,
					/ower/,
					a,
					Ee
				]],
				[/ sun4\w[;\)]/i],
				[[g, "sparc"]],
				[/\b(avr32|ia64(?=;)|68k(?=\))|\barm(?=v([1-7]|[5-7]1)l?|;|eabi)|(irix|mips|sparc)(64)?\b|pa-risc)/i],
				[[g, Ee]]
			],
			device: [
				[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],
				[
					d,
					[m, me],
					[p, y]
				],
				[
					/\b((?:s[cgp]h|gt|sm)-(?![lr])\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
					/samsung[- ]((?!sm-[lr])[-\w]+)/i,
					/sec-(sgh\w+)/i
				],
				[
					d,
					[m, me],
					[p, v]
				],
				[/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
				[
					d,
					[m, S],
					[p, v]
				],
				[
					/\((ipad);[-\w\),; ]+apple/i,
					/applecoremedia\/[\w\.]+ \((ipad)/i,
					/\b(ipad)\d\d?,\d\d?[;\]].+ios/i
				],
				[
					d,
					[m, S],
					[p, y]
				],
				[/(macintosh);/i],
				[d, [m, S]],
				[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
				[
					d,
					[m, he],
					[p, v]
				],
				[/\b((?:brt|eln|hey2?|gdi|jdn)-a?[lnw]09|(?:ag[rm]3?|jdn2|kob2)-a?[lw]0[09]hn)(?: bui|\)|;)/i],
				[
					d,
					[m, E],
					[p, y]
				],
				[/honor([-\w ]+)[;\)]/i],
				[
					d,
					[m, E],
					[p, v]
				],
				[/\b((?:ag[rs][2356]?k?|bah[234]?|bg[2o]|bt[kv]|cmr|cpn|db[ry]2?|jdn2|got|kob2?k?|mon|pce|scm|sht?|[tw]gr|vrd)-[ad]?[lw][0125][09]b?|605hw|bg2-u03|(?:gem|fdr|m2|ple|t1)-[7a]0[1-4][lu]|t1-a2[13][lw]|mediapad[\w\. ]*(?= bui|\)))\b(?!.+d\/s)/i],
				[
					d,
					[m, oe],
					[p, y]
				],
				[/(?:huawei)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i],
				[
					d,
					[m, oe],
					[p, v]
				],
				[/oid[^\)]+; (2[\dbc]{4}(182|283|rp\w{2})[cgl]|m2105k81a?c)(?: bui|\))/i, /\b((?:red)?mi[-_ ]?pad[\w- ]*)(?: bui|\))/i],
				[
					[
						d,
						/_/g,
						" "
					],
					[m, _e],
					[p, y]
				],
				[
					/\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
					/\b; (\w+) build\/hm\1/i,
					/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
					/\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
					/oid[^\)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
					/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite|pro)?)(?: bui|\))/i,
					/ ([\w ]+) miui\/v?\d/i
				],
				[
					[
						d,
						/_/g,
						" "
					],
					[m, _e],
					[p, v]
				],
				[/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],
				[
					d,
					[m, pe],
					[p, v]
				],
				[/\b(opd2(\d{3}a?))(?: bui|\))/i],
				[
					d,
					[
						m,
						Ae,
						{
							OnePlus: [
								"304",
								"403",
								"203"
							],
							"*": pe
						}
					],
					[p, y]
				],
				[/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
				[
					d,
					[m, "Vivo"],
					[p, v]
				],
				[/\b(rmx[1-3]\d{3})(?: bui|;|\))/i],
				[
					d,
					[m, "Realme"],
					[p, v]
				],
				[
					/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
					/\bmot(?:orola)?[- ](\w*)/i,
					/((?:moto(?! 360)[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
				],
				[
					d,
					[m, ue],
					[p, v]
				],
				[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
				[
					d,
					[m, ue],
					[p, y]
				],
				[/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
				[
					d,
					[m, ce],
					[p, y]
				],
				[
					/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
					/\blg[-e;\/ ]+((?!browser|netcast|android tv|watch)\w+)/i,
					/\blg-?([\d\w]+) bui/i
				],
				[
					d,
					[m, ce],
					[p, v]
				],
				[/(ideatab[-\w ]+|602lv|d-42a|a101lv|a2109a|a3500-hv|s[56]000|pb-6505[my]|tb-?x?\d{3,4}(?:f[cu]|xu|[av])|yt\d?-[jx]?\d+[lfmx])( bui|;|\)|\/)/i, /lenovo ?(b[68]0[08]0-?[hf]?|tab(?:[\w- ]+?)|tb[\w-]{6,7})( bui|;|\)|\/)/i],
				[
					d,
					[m, se],
					[p, y]
				],
				[/(nokia) (t[12][01])/i],
				[
					m,
					d,
					[p, y]
				],
				[/(?:maemo|nokia).*(n900|lumia \d+|rm-\d+)/i, /nokia[-_ ]?(([-\w\. ]*))/i],
				[
					[
						d,
						/_/g,
						" "
					],
					[p, v],
					[m, "Nokia"]
				],
				[/(pixel (c|tablet))\b/i],
				[
					d,
					[m, T],
					[p, y]
				],
				[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
				[
					d,
					[m, T],
					[p, v]
				],
				[/droid.+; (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],
				[
					d,
					[m, ge],
					[p, v]
				],
				[/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
				[
					[d, "Xperia Tablet"],
					[m, ge],
					[p, y]
				],
				[/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],
				[
					d,
					[m, de],
					[p, v]
				],
				[
					/(alexa)webm/i,
					/(kf[a-z]{2}wi|aeo(?!bc)\w\w)( bui|\))/i,
					/(kf[a-z]+)( bui|\)).+silk\//i
				],
				[
					d,
					[m, te],
					[p, y]
				],
				[/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
				[
					[
						d,
						/(.+)/g,
						"Fire Phone $1"
					],
					[m, te],
					[p, v]
				],
				[/(playbook);[-\w\),; ]+(rim)/i],
				[
					d,
					m,
					[p, y]
				],
				[/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
				[
					d,
					[m, ne],
					[p, v]
				],
				[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],
				[
					d,
					[m, C],
					[p, y]
				],
				[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
				[
					d,
					[m, C],
					[p, v]
				],
				[/(nexus 9)/i],
				[
					d,
					[m, "HTC"],
					[p, y]
				],
				[
					/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
					/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
					/(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
				],
				[
					m,
					[
						d,
						/_/g,
						" "
					],
					[p, v]
				],
				[/droid [\w\.]+; ((?:8[14]9[16]|9(?:0(?:48|60|8[01])|1(?:3[27]|66)|2(?:6[69]|9[56])|466))[gqswx])\w*(\)| bui)/i],
				[
					d,
					[m, "TCL"],
					[p, y]
				],
				[/(itel) ((\w+))/i],
				[
					[m, Ee],
					d,
					[
						p,
						Ae,
						{
							tablet: ["p10001l", "w7001"],
							"*": "mobile"
						}
					]
				],
				[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
				[
					d,
					[m, "Acer"],
					[p, y]
				],
				[/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
				[
					d,
					[m, "Meizu"],
					[p, v]
				],
				[/; ((?:power )?armor(?:[\w ]{0,8}))(?: bui|\))/i],
				[
					d,
					[m, "Ulefone"],
					[p, v]
				],
				[/; (energy ?\w+)(?: bui|\))/i, /; energizer ([\w ]+)(?: bui|\))/i],
				[
					d,
					[m, "Energizer"],
					[p, v]
				],
				[/; cat (b35);/i, /; (b15q?|s22 flip|s48c|s62 pro)(?: bui|\))/i],
				[
					d,
					[m, "Cat"],
					[p, v]
				],
				[/((?:new )?andromax[\w- ]+)(?: bui|\))/i],
				[
					d,
					[m, "Smartfren"],
					[p, v]
				],
				[/droid.+; (a(?:015|06[35]|142p?))/i],
				[
					d,
					[m, "Nothing"],
					[p, v]
				],
				[/; (x67 5g|tikeasy \w+|ac[1789]\d\w+)( b|\))/i, /archos ?(5|gamepad2?|([\w ]*[t1789]|hello) ?\d+[\w ]*)( b|\))/i],
				[
					d,
					[m, "Archos"],
					[p, y]
				],
				[/archos ([\w ]+)( b|\))/i, /; (ac[3-6]\d\w{2,8})( b|\))/i],
				[
					d,
					[m, "Archos"],
					[p, v]
				],
				[/(imo) (tab \w+)/i, /(infinix) (x1101b?)/i],
				[
					m,
					d,
					[p, y]
				],
				[
					/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus(?! zenw)|dell|jolla|meizu|motorola|polytron|infinix|tecno|micromax|advan)[-_ ]?([-\w]*)/i,
					/; (hmd|imo) ([\w ]+?)(?: bui|\))/i,
					/(hp) ([\w ]+\w)/i,
					/(microsoft); (lumia[\w ]+)/i,
					/(lenovo)[-_ ]?([-\w ]+?)(?: bui|\)|\/)/i,
					/(oppo) ?([\w ]+) bui/i
				],
				[
					m,
					d,
					[p, v]
				],
				[
					/(kobo)\s(ereader|touch)/i,
					/(hp).+(touchpad(?!.+tablet)|tablet)/i,
					/(kindle)\/([\w\.]+)/i,
					/(nook)[\w ]+build\/(\w+)/i,
					/(dell) (strea[kpr\d ]*[\dko])/i,
					/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
					/(trinity)[- ]*(t\d{3}) bui/i,
					/(gigaset)[- ]+(q\w{1,9}) bui/i,
					/(vodafone) ([\w ]+)(?:\)| bui)/i
				],
				[
					m,
					d,
					[p, y]
				],
				[/(surface duo)/i],
				[
					d,
					[m, le],
					[p, y]
				],
				[/droid [\d\.]+; (fp\du?)(?: b|\))/i],
				[
					d,
					[m, "Fairphone"],
					[p, v]
				],
				[/(u304aa)/i],
				[
					d,
					[m, "AT&T"],
					[p, v]
				],
				[/\bsie-(\w*)/i],
				[
					d,
					[m, "Siemens"],
					[p, v]
				],
				[/\b(rct\w+) b/i],
				[
					d,
					[m, "RCA"],
					[p, y]
				],
				[/\b(venue[\d ]{2,7}) b/i],
				[
					d,
					[m, "Dell"],
					[p, y]
				],
				[/\b(q(?:mv|ta)\w+) b/i],
				[
					d,
					[m, "Verizon"],
					[p, y]
				],
				[/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
				[
					d,
					[m, "Barnes & Noble"],
					[p, y]
				],
				[/\b(tm\d{3}\w+) b/i],
				[
					d,
					[m, "NuVision"],
					[p, y]
				],
				[/\b(k88) b/i],
				[
					d,
					[m, "ZTE"],
					[p, y]
				],
				[/\b(nx\d{3}j) b/i],
				[
					d,
					[m, "ZTE"],
					[p, v]
				],
				[/\b(gen\d{3}) b.+49h/i],
				[
					d,
					[m, "Swiss"],
					[p, v]
				],
				[/\b(zur\d{3}) b/i],
				[
					d,
					[m, "Swiss"],
					[p, y]
				],
				[/\b((zeki)?tb.*\b) b/i],
				[
					d,
					[m, "Zeki"],
					[p, y]
				],
				[/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
				[
					[m, "Dragon Touch"],
					d,
					[p, y]
				],
				[/\b(ns-?\w{0,9}) b/i],
				[
					d,
					[m, "Insignia"],
					[p, y]
				],
				[/\b((nxa|next)-?\w{0,9}) b/i],
				[
					d,
					[m, "NextBook"],
					[p, y]
				],
				[/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
				[
					[m, "Voice"],
					d,
					[p, v]
				],
				[/\b(lvtel\-)?(v1[12]) b/i],
				[
					[m, "LvTel"],
					d,
					[p, v]
				],
				[/\b(ph-1) /i],
				[
					d,
					[m, "Essential"],
					[p, v]
				],
				[/\b(v(100md|700na|7011|917g).*\b) b/i],
				[
					d,
					[m, "Envizen"],
					[p, y]
				],
				[/\b(trio[-\w\. ]+) b/i],
				[
					d,
					[m, "MachSpeed"],
					[p, y]
				],
				[/\btu_(1491) b/i],
				[
					d,
					[m, "Rotor"],
					[p, y]
				],
				[/((?:tegranote|shield t(?!.+d tv))[\w- ]*?)(?: b|\))/i],
				[
					d,
					[m, D],
					[p, y]
				],
				[/(sprint) (\w+)/i],
				[
					m,
					d,
					[p, v]
				],
				[/(kin\.[onetw]{3})/i],
				[
					[
						d,
						/\./g,
						" "
					],
					[m, le],
					[p, v]
				],
				[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
				[
					d,
					[m, ve],
					[p, y]
				],
				[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
				[
					d,
					[m, ve],
					[p, v]
				],
				[/smart-tv.+(samsung)/i],
				[m, [p, b]],
				[/hbbtv.+maple;(\d+)/i],
				[
					[
						d,
						/^/,
						"SmartTV"
					],
					[m, me],
					[p, b]
				],
				[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
				[[m, ce], [p, b]],
				[/(apple) ?tv/i],
				[
					m,
					[d, S + " TV"],
					[p, b]
				],
				[/crkey/i],
				[
					[d, w + "cast"],
					[m, T],
					[p, b]
				],
				[/droid.+aft(\w+)( bui|\))/i],
				[
					d,
					[m, te],
					[p, b]
				],
				[/(shield \w+ tv)/i],
				[
					d,
					[m, D],
					[p, b]
				],
				[/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
				[
					d,
					[m, he],
					[p, b]
				],
				[/(bravia[\w ]+)( bui|\))/i],
				[
					d,
					[m, ge],
					[p, b]
				],
				[/(mi(tv|box)-?\w+) bui/i],
				[
					d,
					[m, _e],
					[p, b]
				],
				[/Hbbtv.*(technisat) (.*);/i],
				[
					m,
					d,
					[p, b]
				],
				[/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i],
				[
					[m, Oe],
					[d, Oe],
					[p, b]
				],
				[/droid.+; ([\w- ]+) (?:android tv|smart[- ]?tv)/i],
				[d, [p, b]],
				[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
				[[p, b]],
				[/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
				[
					m,
					d,
					[p, _]
				],
				[/droid.+; (shield)( bui|\))/i],
				[
					d,
					[m, D],
					[p, _]
				],
				[/(playstation \w+)/i],
				[
					d,
					[m, ge],
					[p, _]
				],
				[/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
				[
					d,
					[m, le],
					[p, _]
				],
				[/\b(sm-[lr]\d\d[0156][fnuw]?s?|gear live)\b/i],
				[
					d,
					[m, me],
					[p, x]
				],
				[/((pebble))app/i, /(asus|google|lg|oppo) ((pixel |zen)?watch[\w ]*)( bui|\))/i],
				[
					m,
					d,
					[p, x]
				],
				[/(ow(?:19|20)?we?[1-3]{1,3})/i],
				[
					d,
					[m, pe],
					[p, x]
				],
				[/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],
				[
					d,
					[m, S],
					[p, x]
				],
				[/(opwwe\d{3})/i],
				[
					d,
					[m, de],
					[p, x]
				],
				[/(moto 360)/i],
				[
					d,
					[m, ue],
					[p, x]
				],
				[/(smartwatch 3)/i],
				[
					d,
					[m, ge],
					[p, x]
				],
				[/(g watch r)/i],
				[
					d,
					[m, ce],
					[p, x]
				],
				[/droid.+; (wt63?0{2,3})\)/i],
				[
					d,
					[m, ve],
					[p, x]
				],
				[/droid.+; (glass) \d/i],
				[
					d,
					[m, T],
					[p, x]
				],
				[/(pico) (4|neo3(?: link|pro)?)/i],
				[
					m,
					d,
					[p, x]
				],
				[/; (quest( \d| pro)?)/i],
				[
					d,
					[m, ye],
					[p, x]
				],
				[/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
				[m, [p, ee]],
				[/(aeobc)\b/i],
				[
					d,
					[m, te],
					[p, ee]
				],
				[/(homepod).+mac os/i],
				[
					d,
					[m, S],
					[p, ee]
				],
				[/windows iot/i],
				[[p, ee]],
				[/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i],
				[d, [p, v]],
				[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
				[d, [p, y]],
				[/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
				[[p, y]],
				[/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],
				[[p, v]],
				[/droid .+?; ([\w\. -]+)( bui|\))/i],
				[d, [m, "Generic"]]
			],
			engine: [
				[/windows.+ edge\/([\w\.]+)/i],
				[h, [f, ie + "HTML"]],
				[/(arkweb)\/([\w\.]+)/i],
				[f, h],
				[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
				[h, [f, "Blink"]],
				[
					/(presto)\/([\w\.]+)/i,
					/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna|servo)\/([\w\.]+)/i,
					/ekioh(flow)\/([\w\.]+)/i,
					/(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
					/(icab)[\/ ]([23]\.[\d\.]+)/i,
					/\b(libweb)/i
				],
				[f, h],
				[/ladybird\//i],
				[[f, "LibWeb"]],
				[/rv\:([\w\.]{1,9})\b.+(gecko)/i],
				[h, f]
			],
			os: [
				[/microsoft (windows) (vista|xp)/i],
				[f, h],
				[/(windows (?:phone(?: os)?|mobile|iot))[\/ ]?([\d\.\w ]*)/i],
				[f, [
					h,
					Ae,
					je
				]],
				[
					/windows nt 6\.2; (arm)/i,
					/windows[\/ ]([ntce\d\. ]+\w)(?!.+xbox)/i,
					/(?:win(?=3|9|n)|win 9x )([nt\d\.]+)/i
				],
				[[
					h,
					Ae,
					je
				], [f, "Windows"]],
				[
					/[adehimnop]{4,7}\b(?:.*os ([\w]+) like mac|; opera)/i,
					/(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,
					/cfnetwork\/.+darwin/i
				],
				[[
					h,
					/_/g,
					"."
				], [f, "iOS"]],
				[/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
				[[f, xe], [
					h,
					/_/g,
					"."
				]],
				[/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],
				[h, f],
				[/(ubuntu) ([\w\.]+) like android/i],
				[[
					f,
					/(.+)/,
					"$1 Touch"
				], h],
				[/(android|bada|blackberry|kaios|maemo|meego|openharmony|qnx|rim tablet os|sailfish|series40|symbian|tizen|webos)\w*[-\/; ]?([\d\.]*)/i],
				[f, h],
				[/\(bb(10);/i],
				[h, [f, ne]],
				[/(?:symbian ?os|symbos|s60(?=;)|series ?60)[-\/ ]?([\w\.]*)/i],
				[h, [f, "Symbian"]],
				[/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],
				[h, [f, ae + " OS"]],
				[/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
				[h, [f, "webOS"]],
				[/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],
				[h, [f, "watchOS"]],
				[/crkey\/([\d\.]+)/i],
				[h, [f, w + "cast"]],
				[/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],
				[[f, be], h],
				[
					/panasonic;(viera)/i,
					/(netrange)mmh/i,
					/(nettv)\/(\d+\.[\w\.]+)/i,
					/(nintendo|playstation) ([wids345portablevuch]+)/i,
					/(xbox); +xbox ([^\);]+)/i,
					/\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
					/(mint)[\/\(\) ]?(\w*)/i,
					/(mageia|vectorlinux)[; ]/i,
					/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
					/(hurd|linux)(?: arm\w*| x86\w*| ?)([\w\.]*)/i,
					/(gnu) ?([\w\.]*)/i,
					/\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
					/(haiku) (\w+)/i
				],
				[f, h],
				[/(sunos) ?([\w\.\d]*)/i],
				[[f, "Solaris"], h],
				[
					/((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
					/(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
					/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
					/(unix) ?([\w\.]*)/i
				],
				[f, h]
			]
		}, Ne = function(e, t) {
			if (typeof e == c && (t = e, e = r), !(this instanceof Ne)) return new Ne(e, t).getResult();
			var i = typeof n !== s && n.navigator ? n.navigator : r, _ = e || (i && i.userAgent ? i.userAgent : a), b = i && i.userAgentData ? i.userAgentData : r, x = t ? Ce(Me, t) : Me, ee = i && i.userAgent == _;
			return this.getBrowser = function() {
				var e = {};
				return e[f] = r, e[h] = r, ke.call(e, _, x.browser), e[u] = De(e[h]), ee && i && i.brave && typeof i.brave.isBrave == o && (e[f] = "Brave"), e;
			}, this.getCPU = function() {
				var e = {};
				return e[g] = r, ke.call(e, _, x.cpu), e;
			}, this.getDevice = function() {
				var e = {};
				return e[m] = r, e[d] = r, e[p] = r, ke.call(e, _, x.device), ee && !e[p] && b && b.mobile && (e[p] = v), ee && e[d] == "Macintosh" && i && typeof i.standalone !== s && i.maxTouchPoints && i.maxTouchPoints > 2 && (e[d] = "iPad", e[p] = y), e;
			}, this.getEngine = function() {
				var e = {};
				return e[f] = r, e[h] = r, ke.call(e, _, x.engine), e;
			}, this.getOS = function() {
				var e = {};
				return e[f] = r, e[h] = r, ke.call(e, _, x.os), ee && !e[f] && b && b.platform && b.platform != "Unknown" && (e[f] = b.platform.replace(/chrome os/i, be).replace(/macos/i, xe)), e;
			}, this.getResult = function() {
				return {
					ua: this.getUA(),
					browser: this.getBrowser(),
					engine: this.getEngine(),
					os: this.getOS(),
					device: this.getDevice(),
					cpu: this.getCPU()
				};
			}, this.getUA = function() {
				return _;
			}, this.setUA = function(e) {
				return _ = typeof e == l && e.length > 500 ? Oe(e, 500) : e, this;
			}, this.setUA(_), this;
		};
		Ne.VERSION = i, Ne.BROWSER = we([
			f,
			h,
			u
		]), Ne.CPU = we([g]), Ne.DEVICE = we([
			d,
			m,
			p,
			_,
			v,
			b,
			y,
			x,
			ee
		]), Ne.ENGINE = Ne.OS = we([f, h]), typeof e === s ? typeof define === o && define.amd ? define(function() {
			return Ne;
		}) : typeof n !== s && (n.UAParser = Ne) : (typeof t !== s && t.exports && (e = t.exports = Ne), e.UAParser = Ne);
		var Pe = typeof n !== s && (n.jQuery || n.Zepto);
		if (Pe && !Pe.ua) {
			var Fe = new Ne();
			Pe.ua = Fe.getResult(), Pe.ua.get = function() {
				return Fe.getUA();
			}, Pe.ua.set = function(e) {
				Fe.setUA(e);
				var t = Fe.getResult();
				for (var n in t) Pe.ua[n] = t[n];
			};
		}
	})(typeof window == "object" ? window : n);
})), ll = Po(), ul = cl(), dl = { src: "const e=new Map;self.addEventListener(\"message\",t=>{const s=t.data;switch(s.type){case\"setTimeout\":case\"setInterval\":e.set(s.id,(\"setTimeout\"===s.type?setTimeout:setInterval)(()=>{!function(e){const t={type:\"tick\",id:e};self.postMessage(t)}(s.id),\"setTimeout\"===s.type&&e.delete(s.id)},s.timeout));break;case\"clearTimeout\":case\"clearInterval\":(\"clearTimeout\"===s.type?clearTimeout:clearInterval)(e.get(s.id)),e.delete(s.id)}});" }, fl = class {
	constructor(e = {}) {
		this.currentTimerId = 1, this.callbacks = /* @__PURE__ */ new Map(), this.fallback = !1, this.setup = ({ useWorker: e = !0, name: t = "@stream-io/worker-timer" } = {}) => {
			if (!e) this.fallback = !0;
			else try {
				let e = dl.src, n = new Blob([e], { type: "application/javascript; charset=utf-8" }), r = URL.createObjectURL(n);
				this.worker = new Worker(r, { name: t }), this.worker.addEventListener("message", (e) => {
					let { type: t, id: n } = e.data;
					t === "tick" && this.callbacks.get(n)?.();
				});
			} catch (e) {
				console.error("Failed to create timer worker: ", e), this.fallback = !0;
			}
		}, this.destroy = () => {
			this.callbacks.clear(), this.worker?.terminate(), this.worker = void 0, this.fallback = !1;
		}, this.setInterval = (e, t) => this.setTimer("setInterval", e, t), this.clearInterval = (e) => {
			this.clearTimer("clearInterval", e);
		}, this.setTimeout = (e, t) => this.setTimer("setTimeout", e, t), this.clearTimeout = (e) => {
			this.clearTimer("clearTimeout", e);
		}, this.setTimer = (e, t, n) => {
			if (this.ready || this.setup(), this.fallback) return (e === "setTimeout" ? setTimeout : setInterval)(t, n);
			let r = this.getTimerId();
			return this.callbacks.set(r, () => {
				t(), e === "setTimeout" && this.callbacks.delete(r);
			}), this.sendMessage({
				type: e,
				id: r,
				timeout: n
			}), r;
		}, this.clearTimer = (e, t) => {
			t && (this.ready || this.setup(), this.fallback ? (e === "clearTimeout" ? clearTimeout : clearInterval)(t) : (this.callbacks.delete(t), this.sendMessage({
				type: e,
				id: t
			})));
		}, this.getTimerId = () => this.currentTimerId++, this.sendMessage = (e) => {
			if (!this.worker) throw Error("Cannot use timer worker before it's set up");
			this.worker.postMessage(e);
		}, this.setup(e);
	}
	get ready() {
		return this.fallback || !!this.worker;
	}
}, pl = {
	SPEAKER: "speaker",
	EARPIECE: "earpiece"
}, ml = {
	AVAILABLE: "available",
	DISABLED: "disabled",
	AUTO_ON: "auto-on"
}, hl = {
	BLOCK_USERS: "block-users",
	CHANGE_MAX_DURATION: "change-max-duration",
	CREATE_CALL: "create-call",
	CREATE_REACTION: "create-reaction",
	ENABLE_NOISE_CANCELLATION: "enable-noise-cancellation",
	END_CALL: "end-call",
	JOIN_BACKSTAGE: "join-backstage",
	JOIN_CALL: "join-call",
	JOIN_ENDED_CALL: "join-ended-call",
	KICK_USER: "kick-user",
	MUTE_USERS: "mute-users",
	PIN_FOR_EVERYONE: "pin-for-everyone",
	READ_CALL: "read-call",
	REMOVE_CALL_MEMBER: "remove-call-member",
	SCREENSHARE: "screenshare",
	SEND_AUDIO: "send-audio",
	SEND_CLOSED_CAPTIONS_CALL: "send-closed-captions-call",
	SEND_VIDEO: "send-video",
	START_BROADCAST_CALL: "start-broadcast-call",
	START_CLOSED_CAPTIONS_CALL: "start-closed-captions-call",
	START_FRAME_RECORD_CALL: "start-frame-record-call",
	START_INDIVIDUAL_RECORD_CALL: "start-individual-record-call",
	START_RAW_RECORD_CALL: "start-raw-record-call",
	START_RECORD_CALL: "start-record-call",
	START_TRANSCRIPTION_CALL: "start-transcription-call",
	STOP_BROADCAST_CALL: "stop-broadcast-call",
	STOP_CLOSED_CAPTIONS_CALL: "stop-closed-captions-call",
	STOP_FRAME_RECORD_CALL: "stop-frame-record-call",
	STOP_INDIVIDUAL_RECORD_CALL: "stop-individual-record-call",
	STOP_RAW_RECORD_CALL: "stop-raw-record-call",
	STOP_RECORD_CALL: "stop-record-call",
	STOP_TRANSCRIPTION_CALL: "stop-transcription-call",
	UPDATE_CALL: "update-call",
	UPDATE_CALL_MEMBER: "update-call-member",
	UPDATE_CALL_PERMISSIONS: "update-call-permissions",
	UPDATE_CALL_SETTINGS: "update-call-settings"
}, gl = {
	SCREENSHARE: "screenshare",
	SEND_AUDIO: "send-audio",
	SEND_VIDEO: "send-video"
}, _l = {
	CHAT: "chat",
	VIDEO: "video",
	FEEDS: "feeds"
}, vl = class extends Error {
	code;
	status;
	response;
	name = "ErrorFromResponse";
	unrecoverable;
	constructor({ message: e, code: t, status: n, response: r, unrecoverable: i }) {
		super(e), this.code = t, this.response = r, this.status = n, this.unrecoverable = i;
	}
	toJSON() {
		let e = [
			["status", this.status],
			["code", this.code],
			["unrecoverable", this.unrecoverable]
		], t = [];
		for (let [n, r] of e) r != null && t.push(`${n}: ${r}`);
		return {
			message: `(${t.join(", ")}) - ${this.message}`,
			stack: this.stack,
			name: this.name
		};
	}
}, yl;
(function(e) {
	e[e.NULL_VALUE = 0] = "NULL_VALUE";
})(yl ||= {});
var bl = new class extends N {
	constructor() {
		super("google.protobuf.Struct", [{
			no: 1,
			name: "fields",
			kind: "map",
			K: 9,
			V: {
				kind: "message",
				T: () => xl
			}
		}]);
	}
	internalJsonWrite(e, t) {
		let n = {};
		for (let [t, r] of Object.entries(e.fields)) n[t] = xl.toJson(r);
		return n;
	}
	internalJsonRead(e, t, n) {
		if (!at(e)) throw new globalThis.Error("Unable to parse message " + this.typeName + " from JSON " + it(e) + ".");
		n ||= this.create();
		for (let [t, r] of globalThis.Object.entries(e)) n.fields[t] = xl.fromJson(r);
		return n;
	}
}(), xl = new class extends N {
	constructor() {
		super("google.protobuf.Value", [
			{
				no: 1,
				name: "null_value",
				kind: "enum",
				oneof: "kind",
				T: () => ["google.protobuf.NullValue", yl]
			},
			{
				no: 2,
				name: "number_value",
				kind: "scalar",
				oneof: "kind",
				T: 1
			},
			{
				no: 3,
				name: "string_value",
				kind: "scalar",
				oneof: "kind",
				T: 9
			},
			{
				no: 4,
				name: "bool_value",
				kind: "scalar",
				oneof: "kind",
				T: 8
			},
			{
				no: 5,
				name: "struct_value",
				kind: "message",
				oneof: "kind",
				T: () => bl
			},
			{
				no: 6,
				name: "list_value",
				kind: "message",
				oneof: "kind",
				T: () => Sl
			}
		]);
	}
	internalJsonWrite(e, t) {
		if (e.kind.oneofKind === void 0) throw new globalThis.Error();
		switch (e.kind.oneofKind) {
			case void 0: throw new globalThis.Error();
			case "boolValue": return e.kind.boolValue;
			case "nullValue": return null;
			case "numberValue":
				let t = e.kind.numberValue;
				if (typeof t == "number" && !Number.isFinite(t)) throw new globalThis.Error();
				return t;
			case "stringValue": return e.kind.stringValue;
			case "listValue":
				let n = this.fields.find((e) => e.no === 6);
				if (n?.kind !== "message") throw new globalThis.Error();
				return n.T().toJson(e.kind.listValue);
			case "structValue":
				let r = this.fields.find((e) => e.no === 5);
				if (r?.kind !== "message") throw new globalThis.Error();
				return r.T().toJson(e.kind.structValue);
		}
	}
	internalJsonRead(e, t, n) {
		switch (n ||= this.create(), typeof e) {
			case "number":
				n.kind = {
					oneofKind: "numberValue",
					numberValue: e
				};
				break;
			case "string":
				n.kind = {
					oneofKind: "stringValue",
					stringValue: e
				};
				break;
			case "boolean":
				n.kind = {
					oneofKind: "boolValue",
					boolValue: e
				};
				break;
			case "object":
				e === null ? n.kind = {
					oneofKind: "nullValue",
					nullValue: yl.NULL_VALUE
				} : globalThis.Array.isArray(e) ? n.kind = {
					oneofKind: "listValue",
					listValue: Sl.fromJson(e)
				} : n.kind = {
					oneofKind: "structValue",
					structValue: bl.fromJson(e)
				};
				break;
			default: throw new globalThis.Error("Unable to parse " + this.typeName + " from JSON " + it(e));
		}
		return n;
	}
}(), Sl = new class extends N {
	constructor() {
		super("google.protobuf.ListValue", [{
			no: 1,
			name: "values",
			kind: "message",
			repeat: 2,
			T: () => xl
		}]);
	}
	internalJsonWrite(e, t) {
		return e.values.map((e) => xl.toJson(e));
	}
	internalJsonRead(e, t, n) {
		if (!globalThis.Array.isArray(e)) throw new globalThis.Error("Unable to parse " + this.typeName + " from JSON " + it(e));
		n ||= this.create();
		let r = e.map((e) => xl.fromJson(e));
		return n.values.push(...r), n;
	}
}(), Cl = new class extends N {
	constructor() {
		super("google.protobuf.Timestamp", [{
			no: 1,
			name: "seconds",
			kind: "scalar",
			T: 3
		}, {
			no: 2,
			name: "nanos",
			kind: "scalar",
			T: 5
		}]);
	}
	now() {
		let e = this.create(), t = Date.now();
		return e.seconds = A.from(Math.floor(t / 1e3)).toString(), e.nanos = t % 1e3 * 1e6, e;
	}
	toDate(e) {
		return new Date(A.from(e.seconds).toNumber() * 1e3 + Math.ceil(e.nanos / 1e6));
	}
	fromDate(e) {
		let t = this.create(), n = e.getTime();
		return t.seconds = A.from(Math.floor(n / 1e3)).toString(), t.nanos = (n % 1e3 + (n < 0 && n % 1e3 != 0 ? 1e3 : 0)) * 1e6, t;
	}
	internalJsonWrite(e, t) {
		let n = A.from(e.seconds).toNumber() * 1e3;
		if (n < Date.parse("0001-01-01T00:00:00Z") || n > Date.parse("9999-12-31T23:59:59Z")) throw Error("Unable to encode Timestamp to JSON. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.");
		if (e.nanos < 0) throw Error("Unable to encode invalid Timestamp to JSON. Nanos must not be negative.");
		let r = "Z";
		if (e.nanos > 0) {
			let t = (e.nanos + 1e9).toString().substring(1);
			r = t.substring(3) === "000000" ? "." + t.substring(0, 3) + "Z" : t.substring(6) === "000" ? "." + t.substring(0, 6) + "Z" : "." + t + "Z";
		}
		return new Date(n).toISOString().replace(".000Z", r);
	}
	internalJsonRead(e, t, n) {
		if (typeof e != "string") throw Error("Unable to parse Timestamp from JSON " + it(e) + ".");
		let r = e.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:Z|\.([0-9]{3,9})Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
		if (!r) throw Error("Unable to parse Timestamp from JSON. Invalid format.");
		let i = Date.parse(r[1] + "-" + r[2] + "-" + r[3] + "T" + r[4] + ":" + r[5] + ":" + r[6] + (r[8] ? r[8] : "Z"));
		if (Number.isNaN(i)) throw Error("Unable to parse Timestamp from JSON. Invalid value.");
		if (i < Date.parse("0001-01-01T00:00:00Z") || i > Date.parse("9999-12-31T23:59:59Z")) throw new globalThis.Error("Unable to parse Timestamp from JSON. Must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive.");
		return n ||= this.create(), n.seconds = A.from(i / 1e3).toString(), n.nanos = 0, r[7] && (n.nanos = parseInt("1" + r[7] + "0".repeat(9 - r[7].length)) - 1e9), n;
	}
}(), H;
(function(e) {
	e[e.PUBLISHER_UNSPECIFIED = 0] = "PUBLISHER_UNSPECIFIED", e[e.SUBSCRIBER = 1] = "SUBSCRIBER";
})(H ||= {});
var wl;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.POOR = 1] = "POOR", e[e.GOOD = 2] = "GOOD", e[e.EXCELLENT = 3] = "EXCELLENT";
})(wl ||= {});
var Tl;
(function(e) {
	e[e.LOW_UNSPECIFIED = 0] = "LOW_UNSPECIFIED", e[e.MID = 1] = "MID", e[e.HIGH = 2] = "HIGH", e[e.OFF = 3] = "OFF";
})(Tl ||= {});
var U;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.AUDIO = 1] = "AUDIO", e[e.VIDEO = 2] = "VIDEO", e[e.SCREEN_SHARE = 3] = "SCREEN_SHARE", e[e.SCREEN_SHARE_AUDIO = 4] = "SCREEN_SHARE_AUDIO";
})(U ||= {});
var El;
(function(e) {
	e[e.WEBRTC_UNSPECIFIED = 0] = "WEBRTC_UNSPECIFIED", e[e.RTMP = 1] = "RTMP", e[e.WHIP = 2] = "WHIP", e[e.SIP = 3] = "SIP", e[e.RTSP = 4] = "RTSP", e[e.SRT = 5] = "SRT";
})(El ||= {});
var Dl;
(function(e) {
	e[e.VOICE_STANDARD_UNSPECIFIED = 0] = "VOICE_STANDARD_UNSPECIFIED", e[e.VOICE_HIGH_QUALITY = 1] = "VOICE_HIGH_QUALITY", e[e.MUSIC_HIGH_QUALITY = 2] = "MUSIC_HIGH_QUALITY";
})(Dl ||= {});
var Ol;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.PUBLISH_TRACK_NOT_FOUND = 100] = "PUBLISH_TRACK_NOT_FOUND", e[e.PUBLISH_TRACKS_MISMATCH = 101] = "PUBLISH_TRACKS_MISMATCH", e[e.PUBLISH_TRACK_OUT_OF_ORDER = 102] = "PUBLISH_TRACK_OUT_OF_ORDER", e[e.PUBLISH_TRACK_VIDEO_LAYER_NOT_FOUND = 103] = "PUBLISH_TRACK_VIDEO_LAYER_NOT_FOUND", e[e.LIVE_ENDED = 104] = "LIVE_ENDED", e[e.PARTICIPANT_NOT_FOUND = 200] = "PARTICIPANT_NOT_FOUND", e[e.PARTICIPANT_MIGRATING_OUT = 201] = "PARTICIPANT_MIGRATING_OUT", e[e.PARTICIPANT_MIGRATION_FAILED = 202] = "PARTICIPANT_MIGRATION_FAILED", e[e.PARTICIPANT_MIGRATING = 203] = "PARTICIPANT_MIGRATING", e[e.PARTICIPANT_RECONNECT_FAILED = 204] = "PARTICIPANT_RECONNECT_FAILED", e[e.PARTICIPANT_MEDIA_TRANSPORT_FAILURE = 205] = "PARTICIPANT_MEDIA_TRANSPORT_FAILURE", e[e.PARTICIPANT_SIGNAL_LOST = 206] = "PARTICIPANT_SIGNAL_LOST", e[e.CALL_NOT_FOUND = 300] = "CALL_NOT_FOUND", e[e.CALL_PARTICIPANT_LIMIT_REACHED = 301] = "CALL_PARTICIPANT_LIMIT_REACHED", e[e.REQUEST_VALIDATION_FAILED = 400] = "REQUEST_VALIDATION_FAILED", e[e.UNAUTHENTICATED = 401] = "UNAUTHENTICATED", e[e.PERMISSION_DENIED = 403] = "PERMISSION_DENIED", e[e.TOO_MANY_REQUESTS = 429] = "TOO_MANY_REQUESTS", e[e.INTERNAL_SERVER_ERROR = 500] = "INTERNAL_SERVER_ERROR", e[e.SFU_SHUTTING_DOWN = 600] = "SFU_SHUTTING_DOWN", e[e.SFU_FULL = 700] = "SFU_FULL";
})(Ol ||= {});
var kl;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.REACT = 1] = "REACT", e[e.ANGULAR = 2] = "ANGULAR", e[e.ANDROID = 3] = "ANDROID", e[e.IOS = 4] = "IOS", e[e.FLUTTER = 5] = "FLUTTER", e[e.REACT_NATIVE = 6] = "REACT_NATIVE", e[e.UNITY = 7] = "UNITY", e[e.GO = 8] = "GO", e[e.PLAIN_JAVASCRIPT = 9] = "PLAIN_JAVASCRIPT", e[e.PYTHON = 10] = "PYTHON", e[e.VISION_AGENTS = 11] = "VISION_AGENTS";
})(kl ||= {});
var Al;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.USER_MUTED = 1] = "USER_MUTED", e[e.PERMISSION_REVOKED = 2] = "PERMISSION_REVOKED", e[e.MODERATION = 3] = "MODERATION";
})(Al ||= {});
var jl;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.SHUTTING_DOWN = 1] = "SHUTTING_DOWN", e[e.REBALANCE = 2] = "REBALANCE";
})(jl ||= {});
var Ml;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.ENDED = 1] = "ENDED", e[e.LIVE_ENDED = 2] = "LIVE_ENDED", e[e.KICKED = 3] = "KICKED", e[e.SESSION_ENDED = 4] = "SESSION_ENDED";
})(Ml ||= {});
var W;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.DISCONNECT = 1] = "DISCONNECT", e[e.FAST = 2] = "FAST", e[e.REJOIN = 3] = "REJOIN", e[e.MIGRATE = 4] = "MIGRATE";
})(W ||= {});
var Nl;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.NONE = 1] = "NONE", e[e.LIGHT = 2] = "LIGHT", e[e.MODERATE = 3] = "MODERATE", e[e.SEVERE = 4] = "SEVERE", e[e.CRITICAL = 5] = "CRITICAL", e[e.EMERGENCY = 6] = "EMERGENCY", e[e.SHUTDOWN = 7] = "SHUTDOWN";
})(Nl ||= {});
var Pl;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.NOMINAL = 1] = "NOMINAL", e[e.FAIR = 2] = "FAIR", e[e.SERIOUS = 3] = "SERIOUS", e[e.CRITICAL = 4] = "CRITICAL";
})(Pl ||= {});
var Fl;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.SUBSCRIBER_VIDEO_PAUSE = 1] = "SUBSCRIBER_VIDEO_PAUSE", e[e.COORDINATOR_STATS = 2] = "COORDINATOR_STATS";
})(Fl ||= {});
var Il;
(function(e) {
	e[e.UNSPECIFIED = 0] = "UNSPECIFIED", e[e.BALANCED = 1] = "BALANCED", e[e.MAINTAIN_FRAMERATE = 2] = "MAINTAIN_FRAMERATE", e[e.MAINTAIN_RESOLUTION = 3] = "MAINTAIN_RESOLUTION", e[e.MAINTAIN_FRAMERATE_AND_RESOLUTION = 4] = "MAINTAIN_FRAMERATE_AND_RESOLUTION";
})(Il ||= {});
var Ll = new class extends N {
	constructor() {
		super("stream.video.sfu.models.CallState", [
			{
				no: 1,
				name: "participants",
				kind: "message",
				repeat: 2,
				T: () => Bl
			},
			{
				no: 2,
				name: "started_at",
				kind: "message",
				T: () => Cl
			},
			{
				no: 3,
				name: "participant_count",
				kind: "message",
				T: () => Rl
			},
			{
				no: 4,
				name: "pins",
				kind: "message",
				repeat: 2,
				T: () => zl
			},
			{
				no: 5,
				name: "e2ee_enabled",
				kind: "scalar",
				jsonName: "e2eeEnabled",
				T: 8
			}
		]);
	}
}(), Rl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.ParticipantCount", [{
			no: 1,
			name: "total",
			kind: "scalar",
			T: 13
		}, {
			no: 2,
			name: "anonymous",
			kind: "scalar",
			T: 13
		}]);
	}
}(), zl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Pin", [{
			no: 1,
			name: "user_id",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "session_id",
			kind: "scalar",
			T: 9
		}]);
	}
}(), Bl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Participant", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "published_tracks",
				kind: "enum",
				repeat: 1,
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 4,
				name: "joined_at",
				kind: "message",
				T: () => Cl
			},
			{
				no: 5,
				name: "track_lookup_prefix",
				kind: "scalar",
				T: 9
			},
			{
				no: 6,
				name: "connection_quality",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.ConnectionQuality",
					wl,
					"CONNECTION_QUALITY_"
				]
			},
			{
				no: 7,
				name: "is_speaking",
				kind: "scalar",
				T: 8
			},
			{
				no: 8,
				name: "is_dominant_speaker",
				kind: "scalar",
				T: 8
			},
			{
				no: 9,
				name: "audio_level",
				kind: "scalar",
				T: 2
			},
			{
				no: 10,
				name: "name",
				kind: "scalar",
				T: 9
			},
			{
				no: 11,
				name: "image",
				kind: "scalar",
				T: 9
			},
			{
				no: 12,
				name: "custom",
				kind: "message",
				T: () => bl
			},
			{
				no: 13,
				name: "roles",
				kind: "scalar",
				repeat: 2,
				T: 9
			},
			{
				no: 14,
				name: "source",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.ParticipantSource",
					El,
					"PARTICIPANT_SOURCE_"
				]
			}
		]);
	}
}(), Vl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.StreamQuality", [{
			no: 1,
			name: "video_quality",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.VideoQuality",
				Tl,
				"VIDEO_QUALITY_"
			]
		}, {
			no: 2,
			name: "user_id",
			kind: "scalar",
			T: 9
		}]);
	}
}(), Hl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.VideoDimension", [{
			no: 1,
			name: "width",
			kind: "scalar",
			T: 13
		}, {
			no: 2,
			name: "height",
			kind: "scalar",
			T: 13
		}]);
	}
}(), Ul = new class extends N {
	constructor() {
		super("stream.video.sfu.models.VideoLayer", [
			{
				no: 1,
				name: "rid",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "video_dimension",
				kind: "message",
				T: () => Hl
			},
			{
				no: 4,
				name: "bitrate",
				kind: "scalar",
				T: 13
			},
			{
				no: 5,
				name: "fps",
				kind: "scalar",
				T: 13
			},
			{
				no: 6,
				name: "quality",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.VideoQuality",
					Tl,
					"VIDEO_QUALITY_"
				]
			}
		]);
	}
}(), Wl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.SubscribeOption", [{
			no: 1,
			name: "track_type",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.TrackType",
				U,
				"TRACK_TYPE_"
			]
		}, {
			no: 2,
			name: "codecs",
			kind: "message",
			repeat: 2,
			T: () => Kl
		}]);
	}
}(), Gl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.PublishOption", [
			{
				no: 1,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 2,
				name: "codec",
				kind: "message",
				T: () => Kl
			},
			{
				no: 3,
				name: "bitrate",
				kind: "scalar",
				T: 5
			},
			{
				no: 4,
				name: "fps",
				kind: "scalar",
				T: 5
			},
			{
				no: 5,
				name: "max_spatial_layers",
				kind: "scalar",
				T: 5
			},
			{
				no: 6,
				name: "max_temporal_layers",
				kind: "scalar",
				T: 5
			},
			{
				no: 7,
				name: "video_dimension",
				kind: "message",
				T: () => Hl
			},
			{
				no: 8,
				name: "id",
				kind: "scalar",
				T: 5
			},
			{
				no: 9,
				name: "use_single_layer",
				kind: "scalar",
				T: 8
			},
			{
				no: 10,
				name: "audio_bitrate_profiles",
				kind: "message",
				repeat: 2,
				T: () => Jl
			},
			{
				no: 11,
				name: "degradation_preference",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.DegradationPreference",
					Il,
					"DEGRADATION_PREFERENCE_"
				]
			}
		]);
	}
}(), Kl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Codec", [
			{
				no: 16,
				name: "payload_type",
				kind: "scalar",
				T: 13
			},
			{
				no: 10,
				name: "name",
				kind: "scalar",
				T: 9
			},
			{
				no: 14,
				name: "clock_rate",
				kind: "scalar",
				T: 13
			},
			{
				no: 15,
				name: "encoding_parameters",
				kind: "scalar",
				T: 9
			},
			{
				no: 12,
				name: "fmtp",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), ql = new class extends N {
	constructor() {
		super("stream.video.sfu.models.ICETrickle", [
			{
				no: 1,
				name: "peer_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.PeerType",
					H,
					"PEER_TYPE_"
				]
			},
			{
				no: 2,
				name: "ice_candidate",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "session_id",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), Jl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.AudioBitrate", [{
			no: 1,
			name: "profile",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.AudioBitrateProfile",
				Dl,
				"AUDIO_BITRATE_PROFILE_"
			]
		}, {
			no: 2,
			name: "bitrate",
			kind: "scalar",
			T: 5
		}]);
	}
}(), Yl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.TrackInfo", [
			{
				no: 1,
				name: "track_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 5,
				name: "layers",
				kind: "message",
				repeat: 2,
				T: () => Ul
			},
			{
				no: 6,
				name: "mid",
				kind: "scalar",
				T: 9
			},
			{
				no: 7,
				name: "dtx",
				kind: "scalar",
				T: 8
			},
			{
				no: 8,
				name: "stereo",
				kind: "scalar",
				T: 8
			},
			{
				no: 9,
				name: "red",
				kind: "scalar",
				T: 8
			},
			{
				no: 10,
				name: "muted",
				kind: "scalar",
				T: 8
			},
			{
				no: 11,
				name: "codec",
				kind: "message",
				T: () => Kl
			},
			{
				no: 12,
				name: "publish_option_id",
				kind: "scalar",
				T: 5
			},
			{
				no: 13,
				name: "self_sub_audio_video",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), Xl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Error", [
			{
				no: 1,
				name: "code",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.ErrorCode",
					Ol,
					"ERROR_CODE_"
				]
			},
			{
				no: 2,
				name: "message",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "should_retry",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), Zl = new class extends N {
	constructor() {
		super("stream.video.sfu.models.ClientDetails", [
			{
				no: 1,
				name: "sdk",
				kind: "message",
				T: () => Ql
			},
			{
				no: 2,
				name: "os",
				kind: "message",
				T: () => $l
			},
			{
				no: 3,
				name: "browser",
				kind: "message",
				T: () => eu
			},
			{
				no: 4,
				name: "device",
				kind: "message",
				T: () => nu
			},
			{
				no: 5,
				name: "webrtc_version",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), Ql = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Sdk", [
			{
				no: 1,
				name: "type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.SdkType",
					kl,
					"SDK_TYPE_"
				]
			},
			{
				no: 2,
				name: "major",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "minor",
				kind: "scalar",
				T: 9
			},
			{
				no: 4,
				name: "patch",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), $l = new class extends N {
	constructor() {
		super("stream.video.sfu.models.OS", [
			{
				no: 1,
				name: "name",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "version",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "architecture",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), eu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Browser", [{
			no: 1,
			name: "name",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "version",
			kind: "scalar",
			T: 9
		}]);
	}
}(), tu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.RTMPIngress", [
			{
				no: 1,
				name: "width",
				kind: "scalar",
				T: 13
			},
			{
				no: 2,
				name: "height",
				kind: "scalar",
				T: 13
			},
			{
				no: 3,
				name: "frame_rate",
				kind: "scalar",
				T: 1
			},
			{
				no: 4,
				name: "software",
				kind: "scalar",
				T: 9
			},
			{
				no: 5,
				name: "version",
				kind: "scalar",
				T: 9
			},
			{
				no: 6,
				name: "encoder",
				kind: "scalar",
				T: 9
			},
			{
				no: 7,
				name: "remote_addr",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), nu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Device", [{
			no: 1,
			name: "name",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "version",
			kind: "scalar",
			T: 9
		}]);
	}
}(), ru = new class extends N {
	constructor() {
		super("stream.video.sfu.models.Call", [
			{
				no: 1,
				name: "type",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "created_by_user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 4,
				name: "host_user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 5,
				name: "custom",
				kind: "message",
				T: () => bl
			},
			{
				no: 6,
				name: "created_at",
				kind: "message",
				T: () => Cl
			},
			{
				no: 7,
				name: "updated_at",
				kind: "message",
				T: () => Cl
			}
		]);
	}
}(), iu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.CallGrants", [
			{
				no: 1,
				name: "can_publish_audio",
				kind: "scalar",
				T: 8
			},
			{
				no: 2,
				name: "can_publish_video",
				kind: "scalar",
				T: 8
			},
			{
				no: 3,
				name: "can_screenshare",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), au = new class extends N {
	constructor() {
		super("stream.video.sfu.models.InputDevices", [
			{
				no: 1,
				name: "available_devices",
				kind: "scalar",
				repeat: 2,
				T: 9
			},
			{
				no: 2,
				name: "current_device",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "is_permitted",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), ou = new class extends N {
	constructor() {
		super("stream.video.sfu.models.AndroidState", [{
			no: 1,
			name: "thermal_state",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.AndroidThermalState",
				Nl,
				"ANDROID_THERMAL_STATE_"
			]
		}, {
			no: 2,
			name: "is_power_saver_mode",
			kind: "scalar",
			T: 8
		}]);
	}
}(), su = new class extends N {
	constructor() {
		super("stream.video.sfu.models.AppleState", [{
			no: 1,
			name: "thermal_state",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.AppleThermalState",
				Pl,
				"APPLE_THERMAL_STATE_"
			]
		}, {
			no: 2,
			name: "is_low_power_mode_enabled",
			kind: "scalar",
			T: 8
		}]);
	}
}(), cu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.PerformanceStats", [
			{
				no: 1,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 2,
				name: "codec",
				kind: "message",
				T: () => Kl
			},
			{
				no: 3,
				name: "avg_frame_time_ms",
				kind: "scalar",
				T: 2
			},
			{
				no: 4,
				name: "avg_fps",
				kind: "scalar",
				T: 2
			},
			{
				no: 5,
				name: "video_dimension",
				kind: "message",
				T: () => Hl
			},
			{
				no: 6,
				name: "target_bitrate",
				kind: "scalar",
				T: 5
			}
		]);
	}
}(), lu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.RtpBase", [
			{
				no: 1,
				name: "ssrc",
				kind: "scalar",
				T: 13
			},
			{
				no: 2,
				name: "kind",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "timestamp_ms",
				kind: "scalar",
				T: 1
			}
		]);
	}
}(), uu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.InboundRtp", [
			{
				no: 1,
				name: "base",
				kind: "message",
				T: () => lu
			},
			{
				no: 2,
				name: "jitter_seconds",
				kind: "scalar",
				T: 1
			},
			{
				no: 3,
				name: "packets_received",
				kind: "scalar",
				T: 4
			},
			{
				no: 4,
				name: "packets_lost",
				kind: "scalar",
				T: 4
			},
			{
				no: 5,
				name: "packet_loss_percent",
				kind: "scalar",
				T: 1
			},
			{
				no: 10,
				name: "concealment_events",
				kind: "scalar",
				T: 13
			},
			{
				no: 11,
				name: "concealment_percent",
				kind: "scalar",
				T: 1
			},
			{
				no: 20,
				name: "fps",
				kind: "scalar",
				T: 1
			},
			{
				no: 21,
				name: "freeze_duration_seconds",
				kind: "scalar",
				T: 1
			},
			{
				no: 22,
				name: "avg_decode_time_seconds",
				kind: "scalar",
				T: 1
			},
			{
				no: 23,
				name: "min_dimension_px",
				kind: "scalar",
				T: 13
			}
		]);
	}
}(), du = new class extends N {
	constructor() {
		super("stream.video.sfu.models.OutboundRtp", [
			{
				no: 1,
				name: "base",
				kind: "message",
				T: () => lu
			},
			{
				no: 10,
				name: "fps",
				kind: "scalar",
				T: 1
			},
			{
				no: 11,
				name: "avg_encode_time_seconds",
				kind: "scalar",
				T: 1
			},
			{
				no: 12,
				name: "bitrate_bps",
				kind: "scalar",
				T: 1
			},
			{
				no: 13,
				name: "min_dimension_px",
				kind: "scalar",
				T: 13
			}
		]);
	}
}(), fu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.RemoteInboundRtp", [
			{
				no: 1,
				name: "base",
				kind: "message",
				T: () => lu
			},
			{
				no: 2,
				name: "jitter_seconds",
				kind: "scalar",
				T: 1
			},
			{
				no: 3,
				name: "round_trip_time_s",
				kind: "scalar",
				T: 1
			}
		]);
	}
}(), pu = new class extends N {
	constructor() {
		super("stream.video.sfu.models.RemoteOutboundRtp", [
			{
				no: 1,
				name: "base",
				kind: "message",
				T: () => lu
			},
			{
				no: 2,
				name: "jitter_seconds",
				kind: "scalar",
				T: 1
			},
			{
				no: 3,
				name: "round_trip_time_s",
				kind: "scalar",
				T: 1
			}
		]);
	}
}(), mu = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	AndroidState: ou,
	get AndroidThermalState() {
		return Nl;
	},
	AppleState: su,
	get AppleThermalState() {
		return Pl;
	},
	AudioBitrate: Jl,
	get AudioBitrateProfile() {
		return Dl;
	},
	Browser: eu,
	Call: ru,
	get CallEndedReason() {
		return Ml;
	},
	CallGrants: iu,
	CallState: Ll,
	get ClientCapability() {
		return Fl;
	},
	ClientDetails: Zl,
	Codec: Kl,
	get ConnectionQuality() {
		return wl;
	},
	get DegradationPreference() {
		return Il;
	},
	Device: nu,
	Error: Xl,
	get ErrorCode() {
		return Ol;
	},
	get GoAwayReason() {
		return jl;
	},
	ICETrickle: ql,
	InboundRtp: uu,
	InputDevices: au,
	OS: $l,
	OutboundRtp: du,
	Participant: Bl,
	ParticipantCount: Rl,
	get ParticipantSource() {
		return El;
	},
	get PeerType() {
		return H;
	},
	PerformanceStats: cu,
	Pin: zl,
	PublishOption: Gl,
	RTMPIngress: tu,
	RemoteInboundRtp: fu,
	RemoteOutboundRtp: pu,
	RtpBase: lu,
	Sdk: Ql,
	get SdkType() {
		return kl;
	},
	StreamQuality: Vl,
	SubscribeOption: Wl,
	TrackInfo: Yl,
	get TrackType() {
		return U;
	},
	get TrackUnpublishReason() {
		return Al;
	},
	VideoDimension: Hl,
	VideoLayer: Ul,
	get VideoQuality() {
		return Tl;
	},
	get WebsocketReconnectStrategy() {
		return W;
	}
}), hu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.StartNoiseCancellationRequest", [{
			no: 1,
			name: "session_id",
			kind: "scalar",
			T: 9
		}]);
	}
}(), gu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.StartNoiseCancellationResponse", [{
			no: 1,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), _u = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.StopNoiseCancellationRequest", [{
			no: 1,
			name: "session_id",
			kind: "scalar",
			T: 9
		}]);
	}
}(), vu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.StopNoiseCancellationResponse", [{
			no: 1,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), yu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.Reconnection", [{
			no: 1,
			name: "time_seconds",
			kind: "scalar",
			T: 2
		}, {
			no: 2,
			name: "strategy",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.WebsocketReconnectStrategy",
				W,
				"WEBSOCKET_RECONNECT_STRATEGY_"
			]
		}]);
	}
}(), bu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.Telemetry", [{
			no: 1,
			name: "connection_time_seconds",
			kind: "scalar",
			oneof: "data",
			T: 2
		}, {
			no: 2,
			name: "reconnection",
			kind: "message",
			oneof: "data",
			T: () => yu
		}]);
	}
}(), xu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.SendMetricsRequest", [
			{
				no: 1,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "unified_session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "inbounds",
				kind: "message",
				repeat: 2,
				T: () => uu
			},
			{
				no: 4,
				name: "outbounds",
				kind: "message",
				repeat: 2,
				T: () => du
			},
			{
				no: 5,
				name: "remote_inbounds",
				kind: "message",
				repeat: 2,
				T: () => fu
			},
			{
				no: 6,
				name: "remote_outbounds",
				kind: "message",
				repeat: 2,
				T: () => pu
			}
		]);
	}
}(), Su = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.SendMetricsResponse", []);
	}
}(), Cu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.SendStatsRequest", [
			{
				no: 1,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 4,
				name: "webrtc_version",
				kind: "scalar",
				T: 9
			},
			{
				no: 5,
				name: "sdk",
				kind: "scalar",
				T: 9
			},
			{
				no: 6,
				name: "sdk_version",
				kind: "scalar",
				T: 9
			},
			{
				no: 9,
				name: "android",
				kind: "message",
				oneof: "deviceState",
				T: () => ou
			},
			{
				no: 10,
				name: "apple",
				kind: "message",
				oneof: "deviceState",
				T: () => su
			},
			{
				no: 11,
				name: "telemetry",
				kind: "message",
				T: () => bu
			},
			{
				no: 12,
				name: "rtmp",
				kind: "message",
				T: () => tu
			},
			{
				no: 15,
				name: "rtc_stats",
				kind: "scalar",
				T: 9
			},
			{
				no: 16,
				name: "encode_stats",
				kind: "message",
				repeat: 2,
				T: () => cu
			},
			{
				no: 17,
				name: "decode_stats",
				kind: "message",
				repeat: 2,
				T: () => cu
			},
			{
				no: 18,
				name: "unified_session_id",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), wu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.SendStatsResponse", [{
			no: 1,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), Tu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.ICERestartRequest", [{
			no: 1,
			name: "session_id",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "peer_type",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.PeerType",
				H,
				"PEER_TYPE_"
			]
		}]);
	}
}(), Eu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.ICERestartResponse", [{
			no: 1,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), Du = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.UpdateMuteStatesRequest", [{
			no: 1,
			name: "session_id",
			kind: "scalar",
			T: 9
		}, {
			no: 3,
			name: "mute_states",
			kind: "message",
			repeat: 2,
			T: () => ku
		}]);
	}
}(), Ou = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.UpdateMuteStatesResponse", [{
			no: 4,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), ku = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.TrackMuteState", [{
			no: 1,
			name: "track_type",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.TrackType",
				U,
				"TRACK_TYPE_"
			]
		}, {
			no: 2,
			name: "muted",
			kind: "scalar",
			T: 8
		}]);
	}
}();
new class extends N {
	constructor() {
		super("stream.video.sfu.signal.AudioMuteChanged", [{
			no: 1,
			name: "muted",
			kind: "scalar",
			T: 8
		}]);
	}
}(), new class extends N {
	constructor() {
		super("stream.video.sfu.signal.VideoMuteChanged", [{
			no: 2,
			name: "muted",
			kind: "scalar",
			T: 8
		}]);
	}
}();
var Au = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.UpdateSubscriptionsRequest", [{
			no: 2,
			name: "session_id",
			kind: "scalar",
			T: 9
		}, {
			no: 3,
			name: "tracks",
			kind: "message",
			repeat: 2,
			T: () => Mu
		}]);
	}
}(), ju = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.UpdateSubscriptionsResponse", [{
			no: 4,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), Mu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.TrackSubscriptionDetails", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 4,
				name: "dimension",
				kind: "message",
				T: () => Hl
			}
		]);
	}
}(), Nu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.SendAnswerRequest", [
			{
				no: 1,
				name: "peer_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.PeerType",
					H,
					"PEER_TYPE_"
				]
			},
			{
				no: 2,
				name: "sdp",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 4,
				name: "negotiation_id",
				kind: "scalar",
				T: 13
			}
		]);
	}
}(), Pu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.SendAnswerResponse", [{
			no: 4,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), Fu = new class extends N {
	constructor() {
		super("stream.video.sfu.signal.ICETrickleResponse", [{
			no: 4,
			name: "error",
			kind: "message",
			T: () => Xl
		}]);
	}
}(), Iu = new _n("stream.video.sfu.signal.SignalServer", [
	{
		name: "SetPublisher",
		options: {},
		I: new class extends N {
			constructor() {
				super("stream.video.sfu.signal.SetPublisherRequest", [
					{
						no: 1,
						name: "sdp",
						kind: "scalar",
						T: 9
					},
					{
						no: 2,
						name: "session_id",
						kind: "scalar",
						T: 9
					},
					{
						no: 3,
						name: "tracks",
						kind: "message",
						repeat: 2,
						T: () => Yl
					}
				]);
			}
		}(),
		O: new class extends N {
			constructor() {
				super("stream.video.sfu.signal.SetPublisherResponse", [
					{
						no: 1,
						name: "sdp",
						kind: "scalar",
						T: 9
					},
					{
						no: 2,
						name: "session_id",
						kind: "scalar",
						T: 9
					},
					{
						no: 3,
						name: "ice_restart",
						kind: "scalar",
						T: 8
					},
					{
						no: 4,
						name: "error",
						kind: "message",
						T: () => Xl
					}
				]);
			}
		}()
	},
	{
		name: "SendAnswer",
		options: {},
		I: Nu,
		O: Pu
	},
	{
		name: "IceTrickle",
		options: {},
		I: ql,
		O: Fu
	},
	{
		name: "UpdateSubscriptions",
		options: {},
		I: Au,
		O: ju
	},
	{
		name: "UpdateMuteStates",
		options: {},
		I: Du,
		O: Ou
	},
	{
		name: "IceRestart",
		options: {},
		I: Tu,
		O: Eu
	},
	{
		name: "SendStats",
		options: {},
		I: Cu,
		O: wu
	},
	{
		name: "SendMetrics",
		options: {},
		I: xu,
		O: Su
	},
	{
		name: "StartNoiseCancellation",
		options: {},
		I: hu,
		O: gu
	},
	{
		name: "StopNoiseCancellation",
		options: {},
		I: _u,
		O: vu
	}
]), Lu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.SfuEvent", [
			{
				no: 1,
				name: "subscriber_offer",
				kind: "message",
				oneof: "eventPayload",
				T: () => nd
			},
			{
				no: 2,
				name: "publisher_answer",
				kind: "message",
				oneof: "eventPayload",
				T: () => rd
			},
			{
				no: 3,
				name: "connection_quality_changed",
				kind: "message",
				oneof: "eventPayload",
				T: () => id
			},
			{
				no: 4,
				name: "audio_level_changed",
				kind: "message",
				oneof: "eventPayload",
				T: () => cd
			},
			{
				no: 5,
				name: "ice_trickle",
				kind: "message",
				oneof: "eventPayload",
				T: () => ql
			},
			{
				no: 6,
				name: "change_publish_quality",
				kind: "message",
				oneof: "eventPayload",
				T: () => fd
			},
			{
				no: 10,
				name: "participant_joined",
				kind: "message",
				oneof: "eventPayload",
				T: () => $u
			},
			{
				no: 11,
				name: "participant_left",
				kind: "message",
				oneof: "eventPayload",
				T: () => ed
			},
			{
				no: 12,
				name: "dominant_speaker_changed",
				kind: "message",
				oneof: "eventPayload",
				T: () => od
			},
			{
				no: 13,
				name: "join_response",
				kind: "message",
				oneof: "eventPayload",
				T: () => Qu
			},
			{
				no: 14,
				name: "health_check_response",
				kind: "message",
				oneof: "eventPayload",
				T: () => Ku
			},
			{
				no: 16,
				name: "track_published",
				kind: "message",
				oneof: "eventPayload",
				T: () => qu
			},
			{
				no: 17,
				name: "track_unpublished",
				kind: "message",
				oneof: "eventPayload",
				T: () => Ju
			},
			{
				no: 18,
				name: "error",
				kind: "message",
				oneof: "eventPayload",
				T: () => Vu
			},
			{
				no: 19,
				name: "call_grants_updated",
				kind: "message",
				oneof: "eventPayload",
				T: () => pd
			},
			{
				no: 20,
				name: "go_away",
				kind: "message",
				oneof: "eventPayload",
				T: () => md
			},
			{
				no: 21,
				name: "ice_restart",
				kind: "message",
				oneof: "eventPayload",
				T: () => Hu
			},
			{
				no: 22,
				name: "pins_updated",
				kind: "message",
				oneof: "eventPayload",
				T: () => Bu
			},
			{
				no: 23,
				name: "call_ended",
				kind: "message",
				oneof: "eventPayload",
				T: () => hd
			},
			{
				no: 24,
				name: "participant_updated",
				kind: "message",
				oneof: "eventPayload",
				T: () => td
			},
			{
				no: 25,
				name: "participant_migration_complete",
				kind: "message",
				oneof: "eventPayload",
				T: () => zu
			},
			{
				no: 27,
				name: "change_publish_options",
				kind: "message",
				oneof: "eventPayload",
				T: () => Ru
			},
			{
				no: 28,
				name: "inbound_state_notification",
				kind: "message",
				oneof: "eventPayload",
				T: () => gd
			}
		]);
	}
}(), Ru = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ChangePublishOptions", [{
			no: 1,
			name: "publish_options",
			kind: "message",
			repeat: 2,
			T: () => Gl
		}, {
			no: 2,
			name: "reason",
			kind: "scalar",
			T: 9
		}]);
	}
}();
new class extends N {
	constructor() {
		super("stream.video.sfu.event.ChangePublishOptionsComplete", []);
	}
}();
var zu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ParticipantMigrationComplete", []);
	}
}(), Bu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.PinsChanged", [{
			no: 1,
			name: "pins",
			kind: "message",
			repeat: 2,
			T: () => zl
		}]);
	}
}(), Vu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.Error", [{
			no: 4,
			name: "error",
			kind: "message",
			T: () => Xl
		}, {
			no: 5,
			name: "reconnect_strategy",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.WebsocketReconnectStrategy",
				W,
				"WEBSOCKET_RECONNECT_STRATEGY_"
			]
		}]);
	}
}();
new class extends N {
	constructor() {
		super("stream.video.sfu.event.ICETrickle", [{
			no: 1,
			name: "peer_type",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.PeerType",
				H,
				"PEER_TYPE_"
			]
		}, {
			no: 2,
			name: "ice_candidate",
			kind: "scalar",
			T: 9
		}]);
	}
}();
var Hu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ICERestart", [{
			no: 1,
			name: "peer_type",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.PeerType",
				H,
				"PEER_TYPE_"
			]
		}]);
	}
}(), Uu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.SfuRequest", [
			{
				no: 1,
				name: "join_request",
				kind: "message",
				oneof: "requestPayload",
				T: () => Yu
			},
			{
				no: 2,
				name: "health_check_request",
				kind: "message",
				oneof: "requestPayload",
				T: () => Gu
			},
			{
				no: 3,
				name: "leave_call_request",
				kind: "message",
				oneof: "requestPayload",
				T: () => Wu
			}
		]);
	}
}(), Wu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.LeaveCallRequest", [{
			no: 1,
			name: "session_id",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "reason",
			kind: "scalar",
			T: 9
		}]);
	}
}(), Gu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.HealthCheckRequest", []);
	}
}(), Ku = new class extends N {
	constructor() {
		super("stream.video.sfu.event.HealthCheckResponse", [{
			no: 1,
			name: "participant_count",
			kind: "message",
			T: () => Rl
		}]);
	}
}(), qu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.TrackPublished", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 4,
				name: "participant",
				kind: "message",
				T: () => Bl
			}
		]);
	}
}(), Ju = new class extends N {
	constructor() {
		super("stream.video.sfu.event.TrackUnpublished", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 4,
				name: "cause",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackUnpublishReason",
					Al,
					"TRACK_UNPUBLISH_REASON_"
				]
			},
			{
				no: 5,
				name: "participant",
				kind: "message",
				T: () => Bl
			}
		]);
	}
}(), Yu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.JoinRequest", [
			{
				no: 1,
				name: "token",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 13,
				name: "unified_session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "subscriber_sdp",
				kind: "scalar",
				T: 9
			},
			{
				no: 8,
				name: "publisher_sdp",
				kind: "scalar",
				T: 9
			},
			{
				no: 4,
				name: "client_details",
				kind: "message",
				T: () => Zl
			},
			{
				no: 5,
				name: "migration",
				kind: "message",
				T: () => Zu
			},
			{
				no: 6,
				name: "fast_reconnect",
				kind: "scalar",
				T: 8
			},
			{
				no: 7,
				name: "reconnect_details",
				kind: "message",
				T: () => Xu
			},
			{
				no: 9,
				name: "preferred_publish_options",
				kind: "message",
				repeat: 2,
				T: () => Gl
			},
			{
				no: 10,
				name: "preferred_subscribe_options",
				kind: "message",
				repeat: 2,
				T: () => Wl
			},
			{
				no: 11,
				name: "capabilities",
				kind: "enum",
				repeat: 1,
				T: () => [
					"stream.video.sfu.models.ClientCapability",
					Fl,
					"CLIENT_CAPABILITY_"
				]
			},
			{
				no: 12,
				name: "source",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.ParticipantSource",
					El,
					"PARTICIPANT_SOURCE_"
				]
			}
		]);
	}
}(), Xu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ReconnectDetails", [
			{
				no: 1,
				name: "strategy",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.WebsocketReconnectStrategy",
					W,
					"WEBSOCKET_RECONNECT_STRATEGY_"
				]
			},
			{
				no: 3,
				name: "announced_tracks",
				kind: "message",
				repeat: 2,
				T: () => Yl
			},
			{
				no: 4,
				name: "subscriptions",
				kind: "message",
				repeat: 2,
				T: () => Mu
			},
			{
				no: 5,
				name: "reconnect_attempt",
				kind: "scalar",
				T: 13
			},
			{
				no: 6,
				name: "from_sfu_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 7,
				name: "previous_session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 8,
				name: "reason",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), Zu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.Migration", [
			{
				no: 1,
				name: "from_sfu_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "announced_tracks",
				kind: "message",
				repeat: 2,
				T: () => Yl
			},
			{
				no: 3,
				name: "subscriptions",
				kind: "message",
				repeat: 2,
				T: () => Mu
			}
		]);
	}
}(), Qu = new class extends N {
	constructor() {
		super("stream.video.sfu.event.JoinResponse", [
			{
				no: 1,
				name: "call_state",
				kind: "message",
				T: () => Ll
			},
			{
				no: 2,
				name: "reconnected",
				kind: "scalar",
				T: 8
			},
			{
				no: 3,
				name: "fast_reconnect_deadline_seconds",
				kind: "scalar",
				T: 5
			},
			{
				no: 4,
				name: "publish_options",
				kind: "message",
				repeat: 2,
				T: () => Gl
			}
		]);
	}
}(), $u = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ParticipantJoined", [
			{
				no: 1,
				name: "call_cid",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "participant",
				kind: "message",
				T: () => Bl
			},
			{
				no: 3,
				name: "is_pinned",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), ed = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ParticipantLeft", [{
			no: 1,
			name: "call_cid",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "participant",
			kind: "message",
			T: () => Bl
		}]);
	}
}(), td = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ParticipantUpdated", [{
			no: 1,
			name: "call_cid",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "participant",
			kind: "message",
			T: () => Bl
		}]);
	}
}(), nd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.SubscriberOffer", [
			{
				no: 1,
				name: "ice_restart",
				kind: "scalar",
				T: 8
			},
			{
				no: 2,
				name: "sdp",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "negotiation_id",
				kind: "scalar",
				T: 13
			}
		]);
	}
}(), rd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.PublisherAnswer", [{
			no: 1,
			name: "sdp",
			kind: "scalar",
			T: 9
		}]);
	}
}(), id = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ConnectionQualityChanged", [{
			no: 1,
			name: "connection_quality_updates",
			kind: "message",
			repeat: 2,
			T: () => ad
		}]);
	}
}(), ad = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ConnectionQualityInfo", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "connection_quality",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.ConnectionQuality",
					wl,
					"CONNECTION_QUALITY_"
				]
			}
		]);
	}
}(), od = new class extends N {
	constructor() {
		super("stream.video.sfu.event.DominantSpeakerChanged", [{
			no: 1,
			name: "user_id",
			kind: "scalar",
			T: 9
		}, {
			no: 2,
			name: "session_id",
			kind: "scalar",
			T: 9
		}]);
	}
}(), sd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.AudioLevel", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "level",
				kind: "scalar",
				T: 2
			},
			{
				no: 4,
				name: "is_speaking",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), cd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.AudioLevelChanged", [{
			no: 1,
			name: "audio_levels",
			kind: "message",
			repeat: 2,
			T: () => sd
		}]);
	}
}(), ld = new class extends N {
	constructor() {
		super("stream.video.sfu.event.AudioSender", [
			{
				no: 2,
				name: "codec",
				kind: "message",
				T: () => Kl
			},
			{
				no: 3,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 4,
				name: "publish_option_id",
				kind: "scalar",
				T: 5
			}
		]);
	}
}(), ud = new class extends N {
	constructor() {
		super("stream.video.sfu.event.VideoLayerSetting", [
			{
				no: 1,
				name: "name",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "active",
				kind: "scalar",
				T: 8
			},
			{
				no: 3,
				name: "max_bitrate",
				kind: "scalar",
				T: 5
			},
			{
				no: 4,
				name: "scale_resolution_down_by",
				kind: "scalar",
				T: 2
			},
			{
				no: 6,
				name: "codec",
				kind: "message",
				T: () => Kl
			},
			{
				no: 7,
				name: "max_framerate",
				kind: "scalar",
				T: 13
			},
			{
				no: 8,
				name: "scalability_mode",
				kind: "scalar",
				T: 9
			}
		]);
	}
}(), dd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.VideoSender", [
			{
				no: 2,
				name: "codec",
				kind: "message",
				T: () => Kl
			},
			{
				no: 3,
				name: "layers",
				kind: "message",
				repeat: 2,
				T: () => ud
			},
			{
				no: 4,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 5,
				name: "publish_option_id",
				kind: "scalar",
				T: 5
			},
			{
				no: 6,
				name: "degradation_preference",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.DegradationPreference",
					Il,
					"DEGRADATION_PREFERENCE_"
				]
			}
		]);
	}
}(), fd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.ChangePublishQuality", [{
			no: 1,
			name: "audio_senders",
			kind: "message",
			repeat: 2,
			T: () => ld
		}, {
			no: 2,
			name: "video_senders",
			kind: "message",
			repeat: 2,
			T: () => dd
		}]);
	}
}(), pd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.CallGrantsUpdated", [{
			no: 1,
			name: "current_grants",
			kind: "message",
			T: () => iu
		}, {
			no: 2,
			name: "message",
			kind: "scalar",
			T: 9
		}]);
	}
}(), md = new class extends N {
	constructor() {
		super("stream.video.sfu.event.GoAway", [{
			no: 1,
			name: "reason",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.GoAwayReason",
				jl,
				"GO_AWAY_REASON_"
			]
		}]);
	}
}(), hd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.CallEnded", [{
			no: 1,
			name: "reason",
			kind: "enum",
			T: () => [
				"stream.video.sfu.models.CallEndedReason",
				Ml,
				"CALL_ENDED_REASON_"
			]
		}]);
	}
}(), gd = new class extends N {
	constructor() {
		super("stream.video.sfu.event.InboundStateNotification", [{
			no: 1,
			name: "inbound_video_states",
			kind: "message",
			repeat: 2,
			T: () => _d
		}]);
	}
}(), _d = new class extends N {
	constructor() {
		super("stream.video.sfu.event.InboundVideoState", [
			{
				no: 1,
				name: "user_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 2,
				name: "session_id",
				kind: "scalar",
				T: 9
			},
			{
				no: 3,
				name: "track_type",
				kind: "enum",
				T: () => [
					"stream.video.sfu.models.TrackType",
					U,
					"TRACK_TYPE_"
				]
			},
			{
				no: 4,
				name: "paused",
				kind: "scalar",
				T: 8
			}
		]);
	}
}(), G;
(function(e) {
	e.UNKNOWN = "UNKNOWN", e.VISIBLE = "VISIBLE", e.INVISIBLE = "INVISIBLE";
})(G ||= {});
var vd;
(function(e) {
	e[e.IMMEDIATE = 20] = "IMMEDIATE", e[e.FAST = 100] = "FAST", e[e.MEDIUM = 600] = "MEDIUM", e[e.SLOW = 1200] = "SLOW";
})(vd ||= {});
var yd = class {
	_transport;
	typeName = Iu.typeName;
	methods = Iu.methods;
	options = Iu.options;
	constructor(e) {
		this._transport = e;
	}
	setPublisher(e, t) {
		let n = this.methods[0], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	sendAnswer(e, t) {
		let n = this.methods[1], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	iceTrickle(e, t) {
		let n = this.methods[2], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	updateSubscriptions(e, t) {
		let n = this.methods[3], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	updateMuteStates(e, t) {
		let n = this.methods[4], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	iceRestart(e, t) {
		let n = this.methods[5], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	sendStats(e, t) {
		let n = this.methods[6], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	sendMetrics(e, t) {
		let n = this.methods[7], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	startNoiseCancellation(e, t) {
		let n = this.methods[8], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
	stopNoiseCancellation(e, t) {
		let n = this.methods[9], r = this._transport.mergeOptions(t);
		return Tn("unary", this._transport, n, r, e);
	}
}, bd = {
	baseUrl: "",
	sendJson: !0,
	timeout: 5e3,
	jsonOptions: { ignoreUnknownFields: !0 }
}, xd = (e) => ({ interceptUnary(t, n, r, i) {
	return i.meta = {
		...i.meta,
		...e
	}, t(n, r, i);
} }), Sd = "@@stream-io/timeout", Cd = (e, t) => {
	let n = (n) => {
		let r = new AbortController(), i = setTimeout(() => {
			t?.(`${n}Timeout`, [e]);
			let i = /* @__PURE__ */ Error(Sd);
			i.name = "AbortError", r.abort(i);
		}, e);
		return [r.signal, () => clearTimeout(i)];
	};
	return { interceptUnary(e, t, r, i) {
		if (i.abort) return e(t, r, i);
		let [a, o] = n(t.name), s = e(t, r, {
			...i,
			abort: a
		});
		return s.then(o, o), s;
	} };
}, wd = (e, t = "trace") => ({ interceptUnary: (n, r, i, a) => {
	let o = n(r, i, a);
	return e[t](`Invoked SFU RPC method ${r.name}`, {
		request: o.request,
		headers: o.requestHeaders,
		response: o.response
	}), o;
} }), Td = (e) => {
	let t = /* @__PURE__ */ new Set(["SendStats"]), n = /* @__PURE__ */ new Set(["SetPublisher"]), r = (t, n, r) => e(`${t}OnFailure`, [r, n]);
	return { interceptUnary(i, a, o, s) {
		let c = a.name;
		if (t.has(c)) return i(a, o, s);
		let { invocationMeta: { attempt: l = 0 } = {} } = s, u = l === 0 ? c : `${c}(${l})`;
		e(u, o);
		let d = i(a, o, s);
		return d.then((t) => {
			let i = t.response;
			i.error && r(u, o, i.error), n.has(c) && e(`${u}Response`, i);
		}, (e) => r(c, o, e)), d;
	} };
}, Ed = (e) => new yd(new wo({
	...bd,
	...e
})), Dd = (e) => new Promise((t) => setTimeout(t, e)), Od = async (e, t) => {
	let n, r = new Promise((e, r) => {
		n = setTimeout(() => r(/* @__PURE__ */ Error("timebox error")), t);
	});
	try {
		return await Promise.race([Promise.all(e), r]);
	} finally {
		clearTimeout(n);
	}
};
function kd(e) {
	return e && (Object.prototype.toString.call(e) === "[object Function]" || typeof e == "function" || e instanceof Function);
}
var Ad = {
	TOKEN_EXPIRED: 40,
	WS_CLOSED_SUCCESS: 1e3
};
function jd(e) {
	let t = Math.min(500 + e * 2e3, 5e3), n = Math.min(Math.max(250, (e - 1) * 2e3), 5e3);
	return Math.floor(Math.random() * (t - n) + n);
}
function Md(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) t += e[n].toString(16).padStart(2, "0");
	return t;
}
function Nd() {
	let e = Fd(16);
	return e[6] = e[6] & 15 | 64, e[8] = e[8] & 191 | 128, [
		Md(e.subarray(0, 4)),
		Md(e.subarray(4, 6)),
		Md(e.subarray(6, 8)),
		Md(e.subarray(8, 10)),
		Md(e.subarray(10, 16))
	].join("-");
}
var Pd = typeof crypto < "u" && crypto.getRandomValues ? crypto.getRandomValues.bind(crypto) : function(e) {
	let t = 2 ** (8 * e.byteLength / e.length);
	for (let n = 0; n < e.length; n++) e[n] = Math.random() * t;
};
function Fd(e) {
	let t = new Uint8Array(e);
	return Pd(t), t;
}
function Id(e) {
	typeof window < "u" && window.addEventListener && (window.addEventListener("offline", e), window.addEventListener("online", e));
}
function Ld(e) {
	typeof window < "u" && window.removeEventListener && (window.removeEventListener("offline", e), window.removeEventListener("online", e));
}
function Rd(e) {
	return !e.status || e.status < 200 || 300 <= e.status;
}
function zd(e) {
	return e.code !== void 0;
}
var Bd = (e, t, n) => {
	try {
		let r = e(t);
		r && typeof r.then == "function" && Promise.resolve(r).catch((e) => Vd(n, e, t));
	} catch (e) {
		Vd(n, e, t);
	}
}, Vd = (e, t, n) => {
	e.error("Unhandled error in event listener", t, n);
}, K = () => typeof navigator > "u" ? !1 : navigator.product?.toLowerCase() === "reactnative", Hd = (e, t, ...n) => {
	let r;
	switch (e) {
		case "error":
			if (K()) {
				t = `ERROR: ${t}`, r = console.info;
				break;
			}
			r = console.error;
			break;
		case "warn":
			if (K()) {
				t = `WARN: ${t}`, r = console.info;
				break;
			}
			r = console.warn;
			break;
		case "info":
			r = console.info;
			break;
		case "trace":
			r = console.trace;
			break;
		default: r = console.log;
	}
	r(t, ...n);
}, q = Ao(), Ud = async (e, t, n = Infinity) => {
	let r = 0, i;
	do {
		r > 0 && await Dd(jd(r));
		try {
			i = await e({ attempt: r });
		} catch (e) {
			let i = e instanceof vn && e.message !== Sd && e.code === L[L.cancelled], a = t?.aborted ?? !1;
			if (i || a || r + 1 >= n) throw e;
			q.getLogger("sfu-client", { tags: ["rpc"] }).debug(`rpc failed (${r})`, e), r++;
		}
	} while (!i || i.response.error?.shouldRetry);
	return i;
}, Wd = (e, t, n) => {
	if (e.mid) return e.mid;
	if (!n) return String(t);
	let r = e.sender.track, i = (0, ll.parse)(n).media.find((e) => e.type === r.kind && (e.msid?.includes(r.id) ?? !0));
	return i?.mid === void 0 ? t < 0 ? "" : String(t) : String(i.mid);
}, Gd = (e, t, n, r) => {
	let i = Math.min(t, Math.max(300, n * t)), a = (0, ll.parse)(e), o = /* @__PURE__ */ new Set([
		"av1",
		"vp9",
		"h264"
	]);
	for (let e of a.media) if (e.type === "video" && String(e.mid) === r) for (let t of e.rtp) {
		if (!o.has(t.codec.toLowerCase())) continue;
		let n = e.fmtp ??= [], r = n.find((e) => e.payload === t.payload);
		if (r) {
			let e = r.config ?? "";
			e.includes("x-google-start-bitrate") || (r.config = e ? `${e};x-google-start-bitrate=${i}` : `x-google-start-bitrate=${i}`);
		} else n.push({
			payload: t.payload,
			config: `x-google-start-bitrate=${i}`
		});
	}
	return (0, ll.write)(a);
}, Kd = (e, t) => {
	let n = /* @__PURE__ */ new Set(), r = (0, ll.parse)(e);
	for (let e of r.media) {
		if (e.type !== "audio") continue;
		let t = e.rtp.find((e) => e.codec === "opus");
		if (t) for (let r of e.fmtp) r.payload === t.payload && r.config.includes("stereo=1") && n.add(e.mid);
	}
	if (n.size === 0) return t;
	let i = (0, ll.parse)(t);
	for (let e of i.media) {
		if (e.type !== "audio" || !n.has(e.mid)) continue;
		let t = e.rtp.find((e) => e.codec === "opus");
		if (t) for (let n of e.fmtp) n.payload === t.payload && !n.config.includes("stereo=1") && (n.config += ";stereo=1");
	}
	return (0, ll.write)(i);
}, qd = (e, t, n) => {
	let [r, i] = Jd(t).split("/");
	if (!r || !i) return e;
	let a = (0, ll.parse)(e);
	for (let e of a.media) {
		if (e.type !== r) continue;
		let t = /* @__PURE__ */ new Set();
		for (let n of e.rtp) n.codec.toLowerCase() === i && t.add(n.payload);
		if (n) {
			let r = /* @__PURE__ */ new Set(), i = n.split(";");
			for (let n of e.fmtp) {
				let e = new Set(n.config.split(";"));
				t.has(n.payload) && i.every((t) => e.has(t)) && r.add(n.payload);
			}
			t = r;
		}
		if (t.size === 0 && !n) continue;
		for (let n of e.fmtp) {
			let e = /\s*apt\s*=\s*(\d+)\s*/i.exec(n.config);
			if (!e) continue;
			let r = Number(e[1]);
			t.has(r) && t.add(n.payload);
		}
		e.rtp = e.rtp.filter((e) => t.has(e.payload)), e.fmtp = e.fmtp.filter((e) => t.has(e.payload)), e.rtcpFb = e.rtcpFb?.filter((e) => typeof e.payload != "number" || t.has(e.payload));
		let a = [];
		for (let n of (e.payloads || "").split(/\s+/)) {
			let e = Number(n);
			t.has(e) && a.push(e);
		}
		e.payloads = a.join(" ");
	}
	return (0, ll.write)(a);
}, Jd = (e, t = "video") => e.includes("/") ? e : `${t}/${e}`, Yd = async (e, t, n) => {
	let r = new RTCPeerConnection();
	r.addTransceiver("video", { direction: e }), r.addTransceiver("audio", { direction: e });
	let { sdp: i = "" } = await r.createOffer(), a = t ? qd(i, t, n) : i;
	return r.getTransceivers().forEach((e) => {
		e.stop?.();
	}), r.close(), a;
}, Xd = (e) => e ? (e = e.toLowerCase(), e === "vp9" || e === "av1" || e === "video/vp9" || e === "video/av1") : !1, Zd = { dispose: () => Promise.resolve(!0) }, Qd = () => Zd, $d = () => Qd, ef = {
	subscriberOffer: void 0,
	publisherAnswer: void 0,
	connectionQualityChanged: void 0,
	audioLevelChanged: void 0,
	iceTrickle: void 0,
	changePublishQuality: void 0,
	participantJoined: void 0,
	participantLeft: void 0,
	dominantSpeakerChanged: void 0,
	joinResponse: void 0,
	healthCheckResponse: void 0,
	trackPublished: void 0,
	trackUnpublished: void 0,
	error: void 0,
	callGrantsUpdated: void 0,
	goAway: void 0,
	iceRestart: void 0,
	pinsUpdated: void 0,
	callEnded: void 0,
	participantUpdated: void 0,
	participantMigrationComplete: void 0,
	changePublishOptions: void 0,
	inboundStateNotification: void 0
}, tf = (e) => Object.prototype.hasOwnProperty.call(ef, e), nf = class {
	logger = q.getLogger("Dispatcher");
	subscribers = /* @__PURE__ */ new Map();
	dispatch = (e, t = "*") => {
		let n = e.eventPayload.oneofKind;
		if (!n) return;
		let r = e.eventPayload[n];
		this.logger.debug(`Dispatching ${n}, tag=${t}`, r);
		let i = this.subscribers.get(n);
		if (!i) return;
		let { byTag: a, dynamic: o } = i;
		this.emit(r, a.get(t)), t !== "*" && this.emit(r, a.get("*")), this.emitDynamic(r, t, o);
	};
	emit = (e, t = []) => {
		for (let n of t) this.emitOne(e, n);
	};
	emitDynamic = (e, t, n) => {
		for (let { tagSelector: r, listener: i } of n) {
			let n = r();
			(n === t || t !== "*" && n === "*") && this.emitOne(e, i);
		}
	};
	emitOne = (e, t) => {
		try {
			t(e);
		} catch (e) {
			this.logger.warn("Listener failed with error", e);
		}
	};
	on = (e, t, n) => {
		let { byTag: r, dynamic: i } = this.getHandlers(e), a = n;
		if (typeof t == "string") {
			let e = r.get(t) ?? [];
			e.push(a), r.set(t, e);
		} else i.push({
			tagSelector: t,
			listener: a
		});
		return () => {
			this.off(e, t, n);
		};
	};
	off = (e, t, n) => {
		let r = this.subscribers.get(e);
		if (!r) return;
		let { byTag: i, dynamic: a } = r;
		if (typeof t == "string") {
			let e = i.get(t) || [], r = e.indexOf(n);
			r >= 0 && e.splice(r, 1);
		} else {
			let e = a.findIndex(({ tagSelector: e, listener: r }) => e === t && r === n);
			e >= 0 && a.splice(e, 1);
		}
	};
	getHandlers = (e) => {
		let t = this.subscribers.get(e);
		if (t) return t;
		let n = {
			byTag: /* @__PURE__ */ new Map(),
			dynamic: []
		};
		return this.subscribers.set(e, n), n;
	};
}, rf = class extends Error {
	error;
	constructor(e) {
		super(e.message), this.name = "NegotiationError", this.error = e;
	}
}, af = (e) => {
	if (!e.usernameFragment) {
		let t = cf(e.candidate);
		return JSON.stringify({
			...e,
			usernameFragment: t
		});
	}
	return JSON.stringify(e.toJSON());
}, of = (e) => e?.match(/^a=ice-ufrag:(\S+)/m)?.[1], sf = (e) => e.usernameFragment ?? cf(e.candidate), cf = (e) => {
	let t = e?.split(" ") ?? [], n = t.indexOf("ufrag");
	return n === -1 ? void 0 : t[n + 1];
}, lf = (e, t) => {
	t && q.getLogger("helpers").warn(t, e);
}, uf = class {
	subscriber = new df();
	publisher = new df();
	push = (e) => {
		let t = ff(e);
		if (!t) return;
		let { peerType: n } = e;
		switch (n) {
			case H.SUBSCRIBER:
				this.subscriber.push(t);
				break;
			case H.PUBLISHER_UNSPECIFIED:
				this.publisher.push(t);
				break;
			default: lf(n, "ICETrickle, Unknown peer type");
		}
	};
	updateActiveGeneration = (e, t) => {
		let n = of(t);
		switch (e) {
			case H.SUBSCRIBER:
				this.subscriber.updateActiveGeneration(n);
				break;
			case H.PUBLISHER_UNSPECIFIED:
				this.publisher.updateActiveGeneration(n);
				break;
			default: lf(e, "updateActiveGeneration, Unknown peer type");
		}
	};
	dispose = () => {
		this.subscriber.dispose(), this.publisher.dispose();
	};
}, df = class {
	store = [];
	live = new As();
	seenUfrags = /* @__PURE__ */ new Set();
	activeUfrag;
	candidates = new xs((e) => {
		for (let t of this.store.slice()) this.isCurrent(t) && e.next(t);
		let t = this.live.subscribe((t) => {
			this.isCurrent(t) && e.next(t);
		});
		return () => t.unsubscribe();
	});
	push = (e) => {
		this.store.push(e), this.live.next(e);
	};
	updateActiveGeneration = (e) => {
		e && this.seenUfrags.add(e), this.activeUfrag = e;
		for (let e = this.store.length - 1; e >= 0; e--) {
			let t = sf(this.store[e]);
			t && t !== this.activeUfrag && this.seenUfrags.has(t) && this.store.splice(e, 1);
		}
	};
	dispose = () => {
		this.store.length = 0, this.live.complete();
	};
	isCurrent = (e) => {
		let t = sf(e);
		return !t || !this.activeUfrag || t === this.activeUfrag;
	};
}, ff = (e) => {
	try {
		return JSON.parse(e.iceCandidate);
	} catch (t) {
		q.getLogger("sfu-client").error("Failed to parse ICE Trickle", t, e);
		return;
	}
}, [pf, mf, hf] = "1.62.0".split("."), gf = {
	type: kl.PLAIN_JAVASCRIPT,
	major: pf,
	minor: mf,
	patch: hf
}, _f, vf, yf = { oneofKind: void 0 }, bf = () => gf, xf = () => yf, Sf = async () => {
	if (K()) return {
		sdk: gf,
		os: _f,
		device: vf,
		webrtcVersion: ""
	};
	let e = navigator.userAgentData, t;
	if (e && e.getHighEntropyValues) try {
		t = await e.getHighEntropyValues([
			"platform",
			"platformVersion",
			"fullVersionList"
		]);
	} catch {}
	let { browser: n, os: r, device: i, cpu: a } = new ul.UAParser(navigator.userAgent).getResult(), o = t?.fullVersionList?.find((e) => !e.brand.includes("Chromium") && !e.brand.match(/[()\-./:;=?_]/g)), s = o?.version || n.version || "";
	return {
		sdk: gf,
		browser: {
			name: o?.brand || n.name || navigator.userAgent,
			version: s
		},
		os: {
			name: t?.platform || r.name || "",
			version: t?.platformVersion || r.version || "",
			architecture: a.architecture || ""
		},
		device: {
			name: [
				i.vendor,
				i.model,
				i.type
			].filter(Boolean).join(" "),
			version: ""
		},
		webrtcVersion: s
	};
}, Cf = () => typeof navigator > "u" ? !1 : /^((?!chrome|android).)*safari/i.test(navigator.userAgent || ""), wf = () => {
	if (typeof navigator > "u") return !1;
	let e = navigator.userAgent || "";
	return /AppleWebKit\//.test(e) ? !/Chrome\/|Chromium\/|Android/.test(e) : !1;
}, Tf = () => typeof navigator > "u" ? !1 : navigator.userAgent?.includes("Firefox"), Ef = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	isChrome: () => typeof navigator > "u" ? !1 : navigator.userAgent?.includes("Chrome"),
	isFirefox: Tf,
	isSafari: Cf,
	isSupportedBrowser: async () => {
		let { browser: e } = await Sf();
		if (!e) return !1;
		let t = e.name.toLowerCase(), [n] = e.version.split("."), r = parseInt(n, 10);
		return t.includes("chrome") && r >= 136 || t.includes("edge") && r >= 136 || t.includes("firefox") && r >= 137 || t.includes("safari") && r >= 18 || t.includes("webkit") && r >= 605 || t.includes("webview") && r >= 136;
	},
	isWebKit: wf
}), J = Mf(Nf), Df = Mf(Pf), Of = /* @__PURE__ */ new Map();
function kf(e) {
	let t;
	return (...n) => {
		if (t) return t;
		let r = e(...n).finally(() => {
			t === r && (t = void 0);
		});
		return t = r, r;
	};
}
function Af(e) {
	return Of.has(e);
}
async function jf(e) {
	let t;
	for (; t = Of.get(e);) await t.promise;
}
function Mf(e) {
	return function(t, n) {
		let { cb: r, onContinued: i } = e(t, n), a = Of.get(t);
		a?.onContinued();
		let o = a ? a.promise.then(r, r) : r();
		return Of.set(t, {
			promise: o,
			onContinued: i
		}), o;
	};
}
function Nf(e, t) {
	let n = !1;
	return {
		cb: () => t().finally(() => {
			n || Of.delete(e);
		}),
		onContinued: () => n = !0
	};
}
function Pf(e, t) {
	let n = new AbortController();
	return {
		cb: () => n.signal.aborted ? Promise.resolve("canceled") : t(n.signal).finally(() => {
			n.signal.aborted || Of.delete(e);
		}),
		onContinued: () => n.abort()
	};
}
var Ff = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n of e) if (!t.includes(n)) return !1;
	for (let n of t) if (!e.includes(n)) return !1;
	return !0;
}, If = (e) => typeof e == "function", Y = (e) => {
	let t, n;
	if (Nc([e]).subscribe({
		next: ([e]) => {
			t = e;
		},
		error: (e) => {
			n = e;
		}
	}).unsubscribe(), n) throw n;
	return t;
}, X = (e, t) => {
	let n = If(t) ? t(Y(e)) : t;
	return e.next(n), n;
}, Lf = async (e, t) => J(e, async () => {
	let n = await t(Y(e));
	return e.next(n), n;
}), Rf = (e, t) => {
	let n = e.getValue();
	return {
		lastValue: n,
		value: X(e, t),
		rollback: () => X(e, n)
	};
}, zf = (e, t, n = (e) => q.getLogger("RxUtils").warn("An observable emitted an error", e)) => {
	let r = e.subscribe({
		next: t,
		error: n
	});
	return () => {
		r.unsubscribe();
	};
}, Bf = (e, t) => {
	let n = Symbol();
	return zf(e, (e) => {
		J(n, () => t(e));
	});
}, Vf = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	createSafeAsyncSubscription: Bf,
	createSubscription: zf,
	getCurrentValue: Y,
	isShallowArrayEqual: Ff,
	setCurrentValue: X,
	setCurrentValueAsync: Lf,
	updateValue: Rf
}), Z;
(function(e) {
	e.UNKNOWN = "unknown", e.IDLE = "idle", e.RINGING = "ringing", e.JOINING = "joining", e.JOINED = "joined", e.LEFT = "left", e.RECONNECTING = "reconnecting", e.MIGRATING = "migrating", e.RECONNECTING_FAILED = "reconnecting-failed", e.OFFLINE = "offline";
})(Z ||= {});
var Hf = class {
	connectedUserSubject = new z(void 0);
	callsSubject = new z([]);
	constructor() {
		this.connectedUserSubject.subscribe(async (e) => {
			if (!e) {
				let e = q.getLogger("client-state");
				for (let t of this.calls) t.state.callingState !== Z.LEFT && (e.info(`User disconnected, leaving call: ${t.cid}`), await t.leave({ message: "client.disconnectUser() called" }).catch((n) => {
					e.error(`Error leaving call: ${t.cid}`, n);
				}));
			}
		});
	}
	get connectedUser() {
		return this.connectedUserSubject.getValue();
	}
	setConnectedUser = (e) => X(this.connectedUserSubject, e);
	get calls() {
		return Y(this.callsSubject);
	}
	setCalls = (e) => X(this.callsSubject, e);
	registerCall = (e) => {
		this.calls.find((t) => t.cid === e.cid) || this.setCalls((t) => [...t, e]);
	};
	registerOrUpdateCall = (e) => this.calls.find((t) => t.cid === e.cid) ? this.setCalls((t) => t.map((t) => t.cid === e.cid ? e : t)) : this.registerCall(e);
	unregisterCall = (e) => (q.getLogger("client-state").trace(`Unregistering call: ${e.cid}`), this.setCalls((t) => t.filter((t) => t !== e)));
	findCall = (e, t) => this.calls.find((n) => n.type === e && n.id === t);
}, Uf = class {
	connectedUser$;
	calls$;
	constructor(e) {
		this.connectedUser$ = e.connectedUserSubject.asObservable(), this.calls$ = e.callsSubject.asObservable();
	}
	get connectedUser() {
		return Y(this.connectedUser$);
	}
	get calls() {
		return Y(this.calls$);
	}
}, Wf = (...e) => (t, n) => {
	for (let r of e) {
		let e = r(t, n);
		if (e !== 0) return e;
	}
	return 0;
}, Gf = (e) => (t) => (n, r) => e(n, r) ? t(n, r) : 0, Kf = (e) => e.publishedTracks.includes(U.VIDEO), qf = (e) => e.publishedTracks.includes(U.AUDIO), Jf = (e) => e.publishedTracks.includes(U.SCREEN_SHARE), Yf = (e) => e.publishedTracks.includes(U.SCREEN_SHARE_AUDIO), Xf = (e) => !!e.pin && (e.pin.isLocalPin || e.pin.pinnedAt > 0), Zf = (e, t) => {
	if (!e.pausedTracks) return !1;
	let n = t === "videoTrack" ? U.VIDEO : t === "screenShareTrack" ? U.SCREEN_SHARE : void 0;
	return n ? e.pausedTracks.includes(n) : !1;
}, Qf = (e, t) => e.isDominantSpeaker && !t.isDominantSpeaker ? -1 : !e.isDominantSpeaker && t.isDominantSpeaker ? 1 : 0, $f = (e, t) => e.isSpeaking && !t.isSpeaking ? -1 : !e.isSpeaking && t.isSpeaking ? 1 : 0, ep = (e, t) => {
	let n = Jf(e), r = Jf(t);
	return n && !r ? -1 : !n && r ? 1 : 0;
}, tp = (e, t) => {
	let n = Kf(e), r = Kf(t);
	return n && !r ? -1 : !n && r ? 1 : 0;
}, np = (e, t) => {
	let n = qf(e), r = qf(t);
	return n && !r ? -1 : !n && r ? 1 : 0;
}, rp = (e, t) => {
	let n = e.publishedTracks.length > 0, r = t.publishedTracks.length > 0;
	return n && !r ? -1 : !n && r ? 1 : 0;
}, ip = (e, t) => {
	if (e.pin && t.pin) {
		if (!e.pin.isLocalPin && t.pin.isLocalPin) return -1;
		if (e.pin.isLocalPin && !t.pin.isLocalPin) return 1;
		if (e.pin.pinnedAt > t.pin.pinnedAt) return -1;
		if (e.pin.pinnedAt < t.pin.pinnedAt) return 1;
	}
	return e.pin && !t.pin ? -1 : !e.pin && t.pin ? 1 : 0;
}, ap = (...e) => {
	let t = (e) => e === -1 ? 2 ** 53 - 1 : e;
	return (n, r) => {
		let i = t(e.indexOf(n.source)), a = t(e.indexOf(r.source));
		return i < a ? -1 : +(i > a);
	};
}, op = (e) => (t, n) => t.reaction?.type === e && n.reaction?.type !== e ? -1 : +(t.reaction?.type !== e && n.reaction?.type === e), sp = (...e) => (t, n) => {
	let r = lp(t, e), i = lp(n, e);
	return r && !i ? -1 : !r && i ? 1 : 0;
}, cp = (e, t) => e.name < t.name ? -1 : +(e.name > t.name), lp = (e, t) => (e.roles || []).some((e) => t.includes(e)), up = Gf((e, t) => e.viewportVisibilityState?.videoTrack === G.INVISIBLE || t.viewportVisibilityState?.videoTrack === G.INVISIBLE), dp = Gf((e, t) => e.viewportVisibilityState?.videoTrack === G.INVISIBLE || e.viewportVisibilityState?.videoTrack === G.UNKNOWN || t.viewportVisibilityState?.videoTrack === G.INVISIBLE || t.viewportVisibilityState?.videoTrack === G.UNKNOWN), fp = ap(El.RTMP, El.SRT, El.WHIP, El.RTSP), pp = Wf(ep, ip, rp, up(Wf(Qf, $f, op("raised-hand"), tp, np))), mp = Wf(ep, ip, Qf, rp, up(Wf($f, op("raised-hand"), fp, tp, np))), hp = Wf(ip, dp(Wf(Qf, $f, op("raised-hand"), fp, tp, np))), gp = Wf(rp, dp(Wf(Qf, $f, op("raised-hand"), fp, tp, np)), sp("admin", "host", "speaker")), _p = {
	broadcasting: !1,
	hls: {
		playlist_url: "",
		status: ""
	},
	rtmps: []
}, vp = class {
	backstageSubject = new z(!0);
	blockedUserIdsSubject = new z([]);
	createdAtSubject = new z(/* @__PURE__ */ new Date());
	endedAtSubject = new z(void 0);
	startsAtSubject = new z(void 0);
	updatedAtSubject = new z(/* @__PURE__ */ new Date());
	createdBySubject = new z(void 0);
	customSubject = new z({});
	egressSubject = new z(void 0);
	ingressSubject = new z(void 0);
	recordingSubject = new z(!1);
	individualRecordingSubject = new z(!1);
	rawRecordingSubject = new z(!1);
	sessionSubject = new z(void 0);
	settingsSubject = new z(void 0);
	transcribingSubject = new z(!1);
	captioningSubject = new z(!1);
	e2eeEnabledSubject = new z(!1);
	endedBySubject = new z(void 0);
	thumbnailsSubject = new z(void 0);
	membersSubject = new z([]);
	ownCapabilitiesSubject = new z([]);
	callingStateSubject = new z(Z.UNKNOWN);
	startedAtSubject = new z(void 0);
	participantCountSubject = new z(0);
	anonymousParticipantCountSubject = new z(0);
	participantsSubject = new z([]);
	callStatsReportSubject = new z(void 0);
	closedCaptionsSubject = new z([]);
	orphanedTracks = [];
	callGrantsSubject = new Ns(1);
	startedAt$;
	participantCount$;
	anonymousParticipantCount$;
	rawParticipants$;
	participants$;
	remoteParticipants$;
	localParticipant$;
	pinnedParticipants$;
	dominantSpeaker$;
	hasOngoingScreenShare$;
	callStatsReport$;
	members$;
	ownCapabilities$;
	callingState$;
	backstage$;
	blockedUserIds$;
	createdAt$;
	endedAt$;
	startsAt$;
	updatedAt$;
	createdBy$;
	custom$;
	egress$;
	ingress$;
	recording$;
	individualRecording$;
	rawRecording$;
	session$;
	settings$;
	transcribing$;
	captioning$;
	e2eeEnabled$;
	endedBy$;
	thumbnails$;
	closedCaptions$;
	logger = q.getLogger("CallState");
	sortParticipantsBy = pp;
	closedCaptionsSettings;
	closedCaptionsTasks = /* @__PURE__ */ new Map();
	eventHandlers;
	constructor() {
		this.rawParticipants$ = this.participantsSubject.asObservable().pipe(il({
			bufferSize: 1,
			refCount: !0
		})), this.participants$ = this.participantsSubject.asObservable().pipe(B((e) => e.sort(this.sortParticipantsBy)), il({
			bufferSize: 1,
			refCount: !0
		})), this.localParticipant$ = this.participants$.pipe(B((e) => e.find((e) => e.isLocalParticipant)), il({
			bufferSize: 1,
			refCount: !0
		})), this.remoteParticipants$ = this.participants$.pipe(B((e) => e.filter((e) => !e.isLocalParticipant)), il({
			bufferSize: 1,
			refCount: !0
		})), this.pinnedParticipants$ = this.participants$.pipe(B((e) => e.filter((e) => !!e.pin)), il({
			bufferSize: 1,
			refCount: !0
		})), this.dominantSpeaker$ = this.participants$.pipe(B((e) => e.find((e) => e.isDominantSpeaker)), il({
			bufferSize: 1,
			refCount: !0
		})), this.hasOngoingScreenShare$ = this.participants$.pipe(B((e) => e.some((e) => Jf(e))), V(), il({
			bufferSize: 1,
			refCount: !0
		})), this.createdAt$ = this.createdAtSubject.asObservable(), this.endedAt$ = this.endedAtSubject.asObservable(), this.startsAt$ = this.startsAtSubject.asObservable(), this.startedAt$ = this.startedAtSubject.asObservable(), this.updatedAt$ = this.updatedAtSubject.asObservable(), this.callStatsReport$ = this.callStatsReportSubject.asObservable(), this.members$ = this.membersSubject.asObservable(), this.createdBy$ = this.createdBySubject.asObservable(), this.custom$ = this.customSubject.asObservable(), this.egress$ = this.egressSubject.asObservable(), this.ingress$ = this.ingressSubject.asObservable(), this.session$ = this.sessionSubject.asObservable(), this.settings$ = this.settingsSubject.asObservable(), this.endedBy$ = this.endedBySubject.asObservable(), this.thumbnails$ = this.thumbnailsSubject.asObservable(), this.closedCaptions$ = this.closedCaptionsSubject.asObservable();
		let e = (e, t) => e.pipe(V(t));
		this.anonymousParticipantCount$ = e(this.anonymousParticipantCountSubject), this.blockedUserIds$ = e(this.blockedUserIdsSubject, Ff), this.backstage$ = e(this.backstageSubject), this.callingState$ = e(this.callingStateSubject), this.ownCapabilities$ = Nc([this.ownCapabilitiesSubject, this.callGrantsSubject.pipe(al(void 0))]).pipe(B(([e, t]) => {
			if (!t) return e;
			let { canPublishAudio: n, canPublishVideo: r, canScreenshare: i } = t, a = {
				[hl.SEND_AUDIO]: n,
				[hl.SEND_VIDEO]: r,
				[hl.SCREENSHARE]: i
			}, o = [...e];
			for (let e in a) {
				let t = e, n = a[t];
				if (n && !o.includes(t)) o.push(t);
				else if (!n && o.includes(t)) {
					let e = o.indexOf(t);
					o.splice(e, 1);
				}
			}
			return o;
		}), V(Ff), il({
			bufferSize: 1,
			refCount: !0
		})), this.participantCount$ = e(this.participantCountSubject), this.recording$ = e(this.recordingSubject), this.individualRecording$ = e(this.individualRecordingSubject), this.rawRecording$ = e(this.rawRecordingSubject), this.transcribing$ = e(this.transcribingSubject), this.captioning$ = e(this.captioningSubject), this.e2eeEnabled$ = e(this.e2eeEnabledSubject), this.eventHandlers = {
			"call.frame_recording_ready": void 0,
			"call.kicked_user": void 0,
			"call.moderation_blur": void 0,
			"call.moderation_warning": void 0,
			"call.permission_request": void 0,
			"call.recording_ready": void 0,
			"call.rtmp_broadcast_failed": void 0,
			"call.rtmp_broadcast_started": void 0,
			"call.rtmp_broadcast_stopped": void 0,
			"call.stats_report_ready": void 0,
			"call.transcription_ready": void 0,
			"call.user_feedback_submitted": void 0,
			"call.user_muted": void 0,
			"connection.error": void 0,
			"connection.ok": void 0,
			"health.check": void 0,
			"user.updated": void 0,
			custom: void 0,
			"call.accepted": (e) => this.updateFromCallResponse(e.call),
			"call.blocked_user": this.blockUser,
			"call.closed_caption": this.updateFromClosedCaptions,
			"call.closed_captions_failed": () => {
				this.setCurrentValue(this.captioningSubject, !1);
			},
			"call.closed_captions_started": () => {
				this.setCurrentValue(this.captioningSubject, !0);
			},
			"call.closed_captions_stopped": () => {
				this.setCurrentValue(this.captioningSubject, !1);
			},
			"call.created": (e) => this.updateFromCallResponse(e.call),
			"call.deleted": (e) => this.updateFromCallResponse(e.call),
			"call.ended": (e) => {
				this.updateFromCallResponse(e.call), this.setCurrentValue(this.endedBySubject, e.user);
			},
			"call.frame_recording_failed": (e) => {
				this.updateFromCallResponse(e.call);
			},
			"call.frame_recording_started": (e) => {
				this.updateFromCallResponse(e.call);
			},
			"call.frame_recording_stopped": (e) => {
				this.updateFromCallResponse(e.call);
			},
			"call.hls_broadcasting_failed": this.updateFromHLSBroadcastingFailed,
			"call.hls_broadcasting_started": (e) => {
				this.updateFromCallResponse(e.call);
			},
			"call.hls_broadcasting_stopped": this.updateFromHLSBroadcastStopped,
			"call.live_started": (e) => this.updateFromCallResponse(e.call),
			"call.member_added": this.updateFromMemberAdded,
			"call.member_removed": this.updateFromMemberRemoved,
			"call.member_updated_permission": this.updateMembers,
			"call.member_updated": this.updateMembers,
			"call.notification": (e) => {
				this.updateFromCallResponse(e.call), this.setMembers(e.members);
			},
			"call.permissions_updated": this.updateOwnCapabilities,
			"call.reaction_new": this.updateParticipantReaction,
			"call.recording_started": (e) => {
				this.updateFromRecordingEvent(e.recording_type, !0);
			},
			"call.recording_stopped": (e) => {
				this.updateFromRecordingEvent(e.recording_type, !1);
			},
			"call.recording_failed": (e) => {
				this.updateFromRecordingEvent(e.recording_type, !1);
			},
			"call.rejected": (e) => this.updateFromCallResponse(e.call),
			"call.ring": (e) => this.updateFromCallResponse(e.call),
			"call.missed": (e) => this.updateFromCallResponse(e.call),
			"call.session_ended": (e) => this.updateFromCallResponse(e.call),
			"call.session_participant_count_updated": this.updateFromSessionParticipantCountUpdate,
			"call.session_participant_joined": this.updateFromSessionParticipantJoined,
			"call.session_participant_left": this.updateFromSessionParticipantLeft,
			"call.session_started": (e) => this.updateFromCallResponse(e.call),
			"call.transcription_started": () => {
				this.setCurrentValue(this.transcribingSubject, !0);
			},
			"call.transcription_stopped": () => {
				this.setCurrentValue(this.transcribingSubject, !1);
			},
			"call.transcription_failed": () => {
				this.setCurrentValue(this.transcribingSubject, !1);
			},
			"call.unblocked_user": this.unblockUser,
			"call.updated": (e) => this.updateFromCallResponse(e.call)
		};
	}
	dispose = () => {
		for (let [e, t] of this.closedCaptionsTasks.entries()) clearTimeout(t), this.closedCaptionsTasks.delete(e);
		this.removeAllOrphanedTracks();
	};
	setSortParticipantsBy = (e) => {
		this.sortParticipantsBy = e, this.setCurrentValue(this.participantsSubject, (e) => e);
	};
	getSortParticipantsBy = () => this.sortParticipantsBy;
	getCurrentValue = Y;
	setCurrentValue = X;
	get participantCount() {
		return this.getCurrentValue(this.participantCount$);
	}
	setParticipantCount = (e) => this.setCurrentValue(this.participantCountSubject, e);
	get startedAt() {
		return this.getCurrentValue(this.startedAt$);
	}
	setStartedAt = (e) => this.setCurrentValue(this.startedAtSubject, e);
	get captioning() {
		return this.getCurrentValue(this.captioning$);
	}
	setCaptioning = (e) => Rf(this.captioningSubject, e);
	get anonymousParticipantCount() {
		return this.getCurrentValue(this.anonymousParticipantCount$);
	}
	setAnonymousParticipantCount = (e) => this.setCurrentValue(this.anonymousParticipantCountSubject, e);
	get participants() {
		return this.getCurrentValue(this.participants$);
	}
	get rawParticipants() {
		return this.getCurrentValue(this.rawParticipants$);
	}
	getParticipantsSnapshot = () => this.participantsSubject.getValue();
	setParticipants = (e) => this.setCurrentValue(this.participantsSubject, e);
	get localParticipant() {
		return this.getCurrentValue(this.localParticipant$);
	}
	get remoteParticipants() {
		return this.getCurrentValue(this.remoteParticipants$);
	}
	get dominantSpeaker() {
		return this.getCurrentValue(this.dominantSpeaker$);
	}
	get pinnedParticipants() {
		return this.getCurrentValue(this.pinnedParticipants$);
	}
	get hasOngoingScreenShare() {
		return this.getCurrentValue(this.hasOngoingScreenShare$);
	}
	get callingState() {
		return this.getCurrentValue(this.callingState$);
	}
	setCallingState = (e) => this.setCurrentValue(this.callingStateSubject, e);
	get callStatsReport() {
		return this.getCurrentValue(this.callStatsReport$);
	}
	get isCallStatsReportObserved() {
		return this.callStatsReportSubject.observed;
	}
	setCallStatsReport = (e) => this.setCurrentValue(this.callStatsReportSubject, e);
	get members() {
		return this.getCurrentValue(this.members$);
	}
	setMembers = (e) => {
		this.setCurrentValue(this.membersSubject, e);
	};
	get ownCapabilities() {
		return this.getCurrentValue(this.ownCapabilities$);
	}
	setOwnCapabilities = (e) => this.setCurrentValue(this.ownCapabilitiesSubject, e);
	setCallGrants = (e) => this.setCurrentValue(this.callGrantsSubject, e);
	get backstage() {
		return this.getCurrentValue(this.backstage$);
	}
	setBackstage = (e) => this.setCurrentValue(this.backstageSubject, e);
	get blockedUserIds() {
		return this.getCurrentValue(this.blockedUserIds$);
	}
	get createdAt() {
		return this.getCurrentValue(this.createdAt$);
	}
	get endedAt() {
		return this.getCurrentValue(this.endedAt$);
	}
	setEndedAt = (e) => this.setCurrentValue(this.endedAtSubject, e);
	get startsAt() {
		return this.getCurrentValue(this.startsAt$);
	}
	get updatedAt() {
		return this.getCurrentValue(this.updatedAt$);
	}
	get createdBy() {
		return this.getCurrentValue(this.createdBy$);
	}
	get custom() {
		return this.getCurrentValue(this.custom$);
	}
	get egress() {
		return this.getCurrentValue(this.egress$);
	}
	get ingress() {
		return this.getCurrentValue(this.ingress$);
	}
	get recording() {
		return this.getCurrentValue(this.recording$);
	}
	get individualRecording() {
		return this.getCurrentValue(this.individualRecording$);
	}
	get rawRecording() {
		return this.getCurrentValue(this.rawRecording$);
	}
	get session() {
		return this.getCurrentValue(this.session$);
	}
	get settings() {
		return this.getCurrentValue(this.settings$);
	}
	get transcribing() {
		return this.getCurrentValue(this.transcribing$);
	}
	get e2eeEnabled() {
		return this.getCurrentValue(this.e2eeEnabled$);
	}
	get endedBy() {
		return this.getCurrentValue(this.endedBy$);
	}
	get thumbnails() {
		return this.getCurrentValue(this.thumbnails$);
	}
	get closedCaptions() {
		return this.getCurrentValue(this.closedCaptions$);
	}
	findParticipantBySessionId = (e) => this.participants.find((t) => t.sessionId === e);
	getParticipantLookupBySessionId = () => this.participants.reduce((e, t) => (e[t.sessionId] = t, e), {});
	updateParticipant = (e, t) => {
		let n = this.findParticipantBySessionId(e);
		if (!n) {
			this.logger.debug(`Participant with sessionId ${e} not found`);
			return;
		}
		let r = typeof t == "function" ? t(n) : t, i = {
			...n,
			...r
		};
		return this.setParticipants((t) => t.map((t) => t.sessionId === e ? i : t));
	};
	updateOrAddParticipant = (e, t, n) => this.setParticipants((r) => {
		let i = !0, a = r.map((r) => {
			if (r.sessionId === e) {
				i = !1;
				let e = {
					...r,
					...t
				}, a = typeof n == "function" ? n(e) : n;
				return Object.assign(e, a);
			}
			return r;
		});
		return i && a.push(t), a;
	});
	updateParticipants = (e) => Object.keys(e).length === 0 ? this.participants : this.setParticipants((t) => t.map((t) => {
		let n = e[t.sessionId];
		return n ? {
			...t,
			...n
		} : t;
	}));
	updateParticipantTracks = (e, t) => this.updateParticipants(Object.entries(t).reduce((t, [n, r]) => {
		r.dimension && (r.dimension.height = Math.ceil(r.dimension.height), r.dimension.width = Math.ceil(r.dimension.width));
		let i = e === "videoTrack" ? "videoDimension" : e === "screenShareTrack" ? "screenShareDimension" : void 0;
		return i && (t[n] = { [i]: r.dimension }), t;
	}, {}));
	updateFromEvent = (e) => {
		let t = this.eventHandlers[e.type];
		t && t(e);
	};
	setServerSidePins = (e) => {
		let t = Date.now(), n = Symbol("unknown"), r = e.reduce((r, i, a) => {
			let o = t + (e.length - a);
			return r[i.userId] ? r[i.userId] = n : r[i.userId] = o, r[i.sessionId] ??= o, r;
		}, {});
		return this.setParticipants((e) => e.map((e) => {
			let t = r[e.sessionId] ?? r[e.userId];
			return typeof t == "number" && typeof e.pin?.pinnedAt != "number" ? {
				...e,
				pin: {
					isLocalPin: !1,
					pinnedAt: t
				}
			} : typeof t != "number" && e.pin?.isLocalPin === !1 ? {
				...e,
				pin: void 0
			} : e;
		}));
	};
	registerOrphanedTrack = (e) => {
		this.orphanedTracks.push(e);
	};
	removeOrphanedTrack = (e) => {
		this.orphanedTracks = this.orphanedTracks.filter((t) => t.id !== e);
	};
	removeAllOrphanedTracks = () => {
		this.orphanedTracks = [];
	};
	takeOrphanedTracks = (e) => {
		let t = this.orphanedTracks.filter((t) => t.trackLookupPrefix === e);
		return t.length > 0 && (this.orphanedTracks = this.orphanedTracks.filter((t) => t.trackLookupPrefix !== e)), t;
	};
	updateClosedCaptionSettings = (e) => {
		this.closedCaptionsSettings = {
			...this.closedCaptionsSettings,
			...e
		};
	};
	updateFromCallResponse = (e) => {
		this.setBackstage(e.backstage), this.setCurrentValue(this.blockedUserIdsSubject, e.blocked_user_ids), this.setCurrentValue(this.createdAtSubject, new Date(e.created_at)), this.setCurrentValue(this.updatedAtSubject, new Date(e.updated_at)), this.setCurrentValue(this.startsAtSubject, e.starts_at ? new Date(e.starts_at) : void 0), this.setEndedAt(e.ended_at ? new Date(e.ended_at) : void 0), this.setCurrentValue(this.createdBySubject, e.created_by), this.setCurrentValue(this.customSubject, e.custom), this.setCurrentValue(this.egressSubject, e.egress), this.setCurrentValue(this.ingressSubject, e.ingress);
		let { individual_recording: t, composite_recording: n, raw_recording: r } = e.egress;
		this.setCurrentValue(this.recordingSubject, e.recording || n?.status === "running"), this.setCurrentValue(this.individualRecordingSubject, t?.status === "running"), this.setCurrentValue(this.rawRecordingSubject, r?.status === "running");
		let i = this.setCurrentValue(this.sessionSubject, e.session);
		this.updateParticipantCountFromSession(i), this.setCurrentValue(this.settingsSubject, e.settings), this.setCurrentValue(this.transcribingSubject, e.transcribing), this.setCurrentValue(this.captioningSubject, e.captioning), this.setCurrentValue(this.thumbnailsSubject, e.thumbnails);
	};
	updateFromRingState = (e) => {
		this.setCurrentValue(this.sessionSubject, (t) => !t || t.id !== e.session_id ? t : {
			...t,
			accepted_by: e.accepted_by,
			rejected_by: e.rejected_by,
			missed_by: e.missed_by,
			ended_at: e.session_ended_at ?? t.ended_at
		}), e.call_ended_at && this.setEndedAt(new Date(e.call_ended_at));
	};
	updateFromSfuCallState = (e, t, n) => {
		let { participants: r, participantCount: i, startedAt: a, pins: o, e2EeEnabled: s } = e, c = n?.announcedTracks.map((e) => e.trackType) ?? [];
		this.setParticipants(() => {
			let e = this.getParticipantLookupBySessionId();
			return r.map((n) => {
				let r = e[n.sessionId], i = n.sessionId === t;
				return Object.assign({}, r, n, {
					isLocalParticipant: i,
					publishedTracks: i ? c : n.publishedTracks,
					viewportVisibilityState: r?.viewportVisibilityState ?? {
						videoTrack: G.UNKNOWN,
						screenShareTrack: G.UNKNOWN
					}
				});
			});
		}), this.setParticipantCount(i?.total || 0), this.setAnonymousParticipantCount(i?.anonymous || 0), this.setStartedAt(a ? Cl.toDate(a) : /* @__PURE__ */ new Date()), this.setServerSidePins(o), this.setCurrentValue(this.e2eeEnabledSubject, s);
	};
	updateFromMemberRemoved = (e) => {
		this.updateFromCallResponse(e.call), this.setCurrentValue(this.membersSubject, (t) => t.filter((t) => e.members.indexOf(t.user_id) === -1));
	};
	updateFromMemberAdded = (e) => {
		this.updateFromCallResponse(e.call), this.setCurrentValue(this.membersSubject, (t) => [...t, ...e.members]);
	};
	updateFromHLSBroadcastStopped = () => {
		this.setCurrentValue(this.egressSubject, (e = _p) => ({
			...e,
			broadcasting: !1,
			hls: {
				...e.hls,
				status: ""
			}
		}));
	};
	updateFromHLSBroadcastingFailed = () => {
		this.setCurrentValue(this.egressSubject, (e = _p) => ({
			...e,
			broadcasting: !1,
			hls: {
				...e.hls,
				status: ""
			}
		}));
	};
	updateFromRecordingEvent = (e, t) => {
		e === void 0 || e === "composite" ? this.setCurrentValue(this.recordingSubject, t) : e === "individual" ? this.setCurrentValue(this.individualRecordingSubject, t) : e === "raw" ? this.setCurrentValue(this.rawRecordingSubject, t) : lf(e, "Unknown recording type");
	};
	updateParticipantCountFromSession = (e) => {
		if (!e || this.callingState === Z.JOINED) return;
		let t = Object.values(e.participants_count_by_role).reduce((e, t) => e + t, 0), n = Math.max(t, e.participants.length);
		this.setParticipantCount(n), this.setAnonymousParticipantCount(e.anonymous_participant_count || 0);
	};
	updateFromSessionParticipantCountUpdate = (e) => {
		let t = this.setCurrentValue(this.sessionSubject, (t) => t && {
			...t,
			anonymous_participant_count: e.anonymous_participant_count,
			participants_count_by_role: e.participants_count_by_role
		});
		this.updateParticipantCountFromSession(t);
	};
	updateFromSessionParticipantLeft = (e) => {
		let t = this.setCurrentValue(this.sessionSubject, (t) => {
			if (!t) return t;
			let { participants: n, participants_count_by_role: r } = t, { user: i, user_session_id: a } = e.participant;
			return {
				...t,
				participants: n.filter((e) => e.user_session_id !== a),
				participants_count_by_role: {
					...r,
					[i.role]: Math.max(0, (r[i.role] || 0) - 1)
				}
			};
		});
		this.updateParticipantCountFromSession(t);
	};
	updateFromSessionParticipantJoined = (e) => {
		let t = this.setCurrentValue(this.sessionSubject, (t) => {
			if (!t) return t;
			let { participants: n, participants_count_by_role: r } = t, { user: i, user_session_id: a } = e.participant, o = !0, s = n.map((t) => t.user_session_id === a ? (o = !1, e.participant) : t);
			o && s.push(e.participant);
			let c = +!!o;
			return {
				...t,
				participants: s,
				participants_count_by_role: {
					...r,
					[i.role]: (r[i.role] || 0) + c
				}
			};
		});
		this.updateParticipantCountFromSession(t);
	};
	updateMembers = (e) => {
		this.updateFromCallResponse(e.call), this.setCurrentValue(this.membersSubject, (t) => t.map((t) => e.members.find((e) => e.user_id === t.user_id) || t));
	};
	updateParticipantReaction = (e) => {
		let { user: t, custom: n, type: r, emoji_code: i } = e.reaction;
		this.setParticipants((e) => e.map((e) => e.userId === t.id ? {
			...e,
			reaction: {
				type: r,
				emoji_code: i,
				custom: n
			}
		} : e));
	};
	unblockUser = (e) => {
		this.setCurrentValue(this.blockedUserIdsSubject, (t) => t && t.filter((t) => t !== e.user.id));
	};
	blockUser = (e) => {
		this.setCurrentValue(this.blockedUserIdsSubject, (t) => [...t || [], e.user.id]);
	};
	updateOwnCapabilities = (e) => {
		e.user.id === this.localParticipant?.userId && this.setOwnCapabilities(e.own_capabilities);
	};
	updateFromClosedCaptions = (e) => {
		this.setCurrentValue(this.closedCaptionsSubject, (t) => {
			let { closed_caption: n } = e, r = (e) => `${e.speaker_id}/${e.start_time}`, i = r(n);
			if (t.some((e) => r(e) === i)) return t;
			let a = [...t, n], { visibilityDurationMs: o = 2700, maxVisibleCaptions: s = 2 } = this.closedCaptionsSettings || {};
			if (o > 0) {
				let e = setTimeout(() => {
					this.setCurrentValue(this.closedCaptionsSubject, (e) => e.filter((e) => e !== n)), this.closedCaptionsTasks.delete(i);
				}, o);
				this.closedCaptionsTasks.set(i, e);
				for (let e = 0; e < a.length - s; e++) {
					let t = r(a[e]), n = this.closedCaptionsTasks.get(t);
					clearTimeout(n), this.closedCaptionsTasks.delete(t);
				}
			}
			return a.slice(-s);
		});
	};
}, yp = () => typeof RTCRtpSender < "u" && "createEncodedStreams" in RTCRtpSender.prototype, bp = (e) => {
	let t = [];
	return e.forEach((e) => {
		t.push(e);
	}), t;
}, xp = (e) => ({
	id: e.id,
	tracks: e.getTracks().map((e) => ({
		id: e.id,
		kind: e.kind,
		label: e.label,
		enabled: e.enabled,
		muted: e.muted,
		readyState: e.readyState
	}))
}), Sp = (e) => {
	let { sdk: t, ...n } = e;
	return {
		sdkName: Cp(t),
		sdkVersion: wp(t),
		...n
	};
}, Cp = (e) => e && e.type === kl.REACT ? "stream-react" : e && e.type === kl.REACT_NATIVE ? "stream-react-native" : "stream-js", wp = (e) => e ? `${e.major}.${e.minor}.${e.patch}` : "0.0.0-development", Tp = (e) => {
	let t = {
		[kl.REACT]: "react",
		[kl.REACT_NATIVE]: "react-native"
	};
	return `stream-video-${e && t[e.type] || "js"}-v${wp(e)}`;
}, Ep = ({ subscriber: e, publisher: t, state: n, datacenter: r, pollingIntervalInMs: i = 2e3 }) => {
	let a = q.getLogger("stats"), o = async (n, r) => {
		if (n === "subscriber" && e) return e.getStats(r);
		if (n === "publisher" && t) return t.getStats(r);
	}, s = async (n, r) => {
		let i = n === "subscriber" ? e : t;
		if (!i) return [];
		let a = [];
		for (let e of r) {
			let t = Op(await i.getStats(e), {
				trackKind: e.kind,
				kind: n,
				publisher: void 0
			});
			a.push(t);
		}
		return a;
	}, c = (e) => {
		u.add(e), d();
	}, l = (e) => {
		u.delete(e), d();
	}, u = /* @__PURE__ */ new Set(), d = async () => {
		let e = {};
		if (u.size > 0) {
			let r = new Set(u);
			for (let i of n.participants) {
				if (!r.has(i.sessionId)) continue;
				let { audioStream: n, isLocalParticipant: o, sessionId: c, userId: l, videoStream: u } = i, d = o ? "publisher" : "subscriber";
				try {
					let r = o ? t?.getPublishedTracks() || [] : [...u?.getVideoTracks() || [], ...n?.getAudioTracks() || []];
					e[c] = await s(d, r);
				} catch (e) {
					a.warn(`Failed to collect ${d} stats for ${l}`, e);
				}
			}
		}
		let [i, c] = await Promise.all([o("subscriber"), t ? o("publisher") : void 0]), l = (e, n) => ({
			videoStats: jp(Op(e, {
				kind: n,
				trackKind: "video",
				publisher: t
			})),
			audioStats: Mp(Op(e, {
				kind: n,
				trackKind: "audio",
				publisher: t
			}))
		}), d = i ? l(i, "subscriber") : {
			videoStats: kp(),
			audioStats: Ap()
		}, f = c ? l(c, "publisher") : {
			videoStats: kp(),
			audioStats: Ap()
		};
		n.setCallStatsReport({
			datacenter: r,
			publisherStats: f.videoStats,
			publisherAudioStats: f.audioStats,
			subscriberStats: d.videoStats,
			subscriberAudioStats: d.audioStats,
			subscriberRawStats: i,
			publisherRawStats: c,
			participants: e,
			timestamp: Date.now()
		});
	}, f;
	if (i > 0) {
		let e = async () => {
			n.isCallStatsReportObserved && await d().catch((e) => {
				a.debug("Failed to collect stats", e);
			}), f = setTimeout(e, i);
		};
		e();
	}
	return {
		getRawStatsForTrack: o,
		getStatsForStream: s,
		startReportingStatsFor: c,
		stopReportingStatsFor: l,
		stop: () => {
			f && clearTimeout(f);
		}
	};
}, Dp = (e) => ({
	frameRate: e.framesPerSecond,
	frameWidth: e.width,
	frameHeight: e.height
}), Op = (e, t) => {
	let { trackKind: n, kind: r, publisher: i } = t, a = r === "subscriber" ? "inbound-rtp" : "outbound-rtp", o = bp(e);
	return {
		rawStats: e,
		streams: o.filter((e) => e.type === a && e.kind === n).map((e) => {
			let t = e, a = o.find((e) => e.type === "codec" && e.id === t.codecId), s = o.find((e) => e.type === "transport" && e.id === t.transportId), c;
			s && s.dtlsState === "connected" && (c = o.find((e) => e.type === "candidate-pair" && e.id === s.selectedCandidatePairId)?.currentRoundTripTime);
			let l, u, d, f, p, m, h;
			if (r === "publisher" && i) {
				let e = Tf(), r = o.find((n) => n.type === "media-source" && (e ? !0 : n.id === t.mediaSourceId));
				r && (l = i.getTrackType(r.trackIdentifier), n === "audio" && typeof r.audioLevel == "number" && (u = r.audioLevel), n === "video" && (d = Dp(r)));
			} else if (r === "subscriber" && n === "audio") {
				let e = t, n = e.audioLevel;
				typeof n == "number" && (u = n), f = e.concealedSamples, p = e.concealmentEvents, m = e.packetsReceived, h = e.packetsLost;
			}
			return {
				bytesSent: t.bytesSent,
				bytesReceived: t.bytesReceived,
				codec: a?.mimeType,
				currentRoundTripTime: c,
				frameHeight: t.frameHeight,
				frameWidth: t.frameWidth,
				framesPerSecond: t.framesPerSecond,
				jitter: t.jitter,
				kind: t.kind,
				mediaSourceId: t.mediaSourceId,
				qualityLimitationReason: t.qualityLimitationReason,
				rid: t.rid,
				ssrc: t.ssrc,
				trackType: l,
				audioLevel: u,
				concealedSamples: f,
				concealmentEvents: p,
				packetsReceived: m,
				packetsLost: h,
				camera: d
			};
		}),
		timestamp: Date.now()
	};
}, kp = (e) => ({
	rawReport: e ?? {
		streams: [],
		timestamp: Date.now()
	},
	totalBytesSent: 0,
	totalBytesReceived: 0,
	averageJitterInMs: 0,
	averageRoundTripTimeInMs: 0,
	qualityLimitationReasons: "none",
	highestFrameWidth: 0,
	highestFrameHeight: 0,
	highestFramesPerSecond: 0,
	camera: {},
	codec: "",
	codecPerTrackType: {},
	timestamp: Date.now()
}), Ap = () => ({
	totalBytesSent: 0,
	totalBytesReceived: 0,
	averageJitterInMs: 0,
	averageRoundTripTimeInMs: 0,
	codec: "",
	codecPerTrackType: {},
	timestamp: Date.now(),
	totalConcealedSamples: 0,
	totalConcealmentEvents: 0,
	totalPacketsReceived: 0,
	totalPacketsLost: 0
}), jp = (e) => {
	let t = kp(e), n = -1, r = (e, t) => e * t, i = /* @__PURE__ */ new Set(), a = e.streams, o = a.reduce((e, t) => {
		e.totalBytesSent += t.bytesSent || 0, e.totalBytesReceived += t.bytesReceived || 0, e.averageJitterInMs += t.jitter || 0, e.averageRoundTripTimeInMs += t.currentRoundTripTime || 0;
		let a = r(t.frameWidth || 0, t.frameHeight || 0);
		return a > n && (e.highestFrameWidth = t.frameWidth || 0, e.highestFrameHeight = t.frameHeight || 0, e.highestFramesPerSecond = t.framesPerSecond || 0, n = a), t.trackType === U.VIDEO && (e.camera = t.camera), i.add(t.qualityLimitationReason || ""), e;
	}, t);
	a.length > 0 && (o.averageJitterInMs = Math.round(o.averageJitterInMs / a.length * 1e3), o.averageRoundTripTimeInMs = Math.round(o.averageRoundTripTimeInMs / a.length * 1e3), o.codec = a[0].codec || "", o.codecPerTrackType = a.reduce((e, t) => (t.trackType && (e[t.trackType] = t.codec || ""), e), {}));
	let s = [
		i.has("cpu") && "cpu",
		i.has("bandwidth") && "bandwidth",
		i.has("other") && "other"
	].filter(Boolean).join(", ");
	return s && (o.qualityLimitationReasons = s), o;
}, Mp = (e) => {
	let t = e.streams, n = Ap(), r = t.reduce((e, t) => (e.totalBytesSent += t.bytesSent || 0, e.totalBytesReceived += t.bytesReceived || 0, e.averageJitterInMs += t.jitter || 0, e.averageRoundTripTimeInMs += t.currentRoundTripTime || 0, e.totalConcealedSamples += t.concealedSamples || 0, e.totalConcealmentEvents += t.concealmentEvents || 0, e.totalPacketsReceived += t.packetsReceived || 0, e.totalPacketsLost += t.packetsLost || 0, e), n);
	return t.length > 0 && (r.averageJitterInMs = Math.round(r.averageJitterInMs / t.length * 1e3), r.averageRoundTripTimeInMs = Math.round(r.averageRoundTripTimeInMs / t.length * 1e3), r.codec = t[0].codec || "", r.codecPerTrackType = t.reduce((e, t) => (t.trackType && (e[t.trackType] = t.codec || ""), e), {})), r;
}, Np = class {
	logger = q.getLogger("SfuStatsReporter");
	options;
	sfuClient;
	subscriber;
	publisher;
	tracer;
	unifiedSessionId;
	intervalId;
	timeoutId;
	reportCount = 0;
	sdkName;
	sdkVersion;
	webRTCVersion;
	statsConcurrencyTag = Symbol("sfuStatsReporter");
	isStopped = !1;
	constructor(e, { options: t, clientDetails: n, subscriber: r, publisher: i, tracer: a, unifiedSessionId: o }) {
		this.sfuClient = e, this.options = t, this.subscriber = r, this.publisher = i, this.tracer = a, this.unifiedSessionId = o;
		let { sdk: s, browser: c } = n;
		this.sdkName = Cp(s), this.sdkVersion = wp(s), this.webRTCVersion = `${c?.name || ""}-${c?.version || ""}` || "N/A";
	}
	sendConnectionTime = (e) => {
		this.sendTelemetryData({ data: {
			oneofKind: "connectionTimeSeconds",
			connectionTimeSeconds: e
		} });
	};
	sendReconnectionTime = (e, t) => {
		this.sendTelemetryData({ data: {
			oneofKind: "reconnection",
			reconnection: {
				strategy: e,
				timeSeconds: t
			}
		} });
	};
	sendTelemetryData = (e) => {
		this.run(e).catch((e) => {
			this.logger.warn("Failed to send telemetry data", e);
		});
	};
	sample = () => Promise.all([this.subscriber.stats.takeSample(), this.publisher?.stats.takeSample()]);
	send = (e, t, n) => J(this.statsConcurrencyTag, async () => {
		let r = this.subscriber.tracer, i = this.publisher?.tracer, a = [];
		r ? a = this.subscriber.stats.getPendingDeltas() : this.subscriber.stats.clearPendingDeltas();
		let o = [];
		i && this.publisher ? o = this.publisher.stats.getPendingDeltas() : this.publisher?.stats.clearPendingDeltas();
		let s = r?.take(), c = i?.take(), l = this.tracer.take(), u = this.sfuClient.getTrace(), d = [
			...l.snapshot,
			...u?.snapshot ?? [],
			...c?.snapshot ?? [],
			...s?.snapshot ?? [],
			...Pp(a, r?.id),
			...Pp(o, i?.id)
		];
		try {
			let { response: s } = await this.sfuClient.sendStats({
				sdk: this.sdkName,
				sdkVersion: this.sdkVersion,
				webrtcVersion: this.webRTCVersion,
				rtcStats: JSON.stringify(d),
				encodeStats: t ?? [],
				decodeStats: e,
				unifiedSessionId: this.unifiedSessionId,
				deviceState: xf(),
				telemetry: n
			});
			if (s?.error) throw Error(`SFU rejected stats: ${s.error.message}`);
			r && this.subscriber.stats.commitDeltas(a), i && this.publisher && this.publisher.stats.commitDeltas(o);
		} catch (e) {
			throw c?.rollback(), s?.rollback(), l.rollback(), u?.rollback(), e;
		}
	});
	run = async (e) => {
		if (this.isStopped) return;
		let [t, n] = await this.sample();
		await this.send(t, n, e);
	};
	scheduleNextReport = () => {
		let e = [
			1500,
			3e3,
			3e3,
			5e3
		];
		this.reportCount < e.length ? this.timeoutId = setTimeout(() => {
			this.scheduledFlush(), this.reportCount++, this.scheduleNextReport();
		}, e[this.reportCount]) : (clearInterval(this.intervalId), this.intervalId = setInterval(() => {
			this.scheduledFlush();
		}, this.options.reporting_interval_ms));
	};
	start = () => {
		this.options.reporting_interval_ms <= 0 || (this.isStopped = !1, this.reportCount = 0, clearInterval(this.intervalId), clearTimeout(this.timeoutId), this.scheduleNextReport());
	};
	stop = () => {
		this.isStopped = !0, clearInterval(this.intervalId), this.intervalId = void 0, clearTimeout(this.timeoutId), this.timeoutId = void 0, this.reportCount = 0;
	};
	flush = async () => {
		if (!this.isStopped) try {
			let [e] = await Od([this.sample()], 2e3), [t, n] = e;
			this.send(t, n).catch((e) => {
				this.logger.warn("Failed to flush report stats", e);
			});
		} catch (e) {
			this.logger.warn("Failed to sample stats for the final flush", e);
		}
	};
	scheduledFlush = () => {
		this.isStopped || Af(this.statsConcurrencyTag) || this.run().catch((e) => {
			this.logger.warn("Failed to flush report stats", e);
		});
	};
}, Pp = (e, t = null) => e.map(({ delta: e, ts: n }) => [
	"getstats",
	t,
	e,
	n
]), Fp = (e, t) => {
	e.addEventListener("icecandidate", (e) => {
		t("onicecandidate", e.candidate);
	}), e.addEventListener("track", (e) => {
		let n = e.streams.map((e) => `stream:${e.id}`);
		t("ontrack", `${e.track.kind}:${e.track.id} ${n}`);
	}), e.addEventListener("signalingstatechange", () => {
		t("signalingstatechange", e.signalingState);
	}), e.addEventListener("iceconnectionstatechange", () => {
		t("iceconnectionstatechange", e.iceConnectionState);
	}), e.addEventListener("icegatheringstatechange", () => {
		t("icegatheringstatechange", e.iceGatheringState);
	}), e.addEventListener("connectionstatechange", () => {
		t("connectionstatechange", e.connectionState);
	}), e.addEventListener("negotiationneeded", () => {
		t("negotiationneeded", void 0);
	}), e.addEventListener("datachannel", ({ channel: e }) => {
		t("datachannel", [e.id, e.label]);
	});
	let n = e.close;
	e.close = function() {
		return t("close", void 0), n.call(this);
	};
	for (let n of [
		"createOffer",
		"createAnswer",
		"setLocalDescription",
		"setRemoteDescription",
		"addIceCandidate"
	]) {
		let r = e[n];
		r && (e[n] = async function(...e) {
			try {
				t(n, e);
				let i = await r.apply(this, e);
				return t(`${n}OnSuccess`, i), i;
			} catch (e) {
				throw t(`${n}OnFailure`, e.toString()), e;
			}
		});
	}
}, Ip = class {
	pc;
	peerType;
	trackIdToTrackType;
	driftThresholdMs;
	maxPendingDeltas;
	sampleTag = Symbol("statsTracerSample");
	costOverrides;
	previousSample = {};
	frameTimeHistory = [];
	fpsHistory = [];
	pendingDeltas = [];
	constructor(e, t, n, r = 0, i = 50) {
		this.pc = e, this.peerType = t, this.trackIdToTrackType = n, this.driftThresholdMs = r, this.maxPendingDeltas = i;
	}
	takeSample = () => J(this.sampleTag, async () => {
		let e = await this.pc.getStats(), t = Date.now(), n = Lp(e, t, this.driftThresholdMs);
		this.pendingDeltas.length >= this.maxPendingDeltas && (this.pendingDeltas = [], this.previousSample = {});
		let r = this.withOverrides(this.peerType === H.SUBSCRIBER ? this.getDecodeStats(n) : this.getEncodeStats(n)), i = Rp(this.previousSample, n);
		return this.previousSample = n, this.pendingDeltas.push({
			delta: i,
			ts: t
		}), this.frameTimeHistory = this.frameTimeHistory.slice(-2), this.fpsHistory = this.fpsHistory.slice(-2), r;
	});
	getPendingDeltas = () => this.pendingDeltas.slice();
	commitDeltas = (e) => {
		if (e.length === 0) return;
		let t = new Set(e);
		this.pendingDeltas = this.pendingDeltas.filter((e) => !t.has(e));
	};
	clearPendingDeltas = () => {
		this.pendingDeltas = [];
	};
	getEncodeStats = (e) => {
		let t = [];
		for (let n of Object.values(e)) {
			if (n.type !== "outbound-rtp") continue;
			let { codecId: r, framesSent: i = 0, kind: a, id: o, totalEncodeTime: s = 0, framesPerSecond: c = 0, frameHeight: l = 0, frameWidth: u = 0, targetBitrate: d = 0, mediaSourceId: f } = n;
			if (a === "audio" || !this.previousSample[o]) continue;
			let p = this.previousSample[o], m = s - (p.totalEncodeTime || 0), h = i - (p.framesSent || 0), g = h > 0 ? m / h * 1e3 : 0;
			this.frameTimeHistory.push(g), this.fpsHistory.push(c);
			let _ = U.VIDEO;
			if (f && e[f]) {
				let t = e[f];
				_ = this.trackIdToTrackType.get(t.trackIdentifier) || _;
			}
			t.push({
				trackType: _,
				codec: Bp(e, r),
				avgFrameTimeMs: zp(this.frameTimeHistory),
				avgFps: zp(this.fpsHistory),
				targetBitrate: Math.round(d),
				videoDimension: {
					width: u,
					height: l
				}
			});
		}
		return t;
	};
	getDecodeStats = (e) => {
		let t, n = 0;
		for (let r of Object.values(e)) {
			if (r.type !== "inbound-rtp") continue;
			let e = r, { kind: i, frameWidth: a = 0, frameHeight: o = 0 } = e, s = a * o;
			i === "video" && s > n && (t = e, n = s);
		}
		if (!t || !this.previousSample[t.id]) return [];
		let r = this.previousSample[t.id], { framesDecoded: i = 0, framesPerSecond: a = 0, totalDecodeTime: o = 0, trackIdentifier: s } = t, c = o - (r.totalDecodeTime || 0), l = i - (r.framesDecoded || 0), u = l > 0 ? c / l * 1e3 : 0;
		this.frameTimeHistory.push(u), this.fpsHistory.push(a);
		let d = this.trackIdToTrackType.get(s) || U.VIDEO;
		return [cu.create({
			trackType: d,
			codec: Bp(e, t.codecId),
			avgFrameTimeMs: zp(this.frameTimeHistory),
			avgFps: zp(this.fpsHistory),
			videoDimension: {
				width: t.frameWidth,
				height: t.frameHeight
			}
		})];
	};
	withOverrides = (e) => {
		if (this.costOverrides) for (let t of e) {
			let e = this.costOverrides.get(t.trackType);
			e !== void 0 && (t.avgFrameTimeMs = e + (t.avgFrameTimeMs || 0) / 1e3);
		}
		return e;
	};
	setCost = (e, t = U.VIDEO) => {
		this.costOverrides ||= /* @__PURE__ */ new Map(), this.costOverrides.set(t, e);
	};
}, Lp = (e, t, n) => {
	let r = {}, i = n > 0;
	return e.forEach((e, a) => {
		let o = Math.abs(e.timestamp - t);
		r[a] = i && o > n ? {
			...e,
			timestamp: t
		} : e;
	}), r;
}, Rp = (e, t) => {
	t = JSON.parse(JSON.stringify(t));
	for (let [n, r] of Object.entries(t)) if (delete r.id, e[n]) for (let [t, i] of Object.entries(r)) i === e[n][t] && delete r[t];
	let n = -Infinity, r = Object.values(t);
	for (let e of r) e.timestamp > n && (n = e.timestamp);
	for (let e of r) e.timestamp === n && (e.timestamp = 0);
	return t.timestamp = n, t;
}, zp = (e) => e.reduce((e, t) => e + t, 0) / e.length, Bp = (e, t) => {
	if (!t || !e[t]) return;
	let n = e[t];
	return Kl.create({
		name: n.mimeType.split("/").pop(),
		clockRate: n.clockRate,
		payloadType: n.payloadType,
		fmtp: n.sdpFmtpLine
	});
}, Vp = class {
	buffer = [];
	enabled = !0;
	id;
	maxBuffer;
	keys;
	constructor(e, t = 2500) {
		this.id = e, this.maxBuffer = t;
	}
	setEnabled = (e) => {
		this.enabled !== e && (this.enabled = e, this.buffer = []);
	};
	trace = (e, t) => {
		this.enabled && (this.buffer.push([
			e,
			this.id,
			t,
			Date.now()
		]), this.capBuffer());
	};
	traceOnce = (e, t, n) => {
		this.keys?.has(e) || (this.trace(t, n), (this.keys ??= /* @__PURE__ */ new Map()).set(e, !0));
	};
	resetTrace = (e) => {
		this.keys?.delete(e);
	};
	take = () => {
		let e = this.buffer;
		return this.buffer = [], {
			snapshot: e,
			rollback: () => {
				this.buffer.unshift(...e), this.capBuffer();
			}
		};
	};
	dispose = () => {
		this.buffer = [], this.keys?.clear();
	};
	capBuffer = () => {
		let e = this.buffer.length - this.maxBuffer;
		e <= 0 || (this.buffer.splice(0, e), this.buffer[0] = [
			"traceBufferOverflow",
			this.id,
			{ dropped: e },
			Date.now()
		]);
	};
}, Hp = {
	ICE_NEVER_CONNECTED: "ice_never_connected",
	CONNECTION_FAILED: "connection_failed",
	RESTART_ICE_FAILED: "restart_ice_failed",
	SUBSCRIBER_NEGOTIATION_FAILED: "subscriber_negotiation_failed",
	GO_AWAY: "go_away",
	NETWORK_BACK_ONLINE: "network_back_online",
	SFU_ERROR: "sfu_error"
}, Up = class {
	logger;
	peerType;
	pc;
	state;
	dispatcher;
	clientPublishOptions;
	e2ee;
	tag;
	sfuClient;
	onReconnectionNeeded;
	onIceConnected;
	onNoLocalCandidates;
	onPeerConnectionStateChange;
	onRemoteTrackUnmute;
	iceRestartDelay;
	iceHasEverConnected = !1;
	localCandidatesGathered = 0;
	iceRestartTimeout;
	preConnectStuckTimeout;
	isIceRestarting = !1;
	isDisposed = !1;
	trackIdToTrackType = /* @__PURE__ */ new Map();
	tracer;
	stats;
	subscriptions = [];
	unsubscribeIceTrickle;
	lock = Math.random().toString(36).slice(2);
	constructor(e, { sfuClient: t, connectionConfig: n, state: r, dispatcher: i, onReconnectionNeeded: a, onIceConnected: o, onNoLocalCandidates: s, onPeerConnectionStateChange: c, onRemoteTrackUnmute: l, tag: u, enableTracing: d, clientPublishOptions: f, e2ee: p, iceRestartDelay: m = 2500, statsTimestampDriftThresholdMs: h = 0 }) {
		this.peerType = e, this.sfuClient = t, this.state = r, this.dispatcher = i, this.iceRestartDelay = m, this.clientPublishOptions = f, this.e2ee = p, this.tag = u, this.onReconnectionNeeded = a, this.onIceConnected = o, this.onNoLocalCandidates = s, this.onPeerConnectionStateChange = c, this.onRemoteTrackUnmute = l, this.logger = q.getLogger(e === H.SUBSCRIBER ? "Subscriber" : "Publisher", { tags: [u] }), this.pc = this.createPeerConnection(n), this.stats = new Ip(this.pc, e, this.trackIdToTrackType, h), d && (this.tracer = new Vp(`${u}-${e === H.SUBSCRIBER ? "sub" : "pub"}`), this.tracer.trace("create", {
			url: t.edgeName,
			...n
		}), Fp(this.pc, this.tracer.trace));
	}
	createPeerConnection = (e) => {
		let t = { ...e };
		this.e2ee && yp() && (t.encodedInsertableStreams = !0);
		let n = new RTCPeerConnection(t);
		return n.addEventListener("icecandidate", this.onIceCandidate), n.addEventListener("icecandidateerror", this.onIceCandidateError), n.addEventListener("iceconnectionstatechange", this.onIceConnectionStateChange), n.addEventListener("icegatheringstatechange", this.onIceGatherChange), n.addEventListener("signalingstatechange", this.onSignalingChange), n.addEventListener("connectionstatechange", this.onConnectionStateChange), n;
	};
	async dispose() {
		clearTimeout(this.iceRestartTimeout), this.iceRestartTimeout = void 0, clearTimeout(this.preConnectStuckTimeout), this.preConnectStuckTimeout = void 0, this.onReconnectionNeeded = void 0, this.onIceConnected = void 0, this.onNoLocalCandidates = void 0, this.onPeerConnectionStateChange = void 0, this.onRemoteTrackUnmute = void 0, this.isDisposed = !0, this.detachEventHandlers(), this.pc.close(), this.tracer?.dispose();
	}
	detachEventHandlers() {
		let e = this.pc;
		e.removeEventListener("icecandidate", this.onIceCandidate), e.removeEventListener("icecandidateerror", this.onIceCandidateError), e.removeEventListener("signalingstatechange", this.onSignalingChange), e.removeEventListener("iceconnectionstatechange", this.onIceConnectionStateChange), e.removeEventListener("icegatheringstatechange", this.onIceGatherChange), e.removeEventListener("connectionstatechange", this.onConnectionStateChange), this.unsubscribeIceTrickle?.(), this.subscriptions.forEach((e) => e()), this.subscriptions = [];
	}
	tryRestartIce = () => {
		this.restartIce().catch((e) => {
			this.logger.error("restartICE() failed, initiating reconnect", e);
			let t = e instanceof rf && e.error.code === Ol.PARTICIPANT_SIGNAL_LOST ? W.FAST : W.REJOIN;
			this.onReconnectionNeeded?.(t, Hp.RESTART_ICE_FAILED, this.peerType);
		});
	};
	on = (e, t) => {
		this.subscriptions.push(this.dispatcher.on(e, () => this.tag, (n) => {
			J(this.eventLockKey(e), async () => t(n)).catch((t) => {
				this.isDisposed || this.logger.warn(`Error handling ${e}`, t);
			});
		}));
	};
	eventLockKey = (e) => `pc.${this.lock}.${e}`;
	addTrickledIceCandidates = () => {
		let { iceTrickleBuffer: e } = this.sfuClient, t = this.pc.remoteDescription?.sdp;
		e.updateActiveGeneration(this.peerType, t);
		let { subscriber: n, publisher: r } = e, i = this.peerType === H.SUBSCRIBER ? n.candidates : r.candidates;
		this.unsubscribeIceTrickle?.(), this.unsubscribeIceTrickle = Bf(i, async (e) => this.pc.addIceCandidate(e).catch((t) => {
			this.isDisposed || this.logger.warn("ICE candidate error", t, e);
		}));
	};
	setSfuClient = (e) => {
		this.sfuClient = e, this.tag = e.tag;
	};
	getStats = (e) => this.pc.getStats(e);
	getTrackType = (e) => this.trackIdToTrackType.get(e);
	hasIceEverConnected = () => this.iceHasEverConnected;
	hasNoLocalCandidates = () => this.pc.iceGatheringState === "complete" && this.localCandidatesGathered === 0;
	isHealthy = () => {
		let e = /* @__PURE__ */ new Set(["failed", "closed"]), t = this.pc.iceConnectionState, n = this.pc.connectionState;
		return !e.has(t) && !e.has(n);
	};
	onIceCandidate = (e) => {
		let { candidate: t } = e;
		if (!t) {
			this.logger.debug("null ice candidate");
			return;
		}
		t.candidate && this.localCandidatesGathered++;
		let n = af(t);
		this.sfuClient.iceTrickle({
			peerType: this.peerType,
			iceCandidate: n
		}).catch((e) => {
			this.isDisposed || this.logger.warn("ICETrickle failed", e);
		});
	};
	onConnectionStateChange = async () => {
		let e = this.pc.connectionState;
		if (this.logger.debug("Connection state changed", e), this.fireOnPeerConnectionStateChange({
			stateType: "peerConnection",
			state: e
		}), this.tracer && (e === "connected" || e === "failed")) try {
			await this.stats.takeSample();
		} catch (e) {
			this.tracer.trace("getstatsOnFailure", e.toString());
		}
		if (e === "failed") {
			let e = this.iceHasEverConnected ? Hp.CONNECTION_FAILED : Hp.ICE_NEVER_CONNECTED;
			clearTimeout(this.preConnectStuckTimeout), this.preConnectStuckTimeout = void 0, this.onReconnectionNeeded?.(W.REJOIN, e, this.peerType);
		} else this.handleConnectionStateUpdate(e);
	};
	onIceConnectionStateChange = () => {
		let e = this.pc.iceConnectionState;
		this.logger.debug("ICE connection state changed", e), this.fireOnPeerConnectionStateChange({
			stateType: "ice",
			state: e
		}), this.handleConnectionStateUpdate(e);
	};
	fireOnPeerConnectionStateChange = (e) => {
		try {
			this.onPeerConnectionStateChange?.({
				peerType: this.peerType,
				iceConnectionState: this.pc.iceConnectionState,
				...e
			});
		} catch (e) {
			this.logger.warn("onPeerConnectionStateChange listener threw", e);
		}
	};
	handleConnectionStateUpdate = (e) => {
		(e === "connected" || e === "completed") && !this.iceHasEverConnected && (this.iceHasEverConnected = !0, this.onIceConnected?.(this.peerType));
		let { callingState: t } = this.state;
		if (t !== Z.OFFLINE && t !== Z.RECONNECTING && !this.isIceRestarting) {
			if (!this.iceHasEverConnected) {
				if (e === "failed") {
					this.logger.info("ICE failed before connected, escalating to REJOIN"), clearTimeout(this.preConnectStuckTimeout), this.preConnectStuckTimeout = void 0, this.onReconnectionNeeded?.(W.REJOIN, Hp.ICE_NEVER_CONNECTED, this.peerType);
					return;
				}
				if (e === "disconnected") {
					this.logger.info("ICE disconnected before connected, wait to recover"), clearTimeout(this.preConnectStuckTimeout), this.preConnectStuckTimeout = setTimeout(() => {
						!this.iceHasEverConnected && this.pc.iceConnectionState === "disconnected" && (this.logger.info("ICE stuck in pre-connect disconnected, escalating to REJOIN"), this.onReconnectionNeeded?.(W.REJOIN, Hp.ICE_NEVER_CONNECTED, this.peerType));
					}, this.iceRestartDelay * 2);
					return;
				}
			}
			switch (e) {
				case "failed":
					this.logger.info("restartICE due to failed connection"), this.tryRestartIce();
					break;
				case "disconnected":
					this.logger.info("disconnected connection, scheduling restartICE"), clearTimeout(this.iceRestartTimeout), this.iceRestartTimeout = setTimeout(() => {
						let e = this.pc.iceConnectionState;
						(e === "disconnected" || e === "failed") && this.tryRestartIce();
					}, this.iceRestartDelay);
					break;
				case "connected":
				case "completed": this.iceRestartTimeout &&= (this.logger.info("connected connection, canceling restartICE"), clearTimeout(this.iceRestartTimeout), void 0), clearTimeout(this.preConnectStuckTimeout), this.preConnectStuckTimeout = void 0;
			}
		}
	};
	onIceCandidateError = (e) => {
		let t = e instanceof RTCPeerConnectionIceErrorEvent ? `${e.errorCode}: ${e.errorText}` : e;
		this.logger.debug("ICE Candidate error", t);
	};
	onIceGatherChange = () => {
		let e = this.pc.iceGatheringState;
		this.logger.debug("ICE Gathering State", e), e === "gathering" ? this.localCandidatesGathered = 0 : e === "complete" && this.localCandidatesGathered === 0 && !this.iceHasEverConnected && (this.logger.info("ICE gathering completed without local candidates"), this.onNoLocalCandidates?.(this.peerType));
	};
	onSignalingChange = () => {
		this.logger.debug("Signaling state changed", this.pc.signalingState);
	};
}, Wp = (e) => {
	switch (e) {
		case Il.BALANCED: return "balanced";
		case Il.MAINTAIN_FRAMERATE: return "maintain-framerate";
		case Il.MAINTAIN_RESOLUTION: return "maintain-resolution";
		case Il.MAINTAIN_FRAMERATE_AND_RESOLUTION: return "maintain-framerate-and-resolution";
		case Il.UNSPECIFIED: return;
		default:
			lf(e, "Unknown degradation preference");
			return;
	}
}, Gp = (e) => {
	switch (e) {
		case "balanced": return Il.BALANCED;
		case "maintain-framerate": return Il.MAINTAIN_FRAMERATE;
		case "maintain-resolution": return Il.MAINTAIN_RESOLUTION;
		case "maintain-framerate-and-resolution": return Il.MAINTAIN_FRAMERATE_AND_RESOLUTION;
		default: return Il.UNSPECIFIED;
	}
}, Kp = (e) => {
	switch (e) {
		case U.SCREEN_SHARE: return "screenShareStream";
		case U.SCREEN_SHARE_AUDIO: return "screenShareAudioStream";
		case U.VIDEO: return "videoStream";
		case U.AUDIO: return "audioStream";
		case U.UNSPECIFIED: throw Error("Track type is unspecified");
		default:
			lf(e, "Unknown track type");
			return;
	}
}, qp = (e) => {
	switch (e) {
		case "audio": return U.AUDIO;
		case "video": return U.VIDEO;
		case "screenshare": return U.SCREEN_SHARE;
		case "screenshare_audio": return U.SCREEN_SHARE_AUDIO;
		default:
			lf(e, "Unknown mute type");
			return;
	}
}, Jp = (e) => {
	switch (e) {
		case "TRACK_TYPE_AUDIO": return U.AUDIO;
		case "TRACK_TYPE_VIDEO": return U.VIDEO;
		case "TRACK_TYPE_SCREEN_SHARE": return U.SCREEN_SHARE;
		case "TRACK_TYPE_SCREEN_SHARE_AUDIO": return U.SCREEN_SHARE_AUDIO;
		default: return;
	}
}, Yp = (e) => e === U.AUDIO || e === U.SCREEN_SHARE_AUDIO, Xp = (e, t) => {
	let { audioBitrateProfile: n } = t;
	return [{ maxBitrate: e.audioBitrateProfiles?.find((e) => e.profile === n)?.bitrate || {
		[Dl.VOICE_STANDARD_UNSPECIFIED]: 64e3,
		[Dl.VOICE_HIGH_QUALITY]: 128e3,
		[Dl.MUSIC_HIGH_QUALITY]: 128e3
	}[n || Dl.VOICE_STANDARD_UNSPECIFIED] }];
}, Zp = (e) => {
	if (!e) return;
	let t = (e) => (t) => t.rid === e;
	return [{
		...e.find(t("f")) || e.find(t("h")) || e.find(t("q")),
		rid: "q"
	}];
}, Qp = (e) => e === "q" ? Tl.LOW_UNSPECIFIED : e === "h" ? Tl.MID : Tl.HIGH, $p = (e = []) => e.map((e) => ({
	rid: e.rid || "",
	bitrate: e.maxBitrate || 0,
	fps: e.maxFramerate || 0,
	quality: Qp(e.rid || ""),
	videoDimension: {
		width: e.width,
		height: e.height
	}
})), em = (e, t) => `L${e}T${t}${e > 1 ? "_KEY" : ""}`, tm = (e, t) => {
	if (Yp(t.trackType)) return;
	let n = [], { bitrate: r, codec: i, fps: a = 30, maxSpatialLayers: o = 3, maxTemporalLayers: s = 3, videoDimension: c = {
		width: 1280,
		height: 720
	}, useSingleLayer: l } = t, { width: u = c.width, height: d = c.height } = e.getSettings(), f = nm(c, u, d, r), p = 1, m = 1, h = Xd(i?.name);
	for (let e of [
		"f",
		"h",
		"q"
	].slice(0, o)) {
		let t = {
			active: !0,
			rid: e,
			width: Math.round(u / p),
			height: Math.round(d / p),
			maxBitrate: Math.round(f / m) || {
				q: 3e5,
				h: 75e4,
				f: 125e4
			}[e],
			maxFramerate: a
		};
		h ? t.scalabilityMode = em(l ? 1 : o, s) : t.scaleResolutionDownBy = p, p *= 2, m *= 2, n.unshift(t);
	}
	return rm(u, d, n, l);
}, nm = (e, t, n, r) => {
	let { width: i, height: a } = e;
	if (t < i || n < a) {
		let e = t * n / (i * a);
		return Math.round(r * e);
	}
	return r;
}, rm = (e, t, n, r) => {
	let i, a = Math.max(e, t);
	i = a <= 320 ? n.filter((e) => e.rid === "f") : a <= 640 ? n.filter((e) => e.rid !== "q") : n;
	let o = [
		"q",
		"h",
		"f"
	];
	return i.map((e, t, n) => ({
		...e,
		rid: o[t],
		active: r && t < n.length - 1 ? !1 : e.active
	}));
}, im = class {
	cache = [];
	layers = [];
	transceiverOrder = [];
	add = (e) => {
		this.cache.push(e), this.transceiverOrder.push(e.transceiver);
	};
	remove = (e) => {
		let t = this.cache.findIndex((t) => t.transceiver === e);
		if (t !== -1 && this.cache.splice(t, 1), e.mid) return;
		let n = this.transceiverOrder.indexOf(e);
		n !== -1 && this.transceiverOrder.splice(n, 1);
	};
	get = (e) => this.getBy(e.id, e.trackType);
	getBy = (e, t) => this.cache.find((n) => n.publishOption.id === e && n.publishOption.trackType === t);
	update = (e, t) => {
		let n = this.get(e);
		n && Object.assign(n, t);
	};
	has = (e) => !!this.get(e);
	find = (e) => this.cache.find(e);
	items = () => this.cache;
	indexOf = (e) => this.transceiverOrder.indexOf(e);
	getLayers = (e) => this.layers.find((t) => t.publishOption.id === e.id && t.publishOption.trackType === e.trackType)?.layers;
	setLayers = (e, t = []) => {
		let n = this.findLayer(e);
		n ? n.layers = t : this.layers.push({
			publishOption: e,
			layers: t
		});
	};
	findLayer = (e) => this.layers.find((t) => t.publishOption.id === e.id && t.publishOption.trackType === e.trackType);
}, am = class extends Up {
	transceiverCache = new im();
	clonedTracks = /* @__PURE__ */ new Set();
	publishOptions;
	selfSubEnabled;
	transceiverLockKey = `pub.tx.${this.lock}`;
	constructor(e, t, n = {}) {
		super(H.PUBLISHER_UNSPECIFIED, e), this.publishOptions = t, this.selfSubEnabled = n.selfSubEnabled ?? !1, this.on("iceRestart", (e) => {
			e.peerType === H.PUBLISHER_UNSPECIFIED && this.tryRestartIce();
		}), this.on("changePublishQuality", async (e) => {
			for (let t of e.videoSenders) {
				let { trackType: e, publishOptionId: n } = t, r = this.transceiverCache.getBy(n, e);
				r && this.transceiverCache.update(r.publishOption, { videoSender: t }), (!Tf() || this.isPublishing(e)) && await this.changePublishQuality(t, r);
			}
		}), this.on("changePublishOptions", (e) => (this.publishOptions = e.publishOptions, this.syncPublishOptions()));
	}
	async dispose() {
		await super.dispose();
		try {
			await this.stopAllTracks();
		} catch (e) {
			this.logger.warn("Failed to stop tracks during dispose", e);
		}
		this.clonedTracks.clear();
	}
	publish = async (e, t, n = {}) => J(this.transceiverLockKey, async () => {
		let r = this.publishOptions.filter((e) => e.trackType === t);
		if (!r.length) throw Error(`No publish options found for ${U[t]}`);
		for (let t of r) {
			let r = this.cloneTrack(e), i = this.transceiverCache.get(t);
			if (!i) await this.addTransceiver(r, t, n);
			else {
				let e = i.transceiver.sender.track;
				await this.updateTransceiver(i, r, n), K() || this.stopTrack(e);
			}
		}
	});
	addTransceiver = async (e, t, n) => {
		let r = t.trackType, i = Yp(t.trackType) ? Xp(t, n) : tm(e, t), a = Xd(t.codec?.name) ? Zp(i) : i, o = this.pc.addTransceiver(this.e2ee ? e.kind : e, {
			direction: "sendonly",
			sendEncodings: a
		});
		this.transceiverCache.add({
			publishOption: t,
			transceiver: o,
			options: n
		}), this.trackIdToTrackType.set(e.id, r), this.logger.debug(`Added ${U[r]} transceiver`), this.e2ee ? await this.initEncryptedSender(o, e, t) : await this.setDegradationPreference(o.sender, t), await this.negotiate();
	};
	initEncryptedSender = async (e, t, n) => {
		try {
			let { sender: r } = e, i = n.codec?.name.toLowerCase();
			this.e2ee.encrypt(r, i, U[n.trackType]), this.logger.debug("E2EE encryptor attached to sender"), await this.setDegradationPreference(r, n), await r.replaceTrack(t);
		} catch (n) {
			throw this.retireTransceiver(e, t), n;
		}
	};
	setDegradationPreference = async (e, t) => {
		let n = e.getParameters();
		n.degradationPreference = Wp(t.degradationPreference) ?? "maintain-framerate", await e.setParameters(n);
	};
	retireTransceiver = (e, t) => {
		this.transceiverCache.remove(e), this.trackIdToTrackType.delete(t.id), K() || this.stopTrack(t);
		try {
			e.stop();
		} catch (e) {
			this.logger.debug("Failed to stop a retired transceiver", e);
		}
	};
	updateTransceiver = async (e, t, n = {}) => {
		let { transceiver: r, publishOption: i } = e, a = i.trackType, o = r.sender;
		o.track && this.trackIdToTrackType.delete(o.track.id), await o.replaceTrack(t), t && (this.trackIdToTrackType.set(t.id, a), Tf() && e.videoSender && await this.changePublishQuality(e.videoSender, e)), Yp(a) && await this.updateAudioPublishOptions(a, n), t && !e.negotiated && await this.negotiate();
	};
	updateAudioPublishOptions = async (e, t) => {
		for (let n of this.publishOptions) {
			if (n.trackType !== e) continue;
			let r = this.transceiverCache.get(n);
			if (!r) continue;
			let { transceiver: i, options: a } = r;
			if (a.audioBitrateProfile !== t.audioBitrateProfile) {
				let e = Xp(n, t);
				if (e && e.length > 0) {
					let t = i.sender.getParameters(), [n] = t.encodings, [r] = e;
					n.maxBitrate !== r.maxBitrate && (n.maxBitrate = r.maxBitrate), await i.sender.setParameters(t);
				}
			}
			this.transceiverCache.update(n, { options: t });
		}
	};
	syncPublishOptions = async () => J(this.transceiverLockKey, async () => {
		for (let e of this.publishOptions) {
			let { trackType: t } = e;
			if (!this.isPublishing(t) || this.transceiverCache.has(e)) continue;
			let n = this.transceiverCache.find((e) => !!e.transceiver.sender.track && e.publishOption.trackType === t);
			if (!n) continue;
			let r = this.cloneTrack(n.transceiver.sender.track);
			await this.addTransceiver(r, e, n.options);
		}
		for (let e of this.transceiverCache.items()) {
			let { publishOption: t, transceiver: n } = e;
			this.publishOptions.some((e) => e.id === t.id && e.trackType === t.trackType) || (this.stopTrack(n.sender.track), await this.updateTransceiver(e, null));
		}
	});
	isPublishing = (e) => {
		for (let t of this.transceiverCache.items()) {
			if (e && t.publishOption.trackType !== e) continue;
			let n = t.transceiver.sender.track;
			if (n && n.readyState === "live" && n.enabled) return !0;
		}
		return !1;
	};
	refreshTrack = async (e) => {
		for (let t of this.transceiverCache.items()) {
			if (t.publishOption.trackType !== e) continue;
			let { sender: n } = t.transceiver, r = n.track;
			if (r && r.readyState === "live") try {
				await n.replaceTrack(null), await n.replaceTrack(r), this.logger.debug(`Refreshed ${U[e]} sender`);
			} catch (t) {
				this.logger.warn(`Failed to refresh ${U[e]}`, t);
			}
		}
	};
	stopTracks = async (...e) => J(this.eventLockKey("changePublishQuality"), async () => {
		for (let t of this.transceiverCache.items()) {
			let { publishOption: n, transceiver: r } = t;
			if (!e.includes(n.trackType)) continue;
			let i = r.sender.track;
			await this.silenceSenderOnFirefox(t), this.stopTrack(i);
		}
	});
	stopAllTracks = async () => J(this.eventLockKey("changePublishQuality"), async () => {
		for (let e of this.transceiverCache.items()) {
			let t = e.transceiver.sender.track;
			await this.silenceSenderOnFirefox(e), this.stopTrack(t);
		}
		for (let e of this.clonedTracks) this.stopTrack(e);
	});
	changePublishQuality = async (e, t) => {
		let n = e.layers.filter((e) => e.active), r = "Update publish quality:";
		this.logger.info(`${r} requested layers by SFU:`, n);
		let i = t?.transceiver.sender;
		if (!i) return this.logger.warn(`${r} no video sender found.`);
		let a = i.getParameters();
		if (a.encodings.length === 0) return this.logger.warn(`${r} there are no encodings set.`);
		let o = t?.publishOption.codec?.name, s = o && Xd(o), c = !1;
		for (let e of a.encodings) {
			let t = s ? n[0] : n.find((t) => t.name === e.rid) ?? (a.encodings.length === 1 ? n[0] : void 0), r = !!t?.active;
			if (r !== e.active && (e.active = r, c = !0), !t) continue;
			let { maxFramerate: i, scaleResolutionDownBy: o, maxBitrate: l, scalabilityMode: u } = t;
			o >= 1 && o !== e.scaleResolutionDownBy && (e.scaleResolutionDownBy = o, c = !0), l > 0 && l !== e.maxBitrate && (e.maxBitrate = l, c = !0), i > 0 && i !== e.maxFramerate && (e.maxFramerate = i, c = !0), u && u !== e.scalabilityMode && (e.scalabilityMode = u, c = !0);
		}
		let l = Wp(e.degradationPreference);
		l && a.degradationPreference !== l && (a.degradationPreference = l, c = !0);
		let u = a.encodings.filter((e) => e.active);
		if (!c) return this.logger.info(`${r} no change:`, u);
		await i.setParameters(a), this.logger.info(`${r} enabled rids:`, u);
	};
	restartIce = async () => {
		this.logger.debug("Restarting ICE connection");
		let e = this.pc.signalingState;
		this.isIceRestarting || e === "have-local-offer" ? this.logger.debug("ICE restart is already in progress") : await this.negotiate({ iceRestart: !0 });
	};
	negotiate = async (e) => J(`publisher.negotiate.${this.lock}`, async () => {
		let t = await this.pc.createOffer(e);
		try {
			this.isIceRestarting = e?.iceRestart ?? !1, await this.pc.setLocalDescription(t);
			let n = this.getAnnouncedTracks(t.sdp);
			if (!n.length) throw Error("Can't negotiate without any tracks");
			let { sdp: r = "" } = t, { dangerouslyForceCodec: i, dangerouslySetStartBitrateFactor: a, fmtpLine: o } = this.clientPublishOptions || {}, s = i ? qd(r, i, o) : r;
			a !== void 0 && this.transceiverCache.items().forEach((e) => {
				if (e.publishOption.trackType !== U.VIDEO) return;
				let t = e.publishOption.bitrate, r = e.transceiver.sender.track?.id;
				if (!r) return;
				let i = n.find((e) => e.trackId === r)?.mid;
				i && (s = Gd(s, t / 1e3, a, i));
			});
			let { response: c } = await this.sfuClient.setPublisher({
				sdp: s,
				tracks: n
			});
			if (c.error) throw new rf(c.error);
			let { sdp: l } = c;
			await this.pc.setRemoteDescription({
				type: "answer",
				sdp: l
			});
			for (let e of this.transceiverCache.items()) e.transceiver.sender.track && (e.negotiated = !0);
		} catch (e) {
			throw this.pc.signalingState === "have-local-offer" && await this.pc.setLocalDescription({ type: "rollback" }), e;
		} finally {
			this.isIceRestarting = !1;
		}
		this.addTrickledIceCandidates();
	});
	getPublishedTracks = () => {
		let e = [];
		for (let { transceiver: t } of this.transceiverCache.items()) {
			let n = t.sender.track;
			n && n.readyState === "live" && e.push(n);
		}
		return e;
	};
	getAnnouncedTracks = (e) => {
		let t = [];
		for (let n of this.transceiverCache.items()) n.transceiver.sender.track && t.push(this.toTrackInfo(n, e));
		return t;
	};
	getAnnouncedTracksForReconnect = () => {
		let e = this.pc.localDescription?.sdp, t = [];
		for (let n of this.publishOptions) {
			let r = this.transceiverCache.get(n), i = r?.transceiver.sender.track;
			r && i && i.readyState === "live" && t.push(this.toTrackInfo(r, e));
		}
		return t;
	};
	toTrackInfo = (e, t) => {
		let { transceiver: n, publishOption: r } = e, i = n.sender.track, a = i.readyState === "live", o = a ? tm(i, r) : this.transceiverCache.getLayers(r);
		this.transceiverCache.setLayers(r, o);
		let s = Yp(r.trackType), c = this.transceiverCache.indexOf(n), l = this.state.settings?.audio, u = r.trackType === U.SCREEN_SHARE_AUDIO || s && !!l?.hifi_audio_enabled;
		return {
			trackId: i.id,
			layers: $p(o),
			trackType: r.trackType,
			mid: Wd(n, c, t),
			stereo: u,
			dtx: s && !!l?.opus_dtx_enabled,
			red: s && !!l?.redundant_coding_enabled,
			muted: !a,
			codec: r.codec,
			publishOptionId: r.id,
			selfSubAudioVideo: this.selfSubEnabled
		};
	};
	cloneTrack = (e) => {
		let t = e.clone();
		return this.clonedTracks.add(t), t;
	};
	stopTrack = (e) => {
		e && (e.stop(), this.clonedTracks.delete(e));
	};
	silenceSenderOnFirefox = async (e) => {
		if (this.isDisposed || !Tf()) return;
		let { transceiver: t, publishOption: n } = e;
		Yp(n.trackType) ? await t.sender.replaceTrack(null).catch((e) => {
			this.logger.warn("Failed to clear audio sender track", e);
		}) : await this.disableAllEncodings(e);
	};
	disableAllEncodings = async (e) => {
		let { transceiver: t, publishOption: n } = e, r = t.sender, i = r.getParameters();
		if (!i.encodings || i.encodings.length === 0) return;
		e.videoSender || this.transceiverCache.update(n, { videoSender: {
			trackType: n.trackType,
			publishOptionId: n.id,
			codec: n.codec,
			degradationPreference: Gp(i.degradationPreference),
			layers: i.encodings.map((e) => ({
				name: e.rid ?? "q",
				active: e.active ?? !0,
				maxBitrate: e.maxBitrate ?? 0,
				scaleResolutionDownBy: e.scaleResolutionDownBy ?? 0,
				maxFramerate: e.maxFramerate ?? 0,
				scalabilityMode: e.scalabilityMode ?? ""
			}))
		} });
		let a = !1;
		for (let e of i.encodings) e.active !== !1 && (e.active = !1, a = !0);
		a && await r.setParameters(i).catch((e) => {
			this.logger.error("Failed to disable video sender encodings:", e);
		});
	};
}, om = (e, ...t) => {
	for (let n of t) e.includes(n) || e.push(n);
	return e;
}, sm = (e, ...t) => {
	for (let n of t) {
		let t = e.indexOf(n);
		t !== -1 && e.splice(t, 1);
	}
	return e;
}, cm = class extends Up {
	trackedStreams;
	negotiationFailures = 0;
	constructor(e) {
		super(H.SUBSCRIBER, e), this.pc.addEventListener("track", this.handleOnTrack), this.on("subscriberOffer", async (e) => {
			try {
				let t = await this.negotiate(e);
				return this.negotiationFailures = 0, t;
			} catch (e) {
				let t = "subscriber.negotiationFailed";
				this.tracer?.trace(t, e.message), this.logger.warn(t, e);
				let n = ++this.negotiationFailures;
				if (n < 3) return this.tryRestartIce();
				this.logger.error(`negotiation failed ${n} times, rejoining`), this.onReconnectionNeeded?.(W.REJOIN, Hp.SUBSCRIBER_NEGOTIATION_FAILED, this.peerType);
			}
		});
	}
	detachEventHandlers() {
		super.detachEventHandlers(), this.pc.removeEventListener("track", this.handleOnTrack);
	}
	restartIce = async () => {
		if (this.logger.debug("Restarting ICE connection"), this.pc.signalingState === "have-remote-offer") {
			this.logger.debug("ICE negotiation is already in progress");
			return;
		}
		if (this.pc.connectionState === "new") {
			this.logger.debug("ICE connection not yet established, skipping restart");
			return;
		}
		let e = this.isIceRestarting;
		this.isIceRestarting = !0;
		try {
			let { response: e } = await this.sfuClient.iceRestart({ peerType: H.SUBSCRIBER });
			if (e.error) throw new rf(e.error);
		} catch (t) {
			throw this.isIceRestarting = e, t;
		}
	};
	isSelfSubscribedStream = (e) => !!e && !!this.trackedStreams?.has(e);
	handleOnTrack = (e) => {
		let { streams: t, track: n } = e, [r] = t, [i, a] = r.id.split(":"), o = this.state.participants.find((e) => e.trackLookupPrefix === i), s = !!o?.isLocalParticipant;
		this.logger.debug(`[onTrack]: Got remote ${a} track for userId: ${o?.userId}`, n.id, n);
		let c = Jp(a);
		if (!c) return this.logger.error(`Unknown track type: ${a}`);
		let l = `${o?.userId} ${a}:${i}`;
		if (n.addEventListener("mute", () => {
			this.logger.info(`[onTrack]: Track muted: ${l}`), this.setRemoteTrackInterrupted(i, c, !0);
		}), n.addEventListener("unmute", () => {
			this.logger.info(`[onTrack]: Track unmuted: ${l}`), this.setRemoteTrackInterrupted(i, c, !1), this.onRemoteTrackUnmute?.(c, n.id);
		}), n.addEventListener("ended", () => {
			this.logger.info(`[onTrack]: Track ended: ${l}`), this.setRemoteTrackInterrupted(i, c, !1), this.state.removeOrphanedTrack(r.id);
		}), n.muted && this.setRemoteTrackInterrupted(i, c, !0), this.trackIdToTrackType.set(n.id, c), s && (this.trackedStreams ??= /* @__PURE__ */ new WeakSet(), this.trackedStreams.add(r)), !o) {
			this.logger.warn(`[onTrack]: Received track for unknown participant: ${i}`, e), this.state.registerOrphanedTrack({
				id: r.id,
				trackLookupPrefix: i,
				track: r,
				trackType: c,
				receiver: this.e2ee ? e.receiver : void 0
			});
			return;
		}
		if (this.e2ee) {
			let { userId: t } = o;
			this.e2ee.decrypt(e.receiver, t, U[c]), this.logger.debug("E2EE decryptor attached to receiver", t);
		}
		let u = Kp(c);
		if (!u) {
			this.logger.error(`Unknown track type: ${a}`);
			return;
		}
		s && e.track.kind === "audio" && (e.track.enabled = !1);
		let d = o[u];
		if (this.state.updateParticipant(o.sessionId, { [u]: r }), d) {
			if (s && !this.trackedStreams?.has(d)) {
				this.logger.debug(`[onTrack]: Skipping cleanup of previous ${e.track.kind} stream for userId: ${o.userId} because it is not tracked`);
				return;
			}
			this.logger.info(`[onTrack]: Cleaning up previous remote ${n.kind} tracks for userId: ${o.userId}`), d.getTracks().forEach((e) => {
				e.stop(), d.removeTrack(e);
			});
		}
	};
	setRemoteTrackInterrupted = (e, t, n) => {
		if (t !== U.AUDIO) return;
		let r = this.state.participants.find((t) => t.trackLookupPrefix === e);
		r && (r.isLocalParticipant || this.state.updateParticipant(r.sessionId, (e) => {
			let r = e.interruptedTracks ?? [];
			return n === r.includes(t) ? {} : { interruptedTracks: n ? om([...r], t) : sm([...r], t) };
		}));
	};
	negotiate = async (e) => {
		let t = this.pc.currentRemoteDescription?.sdp;
		try {
			await this.pc.setRemoteDescription({
				type: "offer",
				sdp: e.sdp
			}), this.addTrickledIceCandidates();
			let t = await this.pc.createAnswer();
			if (t.sdp) {
				t.sdp = Kd(e.sdp, t.sdp);
				let { dangerouslyForceCodec: n, subscriberFmtpLine: r } = this.clientPublishOptions || {};
				n && (t.sdp = qd(t.sdp, n, r));
			}
			await this.pc.setLocalDescription(t), await this.sfuClient.sendAnswer({
				peerType: H.SUBSCRIBER,
				sdp: t.sdp || "",
				negotiationId: e.negotiationId
			});
		} catch (e) {
			if (this.pc.signalingState === "have-remote-offer") {
				await this.pc.setRemoteDescription({ type: "rollback" }).catch((e) => {
					this.logger.warn("Failed to rollback after negotiation error", e);
				});
				let { iceTrickleBuffer: e } = this.sfuClient;
				e.updateActiveGeneration(this.peerType, t);
			}
			throw e;
		} finally {
			this.isIceRestarting = !1;
		}
	};
}, lm = (e) => {
	let { endpoint: t, onMessage: n, tag: r, tracer: i } = e, a = q.getLogger("SfuClientWS", { tags: [r] });
	a.debug("Creating signaling WS channel:", t);
	let o = new WebSocket(t);
	return o.binaryType = "arraybuffer", o.addEventListener("error", (e) => {
		a.error("Signaling WS channel error", e), i?.trace("signal.ws.error", e);
	}), o.addEventListener("close", (e) => {
		a.info("Signaling WS channel is closed", e), i?.trace("signal.ws.close", e);
	}), o.addEventListener("open", (e) => {
		a.info("Signaling WS channel is open", e), i?.trace("signal.ws.open", e);
	}), o.addEventListener("message", (e) => {
		try {
			let t = e.data instanceof ArrayBuffer ? Lu.fromBinary(new Uint8Array(e.data)) : Lu.fromJsonString(e.data.toString());
			n(t);
		} catch (t) {
			let n = "Failed to decode a message. Check whether the Proto models match.";
			a.error(n, {
				event: e,
				error: t
			}), i?.trace("signal.ws.message.error", n);
		}
	}), o;
}, um = (e) => ({
	bundlePolicy: "max-bundle",
	iceServers: e.map((e) => ({
		urls: e.urls,
		username: e.username,
		credential: e.password
	}))
});
function dm(e) {
	let t = !0, n = e.then((e) => ({
		status: "resolved",
		result: e
	}), (e) => ({
		status: "rejected",
		error: e
	})).finally(() => t = !1), r = () => n.then((e) => {
		if (e.status === "rejected") throw e.error;
		return e.result;
	});
	return r.checkPending = () => t, r;
}
var fm = () => {
	let e, t, n = new Promise((n, r) => {
		e = n, t = r;
	}), r = !1, i = !1;
	return {
		promise: n,
		resolve: (t) => {
			r = !0, e(t);
		},
		reject: (e) => {
			i = !0, t(e);
		},
		isResolved: () => r,
		isRejected: () => i
	};
}, pm = Symbol("uninitialized");
function mm(e) {
	let t = pm;
	return (...n) => (t === pm && (t = e(...n)), t);
}
var hm = !1, gm = () => {
	hm = !0;
}, _m = mm(() => new fl({ useWorker: hm })), vm = class extends Error {
	errorEvent;
	unrecoverable;
	constructor(e) {
		super(e.error?.message || "Join Error"), this.errorEvent = e, this.unrecoverable = e.reconnectStrategy === W.DISCONNECT;
	}
	static isJoinErrorCode(e) {
		let t = e.error?.code;
		return t === Ol.SFU_FULL || t === Ol.SFU_SHUTTING_DOWN || t === Ol.CALL_PARTICIPANT_LIMIT_REACHED;
	}
}, ym = class extends Error {}, bm = () => {
	let e = fm();
	return e.promise.catch(() => {}), e;
}, xm = class e {
	iceTrickleBuffer = new uf();
	sessionId;
	edgeName;
	signalWs;
	signalReady;
	isLeaving = !1;
	isClosingClean = !1;
	signalClosed = !1;
	rpc;
	keepAliveInterval;
	connectionCheckInterval;
	migrateAwayTimeout;
	pingIntervalInMs = 5e3;
	unhealthyTimeoutInMs = this.pingIntervalInMs * 2 + 2e3;
	connectionCheckIntervalInMs = Math.round(this.unhealthyTimeoutInMs / 3);
	lastMessageTimestamp;
	tracer;
	unsubscribeIceTrickle;
	unsubscribeNetworkChanged;
	onSignalClose;
	logger;
	tag;
	credentials;
	dispatcher;
	joinResponseTimeout;
	subscriptionsConcurrencyTag = Symbol("subscriptionsConcurrencyTag");
	networkAvailableTask;
	joinResponseTask = bm();
	migrationTask;
	abortController = new AbortController();
	static NORMAL_CLOSURE = 1e3;
	static ERROR_CONNECTION_UNHEALTHY = 4001;
	static DISPOSE_OLD_SOCKET = 4100;
	static JOIN_FAILED = 4101;
	static LEAVE_NOTIFY_GRACE_MS = 1e3;
	constructor({ dispatcher: e, credentials: t, sessionId: n, cid: r, tag: i, joinResponseTimeout: a = 5e3, rpcRequestTimeout: o = 5e3, onSignalClose: s, streamClient: c, enableTracing: l }) {
		this.dispatcher = e, this.sessionId = n || Nd(), this.onSignalClose = s, this.credentials = t;
		let { server: u, token: d } = t;
		this.edgeName = u.edge_name, this.joinResponseTimeout = a, this.tag = i, this.logger = q.getLogger("SfuClient", { tags: [i] }), this.tracer = l ? new Vp(`${i}-${this.edgeName}`) : void 0, this.rpc = Ed({
			baseUrl: u.url,
			interceptors: [
				xd({
					Authorization: `Bearer ${d}`,
					"X-Stream-Client": Tp(bf())
				}),
				this.tracer && Td(this.tracer.trace),
				this.logger.getLogLevel() === "trace" && wd(this.logger),
				Cd(o, this.tracer?.trace)
			].filter((e) => !!e)
		}), this.unsubscribeIceTrickle = e.on("iceTrickle", i, (e) => {
			this.iceTrickleBuffer.push(e);
		}), this.unsubscribeNetworkChanged = c.on("network.changed", (e) => {
			e.online ? this.networkAvailableTask?.resolve() : this.networkAvailableTask = fm();
		}), this.createWebSocket({
			attempt: i,
			user_id: c.user?.id || "",
			api_key: c.key,
			user_session_id: this.sessionId,
			cid: r
		});
	}
	createWebSocket = (e) => {
		let t = {
			callEnded: !0,
			changePublishQuality: !0,
			changePublishOptions: !0,
			connectionQualityChanged: !0,
			error: !0,
			goAway: !0,
			inboundStateNotification: !0
		};
		this.signalWs = lm({
			tag: this.tag,
			endpoint: `${this.credentials.server.ws_endpoint}?${new URLSearchParams(e).toString()}`,
			tracer: this.tracer,
			onMessage: (e) => {
				this.lastMessageTimestamp = Date.now(), this.scheduleConnectionCheck();
				let n = e.eventPayload.oneofKind;
				t[n] && this.tracer?.trace(n, e), this.dispatcher.dispatch(e, this.tag);
			}
		});
		let n;
		this.signalReady = dm(Promise.race([new Promise((e, t) => {
			let r = !1, i = () => {
				r = !0, clearTimeout(n), this.signalWs.removeEventListener("open", i), e(this.signalWs);
			};
			this.signalWs.addEventListener("open", i), this.signalWs.addEventListener("close", (e) => {
				this.notifySignalClose(`${e.code} ${e.reason ?? ""}`);
				let i = r ? `SFU WS closed: ${e.code} ${e.reason}` : `SFU WS connection can't be established: ${e.code} ${e.reason}`;
				this.tracer?.trace("signal.close", i), clearTimeout(n), t(Error(i));
			});
		}), new Promise((e, t) => {
			n = setTimeout(() => {
				let e = `SFU WS connection failed to open after ${this.joinResponseTimeout}ms`;
				this.tracer?.trace("signal.timeout", e), t(new ym(e));
			}, this.joinResponseTimeout);
		})]));
	};
	get isHealthy() {
		return this.signalWs.readyState === WebSocket.OPEN && this.joinResponseTask.isResolved();
	}
	get joinTask() {
		return this.joinResponseTask.promise;
	}
	notifySignalClose = (e) => {
		if (this.signalClosed) return;
		this.signalClosed = !0;
		let t = _m();
		t.clearInterval(this.keepAliveInterval), t.clearInterval(this.connectionCheckInterval), this.onSignalClose?.(e.trim());
	};
	close = (t = e.NORMAL_CLOSURE, n) => {
		this.isClosingClean = t !== e.ERROR_CONNECTION_UNHEALTHY;
		let r = this.signalWs;
		(r.readyState === WebSocket.OPEN || r.readyState === WebSocket.CONNECTING) && (this.logger.debug(`Closing SFU WS connection: ${t} - ${n}`), r.close(t, `js-client: ${n}`)), this.isClosingClean || this.notifySignalClose(`${t} ${n ?? ""}`), this.dispose(n);
	};
	dispose = (e) => {
		this.logger.debug("Disposing SFU client"), this.unsubscribeIceTrickle(), this.unsubscribeNetworkChanged();
		let t = _m();
		t.clearInterval(this.keepAliveInterval), t.clearInterval(this.connectionCheckInterval), clearTimeout(this.migrateAwayTimeout), this.abortController.abort(), this.migrationTask?.resolve(), !this.joinResponseTask.isResolved() && !this.joinResponseTask.isRejected() && this.joinResponseTask.reject(/* @__PURE__ */ Error(`SFU client disposed before join completed${e ? `: ${e}` : ""}`)), this.iceTrickleBuffer.dispose();
	};
	getTrace = () => this.tracer?.take();
	leaveAndClose = async (t) => {
		try {
			this.isLeaving = !0, !this.joinResponseTask.isResolved() && !this.joinResponseTask.isRejected() && await Promise.race([this.joinResponseTask.promise.catch(() => {}), Dd(e.LEAVE_NOTIFY_GRACE_MS)]), this.joinResponseTask.isResolved() ? await this.notifyLeave(t) : this.logger.debug("[leaveAndClose] join not completed within grace period, skipping notifyLeave");
		} catch (e) {
			this.logger.debug("Error notifying SFU about leaving call", e);
		}
		this.close(e.NORMAL_CLOSURE, t.substring(0, 115));
	};
	updateSubscriptions = async (e) => J(this.subscriptionsConcurrencyTag, async () => (await this.joinTask, Ud((t) => this.rpc.updateSubscriptions({
		sessionId: this.sessionId,
		tracks: e
	}, { invocationMeta: t }), this.abortController.signal)));
	setPublisher = async (e) => (await this.joinTask, Ud((t) => this.rpc.setPublisher({
		...e,
		sessionId: this.sessionId
	}, { invocationMeta: t }), this.abortController.signal, 3));
	sendAnswer = async (e) => (await this.joinTask, Ud((t) => this.rpc.sendAnswer({
		...e,
		sessionId: this.sessionId
	}, { invocationMeta: t }), this.abortController.signal));
	iceTrickle = async (e) => (await this.joinTask, Ud((t) => this.rpc.iceTrickle({
		...e,
		sessionId: this.sessionId
	}, { invocationMeta: t }), this.abortController.signal));
	iceRestart = async (e) => (await this.joinTask, Ud((t) => this.rpc.iceRestart({
		...e,
		sessionId: this.sessionId
	}, { invocationMeta: t }), this.abortController.signal));
	updateMuteStates = async (e) => (await this.joinTask, Ud((t) => this.rpc.updateMuteStates({
		muteStates: e,
		sessionId: this.sessionId
	}, { invocationMeta: t }), this.abortController.signal));
	sendStats = async (e) => (await this.joinTask, this.rpc.sendStats({
		...e,
		sessionId: this.sessionId
	}));
	startNoiseCancellation = async () => (await this.joinTask, Ud((e) => this.rpc.startNoiseCancellation({ sessionId: this.sessionId }, { invocationMeta: e }), this.abortController.signal));
	stopNoiseCancellation = async () => (await this.joinTask, Ud((e) => this.rpc.stopNoiseCancellation({ sessionId: this.sessionId }, { invocationMeta: e }), this.abortController.signal));
	enterMigration = async (e = {}) => {
		this.isLeaving = !0;
		let { timeout: t = 7e3 } = e;
		this.migrationTask?.reject(/* @__PURE__ */ Error("Cancelled previous migration"));
		let n = this.migrationTask = fm(), r = this.dispatcher.on("participantMigrationComplete", this.tag, () => {
			r(), clearTimeout(this.migrateAwayTimeout), n.resolve();
		});
		return this.migrateAwayTimeout = setTimeout(() => {
			r(), n.reject(/* @__PURE__ */ Error(`Migration (${this.tag}) failed to complete in ${t}ms`));
		}, t), n.promise;
	};
	join = async (e) => {
		await this.signalReady(), (this.joinResponseTask.isResolved() || this.joinResponseTask.isRejected()) && (this.joinResponseTask = bm());
		let t = this.joinResponseTask, n, r, i, a = () => {
			clearTimeout(n), n = void 0, i?.(), i = void 0, r?.(), r = void 0;
		};
		i = this.dispatcher.on("error", this.tag, (e) => {
			vm.isJoinErrorCode(e) && (a(), t.reject(new vm(e)));
		}), r = this.dispatcher.on("joinResponse", this.tag, (e) => {
			a(), this.keepAlive(), t.resolve(e);
		}), n = setTimeout(() => {
			a();
			let e = `Waiting for "joinResponse" has timed out after ${this.joinResponseTimeout}ms`;
			this.tracer?.trace("joinRequestTimeout", e), t.reject(new ym(e));
		}, this.joinResponseTimeout);
		let o = Uu.create({ requestPayload: {
			oneofKind: "joinRequest",
			joinRequest: Yu.create({
				...e,
				sessionId: this.sessionId,
				token: this.credentials.token
			})
		} });
		return this.tracer?.trace("joinRequest", o), await this.send(o), t.promise;
	};
	ping = async () => this.send(Uu.create({ requestPayload: {
		oneofKind: "healthCheckRequest",
		healthCheckRequest: {}
	} }));
	notifyLeave = async (e) => this.send(Uu.create({ requestPayload: {
		oneofKind: "leaveCallRequest",
		leaveCallRequest: {
			sessionId: this.sessionId,
			reason: e
		}
	} }));
	send = async (e) => {
		await this.signalReady();
		let t = Uu.toJson(e);
		this.signalWs.readyState === WebSocket.OPEN ? (this.logger.debug(`Sending message to: ${this.edgeName}`, t), this.signalWs.send(Uu.toBinary(e))) : this.logger.debug("Signal WS is not open. Skipping message", t);
	};
	keepAlive = () => {
		let e = _m();
		e.clearInterval(this.keepAliveInterval), this.keepAliveInterval = e.setInterval(() => {
			this.ping().catch((e) => {
				this.logger.error("Error sending healthCheckRequest to SFU", e);
			});
		}, this.pingIntervalInMs);
	};
	scheduleConnectionCheck = () => {
		let t = _m();
		t.clearInterval(this.connectionCheckInterval), this.connectionCheckInterval = t.setInterval(() => {
			this.lastMessageTimestamp && Date.now() - this.lastMessageTimestamp > this.unhealthyTimeoutInMs && this.close(e.ERROR_CONNECTION_UNHEALTHY, `SFU connection unhealthy. Didn't receive any message for ${this.unhealthyTimeoutInMs}ms`);
		}, this.connectionCheckIntervalInMs);
	};
}, Sm = async (e, t) => e.state.callingState === Z.RINGING ? e.isCreatedByMe ? Cm(e, t) : wm(e) : !0, Cm = async (e, t) => {
	let { session: n, members: r, endedAt: i } = e.state, a = e.currentUserId;
	if (i || n?.ended_at) return e.logger.info("ring: the call has ended, leaving"), Tm(e, {
		reject: !1,
		reason: "ended",
		message: "ring: call ended"
	});
	let o = n?.accepted_by ?? {};
	if (Object.keys(o).some((e) => e !== a)) {
		e.logger.info("ring: the call was accepted, joining");
		try {
			await e.join({ joinSource: t });
		} catch (t) {
			return e.logger.error("Failed to join an accepted call", t), !1;
		}
		return !0;
	}
	let s = r.filter((e) => e.user_id !== a).map((e) => e.user_id);
	if (s.length === 0) return !1;
	let c = n?.rejected_by ?? {};
	return s.every((e) => c[e]) ? (e.logger.info("ring: everyone rejected, leaving"), Tm(e, {
		reject: !0,
		reason: "cancel",
		message: "ring: everyone rejected"
	})) : !1;
}, wm = async (e) => {
	let { session: t, endedAt: n, createdBy: r } = e.state;
	if (n || t?.ended_at) return e.logger.info("ring: the call has ended, leaving"), Tm(e, {
		reason: "ended",
		message: "ring: call ended"
	});
	let i = r?.id, a = t?.rejected_by ?? {};
	return i && a[i] ? (e.logger.info("ring: the caller cancelled, leaving"), Tm(e, {
		reason: "ended",
		message: "ring: creator rejected"
	})) : !1;
}, Tm = async (e, t) => {
	try {
		return await e.leave(t), !0;
	} catch (t) {
		return e.logger.error("Failed to leave a ringing call", t), !1;
	}
}, Em = (e) => e !== Z.RINGING && e !== Z.JOINING, Dm = class {
	logger = q.getLogger("RingStatePoller");
	call;
	startAfterMs;
	intervalMs;
	sessionId;
	deadlineAt = 0;
	idleTimeoutId;
	intervalId;
	stopped = !1;
	wasPolling = !1;
	inFlight = !1;
	unsubscribe = [];
	constructor(e, t = {}) {
		this.call = e, this.startAfterMs = t.startAfterMs ?? 9e3, this.intervalMs = t.intervalMs ?? 5e3;
	}
	start = () => {
		if (this.stopped || this.sessionId || this.call.state.callingState !== Z.RINGING) return;
		let e = this.call.state.session?.id;
		if (!e) {
			this.logger.warn("the call has no session");
			return;
		}
		this.sessionId = e;
		let t = this.call.state.settings?.ring, n = t?.auto_cancel_timeout_ms || t?.missed_call_timeout_ms || 3e4;
		this.deadlineAt = Date.now() + n, this.unsubscribe.push(this.call.on("call.accepted", () => this.armIdleWindow()), this.call.on("call.rejected", () => this.armIdleWindow()), this.call.on("call.missed", () => this.armIdleWindow()), zf(this.call.state.callingState$, (e) => {
			Em(e) && this.stop();
		})), this.armIdleWindow();
	};
	pause = () => {
		if (this.stopped) return;
		this.wasPolling = this.intervalId !== void 0;
		let e = _m();
		e.clearTimeout(this.idleTimeoutId), e.clearInterval(this.intervalId), this.idleTimeoutId = void 0, this.intervalId = void 0;
	};
	resume = () => {
		!this.stopped && this.sessionId && this.idleTimeoutId === void 0 && this.intervalId === void 0 && (this.wasPolling ? (this.intervalId = _m().setInterval(this.runTick, this.intervalMs), this.runTick()) : this.armIdleWindow());
	};
	stop = () => {
		if (this.stopped) return;
		this.stopped = !0;
		let e = _m();
		e.clearTimeout(this.idleTimeoutId), e.clearInterval(this.intervalId), this.idleTimeoutId = void 0, this.intervalId = void 0, this.unsubscribe.forEach((e) => e()), this.unsubscribe = [];
	};
	armIdleWindow = () => {
		if (this.stopped) return;
		let e = _m();
		e.clearTimeout(this.idleTimeoutId), e.clearInterval(this.intervalId), this.intervalId = void 0, this.idleTimeoutId = e.setTimeout(() => {
			this.idleTimeoutId = void 0, !this.stopped && (this.intervalId = e.setInterval(this.runTick, this.intervalMs), this.runTick());
		}, this.startAfterMs);
	};
	runTick = () => {
		this.tick().catch((e) => {
			this.logger.warn("Failed to poll the ring state", e);
		});
	};
	tick = async () => {
		if (this.stopped || this.inFlight || !this.sessionId) return;
		let { callingState: e } = this.call.state;
		if (Em(e) || Date.now() >= this.deadlineAt) this.stop();
		else if (e === Z.RINGING) {
			this.inFlight = !0;
			try {
				let e = await this.call.getRingState(this.sessionId);
				if (this.stopped) return;
				this.call.state.updateFromRingState(e), await Sm(this.call, "ring-poll-api") && this.stop();
			} catch (e) {
				let t = e instanceof vl ? e.status : void 0;
				t === 400 || t === 404 ? (this.logger.warn("Stopped polling the ring state", e), this.stop()) : this.logger.debug("Failed to poll the ring state", e);
			} finally {
				this.inFlight = !1;
			}
		}
	};
}, Om = class {
	call;
	timeoutId;
	deadlineAt;
	stopped = !1;
	constructor(e) {
		this.call = e;
	}
	start = () => {
		if (this.stopped || this.timeoutId !== void 0 || this.call.state.callingState !== Z.RINGING) return;
		let e = this.call.state.settings?.ring;
		if (!e) return;
		let t = this.call.isCreatedByMe, n = t ? e.auto_cancel_timeout_ms : e.incoming_call_timeout_ms;
		if (n <= 0) return;
		let r = Date.now();
		this.deadlineAt ??= r + n;
		let i = Math.max(0, this.deadlineAt - r), a = _m();
		this.timeoutId = a.setTimeout(() => {
			this.timeoutId = void 0, this.deadlineAt = void 0, !this.stopped && this.call.state.callingState === Z.RINGING && this.call.leave({
				reject: !0,
				reason: "timeout",
				message: `ringing timeout - ${t ? "no one accepted" : "user didn't interact with incoming call screen"}`
			}).catch((e) => {
				q.getLogger("RingTimeout").error("Failed to drop the call", e);
			});
		}, i);
	};
	pause = () => {
		this.stopped || this.timeoutId === void 0 || (_m().clearTimeout(this.timeoutId), this.timeoutId = void 0);
	};
	stop = () => {
		this.stopped || (this.stopped = !0, _m().clearTimeout(this.timeoutId), this.timeoutId = void 0, this.deadlineAt = void 0);
	};
}, km = ({ session: e, currentUserId: t, callingState: n }) => {
	if (!t) return { settledByMe: !1 };
	let r = !!e?.accepted_by[t], i = !!e?.rejected_by[t];
	return !r && !i ? { settledByMe: !1 } : {
		settledByMe: !0,
		leaveReason: r && n === Z.RINGING ? "answeredElsewhere" : i ? "rejected" : void 0
	};
}, Am = (e) => function() {
	let { callingState: t } = e.state;
	t !== Z.IDLE && t !== Z.LEFT && (e.clientEventReporter.abort(e.cid, {
		code: "BACKEND_LEAVE",
		reason: "call.ended event received"
	}), e.leave({
		message: "call.ended event received",
		reject: !1,
		reason: "ended"
	}).catch((t) => {
		e.logger.error("Failed to leave call after call.ended", t);
	}));
}, jm = (e) => e.on("callEnded", async (t) => {
	if (e.state.callingState !== Z.LEFT) try {
		if (t.reason === Ml.LIVE_ENDED) {
			e.state.setBackstage(!0);
			let { hasPermission: t } = e.permissionsContext;
			if (t(hl.JOIN_BACKSTAGE)) return;
		}
		e.state.setEndedAt(/* @__PURE__ */ new Date());
		let n = Ml[t.reason];
		globalThis.streamRNVideoSDK?.callingX?.endCall(e, "remote"), e.clientEventReporter.abort(e.cid, {
			code: "BACKEND_LEAVE",
			reason: `callEnded received: ${n}`
		}), await e.leave({ message: `callEnded received: ${n}` });
	} catch (t) {
		e.logger.error("Failed to leave call after being ended by the SFU", t);
	}
}), Mm = (e) => function(t) {
	let { currentGrants: n } = t;
	n && e.setCallGrants(n);
}, Nm = (e, t) => e.on("connectionQualityChanged", "*", (e) => {
	let { connectionQualityUpdates: n } = e;
	n && t.updateParticipants(n.reduce((e, t) => {
		let { sessionId: n, connectionQuality: r } = t;
		return e[n] = { connectionQuality: r }, e;
	}, {}));
}), Pm = (e, t) => e.on("healthCheckResponse", "*", (e) => {
	let { participantCount: n } = e;
	n && (t.setParticipantCount(n.total), t.setAnonymousParticipantCount(n.anonymous));
}), Fm = (e, t) => e.on("error", "*", (e) => {
	e.error && e.error.code !== Ol.LIVE_ENDED || (t.state.setBackstage(!0), t.permissionsContext.hasPermission(hl.JOIN_BACKSTAGE) || t.leave({ message: "live ended" }).catch((e) => {
		t.logger.error("Failed to leave call after live ended", e);
	}));
}), Im = (e) => e.on("error", "*", (e) => {
	if (!e.error) return;
	let t = q.getLogger("SfuClient"), { error: n, reconnectStrategy: r } = e;
	t.error("SFU reported error", {
		code: Ol[n.code],
		reconnectStrategy: W[r],
		message: n.message,
		shouldRetry: n.shouldRetry
	});
}), Lm = (e) => function(t) {
	let { pins: n } = t;
	e.setServerSidePins(n);
}, Rm = (e) => function(t) {
	let { inboundVideoStates: n } = t, r = e.getParticipantLookupBySessionId(), i = {};
	for (let { sessionId: e, trackType: t, paused: a } of n) {
		let n = [...r[e]?.pausedTracks ?? []];
		a ? om(n, t) : sm(n, t), i[e] = { pausedTracks: n };
	}
	e.updateParticipants(i);
}, zm = (e) => e.on("trackUnpublished", async (t) => {
	let { cause: n, type: r, sessionId: i } = t, { localParticipant: a } = e.state;
	if (n === Al.MODERATION && i === a?.sessionId) {
		let t = e.logger;
		t.info(`Local participant's ${U[r]} track is muted remotely`);
		try {
			r === U.VIDEO ? await e.camera.disable() : r === U.AUDIO ? await e.microphone.disable() : r === U.SCREEN_SHARE || r === U.SCREEN_SHARE_AUDIO ? await e.screenShare.disable() : t.warn("Unsupported track type to soft mute", U[r]);
		} catch (e) {
			t.error("Failed to stop publishing", e);
		}
	}
}), Bm = (e, t = void 0) => function(n) {
	let { participant: r } = n;
	if (!r) return;
	let i = Gm(e, r, t);
	e.updateOrAddParticipant(r.sessionId, Object.assign(r, i, {
		...n.isPinned && { pin: {
			isLocalPin: !1,
			pinnedAt: Date.now()
		} },
		viewportVisibilityState: {
			videoTrack: G.UNKNOWN,
			screenShareTrack: G.UNKNOWN
		}
	}));
}, Vm = (e) => function(t) {
	let { participant: n } = t;
	n && e.setParticipants((e) => e.filter((e) => e.sessionId !== n.sessionId));
}, Hm = (e) => function(t) {
	let { participant: n } = t;
	n && e.updateParticipant(n.sessionId, n);
}, Um = (e, t = void 0) => function(n) {
	let { type: r, sessionId: i } = n;
	if (n.participant) {
		let r = Gm(e, n.participant, t), a = Object.assign(n.participant, r);
		e.updateOrAddParticipant(i, a);
	} else e.updateParticipant(i, (e) => ({ publishedTracks: om([...e.publishedTracks], r) }));
}, Wm = (e, t = void 0) => function(n) {
	let { type: r, sessionId: i } = n;
	if (n.participant) {
		let a = Gm(e, n.participant, t), o = Object.assign(n.participant, a);
		e.updateOrAddParticipant(i, o, (e) => ({ pausedTracks: e.pausedTracks?.filter((e) => e !== r) }));
	} else e.updateParticipant(i, (e) => ({
		publishedTracks: e.publishedTracks.filter((e) => e !== r),
		pausedTracks: e.pausedTracks?.filter((e) => e !== r)
	}));
}, Gm = (e, t, n) => {
	let r = e.takeOrphanedTracks(t.trackLookupPrefix);
	if (!r.length) return;
	let i = n?.(), a = {};
	for (let e of r) {
		let n = Kp(e.trackType);
		n && (a[n] = e.track, i && e.receiver && i.decrypt(e.receiver, t.userId, U[e.trackType]));
	}
	return a;
}, Km = (e, t) => e.on("dominantSpeakerChanged", "*", (e) => {
	let { sessionId: n } = e;
	n !== t.dominantSpeaker?.sessionId && t.setParticipants((e) => e.map((e) => e.sessionId === n ? {
		...e,
		isDominantSpeaker: !0
	} : e.isDominantSpeaker ? {
		...e,
		isDominantSpeaker: !1
	} : e));
}), qm = (e, t) => e.on("audioLevelChanged", "*", (e) => {
	let { audioLevels: n } = e;
	t.updateParticipants(n.reduce((e, t) => (e[t.sessionId] = {
		audioLevel: t.level,
		isSpeaking: t.isSpeaking
	}, e), {}));
}), Jm = (e, t) => {
	let n = e.state, r = () => e.e2eeManager, i = [
		e.on("call.ended", Am(e)),
		jm(e),
		Fm(t, e),
		Im(t),
		Nm(t, n),
		Pm(t, n),
		e.on("participantJoined", Bm(n, r)),
		e.on("participantLeft", Vm(n)),
		e.on("participantUpdated", Hm(n)),
		e.on("trackPublished", Um(n, r)),
		e.on("trackUnpublished", Wm(n, r)),
		qm(t, n),
		Km(t, n),
		e.on("callGrantsUpdated", Mm(n)),
		e.on("pinsUpdated", Lm(n)),
		e.on("inboundStateNotification", Rm(n)),
		zm(e)
	];
	return () => {
		i.forEach((e) => e());
	};
}, Ym = (e) => {
	let t = () => {
		Sm(e, "ring-ws").catch((t) => {
			e.logger.error("Failed to reconcile the ring state", t);
		});
	}, n = [e.on("call.accepted", () => t()), e.on("call.rejected", () => t())];
	return () => {
		n.forEach((e) => e());
	};
}, Xm = (e, t = "audioTrack") => `${e}/${t}`, Zm = (e) => {
	let [t] = e.srcObject?.getAudioTracks?.() ?? [];
	return {
		paused: e.paused,
		muted: e.muted,
		volume: Math.round(e.volume * 100) / 100,
		readyState: e.readyState,
		sinkId: e.sinkId,
		track: t ? {
			enabled: t.enabled,
			muted: t.muted,
			readyState: t.readyState
		} : null
	};
}, Qm = class {
	bindings = /* @__PURE__ */ new Map();
	tracedStates = /* @__PURE__ */ new Map();
	enabled = !0;
	watchdogInterval;
	unsubscribeCallingState;
	logger = q.getLogger("AudioBindingsWatchdog");
	state;
	tracer;
	constructor(e, t) {
		this.tracer = t, this.state = e, this.unsubscribeCallingState = zf(e.callingState$, (e) => {
			e === Z.JOINED ? this.start() : this.stop();
		});
	}
	register = (e, t, n) => {
		let r = Xm(t, n), i = this.bindings.get(r);
		i && i !== e && (this.logger.warn(`Audio element already bound to ${t} and ${n}`), this.tracer.trace("audioBinding.alreadyBoundWarning", n)), this.bindings.set(r, e);
	};
	unregister = (e, t) => {
		this.bindings.delete(Xm(e, t));
	};
	setEnabled = (e) => {
		this.enabled = e, e ? this.start() : this.state.callingState !== Z.JOINED && this.stop();
	};
	dispose = () => {
		this.stop(), this.bindings.clear(), this.tracedStates.clear(), this.unsubscribeCallingState();
	};
	start = () => {
		clearInterval(this.watchdogInterval), this.watchdogInterval = setInterval(() => {
			this.enabled && this.warnAboutDanglingBindings(), this.traceBindingStates();
		}, 3e3);
	};
	warnAboutDanglingBindings = () => {
		let e = [];
		for (let t of this.state.participants) {
			if (t.isLocalParticipant) continue;
			let { audioStream: n, screenShareAudioStream: r, sessionId: i, userId: a, publishedTracks: o } = t;
			n && o.includes(U.AUDIO) && !this.bindings.has(Xm(i)) && e.push(a), r && o.includes(U.SCREEN_SHARE_AUDIO) && !this.bindings.has(Xm(i, "screenShareAudioTrack")) && e.push(a);
		}
		if (e.length > 0) {
			let t = "audioBinding.danglingWarning";
			this.tracer.traceOnce(t, t, e), this.logger.warn(`Dangling audio bindings detected. Did you forget to bind the audio element? user_ids: ${e}.`);
		}
	};
	traceBindingStates = () => {
		let e = {}, t = !1;
		for (let [n, r] of this.bindings) {
			let i = Zm(r), a = JSON.stringify(i);
			this.tracedStates.get(n) !== a && (this.tracedStates.set(n, a), e[n] = i, t = !0);
		}
		for (let n of this.tracedStates.keys()) this.bindings.has(n) || (this.tracedStates.delete(n), e[n] = null, t = !0);
		t && this.tracer.trace("audioBinding.state", e);
	};
	stop = () => {
		clearInterval(this.watchdogInterval);
	};
}, $m = class {
	logger = q.getLogger("BlockedAudioTracker");
	tracer;
	blockedElementsSubject = new z([]);
	autoplayBlocked$ = this.blockedElementsSubject.pipe(B((e) => e.length > 0), V());
	blockedSessionIds$ = this.blockedElementsSubject.pipe(B((e) => {
		let t = [];
		return e.forEach(({ sessionId: e }) => {
			e && !t.includes(e) && t.push(e);
		}), t;
	}), V(Ff), il({
		bufferSize: 1,
		refCount: !0
	}));
	constructor(e) {
		this.tracer = e;
	}
	markBlocked = (e, t, n) => {
		X(this.blockedElementsSubject, (r) => t ? r.find(({ element: t }) => t === e) ? r.map((t) => t.element === e ? {
			element: e,
			sessionId: n ?? t.sessionId
		} : t) : [...r, {
			element: e,
			sessionId: n
		}] : r.filter(({ element: t }) => t !== e));
	};
	reset = () => {
		this.blockedElementsSubject.getValue().length > 0 && this.blockedElementsSubject.next([]);
	};
	isBlocked = (e) => this.blockedElementsSubject.getValue().some(({ element: t }) => t === e);
	resumeAudio = async () => {
		this.tracer.trace("resumeAudio", null), await Lf(this.blockedElementsSubject, async (e) => {
			let t = e;
			return await Promise.all(e.map(async ({ element: e }) => {
				try {
					e.srcObject && await Od([e.play()], 2e3), t = t.filter((t) => t.element !== e);
				} catch (t) {
					this.logger.warn("Can't resume audio for element", e, t);
				}
			})), t;
		});
	};
}, eh = Symbol("globalOverrideKey"), th = class {
	logger = q.getLogger("TrackSubscriptionManager");
	callState;
	tracer;
	sfuClient;
	pendingUpdate = null;
	overridesSubject = new z({});
	overrides$ = this.overridesSubject.asObservable();
	incomingVideoSettings$ = this.overrides$.pipe(B((e) => {
		let { [eh]: t, ...n } = e;
		return {
			enabled: t?.enabled !== !1,
			preferredResolution: t?.enabled ? t.dimension : void 0,
			participants: Object.fromEntries(Object.entries(n).map(([e, t]) => [e, {
				enabled: t?.enabled !== !1,
				preferredResolution: t?.enabled ? t.dimension : void 0
			}])),
			isParticipantVideoEnabled: (t) => e[t]?.enabled ?? e[eh]?.enabled ?? !0
		};
	}), il(1));
	constructor(e, t) {
		this.tracer = t, this.callState = e;
	}
	setSfuClient = (e) => {
		this.sfuClient = e;
	};
	dispose = () => {
		this.pendingUpdate &&= (clearTimeout(this.pendingUpdate), null);
	};
	get subscriptions() {
		let e = [], t = this.callState.getParticipantsSnapshot(), n = this.overridesSubject.getValue();
		for (let r of t) if (!r.isLocalParticipant) {
			if (r.videoDimension && Kf(r)) {
				let t = n[r.sessionId] ?? n[eh];
				t?.enabled !== !1 && e.push({
					userId: r.userId,
					sessionId: r.sessionId,
					trackType: U.VIDEO,
					dimension: t?.dimension ?? r.videoDimension
				});
			}
			r.screenShareDimension && Jf(r) && e.push({
				userId: r.userId,
				sessionId: r.sessionId,
				trackType: U.SCREEN_SHARE,
				dimension: r.screenShareDimension
			}), Yf(r) && e.push({
				userId: r.userId,
				sessionId: r.sessionId,
				trackType: U.SCREEN_SHARE_AUDIO
			});
		}
		return e;
	}
	get overrides() {
		return Y(this.overrides$);
	}
	setOverrides = (e, t) => (this.tracer.trace("setOverrides", [e, t]), t ? X(this.overridesSubject, (n) => ({
		...n,
		...Object.fromEntries(t.map((t) => [t, e]))
	})) : X(this.overridesSubject, e ? { [eh]: e } : {}));
	apply = (e = vd.SLOW) => {
		this.pendingUpdate && clearTimeout(this.pendingUpdate);
		let t = () => {
			this.pendingUpdate = null, this.sfuClient?.updateSubscriptions(this.subscriptions).catch((e) => {
				this.logger.debug("Failed to update track subscriptions", e);
			});
		};
		e ? this.pendingUpdate = setTimeout(t, e) : t();
	};
}, nh = class {
	logger = q.getLogger("MediaPlaybackWatchdog");
	kind;
	traceInfo;
	isBlocked;
	onGiveUp;
	element;
	tracer;
	controller = new AbortController();
	pendingTimer;
	settleTimer;
	attempt = 0;
	disposed = !1;
	stopped = !1;
	constructor(e) {
		this.element = e.element, this.kind = e.kind, this.traceInfo = {
			kind: e.kind,
			sessionId: e.sessionId,
			trackType: e.trackType
		}, this.tracer = e.tracer, this.isBlocked = e.isBlocked ?? (() => !1), this.onGiveUp = e.onGiveUp ?? (() => {}), this.attach();
	}
	attach = () => {
		if (this.disposed) return;
		let { signal: e } = this.controller;
		this.element.addEventListener("pause", this.onPauseOrSuspend, { signal: e }), this.element.addEventListener("suspend", this.onPauseOrSuspend, { signal: e }), this.element.addEventListener("playing", this.onPlaying, { signal: e });
	};
	dispose = () => {
		this.disposed || (this.disposed = !0, this.controller.abort(), this.clearTimers());
	};
	rearm = () => {
		if (this.disposed) return;
		this.clearTimers(), this.attempt = 0, this.stopped = !1;
		let { paused: e, srcObject: t, ended: n } = this.element;
		e && t && !n && (this.pendingTimer = setTimeout(this.attemptPlay, 0));
	};
	clearTimers = () => {
		this.pendingTimer && clearTimeout(this.pendingTimer), this.pendingTimer = void 0, this.settleTimer && clearTimeout(this.settleTimer), this.settleTimer = void 0;
	};
	onPlaying = () => {
		this.pendingTimer && clearTimeout(this.pendingTimer), this.pendingTimer = void 0, !(this.attempt === 0 || this.settleTimer) && (this.settleTimer ??= setTimeout(this.onSettled, 1e3));
	};
	onSettled = () => {
		this.settleTimer = void 0, !this.element.paused && (this.tracer.trace("mediaPlayback.recover.success", {
			...this.traceInfo,
			attempts: this.attempt
		}), this.attempt = 0, this.stopped = !1);
	};
	onPauseOrSuspend = (e) => {
		if (this.disposed || this.stopped || this.pendingTimer) return;
		let t = this.computeSkipReason();
		t ? e.type === "pause" && this.tracer.trace("mediaPlayback.paused", {
			...this.traceInfo,
			reason: e.type,
			skipped: t
		}) : (this.tracer.trace("mediaPlayback.paused", {
			...this.traceInfo,
			reason: e.type
		}), this.settleTimer && clearTimeout(this.settleTimer), this.settleTimer = void 0, this.scheduleRecovery());
	};
	scheduleRecovery = () => {
		if (this.disposed || this.stopped || this.pendingTimer) return;
		let e = this.computeSkipReason();
		if (e) {
			this.tracer.trace("mediaPlayback.recover.skipped", {
				...this.traceInfo,
				reason: e
			});
			return;
		}
		if (this.attempt >= 10) {
			this.stopped = !0, this.clearTimers(), this.tracer.trace("mediaPlayback.recover.giveUp", {
				...this.traceInfo,
				attempts: this.attempt
			}), this.onGiveUp();
			return;
		}
		let t = this.attempt === 0 ? 0 : jd(this.attempt);
		this.pendingTimer = setTimeout(this.attemptPlay, t);
	};
	computeSkipReason = () => {
		if (this.disposed) return "disposed";
		if (!this.element.srcObject) return "noSrc";
		if (this.element.ended) return "ended";
		if (this.isBlocked()) return "blocked";
		if (this.element.readyState < 2) return "notReady";
		if (!this.element.paused) return "notPaused";
	};
	attemptPlay = async () => {
		if (this.pendingTimer = void 0, !this.disposed) {
			this.attempt += 1, this.tracer.trace("mediaPlayback.recover.attempt", {
				...this.traceInfo,
				attempt: this.attempt
			});
			try {
				await Od([this.element.play()], 2e3);
			} catch (e) {
				if (this.disposed) return;
				this.logger.warn(`Failed to recover ${this.kind} playback`, e), this.scheduleRecovery();
			}
		}
	};
}, rh = () => typeof document > "u" ? !1 : document.visibilityState === "hidden" || navigator.audioSession?.state === "interrupted", ih = (e) => {
	if (typeof document > "u") return () => {};
	let t = rh(), n = () => {
		let n = t;
		t = rh(), n && !t && e();
	}, r = new AbortController(), { signal: i } = r;
	return document.addEventListener("visibilitychange", n, { signal: i }), navigator.audioSession?.addEventListener("statechange", n, { signal: i }), () => r.abort();
}, ah = class {
	logger = q.getLogger("DynascaleManager");
	callState;
	speaker;
	tracer;
	useWebAudio = !1;
	audioContext;
	playbackWatchdogs = /* @__PURE__ */ new Set();
	stopWatchingInterruptions;
	stopTracingAudioSession;
	trackSubscriptionManager;
	blockedAudioTracker;
	constructor(e, t, n, r, i) {
		this.callState = e, this.speaker = t, this.tracer = n, this.trackSubscriptionManager = r, this.blockedAudioTracker = i;
	}
	dispose = async () => {
		this.stopWatchingInterruptions?.(), this.stopWatchingInterruptions = void 0, this.stopTracingAudioSession?.(), this.stopTracingAudioSession = void 0;
		let e = this.audioContext;
		e && e.state !== "closed" && (document.removeEventListener("click", this.resumeAudioContext), await e.close(), this.audioContext = void 0);
	};
	setUseWebAudio = (e) => {
		this.tracer.trace("setUseWebAudio", e), this.useWebAudio = e;
	};
	bindVideoElement = (e, t, n) => {
		let r = this.callState.findParticipantBySessionId(t);
		if (!r) return;
		let i = (e, i) => {
			i && (i.width === 0 || i.height === 0) && (this.logger.debug("Ignoring 0x0 dimension", r), i = void 0), this.callState.updateParticipantTracks(n, { [t]: { dimension: i } }), this.trackSubscriptionManager.apply(e);
		}, a = this.callState.participants$.pipe(B((e) => e.find((e) => e.sessionId === t)), ol((e) => !!e), V(), il({
			bufferSize: 1,
			refCount: !0
		})), o, s = r.isLocalParticipant ? null : a.pipe(B((e) => e.viewportVisibilityState?.[n]), V()).subscribe((t) => {
			if (!o) o = t ?? G.UNKNOWN;
			else {
				if (o = t ?? G.UNKNOWN, t === G.INVISIBLE) return i(vd.MEDIUM, void 0);
				i(vd.MEDIUM, {
					width: e.clientWidth,
					height: e.clientHeight
				});
			}
		}), c, l = r.isLocalParticipant ? null : new ResizeObserver(() => {
			let t = {
				width: e.clientWidth,
				height: e.clientHeight
			};
			if (!c) {
				c = t;
				return;
			}
			if (c.width === t.width && c.height === t.height || o === G.INVISIBLE) return;
			let n = Math.max(t.width / c.width, t.height / c.height) > 1.2 ? vd.IMMEDIATE : vd.MEDIUM;
			i(n, {
				width: e.clientWidth,
				height: e.clientHeight
			}), c = t;
		});
		l?.observe(e);
		let u = n === "videoTrack", d = r.isLocalParticipant ? null : a.pipe(el("publishedTracks"), B((e) => u ? Kf(e) : Jf(e)), V()).subscribe((t) => {
			t ? i(vd.IMMEDIATE, {
				width: e.clientWidth,
				height: e.clientHeight
			}) : i(vd.FAST, void 0);
		});
		e.autoplay = !0, e.playsInline = !0, e.muted = !0;
		let f = this.createPlaybackWatchdog({
			element: e,
			kind: "video",
			tracer: this.tracer,
			sessionId: t,
			trackType: n
		}), p = u ? "videoStream" : "screenShareStream", m = a.pipe(el(p)).subscribe((t) => {
			let n = u ? t.videoStream : t.screenShareStream;
			e.srcObject !== n && (e.srcObject = n ?? null, (Cf() || Tf()) && setTimeout(async () => {
				e.srcObject = n ?? null;
				try {
					await Od([e.play()], 2e3);
				} catch (e) {
					this.logger.warn("Failed to play stream", e);
				}
			}, 25));
		});
		return () => {
			i(vd.FAST, void 0), s?.unsubscribe(), d?.unsubscribe(), m.unsubscribe(), l?.disconnect(), this.disposePlaybackWatchdog(f);
		};
	};
	bindAudioElement = (e, t, n) => {
		let r = this.callState.findParticipantBySessionId(t);
		if (!r || r.isLocalParticipant) return;
		this.traceAudioSessionState();
		let i = this.callState.participants$.pipe(B((e) => e.find((e) => e.sessionId === t)), ol((e) => !!e), V(), il({
			bufferSize: 1,
			refCount: !0
		})), a = (t, n) => {
			t && this.speaker.state.isDeviceSelectionSupported && ("setSinkId" in e && e.setSinkId(t).catch((e) => {
				this.logger.warn("Can't to set AudioElement sinkId", e);
			}), n && "setSinkId" in n && n.setSinkId(t).catch((e) => {
				this.logger.warn("Can't to set AudioContext sinkId", e);
			}));
		}, o, s, c, l = !1, u = () => {
			l = !1, this.blockedAudioTracker.isBlocked(e) && this.blockedAudioTracker.markBlocked(e, !1);
		};
		e.addEventListener("playing", u);
		let d = n === "audioTrack", f = d ? "audioStream" : "screenShareAudioStream", p, m = i.pipe(el(f)).subscribe((r) => {
			let i = d ? r.audioStream : r.screenShareAudioStream;
			e.srcObject !== i && (clearTimeout(p), p = setTimeout(() => {
				if (p = void 0, e.srcObject = i ?? null, this.disposePlaybackWatchdog(c), c = void 0, !i) {
					u();
					return;
				}
				let d = this.getOrCreateAudioContext();
				d ? (e.muted = !0, o?.disconnect(), o = d.createMediaStreamSource(i), s ??= d.createGain(), s.gain.value = r.audioVolume ?? this.speaker.state.volume, o.connect(s).connect(d.destination), this.resumeAudioContext()) : (e.muted = !1, e.play().catch((n) => {
					this.tracer.trace("audioPlaybackError", n.message), n.name === "NotAllowedError" && (this.tracer.trace("audioPlaybackBlocked", null), l = !1, this.blockedAudioTracker.markBlocked(e, !0, t)), this.logger.warn("Failed to play audio stream", n);
				}), c = this.createPlaybackWatchdog({
					element: e,
					kind: "audio",
					tracer: this.tracer,
					sessionId: t,
					trackType: n,
					isBlocked: () => !l && this.blockedAudioTracker.isBlocked(e),
					onGiveUp: () => {
						l = !0, this.blockedAudioTracker.markBlocked(e, !0, t);
					}
				}));
				let { selectedDevice: f } = this.speaker.state;
				f && a(f, d);
			}));
		}), h = this.speaker.state.isDeviceSelectionSupported ? this.speaker.state.selectedDevice$.subscribe((e) => {
			let t = this.getOrCreateAudioContext();
			a(e, t);
		}) : null, g = Nc([this.speaker.state.volume$, i.pipe(el("audioVolume"))]).subscribe(([t, n]) => {
			let r = n.audioVolume ?? t;
			e.volume = r, s && (s.gain.value = r);
		});
		return e.autoplay = !0, () => {
			e.removeEventListener("playing", u), u(), h?.unsubscribe(), g.unsubscribe(), m.unsubscribe(), clearTimeout(p), e.srcObject = null, o?.disconnect(), s?.disconnect(), this.disposePlaybackWatchdog(c), c = void 0;
		};
	};
	createPlaybackWatchdog = (e) => {
		let t = new nh(e);
		return this.playbackWatchdogs.add(t), this.stopWatchingInterruptions ??= ih(this.rearmPlayback), t;
	};
	disposePlaybackWatchdog = (e) => {
		e && (e.dispose(), this.playbackWatchdogs.delete(e));
	};
	rearmPlayback = () => {
		this.tracer.trace("mediaPlayback.rearm", this.playbackWatchdogs.size), this.playbackWatchdogs.forEach((e) => e.rearm());
	};
	traceAudioSessionState = () => {
		let e = navigator.audioSession;
		if (!e || this.stopTracingAudioSession) return;
		let t = () => {
			this.tracer.trace("audioSession.state", e.state);
		};
		t(), e.addEventListener("statechange", t), this.stopTracingAudioSession = () => {
			e.removeEventListener("statechange", t);
		};
	};
	getOrCreateAudioContext = () => {
		if (!this.useWebAudio) return;
		if (this.audioContext) return this.audioContext;
		let e = new AudioContext();
		this.tracer.trace("audioContext.create", e.state), e.state === "suspended" && document.addEventListener("click", this.resumeAudioContext), e.addEventListener("statechange", () => {
			this.tracer.trace("audioContext.state", e.state), e.state === "interrupted" && this.resumeAudioContext();
		});
		let t = navigator.audioSession;
		if (t) {
			t.type = "play-and-record";
			let e = !1;
			t.addEventListener("statechange", () => {
				t.state === "interrupted" ? e = !0 : e &&= (this.resumeAudioContext(), !1);
			});
		}
		return this.audioContext = e;
	};
	resumeAudioContext = () => {
		if (!this.audioContext) return;
		let { state: e } = this.audioContext;
		if (e === "suspended" || e === "interrupted") {
			let e = "audioContext.resume";
			this.audioContext.resume().then(() => {
				this.tracer.trace(e, this.audioContext?.state), document.removeEventListener("click", this.resumeAudioContext);
			}, (t) => {
				this.tracer.trace(`${e}Error`, this.audioContext?.state), this.logger.warn("Can't resume audio context", t);
			});
		}
	};
}, oh = (e, t) => {
	let n = !1, r = () => {
		n || (n = !0, t());
	};
	if (typeof e.requestVideoFrameCallback == "function") {
		let t = e.requestVideoFrameCallback(r);
		return () => {
			n = !0, e.cancelVideoFrameCallback(t);
		};
	}
	return e.readyState >= e.HAVE_CURRENT_DATA ? (queueMicrotask(r), () => {
		n = !0;
	}) : (e.addEventListener("loadeddata", r, { once: !0 }), () => {
		n = !0, e.removeEventListener("loadeddata", r);
	});
}, sh = .35, ch = {
	videoTrack: G.UNKNOWN,
	screenShareTrack: G.UNKNOWN
}, lh = class {
	callState;
	elementHandlerMap = /* @__PURE__ */ new Map();
	observer = null;
	queueSet = /* @__PURE__ */ new Set();
	constructor(e) {
		this.callState = e;
	}
	setViewport = (e, t) => {
		let n = () => {
			this.observer?.disconnect(), this.observer = null, this.elementHandlerMap.clear();
		};
		return this.observer = new IntersectionObserver((e) => {
			e.forEach((e) => {
				this.elementHandlerMap.get(e.target)?.(e);
			});
		}, {
			root: e,
			...t,
			threshold: t?.threshold ?? sh
		}), this.queueSet.size && (this.queueSet.forEach(([t, n]) => {
			e.contains(t) && (this.observer.observe(t), this.elementHandlerMap.set(t, n));
		}), this.queueSet.clear()), n;
	};
	observe = (e, t) => {
		let n = [e, t], r = () => {
			this.elementHandlerMap.delete(e), this.observer?.unobserve(e), this.queueSet.delete(n);
		};
		return this.elementHandlerMap.has(e) ? r : this.observer ? (this.observer.root.contains(e) && (this.elementHandlerMap.set(e, t), this.observer.observe(e)), r) : (this.queueSet.add(n), r);
	};
	trackElementVisibility = (e, t, n) => {
		let r = this.observe(e, (r) => {
			this.callState.updateParticipant(t, (t) => {
				let i = t.viewportVisibilityState ?? ch, a = r.isIntersecting || document.fullscreenElement === e ? G.VISIBLE : G.INVISIBLE;
				return {
					...t,
					viewportVisibilityState: {
						...i,
						[n]: a
					}
				};
			});
		});
		return () => {
			r(), this.callState.updateParticipant(t, (e) => {
				let t = e.viewportVisibilityState ?? ch;
				return {
					...e,
					viewportVisibilityState: {
						...t,
						[n]: G.UNKNOWN
					}
				};
			});
		};
	};
}, uh = class {
	permissions = [];
	settings;
	setPermissions = (e) => {
		this.permissions = e || [];
	};
	setCallSettings = (e) => {
		this.settings = e;
	};
	hasPermission = (e) => this.permissions.includes(e);
	canPublish = (e) => {
		switch (e) {
			case U.AUDIO: return this.hasPermission(hl.SEND_AUDIO);
			case U.VIDEO: return this.hasPermission(hl.SEND_VIDEO);
			case U.SCREEN_SHARE:
			case U.SCREEN_SHARE_AUDIO: return this.hasPermission(hl.SCREENSHARE);
			case U.UNSPECIFIED: return !1;
			default: return lf(e, "Unknown track type"), !1;
		}
	};
	canRequest = (e, t = this.settings) => {
		if (!t) return !1;
		let { audio: n, video: r, screensharing: i } = t;
		switch (e) {
			case gl.SEND_AUDIO: return n.access_request_enabled;
			case gl.SEND_VIDEO: return r.access_request_enabled;
			case gl.SCREENSHARE: return i.access_request_enabled;
			default: return lf(e), !1;
		}
	};
}, dh = class {
	name;
	options;
	constructor(e, t = { sortParticipantsBy: pp }) {
		this.name = e, this.options = t;
	}
}, fh = new class {
	callTypes;
	constructor(e) {
		this.callTypes = e.reduce((e, t) => (e[t.name] = t, e), {});
	}
	register = (e) => {
		this.callTypes[e.name] = e;
	};
	unregister = (e) => {
		delete this.callTypes[e];
	};
	get = (e) => (this.callTypes[e] || this.register(new dh(e)), this.callTypes[e]);
}([
	new dh("default", { sortParticipantsBy: pp }),
	new dh("development", { sortParticipantsBy: pp }),
	new dh("livestream", { sortParticipantsBy: gp }),
	new dh("audio_room", { sortParticipantsBy: gp })
]), ph = class {
	maxAttempts;
	windowMs;
	timestamps = [];
	constructor(e, t) {
		this.maxAttempts = e, this.windowMs = t;
	}
	tryRegister = (e = Date.now()) => (this.prune(e), this.timestamps.length >= this.maxAttempts ? !1 : (this.timestamps.push(e), !0));
	reset = () => {
		this.timestamps = [];
	};
	setLimits = (e, t) => {
		this.maxAttempts = e, this.windowMs = t;
	};
	prune = (e) => {
		let t = e - this.windowMs;
		this.timestamps = this.timestamps.filter((e) => e >= t);
	};
}, mh = (e) => {
	e.active && (e.getTracks().forEach((e) => {
		e.stop();
	}), typeof e.release == "function" && e.release());
}, hh = class {
	permission;
	ready;
	disposeController = new AbortController();
	state;
	wasPrompted = !1;
	listeners = /* @__PURE__ */ new Set();
	logger = q.getLogger("permissions");
	constructor(e) {
		this.permission = e;
		let t = this.disposeController.signal;
		this.ready = (async () => {
			let n = () => {
				K() ? this.setState("granted") : this.setState("prompt");
			};
			if (!gh()) return n();
			try {
				let n = await navigator.permissions.query({ name: e.queryName });
				t.aborted || (this.setState(n.state), n.addEventListener("change", () => this.setState(n.state), { signal: t }));
			} catch (e) {
				this.logger.debug("Failed to query permission status", e), n();
			}
		})();
	}
	dispose() {
		this.state = void 0, this.disposeController.abort();
	}
	async getState() {
		if (await this.ready, !this.state) throw Error("BrowserPermission instance possibly disposed");
		return this.state;
	}
	async prompt({ forcePrompt: e = !1, throwOnNotAllowed: t = !1 } = {}) {
		return await J(`permission-prompt-${this.permission.queryName}`, async () => {
			if (await this.getState() !== "prompt" || this.wasPrompted && !e) {
				let e = this.state === "granted";
				if (!e && t) throw Error("Permission was not granted previously, and prompting again is not allowed");
				return e;
			}
			try {
				return this.wasPrompted = !0, this.setState("prompting"), mh(await navigator.mediaDevices.getUserMedia(this.permission.constraints)), this.setState("granted"), !0;
			} catch (e) {
				if (e && typeof e == "object" && "name" in e && (e.name === "NotAllowedError" || e.name === "SecurityError")) {
					if (this.logger.info("Browser permission was not granted", { permission: this.permission }), this.setState("denied"), t) throw e;
					return !1;
				}
				throw this.logger.error("Failed to getUserMedia", {
					error: e,
					permission: this.permission
				}), this.setState("prompt"), e;
			}
		});
	}
	listen(e) {
		return this.listeners.add(e), this.state && e(this.state), () => this.listeners.delete(e);
	}
	asObservable() {
		return this.getStateObservable().pipe(B((e) => e !== "denied"));
	}
	asStateObservable() {
		return this.getStateObservable();
	}
	getIsPromptingObservable() {
		return this.getStateObservable().pipe(B((e) => e === "prompting"));
	}
	getStateObservable() {
		return Yc((e) => this.listen(e), (e, t) => t());
	}
	setState(e) {
		if (this.state !== e) {
			let { tracer: t, queryName: n } = this.permission, r = `navigator.mediaDevices.${n}.permission`;
			t?.trace(r, {
				previous: this.state,
				state: e
			}), this.state = e, this.listeners.forEach((t) => t(e));
		}
	}
};
function gh() {
	return !K() && typeof navigator < "u" && !!navigator.permissions?.query;
}
var _h = (e, t, n) => yc((async () => {
	let r = await navigator.mediaDevices.enumerateDevices();
	return r.some((e) => e.kind === t && e.label === "") && await e.prompt() && (r = await navigator.mediaDevices.enumerateDevices()), n?.traceOnce("device-enumeration", "navigator.mediaDevices.enumerateDevices", r), r.filter((e) => e.kind === t && e.label !== "" && e.deviceId !== "default");
})()), vh = () => typeof document > "u" || wf() ? !1 : "setSinkId" in document.createElement("audio"), yh = { audio: {
	autoGainControl: !0,
	noiseSuppression: !0,
	echoCancellation: !0
} }, bh = { video: {
	width: 1280,
	height: 720
} }, xh = mm((e) => new hh({
	constraints: yh,
	queryName: "microphone",
	tracer: e
})), Sh = mm((e) => new hh({
	constraints: bh,
	queryName: "camera",
	tracer: e
})), Ch = mm((e) => navigator.mediaDevices.addEventListener ? Wc(navigator.mediaDevices, "devicechange").pipe(sl(() => e?.resetTrace("device-enumeration")), B(() => void 0), Qc(500)) : yc([])), wh = mm((e) => Xc(Ch(e), xh(e).asObservable()).pipe(al([]), Zc(() => _h(xh(e), "audioinput", e)), il(1))), Th = mm((e) => Xc(Ch(e), Sh(e).asObservable()).pipe(al([]), Zc(() => _h(Sh(e), "videoinput", e)), il(1))), Eh = mm((e) => Xc(Ch(e), xh(e).asObservable()).pipe(al([]), Zc(() => _h(xh(e), "audiooutput", e)), il(1))), Dh = 0, Oh = async (e, t) => {
	let n = `navigator.mediaDevices.getUserMedia.${Dh++}.`;
	try {
		t?.trace(n, e);
		let r = await navigator.mediaDevices.getUserMedia(e);
		if (t?.trace(`${n}OnSuccess`, xp(r)), Tf() && navigator.mediaDevices.dispatchEvent(new Event("devicechange")), e.video) {
			let [i] = r.getVideoTracks();
			if (i) {
				let { width: r, height: a } = i.getSettings(), o = e.video;
				(r !== o.width || a !== o.height) && t?.trace(`${n}Warn`, `Requested resolution ${o.width}x${o.height} but got ${r}x${a}`);
			}
		}
		return r;
	} catch (e) {
		throw t?.trace(`${n}OnFailure`, e.name), e;
	}
};
function kh(e) {
	if (!e || typeof e != "object") return !1;
	if ("name" in e && typeof e.name == "string") {
		let t = e.name;
		if (["OverconstrainedError", "NotFoundError"].includes(t)) return !0;
	}
	return !!("message" in e && typeof e.message == "string" && e.message.startsWith("OverconstrainedError"));
}
var Ah = async (e, t) => {
	let n = { audio: {
		...yh.audio,
		...e
	} };
	try {
		return await xh(t).prompt({
			throwOnNotAllowed: !0,
			forcePrompt: !0
		}), await Oh(n, t);
	} catch (r) {
		let i = q.getLogger("devices");
		if (kh(r) && e?.deviceId) {
			let { deviceId: a, ...o } = e;
			return i.warn("Failed to get audio stream, will try again with relaxed constraints", {
				error: r,
				constraints: n,
				relaxedConstraints: o
			}), Ah(o, t);
		}
		throw i.error("Failed to get audio stream", {
			error: r,
			constraints: n
		}), r;
	}
}, jh = async (e, t) => {
	let n = { video: {
		...bh.video,
		...e
	} };
	try {
		return await Sh(t).prompt({
			throwOnNotAllowed: !0,
			forcePrompt: !0
		}), await Oh(n, t);
	} catch (r) {
		let i = q.getLogger("devices");
		if (kh(r) && e?.deviceId) {
			let { deviceId: a, ...o } = e;
			return i.warn("Failed to get video stream, will try again with relaxed constraints", {
				error: r,
				constraints: n,
				relaxedConstraints: o
			}), jh(o, t);
		}
		throw i.error("Failed to get video stream", {
			error: r,
			constraints: n
		}), r;
	}
}, Mh = 0, Nh = async (e, t) => {
	let n = `navigator.mediaDevices.getDisplayMedia.${Mh++}.`;
	try {
		let r = {
			systemAudio: "include",
			...e,
			video: typeof e?.video == "boolean" ? e.video : {
				width: { max: 2560 },
				height: { max: 1440 },
				frameRate: { ideal: 30 },
				...e?.video
			},
			audio: typeof e?.audio == "boolean" ? e.audio : {
				channelCount: { ideal: 2 },
				restrictOwnAudio: !0,
				echoCancellation: !1,
				autoGainControl: !1,
				noiseSuppression: !1,
				...e?.audio
			}
		};
		t?.trace(n, r);
		let i = await navigator.mediaDevices.getDisplayMedia(r);
		return t?.trace(`${n}OnSuccess`, xp(i)), i;
	} catch (e) {
		throw t?.trace(`${n}OnFailure`, e.name), q.getLogger("devices").error("Failed to get screen share stream", e), e;
	}
}, Ph = typeof navigator < "u" && navigator.mediaDevices !== void 0 ? Ch().pipe(al(void 0), Zc(() => navigator.mediaDevices.enumerateDevices()), il(1)) : void 0;
function Fh(e, t) {
	if (e !== "default") return e;
	let n = Ph && Y(Ph);
	if (!n) return e;
	let r = n.find((t) => t.deviceId === e);
	if (!r) return e;
	let i = r.groupId, a = n.filter((e) => e.kind === t && e.deviceId !== "default" && e.groupId === i);
	return a.length === 1 ? a[0].deviceId : e;
}
var Ih = () => /Mobi/i.test(navigator.userAgent), Lh = "default", Rh = () => typeof window < "u" && window.localStorage !== void 0, zh = (e) => ({
	storageKey: e?.storageKey ?? "@stream-io/device-preferences",
	enabled: Rh() && !K() ? e?.enabled ?? !0 : !1
}), Bh = (e, t, n = "") => ({
	deviceId: e,
	kind: t,
	label: n,
	groupId: ""
}), Vh = (e) => {
	try {
		let t = window.localStorage.getItem(e) || "{}";
		return JSON.parse(t);
	} catch {
		return {};
	}
}, Hh = (e, t, n, r) => {
	if (!Rh()) return;
	let i = e?.deviceId ?? Lh, a = e?.label ?? "", o = Vh(r), s = [o[t] ?? []].flat().filter((e) => e.selectedDeviceId !== i && (e.selectedDeviceLabel === "" || e.selectedDeviceLabel !== a)), c = {
		...o,
		[t]: [{
			selectedDeviceId: i,
			selectedDeviceLabel: a,
			...typeof n == "boolean" ? { muted: n } : {}
		}, ...s].slice(0, 3)
	};
	try {
		window.localStorage.setItem(r, JSON.stringify(c));
	} catch (e) {
		q.getLogger("DevicePersistence").error("failed to save device preferences", e);
	}
}, Uh = (e) => e ? [e].flat() : [], Wh = class {
	stopOnLeave = !0;
	logger;
	state;
	call;
	trackType;
	subscriptions = [];
	currentStreamCleanups = [];
	devicePersistence;
	areSubscriptionsSetUp = !1;
	isTrackStoppedDueToTrackEnd = !1;
	filters = [];
	virtualDevicesSubject = new z([]);
	activeVirtualSession;
	virtualDeviceConcurrencyTag = Symbol("virtualDeviceConcurrencyTag");
	statusChangeConcurrencyTag = Symbol("statusChangeConcurrencyTag");
	filterRegistrationConcurrencyTag = Symbol("filterRegistrationConcurrencyTag");
	constructor(e, t, n, r) {
		this.call = e, this.state = t, this.trackType = n, this.devicePersistence = r, this.logger = q.getLogger(`${U[n].toLowerCase()} manager`), this.setup();
	}
	setup() {
		this.areSubscriptionsSetUp || (this.areSubscriptionsSetUp = !0, Ph && !K() && (this.trackType === U.AUDIO || this.trackType === U.VIDEO) && this.handleDisconnectedOrReplacedDevices(), this.devicePersistence.enabled && this.subscriptions.push(zf(Nc([
			this.state.selectedDevice$,
			this.state.status$,
			this.state.browserPermissionState$
		]), ([e, t, n]) => {
			!t || this.isTrackStoppedDueToTrackEnd && t === "disabled" || n !== "granted" || this.persistPreference(e, t);
		})));
	}
	listDevices() {
		return Nc([this.getDevices(), this.virtualDevicesSubject]).pipe(B(([e, t]) => [...e, ...t.map((e) => Bh(e.deviceId, e.kind, e.label))]));
	}
	registerVirtualDevice(e) {
		if (K()) throw Error("Virtual devices are not supported on React Native.");
		if (this.trackType !== U.AUDIO && this.trackType !== U.VIDEO) throw Error("Virtual devices are only supported for camera and microphone.");
		let t = `stream-virtual:${Nd()}`, n = {
			deviceId: t,
			kind: this.mediaDeviceKind,
			...e
		};
		return X(this.virtualDevicesSubject, (e) => [...e, n]), {
			deviceId: n.deviceId,
			unregister: async () => {
				await J(this.virtualDeviceConcurrencyTag, async () => {
					X(this.virtualDevicesSubject, (e) => e.filter((e) => e !== n)), this.activeVirtualSession?.deviceId === t && await this.stopActiveVirtualSession();
				}), this.state.selectedDevice === t && (await this.statusChangeSettled(), await this.disable({ forceStop: !0 }), await this.select(void 0));
			}
		};
	}
	sanitizeVirtualStream(e) {
		return e.getTracks().forEach((e) => {
			let t = e.getSettings.bind(e);
			e.getSettings = () => {
				let { deviceId: e, ...n } = t();
				return n;
			};
		}), e;
	}
	findVirtualDevice(e) {
		if (e) return Y(this.virtualDevicesSubject).find((t) => t.deviceId === e);
	}
	async stopActiveVirtualSession() {
		let e = this.activeVirtualSession;
		this.activeVirtualSession = void 0, await e?.stop?.();
	}
	async getSelectedStream(e) {
		let t = this.state.selectedDevice;
		return t?.startsWith("stream-virtual") ? J(this.virtualDeviceConcurrencyTag, async () => {
			let n = this.findVirtualDevice(t);
			if (!n) throw Error(`Virtual device is not registered: ${t}`);
			await this.stopActiveVirtualSession();
			let { stream: r, stop: i } = await n.getUserMedia(e);
			return this.activeVirtualSession = {
				deviceId: t,
				stop: i
			}, this.sanitizeVirtualStream(r);
		}) : this.getStream(e);
	}
	get enabled() {
		return this.state.status === "enabled";
	}
	async enable() {
		this.state.prevStatus = this.state.optimisticStatus, this.state.optimisticStatus !== "enabled" && (this.state.setPendingStatus("enabled"), await Df(this.statusChangeConcurrencyTag, async (e) => {
			try {
				await this.unmuteStream(), this.state.setStatus("enabled");
			} finally {
				e.aborted || this.state.setPendingStatus(this.state.status);
			}
		}));
	}
	async disable(e) {
		let t = typeof e == "boolean" ? e : e?.forceStop ?? !1;
		this.state.prevStatus = this.state.optimisticStatus, this.state.setError(void 0), (t || this.state.optimisticStatus !== "disabled") && (this.state.setPendingStatus("disabled"), await Df(this.statusChangeConcurrencyTag, async (e) => {
			try {
				let e = t || this.state.disableMode === "stop-tracks";
				await this.muteStream(e), this.state.setStatus("disabled"), this.state.setError(void 0);
			} finally {
				e.aborted || this.state.setPendingStatus(this.state.status);
			}
		}));
	}
	async statusChangeSettled() {
		await jf(this.statusChangeConcurrencyTag);
	}
	async resume() {
		this.state.prevStatus === "enabled" && this.state.status !== "enabled" && await this.enable();
	}
	async toggle() {
		return this.state.optimisticStatus === "enabled" ? await this.disable() : await this.enable();
	}
	registerFilter(e) {
		let t = {
			start: e,
			stop: void 0
		};
		return this.call.tracer.trace(`registerFilter.${U[this.trackType]}`, null), {
			registered: J(this.filterRegistrationConcurrencyTag, async () => {
				await jf(this.statusChangeConcurrencyTag), this.filters.push(t), await this.applySettingsToStream();
			}),
			unregister: () => J(this.filterRegistrationConcurrencyTag, async () => {
				await jf(this.statusChangeConcurrencyTag), t.stop?.(), this.filters = this.filters.filter((e) => e !== t), await this.applySettingsToStream(), this.call.tracer.trace(`unregisterFilter.${U[this.trackType]}`, null);
			})
		};
	}
	setDefaultConstraints(e) {
		this.state.setDefaultConstraints(e);
	}
	async select(e) {
		if (K()) throw Error("This method is not supported in React Native.");
		let t = this.state.selectedDevice;
		if (e !== t) try {
			this.state.setDevice(e), await this.applySettingsToStream();
		} catch (e) {
			throw this.state.setDevice(t), e;
		}
	}
	dispose = () => {
		this.runCurrentStreamCleanups(), this.subscriptions.forEach((e) => e()), this.subscriptions = [], this.areSubscriptionsSetUp = !1, this.virtualDevicesSubject.next([]);
	};
	runCurrentStreamCleanups = () => {
		this.currentStreamCleanups.forEach((e) => e()), this.currentStreamCleanups = [];
	};
	async applySettingsToStream() {
		await Df(this.statusChangeConcurrencyTag, async (e) => {
			if (this.enabled) try {
				if (await this.muteStream(), this.state.setStatus("disabled"), e.aborted) return;
				await this.unmuteStream(), this.state.setStatus("enabled");
			} finally {
				e.aborted || this.state.setPendingStatus(this.state.status);
			}
		});
	}
	getResolvedConstraints(e) {
		return e;
	}
	publishStream(e, t) {
		return this.call.publish(e, this.trackType, t);
	}
	stopPublishStream() {
		return this.call.stopPublish(this.trackType);
	}
	getTracks() {
		return this.state.mediaStream?.getTracks() ?? [];
	}
	async muteStream(e = !0) {
		let t = this.state.mediaStream;
		t && (this.logger.debug(`${e ? "Stopping" : "Disabling"} stream`), this.call.state.callingState === Z.JOINED && await this.stopPublishStream(), this.muteLocalStream(e), this.getTracks().every((e) => e.readyState === "ended") && (await this.stopActiveVirtualSession(), typeof t.release == "function" && t.release(), this.runCurrentStreamCleanups(), this.state.setMediaStream(void 0, void 0), this.setLocalInterrupted(!1), this.filters.forEach((e) => e.stop?.())));
	}
	reconcileOptimisticStatus = async () => {
		let e = this.state.optimisticStatus;
		await Df(this.statusChangeConcurrencyTag, async (t) => {
			try {
				e === "enabled" && this.state.status !== "enabled" ? (await this.unmuteStream(), t.aborted || this.state.setStatus("enabled")) : e === "disabled" && this.state.status === "enabled" && (t.aborted || this.state.setStatus("disabled"));
			} finally {
				t.aborted || this.state.setPendingStatus(this.state.status);
			}
		});
	};
	disableTracks() {
		this.getTracks().forEach((e) => {
			e.enabled &&= !1;
		});
	}
	enableTracks() {
		this.getTracks().forEach((e) => {
			e.enabled ||= !0;
		});
	}
	stopTracks() {
		this.getTracks().forEach((e) => {
			e.readyState === "live" && e.stop();
		});
	}
	muteLocalStream(e) {
		this.state.mediaStream && (e ? this.stopTracks() : this.disableTracks());
	}
	async unmuteStream() {
		this.logger.debug("Starting stream");
		let e, t;
		if (this.state.mediaStream && this.getTracks().every((e) => e.readyState === "live")) e = this.state.mediaStream, this.enableTracks();
		else {
			this.runCurrentStreamCleanups();
			let n = this.state.defaultConstraints, r = this.getResolvedConstraints({
				...n,
				deviceId: this.state.selectedDevice ? { exact: this.state.selectedDevice } : void 0
			}), i = (e) => async (t) => {
				if (!e) return t;
				let n = await e;
				return t.getTracks().forEach((e) => {
					let t = e.stop;
					e.stop = function() {
						t.call(e), n.getTracks().forEach((t) => {
							t.kind === e.kind && t.stop();
						});
					};
				}), n.getTracks().forEach((e) => {
					let n = () => {
						t.getTracks().forEach((t) => {
							e.kind === t.kind && (t.stop(), t.dispatchEvent(new Event("ended")));
						});
					};
					e.addEventListener("ended", n), this.currentStreamCleanups.push(() => {
						e.removeEventListener("ended", n);
					});
				}), t;
			};
			this.state.setError(void 0), t = this.getSelectedStream(r), t.catch((e) => {
				this.state.setError(e);
			}), e = await this.filters.reduce((e, t) => e.then((e) => {
				let { stop: n, output: r } = t.start(e);
				return t.stop = n, r;
			}).then(i(e), (t) => (this.logger.warn("Filter failed to start and will be ignored", t), e)), t);
		}
		if (this.call.state.callingState === Z.JOINED && await this.publishStream(e), this.state.mediaStream !== e) {
			let n = await t;
			if (this.state.setMediaStream(e, n), n) {
				let e = async () => {
					this.setLocalInterrupted(!1), await this.statusChangeSettled(), this.enabled && (this.isTrackStoppedDueToTrackEnd = !0, setTimeout(() => {
						this.isTrackStoppedDueToTrackEnd = !1;
					}, 2e3), await this.disable());
				}, t = (e) => () => {
					this.setLocalInterrupted(e), !e && wf() && document.visibilityState !== "hidden" && this.call.refreshPublishedTrack(this.trackType).catch((e) => {
						this.logger.warn("Failed to refresh track on system unmute", e);
					}), (Ih() || this.trackType == U.VIDEO) && (this.call.tracer.trace("navigator.mediaDevices.muteStateUpdated", {
						trackType: U[this.trackType],
						muted: e
					}), this.call.notifyTrackMuteState(e, this.trackType).catch((e) => {
						this.logger.warn("Error while notifying track mute state", e);
					}));
				};
				n.getTracks().forEach((n) => {
					let r = t(!0), i = t(!1);
					n.addEventListener("mute", r), n.addEventListener("unmute", i), n.addEventListener("ended", e), this.currentStreamCleanups.push(() => {
						n.removeEventListener("mute", r), n.removeEventListener("unmute", i), n.removeEventListener("ended", e);
					});
				});
				let r = n.getTracks().some((e) => e.muted);
				this.setLocalInterrupted(r);
			} else this.setLocalInterrupted(!1);
		}
	}
	setLocalInterrupted = (e) => {
		let t = this.call.state.localParticipant;
		t && this.call.state.updateParticipant(t.sessionId, (t) => {
			let n = t.interruptedTracks ?? [];
			return e === n.includes(this.trackType) ? {} : { interruptedTracks: e ? om([...n], this.trackType) : sm([...n], this.trackType) };
		});
	};
	get mediaDeviceKind() {
		if (this.trackType === U.AUDIO) return "audioinput";
		if (this.trackType === U.VIDEO) return "videoinput";
		throw Error("Invalid track type");
	}
	handleDisconnectedOrReplacedDevices() {
		this.subscriptions.push(zf(Nc([Ph.pipe(tl()), this.state.selectedDevice$]), async ([[e, t], n]) => {
			try {
				if (!n) return;
				await this.statusChangeSettled();
				let r = !1, i = !1, a = this.findDevice(t, n), o = this.findDevice(e, n);
				!a && o ? r = !0 : a && o && a.deviceId === o.deviceId && a.groupId !== o.groupId && (i = !0), r && (this.dispatchDeviceDisconnectedEvent(o), await this.disable(), await this.select(void 0)), i && (this.isTrackStoppedDueToTrackEnd && this.state.status === "disabled" ? (await this.enable(), this.isTrackStoppedDueToTrackEnd = !1) : Af(this.statusChangeConcurrencyTag) || await this.applySettingsToStream());
			} catch (e) {
				this.logger.warn("Unexpected error while handling disconnected or replaced device", e);
			}
		}));
	}
	findDevice(e, t) {
		let n = this.mediaDeviceKind;
		return e.find((e) => e.deviceId === t && e.kind === n);
	}
	dispatchDeviceDisconnectedEvent(e) {
		let t = {
			type: "device.disconnected",
			call_cid: this.call.cid,
			status: this.isTrackStoppedDueToTrackEnd ? this.state.prevStatus : this.state.status,
			deviceId: e.deviceId,
			label: e.label,
			kind: e.kind
		};
		this.call.tracer.trace("device.disconnected", t), this.call.streamClient.dispatchEvent(t);
	}
	persistPreference(e, t) {
		let n = this.mediaDeviceKind, r = n === "audioinput" ? "microphone" : "camera", i = t === "disabled" || t !== "enabled" && void 0, { storageKey: a } = this.devicePersistence;
		if (!e) {
			Hh(void 0, r, i, a);
			return;
		}
		let o = Y(this.listDevices()) || [];
		Hh(this.findDevice(o, e) ?? Bh(e, n, this.getActiveTrackLabel(e)), r, i, a);
	}
	getActiveTrackLabel = (e) => {
		let t = this.state.rootMediaStream;
		return (this.trackType === U.AUDIO ? t?.getAudioTracks() : t?.getVideoTracks())?.find((t) => t.getSettings().deviceId === e)?.label;
	};
	async applyPersistedPreferences(e, t = !1) {
		let n = this.trackType === U.AUDIO ? "microphone" : "camera", r = Uh(Vh(this.devicePersistence.storageKey)[n]);
		if (r.length === 0) return !1;
		let i, a = !1, o = !1, s = await Sc(this.listDevices());
		for (let e of r) {
			if (i ??= e.muted, e.selectedDeviceId === Lh) break;
			let t = s.find((t) => t.deviceId === e.selectedDeviceId) ?? s.find((t) => t.label === e.selectedDeviceLabel);
			if (t) {
				a = !0, this.state.selectedDevice || await this.select(t.deviceId), i = e.muted;
				break;
			}
		}
		let c = this.call.permissionsContext.canPublish(this.trackType);
		return typeof i == "boolean" && e && c && (await this.applyMutedState(i, t), o = !0), a || o;
	}
	async applyMutedState(e, t) {
		t || this.state.status !== void 0 || (e ? await this.disable() : await this.enable());
	}
}, Gh = class {
	statusSubject = new z(void 0);
	optimisticStatusSubject = new z(void 0);
	mediaStreamSubject = new z(void 0);
	rootMediaStreamSubject = new z(void 0);
	selectedDeviceSubject = new z(void 0);
	defaultConstraintsSubject = new z(void 0);
	errorSubject = new z(void 0);
	prevStatus;
	mediaStream$ = this.mediaStreamSubject.asObservable();
	rootMediaStream$ = this.rootMediaStreamSubject.asObservable();
	selectedDevice$ = this.selectedDeviceSubject.asObservable().pipe(V());
	status$ = this.statusSubject.asObservable().pipe(V());
	optimisticStatus$ = this.optimisticStatusSubject.asObservable().pipe(V());
	defaultConstraints$ = this.defaultConstraintsSubject.asObservable();
	error$ = this.errorSubject.asObservable().pipe(V());
	hasBrowserPermission$;
	browserPermissionState$;
	isPromptingPermission$;
	disableMode;
	constructor(e, t) {
		this.disableMode = e, this.hasBrowserPermission$ = t ? t.asObservable().pipe(il(1)) : bc(!0), this.browserPermissionState$ = t ? t.asStateObservable().pipe(il(1)) : bc("prompt"), this.isPromptingPermission$ = t ? t.getIsPromptingObservable().pipe(il(1)) : bc(!1);
	}
	get status() {
		return Y(this.status$);
	}
	get optimisticStatus() {
		return Y(this.optimisticStatus$);
	}
	get selectedDevice() {
		return Y(this.selectedDevice$);
	}
	get mediaStream() {
		return Y(this.mediaStream$);
	}
	get rootMediaStream() {
		return Y(this.rootMediaStream$);
	}
	get error() {
		return Y(this.error$);
	}
	setError(e) {
		X(this.errorSubject, e);
	}
	setStatus(e) {
		X(this.statusSubject, e);
	}
	setPendingStatus(e) {
		X(this.optimisticStatusSubject, e);
	}
	setMediaStream(e, t) {
		if (X(this.mediaStreamSubject, e), X(this.rootMediaStreamSubject, t), t) {
			let e = this.getDeviceIdFromStream(t);
			e && this.setDevice(e);
		}
	}
	setDevice(e) {
		X(this.selectedDeviceSubject, e);
	}
	get defaultConstraints() {
		return Y(this.defaultConstraints$);
	}
	setDefaultConstraints(e) {
		X(this.defaultConstraintsSubject, e);
	}
}, Kh = class extends Gh {
	directionSubject = new z(void 0);
	direction$ = this.directionSubject.asObservable().pipe(V());
	constructor(e) {
		super("stop-tracks", Sh(e));
	}
	get direction() {
		return Y(this.direction$);
	}
	setDirection(e) {
		X(this.directionSubject, e);
	}
	setMediaStream(e, t) {
		if (super.setMediaStream(e, t), e) {
			let t = K() ? this.direction : e.getVideoTracks()[0]?.getSettings().facingMode === "environment" ? "back" : "front";
			this.setDirection(t);
		}
	}
	getDeviceIdFromStream(e) {
		let [t] = e.getVideoTracks();
		return t?.getSettings().deviceId;
	}
}, qh = class extends Wh {
	targetResolution = {
		width: 1280,
		height: 720
	};
	constructor(e, t) {
		super(e, new Kh(e.tracer), U.VIDEO, t);
	}
	isDirectionSupportedByDevice() {
		return K() || Ih();
	}
	async selectDirection(e, t = {}) {
		if (!this.isDirectionSupportedByDevice()) {
			this.logger.warn("Setting direction is not supported on this device");
			return;
		}
		K() && await this.getTracks()[0]?.applyConstraints({ facingMode: e === "front" ? "user" : "environment" }), this.state.setDirection(e), this.state.setDevice(void 0);
		let { enableCamera: n = !0 } = t;
		if (!K() && n) {
			this.getTracks().forEach((e) => e.stop());
			try {
				await this.unmuteStream();
			} catch (e) {
				throw e instanceof Error && e.name === "NotReadableError" && (await this.muteStream(), await this.unmuteStream()), e;
			}
		}
	}
	async flip() {
		let e = this.state.direction === "front" ? "back" : "front";
		await this.selectDirection(e);
	}
	async selectTargetResolution(e) {
		let { width: t, height: n } = e;
		if (t < n && ([t, n] = [n, t]), this.targetResolution.height = n, this.targetResolution.width = t, this.state.optimisticStatus === "enabled") try {
			await this.statusChangeSettled();
		} catch (e) {
			this.logger.warn("could not apply target resolution", e);
		}
		if (this.enabled && this.state.mediaStream) {
			let [e] = this.state.mediaStream.getVideoTracks();
			if (!e) return;
			let { width: r, height: i } = e.getSettings();
			(r !== t || i !== n) && (await this.applySettingsToStream(), this.logger.debug(`${t}x${n} target resolution applied to media stream`));
		}
	}
	enable() {
		return K() && !this.call.hasMediaEngine ? (this.state.setPendingStatus("enabled"), Promise.resolve()) : super.enable();
	}
	async disable(e) {
		if (K() && !this.call.hasMediaEngine) this.state.setPendingStatus("disabled");
		else return e === void 0 ? super.disable() : super.disable(e);
	}
	toggle() {
		return K() && !this.call.hasMediaEngine ? (this.state.setPendingStatus(this.state.optimisticStatus === "enabled" ? "disabled" : "enabled"), Promise.resolve()) : super.toggle();
	}
	async apply(e, t, n = !1) {
		await this.statusChangeSettled(), await this.selectTargetResolution(e.target_resolution);
		let r = e.enabled ?? !0, i = this.state.status === void 0 && this.state.optimisticStatus === void 0, a = !1, o = await Sc(this.state.browserPermissionState$);
		i && this.devicePersistence.enabled && o === "granted" && (a = await this.applyPersistedPreferences(r, n));
		let s = this.call.permissionsContext.canPublish(this.trackType);
		if (i && !a) {
			if (!this.state.direction && !this.state.selectedDevice) {
				let t = e.camera_facing === "front" ? "front" : "back";
				await this.selectDirection(t, { enableCamera: !1 });
			}
			!n && s && e.camera_default_on && r && await this.enable();
		}
		if (K() && t && s) await this.reconcileOptimisticStatus();
		else {
			let { mediaStream: e } = this.state;
			s && t && this.enabled && e && await this.publishStream(e);
		}
	}
	getDevices() {
		return Th(this.call.tracer);
	}
	getResolvedConstraints(e) {
		return e.width = this.targetResolution.width, e.height = this.targetResolution.height, !e.deviceId && this.state.direction && this.isDirectionSupportedByDevice() && (e.facingMode = this.state.direction === "front" ? "user" : "environment"), e;
	}
	async getStream(e) {
		return await this.call.ensureMediaFactory(), jh(e, this.call.tracer);
	}
}, Jh = class extends Wh {
	async setAudioBitrateProfile(e) {
		if (!this.call.state.settings?.audio.hifi_audio_enabled) throw Error("High Fidelity audio is not enabled for this call");
		if (K() && this.call.hasMediaEngine) throw Error("setAudioBitrateProfile must be called before joining the call.");
		this.doSetAudioBitrateProfile(e), this.state.setAudioBitrateProfile(e), this.enabled && await this.applySettingsToStream();
	}
	publishStream(e, t) {
		return super.publishStream(e, {
			audioBitrateProfile: this.state.audioBitrateProfile,
			...t
		});
	}
}, Yh = (e) => {
	let t = e === Dl.MUSIC_HIGH_QUALITY;
	return {
		echoCancellation: !t,
		noiseSuppression: !t,
		autoGainControl: !t,
		channelCount: { ideal: t ? 2 : 1 }
	};
}, Xh = class extends Gh {
	audioBitrateProfileSubject;
	audioBitrateProfile$;
	constructor(e, t, n) {
		super(e, t), this.audioBitrateProfileSubject = new z(n), this.audioBitrateProfile$ = this.audioBitrateProfileSubject.asObservable().pipe(V());
	}
	get audioBitrateProfile() {
		return Y(this.audioBitrateProfile$);
	}
	setAudioBitrateProfile(e) {
		X(this.audioBitrateProfileSubject, e);
	}
}, Zh = class extends Xh {
	speakingWhileMutedSubject = new z(!1);
	speakingWhileMuted$ = this.speakingWhileMutedSubject.asObservable().pipe(V());
	constructor(e, t) {
		super(e, xh(t), Dl.VOICE_STANDARD_UNSPECIFIED);
	}
	get speakingWhileMuted() {
		return Y(this.speakingWhileMuted$);
	}
	setSpeakingWhileMuted(e) {
		X(this.speakingWhileMutedSubject, e);
	}
	getDeviceIdFromStream(e) {
		let [t] = e.getAudioTracks(), n = t?.getSettings().deviceId;
		return Fh(n, "audioinput");
	}
}, Qh = (e, t, n = {}) => {
	let { detectionFrequencyInMs: r = 500, audioLevelThreshold: i = 150, fftSize: a = 128, destroyStreamOnStop: o = !0 } = n, s = new AudioContext(), c = s.createAnalyser();
	c.fftSize = a;
	let l = s.createMediaStreamSource(e);
	l.connect(c);
	let u = setInterval(() => {
		let n = new Uint8Array(c.frequencyBinCount);
		c.getByteFrequencyData(n);
		let r = n.some((e) => e >= i), a = n.reduce((e, t) => e + t, 0) / n.length, o = a > i ? 100 : Math.round(a / i * 100);
		e.getAudioTracks()[0]?.enabled ? t({
			isSoundDetected: r,
			audioLevel: o
		}) : t({
			isSoundDetected: !1,
			audioLevel: 0
		});
	}, r);
	return async function() {
		clearInterval(u), l.disconnect(), c.disconnect(), s.state !== "closed" && await s.close(), o && e.getTracks().forEach((t) => {
			t.stop(), e.removeTrack(t);
		});
	};
}, $h = (e) => {
	let t = new Uint8Array(e.fftSize);
	e.getByteTimeDomainData(t);
	let n = 0;
	for (let e of t) {
		let t = e - 128, r = Math.abs(t) <= 1 ? 0 : t;
		n += r * r;
	}
	return Math.sqrt(n / t.length) > 0;
}, eg = (e) => ({
	shouldEmit: !1,
	nextState: e
}), tg = (e, t) => ({
	shouldEmit: !0,
	nextState: t,
	capturesAudio: e
}), ng = (e, t, n) => {
	if (t) return tg(!0, { kind: "IDLE" });
	let { noAudioThresholdMs: r, emitIntervalMs: i } = n, a = Date.now();
	switch (e.kind) {
		case "IDLE": return eg({
			kind: "DETECTING",
			noAudioStartTime: a
		});
		case "DETECTING": {
			let { noAudioStartTime: t } = e;
			return a - t >= r ? tg(!1, {
				kind: "EMITTING",
				noAudioStartTime: t,
				lastEmitTime: a
			}) : eg(e);
		}
		case "EMITTING": return a - e.lastEmitTime >= i ? tg(!1, {
			...e,
			lastEmitTime: a
		}) : eg(e);
	}
}, rg = (e, t) => {
	let n = new AudioContext(), r = n.createAnalyser();
	return r.fftSize = t, n.createMediaStreamSource(e).connect(r), {
		audioContext: n,
		analyser: r
	};
}, ig = (e, t) => {
	let { detectionFrequencyInMs: n = 350, fftSize: r = 512, onCaptureStatusChange: i } = t, a = { kind: "IDLE" }, { audioContext: o, analyser: s } = rg(e, r), c = setInterval(() => {
		let [n] = e.getAudioTracks();
		if (n && !n.enabled) {
			a = { kind: "IDLE" };
			return;
		}
		let r = n?.readyState === "live" && $h(s), o = ng(a, r, t);
		if (a = o.nextState, !o.shouldEmit) return;
		let { capturesAudio: c } = o;
		i(c), c && l().catch((e) => {
			q.getLogger("NoAudioDetector").error("Error stopping no-audio detector", e);
		});
	}, n);
	async function l() {
		clearInterval(c), o.state !== "closed" && await o.close();
	}
	return l;
}, ag = class extends Jh {
	speakingWhileMutedNotificationEnabled = !0;
	soundDetectorConcurrencyTag = Symbol("soundDetectorConcurrencyTag");
	soundDetectorCleanup;
	soundDetectorDeviceId;
	noAudioDetectorCleanup;
	noiseCancellation;
	noiseCancellationChangeUnsubscribe;
	noiseCancellationRegistration;
	unregisterNoiseCancellation;
	silenceThresholdMs = 5e3;
	constructor(e, t, n = "stop-tracks") {
		super(e, new Zh(n, e.tracer), U.AUDIO, t);
	}
	setup() {
		if (!this.areSubscriptionsSetUp && (super.setup(), this.subscriptions.push(Bf(Nc([
			this.call.state.callingState$,
			this.call.state.ownCapabilities$,
			this.state.selectedDevice$,
			this.state.browserPermissionState$,
			this.state.status$
		]), async ([e, t, n, r]) => {
			try {
				if (e === Z.LEFT && await this.stopSpeakingWhileMutedDetection(), e !== Z.JOINED || !this.speakingWhileMutedNotificationEnabled) return;
				t.includes(hl.SEND_AUDIO) && await this.hasPermission(r) && this.state.status !== "enabled" ? (this.setMutedRecordingPrepared(!0), await this.startSpeakingWhileMutedDetection(n)) : (this.setMutedRecordingPrepared(!1), await this.stopSpeakingWhileMutedDetection());
			} catch (e) {
				this.logger.warn("Could not enable speaking while muted", e);
			}
		})), this.subscriptions.push(zf(this.call.state.callingState$, (e) => {
			this.noiseCancellationRegistration && this.noiseCancellation && (this.call.state.settings?.audio.noise_cancellation?.mode === ml.AUTO_ON && e === Z.JOINED ? this.noiseCancellationRegistration.then(() => !this.noiseCancellation?.canAutoEnable || this.noiseCancellation.canAutoEnable()).then((e) => {
				e && this.noiseCancellation?.enable().catch((e) => {
					this.logger.warn("Failed to enable noise cancellation", e);
				});
			}).catch((e) => (this.logger.warn("Failed to enable noise cancellation", e), this.call.notifyNoiseCancellationStopped())) : e === Z.LEFT && this.noiseCancellationRegistration.then(() => this.noiseCancellation?.disable()).catch((e) => {
				this.logger.warn("Failed to disable noise cancellation", e);
			}));
		})), !K())) {
			let e = Bf(Nc([this.state.status$, this.state.mediaStream$]), async ([e, t]) => {
				if (this.noAudioDetectorCleanup) {
					let e = this.noAudioDetectorCleanup;
					this.noAudioDetectorCleanup = void 0, await e().catch((e) => {
						this.logger.warn("Failed to stop no-audio detector", e);
					});
				}
				if (e !== "enabled" || !t || this.silenceThresholdMs <= 0) return;
				let n = this.state.selectedDevice, r = (await Sc(this.listDevices())).find((e) => e.deviceId === n)?.label, i;
				this.noAudioDetectorCleanup = ig(t, {
					noAudioThresholdMs: this.silenceThresholdMs,
					emitIntervalMs: this.silenceThresholdMs,
					onCaptureStatusChange: (e) => {
						let t = {
							type: "mic.capture_report",
							call_cid: this.call.cid,
							capturesAudio: e,
							deviceId: n,
							label: r
						};
						e !== i && (i = e, this.call.tracer.trace("mic.capture_report", t)), this.call.streamClient.dispatchEvent(t);
					}
				});
			});
			this.subscriptions.push(e);
		}
	}
	enable() {
		return K() && !this.call.hasMediaEngine ? (this.state.setPendingStatus("enabled"), Promise.resolve()) : super.enable();
	}
	async disable(e) {
		if (K() && !this.call.hasMediaEngine) this.state.setPendingStatus("disabled");
		else return e === void 0 ? super.disable() : super.disable(e);
	}
	toggle() {
		return K() && !this.call.hasMediaEngine ? (this.state.setPendingStatus(this.state.optimisticStatus === "enabled" ? "disabled" : "enabled"), Promise.resolve()) : super.toggle();
	}
	async enableNoiseCancellation(e) {
		let { ownCapabilities: t, settings: n } = this.call.state;
		if (!t.includes(hl.ENABLE_NOISE_CANCELLATION)) throw Error("Noise cancellation is not available.");
		let r = n?.audio.noise_cancellation;
		if (!r || r.mode === ml.DISABLED) throw Error("Noise cancellation is disabled for this call type.");
		try {
			if (this.noiseCancellation = e, this.noiseCancellationChangeUnsubscribe = this.noiseCancellation.on("change", (e) => {
				this.call.tracer.trace("noiseCancellation.enabled", e), e ? this.call.notifyNoiseCancellationStarting().catch((e) => {
					this.logger.warn("notifyNoiseCancellationStart failed", e);
				}) : this.call.notifyNoiseCancellationStopped().catch((e) => {
					this.logger.warn("notifyNoiseCancellationStop failed", e);
				});
			}), K()) this.noiseCancellationRegistration = Promise.resolve();
			else {
				let t = this.registerFilter(e.toFilter());
				this.noiseCancellationRegistration = t.registered, this.unregisterNoiseCancellation = t.unregister, await this.noiseCancellationRegistration;
			}
			if (r.mode === ml.AUTO_ON && this.call.state.callingState === Z.JOINED) {
				let t = !0;
				e.canAutoEnable && (t = await e.canAutoEnable()), t && e.enable().catch((e) => {
					this.logger.warn("Failed to enable noise cancellation", e);
				});
			}
		} catch (e) {
			throw this.logger.warn("Failed to enable noise cancellation", e), await this.disableNoiseCancellation().catch((e) => {
				this.logger.warn("Failed to disable noise cancellation", e);
			}), e;
		}
	}
	async disableNoiseCancellation() {
		await (this.unregisterNoiseCancellation?.() ?? Promise.resolve()).then(() => this.noiseCancellation?.disable()).then(() => this.noiseCancellationChangeUnsubscribe?.()).catch((e) => {
			this.logger.warn("Failed to unregister noise cancellation", e);
		}), this.call.tracer.trace("noiseCancellation.disabled", !0), await this.call.notifyNoiseCancellationStopped();
	}
	async enableSpeakingWhileMutedNotification() {
		this.speakingWhileMutedNotificationEnabled = !0, this.state.status === "disabled" && await this.startSpeakingWhileMutedDetection(this.state.selectedDevice);
	}
	async disableSpeakingWhileMutedNotification() {
		this.speakingWhileMutedNotificationEnabled = !1, await this.stopSpeakingWhileMutedDetection();
	}
	setSilenceThreshold(e) {
		this.silenceThresholdMs = e;
	}
	async performTest(e, t) {
		if (K()) throw Error("Not available in React Native");
		let n = await this.getStream({ deviceId: { exact: e } }), { testDurationMs: r = 3e3 } = t || {}, { promise: i, resolve: a } = fm(), o = ig(n, {
			noAudioThresholdMs: r,
			emitIntervalMs: r,
			onCaptureStatusChange: async (e) => {
				a(e), await o().catch((e) => {
					this.logger.warn("Failed to stop detector during test", e);
				}), mh(n);
			}
		});
		return i;
	}
	async apply(e, t, n = !1) {
		await this.statusChangeSettled();
		let r = this.state.status === void 0 && this.state.optimisticStatus === void 0, i = !1, a = await Sc(this.state.browserPermissionState$);
		r && this.devicePersistence.enabled && a === "granted" && (i = await this.applyPersistedPreferences(!0, n));
		let o = this.call.permissionsContext.canPublish(this.trackType);
		if (r && !i && !n && o && e.mic_default_on && await this.enable(), K() && t && o) await this.reconcileOptimisticStatus();
		else {
			let { mediaStream: e } = this.state;
			o && t && this.enabled && e && await this.publishStream(e);
		}
	}
	getDevices() {
		return wh(this.call.tracer);
	}
	async getStream(e) {
		return await this.call.ensureMediaFactory(), Ah(e, this.call.tracer);
	}
	async muteStream(e = !0) {
		let [t] = this.state.rootMediaStream?.getAudioTracks() ?? [], n = t?.readyState === "live" && this.state.optimisticStatus === "disabled" && this.canHandOffMic() ? t.clone() : void 0;
		try {
			await super.muteStream(e);
		} catch (e) {
			throw n?.stop(), e;
		}
		if (!n) return;
		let r = Fh(n.getSettings().deviceId, "audioinput");
		n.readyState !== "live" || !this.canHandOffMic() || r !== this.state.selectedDevice ? n.stop() : this.startSpeakingWhileMutedDetection(r, n).catch((e) => {
			n.stop(), this.logger.warn("Could not hand off mic to speaking while muted", e);
		});
	}
	canHandOffMic = () => {
		let { callingState: e, ownCapabilities: t } = this.call.state;
		return !K() && this.speakingWhileMutedNotificationEnabled && e === Z.JOINED && t.includes(hl.SEND_AUDIO);
	};
	doSetAudioBitrateProfile(e) {
		this.setDefaultConstraints({
			...this.state.defaultConstraints,
			...Yh(e)
		}), this.noiseCancellation && (e === Dl.MUSIC_HIGH_QUALITY ? this.noiseCancellation.disable().catch((e) => {
			this.logger.warn("Failed to disable noise cancellation for music mode", e);
		}) : this.noiseCancellation.enable().catch((e) => {
			this.logger.warn("Failed to enable noise cancellation", e);
		}));
	}
	async startSpeakingWhileMutedDetection(e, t) {
		await J(this.soundDetectorConcurrencyTag, async () => {
			if (this.soundDetectorCleanup && this.soundDetectorDeviceId === e) t?.stop();
			else {
				if (await this.teardownSpeakingWhileMutedDetection(), K()) {
					let e = globalThis.streamRNVideoSDK?.nativeEvents?.speechActivity;
					if (!e) {
						this.logger.warn("Native speech activity not available, make sure the \"@stream-io/react-native-webrtc\" peer dependency version is satisfied");
						return;
					}
					let t = e.subscribe((e) => {
						this.state.setSpeakingWhileMuted(e.isSoundDetected);
					});
					this.soundDetectorCleanup = async () => {
						t();
					};
				} else {
					let n = t ? new MediaStream([t]) : await this.getStream({
						...this.state.defaultConstraints,
						deviceId: { exact: e }
					});
					this.soundDetectorCleanup = Qh(n, (e) => {
						this.state.setSpeakingWhileMuted(e.isSoundDetected);
					});
				}
				this.soundDetectorDeviceId = e;
			}
		});
	}
	async stopSpeakingWhileMutedDetection() {
		await J(this.soundDetectorConcurrencyTag, async () => this.teardownSpeakingWhileMutedDetection());
	}
	async teardownSpeakingWhileMutedDetection() {
		let e = this.soundDetectorCleanup;
		this.soundDetectorCleanup = void 0, this.soundDetectorDeviceId = void 0, this.state.setSpeakingWhileMuted(!1), e && await e().catch((e) => {
			this.logger.warn("Failed to stop speaking while muted detector", e);
		});
	}
	setMutedRecordingPrepared(e) {
		K() && globalThis.streamRNVideoSDK?.callManager.setMutedRecordingPrepared?.(e);
	}
	async hasPermission(e) {
		if (!K()) return e === "granted";
		let t = globalThis.streamRNVideoSDK?.permissions;
		if (!t) return !0;
		try {
			return await t.check("microphone");
		} catch (e) {
			return this.logger.warn("Failed to check permission", e), !1;
		}
	}
}, og = class extends Xh {
	audioEnabledSubject = new z(!0);
	settingsSubject = new z(void 0);
	audioEnabled$ = this.audioEnabledSubject.asObservable().pipe(V());
	settings$ = this.settingsSubject.asObservable();
	constructor() {
		super("stop-tracks", void 0, Dl.MUSIC_HIGH_QUALITY);
	}
	getDeviceIdFromStream = (e) => {
		let [t] = e.getTracks();
		return t?.getSettings().deviceId;
	};
	get audioEnabled() {
		return Y(this.audioEnabled$);
	}
	setAudioEnabled(e) {
		X(this.audioEnabledSubject, e);
	}
	get settings() {
		return Y(this.settings$);
	}
	setSettings(e) {
		X(this.settingsSubject, e);
	}
}, sg = class extends Jh {
	constructor(e) {
		super(e, new og(), U.SCREEN_SHARE, zh({ enabled: !1 }));
	}
	setup() {
		this.areSubscriptionsSetUp || (super.setup(), this.subscriptions.push(zf(this.call.state.settings$, (e) => {
			let t = e?.screensharing.target_resolution;
			t && this.setDefaultConstraints({
				...this.state.defaultConstraints,
				video: {
					width: t.width,
					height: t.height
				}
			});
		})));
	}
	enableScreenShareAudio() {
		this.state.setAudioEnabled(!0);
	}
	async disableScreenShareAudio() {
		this.state.setAudioEnabled(!1), this.call.publisher?.isPublishing(U.SCREEN_SHARE_AUDIO) && await this.call.stopPublish(U.SCREEN_SHARE_AUDIO);
	}
	getSettings() {
		return this.state.settings;
	}
	setSettings(e) {
		this.state.setSettings(e);
	}
	getDevices() {
		return bc([]);
	}
	async getStream(e) {
		this.state.audioEnabled || (e.audio = !1), await this.call.ensureMediaFactory();
		let t = await Nh(e, this.call.tracer), [n] = t.getVideoTracks(), { contentHint: r } = this.state.settings || {};
		return r !== void 0 && n && "contentHint" in n && (this.call.tracer.trace("navigator.mediaDevices.getDisplayMedia.contentHint", r), n.contentHint = r), t;
	}
	doSetAudioBitrateProfile(e) {
		let { defaultConstraints: t } = this.state, n = typeof t?.audio == "boolean" ? null : t?.audio;
		this.setDefaultConstraints({
			...t,
			audio: {
				...n,
				...Yh(e)
			}
		});
	}
	async stopPublishStream() {
		return this.call.stopPublish(U.SCREEN_SHARE, U.SCREEN_SHARE_AUDIO);
	}
	async select() {
		throw Error("Not supported");
	}
}, cg = class {
	tracer;
	selectedDeviceSubject = new z("");
	volumeSubject = new z(1);
	isDeviceSelectionSupported = vh();
	selectedDevice$ = this.selectedDeviceSubject.asObservable().pipe(V());
	volume$ = this.volumeSubject.asObservable().pipe(V());
	constructor(e) {
		this.tracer = e;
	}
	get selectedDevice() {
		return Y(this.selectedDevice$);
	}
	get volume() {
		return Y(this.volume$);
	}
	setDevice(e) {
		X(this.selectedDeviceSubject, e), this.tracer.trace("navigator.mediaDevices.setSinkId", e);
	}
	setVolume(e) {
		X(this.volumeSubject, e);
	}
}, lg = class {
	state;
	subscriptions = [];
	areSubscriptionsSetUp = !1;
	call;
	defaultDevice;
	devicePersistence;
	constructor(e, t) {
		this.call = e, this.state = new cg(e.tracer), this.devicePersistence = t, this.setup();
	}
	async apply(e) {
		K() ? this.applyRN(e) : await this.applyWeb();
	}
	async applyWeb() {
		let { enabled: e, storageKey: t } = this.devicePersistence;
		if (!e || !this.state.isDeviceSelectionSupported) return;
		let n = Uh(Vh(t).speaker);
		if (n.length === 0) return;
		let r = n[0], i = r.selectedDeviceId === Lh ? "" : r.selectedDeviceId;
		if (!i) {
			this.state.selectedDevice !== i && this.select(i);
			return;
		}
		if (await Sc(xh(this.call.tracer).asStateObservable()) !== "granted") return;
		let a = await Sc(this.listDevices()), o = this.findDevice(a, i) ?? (r.selectedDeviceLabel ? a.find((e) => e.label === r.selectedDeviceLabel) : void 0);
		o && this.state.selectedDevice !== o.deviceId && this.select(o.deviceId);
	}
	applyRN(e) {
		let t = e.video.camera_default_on || e.audio.speaker_default_on || e.audio.default_device === pl.SPEAKER ? pl.SPEAKER : pl.EARPIECE;
		this.defaultDevice !== t && (this.call.logger.debug("SpeakerManager: setting default device", { defaultDevice: t }), this.defaultDevice = t, globalThis.streamRNVideoSDK?.callManager.setup({
			defaultDevice: t,
			isRingingTypeCall: this.call.ringing,
			cid: this.call.cid
		}));
	}
	setup() {
		this.areSubscriptionsSetUp || (this.areSubscriptionsSetUp = !0, Ph && !K() && this.subscriptions.push(zf(Nc([Ph.pipe(tl()), this.state.selectedDevice$]), ([[e, t], n]) => {
			n && this.findDevice(e, n) && !this.findDevice(t, n) && this.select("");
		})), !K() && this.devicePersistence.enabled && this.subscriptions.push(zf(Nc([this.state.selectedDevice$, xh(this.call.tracer).asStateObservable()]), ([e, t]) => {
			e && t === "granted" && this.persistSpeakerDevicePreference(e);
		})));
	}
	listDevices() {
		return ug(), Eh(this.call.tracer);
	}
	select(e) {
		ug(), this.state.setDevice(e);
	}
	dispose = () => {
		this.subscriptions.forEach((e) => e()), this.subscriptions = [], this.areSubscriptionsSetUp = !1, this.defaultDevice = void 0;
	};
	setVolume(e) {
		if (ug(), e && (e < 0 || e > 1)) throw Error("Volume must be between 0 and 1");
		this.state.setVolume(e);
	}
	setParticipantVolume(e, t) {
		if (t && (t < 0 || t > 1)) throw Error("Volume must be between 0 and 1, or undefined");
		this.call.state.updateParticipant(e, (e) => {
			if (K() && e.audioStream) for (let n of e.audioStream.getAudioTracks()) n?._setVolume(t);
			return { audioVolume: t };
		});
	}
	findDevice = (e, t) => e.find((e) => e.deviceId === t && e.kind === "audiooutput");
	persistSpeakerDevicePreference(e) {
		let { storageKey: t } = this.devicePersistence;
		Hh((Y(this.listDevices()) || []).find((t) => t.deviceId === e) ?? Bh(e, "audiooutput"), "speaker", void 0, t);
	}
}, ug = () => {
	if (K()) throw Error("Unsupported in React Native. See: https://getstream.io/video/docs/react-native/guides/camera-and-microphone/#speaker-management");
}, dg = class {
	type;
	id;
	cid;
	state = new vp();
	watching;
	camera;
	microphone;
	speaker;
	screenShare;
	dynascaleManager;
	viewportTracker;
	trackSubscriptionManager;
	audioBindingsWatchdog;
	blockedAudioTracker;
	subscriber;
	publisher;
	e2eeManager;
	ringingSubject;
	permissionsContext = new uh();
	tracer = new Vp(null);
	logger;
	dispatcher = new nf();
	clientPublishOptions;
	currentPublishOptions;
	statsReportingIntervalInMs = 2e3;
	statsReporter;
	sfuStatsReporter;
	lastStatsOptions;
	ringTimeout;
	ringStatePoller;
	clientStore;
	streamClient;
	clientEventReporter;
	sfuClient;
	sfuClientTag = 0;
	unifiedSessionId;
	reconnectConcurrencyTag = Symbol("reconnectConcurrencyTag");
	reconnectAttempts = 0;
	reconnectStrategy = W.UNSPECIFIED;
	reconnectReason = "";
	fastReconnectDeadlineSeconds = 0;
	disconnectionTimeoutSeconds = 0;
	lastOfflineTimestamp = 0;
	networkAvailableTask;
	rejoinRateLimiter = new ph(10, 12e4);
	rejoinLongWindowRateLimiter = new ph(20, 18e5);
	joinTasks = /* @__PURE__ */ new Set();
	noLocalCandidatesCheckScheduled = !1;
	maxIceFailuresWithoutConnect = 2;
	iceFailuresWithoutConnect = 0;
	maxConsecutiveNegotiationFailures = 3;
	consecutiveNegotiationFailures = 0;
	trackPublishOrder = [];
	joinResponseTimeout;
	rpcRequestTimeout;
	joinCallData;
	allowOwnTracksLoopback = !1;
	hasJoinedOnce = !1;
	deviceSettingsAppliedOnce = !1;
	callManagerStarted = !1;
	leaveGeneration = 0;
	credentials;
	initialized = !1;
	acceptRejectConcurrencyTag = Symbol("acceptRejectTag");
	joinLeaveConcurrencyTag = Symbol("joinLeaveConcurrencyTag");
	leaveCallHooks = /* @__PURE__ */ new Set();
	streamClientBasePath;
	streamClientEventHandlers = /* @__PURE__ */ new Map();
	clientCapabilities = /* @__PURE__ */ new Set([Fl.SUBSCRIBER_VIDEO_PAUSE]);
	mediaEnginePromise;
	constructor({ type: e, id: t, streamClient: n, clientEventReporter: r, members: i, ownCapabilities: a, sortParticipantsBy: o, clientStore: s, ringing: c = !1, watching: l = !1 }) {
		this.type = e, this.id = t, this.cid = `${e}:${t}`, this.ringingSubject = new z(c), this.watching = l, this.streamClient = n, this.clientEventReporter = r, this.clientStore = s, this.streamClientBasePath = `/call/${this.type}/${this.id}`, this.logger = q.getLogger("Call");
		let u = fh.get(e), d = o || u.options.sortParticipantsBy;
		d && this.state.setSortParticipantsBy(d), this.state.setMembers(i || []), this.state.setOwnCapabilities(a || []), this.state.setCallingState(c ? Z.RINGING : Z.IDLE);
		let f = zh(n.options.devicePersistence);
		this.camera = new qh(this, f), this.microphone = new ag(this, f), this.speaker = new lg(this, f), this.screenShare = new sg(this), this.trackSubscriptionManager = new th(this.state, this.tracer), this.blockedAudioTracker = new $m(this.tracer), this.leaveCallHooks.add(this.blockedAudioTracker.reset), typeof document < "u" && (this.audioBindingsWatchdog = new Qm(this.state, this.tracer), this.viewportTracker = new lh(this.state), this.dynascaleManager = new ah(this.state, this.speaker, this.tracer, this.trackSubscriptionManager, this.blockedAudioTracker));
	}
	setup = async () => {
		await J(this.joinLeaveConcurrencyTag, async () => {
			this.initialized ||= (this.leaveCallHooks.add(this.on("all", (e) => {
				this.state.updateFromEvent(e);
			})), this.leaveCallHooks.add(this.on("changePublishOptions", (e) => {
				this.currentPublishOptions = e.publishOptions;
			})), this.leaveCallHooks.add(Jm(this, this.dispatcher)), this.registerEffects(), this.registerReconnectHandlers(), this.camera.setup(), this.microphone.setup(), this.screenShare.setup(), this.speaker.setup(), this.state.callingState === Z.LEFT && this.state.setCallingState(Z.IDLE), !0);
		});
	};
	registerEffects = () => {
		this.leaveCallHooks.add(zf(this.state.settings$, (e) => {
			e && this.permissionsContext.setCallSettings(e);
		})), this.leaveCallHooks.add(Bf(this.state.ownCapabilities$, this.handleOwnCapabilitiesUpdated)), this.leaveCallHooks.add(zf(this.state.blockedUserIds$, async (e) => {
			if (!e || e.length === 0) return;
			let t = this.currentUserId;
			t && e.includes(t) && (this.logger.info("Leaving call because of being blocked"), globalThis.streamRNVideoSDK?.callingX?.endCall(this, "restricted"), await this.leave({ message: "user blocked" }).catch((e) => {
				this.logger.error("Error leaving call after being blocked", e);
			}));
		})), this.ringing ? this.handleRingingCall() : this.leaveCallHooks.add(zf(this.ringingSubject, (e) => {
			e && this.handleRingingCall();
		})), this.leaveCallHooks.add(zf(this.state.session$, (e) => {
			if (!this.ringing) return;
			let { settledByMe: t, leaveReason: n } = km({
				session: e,
				currentUserId: this.currentUserId,
				callingState: this.state.callingState
			});
			t && this.cancelAutoDrop(), n && !Af(this.joinLeaveConcurrencyTag) && (globalThis.streamRNVideoSDK?.callingX?.endCall(this, n), this.leave().catch(() => {
				this.logger.error("Could not leave a call that was accepted or rejected elsewhere");
			}));
		}));
	};
	handleRingingCall = () => {
		let e = this.state.session, t = this.clientStore.connectedUser?.id, n = e?.ended_at, r = this.state.createdBy?.id;
		this.currentUserId && r === this.currentUserId && globalThis.streamRNVideoSDK?.callingX?.registerOutgoingCall(this);
		let i = e?.rejected_by, a = e?.accepted_by, o = !1;
		n ? o = !0 : r && i ? i[r] && (o = !0) : t && i ? i[t] && (o = !0) : t && a && a[t] && (o = !0), o ? this.state.callingState !== Z.IDLE && this.state.setCallingState(Z.IDLE) : (this.state.callingState === Z.IDLE && this.state.setCallingState(Z.RINGING), this.scheduleAutoDrop(), this.scheduleRingStatePolling(), this.leaveCallHooks.add(Ym(this)));
	};
	handleOwnCapabilitiesUpdated = async (e) => {
		if (this.permissionsContext.setPermissions(e), !this.publisher) return;
		let t = {
			[hl.SEND_AUDIO]: U.AUDIO,
			[hl.SEND_VIDEO]: U.VIDEO,
			[hl.SCREENSHARE]: U.SCREEN_SHARE
		};
		for (let [e, n] of Object.entries(t)) if (!this.permissionsContext.hasPermission(e)) try {
			switch (n) {
				case U.AUDIO:
					this.microphone.enabled && await this.microphone.disable();
					break;
				case U.VIDEO:
					this.camera.enabled && await this.camera.disable();
					break;
				case U.SCREEN_SHARE: this.screenShare.enabled && await this.screenShare.disable();
			}
		} catch (e) {
			this.logger.error("Can't disable mic/camera/screenshare after revoked permissions", e);
		}
	};
	on = (e, t) => {
		if (tf(e)) return this.dispatcher.on(e, "*", t);
		let n = this.streamClient.on(e, (e) => {
			let n = e;
			n.call_cid && n.call_cid === this.cid && t(n);
		});
		return this.streamClientEventHandlers.set(t, n), () => {
			this.off(e, t);
		};
	};
	off = (e, t) => {
		if (tf(e)) return this.dispatcher.off(e, "*", t);
		let n = this.streamClientEventHandlers.get(t);
		n && n();
	};
	leave = async ({ reject: e, reason: t, message: n } = {}) => {
		if (this.state.callingState === Z.LEFT) throw Error("Cannot leave call that has already been left.");
		this.ringTimeout?.pause(), this.ringStatePoller?.pause(), await J(this.joinLeaveConcurrencyTag, async () => {
			let r = this.state.callingState;
			if (r === Z.LEFT) return;
			if (this.leaveGeneration += 1, r === Z.JOINING && await new Promise((e) => {
				this.state.callingState$.pipe(ol((e) => e !== Z.JOINED, !0)).subscribe(() => e());
			}), r === Z.RINGING && e !== !1) {
				if (e) {
					let e = {
						timeout: "missed",
						cancel: "canceled",
						busy: "busy",
						decline: "rejected"
					}, n = t ?? "decline", r = e[n] ?? "rejected";
					await this.reject(n), globalThis.streamRNVideoSDK?.callingX?.endCall(this, r);
				} else {
					let e = this.state.remoteParticipants.length > 0;
					this.isCreatedByMe && !e && (await this.reject("cancel"), globalThis.streamRNVideoSDK?.callingX?.endCall(this, "canceled"));
				}
			}
			globalThis.streamRNVideoSDK?.callingX?.endCall(this, t === "ended" ? "remote" : void 0), this.statsReporter?.stop(), this.statsReporter = void 0;
			let i = n ?? t ?? "user is leaving the call";
			this.tracer.trace("call.leaveReason", i), await this.sfuStatsReporter?.flush(), this.sfuStatsReporter?.stop(), this.sfuStatsReporter = void 0, this.lastStatsOptions = void 0, await this.subscriber?.dispose(), this.clientEventReporter.abort(this.cid, {
				code: "CLIENT_ABORTED",
				reason: i
			}), this.subscriber = void 0, await this.publisher?.dispose(), this.publisher = void 0, this.clientEventReporter.unregisterCall(this.cid), await this.sfuClient?.leaveAndClose(i), this.sfuClient = void 0, this.trackSubscriptionManager.setSfuClient(void 0), this.trackSubscriptionManager.dispose(), this.audioBindingsWatchdog?.dispose(), await this.dynascaleManager?.dispose(), this.state.setCallingState(Z.LEFT), this.ringing && globalThis.streamRNVideoSDK?.ringingCallLifecycle?.onLeave(this), this.state.setParticipants([]), this.state.dispose(), this.rejoinRateLimiter.reset(), this.rejoinLongWindowRateLimiter?.reset(), this.iceFailuresWithoutConnect = 0, this.consecutiveNegotiationFailures = 0, this.reconnectStrategy = W.UNSPECIFIED, this.reconnectReason = "", this.reconnectAttempts = 0, this.leaveCallHooks.forEach((e) => e()), this.initialized = !1, this.hasJoinedOnce = !1, this.allowOwnTracksLoopback = !1, this.unifiedSessionId = void 0, this.ringingSubject.next(!1), this.cancelAutoDrop(), this.cancelRingStatePolling(), this.clientStore.unregisterCall(this), globalThis.streamRNVideoSDK?.callManager.stop({
				isRingingTypeCall: this.ringing,
				shouldStopCallManager: this.callManagerStarted
			}), this.camera.dispose(), this.microphone.dispose(), this.screenShare.dispose(), this.speaker.dispose(), this.deviceSettingsAppliedOnce = !1, this.callManagerStarted = !1;
			let a = [];
			if (this.camera.stopOnLeave && a.push(this.camera.disable(!0)), this.microphone.stopOnLeave && a.push(this.microphone.disable(!0)), this.screenShare.stopOnLeave && a.push(this.screenShare.disable(!0)), await Promise.all(a), this.mediaEnginePromise) {
				let e = this.mediaEnginePromise;
				this.mediaEnginePromise = void 0, this.logger.debug("Disposing per-call media factory"), await e.then((e) => (globalThis.streamRNVideoSDK?.callingX?.unwireAudioEngineSubscription(), e.dispose())).catch((e) => {
					this.logger.warn("Failed to dispose media engine", e);
				});
			}
		}).catch((e) => {
			throw !Af(this.joinLeaveConcurrencyTag) && this.state.callingState === Z.RINGING && (this.ringTimeout?.start(), this.ringStatePoller?.resume()), e;
		});
	};
	get ringing() {
		return Y(this.ringingSubject);
	}
	get currentUserId() {
		return this.clientStore.connectedUser?.id;
	}
	get isOwnTracksLoopbackAllowed() {
		return this.allowOwnTracksLoopback;
	}
	getMaxVideoPublishDimension = () => {
		if (!this.currentPublishOptions) return;
		let e, t = 0;
		for (let n of this.currentPublishOptions) {
			if (n.trackType !== U.VIDEO) continue;
			let r = n.videoDimension;
			if (!r || !r.width || !r.height) continue;
			let i = r.width * r.height;
			i > t && (e = r, t = i);
		}
		return e;
	};
	get isCreatedByMe() {
		return this.currentUserId && this.state.createdBy?.id === this.currentUserId;
	}
	updateFromRingingEvent = async (e) => {
		await this.setup();
		let { created_by: t, settings: n } = e.call, r = this.state.members.find((e) => e.user.id === t.id);
		r ? this.state.setMembers([r, ...e.members]) : this.state.setMembers(e.members), this.state.updateFromCallResponse(e.call), this.watching = !0, this.ringingSubject.next(!0);
		let i = this.clientStore.calls.filter((e) => e.cid !== this.cid);
		this.clientStore.setCalls([this, ...i]), await this.applyDeviceConfig(n, { publish: !1 });
	};
	updateFromCallStateResponse = (e) => {
		this.state.updateFromCallResponse(e.call), this.state.setMembers(e.members), this.state.setOwnCapabilities(e.own_capabilities);
	};
	get = async (e) => {
		let t = this.leaveGeneration;
		await this.setup();
		let n = await this.streamClient.get(this.streamClientBasePath, e);
		return this.leaveGeneration === t && (this.updateFromCallStateResponse(n), e?.ring && this.ringingSubject.next(!0), this.streamClient._hasConnectionID() && (this.watching = !0, this.clientStore.registerOrUpdateCall(this)), await this.applyDeviceConfig(n.call.settings, { publish: !1 })), n;
	};
	getOrCreate = async (e) => {
		await this.setup();
		let t = await this.streamClient.post(this.streamClientBasePath, e);
		return this.updateFromCallStateResponse(t), e?.ring && this.ringingSubject.next(!0), this.streamClient._hasConnectionID() && (this.watching = !0, this.clientStore.registerOrUpdateCall(this)), await this.applyDeviceConfig(t.call.settings, { publish: !1 }), t;
	};
	create = async (e) => this.getOrCreate(e);
	delete = async (e = {}) => this.streamClient.post(`${this.streamClientBasePath}/delete`, e);
	ring = async (e = {}) => this.streamClient.post(`${this.streamClientBasePath}/ring`, e);
	getRingState = async (e) => {
		let t = e ?? this.state.session?.id;
		if (!t) throw Error("Cannot read the ring state: the call has no session");
		return this.streamClient.get(`${this.streamClientBasePath}/ring_state`, { call_session_id: t });
	};
	notify = async () => await this.get({ notify: !0 });
	accept = async () => J(this.acceptRejectConcurrencyTag, () => (this.tracer.trace("call.accept", ""), this.streamClient.post(`${this.streamClientBasePath}/accept`)));
	reject = async (e = "decline") => J(this.acceptRejectConcurrencyTag, () => (this.tracer.trace("call.reject", e), this.streamClient.post(`${this.streamClientBasePath}/reject`, { reason: e })));
	join = kf(async ({ maxJoinRetries: e = 3, joinResponseTimeout: t, rpcRequestTimeout: n, allowOwnTracksLoopback: r = !1, joinSource: i, ...a } = {}) => {
		let o = this.state.callingState;
		if ([Z.JOINED, Z.JOINING].includes(o)) throw Error("Illegal State: call.join() shall be called only once");
		let s = this.leaveGeneration, c = () => this.leaveGeneration !== s;
		this.allowOwnTracksLoopback = r, a?.ring && this.ringingSubject.next(!0);
		let l = this.ringing ? globalThis.streamRNVideoSDK?.ringingCallLifecycle : void 0, u = globalThis.streamRNVideoSDK?.callingX;
		try {
			if (l && (await l.beforeJoin(this), c())) {
				this.logger.debug("Join superseded by leave; not joining");
				return;
			}
			if (u && (await u.joinCall(this, this.clientStore.calls, c), c())) {
				this.logger.debug("Join superseded by leave; not setting up");
				return;
			}
			if (await this.setup(), c()) {
				this.logger.debug("Join superseded by leave; not registering");
				return;
			}
			this.clientEventReporter.registerCall(this.cid, {
				callType: this.type,
				callId: this.id,
				getCallSessionId: () => this.state.session?.id ?? "",
				getSfuId: () => this.credentials?.server.edge_name ?? ""
			}), this.joinResponseTimeout = t, this.rpcRequestTimeout = n;
			let r = /* @__PURE__ */ new Map(), o = a;
			e = Math.max(e, 1), await this.clientEventReporter.withJoinLifecycle(this.cid, {
				joinReason: "first-attempt",
				joinSource: i
			}, async () => {
				for (let t = 0; t < e; t++) {
					if (c()) {
						this.logger.debug("Join superseded by leave; not attempting");
						return;
					}
					try {
						this.logger.trace(`Joining call (${t})`, this.cid), await this.doJoin(a), delete o.migrating_from, delete o.migrating_from_list;
						return;
					} catch (n) {
						if (c()) {
							this.logger.debug("Join superseded by leave; not retrying");
							return;
						}
						if (this.logger.warn(`Failed to join call (${t})`, this.cid), n instanceof vl && n.unrecoverable || n instanceof vm && n.unrecoverable) throw n;
						let i = n instanceof vm && vm.isJoinErrorCode(n.errorEvent), a = this.credentials?.server.edge_name;
						if (a) {
							let n = (r.get(a) || 0) + 1;
							r.set(a, n), (i || n >= 2) && (o.migrating_from = a, o.migrating_from_list = Array.from(r.keys()), t < e - 1 && this.clientEventReporter.startCorrelation(this.cid, "first-attempt"));
						}
						if (t === e - 1) throw n;
					}
					await Dd(jd(t));
				}
			});
		} catch (e) {
			throw u?.endCall(this, "error"), await l?.onJoinFailed(this), e;
		}
	});
	doJoin = async (e) => {
		let t = this.performJoin(e);
		this.joinTasks.add(t);
		try {
			await t;
		} finally {
			this.joinTasks.delete(t);
		}
	};
	performJoin = async (e) => {
		let t = Date.now(), n = this.state.callingState, r = this.leaveGeneration, i = () => this.leaveGeneration !== r;
		if (this.joinCallData = e, this.logger.debug("Starting join flow"), this.state.setCallingState(Z.JOINING), await this.ensureMediaFactory(), i()) {
			this.logger.debug("Join superseded by leave; not wiring media");
			return;
		}
		let a = globalThis.streamRNVideoSDK?.callingX;
		a && a.wireAudioEngineSubscription();
		let o = this.reconnectStrategy === W.MIGRATE, s = this.reconnectStrategy === W.REJOIN, c = this.reconnectStrategy === W.FAST, l = this.lastStatsOptions;
		if (!this.credentials || !l || s || o || e?.migrating_from) try {
			let t = await this.clientEventReporter.track(this.cid, "CoordinatorJoin", () => this.doJoinRequest(e));
			if (!t || i()) {
				this.logger.debug("Join superseded by leave; not creating SFU client");
				return;
			}
			this.credentials = t.credentials, l = t.stats_options, this.lastStatsOptions = l;
		} catch (e) {
			if (i()) return;
			throw this.state.callingState !== Z.OFFLINE && this.state.setCallingState(n), e;
		}
		let u = this.sfuClient, d = u?.sessionId, f = !!u?.isHealthy, p = s || o || !f ? new xm({
			tag: String(this.sfuClientTag++),
			cid: this.cid,
			dispatcher: this.dispatcher,
			credentials: this.credentials,
			streamClient: this.streamClient,
			enableTracing: l.enable_rtc_stats,
			joinResponseTimeout: this.joinResponseTimeout,
			rpcRequestTimeout: this.rpcRequestTimeout,
			sessionId: s ? void 0 : d,
			onSignalClose: (e) => this.handleSfuSignalClose(p, e)
		}) : u;
		this.sfuClient = p, this.unifiedSessionId ??= p.sessionId, this.trackSubscriptionManager.setSfuClient(p);
		let m = await Sf();
		if (u !== p) {
			let { dangerouslyForceCodec: e, fmtpLine: t, subscriberFmtpLine: r } = this.clientPublishOptions || {};
			if (i()) {
				this.logger.debug("Join superseded by leave; skipping codec detection");
				return;
			}
			let [a, o] = await Promise.all([Yd("recvonly", e, r), Yd("sendonly", e, t)]);
			if (i()) {
				this.logger.debug("Join superseded by leave; not joining SFU");
				return;
			}
			let s = this.reconnectStrategy !== W.UNSPECIFIED, l = s ? this.getReconnectDetails(u?.edgeName, d) : void 0, f = s ? this.currentPublishOptions || [] : this.getPreferredPublishOptions(), h = s ? [] : this.getPreferredSubscribeOptions(), g = this.unifiedSessionId, _ = Array.from(this.clientCapabilities);
			try {
				let { callState: e, fastReconnectDeadlineSeconds: t, publishOptions: n } = await this.clientEventReporter.track(this.cid, "WSJoin", () => p.join({
					unifiedSessionId: g,
					subscriberSdp: a,
					publisherSdp: o,
					clientDetails: m,
					fastReconnect: c,
					reconnectDetails: l,
					preferredPublishOptions: f,
					preferredSubscribeOptions: h,
					capabilities: _,
					source: El.WEBRTC_UNSPECIFIED
				}));
				if (i()) {
					this.logger.debug("Join superseded by leave; not applying SFU response");
					return;
				}
				this.currentPublishOptions = n, this.fastReconnectDeadlineSeconds = t, e && this.state.updateFromSfuCallState(e, p.sessionId, l);
			} catch (e) {
				if (i()) {
					this.logger.debug("Join superseded by leave; ignoring SFU failure");
					return;
				}
				throw this.logger.warn("Join SFU request failed", e), p.close(xm.JOIN_FAILED, "Join request failed, connection considered unhealthy"), this.state.setCallingState(n), e;
			}
		}
		if (i()) this.logger.debug("Join superseded by leave; aborting join flow");
		else {
			if (o || this.state.setCallingState(Z.JOINED), this.hasJoinedOnce = !0, c) await this.restoreICE(p, { includeSubscriber: !1 });
			else {
				let e = um(this.credentials.ice_servers);
				await this.initPublisherAndSubscriber({
					sfuClient: p,
					connectionConfig: e,
					clientDetails: m,
					statsOptions: l,
					publishOptions: this.currentPublishOptions || [],
					closePreviousInstances: !o,
					unifiedSessionId: this.unifiedSessionId
				});
			}
			if (i()) this.logger.debug("Join superseded by leave; not completing join flow");
			else {
				if (!s && !c && !o && this.sfuStatsReporter?.sendConnectionTime((Date.now() - t) / 1e3), s && f) {
					let e = W[this.reconnectStrategy];
					await u?.leaveAndClose(`Closing previous WS after reconnect with strategy: ${e}`);
				} else f || u?.close(xm.DISPOSE_OLD_SOCKET, "Closing unhealthy WS after reconnect");
				!this.deviceSettingsAppliedOnce && this.state.settings && !i() && (await this.applyDeviceConfig(this.state.settings, {
					publish: !0,
					skipSpeakerApply: !1
				}), this.deviceSettingsAppliedOnce = !0), !this.callManagerStarted && !i() && (globalThis.streamRNVideoSDK?.callManager.start({
					isRingingTypeCall: this.ringing,
					cid: this.cid
				}), this.callManagerStarted = !0), delete this.joinCallData?.ring, delete this.joinCallData?.notify, this.reconnectStrategy = W.UNSPECIFIED, this.reconnectReason = "", this.consecutiveNegotiationFailures = 0, this.logger.info(`Joined call ${this.cid}`);
			}
		}
	};
	getReconnectDetails = (e, t) => {
		let n = this.reconnectStrategy, r = n === W.REJOIN;
		return {
			strategy: n,
			announcedTracks: this.publisher?.getAnnouncedTracksForReconnect() || [],
			subscriptions: this.trackSubscriptionManager.subscriptions,
			reconnectAttempt: this.reconnectAttempts,
			fromSfuId: e || "",
			previousSessionId: r && t || "",
			reason: this.reconnectReason
		};
	};
	getPreferredPublishOptions = () => {
		let { preferredCodec: e, fmtpLine: t, preferredBitrate: n, maxSimulcastLayers: r } = this.clientPublishOptions || {};
		if (!e && !n && !r) return [];
		let i = e ? Kl.create({
			name: e.split("/").pop(),
			fmtp: t
		}) : void 0, a = [Gl.create({
			trackType: U.VIDEO,
			codec: i,
			bitrate: n,
			maxSpatialLayers: r
		})], o = this.screenShare.getSettings();
		return o && a.push(Gl.create({
			trackType: U.SCREEN_SHARE,
			fps: o.maxFramerate,
			bitrate: o.maxBitrate
		})), a;
	};
	getPreferredSubscribeOptions = () => {
		let { subscriberCodec: e, subscriberFmtpLine: t } = this.clientPublishOptions || {};
		return !e || !t ? [] : [Wl.create({
			trackType: U.VIDEO,
			codecs: [{
				name: e.split("/").pop(),
				fmtp: t
			}]
		})];
	};
	restoreICE = async (e, t = {}) => {
		let { includeSubscriber: n = !0, includePublisher: r = !0 } = t;
		this.subscriber && (this.subscriber.setSfuClient(e), n && await this.subscriber.restartIce()), this.publisher && (this.publisher.setSfuClient(e), r && this.publisher.isPublishing() && await this.publisher.restartIce());
	};
	initPublisherAndSubscriber = async (e) => {
		let t = this.leaveGeneration, { sfuClient: n, connectionConfig: r, clientDetails: i, statsOptions: a, publishOptions: o, closePreviousInstances: s, unifiedSessionId: c } = e, { enable_rtc_stats: l, reporting_interval_ms: u } = a;
		if (await this.sfuStatsReporter?.flush(), this.leaveGeneration !== t) return;
		if (this.sfuStatsReporter?.stop(), this.sfuStatsReporter = void 0, s && this.subscriber) {
			if (await this.subscriber.dispose(), this.leaveGeneration !== t) return;
			this.state.removeAllOrphanedTracks();
		}
		let d = {
			sfuClient: n,
			dispatcher: this.dispatcher,
			state: this.state,
			connectionConfig: r,
			tag: n.tag,
			enableTracing: l,
			statsTimestampDriftThresholdMs: u / 2,
			clientPublishOptions: this.clientPublishOptions,
			e2ee: this.e2eeManager,
			onReconnectionNeeded: (e, t, n) => {
				this.reconnect(e, t).catch((e) => {
					let r = `[Reconnect] Error reconnecting, after a ${H[n]} error: ${t}`;
					this.logger.warn(r, e);
				});
			},
			onIceConnected: () => {
				this.iceFailuresWithoutConnect = 0;
			},
			onNoLocalCandidates: () => {
				this.checkNoLocalCandidates();
			},
			onPeerConnectionStateChange: (e) => {
				this.clientEventReporter.onPeerConnectionStateChange(this.cid, e);
			},
			onRemoteTrackUnmute: (e, t) => {
				(e === U.AUDIO || K() && e === U.VIDEO) && this.clientEventReporter.reportFirstFrame(this.cid, e, t);
			}
		};
		if (this.subscriber = new cm(d), this.streamClient.user?.type !== "anonymous") {
			if (s && this.publisher && (await this.publisher.dispose(), this.leaveGeneration !== t)) return;
			this.publisher = new am(d, o, { selfSubEnabled: this.allowOwnTracksLoopback });
		}
		this.statsReporter?.stop(), this.statsReportingIntervalInMs > 0 && (this.statsReporter = Ep({
			subscriber: this.subscriber,
			publisher: this.publisher,
			state: this.state,
			datacenter: n.edgeName,
			pollingIntervalInMs: this.statsReportingIntervalInMs
		})), this.tracer.setEnabled(l), a?.reporting_interval_ms > 0 && (this.sfuStatsReporter = new Np(n, {
			clientDetails: i,
			options: a,
			subscriber: this.subscriber,
			publisher: this.publisher,
			tracer: this.tracer,
			unifiedSessionId: c
		}), this.sfuStatsReporter.start());
	};
	checkNoLocalCandidates = () => {
		if (this.noLocalCandidatesCheckScheduled) return;
		if (this.joinTasks.size > 0 || Af(this.reconnectConcurrencyTag)) {
			this.noLocalCandidatesCheckScheduled = !0;
			let e = this.leaveGeneration;
			this.waitForJoinsAndReconnects().then(() => {
				this.noLocalCandidatesCheckScheduled = !1, this.leaveGeneration === e && this.checkNoLocalCandidates();
			}).catch((e) => {
				this.noLocalCandidatesCheckScheduled = !1, this.logger.warn("[Reconnect] No-candidates check failed", e);
			});
			return;
		}
		if (this.state.callingState !== Z.JOINED || typeof navigator < "u" && navigator.onLine === !1) return;
		let e = [this.publisher, this.subscriber];
		e.some((e) => e?.hasIceEverConnected()) || e.some((e) => e?.hasNoLocalCandidates()) && this.reconnect(W.REJOIN, Hp.ICE_NEVER_CONNECTED).catch((e) => {
			this.logger.warn("[Reconnect] Error reconnecting", e);
		});
	};
	waitForJoinsAndReconnects = async () => {
		for (; this.joinTasks.size > 0 || Af(this.reconnectConcurrencyTag);) await Promise.allSettled(this.joinTasks), await jf(this.reconnectConcurrencyTag);
	};
	doJoinRequest = async (e) => {
		let t = this.leaveGeneration, n = await this.streamClient.getLocationHint();
		if (this.leaveGeneration !== t) {
			this.logger.debug("Join superseded by leave; not sending coordinator request");
			return;
		}
		let r = !!this.e2eeManager, i = {
			...e,
			location: n,
			e2ee: r
		}, a = await this.streamClient.post(`${this.streamClientBasePath}/join`, i);
		return this.leaveGeneration === t ? (this.state.updateFromCallResponse(a.call), this.state.setMembers(a.members), this.state.setOwnCapabilities(a.own_capabilities), e?.ring && this.ringingSubject.next(!0), this.reconnectStrategy === W.UNSPECIFIED && this.ringing && !this.isCreatedByMe && (await this.accept(), this.leaveGeneration !== t) || this.streamClient._hasConnectionID() && (this.watching = !0, this.clientStore.registerOrUpdateCall(this)), a) : (this.logger.debug("Join superseded by leave; not applying coordinator response"), a);
	};
	get hasMediaEngine() {
		return !!this.mediaEnginePromise;
	}
	ensureMediaFactory = async () => {
		if (!this.mediaEnginePromise) {
			let e = $d();
			this.logger.debug("Requesting per-call media factory creation"), this.mediaEnginePromise = Promise.resolve(e()).catch((e) => {
				throw this.mediaEnginePromise = void 0, e;
			});
		}
		return this.mediaEnginePromise;
	};
	handleSfuSignalClose = (e, t) => {
		if (this.logger.debug("[Reconnect] SFU signal connection closed"), e !== this.sfuClient) return;
		let { callingState: n } = this.state;
		if (n === Z.JOINING || n === Z.RECONNECTING || n === Z.IDLE || n === Z.LEFT || e.isLeaving || e.isClosingClean) return;
		let r = this.publisher?.isHealthy() && this.subscriber?.isHealthy() ? W.FAST : W.REJOIN;
		this.reconnect(r, t).catch((e) => {
			this.logger.warn("[Reconnect] Error reconnecting", e);
		});
	};
	reconnect = async (e, t) => {
		let { callingState: n } = this.state;
		if (n === Z.JOINING || n === Z.RECONNECTING || n === Z.MIGRATING || n === Z.LEFT || n === Z.RECONNECTING_FAILED || Af(this.reconnectConcurrencyTag)) return;
		let r = this.leaveGeneration, i = () => this.leaveGeneration !== r;
		return J(this.reconnectConcurrencyTag, async () => {
			if (i()) return;
			let n = Date.now();
			this.reconnectStrategy = e, this.reconnectReason = t;
			let r = /* @__PURE__ */ new Map(), a = async () => {
				if (!i()) try {
					await this.get();
				} finally {
					i() || this.state.setCallingState(Z.RECONNECTING_FAILED);
				}
			}, o = async (e) => {
				this.logger.warn(`[Reconnect] Giving up: ${e}. Leaving the call.`), this.state.callingState === Z.JOINING && this.state.setCallingState(Z.RECONNECTING);
				try {
					await this.leave({ message: e });
				} catch (t) {
					this.logger.warn(`[Reconnect] leave() failed after ${e}`, t);
				}
			};
			if (t === Hp.ICE_NEVER_CONNECTED && (this.iceFailuresWithoutConnect++, this.iceFailuresWithoutConnect >= this.maxIceFailuresWithoutConnect)) {
				await o("webrtc_unsupported_network");
				return;
			}
			let s = 0;
			do {
				let e = Date.now() - n;
				if (this.disconnectionTimeoutSeconds > 0 && e / 1e3 > this.disconnectionTimeoutSeconds) {
					this.logger.warn("[Reconnect] Stopping reconnection attempts after reaching disconnection timeout"), await a();
					return;
				}
				if ((this.reconnectStrategy === W.REJOIN || this.reconnectStrategy === W.MIGRATE) && !this.rejoinRateLimiter.tryRegister() || this.reconnectStrategy === W.REJOIN && this.rejoinLongWindowRateLimiter && !this.rejoinLongWindowRateLimiter.tryRegister()) {
					await o("rejoin_attempt_limit_exceeded");
					return;
				}
				this.reconnectStrategy !== W.FAST && this.reconnectAttempts++;
				let t = this.reconnectStrategy, c = W[t];
				try {
					if (await this.networkAvailableTask?.promise, i()) return;
					switch (this.logger.info(`[Reconnect] Reconnecting with strategy ${W[this.reconnectStrategy]}`), this.reconnectStrategy) {
						case W.UNSPECIFIED:
						case W.DISCONNECT:
							this.logger.debug(`[Reconnect] No-op strategy ${c}`);
							break;
						case W.FAST:
							await this.reconnectFast();
							break;
						case W.REJOIN: {
							let e = Array.from(r).filter(([, e]) => e >= 2).map(([e]) => e);
							this.joinCallData && e.length && (this.joinCallData.migrating_from = e[e.length - 1], this.joinCallData.migrating_from_list = e);
							try {
								await this.reconnectRejoin();
							} finally {
								delete this.joinCallData?.migrating_from, delete this.joinCallData?.migrating_from_list;
							}
							break;
						}
						case W.MIGRATE:
							await this.reconnectMigrate();
							break;
						default: lf(this.reconnectStrategy, "Unknown reconnection strategy");
					}
					this.consecutiveNegotiationFailures = 0;
					break;
				} catch (e) {
					if (i()) return;
					if (t === W.REJOIN) {
						let t = this.credentials?.server.edge_name;
						if (t) {
							let n = e instanceof vm && vm.isJoinErrorCode(e.errorEvent), i = (r.get(t) ?? 0) + 1;
							r.set(t, n ? Math.max(i, 2) : i);
						}
					}
					if (this.state.callingState === Z.OFFLINE) {
						this.logger.debug("[Reconnect] Can't reconnect while offline, stopping reconnection attempts");
						break;
					}
					if (e instanceof vl && e.unrecoverable) {
						this.logger.warn("[Reconnect] Can't reconnect due to coordinator unrecoverable error", e), await a();
						return;
					}
					if (e instanceof rf && (this.consecutiveNegotiationFailures++, this.consecutiveNegotiationFailures >= this.maxConsecutiveNegotiationFailures)) {
						await o("repeated_negotiation_failures");
						return;
					}
					if (await Dd(jd(s)), i()) return;
					let l = this.reconnectStrategy === W.MIGRATE, u = (Date.now() - n) / 1e3 > this.fastReconnectDeadlineSeconds || l || s >= 3 || !(this.publisher?.isHealthy() ?? !0) || !(this.subscriber?.isHealthy() ?? !0);
					s++;
					let d = u ? W.REJOIN : W.FAST;
					this.reconnectStrategy = d, this.logger.info(`[Reconnect] ${c} (${this.reconnectAttempts}) failed. Attempting with ${W[d]}`, e);
				}
			} while (!i() && this.state.callingState !== Z.JOINED && this.state.callingState !== Z.RECONNECTING_FAILED && this.state.callingState !== Z.LEFT);
			this.logger.info("[Reconnect] Reconnection flow finished");
		});
	};
	reconnectFast = async () => {
		let e = this.leaveGeneration, t = Date.now();
		this.reconnectStrategy = W.FAST, this.state.setCallingState(Z.RECONNECTING), await this.doJoin(this.joinCallData), this.leaveGeneration === e && (await this.get(), this.sfuStatsReporter?.sendReconnectionTime(W.FAST, (Date.now() - t) / 1e3));
	};
	reconnectRejoin = async () => {
		let e = this.leaveGeneration, t = Date.now();
		this.reconnectStrategy = W.REJOIN, this.state.setCallingState(Z.RECONNECTING);
		let n = this.reconnectReason === Hp.NETWORK_BACK_ONLINE ? "network-available" : "full-rejoin";
		await this.clientEventReporter.withJoinLifecycle(this.cid, { joinReason: n }, () => this.doJoin(this.joinCallData)), this.leaveGeneration === e && (await this.restorePublishedTracks(), this.leaveGeneration === e && (this.restoreSubscribedTracks(), this.sfuStatsReporter?.sendReconnectionTime(W.REJOIN, (Date.now() - t) / 1e3)));
	};
	reconnectMigrate = async () => {
		let e = this.leaveGeneration, t = Date.now(), n = this.sfuClient;
		if (!n) throw Error("Cannot migrate without an active SFU client");
		this.reconnectStrategy = W.MIGRATE, this.state.setCallingState(Z.MIGRATING);
		let r = this.subscriber, i = this.publisher;
		r?.detachEventHandlers(), i?.detachEventHandlers();
		let a = dm(n.enterMigration());
		try {
			try {
				let e = n.edgeName;
				await this.clientEventReporter.withJoinLifecycle(this.cid, { joinReason: "migration" }, () => this.doJoin({
					...this.joinCallData,
					migrating_from: e,
					migrating_from_list: [e]
				}));
			} finally {
				delete this.joinCallData?.migrating_from, delete this.joinCallData?.migrating_from_list;
			}
			if (this.leaveGeneration !== e || (await this.restorePublishedTracks(), this.leaveGeneration !== e) || (this.restoreSubscribedTracks(), await a(), this.leaveGeneration !== e)) return;
			this.state.setCallingState(Z.JOINED);
		} finally {
			await r?.dispose(), await i?.dispose(), n.close(xm.NORMAL_CLOSURE, "Migrating away");
		}
		this.sfuStatsReporter?.sendReconnectionTime(W.MIGRATE, (Date.now() - t) / 1e3);
	};
	registerReconnectHandlers = () => {
		let e = this.on("goAway", () => {
			this.clientEventReporter.captureWsError(this.cid, {
				code: "SFU_GO_AWAY",
				reason: "SFU goAway received during WS join"
			}), this.reconnect(W.MIGRATE, Hp.GO_AWAY).catch((e) => this.logger.warn("[Reconnect] Error reconnecting", e));
		}), t = this.dispatcher.on("error", () => this.sfuClient?.tag ?? "*", (e) => {
			if (!this.sfuClient) return;
			let { reconnectStrategy: t, error: n } = e;
			if (!vm.isJoinErrorCode(e)) {
				let e = n?.code ? Ol[n.code] : void 0;
				this.clientEventReporter.captureWsError(this.cid, {
					code: e ?? "SFU_ERROR",
					reason: n?.message || "SFU error during WS join"
				});
			}
			if (!vm.isJoinErrorCode(e) && t !== W.UNSPECIFIED) {
				if (t === W.DISCONNECT) globalThis.streamRNVideoSDK?.callingX?.endCall(this, "error"), this.leave({ message: "SFU instructed to disconnect" }).catch((e) => {
					this.logger.warn("Can't leave call after disconnect request", e);
				});
				else {
					let e = n?.code === Ol.PARTICIPANT_MEDIA_TRANSPORT_FAILURE && !this.publisher?.hasIceEverConnected() && !this.subscriber?.hasIceEverConnected() ? Hp.ICE_NEVER_CONNECTED : n?.message || Hp.SFU_ERROR;
					this.reconnect(t, e).catch((e) => {
						this.logger.warn("[Reconnect] Error reconnecting", e);
					});
				}
			}
		}), n = this.streamClient.on("network.changed", (e) => {
			if (this.tracer.trace("network.changed", e), e.online) {
				if (!this.networkAvailableTask) return;
				this.logger.debug("[Reconnect] Going online"), Af(this.reconnectConcurrencyTag) || this.sfuClient?.close(xm.DISPOSE_OLD_SOCKET, "Closing WS to reconnect after going online"), this.networkAvailableTask?.resolve(), this.networkAvailableTask = void 0, this.sfuStatsReporter?.start();
			} else {
				if (this.logger.debug("[Reconnect] Going offline"), !this.hasJoinedOnce) return;
				this.lastOfflineTimestamp = Date.now();
				let e = fm();
				e.promise.then(() => {
					let e = W.FAST;
					this.lastOfflineTimestamp && (Date.now() - this.lastOfflineTimestamp) / 1e3 > this.fastReconnectDeadlineSeconds && (e = W.REJOIN), this.reconnect(e, Hp.NETWORK_BACK_ONLINE).catch((e) => {
						this.logger.warn("[Reconnect] Error reconnecting after going online", e);
					});
				}), this.networkAvailableTask = e, this.sfuStatsReporter?.stop(), this.state.setCallingState(Z.OFFLINE);
			}
		});
		this.leaveCallHooks.add(e).add(t).add(n);
	};
	restorePublishedTracks = async () => {
		for (let e of this.trackPublishOrder) {
			let t;
			switch (e) {
				case U.AUDIO:
					t = this.microphone.state.mediaStream;
					break;
				case U.VIDEO:
					t = this.camera.state.mediaStream;
					break;
				case U.SCREEN_SHARE:
					t = this.screenShare.state.mediaStream;
					break;
				case U.SCREEN_SHARE_AUDIO:
				case U.UNSPECIFIED: break;
				default: lf(e, "Unknown track type");
			}
			t && await this.publish(t, e);
		}
	};
	restoreSubscribedTracks = () => {
		let { remoteParticipants: e } = this.state;
		e.length <= 0 || this.trackSubscriptionManager.apply(void 0);
	};
	publishVideoStream = async (e) => {
		await this.publish(e, U.VIDEO);
	};
	publishAudioStream = async (e) => {
		await this.publish(e, U.AUDIO);
	};
	publishScreenShareStream = async (e) => {
		await this.publish(e, U.SCREEN_SHARE);
	};
	publish = async (e, t, n) => {
		if (!this.sfuClient) throw Error("Call is not joined yet");
		if (await this.sfuClient.joinTask, !this.permissionsContext.canPublish(t)) throw Error(`No permission to publish ${U[t]}`);
		if (!this.publisher) throw Error("Publisher is not initialized");
		let [r] = Yp(t) ? e.getAudioTracks() : e.getVideoTracks();
		if (!r) throw Error(`There is no ${U[t]} track in the stream`);
		if (r.readyState === "ended") throw Error("Can't publish ended tracks.");
		om(this.trackPublishOrder, t), await this.publisher.publish(r, t, n);
		let i = [t];
		if (t === U.SCREEN_SHARE) {
			let [t] = e.getAudioTracks();
			if (t) {
				let e = U.SCREEN_SHARE_AUDIO;
				om(this.trackPublishOrder, e), await this.publisher.publish(t, e, n), i.push(e);
			}
		}
		await this.updateLocalStreamState(e, ...i);
	};
	stopPublish = async (...e) => {
		this.sfuClient && this.publisher && (await this.publisher.stopTracks(...e), await this.updateLocalStreamState(void 0, ...e));
	};
	updateLocalStreamState = async (e, ...t) => {
		let n = this.sfuClient?.sessionId;
		if (n && (await this.notifyTrackMuteState(!e, ...t), this.sfuClient?.sessionId === n)) for (let r of t) {
			let t = Kp(r);
			t && this.state.updateParticipant(n, (n) => {
				let i = n[t], a = this.subscriber?.isSelfSubscribedStream(i);
				return {
					publishedTracks: e ? om([...n.publishedTracks], r) : n.publishedTracks.filter((e) => e !== r),
					[t]: a ? i : e
				};
			});
		}
	};
	refreshPublishedTrack = async (e) => {
		this.publisher && await this.publisher.refreshTrack(e);
	};
	updatePublishOptions = (e) => {
		this.logger.warn("[call.updatePublishOptions]: You are manually overriding the publish options for this call. This is not recommended, and it can cause call stability/compatibility issues. Use with caution."), this.state.callingState === Z.JOINED && this.logger.warn("Updating publish options after joining the call does not have an effect"), this.tracer.trace("updatePublishOptions", e), this.clientPublishOptions = {
			...this.clientPublishOptions,
			...e
		};
	};
	setE2EEManager = (e) => {
		if (this.publisher || this.subscriber) throw Error("setE2EEManager must be called before join()");
		this.e2eeManager = e;
	};
	notifyNoiseCancellationStarting = async () => this.sfuClient?.startNoiseCancellation().catch((e) => {
		this.logger.warn("Failed to notify start of noise cancellation", e);
	});
	notifyNoiseCancellationStopped = async () => this.sfuClient?.stopNoiseCancellation().catch((e) => {
		this.logger.warn("Failed to notify stop of noise cancellation", e);
	});
	notifyTrackMuteState = async (e, ...t) => {
		await J(`muteState.${this.cid}.${t.join("-")}`, async () => {
			this.sfuClient && await this.sfuClient.updateMuteStates(t.map((t) => ({
				trackType: t,
				muted: e
			})));
		});
	};
	startReportingStatsFor = (e) => this.statsReporter?.startReportingStatsFor(e);
	stopReportingStatsFor = (e) => this.statsReporter?.stopReportingStatsFor(e);
	setStatsReportingIntervalInMs = (e) => {
		this.statsReportingIntervalInMs = e;
	};
	resetReaction = (e) => {
		this.state.updateParticipant(e, { reaction: void 0 });
	};
	setSortParticipantsBy = (e) => this.state.setSortParticipantsBy(e);
	getSortParticipantsBy = () => this.state.getSortParticipantsBy();
	sendReaction = async (e) => this.streamClient.post(`${this.streamClientBasePath}/reaction`, e);
	blockUser = async (e) => this.streamClient.post(`${this.streamClientBasePath}/block`, { user_id: e });
	unblockUser = async (e) => this.streamClient.post(`${this.streamClientBasePath}/unblock`, { user_id: e });
	kickUser = async (e) => this.streamClient.post(`${this.streamClientBasePath}/kick`, e);
	muteSelf = (e) => {
		let t = this.currentUserId;
		if (t) return this.muteUser(t, e);
	};
	muteOthers = (e) => {
		let t = qp(e);
		if (!t) return;
		let n = [];
		for (let e of this.state.remoteParticipants) e.publishedTracks.includes(t) && n.push(e.userId);
		return n.length > 0 ? this.muteUser(n, e) : void 0;
	};
	muteUser = (e, t) => this.streamClient.post(`${this.streamClientBasePath}/mute_users`, {
		user_ids: Array.isArray(e) ? e : [e],
		[t]: !0
	});
	muteAllUsers = (e) => this.streamClient.post(`${this.streamClientBasePath}/mute_users`, {
		mute_all_users: !0,
		[e]: !0
	});
	startRecording = async (e, t) => {
		t = typeof e == "string" ? e : t, e = typeof e == "string" ? void 0 : e;
		let n = t ? `/recordings/${encodeURIComponent(t)}/start` : "/start_recording";
		return this.streamClient.post(`${this.streamClientBasePath}${n}`, e);
	};
	stopRecording = async (e) => {
		let t = e ? `/recordings/${encodeURIComponent(e)}/stop` : "/stop_recording";
		return this.streamClient.post(`${this.streamClientBasePath}${t}`);
	};
	startTranscription = async (e) => this.streamClient.post(`${this.streamClientBasePath}/start_transcription`, e);
	stopTranscription = async () => this.streamClient.post(`${this.streamClientBasePath}/stop_transcription`);
	startClosedCaptions = async (e) => {
		let t = this.state.setCaptioning(!0);
		try {
			return await this.streamClient.post(`${this.streamClientBasePath}/start_closed_captions`, e);
		} catch (e) {
			throw t.rollback(), e;
		}
	};
	stopClosedCaptions = async (e) => {
		let t = this.state.setCaptioning(!1);
		try {
			return await this.streamClient.post(`${this.streamClientBasePath}/stop_closed_captions`, e);
		} catch (e) {
			throw t.rollback(), e;
		}
	};
	updateClosedCaptionSettings = (e) => {
		this.state.updateClosedCaptionSettings(e);
	};
	requestPermissions = async (e) => {
		let { permissions: t } = e;
		if (!t.every((e) => this.permissionsContext.canRequest(e))) throw Error(`You are not allowed to request permissions: ${t.join(", ")}`);
		return this.streamClient.post(`${this.streamClientBasePath}/request_permission`, e);
	};
	grantPermissions = async (e, t) => this.updateUserPermissions({
		user_id: e,
		grant_permissions: t
	});
	revokePermissions = async (e, t) => this.updateUserPermissions({
		user_id: e,
		revoke_permissions: t
	});
	updateUserPermissions = async (e) => this.streamClient.post(`${this.streamClientBasePath}/user_permissions`, e);
	goLive = async (e = {}, t) => this.streamClient.post(`${this.streamClientBasePath}/go_live`, e, t);
	stopLive = async (e = {}) => this.streamClient.post(`${this.streamClientBasePath}/stop_live`, e);
	startHLS = async () => this.streamClient.post(`${this.streamClientBasePath}/start_broadcasting`, {});
	stopHLS = async () => this.streamClient.post(`${this.streamClientBasePath}/stop_broadcasting`, {});
	startRTMPBroadcasts = async (e) => this.streamClient.post(`${this.streamClientBasePath}/rtmp_broadcasts`, e);
	stopAllRTMPBroadcasts = async () => this.streamClient.post(`${this.streamClientBasePath}/rtmp_broadcasts/stop`);
	stopRTMPBroadcast = async (e) => this.streamClient.post(`${this.streamClientBasePath}/rtmp_broadcasts/${e}/stop`);
	startFrameRecording = async (e) => this.streamClient.post(`${this.streamClientBasePath}/start_frame_recording`, e);
	stopFrameRecording = async () => this.streamClient.post(`${this.streamClientBasePath}/stop_frame_recording`);
	update = async (e) => {
		let t = await this.streamClient.patch(`${this.streamClientBasePath}`, e), { call: n, members: r, own_capabilities: i } = t;
		return this.state.updateFromCallResponse(n), this.state.setMembers(r), this.state.setOwnCapabilities(i), t;
	};
	endCall = async () => this.streamClient.post(`${this.streamClientBasePath}/mark_ended`);
	pin = (e) => {
		this.state.updateParticipant(e, { pin: {
			isLocalPin: !0,
			pinnedAt: Date.now()
		} });
	};
	unpin = (e) => {
		this.state.updateParticipant(e, { pin: void 0 });
	};
	pinForEveryone = async (e) => this.streamClient.post(`${this.streamClientBasePath}/pin`, e);
	unpinForEveryone = async (e) => this.streamClient.post(`${this.streamClientBasePath}/unpin`, e);
	queryMembers = (e) => this.streamClient.post("/call/members", {
		...e || {},
		id: this.id,
		type: this.type
	});
	queryParticipants = async (e = {}, t = {}) => this.streamClient.post(`${this.streamClientBasePath}/participants`, e, t);
	updateCallMembers = async (e) => this.streamClient.post(`${this.streamClientBasePath}/members`, e);
	scheduleAutoDrop = () => {
		this.cancelAutoDrop(), this.ringTimeout = new Om(this), this.ringTimeout.start();
	};
	cancelAutoDrop = () => {
		this.ringTimeout?.stop(), this.ringTimeout = void 0;
	};
	scheduleRingStatePolling = () => {
		if (this.cancelRingStatePolling(), !this.isCreatedByMe) return;
		let e = this.streamClient.options.ringStatePolling;
		e !== !1 && (this.ringStatePoller = new Dm(this, e), this.ringStatePoller.start());
	};
	cancelRingStatePolling = () => {
		this.ringStatePoller?.stop(), this.ringStatePoller = void 0;
	};
	queryRecordings = async (e) => this.listRecordings(e);
	listRecordings = async (e) => {
		let t = this.streamClientBasePath;
		return e && (t = `${t}/${e}`), this.streamClient.get(`${t}/recordings`);
	};
	deleteRecording = async (e, t) => this.streamClient.delete(`${this.streamClientBasePath}/${encodeURIComponent(e)}/recordings/${encodeURIComponent(t)}`);
	deleteTranscription = async (e, t) => this.streamClient.delete(`${this.streamClientBasePath}/${encodeURIComponent(e)}/transcriptions/${encodeURIComponent(t)}`);
	queryTranscriptions = async () => this.listTranscriptions();
	listTranscriptions = async () => this.streamClient.get(`${this.streamClientBasePath}/transcriptions`);
	getCallStats = async (e) => {
		let t = `${this.streamClientBasePath}/stats/${e}`;
		return this.streamClient.get(t);
	};
	getCallReport = async (e = "") => {
		let t = `${this.streamClientBasePath}/report`, n = e === "" ? {} : { session_id: e };
		return this.streamClient.get(t, n);
	};
	getCallParticipantsStats = async (e) => {
		let { sessionId: t = this.state.session?.id, userId: n = this.currentUserId, userSessionId: r = this.unifiedSessionId, kind: i = "details" } = e;
		if (!t) return;
		let a = `${this.streamClient.baseURL}/call_stats/${this.type}/${this.id}/${t}`;
		return !n || !r ? this.streamClient.get(`${a}/participants`) : i === "details" ? this.streamClient.get(`${a}/participant/${n}/${r}/details`) : this.streamClient.get(`${a}/participants/${n}/${r}/timeline`);
	};
	submitFeedback = async (e, { reason: t, custom: n } = {}) => {
		let { sdkName: r, sdkVersion: i, ...a } = Sp(await Sf());
		return this.streamClient.post(`${this.streamClientBasePath}/feedback`, {
			rating: e,
			reason: t,
			user_session_id: this.sfuClient?.sessionId,
			sdk: r,
			sdk_version: i,
			custom: {
				...n,
				"x-stream-platform-data": a
			}
		});
	};
	getCallStatsMap = async (e = {}, t = this.state.session?.id) => {
		if (!t) throw Error("callSessionId is required");
		return this.streamClient.get(`${this.streamClient.baseURL}/call_stats/${this.type}/${this.id}/${t}/map`, e);
	};
	sendCustomEvent = async (e) => this.streamClient.post(`${this.streamClientBasePath}/event`, { custom: e });
	applyDeviceConfig = async (e, t) => {
		let { publish: n, skipSpeakerApply: r = K(), withDisabledDevices: i } = t;
		r || await this.speaker.apply(e).catch((e) => this.logger.warn("Speaker init failed", e)), await this.camera.apply(e.video, n, i).catch((e) => this.logger.warn("Camera init failed", e)), await this.microphone.apply(e.audio, n, i).catch((e) => this.logger.warn("Mic init failed", e));
	};
	trackElementVisibility = (e, t, n) => this.viewportTracker?.trackElementVisibility(e, t, n);
	setViewport = (e) => this.viewportTracker?.setViewport(e);
	bindVideoElement = (e, t, n) => {
		let r = this.dynascaleManager?.bindVideoElement(e, t, n), i = this.bindFirstVideoFrameDetector(e, t, n);
		if (!r && !i) return;
		let a = () => {
			i?.(), r?.();
		};
		return this.leaveCallHooks.add(a), () => {
			this.leaveCallHooks.delete(a), a();
		};
	};
	bindFirstVideoFrameDetector = (e, t, n) => {
		if (n === "videoTrack") return oh(e, () => {
			this.reportFirstRenderedVideoFrame(t);
		});
	};
	reportFirstRenderedVideoFrame = (e) => {
		let t = this.state.findParticipantBySessionId(e);
		if (t?.isLocalParticipant) return;
		let n = t?.videoStream?.getVideoTracks()[0]?.id;
		n && this.clientEventReporter.reportFirstFrame(this.cid, U.VIDEO, n);
	};
	bindAudioElement = (e, t, n = "audioTrack") => {
		let r = this.dynascaleManager?.bindAudioElement(e, t, n);
		if (!r) return;
		this.audioBindingsWatchdog?.register(e, t, n);
		let i = () => {
			r(), this.audioBindingsWatchdog?.unregister(t, n);
		};
		return this.leaveCallHooks.add(i), () => {
			this.leaveCallHooks.delete(i), i();
		};
	};
	resumeAudio = () => this.blockedAudioTracker.resumeAudio();
	bindCallThumbnailElement = (e, t = {}) => {
		let n = () => {
			e.src = t.fallbackImageSource || "https://getstream.io/random_svg/?name=x&id=x";
		}, r = zf(this.state.thumbnails$, (t) => {
			if (!t) return;
			e.addEventListener("error", n);
			let r = new URL(t.image_url);
			r.searchParams.set("w", String(e.clientWidth)), r.searchParams.set("h", String(e.clientHeight)), e.src = r.toString();
		});
		return () => {
			r(), e.removeEventListener("error", n);
		};
	};
	setPreferredIncomingVideoResolution = (e, t) => {
		this.trackSubscriptionManager.setOverrides(e ? {
			enabled: !0,
			dimension: e
		} : void 0, t), this.trackSubscriptionManager.apply();
	};
	setIncomingVideoEnabled = (e) => {
		this.trackSubscriptionManager.setOverrides(e ? void 0 : { enabled: !1 }), this.trackSubscriptionManager.apply();
	};
	setDisconnectionTimeout = (e) => {
		this.disconnectionTimeoutSeconds = e;
	};
	setRejoinAttemptLimit = (e, t) => {
		this.rejoinLongWindowRateLimiter = void 0, this.rejoinRateLimiter.setLimits(Math.max(1, e), Math.max(1, t) * 1e3);
	};
	setMaxIceFailuresWithoutConnect = (e) => {
		this.maxIceFailuresWithoutConnect = Math.max(1, e);
	};
	setMaxConsecutiveNegotiationFailures = (e) => {
		this.maxConsecutiveNegotiationFailures = Math.max(1, e);
	};
	enableClientCapabilities = (...e) => {
		for (let t of e) this.clientCapabilities.add(t);
	};
	disableClientCapabilities = (...e) => {
		for (let t of e) this.clientCapabilities.delete(t);
	};
}, fg = null, pg = {
	[-1]: "InternalSystemError",
	2: "AccessKeyError",
	3: "AuthenticationFailedError",
	4: "InputError",
	5: "AuthenticationError",
	6: "DuplicateUsernameError",
	9: "RateLimitError",
	16: "DoesNotExistError",
	17: "NotAllowedError",
	18: "EventNotSupportedError",
	19: "ChannelFeatureNotSupportedError",
	20: "MessageTooLongError",
	21: "MultipleNestingLevelError",
	22: "PayloadTooBigError",
	23: "RequestTimeoutError",
	24: "MaxHeaderSizeExceededError",
	40: "AuthErrorTokenExpired",
	41: "AuthErrorTokenNotValidYet",
	42: "AuthErrorTokenUsedBeforeIssuedAt",
	43: "AuthErrorTokenSignatureInvalid",
	44: "CustomCommandEndpointMissingError",
	45: "CustomCommandEndpointCallError",
	46: "ConnectionIDNotFoundError",
	60: "CoolDownError",
	69: "ErrWrongRegion",
	70: "ErrQueryChannelPermissions",
	71: "ErrTooManyConnections",
	73: "MessageModerationFailedError",
	99: "AppSuspendedError"
}, mg = class {
	client;
	ws;
	wsID = 1;
	isConnecting = !1;
	isDisconnected = !1;
	isHealthy = !1;
	connectionID;
	connectionOpenSafe;
	resolveConnectionOpen;
	rejectConnectionOpen;
	isConnectionOpenResolved = !1;
	consecutiveFailures = 0;
	totalFailures = 0;
	lastConnectionError;
	pingInterval = 25e3;
	healthCheckTimeoutRef;
	connectionCheckTimeout = this.pingInterval + 1e4;
	connectionCheckTimeoutRef;
	lastEvent = null;
	constructor(e) {
		this.client = e, Id(this.onlineStatusChanged);
	}
	_log = (e, t = {}, n = "info") => {
		this.client.logger[n](`connection:${e}`, t);
	};
	setClient = (e) => {
		this.client = e;
	};
	connect = async (e = 15e3) => {
		if (this.isConnecting) throw Error("You've called connect twice, can only attempt 1 connection at the time");
		this.isDisconnected = !1, this.lastConnectionError = void 0;
		try {
			let t = await this._connect(e);
			this.consecutiveFailures = 0, this._log(`connect() - Established ws connection with healthcheck: ${t}`);
		} catch (e) {
			let t = e;
			if (this.isHealthy = !1, this.consecutiveFailures += 1, t.code === Ad.TOKEN_EXPIRED && !this.client.tokenManager.isStatic()) this._log("connect() - WS failure due to expired token, so going to try to reload token and reconnect"), this._reconnect({ refreshToken: !0 });
			else if (t.isWSFailure) this.lastConnectionError = t, this._reconnect();
			else throw Error(JSON.stringify({
				code: t.code,
				StatusCode: t.StatusCode,
				message: t.message,
				isWSFailure: t.isWSFailure
			}));
		}
		return await this._waitForHealthy(e);
	};
	_waitForHealthy = async (e = 15e3) => Promise.race([(async () => {
		for (let t = 0; t <= e; t += 50) try {
			return await this.connectionOpen;
		} catch (n) {
			let r = n;
			if (t === e) throw Error(JSON.stringify({
				code: r.code,
				StatusCode: r.StatusCode,
				message: r.message,
				isWSFailure: r.isWSFailure
			}));
			await Dd(50);
		}
	})(), (async () => {
		await Dd(e), this.isConnecting = !1;
		let t = this.lastConnectionError, n = t ? {
			code: t.code,
			StatusCode: t.StatusCode,
			message: t.message,
			isWSFailure: t.isWSFailure
		} : {
			code: "",
			StatusCode: "",
			message: "initial WS connection could not be established",
			isWSFailure: !0
		};
		throw Error(JSON.stringify(n));
	})()]);
	_buildUrl = () => {
		let e = new URLSearchParams();
		return e.set("api_key", this.client.key), e.set("stream-auth-type", this.client.getAuthType()), e.set("X-Stream-Client", this.client.getUserAgent()), `${this.client.wsBaseURL}/connect?${e.toString()}`;
	};
	disconnect = (e) => {
		this._log(`disconnect() - Closing the websocket connection for wsID ${this.wsID}`), this.wsID += 1, this.isConnecting = !1, this.isDisconnected = !0, this.healthCheckTimeoutRef && _m().clearInterval(this.healthCheckTimeoutRef), this.connectionCheckTimeoutRef && _m().clearTimeout(this.connectionCheckTimeoutRef), Ld(this.onlineStatusChanged), this.isHealthy = !1;
		let t, { ws: n } = this;
		return n && n.close && n.readyState === n.OPEN ? (t = new Promise((t) => {
			let r = (e) => {
				this._log(`disconnect() - resolving isClosedPromise ${e ? "with" : "without"} close frame`, { event: e }), t();
			};
			n.onclose = r, setTimeout(r, e ?? 1e3);
		}), this._log("disconnect() - Manually closed connection by calling client.disconnect()"), n.close(Ad.WS_CLOSED_SUCCESS, "Manually closed connection by calling client.disconnect()")) : (this._log("disconnect() - ws connection doesn't exist or it is already closed."), t = Promise.resolve()), delete this.ws, t;
	};
	_connect = async (e) => {
		if (this.isConnecting) return;
		this.isConnecting = !0;
		let t = this.client.rejectConnectionId, n = !1;
		try {
			this._log("_connect() - waiting for token"), await this.client.tokenManager.tokenReady(), n = !0;
		} catch {}
		try {
			n || (this._log("_connect() - tokenProvider failed before, so going to retry"), await this.client.tokenManager.loadToken()), this.client.isConnectionIdPromisePending || (this.client._setupConnectionIdPromise(), t = this.client.rejectConnectionId), this._setupConnectionPromise();
			let r = this._buildUrl();
			this._log(`_connect() - Connecting to ${r}`);
			let i = this.client.options.WebSocketImpl ?? WebSocket;
			this.ws = new i(r), this.ws.onopen = this.onopen.bind(this, this.wsID), this.ws.onclose = this.onclose.bind(this, this.wsID), this.ws.onerror = this.onerror.bind(this, this.wsID), this.ws.onmessage = this.onmessage.bind(this, this.wsID);
			let a = e ?? this.client.defaultWSTimeout, o = _m(), s, c;
			try {
				c = await Promise.race([this.connectionOpen, new Promise((e, t) => {
					s = o.setTimeout(() => {
						let e = /* @__PURE__ */ Error(`WS handshake timed out after ${a}ms`);
						e.isWSFailure = !0, t(e);
					}, a);
				})]);
			} finally {
				o.clearTimeout(s);
			}
			if (this.isConnecting = !1, this.isDisconnected) throw this.ws && this.ws.readyState !== this.ws.CLOSED && this._destroyCurrentWSConnection(), Error("WS handshake aborted: disconnect() ran while connecting");
			return c ? (this.connectionID = c.connection_id, this.client.resolveConnectionId?.(this.connectionID), c) : void 0;
		} catch (e) {
			let n = e;
			throw this.lastConnectionError = n, this.isConnecting = !1, this._log("_connect() - Error - ", n), t?.(n), this.rejectConnectionOpen?.(n), this.ws && this.ws.readyState !== this.ws.CLOSED && this._destroyCurrentWSConnection(), n;
		}
	};
	async _reconnect(e = {}) {
		if (this._log("_reconnect() - Initiating the reconnect"), this.isConnecting || this.isHealthy) {
			this._log("_reconnect() - Abort (1) since already connecting or healthy");
			return;
		}
		let t = e.interval;
		if (t ||= jd(this.consecutiveFailures), await Dd(t), this.isConnecting || this.isHealthy) this._log("_reconnect() - Abort (2) since already connecting or healthy");
		else if (this.isDisconnected) this._log("_reconnect() - Abort (3) since disconnect() is called");
		else {
			this._log("_reconnect() - Destroying current WS connection"), this._destroyCurrentWSConnection(), e.refreshToken && await this.client.tokenManager.loadToken();
			try {
				await this._connect(), this._log("_reconnect() - Waiting for recoverCallBack"), this._log("_reconnect() - Finished recoverCallBack"), this.consecutiveFailures = 0;
			} catch (e) {
				let t = e;
				if (this.isHealthy = !1, this.consecutiveFailures += 1, t.code === Ad.TOKEN_EXPIRED && !this.client.tokenManager.isStatic()) return this._log("_reconnect() - WS failure due to expired token, so going to try to reload token and reconnect"), this._reconnect({ refreshToken: !0 });
				t.isWSFailure && (this._log("_reconnect() - WS failure, so going to try to reconnect"), this._reconnect());
			}
			this._log("_reconnect() - == END ==");
		}
	}
	onlineStatusChanged = (e) => {
		e.type === "offline" ? (this._log("onlineStatusChanged() - Status changing to offline"), this._setHealth(!1, !0)) : e.type === "online" && (this._log(`onlineStatusChanged() - Status changing to online. isHealthy: ${this.isHealthy}`), this.isHealthy || this._reconnect({ interval: 10 }));
	};
	onopen = (e) => {
		if (this.wsID !== e) return;
		let t = this.client.user;
		if (!t) {
			this.client.logger.error("User not set, can't connect to WS");
			return;
		}
		let n = this.client._getToken();
		if (!n) {
			this.client.logger.error("Token not set, can't connect authenticate");
			return;
		}
		let r = {
			token: n,
			products: [_l.VIDEO],
			user_details: {
				id: t.id,
				name: t.name,
				image: t.image,
				custom: t.custom
			}
		}, i = JSON.stringify(r);
		this._log(`onopen() - Sending auth message ${i}`, {}, "trace"), this.ws?.send(i), this._log("onopen() - onopen callback", { wsID: e });
	};
	onmessage = (e, t) => {
		if (this.wsID !== e) return;
		let n = typeof t.data == "string" ? JSON.parse(t.data) : null;
		if (!this.isConnectionOpenResolved && n && n.type === "connection.error" && (this.isConnectionOpenResolved = !0, n.error)) this.rejectConnectionOpen?.(this._errorFromWSEvent(n, !1));
		else {
			if (this.lastEvent = /* @__PURE__ */ new Date(), n && (n.type === "health.check" || n.type === "connection.ok") && this.scheduleNextPing(), n && n.type === "connection.ok" && (this.resolveConnectionOpen?.(n), this._setHealth(!0)), n && n.type === "connection.error" && n.error) {
				let { code: e } = n.error;
				this.isHealthy = !1, this.isConnecting = !1, this.consecutiveFailures += 1, e === Ad.TOKEN_EXPIRED && !this.client.tokenManager.isStatic() && (_m().clearTimeout(this.connectionCheckTimeoutRef), this._log("connect() - WS failure due to expired token, so going to try to reload token and reconnect"), this._reconnect({ refreshToken: !0 }));
			}
			n && (n.received_at = /* @__PURE__ */ new Date(), this.client.dispatchEvent(n)), this.scheduleConnectionCheck();
		}
	};
	onclose = (e, t) => {
		if (this.wsID === e) {
			if (this._log("onclose() - onclose callback - " + t.code, {
				event: t,
				wsID: e
			}), t.code === Ad.WS_CLOSED_SUCCESS) {
				let e = /* @__PURE__ */ Error(`WS connection reject with error ${t.reason}`);
				e.reason = t.reason, e.code = t.code, e.wasClean = t.wasClean, e.target = t.target, this.rejectConnectionOpen?.(e), this._log(`onclose() - WS connection reject with error ${t.reason}`, { event: t });
			} else this.consecutiveFailures += 1, this.totalFailures += 1, this._setHealth(!1), this.isConnecting = !1, this.rejectConnectionOpen?.(this._errorFromWSEvent(t)), this._log("onclose() - WS connection closed. Calling reconnect ...", { event: t }), this._reconnect();
		}
	};
	onerror = (e, t) => {
		this.wsID === e && (this.consecutiveFailures += 1, this.totalFailures += 1, this._setHealth(!1), this.isConnecting = !1, this._log("onerror() - WS connection resulted into error", { event: t }), this._reconnect());
	};
	_setHealth = (e, t = !1) => {
		e !== this.isHealthy && (this.isHealthy = e, this.isHealthy || t ? this.client.dispatchEvent({
			type: "connection.changed",
			online: this.isHealthy
		}) : setTimeout(() => {
			this.isHealthy || this.client.dispatchEvent({
				type: "connection.changed",
				online: this.isHealthy
			});
		}, 5e3));
	};
	_errorFromWSEvent = (e, t = !0) => {
		let n, r, i;
		if (zd(e)) n = e.code, i = e.reason, r = 0;
		else {
			let { error: t } = e;
			n = t.code, i = t.message, r = t.StatusCode;
		}
		let a = `WS failed with code: ${n}: ${pg[n] || n} and reason: ${i}`;
		this._log(a, { event: e }, "warn");
		let o = Error(a);
		return o.code = n, o.StatusCode = r, o.isWSFailure = t, o;
	};
	_destroyCurrentWSConnection() {
		this.wsID += 1;
		try {
			this?.ws?.close();
		} catch {}
	}
	_setupConnectionPromise = () => {
		this.isConnectionOpenResolved = !1, this.connectionOpenSafe = dm(new Promise((e, t) => {
			this.resolveConnectionOpen = e, this.rejectConnectionOpen = t;
		}));
	};
	get connectionOpen() {
		return this.connectionOpenSafe?.();
	}
	scheduleNextPing = () => {
		let e = _m();
		this.healthCheckTimeoutRef && e.clearTimeout(this.healthCheckTimeoutRef), this.healthCheckTimeoutRef = e.setTimeout(() => {
			let e = [{
				type: "health.check",
				client_id: this.client.clientID
			}];
			try {
				this.ws?.send(JSON.stringify(e));
			} catch {}
		}, this.pingInterval);
	};
	scheduleConnectionCheck = () => {
		let e = _m();
		e.clearTimeout(this.connectionCheckTimeoutRef), this.connectionCheckTimeoutRef = e.setTimeout(() => {
			let e = /* @__PURE__ */ new Date();
			this.lastEvent && e.getTime() - this.lastEvent.getTime() > this.connectionCheckTimeout && (this._log("scheduleConnectionCheck - going to reconnect"), this._setHealth(!1), this._reconnect());
		}, this.connectionCheckTimeout);
	};
};
function hg(e) {
	let t = e.split(".");
	if (t.length !== 3) return "";
	let n = t[1], r = gg(n);
	return JSON.parse(r).user_id;
}
var gg = (e) => {
	let t = {}, n = String.fromCharCode, r = e.length, i, a = 0, o, s, c = 0, l, u = "";
	for (i = 0; i < 64; i++) t["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i)] = i;
	for (s = 0; s < r; s++) for (o = t[e.charAt(s)], a = (a << 6) + o, c += 6; c >= 8;) ((l = a >>> (c -= 8) & 255) || s < r - 2) && (u += n(l));
	return u;
}, _g = class {
	loadTokenPromise = null;
	type = "static";
	secret;
	token;
	tokenProvider;
	user;
	isAnonymous;
	constructor(e) {
		this.secret = e;
	}
	setTokenOrProvider = async (e, t, n) => {
		this.user = t, this.isAnonymous = n, this.validateToken(e), kd(e) && (this.tokenProvider = e, this.type = "provider"), typeof e == "string" && (this.token = e, this.type = "static"), await this.loadToken();
	};
	reset = () => {
		this.token = void 0, this.tokenProvider = void 0, this.type = "static", this.user = void 0, this.loadTokenPromise = null;
	};
	validateToken = (e) => {
		if (!(this.user && this.isAnonymous && !e)) {
			if (!this.secret && !e) throw Error("User token can not be empty");
			if (typeof e != "string" && !kd(e)) throw Error("User token should either be a string or a function");
			if (typeof e == "string") {
				if (this.isAnonymous && e === "") return;
				let t = hg(e);
				if (e != null && (t == null || t === "" || !this.isAnonymous && t !== this.user.id)) throw Error("userToken does not have a user_id or is not matching with user.id");
			}
		}
	};
	tokenReady = () => this.loadTokenPromise;
	loadToken = () => (this.loadTokenPromise = new Promise(async (e, t) => {
		if (this.type === "static") return e(this.token);
		if (this.tokenProvider && typeof this.tokenProvider != "string") {
			try {
				let e = await this.tokenProvider();
				this.validateToken(e), this.token = e;
			} catch (e) {
				return t(Error(`Call to tokenProvider failed with message: ${e}`, { cause: e }));
			}
			e(this.token);
		}
	}), this.loadTokenPromise);
	getToken = () => {
		if (this.token || this.user && !this.token) return this.token;
		throw Error("User token is not set. Either client.connectUser wasn't called or client.disconnect was called");
	};
	isStatic = () => this.type === "static";
}, vg = async (e = "https://hint.stream-io-video.com/", t = 2e3, n = 3) => {
	let r = q.getLogger("location-hint"), i = 0, a = "ERR";
	do {
		let n = new AbortController(), i = setTimeout(() => n.abort(), t);
		try {
			let t = (await fetch(e, {
				method: "HEAD",
				signal: n.signal
			})).headers.get("x-amz-cf-pop") || "ERR";
			r.debug(`Location header: ${t}`), a = t.substring(0, 3);
		} catch (t) {
			r.warn(`Failed to get location hint from ${e}`, t), a = "ERR";
		} finally {
			clearTimeout(i);
		}
	} while (a === "ERR" && ++i < n);
	return a;
}, yg = class {
	_user;
	anonymous;
	persistUserOnConnectionFailure;
	axiosInstance;
	baseURL;
	browser;
	clientID;
	key;
	listeners = {};
	logger;
	locationHint;
	node;
	options;
	secret;
	connectUserTask;
	tokenManager;
	user;
	cachedUserAgent;
	userID;
	wsBaseURL;
	wsConnection;
	wsPromiseSafe;
	consecutiveFailures;
	defaultWSTimeout;
	resolveConnectionId;
	rejectConnectionId;
	connectionIdPromiseSafe;
	guestUserCreatePromise;
	constructor(e, t) {
		this.key = e, this.secret = t?.secret;
		let n = t || { browser: typeof window < "u" };
		this.browser = n.browser || typeof window < "u", this.node = !this.browser, this.browser && (this.locationHint = vg(t?.locationHintUrl, t?.locationHintTimeout, t?.locationHintMaxAttempts)), this.options = {
			timeout: 5e3,
			withCredentials: !1,
			...n
		}, this.node && !this.options.httpsAgent && (this.options.httpsAgent = new fg.Agent({
			keepAlive: !0,
			keepAliveMsecs: 3e3
		})), this.setBaseURL(this.options.baseURL || "https://video.stream-io-api.com/video"), this.axiosInstance = I.create({
			...this.options,
			baseURL: this.baseURL
		}), this.wsConnection = null, this.wsPromiseSafe = null, this.connectUserTask = null, this.anonymous = !1, this.persistUserOnConnectionFailure = this.options?.persistUserOnConnectionFailure, this.tokenManager = new _g(this.secret), this.consecutiveFailures = 0, this.defaultWSTimeout = this.options.defaultWsTimeout ?? 15e3, this.logger = q.getLogger("coordinator");
	}
	getAuthType = () => this.anonymous ? "anonymous" : "jwt";
	setBaseURL = (e) => {
		this.baseURL = e, this.wsBaseURL = this.baseURL.replace("http", "ws").replace(":3030", ":8800");
	};
	getLocationHint = async (e, t) => {
		let n = await this.locationHint;
		return !n || n === "ERR" ? (this.locationHint = vg(e ?? this.options.locationHintUrl, t ?? this.options.locationHintTimeout), this.locationHint) : n;
	};
	_getConnectionID = () => this.wsConnection?.connectionID;
	_hasConnectionID = () => !!this._getConnectionID();
	connectUser = async (e, t) => {
		if (!e.id) throw Error("The \"id\" field on the user is missing");
		if (this.userID === e.id && this.connectUserTask) return this.logger.warn("Consecutive calls to connectUser is detected, ideally you should only call this function once in your app."), this.connectUserTask;
		if (this.userID) throw Error("Use client.disconnect() before trying to connect as a different user. connectUser was called twice.");
		(this.secret || this.node) && !this.options.allowServerSideConnect && this.logger.warn("Please do not use connectUser server side. Use our @stream-io/node-sdk instead: https://getstream.io/video/docs/api/"), this.userID = e.id, this.anonymous = !1, await this.tokenManager.setTokenOrProvider(t, e, !1), this._setUser(e), this.connectUserTask = this.openConnection();
		try {
			return Id(this.updateNetworkConnectionStatus), await this.connectUserTask;
		} catch (e) {
			throw this.persistUserOnConnectionFailure ? await this.closeConnection() : await this.disconnectUser(), e;
		}
	};
	_setUser = (e) => {
		this.user = e, this.userID = e.id, this._user = { ...e };
	};
	closeConnection = async (e) => {
		await this.wsConnection?.disconnect(e);
	};
	openConnection = async () => {
		if (!this.userID) throw Error("UserWithId is not set on client, use client.connectUser or client.connectAnonymousUser instead");
		let e = this.wsPromiseSafe?.();
		if (this.wsConnection?.isConnecting && e) return this.logger.info("client:openConnection() - connection already in progress"), await e;
		if (this.wsConnection?.isHealthy && this._hasConnectionID()) {
			this.logger.info("client:openConnection() - openConnection called twice, healthy connection already exists");
			return;
		}
		this._setupConnectionIdPromise(), this.clientID = `${this.userID}--${Nd()}`;
		let t = this.connect();
		return this.wsPromiseSafe = dm(t), await t;
	};
	disconnectUser = async (e) => {
		this.logger.info("client:disconnect() - Disconnecting the client"), delete this.user, delete this._user, delete this.userID, this.anonymous = !1, await this.closeConnection(e), Ld(this.updateNetworkConnectionStatus), this.tokenManager.reset(), this.connectionIdPromiseSafe = void 0, this.rejectConnectionId = void 0, this.resolveConnectionId = void 0;
	};
	connectGuestUser = async (e) => {
		this.guestUserCreatePromise = this.doAxiosRequest("post", "/guest", { user: e }, { publicEndpoint: !0 });
		let t = await this.guestUserCreatePromise;
		return this.guestUserCreatePromise.finally(() => this.guestUserCreatePromise = void 0), this.connectUser(t.user, t.access_token);
	};
	connectAnonymousUser = async (e, t) => {
		Id(this.updateNetworkConnectionStatus), this._setupConnectionIdPromise(), this.anonymous = !0, await this.tokenManager.setTokenOrProvider(t, e, !0), this._setUser(e), this.resolveConnectionId?.();
	};
	on = (e, t) => (this.listeners[e] || (this.listeners[e] = []), this.logger.debug(`Adding listener for ${e} event`), this.listeners[e]?.push(t), () => {
		this.off(e, t);
	});
	off = (e, t) => {
		this.listeners[e] || (this.listeners[e] = []), this.logger.debug(`Removing listener for ${e} event`), this.listeners[e] = this.listeners[e]?.filter((e) => e !== t);
	};
	_setupConnectionIdPromise = () => {
		this.connectionIdPromiseSafe = dm(new Promise((e, t) => {
			this.resolveConnectionId = e, this.rejectConnectionId = t;
		}));
	};
	get connectionIdPromise() {
		return this.connectionIdPromiseSafe?.();
	}
	get isConnectionIdPromisePending() {
		return this.connectionIdPromiseSafe?.checkPending() ?? !1;
	}
	get wsPromise() {
		return this.wsPromiseSafe?.();
	}
	_logApiRequest = (e, t, n, r) => {
		this.logger.getLogLevel() === "trace" && this.logger.trace(`client: ${e} - Request - ${t}`, {
			payload: n,
			config: r
		});
	};
	_logApiResponse = (e, t, n) => {
		this.logger.getLogLevel() === "trace" && this.logger.trace(`client:${e} - Response - url: ${t} > status ${n.status}`, { response: n });
	};
	doAxiosRequest = async (e, t, n, r = {}) => {
		if (!r.publicEndpoint) {
			await Promise.all([this.tokenManager.tokenReady(), this.guestUserCreatePromise]);
			try {
				await this.connectionIdPromise;
			} catch {
				await this.wsConnection?._waitForHealthy(), await this.connectionIdPromise;
			}
		}
		let i = this._enrichAxiosOptions(r);
		try {
			let r;
			switch (this._logApiRequest(e, t, n, i), e) {
				case "get":
					r = await this.axiosInstance.get(t, i);
					break;
				case "delete":
					r = await this.axiosInstance.delete(t, i);
					break;
				case "post":
					r = await this.axiosInstance.post(t, n, i);
					break;
				case "put":
					r = await this.axiosInstance.put(t, n, i);
					break;
				case "patch":
					r = await this.axiosInstance.patch(t, n, i);
					break;
				case "options":
					r = await this.axiosInstance.options(t, i);
					break;
				default: throw Error("Invalid request type");
			}
			return this._logApiResponse(e, t, r), this.consecutiveFailures = 0, r.data;
		} catch (a) {
			a.client_request_id = i.headers?.["x-client-request-id"], this.consecutiveFailures += 1;
			let { response: o } = a;
			if (!o || !Rd(o)) throw this.logger.error(`client:${e} url: ${t}`, a), a;
			let { data: s, status: c } = o;
			if (s.code === Ad.TOKEN_EXPIRED && !this.tokenManager.isStatic()) return this.logger.warn(`client:${e}: url: ${t}`, o), this.consecutiveFailures > 1 && await Dd(jd(this.consecutiveFailures)), await this.tokenManager.loadToken(), await this.doAxiosRequest(e, t, n, r);
			throw this.logger.error(`client:${e} url: ${t}`, o), new vl({
				message: `Stream error code ${s.code}: ${s.message}`,
				code: s.code ?? null,
				unrecoverable: s.unrecoverable ?? null,
				response: o,
				status: c
			});
		}
	};
	get = (e, t) => this.doAxiosRequest("get", e, null, { params: t });
	put = (e, t, n) => this.doAxiosRequest("put", e, t, { params: n });
	post = (e, t, n) => this.doAxiosRequest("post", e, t, { params: n });
	patch = (e, t, n) => this.doAxiosRequest("patch", e, t, { params: n });
	delete = (e, t) => this.doAxiosRequest("delete", e, null, { params: t });
	dispatchEvent = (e) => {
		if (this.logger.debug(`Dispatching event: ${e.type}`, e), this.listeners) {
			for (let t of this.listeners.all || []) Bd(t, e, this.logger);
			for (let t of this.listeners[e.type] || []) Bd(t, e, this.logger);
		}
	};
	connect = async () => {
		if (!this.userID || !this._user) throw Error("Call connectUser or connectAnonymousUser before starting the connection");
		if (!this.wsBaseURL) throw Error("Websocket base url not set");
		if (!this.clientID) throw Error("clientID is not set");
		return this.wsConnection = new mg(this), this.logger.info("StreamClient.connect: this.wsConnection.connect()"), await this.wsConnection.connect(this.defaultWSTimeout);
	};
	getSdkVersion = () => this.options.clientAppIdentifier?.sdkVersion || "1.62.0";
	getUserAgent = () => {
		if (!this.cachedUserAgent) {
			let { clientAppIdentifier: e = {} } = this.options, { sdkName: t = "js", sdkVersion: n = "1.62.0", ...r } = e;
			this.cachedUserAgent = [
				`stream-video-${t}-v${n}`,
				...Object.entries(r).map(([e, t]) => `${e}=${t}`),
				"client_bundle=browser-esm"
			].join("|");
		}
		return this.cachedUserAgent;
	};
	_enrichAxiosOptions = (e = {
		params: {},
		headers: {},
		config: {}
	}) => {
		let t = e.publicEndpoint && !this.user ? void 0 : this._getToken(), n = t ? { Authorization: t } : void 0;
		e.headers?.["x-client-request-id"] || (e.headers = {
			...e.headers,
			"x-client-request-id": Nd()
		});
		let { params: r, headers: i, ...a } = this.options.axiosRequestConfig || {};
		return {
			params: {
				user_id: this.userID,
				connection_id: this._getConnectionID(),
				api_key: this.key,
				...e.params,
				...r
			},
			headers: {
				...n,
				"stream-auth-type": e.publicEndpoint && !this.user ? "anonymous" : this.getAuthType(),
				"X-Stream-Client": this.getUserAgent(),
				...e.headers,
				...i
			},
			...e.config,
			...a
		};
	};
	_getToken = () => this.tokenManager ? this.tokenManager.getToken() : null;
	updateNetworkConnectionStatus = (e) => {
		e.type === "offline" ? (this.logger.debug("device went offline"), this.dispatchEvent({
			type: "network.changed",
			online: !1
		})) : e.type === "online" && (this.logger.debug("device went online"), this.dispatchEvent({
			type: "network.changed",
			online: !0
		}));
	};
}, bg = (e, t) => `${e}/${t.id}`, xg = (e) => `call.init-${e}`, Sg = (e) => {
	let t = e?.clientAppIdentifier || {}, n = bf();
	return n && (t.sdkName = kl[n.type].toLowerCase(), t.sdkVersion = `${n.major}.${n.minor}.${n.patch}`), t;
}, Cg = (e, t) => {
	let n = Sg(t);
	return new yg(e, {
		persistUserOnConnectionFailure: !0,
		...t,
		clientAppIdentifier: n
	});
}, wg = (e) => {
	let { token: t, tokenProvider: n } = e;
	if (t && n) {
		let e = !1;
		return async function() {
			return e ? n() : (e = !0, t);
		};
	}
	return t || n;
}, Tg = (e, t) => `${e}:${t}`, Eg = class {
	logger = q.getLogger("ClientEventReporter");
	streamClient;
	enabled;
	coordinatorConnectId;
	coordinatorConnectUserId;
	coordinatorWsPair;
	callContexts = /* @__PURE__ */ new Map();
	joinAttemptIds = /* @__PURE__ */ new Map();
	joinReasons = /* @__PURE__ */ new Map();
	joinSources = /* @__PURE__ */ new Map();
	coordinatorPairs = /* @__PURE__ */ new Map();
	wsPairs = /* @__PURE__ */ new Map();
	peerConnectionPairs = /* @__PURE__ */ new Map();
	pcEverConnected = /* @__PURE__ */ new Map();
	firstFrameReported = /* @__PURE__ */ new Set();
	constructor(e) {
		this.streamClient = e.streamClient, this.enabled = e.enabled ?? !0;
	}
	startCoordinatorConnection = (e) => (this.coordinatorConnectId = Nd(), this.coordinatorConnectUserId = e, this.coordinatorConnectId);
	trackCoordinatorWs = async (e) => {
		this.beginCoordinatorWs();
		try {
			let t = await e();
			return this.succeedCoordinatorWs(), t;
		} catch (e) {
			throw Ag(this.coordinatorWsPair, Ng(e)), e;
		}
	};
	beginCoordinatorWs = () => {
		this.coordinatorWsPair || (this.coordinatorWsPair = {
			sid: Nd(),
			attempts: 0,
			startedAt: Date.now(),
			userIdSnapshot: this.coordinatorConnectUserId
		}, this.send({
			...this.buildCoordinatorWsCommon(this.coordinatorWsPair),
			event_type: "initiated"
		})), this.coordinatorWsPair.attempts++;
	};
	succeedCoordinatorWs = () => {
		let e = this.coordinatorWsPair;
		e && (this.send({
			...this.buildCoordinatorWsCommon(e),
			event_type: "completed",
			outcome: "success",
			retry_count_attempt: e.attempts - 1,
			elapsed_time: Date.now() - e.startedAt
		}), this.coordinatorWsPair = void 0);
	};
	closeCoordinatorWs = () => {
		let e = this.coordinatorWsPair;
		if (!e || !e.lastError) {
			this.coordinatorWsPair = void 0;
			return;
		}
		let { reason: t, code: n } = e.lastError;
		this.send({
			...this.buildCoordinatorWsCommon(e),
			event_type: "completed",
			outcome: "failure",
			retry_count_attempt: e.attempts - 1,
			elapsed_time: Date.now() - e.startedAt,
			retry_failure_reason: t,
			retry_failure_code: n
		}), this.coordinatorWsPair = void 0;
	};
	buildCoordinatorWsCommon = (e) => ({
		user_id: e.userIdSnapshot ?? this.streamClient.userID,
		stage: "CoordinatorWS",
		stage_id: e.sid,
		...this.coordinatorConnectId && { coordinator_connect_id: this.coordinatorConnectId },
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		user_agent: this.streamClient.getUserAgent(),
		sdk_version: this.streamClient.getSdkVersion()
	});
	emitMediaPermission = (e) => {
		if (K() || !this.callContexts.has(e)) return;
		let t = {
			sid: Nd(),
			attempts: 0,
			startedAt: Date.now(),
			joinAttemptIdSnapshot: this.joinAttemptIds.get(e)
		};
		this.sendForCall(e, {
			...this.buildCommon(e, "MediaDevicePermission", t),
			...this.sessionIdField(e),
			microphone_permission_status: Og(xh()),
			camera_permission_status: Og(Sh()),
			event_type: "initiated"
		});
	};
	registerCall = (e, t) => {
		this.callContexts.set(e, t);
	};
	unregisterCall = (e) => {
		this.callContexts.delete(e), this.joinAttemptIds.delete(e), this.joinReasons.delete(e), this.joinSources.delete(e), this.coordinatorPairs.delete(e), this.wsPairs.delete(e), this.firstFrameReported.delete(`${e}:FirstVideoFrame`), this.firstFrameReported.delete(`${e}:FirstAudioFrame`);
		for (let t of ["publish", "subscribe"]) {
			let n = Tg(e, t);
			this.peerConnectionPairs.delete(n), this.pcEverConnected.delete(n);
		}
	};
	startCorrelation = (e, t) => {
		try {
			this.closeCallPairs(e), this.joinAttemptIds.set(e, Nd()), this.joinReasons.set(e, t), this.firstFrameReported.delete(`${e}:FirstVideoFrame`), this.firstFrameReported.delete(`${e}:FirstAudioFrame`), this.emitJoinInitiated(e), this.emitMediaPermission(e);
		} catch (e) {
			this.logger.warn("Failed to start join correlation", e);
		}
	};
	withJoinLifecycle = async (e, t, n) => {
		let { joinReason: r, joinSource: i } = t;
		i ? this.joinSources.set(e, i) : this.joinSources.delete(e), this.startCorrelation(e, r);
		try {
			return await n();
		} catch (t) {
			throw this.closeCallPairs(e), t;
		} finally {
			this.joinSources.delete(e);
		}
	};
	track = async (e, t, n) => {
		this.beginAttempt(e, t);
		try {
			let r = await n();
			return this.succeedAttempt(e, t), r;
		} catch (n) {
			throw this.applyStageError(e, t, n), n;
		}
	};
	reportFirstFrame = (e, t, n) => {
		let r = t === U.VIDEO ? "FirstVideoFrame" : t === U.AUDIO ? "FirstAudioFrame" : void 0;
		if (!r) return;
		let i = `${e}:${r}`;
		if (this.firstFrameReported.has(i)) return;
		this.firstFrameReported.add(i);
		let a = {
			sid: Nd(),
			attempts: 0,
			startedAt: Date.now(),
			joinAttemptIdSnapshot: this.joinAttemptIds.get(e)
		}, o = this.getSfuId(e);
		this.sendForCall(e, {
			...this.buildCommon(e, r, a),
			...this.sessionIdField(e),
			...o && { sfu_id: o },
			track_id: n,
			event_type: "initiated"
		});
	};
	captureWsError = (e, t) => {
		let n = this.wsPairs.get(e);
		n && Ag(n, {
			reason: t.reason,
			code: t.code
		});
	};
	close = (e) => {
		this.closeCallPairs(e);
	};
	abort = (e, t) => {
		try {
			let { code: n, reason: r } = t, i = {
				code: n,
				reason: r
			};
			jg(this.coordinatorPairs.get(e), i), jg(this.wsPairs.get(e), i), this.failCoordinator(e), this.failWs(e), this.emitPeerConnectionFailure(e, "publish", n, r), this.emitPeerConnectionFailure(e, "subscribe", n, r);
		} catch (e) {
			this.logger.warn("Failed to report abort", e);
		}
	};
	closeCallPairs = (e) => {
		this.coordinatorPairs.get(e) && this.failCoordinator(e), this.wsPairs.get(e) && this.failWs(e);
		for (let t of ["publish", "subscribe"]) this.emitPeerConnectionFailure(e, t, "CLIENT_ABORTED", "superseded by a new join attempt");
	};
	emitJoinInitiated = (e) => {
		let t = this.joinAttemptIds.get(e);
		if (!t) return;
		let n = this.coordinatorConnectId, r = this.callContexts.get(e);
		this.sendForCall(e, {
			user_id: this.streamClient.userID || this.coordinatorConnectUserId,
			type: r?.callType,
			id: r?.callId,
			stage: "JoinInitiated",
			join_attempt_id: t,
			...n && { coordinator_connect_id: n },
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			user_agent: this.streamClient.getUserAgent(),
			sdk_version: this.streamClient.getSdkVersion(),
			event_type: "initiated"
		});
	};
	beginAttempt = (e, t) => {
		t === "CoordinatorJoin" ? this.beginCoordinatorAttempt(e) : this.beginWsAttempt(e);
	};
	succeedAttempt = (e, t) => {
		t === "CoordinatorJoin" ? this.succeedCoordinator(e) : this.succeedWs(e);
	};
	applyStageError = (e, t, n) => {
		jg(t === "CoordinatorJoin" ? this.coordinatorPairs.get(e) : this.wsPairs.get(e), t === "CoordinatorJoin" ? Mg(n) : Pg(n));
	};
	beginCoordinatorAttempt = (e) => {
		let t = this.coordinatorPairs.get(e);
		t || (t = {
			sid: Nd(),
			attempts: 0,
			startedAt: Date.now(),
			joinAttemptIdSnapshot: this.joinAttemptIds.get(e),
			joinReasonSnapshot: this.joinReasons.get(e),
			joinSourceSnapshot: this.joinSources.get(e)
		}, this.coordinatorPairs.set(e, t), this.sendForCall(e, {
			...this.buildCommon(e, "CoordinatorJoin", t),
			...t.joinReasonSnapshot && { join_reason: t.joinReasonSnapshot },
			...t.joinSourceSnapshot && { source: t.joinSourceSnapshot },
			event_type: "initiated"
		})), t.lastError = void 0, t.attempts++;
	};
	succeedCoordinator = (e) => {
		let t = this.coordinatorPairs.get(e);
		t && (this.sendForCall(e, {
			...this.buildCommon(e, "CoordinatorJoin", t),
			...this.sessionIdField(e),
			...t.joinReasonSnapshot && { join_reason: t.joinReasonSnapshot },
			...t.joinSourceSnapshot && { source: t.joinSourceSnapshot },
			event_type: "completed",
			outcome: "success",
			retry_count_attempt: t.attempts - 1,
			elapsed_time: Date.now() - t.startedAt
		}), this.coordinatorPairs.delete(e));
	};
	failCoordinator = (e) => {
		let t = this.coordinatorPairs.get(e);
		if (!t || !t.lastError) {
			this.coordinatorPairs.delete(e);
			return;
		}
		let { reason: n, code: r } = t.lastError;
		this.sendForCall(e, {
			...this.buildCommon(e, "CoordinatorJoin", t),
			...this.sessionIdField(e),
			...t.joinReasonSnapshot && { join_reason: t.joinReasonSnapshot },
			...t.joinSourceSnapshot && { source: t.joinSourceSnapshot },
			event_type: "completed",
			outcome: "failure",
			retry_count_attempt: t.attempts - 1,
			elapsed_time: Date.now() - t.startedAt,
			retry_failure_reason: n,
			retry_failure_code: r
		}), this.coordinatorPairs.delete(e);
	};
	beginWsAttempt = (e) => {
		let t = this.wsPairs.get(e);
		if (!t) {
			t = {
				sid: Nd(),
				attempts: 0,
				startedAt: Date.now(),
				joinAttemptIdSnapshot: this.joinAttemptIds.get(e)
			}, this.wsPairs.set(e, t);
			let n = this.getSfuId(e);
			this.sendForCall(e, {
				...this.buildCommon(e, "WSJoin", t),
				...this.sessionIdField(e),
				...n && { sfu_id: n },
				event_type: "initiated"
			});
		}
		t.lastError = void 0, t.attempts++;
	};
	succeedWs = (e) => {
		let t = this.wsPairs.get(e);
		if (!t) return;
		let n = this.getSfuId(e);
		this.sendForCall(e, {
			...this.buildCommon(e, "WSJoin", t),
			...this.sessionIdField(e),
			...n && { sfu_id: n },
			event_type: "completed",
			outcome: "success",
			retry_count_attempt: t.attempts - 1,
			elapsed_time: Date.now() - t.startedAt
		}), this.wsPairs.delete(e);
	};
	failWs = (e) => {
		let t = this.wsPairs.get(e);
		if (!t || !t.lastError) {
			this.wsPairs.delete(e);
			return;
		}
		let { reason: n, code: r } = t.lastError, i = this.getSfuId(e);
		this.sendForCall(e, {
			...this.buildCommon(e, "WSJoin", t),
			...this.sessionIdField(e),
			event_type: "completed",
			outcome: "failure",
			retry_count_attempt: t.attempts - 1,
			elapsed_time: Date.now() - t.startedAt,
			...i && { sfu_id: i },
			retry_failure_reason: n,
			retry_failure_code: r
		}), this.wsPairs.delete(e);
	};
	onPeerConnectionStateChange = (e, t) => {
		let n = t.peerType === H.SUBSCRIBER ? "subscribe" : "publish", r = this.peerConnectionPairs.get(Tg(e, n));
		if (r && (r.lastIceState = t.iceConnectionState), t.stateType === "ice") t.state === "failed" && this.emitPeerConnectionFailure(e, n, "ICE_CONNECTIVITY_FAILED", "ICE connectivity checks failed");
		else if (t.state === "failed") {
			let r = t.iceConnectionState === "connected" || t.iceConnectionState === "completed";
			this.emitPeerConnectionFailure(e, n, r ? "DTLS_CONNECTIVITY_FAILED" : "ICE_CONNECTIVITY_FAILED", r ? "DTLS connectivity checks failed" : "ICE connectivity checks failed");
		} else switch (t.state) {
			case "connecting":
				if (r) return;
				this.openPeerConnectionPair(e, n, t.iceConnectionState);
				break;
			case "connected": this.emitPeerConnectionSuccess(e, n), this.pcEverConnected.set(Tg(e, n), !0);
		}
	};
	openPeerConnectionPair = (e, t, n) => {
		let r = Tg(e, t), i = {
			sid: Nd(),
			attempts: 0,
			startedAt: Date.now(),
			joinAttemptIdSnapshot: this.joinAttemptIds.get(e),
			sfuId: this.getSfuId(e),
			wasPreviouslyConnected: this.pcEverConnected.get(r) === !0,
			lastIceState: n
		};
		this.peerConnectionPairs.set(r, i), this.sendForCall(e, {
			...this.buildCommon(e, "PeerConnectionConnect", i),
			...this.sessionIdField(e),
			peer_connection: t,
			was_previously_connected: i.wasPreviouslyConnected,
			...i.sfuId && { sfu_id: i.sfuId },
			event_type: "initiated"
		});
	};
	emitPeerConnectionSuccess = (e, t) => {
		let n = Tg(e, t), r = this.peerConnectionPairs.get(n);
		r && (this.sendForCall(e, {
			...this.buildCommon(e, "PeerConnectionConnect", r),
			...this.sessionIdField(e),
			peer_connection: t,
			was_previously_connected: r.wasPreviouslyConnected,
			...r.sfuId && { sfu_id: r.sfuId },
			event_type: "completed",
			outcome: "success",
			retry_count_attempt: 0,
			elapsed_time: Date.now() - r.startedAt
		}), this.peerConnectionPairs.delete(n));
	};
	emitPeerConnectionFailure = (e, t, n, r) => {
		let i = Tg(e, t), a = this.peerConnectionPairs.get(i);
		a && (this.sendForCall(e, {
			...this.buildCommon(e, "PeerConnectionConnect", a),
			...this.sessionIdField(e),
			peer_connection: t,
			was_previously_connected: a.wasPreviouslyConnected,
			...a.sfuId && { sfu_id: a.sfuId },
			event_type: "completed",
			outcome: "failure",
			retry_count_attempt: 0,
			elapsed_time: Date.now() - a.startedAt,
			ice_state: Dg(a.lastIceState),
			retry_failure_reason: r,
			retry_failure_code: n
		}), this.peerConnectionPairs.delete(i));
	};
	getSfuId = (e) => this.callContexts.get(e)?.getSfuId() ?? "";
	sessionIdField = (e) => {
		let t = this.callContexts.get(e)?.getCallSessionId() ?? "";
		return t ? { call_session_id: t } : {};
	};
	buildCommon = (e, t, n) => {
		let r = this.callContexts.get(e), i = this.coordinatorConnectId;
		return {
			user_id: this.streamClient.userID || this.coordinatorConnectUserId,
			type: r?.callType ?? "",
			id: r?.callId ?? "",
			stage: t,
			stage_id: n.sid,
			...n.joinAttemptIdSnapshot && { join_attempt_id: n.joinAttemptIdSnapshot },
			...i && { coordinator_connect_id: i },
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			user_agent: this.streamClient.getUserAgent(),
			sdk_version: this.streamClient.getSdkVersion()
		};
	};
	send = (e) => {
		this.enabled && this.sendWithRetry(e);
	};
	sendForCall = (e, t) => {
		this.callContexts.has(e) && this.send(t);
	};
	sendWithRetry = async (e) => {
		for (let t = 0; t < 5; t++) try {
			return await this.streamClient.doAxiosRequest("post", "/call_client_event", { events: [e] }, { publicEndpoint: !0 }), !0;
		} catch (n) {
			let r = n?.response?.status;
			if (typeof r == "number" && r >= 400 && r < 500) return this.logger.debug(`Client event rejected (${r}), not retrying`, e.stage, e.event_type), !1;
			if (t === 4) return this.logger.debug("Client event delivery failed after retries", e.stage, e.event_type, n), !1;
			await Dd(jd(t));
		}
		return !1;
	};
}, Dg = (e) => {
	switch (e) {
		case "connected":
		case "completed": return "CONNECTED";
		case "failed": return "FAILED";
		default: return "NOT_CONNECTED";
	}
}, Og = (e) => {
	switch (Y(e.asStateObservable())) {
		case "granted": return "GRANTED";
		case "denied": return "FAILED";
		case "prompting": return "INITIATED";
		default: return "NOT_INITIATED";
	}
}, kg = (e) => e instanceof Error ? e.message : String(e), Ag = (e, t) => {
	e && (e.lastError = t);
}, jg = (e, t) => {
	e && !e.lastError && (e.lastError = t);
}, Mg = (e) => e instanceof vl ? {
	reason: e.message,
	code: e.code == null ? "SERVER_ERROR" : String(e.code)
} : {
	reason: kg(e),
	code: "SERVER_ERROR"
}, Ng = (e) => {
	if (e instanceof vl) return {
		reason: e.message,
		code: e.code == null ? "SERVER_ERROR" : String(e.code)
	};
	if (e instanceof Error) try {
		let t = JSON.parse(e.message);
		if (typeof t.isWSFailure == "boolean") return {
			reason: t.message || e.message,
			code: !t.isWSFailure && t.code ? String(t.code) : "SERVER_ERROR"
		};
	} catch {}
	return {
		reason: kg(e),
		code: "SERVER_ERROR"
	};
}, Pg = (e) => {
	if (e instanceof vm) {
		let t = e.errorEvent.error;
		return {
			reason: t?.message || e.message,
			code: t && Ol[t.code] || "SFU_ERROR"
		};
	}
	let t = kg(e);
	return e instanceof ym ? {
		reason: t,
		code: "REQUEST_TIMEOUT"
	} : {
		reason: t,
		code: "SFU_ERROR"
	};
}, Fg = class e {
	readOnlyStateStore;
	logger;
	writeableStateStore;
	streamClient;
	clientEventReporter;
	effectsRegistered = !1;
	eventHandlersToUnregister = [];
	connectionConcurrencyTag = Symbol("connectionConcurrencyTag");
	static _instances = /* @__PURE__ */ new Map();
	rejectCallWhenBusy = !1;
	constructor(e, t) {
		let n = typeof e == "string" ? e : e.apiKey, r = typeof e == "string" ? t : e.options;
		r?.enableTimerWorker && gm();
		let i = r?.logger || Hd;
		if (q.configureLoggers({
			default: {
				sink: i,
				level: r?.logLevel || "warn"
			},
			...r?.logOptions
		}), this.logger = q.getLogger("client"), this.rejectCallWhenBusy = r?.rejectCallWhenBusy ?? !1, this.streamClient = Cg(n, r), this.clientEventReporter = new Eg({
			streamClient: this.streamClient,
			enabled: r?.clientEventsReportingEnabled ?? !0
		}), this.writeableStateStore = new Hf(), this.readOnlyStateStore = new Uf(this.writeableStateStore), typeof e != "string" && e.user) {
			let t = e.user;
			t.type === "anonymous" && (t.id = "!anon"), t.id && this.registerClientInstance(n, t);
			let r = wg(e);
			this.connectUser(t, r).catch((e) => {
				this.logger.error("Failed to connect", e);
			});
		}
	}
	static getOrCreateInstance(t) {
		let { apiKey: n, user: r, token: i, tokenProvider: a } = t;
		if (!r.id && r.type !== "anonymous") throw Error("user.id is required for a non-anonymous user");
		if (!i && !a && r.type !== "anonymous" && r.type !== "guest") throw Error("tokenProvider or token is required for a authenticated users");
		return e._instances.get(bg(n, r)) || new e(t);
	}
	registerClientInstance = (t, n) => {
		let r = bg(t, n);
		e._instances.has(r) && this.logger.warn(`A StreamVideoClient already exists for ${n.id}; Prefer using getOrCreateInstance method`), e._instances.set(r, this);
	};
	get state() {
		return this.readOnlyStateStore;
	}
	registerEffects = () => {
		this.effectsRegistered ||= (this.eventHandlersToUnregister.push(this.on("call.created", (e) => this.initCallFromEvent(e)), this.on("call.ring", (e) => this.initCallFromEvent(e)), this.on("connection.changed", (e) => {
			if (!e.online) return;
			let t = this.writeableStateStore.calls.filter((e) => e.watching).map((e) => e.cid);
			t.length <= 0 || this.rewatchCalls(t).catch((e) => {
				this.logger.error("Failed to re-watch calls", e);
			});
		})), !0);
	};
	initCallFromEvent = async (e) => {
		try {
			await J(xg(e.call_cid), async () => {
				let t = e.type === "call.ring", n = this.writeableStateStore.findCall(e.call.type, e.call.id);
				n ? t ? this.shouldRejectCall(n.cid) ? (this.logger.info(`Leaving call with busy reject reason ${n.cid} because user is busy`), await n.leave(), await n.reject("busy")) : (await n.updateFromRingingEvent(e), await n.get()) : n.state.updateFromCallResponse(e.call) : (n = new dg({
					streamClient: this.streamClient,
					clientEventReporter: this.clientEventReporter,
					type: e.call.type,
					id: e.call.id,
					members: e.members,
					clientStore: this.writeableStateStore,
					ringing: t
				}), t ? this.shouldRejectCall(n.cid) ? (this.logger.info(`Rejecting call ${n.cid} because user is busy`), await n.reject("busy")) : (await n.updateFromRingingEvent(e), await n.get()) : (n.state.updateFromCallResponse(e.call), this.writeableStateStore.registerCall(n), this.logger.info(`New call created and registered: ${n.cid}`)));
			});
		} catch (t) {
			this.logger.error(`Failed to init call from event ${e.type}`, t);
		}
	};
	doQueryCalls = (e) => this.streamClient.post("/calls", e);
	rewatchCalls = async (e) => {
		this.logger.info(`Rewatching calls ${e.join(", ")}`);
		for (let t = 0; t < 3; t++) {
			try {
				this.logger.info(`Rewatching calls ${e.join(", ")} attempt ${t + 1}`);
				let n = await this.doQueryCalls({
					watch: !0,
					filter_conditions: { cid: { $in: e } }
				});
				for (let e of n.calls) {
					let t = this.writeableStateStore.findCall(e.call.type, e.call.id);
					t && (t.updateFromCallStateResponse(e), Sm(t, "ring-poll-api").catch((e) => {
						t.logger.error("Failed to reconcile the ring state after rewatch", e);
					}));
				}
				return;
			} catch (e) {
				if (e instanceof vl && e.unrecoverable || (this.logger.warn(`Failed to re-watch calls (attempt ${t + 1}/3), retrying.`, e), t === 2)) throw e;
			}
			await Dd(jd(t));
		}
	};
	connectUser = async (e, t) => {
		if (e.type === "anonymous") return e.id = "!anon", this.connectAnonymousUser(e, t);
		let n = this.clientEventReporter;
		n.startCoordinatorConnection(e.id);
		let r = await J(this.connectionConcurrencyTag, async () => {
			let r = this.streamClient, { onConnectUserError: i, persistUserOnConnectionFailure: a } = r.options, { maxConnectUserRetries: o = 5 } = r.options;
			o = Math.max(o, 1);
			let s = [];
			for (let c = 0; c < o; c++) try {
				return this.logger.trace(`Connecting user (${c})`, e), await n.trackCoordinatorWs(() => e.type === "guest" ? r.connectGuestUser(e) : r.connectUser(e, t));
			} catch (e) {
				if (this.logger.warn(`Failed to connect a user (${c})`, e), s.push(e), c === o - 1) throw n.closeCoordinatorWs(), i?.(e, s), e;
				a && await r.disconnectUser(), await Dd(jd(c));
			}
		});
		return r?.me && this.writeableStateStore.setConnectedUser(r.me), this.registerEffects(), r;
	};
	disconnectUser = async (t) => {
		await J(this.connectionConcurrencyTag, async () => {
			let { user: n, key: r } = this.streamClient;
			n && (await this.streamClient.disconnectUser(t), n.id && e._instances.delete(bg(r, n)), this.eventHandlersToUnregister.forEach((e) => e()), this.eventHandlersToUnregister = [], this.effectsRegistered = !1, this.writeableStateStore.setConnectedUser(void 0));
		});
	};
	on = (e, t) => this.streamClient.on(e, t);
	off = (e, t) => this.streamClient.off(e, t);
	call = (e, t, n = {}) => (n.reuseInstance ? this.writeableStateStore.findCall(e, t) : void 0) ?? new dg({
		streamClient: this.streamClient,
		clientEventReporter: this.clientEventReporter,
		id: t,
		type: e,
		clientStore: this.writeableStateStore
	});
	createGuestUser = async (e) => this.streamClient.doAxiosRequest("post", "/guest", e, { publicEndpoint: !0 });
	queryCalls = async (e = {}, t = {}) => {
		let { withDisabledDevices: n = !0 } = t, r = await this.doQueryCalls(e), i = [];
		for (let t of r.calls) {
			let r = new dg({
				streamClient: this.streamClient,
				clientEventReporter: this.clientEventReporter,
				id: t.call.id,
				type: t.call.type,
				members: t.members,
				ownCapabilities: t.own_capabilities,
				watching: e.watch,
				clientStore: this.writeableStateStore
			});
			r.state.updateFromCallResponse(t.call), await r.applyDeviceConfig(t.call.settings, {
				publish: !1,
				withDisabledDevices: n
			}), e.watch && (await r.setup(), this.writeableStateStore.registerCall(r)), i.push(r);
		}
		return {
			...r,
			calls: i
		};
	};
	queryCallStats = async (e = {}) => this.streamClient.post("/call/stats", e);
	queryAggregateCallStats = async (e = {}) => this.streamClient.post("/stats", e);
	edges = async () => this.streamClient.get("/edges");
	addDevice = async (e, t, n, r, i) => await this.streamClient.post("/devices", {
		id: e,
		push_provider: t,
		voip_token: i,
		...r == null ? {} : { user_id: r },
		...n == null ? {} : { push_provider_name: n }
	});
	addVoipDevice = async (e, t, n, r) => await this.addDevice(e, t, n, r, !0);
	getDevices = async (e) => await this.streamClient.get("/devices", e ? { user_id: e } : {});
	removeDevice = async (e, t) => await this.streamClient.delete("/devices", {
		id: e,
		...t ? { user_id: t } : {}
	});
	onRingingCall = async (e) => J(xg(e), async () => {
		let t = this.state.calls.find((t) => t.cid === e && t.ringing);
		if (!t) {
			let [n, r] = e.split(":");
			t = new dg({
				streamClient: this.streamClient,
				clientEventReporter: this.clientEventReporter,
				type: n,
				id: r,
				clientStore: this.writeableStateStore,
				ringing: !0
			}), await t.get();
		}
		return t;
	});
	connectAnonymousUser = async (e, t) => J(this.connectionConcurrencyTag, () => this.streamClient.connectAnonymousUser(e, t));
	shouldRejectCall = (e) => this.rejectCallWhenBusy ? this.state.calls.some((t) => t.cid !== e && t.ringing && t.state.callingState !== Z.IDLE && t.state.callingState !== Z.LEFT && t.state.callingState !== Z.RECONNECTING_FAILED) : !1;
}, Ig = (e) => {
	if (e < 1e3) return String(e);
	for (let { value: t, suffix: n } of [
		{
			value: 1e9,
			suffix: "B"
		},
		{
			value: 1e6,
			suffix: "M"
		},
		{
			value: 1e3,
			suffix: "k"
		}
	]) if (e >= t) {
		let r = e / t, i = +(r < 100);
		return `${r.toFixed(i).replace(/\.0$/g, "")}${n}`;
	}
	return String(e);
}, Lg = () => typeof navigator > "u" ? !1 : navigator.product?.toLowerCase() === "reactnative", Q = (e, t) => {
	let [n, r] = (0, p.useState)(() => {
		try {
			return Vf.getCurrentValue(e);
		} catch (e) {
			if (t === void 0) throw e;
			return t;
		}
	});
	return (0, p.useEffect)(() => Vf.createSubscription(e, r, (e) => {
		console.log("An error occurred while reading an observable", e), t && r(t);
	}), [t, e]), n;
}, Rg = /* @__PURE__ */ e({
	useAnonymousParticipantCount: () => v_,
	useAutoplayBlockedSessionIds: () => A_,
	useCallBlockedUserIds: () => Kg,
	useCallCallingState: () => u_,
	useCallClosedCaptions: () => j_,
	useCallCreatedAt: () => qg,
	useCallCreatedBy: () => Zg,
	useCallCustomData: () => Qg,
	useCallEgress: () => $g,
	useCallEndedAt: () => Jg,
	useCallEndedBy: () => a_,
	useCallIngress: () => e_,
	useCallMembers: () => l_,
	useCallSession: () => t_,
	useCallSettings: () => n_,
	useCallStartedAt: () => d_,
	useCallStartsAt: () => Yg,
	useCallState: () => $,
	useCallStatsReport: () => s_,
	useCallThumbnail: () => y_,
	useCallUpdatedAt: () => Xg,
	useCameraState: () => S_,
	useDominantSpeaker: () => c_,
	useE2eeEnabled: () => i_,
	useHasOngoingScreenShare: () => o_,
	useHasPermissions: () => x_,
	useIncomingVideoSettings: () => E_,
	useIsAutoplayBlocked: () => O_,
	useIsCallCaptioningInProgress: () => M_,
	useIsCallHLSBroadcastingInProgress: () => Wg,
	useIsCallIndividualRecordingInProgress: () => Ug,
	useIsCallLive: () => Gg,
	useIsCallRawRecordingInProgress: () => Hg,
	useIsCallRecordingInProgress: () => Vg,
	useIsCallTranscribingInProgress: () => r_,
	useLocalParticipant: () => m_,
	useMicrophoneState: () => C_,
	useOwnCapabilities: () => b_,
	useParticipantCount: () => __,
	useParticipants: () => f_,
	usePinnedParticipants: () => g_,
	useRawParticipants: () => p_,
	useRemoteParticipants: () => h_,
	useScreenShareState: () => T_,
	useSpeakerState: () => w_
}), zg = Object.freeze([]), Bg = Object.freeze([]), $ = () => {
	let e = C();
	return e ? e.state : (console.warn("You are using useCallState() outside a Call context. Please wrap your component in <StreamCall /> and provide a \"call\" instance."), new vp());
}, Vg = () => {
	let { recording$: e } = $();
	return Q(e);
}, Hg = () => {
	let { rawRecording$: e } = $();
	return Q(e);
}, Ug = () => {
	let { individualRecording$: e } = $();
	return Q(e);
}, Wg = () => {
	let { egress$: e } = $(), t = Q(e);
	return t ? t.broadcasting : !1;
}, Gg = () => {
	let { backstage$: e } = $();
	return !Q(e);
}, Kg = () => {
	let { blockedUserIds$: e } = $();
	return Q(e);
}, qg = () => {
	let { createdAt$: e } = $();
	return Q(e);
}, Jg = () => {
	let { endedAt$: e } = $();
	return Q(e);
}, Yg = () => {
	let { startsAt$: e } = $();
	return Q(e);
}, Xg = () => {
	let { updatedAt$: e } = $();
	return Q(e);
}, Zg = () => {
	let { createdBy$: e } = $();
	return Q(e);
}, Qg = () => {
	let { custom$: e } = $();
	return Q(e);
}, $g = () => {
	let { egress$: e } = $();
	return Q(e);
}, e_ = () => {
	let { ingress$: e } = $();
	return Q(e);
}, t_ = () => {
	let { session$: e } = $();
	return Q(e);
}, n_ = () => {
	let { settings$: e } = $();
	return Q(e);
}, r_ = () => {
	let { transcribing$: e } = $();
	return Q(e);
}, i_ = () => {
	let { e2eeEnabled$: e } = $();
	return Q(e);
}, a_ = () => {
	let { endedBy$: e } = $();
	return Q(e);
}, o_ = () => {
	let { hasOngoingScreenShare$: e } = $();
	return Q(e);
}, s_ = () => {
	let { callStatsReport$: e } = $();
	return Q(e);
}, c_ = () => {
	let { dominantSpeaker$: e } = $();
	return Q(e);
}, l_ = () => {
	let { members$: e } = $();
	return Q(e);
}, u_ = () => {
	let { callingState$: e } = $();
	return Q(e);
}, d_ = () => {
	let { startedAt$: e } = $();
	return Q(e);
}, f_ = ({ sortBy: e } = {}) => {
	let { participants$: t } = $(), n = Q(t);
	return (0, p.useMemo)(() => e ? [...n].sort(e) : n, [n, e]);
}, p_ = () => {
	let { rawParticipants$: e } = $();
	return Q(e);
}, m_ = () => {
	let { localParticipant$: e } = $();
	return Q(e);
}, h_ = () => {
	let { remoteParticipants$: e } = $();
	return Q(e);
}, g_ = () => {
	let { pinnedParticipants$: e } = $();
	return Q(e);
}, __ = () => {
	let { participantCount$: e } = $();
	return Q(e);
}, v_ = () => {
	let { anonymousParticipantCount$: e } = $();
	return Q(e);
}, y_ = () => {
	let { thumbnails$: e } = $();
	return Q(e);
}, b_ = () => {
	let { ownCapabilities$: e } = $();
	return Q(e);
}, x_ = (...e) => {
	let t = b_();
	return e.every((e) => t?.includes(e));
}, S_ = ({ optimisticUpdates: e = !0 } = {}) => {
	let { camera: t } = C(), { state: n } = t, r = Q(n.direction$), i = Q(n.mediaStream$), a = Q(n.rootMediaStream$), o = Q(n.selectedDevice$), { getDevices: s } = P_(t);
	return {
		camera: t,
		direction: r,
		mediaStream: i,
		rootMediaStream: a,
		get devices() {
			return s();
		},
		hasBrowserPermission: Q(n.hasBrowserPermission$),
		isPromptingPermission: Q(n.isPromptingPermission$),
		selectedDevice: o,
		error: Q(n.error$),
		...N_(Q(n.status$), Q(n.optimisticStatus$), { optimisticUpdates: e })
	};
}, C_ = ({ optimisticUpdates: e = !0 } = {}) => {
	let { microphone: t } = C(), { state: n } = t, r = Q(n.mediaStream$), i = Q(n.selectedDevice$), { getDevices: a } = P_(t);
	return {
		microphone: t,
		mediaStream: r,
		get devices() {
			return a();
		},
		selectedDevice: i,
		hasBrowserPermission: Q(n.hasBrowserPermission$),
		isPromptingPermission: Q(n.isPromptingPermission$),
		isSpeakingWhileMuted: Q(n.speakingWhileMuted$),
		audioBitrateProfile: Q(n.audioBitrateProfile$),
		error: Q(n.error$),
		...N_(Q(n.status$), Q(n.optimisticStatus$), { optimisticUpdates: e })
	};
}, w_ = () => {
	if (Lg()) throw Error("This feature is not supported in React Native. Please visit https://getstream.io/video/docs/react-native/guides/camera-and-microphone/#speaker-management for more details");
	let { speaker: e } = C(), { getDevices: t } = P_(e), n = Q(e.state.selectedDevice$);
	return {
		speaker: e,
		volume: Q(e.state.volume$),
		get devices() {
			return t();
		},
		selectedDevice: n,
		isDeviceSelectionSupported: e.state.isDeviceSelectionSupported
	};
}, T_ = ({ optimisticUpdates: e = !0 } = {}) => {
	let { screenShare: t } = C(), { state: n } = t;
	return {
		screenShare: t,
		mediaStream: Q(n.mediaStream$),
		audioBitrateProfile: Q(n.audioBitrateProfile$),
		...N_(Q(n.status$), Q(n.optimisticStatus$), { optimisticUpdates: e })
	};
}, E_ = () => Q(C().trackSubscriptionManager.incomingVideoSettings$), D_ = bc(!1), O_ = () => Q(C()?.blockedAudioTracker.autoplayBlocked$ ?? D_), k_ = bc(Bg), A_ = () => Q(C()?.blockedAudioTracker.blockedSessionIds$ ?? k_, Bg), j_ = () => {
	let { closedCaptions$: e } = $();
	return Q(e);
}, M_ = () => {
	let { captioning$: e } = $();
	return Q(e);
};
function N_(e, t, n) {
	let r = t ?? e;
	return {
		status: e,
		optimisticStatus: r,
		isEnabled: e === "enabled",
		isMute: e !== "enabled",
		optimisticIsMute: r !== "enabled",
		isTogglePending: r !== e,
		optionsAwareIsMute: n.optimisticUpdates ? r !== "enabled" : e !== "enabled"
	};
}
function P_(e) {
	let t = (0, p.useMemo)(() => bc(zg), []), [n, r] = (0, p.useState)(t), i = Q(n, zg);
	return { getDevices: () => (n === t && r(e.listDevices()), i ?? zg) };
}
//#endregion
//#region node_modules/@stream-io/video-react-bindings/dist/esm/src/hooks/index.js
var F_ = () => Rg;
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function I_(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = I_(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function L_() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = I_(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
export { S as A, Xf as C, ep as D, hp as E, d as M, c as N, mp as O, a as P, Ig as S, cp as T, qf as _, fh as a, Yf as b, hl as c, G as d, Ef as f, mh as g, pp as h, Q as i, C as j, fl as k, gl as l, Qh as m, F_ as n, Z as o, Wf as p, Vg as r, ml as s, L_ as t, Fg as u, Zf as v, mu as w, Kf as x, Jf as y };
