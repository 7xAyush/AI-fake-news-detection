import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useAuth } from '../../state/AuthContext.jsx';

const API_BASE = 'http://localhost:5000';

interface DashboardProps {
  onAnalyse: (result: any) => void;
}

export default function Dashboard({ onAnalyse }: DashboardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { token } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAnalyzing(true);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const contentTrimmed = formData.content.trim();
    const isUrl = /^https?:\/\//i.test(contentTrimmed);

    try {
      let res: Response;
      if (isUrl) {
        // URL-based detection
        res = await fetch(`${API_BASE}/api/predict/url`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ url: contentTrimmed }),
        });
      } else {
        // Text-based detection (combine title + content)
        const combinedText = formData.title
          ? `${formData.title}\n\n${formData.content}`
          : formData.content;
        res = await fetch(`${API_BASE}/api/predict/text`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text: combinedText }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      const mappedResult = {
        status: data.prediction, // 'FAKE' or 'REAL'
        confidence: Math.round((data.confidence ?? 0) * 100),
        title: formData.title || (isUrl ? 'URL Analysis' : 'Untitled Article'),
        content: formData.content,
        keywords: data.suspicious_words || [],
        analyzedAt: new Date().toISOString(),
        language: data.language,
        summary: data.summary,
        source: data.source,
        raw: data,
      };

      onAnalyse(mappedResult);
      navigate('/result');
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
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
          className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"
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
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">
              {t('AI-Powered Analysis')}
            </span>
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('Check News Authenticity')}
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            {t(
              'Leverage advanced AI to detect fake news in real-time',
            )}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Elevated Card Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 rounded-2xl" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            {error && (
              <div className="relative z-10 mb-4 rounded-lg bg-red-500/10 border border-red-500/40 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAnalyse} className="relative z-10 space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('Title of News')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1a24]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder={t('Enter the news headline...')}
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {t('Full Article / Paste URL')}
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 bg-[#1a1a24]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                  placeholder={t(
                    'Paste the full article text or URL here for analysis...',
                  )}
                />
              </div>

              {/* Analyze Button */}
              <motion.button
                type="submit"
                disabled={isAnalyzing}
                className="relative w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white text-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                onHoverStart={() => !isAnalyzing && setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
                whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovering && !isAnalyzing ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    boxShadow: '0 0 40px rgba(34, 211, 238, 0.5)'
                  }}
                />
                
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-6 h-6" />
                      </motion.div>
                      {t('Analyzing with AI...')}
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      {t('Analyse News')}
                    </>
                  )}
                </span>

                {/* Shimmer effect */}
                {isHovering && !isAnalyzing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                )}

                {/* Loading Animation */}
                {isAnalyzing && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-cyan-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  />
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-6 mt-8"
        >
          {[
            { label: t('AI-Powered'), value: '99.2%', desc: t('Accuracy') },
            { label: t('Real-time'), value: '<2s', desc: t('Analysis') },
            { label: t('Sources'), value: '10M+', desc: t('Verified') },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-[#111118]/60 backdrop-blur-xl border border-white/5 rounded-xl p-6 text-center"
              whileHover={{ y: -4, borderColor: 'rgba(34, 211, 238, 0.3)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
              <div className="text-gray-500 text-xs">{stat.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
