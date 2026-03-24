import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Search, History, Settings, LogOut, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Check News', path: '/dashboard' },
    { icon: History, label: 'My History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`fixed left-0 top-0 h-screen w-64 ${theme === 'dark' ? 'bg-[#111118]/80' : 'bg-white/90'} backdrop-blur-xl border-r ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} z-50`}
    >
      <div className="flex flex-col h-full p-6">
        {/* Logo */}
        <div className="mb-8">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                TruthAI
              </h2>
              <p className="text-xs text-gray-500">Fake News Detector</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  active 
                    ? theme === 'dark' 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400' 
                      : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active Indicator with Glow */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"
                    style={{
                      boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
                    }}
                  />
                )}
                
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <motion.button
          onClick={() => navigate('/login')}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
