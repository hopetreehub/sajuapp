/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93bbfc',
          400: '#60a5fa',
          500: '#3b82f6',  // Main blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        lunar: '#6B7280',  // Lunar calendar gray
        fortune: {
          lucky: '#10B981',   // Green
          normal: '#3B82F6',  // Blue
          caution: '#F59E0B', // Amber
          danger: '#EF4444',  // Red
        },
        // 한국 전통 오행 색상 시스템
        wuxing: {
          wood: {
            DEFAULT: 'hsl(var(--wood))',
            light: 'hsl(var(--wood-light))',
            dark: 'hsl(var(--wood-dark))',
          },
          fire: {
            DEFAULT: 'hsl(var(--fire))',
            light: 'hsl(var(--fire-light))',
            dark: 'hsl(var(--fire-dark))',
          },
          earth: {
            DEFAULT: 'hsl(var(--earth))',
            light: 'hsl(var(--earth-light))',
            dark: 'hsl(var(--earth-dark))',
          },
          metal: {
            DEFAULT: 'hsl(var(--metal))',
            light: 'hsl(var(--metal-light))',
            dark: 'hsl(var(--metal-dark))',
          },
          water: {
            DEFAULT: 'hsl(var(--water))',
            light: 'hsl(var(--water-light))',
            dark: 'hsl(var(--water-dark))',
          },
        },
        // 음양 색상
        yinyang: {
          yang: 'hsl(var(--yang))',
          yin: 'hsl(var(--yin))',
        },
        // 한복 전통 색상
        hanbok: {
          red: 'hsl(var(--hanbok-red))',
          blue: 'hsl(var(--hanbok-blue))',
          yellow: 'hsl(var(--hanbok-yellow))',
          green: 'hsl(var(--hanbok-green))',
          white: 'hsl(var(--hanbok-white))',
        },
        // 계절별 색상 (24절기)
        season: {
          spring: 'hsl(var(--spring))',
          summer: 'hsl(var(--summer))',
          autumn: 'hsl(var(--autumn))',
          winter: 'hsl(var(--winter))',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}