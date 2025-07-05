import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import CVUpload from './components/CVUpload';
import PreferencesForm from './components/PreferencesForm';
import AnalysisProgress from './components/AnalysisProgress';
import ResultsDisplay from './components/ResultsDisplay';
import { CVData, UserPreferences, AnalysisResult, AppStep } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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
  };

  const handleRestart = () => {
    setCvData(null);
    setPreferences(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          />
        )}
      </main>
      <Analytics />
    </div>
  );
}

export default App;