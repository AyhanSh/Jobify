import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, TrendingUp, Briefcase, Target, Star } from 'lucide-react';
import FeedbackForm from './FeedbackForm';
import { useAuth } from '../contexts/AuthContext';

interface ResultsDisplayProps {
  results: AnalysisResult;
  onRestart: () => void;
  onViewResults?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onRestart, onViewResults }) => {
  const { user } = useAuth();

  // Defensive checks for all nested properties
  const ats = results?.atsCompatibility ?? { score: 0, issues: [], recommendations: [] };
  const skill = results?.skillMatch ?? { score: 0, matchedSkills: [], missingSkills: [], recommendations: [] };
  const exp = results?.experienceMatch ?? { score: 0, strengths: [], gaps: [], recommendations: [] };
  const improvementAreas = results?.improvementAreas ?? [];
  const overallScore = results?.overallScore ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fallback UI if no results
  if (!results || (!overallScore && improvementAreas.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-4">No analysis results available.</h2>
        <p>Please upload a CV and run the analysis to see your results.</p>
        <button
          onClick={onRestart}
          className="mt-6 inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Analyze Another CV ➡️
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">CV Analysis Complete!</h2>
        <p className="text-lg text-gray-600">
          Here's your comprehensive analysis with actionable recommendations
        </p>
        {!user && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 mb-3">
              💡 Sign in to save your analysis and access detailed recommendations
            </p>
            <button
              onClick={onViewResults}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
      {/* Overall Score */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold border-4 ${getScoreBgColor(overallScore)}`}>
            <span className={getScoreColor(overallScore)}>{overallScore}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-4">Overall CV Score</h3>
          <p className="text-gray-600 mt-2">
            {overallScore >= 80 ? 'Excellent! Your CV is well-optimized.' :
              overallScore >= 60 ? 'Good foundation with room for improvement.' :
                'Significant improvements needed to enhance your CV.'}
          </p>
        </div>
      </div>
      {/* Analysis Sections */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* ATS Compatibility */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">ATS Compatibility</h3>
              <div className={`text-2xl font-bold ${getScoreColor(ats.score)}`}>
                {ats.score}%
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {ats.issues?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Issues Found
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {ats.issues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ats.recommendations?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Recommendations
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {ats.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Skill Match */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Skill Match</h3>
              <div className={`text-2xl font-bold ${getScoreColor(skill.score)}`}>
                {skill.score}%
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {skill.matchedSkills?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Matched Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skill.matchedSkills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skill.missingSkills?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skill.missingSkills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Experience Match */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Experience Match</h3>
              <div className={`text-2xl font-bold ${getScoreColor(exp.score)}`}>
                {exp.score}%
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {exp.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Strengths
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {exp.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exp.gaps?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Experience Gaps
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {exp.gaps.map((gap, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Improvement Areas */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
          Priority Improvement Areas
        </h3>
        <div className="space-y-6">
          {improvementAreas.map((area, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{area.area}</h4>
                  <p className="text-gray-600 mt-1">{area.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(area.priority)}`}>
                  {area.priority.toUpperCase()}
                </span>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Action Items:</h5>
                <ul className="space-y-2">
                  {area.actionItems?.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          Analyze Another CV ➡️
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;