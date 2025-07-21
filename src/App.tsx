import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import CVUpload from './components/CVUpload';
import PreferencesForm from './components/PreferencesForm';
import AnalysisProgress from './components/AnalysisProgress';
import ResultsDisplay from './components/ResultsDisplay';
import MemePopup from './components/MemePopup';
import WelcomePopup from './components/WelcomePopup';
import FeedbackForm from './components/FeedbackForm';
import Sidebar from './components/Sidebar';
import AccountPage from './components/AccountPage';
import AuthPopup from './components/AuthPopup';
import { CVData, UserPreferences, AnalysisResult, AppStep } from './types';
import AboutPage from './components/AboutPage';

// Auth Callback Component
function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/');
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          navigate('/');
        } else {
          // No session, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

function DashboardFlow() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showMemePopup, setShowMemePopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const hasVisited = localStorage.getItem('jobify-welcome-shown');
    if (!hasVisited) {
      setShowWelcomePopup(true);
      localStorage.setItem('jobify-welcome-shown', 'true');
    }
  }, []);

  const getStepNumber = (step: AppStep): number => {
    switch (step) {
      case 'upload': return 0;
      case 'preferences': return 1;
      case 'analysis': return 2;
      case 'results': return 3;
      default: return 0;
    }
  };

  const handleCVUpload = (data: CVData) => {
    setCvData(data);
  };

  const handlePreferencesSubmit = (prefs: UserPreferences) => {
    setPreferences(prefs);
    setCurrentStep('analysis');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('results');
    if (cvData && cvData.content.toLowerCase().includes('amina')) {
      setShowMemePopup(true);
    }
  };

  const handleRestart = () => {
    setCvData(null);
    setPreferences(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
  };

  const handleViewResults = () => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }
    // User is authenticated, they can view results normally
  };

  return (
    <div className="flex-1 ml-64">
      <Header currentStep={getStepNumber(currentStep)} totalSteps={4} />
      <main className="py-8">
        {currentStep === 'upload' && (
          <CVUpload
            onCVUpload={handleCVUpload}
            onNext={() => setCurrentStep('preferences')}
          />
        )}
        {currentStep === 'preferences' && (
          <PreferencesForm onSubmit={handlePreferencesSubmit} />
        )}
        {currentStep === 'analysis' && cvData && preferences && (
          <AnalysisProgress
            cvData={cvData}
            preferences={preferences}
            onComplete={handleAnalysisComplete}
          />
        )}
        {currentStep === 'results' && analysisResult && (
          <ResultsDisplay
            results={analysisResult}
            onRestart={handleRestart}
            onViewResults={handleViewResults}
          />
        )}
      </main>
      <MemePopup isOpen={showMemePopup} onClose={() => setShowMemePopup(false)} />
      <WelcomePopup isOpen={showWelcomePopup} onClose={() => setShowWelcomePopup(false)} />
      <button
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2"
        onClick={() => setShowFeedback(true)}
      >
        <span>Improve the app</span> <span role="img" aria-label="lightbulb">💡</span>
      </button>
      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}

      {/* Auth Popup for Results */}
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        title="Sign in to view your analysis"
        message="To see your detailed CV analysis and save your results, please sign in with your Google account."
      />

      <Analytics />
      <SpeedInsights />
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <Routes>
          <Route path="/" element={<DashboardFlow />} />
          <Route path="/account" element={<div className='flex-1 ml-64'><AccountPage /></div>} />
          <Route path="/about" element={<div className='flex-1 ml-64'><AboutPage /></div>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;