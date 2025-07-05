import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  const steps = ['Upload CV', 'Preferences', 'Analysis', 'Results'];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-black rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobify Beta</h1>
              <p className="text-sm text-gray-600">prod. by Aykhan Shahbazov</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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
                <span className={`ml-2 text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-3 ${index < currentStep ? 'bg-green-300' : 'bg-gray-200'
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