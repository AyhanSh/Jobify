import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

const Header: React.FC<HeaderProps> = ({ currentStep, totalSteps }) => {
  const steps = ['Upload', 'Preferences', 'Analysis', 'Results'];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">

          {/* Mobile Progress */}
          <div className="sm:hidden">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Desktop Progress */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index < currentStep
                  ? 'bg-green-100 text-green-800'
                  : index === currentStep
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-500'
                  }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden lg:block ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-4 lg:w-8 h-0.5 mx-2 lg:mx-3 ${index < currentStep ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;