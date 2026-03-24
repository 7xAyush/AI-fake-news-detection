import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, CheckCircle2, XCircle, RefreshCw, Mail, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useAuth } from '../../state/AuthContext.jsx';

const API_BASE = 'http://localhost:5000';

interface HistoryItem {
  id: string;
  title: string;
  status: 'REAL' | 'FAKE';
  confidence: number;
  date: string;
  preview: string;
}

export default function History() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/analyses?limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load history');
        }
        const mapped: HistoryItem[] = (data.items || []).map((it: any) => ({
          id: it.id,
          title:
            it.original_text_snippet?.slice(0, 80) ||
            (it.url ? `URL: ${it.url}` : 'News analysis'),
          status: it.prediction,
          confidence: Math.round((it.confidence ?? 0) * 100),
          date: it.created_at ? String(it.created_at).slice(0, 10) : '',
          preview: it.original_text_snippet || '',
        }));
        setItems(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [token]);

  const historyData = items;

  const filteredData = historyData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          className="absolute top-20 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"
          animate={{
            x: [-50, 50, -50],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {t('My History')}
          </h1>
          <p className="text-gray-400">
            {t('View all your previous news authenticity checks')}
          </p>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search by ID or title...')}
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a24]/80 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              {['All', 'REAL', 'FAKE'].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                      : 'bg-[#1a1a24]/80 text-gray-400 hover:text-white hover:bg-[#1a1a24]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#1a1a24]/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    {t('News ID')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    {t('Status')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    {t('Confidence')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    {t('Date')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                    {t('News Details')}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                    {t('Actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const isReal = item.status === 'REAL';
                  const statusColor = isReal ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
                  const statusBg = isReal ? 'bg-green-500/10' : 'bg-red-500/10';
                  const statusBorder = isReal ? 'border-green-500/20' : 'border-red-500/20';
                  const statusText = isReal ? 'text-green-400' : 'text-red-400';
                  
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-cyan-400 font-mono text-sm font-medium">{item.id}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <motion.div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 ${statusBg} border ${statusBorder} rounded-lg`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {isReal ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`${statusText} font-semibold text-sm`}>
                            {item.status}
                          </span>
                        </motion.div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-32">
                            <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${statusColor}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.confidence}%` }}
                                transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                              />
                            </div>
                          </div>
                          <span className="text-white font-semibold text-sm">{item.confidence}%</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 max-w-md">
                        <div>
                          <p className="text-white font-medium text-sm mb-1 line-clamp-1">{item.title}</p>
                          <p className="text-gray-500 text-xs line-clamp-1">{item.preview}</p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-cyan-400 transition-colors"
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            title="Recheck"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Send via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('No results found')}</p>
            </div>
          )}
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-6 mt-6"
        >
          {[
            {
              label: t('Total Analyzed'),
              value: historyData.length,
              color: 'cyan',
            },
            {
              label: t('Real News'),
              value: historyData.filter(i => i.status === 'REAL').length,
              color: 'green',
            },
            {
              label: t('Fake News'),
              value: historyData.filter(i => i.status === 'FAKE').length,
              color: 'red',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="bg-[#111118]/60 backdrop-blur-xl border border-white/5 rounded-xl p-6"
              whileHover={{ y: -4, borderColor: 'rgba(34, 211, 238, 0.3)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
