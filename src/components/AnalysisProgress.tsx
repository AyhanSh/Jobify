import React, { useState, useEffect } from 'react';
import { Brain, FileText, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeCVWithChatGPT } from '../services/openai';
import { CVData, UserPreferences, AnalysisResult } from '../types';

interface AnalysisProgressProps {
  cvData: CVData;
  preferences: UserPreferences;
  onComplete: (result: AnalysisResult) => void;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ cvData, preferences, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const steps = [
    {
      icon: FileText,
      title: 'Processing CV Content',
      description: 'Extracting and parsing your CV information'
    },
    {
      icon: Target,
      title: 'ATS Compatibility Check',
      description: 'Evaluating formatting and keyword optimization'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Analyzing skills, experience, and job fit using AI 🤖'
    },
    {
      icon: CheckCircle,
      title: 'Generating Recommendations',
      description: 'Creating personalized improvement suggestions'
    }
  ];

  useEffect(() => {
    const runAnalysis = async () => {
      setAnalyzing(true);
      setError(null);

      try {
        // Simulate step progression
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev < 2) return prev + 1;
            return prev;
          });
        }, 1000);

        // Progress animation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev < 75) return prev + 2;
            return prev;
          });
        }, 100);

        // Wait for initial steps
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Run actual ChatGPT analysis
        setCurrentStep(3);
        const result = await analyzeCVWithChatGPT(cvData.content, preferences);

        clearInterval(stepInterval);
        clearInterval(progressInterval);

        // Complete progress
        setProgress(100);
        setTimeout(() => {
          onComplete(result);
        }, 500);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setAnalyzing(false);
      }
    };

    runAnalysis();
  }, [cvData, preferences, onComplete]);

  const retryAnalysis = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    setAnalyzing(true);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> To use this feature, you need to add your OpenAI API key to the environment variables.
              Create a <code>.env</code> file and add: <code>VITE_OPENAI_API_KEY=your_api_key_here</code>
            </p>
          </div>
          <button
            onClick={retryAnalysis}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">AI is Analyzing Your CV</h2>
        <p className="text-lg text-gray-600">
          And don't forget who's the GOAT of Azerbaijan.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
            <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-black h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center p-4 rounded-lg transition-all duration-300 ${isActive
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : isCompleted
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                  }`}
              >
                <div className={`p-3 rounded-full mr-4 ${isActive
                  ? 'bg-blue-500 text-white'
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${isActive || isCompleted ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                    {step.description}
                  </p>
                </div>
                {isCompleted && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {isActive && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                )}
              </div>
            );
          })}
        </div>

        {analyzing && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg text-blue-800">
              <Brain className="w-5 h-5 mr-2 animate-pulse" />
              <span className="text-sm font-medium">ChatGPT is analyzing your CV...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisProgress;