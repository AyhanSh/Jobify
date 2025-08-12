import { useState, useEffect, useRef } from 'react';
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
import ProtectedRoute from './components/ProtectedRoute';
import { useMobileDetection } from './hooks/useMobileDetection';

// Auth Callback Component
function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const href = window.location.href;
      const url = new URL(href);
      const hasCode = !!url.searchParams.get('code');
      const hash = url.hash || '';
      const hasAccessToken = hash.includes('access_token=');
      if (!hasCode && !hasAccessToken) {
        // Nothing to exchange; return to home
        navigate('/');
        return;
      }
      const { error } = await supabase.auth.exchangeCodeForSession(href);
      if (error) {
        console.error('Auth callback error:', error);
      }
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
  const [isAnalysisSaved, setIsAnalysisSaved] = useState(false);
  const [showMemePopup, setShowMemePopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { user } = useAuth();
  const hasSavedThisResultRef = useRef(false);

  // Helpers for persisting a pending analysis across auth redirect
  const PENDING_KEY = 'jobify-pending-analysis';
  const writePendingAnalysis = (params: { result: AnalysisResult; cv: CVData; prefs: UserPreferences; }) => {
    try {
      const payload = {
        result: params.result,
        cv: { ...params.cv, uploadDate: params.cv.uploadDate?.toString?.() || new Date().toString() },
        prefs: params.prefs,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to persist pending analysis', err);
    }
  };
  const readPendingAnalysis = (): null | { result: AnalysisResult; cv: CVData; prefs: UserPreferences; } => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const cv: CVData = {
        fileName: data.cv.fileName,
        content: data.cv.content,
        uploadDate: new Date(data.cv.uploadDate || Date.now()),
      };
      return { result: data.result as AnalysisResult, cv, prefs: data.prefs as UserPreferences };
    } catch (err) {
      console.warn('Failed to read pending analysis', err);
      return null;
    }
  };
  const clearPendingAnalysis = () => {
    try { localStorage.removeItem(PENDING_KEY); } catch { }
  };

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
    setIsAnalysisSaved(false); // Reset saved state for new analysis
    hasSavedThisResultRef.current = false;
    if (cvData && cvData.content.toLowerCase().includes('amina')) {
      setShowMemePopup(true);
    }

    // If unauthenticated, persist the analysis so we can save it post-login
    if (!user && cvData && preferences) {
      writePendingAnalysis({ result, cv: cvData, prefs: preferences });
    }

    // Save analysis to database if user is authenticated
    if (user && cvData && !hasSavedThisResultRef.current) {
      saveAnalysisToDatabase(result, cvData);
      setIsAnalysisSaved(true);
      hasSavedThisResultRef.current = true;
    }
  };

  const saveAnalysisToDatabase = async (result: AnalysisResult, cv: CVData) => {
    try {
      const { error } = await supabase
        .from('cv_analyses')
        .insert({
          user_id: user?.id,
          cv_file_name: cv.fileName,
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
    setIsAnalysisSaved(false);
    hasSavedThisResultRef.current = false;
    clearPendingAnalysis();
    setCurrentStep('upload');
  };

  const handleSaveAnalysis = async () => {
    if (user && analysisResult && cvData && !hasSavedThisResultRef.current) {
      try {
        await saveAnalysisToDatabase(analysisResult, cvData);
        setIsAnalysisSaved(true);
        hasSavedThisResultRef.current = true;
        clearPendingAnalysis();
      } catch (error) {
        console.error('Error saving analysis:', error);
      }
    }
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
    } else if (currentStep === 'results' && analysisResult && user) {
      setShowAuthPopup(false);
    }
  }, [currentStep, analysisResult, user]);

  // After sign-in, if there is a pending analysis, restore it, auto-save, and show results
  const pendingHandledRef = useRef(false);
  useEffect(() => {
    if (!user) return;

    // Process pending once per login
    if (!pendingHandledRef.current) {
      const pending = readPendingAnalysis();
      if (pending) {
        pendingHandledRef.current = true;
        hasSavedThisResultRef.current = true; // prevent double-save paths
        setCvData(pending.cv);
        setPreferences(pending.prefs);
        setAnalysisResult(pending.result);
        setCurrentStep('results');
        (async () => {
          await saveAnalysisToDatabase(pending.result, pending.cv);
          setIsAnalysisSaved(true);
          clearPendingAnalysis();
          setShowAuthPopup(false);
        })();
        return;
      }
    }

    // If no pending but we already have results in state and not saved, save once
    if (!hasSavedThisResultRef.current && analysisResult && cvData) {
      hasSavedThisResultRef.current = true;
      (async () => {
        await saveAnalysisToDatabase(analysisResult, cvData);
        setIsAnalysisSaved(true);
        clearPendingAnalysis();
      })();
    }
  }, [user]);

  return (
    <div className="flex-1 ml-60">
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
            onSaveAnalysis={handleSaveAnalysis}
            isAnalysisSaved={isAnalysisSaved}
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
          <Route path="/Dashboard" element={
            <ProtectedRoute
              title="Sign in to view your dashboard"
              message="To access your analysis history and saved results, please sign in with your Google account."
            >
              <div className='flex-1 ml-56'><HistoryPage /></div>
            </ProtectedRoute>
          } />
          <Route path="/account" element={<div className='flex-1 ml-56'><AccountPage /></div>} />
          <Route path="/about" element={<div className='flex-1 ml-56'><AboutPage /></div>} />
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