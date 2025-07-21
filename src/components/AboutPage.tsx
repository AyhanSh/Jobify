import React from 'react';
import logo from '/logo.png';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col items-center justify-center py-16 px-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center">
                <img src={logo} alt="Jobify Logo" className="w-20 h-20 mb-6 rounded-2xl shadow-lg" />
                <h1 className="text-4xl font-extrabold text-purple-700 mb-2 tracking-tight">About Jobify</h1>
                <p className="text-lg text-gray-600 mb-6 text-center">
                    <span className="font-semibold text-purple-600">Jobify</span> is your AI-powered career assistant, designed to help you stand out in the job market. We analyze your CV, provide actionable feedback, and empower you to land your dream job faster.
                </p>
                <div className="w-full mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h2>
                    <p className="text-gray-600 mb-4">
                        We believe everyone deserves a fair chance at their dream career. Jobify leverages the latest in AI and design to make job search, CV improvement, and self-presentation accessible to all.
                    </p>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Key Features</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                        <li>AI-powered CV analysis and instant feedback</li>
                        <li>Personalized job recommendations</li>
                        <li>Modern, user-friendly interface</li>
                        <li>Google sign-in for seamless access</li>
                        <li>Secure data handling with Supabase</li>
                    </ul>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Meet the Team</h2>
                    <div className="flex items-center space-x-4 mt-2">
                        <img src="/profile.jpeg" alt="Aykhan Shahbazov" className="w-12 h-12 rounded-full border-2 border-purple-200" />
                        <div>
                            <div className="font-semibold text-gray-900">Aykhan Shahbazov</div>
                            <div className="text-sm text-gray-500">Founder & Full Stack Developer</div>
                        </div>
                    </div>
                </div>
                <div className="text-center text-gray-400 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Jobify. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default AboutPage; 