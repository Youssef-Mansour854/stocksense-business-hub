
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				stocksense: {
					blue: 'hsl(239 84% 67%)',
					'blue-dark': 'hsl(260 70% 55%)',
					cyan: 'hsl(199 89% 48%)',
					green: 'hsl(142 76% 36%)',
					'green-light': 'hsl(160 84% 39%)',
					gray: 'hsl(240 3.8% 45.1%)',
					'gray-light': 'hsl(240 4.8% 95.9%)'
				}
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'cairo': ['Cairo', 'sans-serif'],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-glass': 'var(--gradient-glass)',
				'hero-gradient': 'linear-gradient(135deg, hsl(239 84% 67%) 0%, hsl(260 70% 55%) 50%, hsl(199 89% 48%) 100%)',
				'card-gradient': 'var(--gradient-glass)',
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'fade-in-up': 'fadeInUp 0.8s ease-out',
				'fade-in': 'fadeIn 1s ease-out',
				'slide-in-right': 'slideInRight 0.8s ease-out',
				'slide-in-left': 'slideInLeft 0.8s ease-out',
				'scale-in': 'scaleIn 0.5s ease-out',
				'bounce-in': 'bounceIn 0.8s ease-out',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'shimmer': 'shimmer 2s linear infinite',
				'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' },
				},
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(30px)' },
					'100%': { opacity: '1', transform: 'translateY(0px)' },
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideInRight: {
					'0%': { opacity: '0', transform: 'translateX(50px)' },
					'100%': { opacity: '1', transform: 'translateX(0px)' },
				},
				slideInLeft: {
					'0%': { opacity: '0', transform: 'translateX(-50px)' },
					'100%': { opacity: '1', transform: 'translateX(0px)' },
				},
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				bounceIn: {
					'0%': { opacity: '0', transform: 'scale(0.3)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				glow: {
					'0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
					'100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				pulseSoft: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
