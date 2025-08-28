import { useTheme } from '@/contexts/ThemeContext'

// 아이콘 컴포넌트들
const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
    />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
    />
  </svg>
)

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ThemeToggle({ size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base', 
    lg: 'p-3 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]} 
        rounded-lg 
        bg-background 
        hover:bg-muted 
        border border-border 
        transition-all duration-200 
        flex items-center space-x-2
        focus:outline-none 
        focus:ring-2 
        focus:ring-primary 
        focus:ring-offset-2
        ${showLabel ? 'px-3' : ''}
      `}
      aria-label={`${theme === 'light' ? '다크' : '라이트'} 모드로 전환`}
      title={`${theme === 'light' ? '다크' : '라이트'} 모드로 전환`}
    >
      {theme === 'light' ? (
        <MoonIcon className={`${iconSizes[size]} text-foreground`} />
      ) : (
        <SunIcon className={`${iconSizes[size]} text-foreground`} />
      )}
      
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          {theme === 'light' ? '다크 모드' : '라이트 모드'}
        </span>
      )}
    </button>
  )
}