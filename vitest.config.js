import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Unit tests target pure logic modules (CSV parser, delta math, formatters),
// so the default node environment is enough — no DOM required.
export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		include: ['src/**/*.test.{js,jsx}'],
	},
});
