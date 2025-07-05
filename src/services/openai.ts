import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const analyzeCVWithChatGPT = async (cvContent: string, preferences: Record<string, unknown>) => {
  const systemPrompt = `The AI-Based Job Applier is an intelligent job application assistant designed to evaluate how well a user's CV aligns with their desired job position and to provide actionable feedback for improvement. The system wraps around the ChatGPT API and begins by asking users to upload their CVs in PDF or DOC format. After the upload, it prompts them to answer a few key preference questions: the job position they want to apply for, their age (to help infer career stage), and their highest completed degree (with an option to indicate if they are currently pursuing a degree).

Once the preferences are submitted, the system analyzes the CV using natural language processing to extract relevant information such as work experience (job titles, durations, industries), educational background, technical and soft skills, certifications, languages, and any noticeable career gaps. This extracted information is then compared to the typical requirements for the chosen job role using a combination of semantic reasoning via GPT and a structured relevance scoring system.

The output is a detailed analysis consisting of three key parts: (1) ATS Compatibility, which simulates how the CV would perform in an applicant tracking system by checking keyword density, structure, formatting, and clarity; (2) Experience / Education / Skill Match, which evaluates how well the user's background fits the role they want, highlighting strengths and mismatches; and (3) Areas for Improvement, which offers personalized suggestions for enhancing the CV or career profile, such as adding missing skills, addressing formatting issues, or pursuing specific qualifications.

The goal of the system is to give job seekers a clear, accurate, and personalized understanding of their readiness for specific roles and guide them in optimizing their applications for better results.

Please analyze the provided CV and return a structured JSON response with the following format:
{
  "atsCompatibility": {
    "score": number (0-100),
    "issues": string[],
    "recommendations": string[]
  },
  "skillMatch": {
    "score": number (0-100),
    "matchedSkills": string[],
    "missingSkills": string[],
    "recommendations": string[]
  },
  "experienceMatch": {
    "score": number (0-100),
    "strengths": string[],
    "gaps": string[],
    "recommendations": string[]
  },
  "overallScore": number (0-100),
  "improvementAreas": [
    {
      "priority": "high" | "medium" | "low",
      "area": string,
      "description": string,
      "actionItems": string[]
    }
  ]
}`;

  const userPrompt = `Please analyze this CV for the following job application:

Target Position: ${preferences.targetPosition}
Age: ${preferences.age}
Highest Degree: ${preferences.highestDegree}
${preferences.hasOngoingDegree ? `Currently pursuing: ${preferences.ongoingDegree}` : ''}
Years of Experience: ${preferences.experienceYears}
Industry: ${preferences.industry}

CV Content:
${cvContent}

Please provide a comprehensive analysis following the system instructions.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const analysisText = response.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const jsonMatch = analysisText?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.warn('Failed to parse JSON response, using fallback');
    }

    // Fallback: create structured response from text
    return createFallbackAnalysis();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to analyze CV. Please check your API key and try again.');
  }
};

const createFallbackAnalysis = () => {
  // Simple fallback analysis structure
  return {
    atsCompatibility: {
      score: 75,
      issues: ['Unable to fully parse ATS compatibility from response'],
      recommendations: ['Please try again with a valid API key']
    },
    skillMatch: {
      score: 70,
      matchedSkills: ['General skills detected'],
      missingSkills: ['Analysis incomplete'],
      recommendations: ['Rerun analysis with proper API configuration']
    },
    experienceMatch: {
      score: 65,
      strengths: ['Basic experience evaluation'],
      gaps: ['Analysis incomplete'],
      recommendations: ['Configure OpenAI API key for detailed analysis']
    },
    overallScore: 70,
    improvementAreas: [
      {
        priority: 'high' as const,
        area: 'API Configuration',
        description: 'OpenAI API key required for full analysis',
        actionItems: ['Add valid OpenAI API key to environment variables']
      }
    ]
  };
};

export { openai };