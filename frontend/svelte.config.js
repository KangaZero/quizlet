import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		appDir: 'app',
		adapter: adapter({
			// pages: 'build',
			// assets: 'build',
			fallback: '404.html',
			// precompress: false,
			strict: true
		}),
		// paths: {
		// 	base: process.argv.includes('dev') ? '' : '/quizlet'
		// }
	}
};

export default config;
