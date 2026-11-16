/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				// Brand font (self-hosted via @fontsource-variable/inter) with full
				// system-stack fallback so nothing breaks if the font fails to load.
				sans: [
					'Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
					'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
				],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			boxShadow: {
				glass: '0 12px 40px -14px rgba(17, 24, 39, 0.18)',
				'glass-dark': '0 12px 44px -14px rgba(0, 0, 0, 0.55)',
				glow: '0 0 0 1px rgb(99 102 241 / 0.15), 0 12px 32px -12px rgb(99 102 241 / 0.4)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'app-float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-6px)' },
				},
				'app-glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.55' },
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(12px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'app-float': 'app-float 6s ease-in-out infinite',
				'app-glow': 'app-glow 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
