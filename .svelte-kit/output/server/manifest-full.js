export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.C9StO5Rs.js",app:"_app/immutable/entry/app.BWudIdlS.js",imports:["_app/immutable/entry/start.C9StO5Rs.js","_app/immutable/chunks/DA5Y7LNn.js","_app/immutable/chunks/DJB0_jYO.js","_app/immutable/chunks/ryBVFEgB.js","_app/immutable/chunks/3YMfqx_p.js","_app/immutable/chunks/CcT-YJP-.js","_app/immutable/entry/app.BWudIdlS.js","_app/immutable/chunks/DJB0_jYO.js","_app/immutable/chunks/CNzH6Euw.js","_app/immutable/chunks/DQqYhA6p.js","_app/immutable/chunks/CcT-YJP-.js","_app/immutable/chunks/DkQOBTIg.js","_app/immutable/chunks/CP1cMkK8.js","_app/immutable/chunks/ryBVFEgB.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/create",
				pattern: /^\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/search",
				pattern: /^\/search\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/wish/[key]",
				pattern: /^\/wish\/([^/]+?)\/?$/,
				params: [{"name":"key","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
