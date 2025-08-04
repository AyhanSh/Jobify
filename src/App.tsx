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
import MobileLanding from './components/MobileLanding';
import { CVData, UserPreferences, AnalysisResult, AppStep } from './types';
import AboutPage from './components/AboutPage';
import HistoryPage from './components/HistoryPage';
import { useMobileDetection } from './hooks/useMobileDetection';

// Auth Callback Component
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Parse the URL hash and set the session (Supabase v2+)
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        console.error('Auth callback error:', error);
      }
      // Redirect to home (or wherever you want)
      navigate('/');
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

    // Save analysis to database if user is authenticated
    if (user && cvData) {
      saveAnalysisToDatabase(result, cvData);
    }
  };

  const saveAnalysisToDatabase = async (result: AnalysisResult, cvData: CVData) => {
    try {
      const { error } = await supabase
        .from('cv_analyses')
        .insert({
          user_id: user?.id,
          cv_file_name: cvData.fileName,
          analysis_result: result,
          target_position: preferences?.targetPosition,
          industry: preferences?.industry
        });

      if (error) {
        console.error('Error saving analysis:', error);
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
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

  // Show non-closable auth popup when analysis is ready and user is not authenticated
  useEffect(() => {
    if (currentStep === 'results' && analysisResult && !user) {
      setShowAuthPopup(true);
    }
  }, [currentStep, analysisResult, user]);

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
        closable={user !== null}
      />

      <Analytics />
      <SpeedInsights />
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();
  const isMobile = useMobileDetection();
  const [showDesktopVersion, setShowDesktopVersion] = useState(() => {
    // Check if user previously chose to continue to desktop version
    return localStorage.getItem('jobify-desktop-version') === 'true';
  });

  const handleContinueToDesktop = () => {
    setShowDesktopVersion(true);
    localStorage.setItem('jobify-desktop-version', 'true');
  };

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

  // Show mobile landing page for mobile devices (unless user chose to continue)
  if (isMobile && !showDesktopVersion) {
    return <MobileLanding onContinue={handleContinueToDesktop} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <Routes>
          <Route path="/" element={<DashboardFlow />} />
          <Route path="/Dashboard" element={<div className='flex-1 ml-64'><HistoryPage /></div>} />
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