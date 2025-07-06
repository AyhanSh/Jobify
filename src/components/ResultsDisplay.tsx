import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, TrendingUp, User, GraduationCap, Briefcase, Target, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsDisplayProps {
  results: AnalysisResult;
  onRestart: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onRestart }) => {
  const [expandedSections, setExpandedSections] = React.useState<{ [key: string]: boolean }>({
    ats: false,
    skills: false,
    experience: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">CV Analysis Complete!</h2>
        <p className="text-base sm:text-lg text-gray-600 px-4">
          Here's your comprehensive analysis with actionable recommendations
        </p>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 rounded-full text-2xl sm:text-4xl font-bold border-4 ${getScoreBgColor(results.overallScore)}`}>
            <span className={getScoreColor(results.overallScore)}>{results.overallScore}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3 sm:mt-4">Overall CV Score</h3>
          <p className="text-sm sm:text-base text-gray-600 mt-2 px-4">
            {results.overallScore >= 80 ? 'Excellent! Your CV is well-optimized.' :
              results.overallScore >= 60 ? 'Good foundation with room for improvement.' :
                'Significant improvements needed to enhance your CV.'}
          </p>
        </div>
      </div>

      {/* Analysis Sections - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        {/* ATS Compatibility */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('ats')}
            className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mr-3 sm:mr-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">ATS Compatibility</h3>
                <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(results.atsCompatibility.score)}`}>
                  {results.atsCompatibility.score}%
                </div>
              </div>
            </div>
            {expandedSections.ats ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.ats && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              {results.atsCompatibility.issues.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Issues Found
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.atsCompatibility.issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className="break-words">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.atsCompatibility.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                    Recommendations
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.atsCompatibility.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className="break-words">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skill Match */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('skills')}
            className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg mr-3 sm:mr-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Skill Match</h3>
                <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(results.skillMatch.score)}`}>
                  {results.skillMatch.score}%
                </div>
              </div>
            </div>
            {expandedSections.skills ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.skills && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              {results.skillMatch.matchedSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Matched Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.skillMatch.matchedSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {results.skillMatch.missingSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.skillMatch.missingSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Experience Match */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('experience')}
            className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg mr-3 sm:mr-4">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Experience Match</h3>
                <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(results.experienceMatch.score)}`}>
                  {results.experienceMatch.score}%
                </div>
              </div>
            </div>
            {expandedSections.experience ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.experience && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
              {results.experienceMatch.strengths.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Strengths
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.experienceMatch.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className="break-words">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.experienceMatch.gaps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Experience Gaps
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {results.experienceMatch.gaps.map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className="break-words">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
          Priority Improvement Areas
        </h3>

        <div className="space-y-4 sm:space-y-6">
          {results.improvementAreas.map((area, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">{area.area}</h4>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{area.description}</p>
                </div>
                <span className={`self-start px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getPriorityColor(area.priority)}`}>
                  {area.priority.toUpperCase()}
                </span>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Action Items:</h5>
                <ul className="space-y-2">
                  {area.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="break-words">{item}</span>
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
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-black hover:from-blue-700 hover:to-purple-700 transition-all duration-200 active:scale-95 touch-manipulation"
        >
          Analyze Another CV ➡️
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;