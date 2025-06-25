/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: 'var(--color-primary)',
  			'primary-light': 'var(--color-primary-light)',
  			'primary-dark': 'var(--color-primary-dark)',
  			secondary: 'var(--color-secondary)',
  			accent: 'var(--color-accent)',
  			background: 'var(--color-background)',
  			surface: 'var(--color-surface)',
  			'text-primary': 'var(--color-text-primary)',
  			'text-secondary': 'var(--color-text-secondary)',
  			'text-muted': 'var(--color-text-muted)',
  			border: 'var(--color-border)',
  			'token-primary': 'var(--color-primary)',
  			'token-primary-light': 'var(--color-primary-light)',
  			'token-primary-dark': 'var(--color-primary-dark)',
  			'token-secondary': 'var(--color-secondary)',
  			'token-accent': 'var(--color-accent)',
  			'token-accent-light': 'var(--color-accent-light)',
  			'token-accent-dark': 'var(--color-accent-dark)',
  			'token-accent-soft': 'var(--color-accent-light)',
  			'token-text': 'var(--color-text-primary)',
  			'token-text-secondary': 'var(--color-text-secondary)',
  			'token-text-muted': 'var(--color-text-muted)',
  			'token-text-inverse': 'var(--color-text-inverse)',
  			'token-text-on-accent': 'var(--color-text-primary)',
  			'token-text-accent': 'var(--color-accent-dark)',
  			'token-background': 'var(--color-background)',
  			'token-surface': 'var(--color-surface)',
  			'token-success': 'var(--color-success)',
  			'token-warning': 'var(--color-warning)',
  			'token-error': 'var(--color-error)',
  			'token-info': 'var(--color-info)',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontSize: {
  			xs: 'var(--font-size-xs)',
  			sm: 'var(--font-size-sm)',
  			base: 'var(--font-size-base)',
  			lg: 'var(--font-size-lg)',
  			xl: 'var(--font-size-xl)',
  			'2xl': 'var(--font-size-2xl)',
  			'token-xs': 'var(--font-size-xs)',
  			'token-sm': 'var(--font-size-sm)',
  			'token-base': 'var(--font-size-base)',
  			'token-lg': 'var(--font-size-lg)',
  			'token-xl': 'var(--font-size-xl)',
  			'token-2xl': 'var(--font-size-2xl)',
  			'token-3xl': 'var(--font-size-3xl)',
  			'token-4xl': 'var(--font-size-4xl)',
  			'token-5xl': 'var(--font-size-5xl)',
  			'token-6xl': 'var(--font-size-6xl)'
  		},
  		spacing: {
  			1: 'var(--spacing-1)',
  			2: 'var(--spacing-2)',
  			4: 'var(--spacing-4)',
  			8: 'var(--spacing-8)',
  			16: 'var(--spacing-16)',
  			'token-0': 'var(--spacing-0)',
  			'token-1': 'var(--spacing-1)',
  			'token-2': 'var(--spacing-2)',
  			'token-3': 'var(--spacing-3)',
  			'token-4': 'var(--spacing-4)',
  			'token-5': 'var(--spacing-5)',
  			'token-6': 'var(--spacing-6)',
  			'token-8': 'var(--spacing-8)',
  			'token-10': 'var(--spacing-10)',
  			'token-12': 'var(--spacing-12)',
  			'token-16': 'var(--spacing-16)',
  			'token-20': 'var(--spacing-20)',
  			'token-24': 'var(--spacing-24)'
  		},
  		borderRadius: {
  			none: '0',
  			sm: 'var(--radius-sm)',
  			DEFAULT: 'var(--radius-base)',
  			lg: 'var(--radius-lg)',
  			xl: 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			token: 'var(--radius-2xl)',
  			'token-sm': 'var(--radius-sm)',
  			'token-base': 'var(--radius-base)',
  			'token-md': 'var(--radius-md)',
  			'token-lg': 'var(--radius-lg)',
  			'token-xl': 'var(--radius-xl)',
  			'token-2xl': 'var(--radius-2xl)',
  			'token-3xl': 'var(--radius-3xl)'
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow-base)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'token-sm': 'var(--shadow-sm)',
  			'token-base': 'var(--shadow-base)',
  			'token-md': 'var(--shadow-md)',
  			'token-lg': 'var(--shadow-lg)',
  			'token-xl': 'var(--shadow-xl)',
  			'token-2xl': 'var(--shadow-2xl)',
  			'token-inner': 'var(--shadow-inner)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		transitionDuration: {
  			'token-fast': 'var(--transition-fast)',
  			'token-base': 'var(--transition-base)',
  			'token-slow': 'var(--transition-slow)'
  		},
  		zIndex: {
  			'token-dropdown': 'var(--z-dropdown)',
  			'token-sticky': 'var(--z-sticky)',
  			'token-fixed': 'var(--z-fixed)',
  			'token-modal-backdrop': 'var(--z-modal-backdrop)',
  			'token-modal': 'var(--z-modal)',
  			'token-popover': 'var(--z-popover)',
  			'token-tooltip': 'var(--z-tooltip)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 