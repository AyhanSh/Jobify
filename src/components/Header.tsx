import React from 'react';
import { Brain, CheckCircle } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

const Header: React.FC<HeaderProps> = ({ currentStep, totalSteps }) => {
  const steps = ['Upload', 'Preferences', 'Analysis', 'Results'];

  return (
    <div className="w-full flex justify-center py-8">
      <div className="flex items-center space-x-2 lg:space-x-4">
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
  );
};

export default Header;