import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { CheckCircle2, XCircle, RefreshCw, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DetectionResultProps {
  result: any;
}

export default function DetectionResult({ result }: DetectionResultProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate('/dashboard');
      return;
    }

    // Delay before showing result for dramatic effect
    const timer = setTimeout(() => {
      setShowResult(true);
    }, 600);

    // Animate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= result.confidence) {
          clearInterval(interval);
          return result.confidence;
        }
        return prev + 2;
      });
    }, 20);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [result, navigate]);

  if (!result) return null;

  const isReal = result.status === 'REAL';
  const statusColor = isReal ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
  const statusGlow = isReal ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0f]' : 'bg-gradient-to-br from-gray-50 to-blue-50'} relative overflow-hidden p-8`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 ${isReal ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full blur-[120px]`}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isReal ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-full blur-[120px]`}
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: showResult ? 1 : 0, scale: showResult ? 1 : 0.9 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: showResult ? 1 : 0 }}
              transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white mb-2">Analysis Complete</h1>
              <p className="text-gray-400">AI has processed your news article</p>
            </motion.div>
          </div>

          {/* Main Result Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6 shadow-2xl"
          >
            {/* Large Status Badge */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-4 mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring", delay: 0.6 }}
              >
                <div className={`relative p-6 bg-gradient-to-r ${statusColor} rounded-2xl`}
                  style={{
                    boxShadow: `0 0 60px ${statusGlow}`
                  }}
                >
                  {isReal ? (
                    <CheckCircle2 className="w-16 h-16 text-white" />
                  ) : (
                    <XCircle className="w-16 h-16 text-white" />
                  )}
                  
                  {/* Pulse Animation */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${statusColor} rounded-2xl`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className={`text-5xl font-bold bg-gradient-to-r ${statusColor} bg-clip-text text-transparent mb-2`}>
                  {result.status}
                </h2>
                <p className="text-gray-400">
                  {isReal ? 'This news appears to be authentic' : 'This news appears to be fabricated'}
                </p>
              </motion.div>
            </div>

            {/* Confidence Score */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 font-medium">Confidence Score</span>
                <motion.span
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {progress}%
                </motion.span>
              </div>
              
              {/* Horizontal Confidence Bar */}
              <div className="relative h-4 bg-[#1a1a24] rounded-full overflow-hidden">
                <motion.div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${statusColor} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  style={{
                    boxShadow: `0 0 20px ${statusGlow}`
                  }}
                />
              </div>

              {/* Circular Progress Ring */}
              <div className="flex justify-center mt-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="12"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={`url(#gradient-${result.status})`}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 552" }}
                      animate={{ strokeDasharray: `${(progress / 100) * 552} 552` }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      style={{
                        filter: `drop-shadow(0 0 10px ${statusGlow})`
                      }}
                    />
                    <defs>
                      <linearGradient id={`gradient-${result.status}`}>
                        <stop offset="0%" stopColor={isReal ? "#22c55e" : "#ef4444"} />
                        <stop offset="100%" stopColor={isReal ? "#10b981" : "#dc2626"} />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        className="text-4xl font-bold text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        {progress}%
                      </motion.div>
                      <div className="text-gray-400 text-sm mt-1">Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlighted Keywords Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="bg-[#1a1a24]/50 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Key Factors Analyzed</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword: string, index: number) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-sm font-medium"
                  >
                    #{keyword}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Article Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="bg-[#1a1a24]/50 rounded-xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                {isReal ? (
                  <Shield className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <h3 className="font-semibold text-white">Analyzed Content</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-500 text-sm">Title</label>
                  <p className="text-white font-medium">{result.title}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-sm">Content Preview</label>
                  <p className="text-gray-300 text-sm line-clamp-3">{result.content}</p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="flex gap-4 mt-8"
            >
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Check Another Article
                </span>
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/history')}
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View History
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
