import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  User, 
  Globe, 
  Bell, 
  Shield, 
  LogOut, 
  Trash2, 
  Save,
  Moon,
  Sun,
  Volume2,
  Mail,
  Lock,
  Eye,
  Database,
  Download
} from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useAuth } from '../../state/AuthContext.jsx';

const API_BASE = 'http://localhost:5000';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, token, login } = useAuth();
  const [settings, setSettings] = useState({
    fullName: '',
    email: '',
    language: 'English',
    notifications: {
      email: true,
      push: false,
      weekly: true
    },
    privacy: {
      shareAnalytics: false,
      publicProfile: false
    }
  });

  const [isHovering, setIsHovering] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳' }
  ];

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('You must be logged in to save settings.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: settings.fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }
      // Update auth context with new name while keeping the same token.
      login(data.user, token);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    // Delete account logic
    console.log('Account deleted');
    navigate('/login');
  };

  const handleExportData = async () => {
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('You must be logged in to export data.');
      return;
    }

    try {
      setExporting(true);
      const res = await fetch(`${API_BASE}/api/analyses/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let message = 'Failed to export data';
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'analysis-history.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Export started. Check your downloads folder.');
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-gray-50 to-blue-50'} relative overflow-hidden p-8`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 212, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 212, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
        
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {t('Settings')}
          </h1>
          <p className="text-gray-400">
            {t('Settings description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
              >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a24]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    readOnly
                    className="w-full px-4 py-3 bg-[#1a1a24]/80 border border-white/10 rounded-xl text-gray-400 placeholder-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </motion.div>

            {/* Language Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {t('Language & Region')}
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('Select Language')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <motion.button
                      key={lang.code}
                      onClick={() => {
                        setSettings({ ...settings, language: lang.name });
                        // English, Hindi and Tamil currently have UI translations.
                        // Other language options keep the interface in English for now.
                        const nextCode =
                          lang.code === 'hi' || lang.code === 'ta'
                            ? (lang.code as 'hi' | 'ta')
                            : 'en';
                        setLanguage(nextCode);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        settings.language === lang.name || language === lang.code
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-[#1a1a24]/80 border-white/10 text-gray-400 hover:border-cyan-500/30'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Bell className="w-5 h-5 text-yellow-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'email', icon: Mail, label: 'Email Notifications', desc: 'Receive analysis results via email' },
                  { key: 'push', icon: Volume2, label: 'Push Notifications', desc: 'Get instant alerts on your device' },
                  { key: 'weekly', icon: Database, label: 'Weekly Summary', desc: 'Receive weekly analysis reports' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1a24]/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications]
                          }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.notifications[item.key as keyof typeof settings.notifications]
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                            : 'bg-gray-700'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          animate={{
                            x: settings.notifications[item.key as keyof typeof settings.notifications] ? 28 : 4
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Privacy & Security</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'shareAnalytics', icon: Eye, label: 'Share Analytics', desc: 'Help improve our AI model' },
                  { key: 'publicProfile', icon: Lock, label: 'Public Profile', desc: 'Make your history visible to others' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1a24]/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-white font-medium">{item.label}</p>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            [item.key]: !settings.privacy[item.key as keyof typeof settings.privacy]
                          }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.privacy[item.key as keyof typeof settings.privacy]
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                            : 'bg-gray-700'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          animate={{
                            x: settings.privacy[item.key as keyof typeof settings.privacy] ? 28 : 4
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Save Changes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              
              <motion.button
                onClick={handleSave}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white mb-3"
                onHoverStart={() => setIsHovering('save')}
                onHoverEnd={() => setIsHovering('')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Changes
                </span>
                
                {isHovering === 'save' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}
              </motion.button>

              <motion.button
                onClick={handleLogout}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Logout
                </span>
              </motion.button>
            </motion.div>

            {/* Data Export */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Data Export</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Download all your analysis history and data
              </p>
              <motion.button
                onClick={handleExportData}
                className="w-full py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {exporting ? 'Exporting...' : 'Export Data'}
              </motion.button>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#111118]/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Once you delete your account, there is no going back
              </p>
              
              {!showDeleteConfirm ? (
                <motion.button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Account
                </motion.button>
              ) : (
                <div className="space-y-2">
                  <p className="text-yellow-400 text-xs font-medium mb-2">Are you sure?</p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2 bg-red-500 rounded-lg font-medium text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Yes, Delete
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 bg-gray-700 rounded-lg font-medium text-white"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Theme Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={`${theme === 'dark' ? 'bg-[#111118]/80' : 'bg-white'} backdrop-blur-xl border ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} rounded-2xl p-6 shadow-xl`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100'} rounded-lg`}>
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Theme</h3>
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-3 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-800 to-gray-900 border border-cyan-500/50'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Moon className={`w-5 h-5 mx-auto ${theme === 'dark' ? 'text-cyan-400' : 'text-gray-500'}`} />
                  <span className={`block text-xs mt-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-gray-500'}`}>Dark</span>
                </motion.button>
                <motion.button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-3 rounded-xl ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 border border-yellow-500/50'
                      : theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sun className={`w-5 h-5 mx-auto ${theme === 'light' ? 'text-white' : theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`} />
                  <span className={`block text-xs mt-1 ${theme === 'light' ? 'text-white' : theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Light</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
