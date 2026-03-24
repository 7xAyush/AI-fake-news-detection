import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Supported languages for the UI.
type LanguageCode = 'en' | 'hi' | 'ta';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Keys are the original English strings used in components.
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {},
  hi: {
    // Generic
    Settings: 'सेटिंग्स',
    'Language & Region': 'भाषा और क्षेत्र',
    'Select Language': 'भाषा चुनें',

    // Auth / account
    'Create Account': 'खाता बनाएँ',
    'Join the AI-powered truth revolution':
      'एआई-संचालित सच्चाई क्रांति से जुड़ें',
    'Full Name': 'पूरा नाम',
    Email: 'ईमेल',
    'Email Address': 'ईमेल पता',
    Password: 'पासवर्ड',
    'Confirm Password': 'पासवर्ड की पुष्टि करें',
    'Already have an account?': 'पहले से खाता है?',
    Login: 'लॉगिन',
    "Don't have an account?": 'खाता नहीं है?',
    'Sign up': 'साइन अप',
    'Create a strong password': 'मज़बूत पासवर्ड बनाएँ',
    'Confirm your password': 'अपना पासवर्ड पुष्टि करें',
    'Creating account...': 'खाता बनाया जा रहा है...',
    'Join now': 'अभी जुड़ें',

    // Dashboard
    Dashboard: 'डैशबोर्ड',
    History: 'इतिहास',
    'Settings description':
      'अपने खाते की प्राथमिकताएँ और सेटिंग्स प्रबंधित करें',
    'AI-Powered Analysis': 'एआई-संचालित विश्लेषण',
    'Check News Authenticity': 'समाचार की प्रामाणिकता जांचें',
    'Leverage advanced AI to detect fake news in real-time':
      'उन्नत एआई से रियल-टाइम में फेक न्यूज़ पहचानें',
    'Title of News': 'समाचार का शीर्षक',
    'Enter the news headline...': 'समाचार की हेडलाइन लिखें...',
    'Full Article / Paste URL': 'पूरा लेख / URL पेस्ट करें',
    'Paste the full article text or URL here for analysis...':
      'विश्लेषण के लिए पूरा लेख या URL यहाँ पेस्ट करें...',
    'Analyzing with AI...': 'एआई के साथ विश्लेषण हो रहा है...',
    'Analyse News': 'समाचार का विश्लेषण करें',
    'AI-Powered': 'एआई-संचालित',
    'Real-time': 'रियल-टाइम',
    Sources: 'स्रोत',
    Accuracy: 'सटीकता',
    Analysis: 'विश्लेषण',
    Verified: 'वेरिफाइड',

    // Sidebar / navigation
    'Check News': 'समाचार जांचें',
    'My History': 'मेरा इतिहास',
    Logout: 'लॉगआउट',
    TruthAI: 'ट्रुथAI',
    'Fake News Detector': 'फेक न्यूज़ डिटेक्टर',

    // History page
    'View all your previous news authenticity checks':
      'अपने सभी पुराने समाचार सत्यापन देखें',
    'Search by ID or title...': 'ID या शीर्षक से खोजें...',
    'News ID': 'समाचार ID',
    Status: 'स्थिति',
    Confidence: 'विश्वास स्तर',
    Date: 'तारीख',
    'News Details': 'समाचार विवरण',
    Actions: 'कार्रवाई',
    'No results found': 'कोई परिणाम नहीं मिला',
    'Total Analyzed': 'कुल विश्लेषण',
    'Real News': 'वास्तविक समाचार',
    'Fake News': 'फेक समाचार',

    // Detection result
    'Analysis Complete': 'विश्लेषण पूरा',
    'AI has processed your news article':
      'एआई ने आपके समाचार लेख का विश्लेषण कर लिया है',
    'This news appears to be authentic':
      'यह समाचार प्रामाणिक प्रतीत होता है',
    'This news appears to be fabricated':
      'यह समाचार मनगढ़ंत प्रतीत होता है',
    'Confidence Score': 'विश्वास स्कोर',
    'Key Factors Analyzed': 'विश्लेषित मुख्य कारक',
    'Analyzed Content': 'विश्लेषित सामग्री',
    Title: 'शीर्षक',
    'Content Preview': 'सामग्री पूर्वावलोकन',
    'Check Another Article': 'कोई दूसरा लेख जांचें',
    'View History': 'इतिहास देखें',
  },
  ta: {
    // Generic
    Settings: 'அமைப்புகள்',
    'Language & Region': 'மொழி மற்றும் பகுதி',
    'Select Language': 'மொழியை தேர்வு செய்யவும்',

    // Auth / account
    'Create Account': 'கணக்கை உருவாக்கவும்',
    'Join the AI-powered truth revolution':
      'ஏஐ இயக்கும் உண்மைப் புரட்சியில் சேருங்கள்',
    'Full Name': 'முழு பெயர்',
    Email: 'இமெயில்',
    'Email Address': 'இமெயில் முகவரி',
    Password: 'கடவுச்சொல்',
    'Confirm Password': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'Already have an account?': 'ஏற்கனவே கணக்கு உள்ளதா?',
    Login: 'உள் நுழை',
    "Don't have an account?": 'கணக்கு இல்லையா?',
    'Sign up': 'பதிவு செய்யவும்',
    'Create a strong password': 'வலுவான கடவுச்சொல்லை உருவாக்கவும்',
    'Confirm your password': 'உங்கள் கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'Creating account...': 'கணக்கை உருவாக்குகின்றோம்...',
    'Join now': 'இப்போது சேருங்கள்',

    // Dashboard
    Dashboard: 'டாஷ்போர்டு',
    History: 'வரலாறு',
    'Settings description':
      'உங்கள் கணக்கு முன்னுரிமைகள் மற்றும் அமைப்புகளை நிர்வகிக்கவும்',
    'AI-Powered Analysis': 'ஏஐ இயக்கும் பகுப்பாய்வு',
    'Check News Authenticity': 'செய்தியின் நம்பகத்தன்மையை சரிபார்க்கவும்',
    'Leverage advanced AI to detect fake news in real-time':
      'உயர்ந்த ஏஐ-ஐ பயன்படுத்தி நேரடியாக போலிச் செய்திகளை கண்டறியவும்',
    'Title of News': 'செய்தி தலைப்பு',
    'Enter the news headline...': 'செய்தி தலைப்பை உள்ளிடுங்கள்...',
    'Full Article / Paste URL': 'முழு கட்டுரை / URL ஒட்டுங்கள்',
    'Paste the full article text or URL here for analysis...':
      'பகுப்பாய்வுக்காக முழு கட்டுரையையோ URL-ஐயோ இங்கே ஒட்டுங்கள்...',
    'Analyzing with AI...': 'ஏஐ மூலம் பகுப்பாய்வு செய்கிறது...',
    'Analyse News': 'செய்தியை பகுப்பாய்வு செய்',
    'AI-Powered': 'ஏஐ இயக்கம்',
    'Real-time': 'நேரடி',
    Sources: 'மூலங்கள்',
    Accuracy: 'துல்லியம்',
    Analysis: 'பகுப்பாய்வு',
    Verified: 'சரிபார்க்கப்பட்டது',

    // Sidebar / navigation
    'Check News': 'செய்தியை சரிபார்',
    'My History': 'என் வரலாறு',
    Logout: 'வெளியேறு',
    TruthAI: 'ட்ரூத்AI',
    'Fake News Detector': 'போலிச் செய்தி கண்டறிதல் கருவி',

    // History page
    'View all your previous news authenticity checks':
      'முன்பு செய்த அனைத்து செய்தி சரிபார்ப்புகளையும் காண்க',
    'Search by ID or title...': 'ID அல்லது தலைப்பால் தேடுங்கள்...',
    'News ID': 'செய்தி ID',
    Status: 'நிலை',
    Confidence: 'நம்பிக்கை',
    Date: 'தேதி',
    'News Details': 'செய்தி விவரங்கள்',
    Actions: 'செயல்கள்',
    'No results found': 'முடிவுகள் எதுவும் இல்லை',
    'Total Analyzed': 'மொத்த பகுப்பாய்வு',
    'Real News': 'உண்மை செய்திகள்',
    'Fake News': 'போலிச் செய்திகள்',

    // Detection result
    'Analysis Complete': 'பகுப்பாய்வு முடிந்தது',
    'AI has processed your news article':
      'ஏஐ உங்கள் செய்தி கட்டுரையை பகுப்பாய்வு செய்துவிட்டது',
    'This news appears to be authentic':
      'இந்தச் செய்தி நம்பகமானதாகத் தோன்றுகிறது',
    'This news appears to be fabricated':
      'இந்தச் செய்தி உருவாக்கப்பட்டதாகத் தோன்றுகிறது',
    'Confidence Score': 'நம்பிக்கை மதிப்பெண்',
    'Key Factors Analyzed': 'பகுப்பாய்வு செய்யப்பட்ட முக்கிய காரணிகள்',
    'Analyzed Content': 'பகுப்பாய்வு செய்யப்பட்ட உள்ளடக்கம்',
    Title: 'தலைப்பு',
    'Content Preview': 'உள்ளடக்க முன்னோட்டம்',
    'Check Another Article': 'மற்றொரு கட்டுரையை சரிபார்',
    'View History': 'வரலாறை காண்க',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('language') as
        | LanguageCode
        | null;
      if (saved === 'en' || saved === 'hi' || saved === 'ta') {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', code);
    }
  };

  const t = useMemo(
    () => (text: string) => {
      const map = translations[language] || {};
      return map[text] || text;
    },
    [language],
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

