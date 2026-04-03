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
		client: {start:"_app/immutable/entry/start.BKlIJIMj.js",app:"_app/immutable/entry/app.DAjO3V9S.js",imports:["_app/immutable/entry/start.BKlIJIMj.js","_app/immutable/chunks/HS54Zu9Q.js","_app/immutable/chunks/BaoUv74o.js","_app/immutable/chunks/3sFgDkS_.js","_app/immutable/chunks/jGGucmH_.js","_app/immutable/chunks/nWNJejoz.js","_app/immutable/entry/app.DAjO3V9S.js","_app/immutable/chunks/BaoUv74o.js","_app/immutable/chunks/Cgdlesir.js","_app/immutable/chunks/n44pG8wn.js","_app/immutable/chunks/nWNJejoz.js","_app/immutable/chunks/apIHo6qZ.js","_app/immutable/chunks/3sFgDkS_.js","_app/immutable/chunks/CfxbkaOK.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
