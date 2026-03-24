import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState } from 'react';
import CreateAccount from './components/CreateAccount';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DetectionResult from './components/DetectionResult';
import History from './components/History';
import Settings from './components/Settings';
import MainLayout from './components/MainLayout';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/create-account" element={<CreateAccount onSignUp={() => setIsAuthenticated(true)} />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          
          <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/create-account" />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard onAnalyse={setAnalysisResult} />} />
            <Route path="result" element={<DetectionResult result={analysisResult} />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
