export const getThemeClasses = (theme: 'light' | 'dark') => ({
  // Backgrounds
  bg: theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-gray-50 to-blue-50',
  cardBg: theme === 'dark' ? 'bg-[#111118]/80' : 'bg-white/90',
  inputBg: theme === 'dark' ? 'bg-[#1a1a24]/80' : 'bg-white',
  sidebarBg: theme === 'dark' ? 'bg-[#111118]/80' : 'bg-white/90',
  
  // Borders
  border: theme === 'dark' ? 'border-white/10' : 'border-gray-200',
  inputBorder: theme === 'dark' ? 'border-white/10' : 'border-gray-300',
  focusBorder: theme === 'dark' ? 'focus:border-cyan-500/50' : 'focus:border-blue-400',
  focusRing: theme === 'dark' ? 'focus:ring-cyan-500/20' : 'focus:ring-blue-400/20',
  
  // Text
  text: theme === 'dark' ? 'text-white' : 'text-gray-900',
  textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
  textDimmed: theme === 'dark' ? 'text-gray-500' : 'text-gray-500',
  placeholder: theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400',
  
  // Hover states
  hoverBg: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100',
  
  // Grid pattern opacity
  gridOpacity: theme === 'dark' ? 'rgba(0, 212, 255, 0.05)' : 'rgba(59, 130, 246, 0.1)',
});
