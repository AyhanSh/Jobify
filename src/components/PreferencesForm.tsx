import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { ArrowRight, User, GraduationCap, Briefcase } from 'lucide-react';

interface PreferencesFormProps {
  onSubmit: (preferences: UserPreferences) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    targetPosition: '',
    age: 25,
    highestDegree: '',
    hasOngoingDegree: false,
    experienceYears: 0,
    industry: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const degrees = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctoral Degree (PhD)',
    'Professional Degree (MD, JD, etc.)'
  ];

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Marketing',
    'Sales',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Non-profit',
    'Government',
    'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Tell Us About Your Goals</h2>
        <p className="text-base sm:text-lg text-gray-600 px-4">
          Help us provide personalized analysis by sharing your career preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Target Position */}
          <div>
            <div className="flex items-center mb-3 sm:mb-4">
              <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
              <label className="text-base sm:text-lg font-semibold text-gray-900">Target Position</label>
            </div>
            <input
              type="text"
              value={preferences.targetPosition}
              onChange={(e) => setPreferences({ ...preferences, targetPosition: e.target.value })}
              placeholder="e.g., Software Engineer, Marketing Manager"
              className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <div className="flex items-center mb-3 sm:mb-4">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-base sm:text-lg font-semibold text-gray-900">Age</label>
              </div>
              <input
                type="number"
                value={preferences.age}
                onChange={(e) => setPreferences({ ...preferences, age: parseInt(e.target.value) })}
                min="18"
                max="70"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                required
              />
            </div>

            {/* Experience Years */}
            <div>
              <div className="flex items-center mb-3 sm:mb-4">
                <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-base sm:text-lg font-semibold text-gray-900">Years of Experience</label>
              </div>
              <input
                type="number"
                value={preferences.experienceYears}
                onChange={(e) => setPreferences({ ...preferences, experienceYears: parseInt(e.target.value) })}
                min="0"
                max="50"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Highest Degree */}
            <div>
              <div className="flex items-center mb-3 sm:mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-base sm:text-lg font-semibold text-gray-900">Highest Degree</label>
              </div>
              <select
                value={preferences.highestDegree}
                onChange={(e) => setPreferences({ ...preferences, highestDegree: e.target.value })}
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base appearance-none bg-white"
                required
              >
                <option value="">Select your highest degree</option>
                {degrees.map((degree) => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <div className="flex items-center mb-3 sm:mb-4">
                <Briefcase className="w-5 h-5 text-blue-600 mr-2" />
                <label className="text-base sm:text-lg font-semibold text-gray-900">Industry</label>
              </div>
              <select
                value={preferences.industry}
                onChange={(e) => setPreferences({ ...preferences, industry: e.target.value })}
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base appearance-none bg-white"
                required
              >
                <option value="">Select your industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ongoing Degree */}
          <div>
            <div className="flex items-start mb-3 sm:mb-4">
              <input
                type="checkbox"
                id="ongoing-degree"
                checked={preferences.hasOngoingDegree}
                onChange={(e) => setPreferences({ ...preferences, hasOngoingDegree: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              />
              <label htmlFor="ongoing-degree" className="ml-3 text-base sm:text-lg font-semibold text-gray-900">
                I am currently pursuing a degree
              </label>
            </div>

            {preferences.hasOngoingDegree && (
              <input
                type="text"
                value={preferences.ongoingDegree || ''}
                onChange={(e) => setPreferences({ ...preferences, ongoingDegree: e.target.value })}
                placeholder="e.g., Master's in Computer Science, MBA"
                className="w-full px-4 py-3 sm:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base"
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:from-blue-700 hover:to-purple-700 transition-all duration-200 active:scale-95 touch-manipulation"
          >
            Start Analysis ➡️
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferencesForm;