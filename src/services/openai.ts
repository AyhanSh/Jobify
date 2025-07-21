import { supabase } from '../lib/supabase';

export const analyzeCVWithChatGPT = async (cvContent: string, preferences: Record<string, unknown>) => {
  try {
    const { data, error } = await supabase.functions.invoke('super-worker', {
      body: {
        cvContent,
        preferences
      }
    }); console.log(data)

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error('Failed to analyze CV. Please try again.');
    }

    if (data.error) {
      console.error('Analysis error:', data.error);
      // Return fallback data if available
      return data.fallback || createFallbackAnalysis();
    }

    return data.result || data;
  } catch (error) {
    console.error('CV Analysis Error:', error);
    throw new Error('Failed to analyze CV. Please check your connection and try again.');
  }
};

const createFallbackAnalysis = () => {
  return {
    atsCompatibility: {
      score: 75,
      issues: ['Unable to connect to analysis service'],
      recommendations: ['Please check your internet connection and try again']
    },
    skillMatch: {
      score: 70,
      matchedSkills: ['General skills detected'],
      missingSkills: ['Analysis incomplete'],
      recommendations: ['Rerun analysis when service is available']
    },
    experienceMatch: {
      score: 65,
      strengths: ['Basic experience evaluation'],
      gaps: ['Analysis incomplete'],
      recommendations: ['Try again later']
    },
    overallScore: 70,
    improvementAreas: [
      {
        priority: 'high' as const,
        area: 'Service Connection',
        description: 'Unable to connect to analysis service',
        actionItems: ['Check internet connection', 'Try again in a few minutes']
      }
    ]
  };
};