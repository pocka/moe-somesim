declare function require(x: string): any

if (!("_babelPolyfill" in window)) {
	require("babel-polyfill")
}
