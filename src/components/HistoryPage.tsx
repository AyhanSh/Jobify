import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';
import { Calendar, FileText, Eye, Trash2, Download } from 'lucide-react';

interface SavedAnalysis {
    id: string;
    user_id: string;
    cv_file_name: string;
    analysis_result: AnalysisResult;
    created_at: string;
    target_position?: string;
    industry?: string;
}

const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);

    useEffect(() => {
        if (user) {
            fetchAnalyses();
        }
    }, [user]);

    const fetchAnalyses = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('cv_analyses')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching analyses:', error);
                return;
            }

            setAnalyses(data || []);
        } catch (error) {
            console.error('Error fetching analyses:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAnalysis = async (analysisId: string) => {
        try {
            const { error } = await supabase
                .from('cv_analyses')
                .delete()
                .eq('id', analysisId);

            if (error) {
                console.error('Error deleting analysis:', error);
                return;
            }

            setAnalyses(analyses.filter(a => a.id !== analysisId));
            if (selectedAnalysis?.id === analysisId) {
                setSelectedAnalysis(null);
            }
        } catch (error) {
            console.error('Error deleting analysis:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis History</h1>
                    <p className="text-gray-600">Please sign in to view your analysis history.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your analyses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
                <p className="text-gray-600">View and manage all your CV analyses</p>
            </div>

            {analyses.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No analyses yet</h3>
                    <p className="text-gray-600 mb-6">Your CV analyses will appear here once you complete your first analysis.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Analysis List */}
                    <div className="lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Analyses</h2>
                        <div className="space-y-3">
                            {analyses.map((analysis) => (
                                <div
                                    key={analysis.id}
                                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${selectedAnalysis?.id === analysis.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                    onClick={() => setSelectedAnalysis(analysis)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {analysis.cv_file_name}
                                            </h3>
                                            {analysis.target_position && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {analysis.target_position}
                                                </p>
                                            )}
                                            <div className="flex items-center text-xs text-gray-500 mt-2">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDate(analysis.created_at)}
                                            </div>
                                            <div className="flex items-center mt-2">
                                                <span className={`text-lg font-bold ${getScoreColor(analysis.analysis_result.overallScore)}`}>
                                                    {analysis.analysis_result.overallScore}%
                                                </span>
                                                <span className="text-sm text-gray-600 ml-2">Overall Score</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteAnalysis(analysis.id);
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete analysis"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Analysis Details */}
                    <div className="lg:col-span-2">
                        {selectedAnalysis ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {selectedAnalysis.cv_file_name}
                                        </h2>
                                        <p className="text-gray-600">
                                            Analyzed on {formatDate(selectedAnalysis.created_at)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // TODO: Implement download functionality
                                            console.log('Download analysis');
                                        }}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </button>
                                </div>

                                {/* Overall Score */}
                                <div className="mb-6">
                                    <div className="text-center">
                                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold border-4 ${selectedAnalysis.analysis_result.overallScore >= 80 ? 'bg-green-100 border-green-200' :
                                            selectedAnalysis.analysis_result.overallScore >= 60 ? 'bg-yellow-100 border-yellow-200' :
                                                'bg-red-100 border-red-200'
                                            }`}>
                                            <span className={getScoreColor(selectedAnalysis.analysis_result.overallScore)}>
                                                {selectedAnalysis.analysis_result.overallScore}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mt-3">Overall CV Score</h3>
                                    </div>
                                </div>

                                {/* Analysis Metrics */}
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">ATS Compatibility</h4>
                                        <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis_result.atsCompatibility.score)}`}>
                                            {selectedAnalysis.analysis_result.atsCompatibility.score}%
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Skill Match</h4>
                                        <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis_result.skillMatch.score)}`}>
                                            {selectedAnalysis.analysis_result.skillMatch.score}%
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Experience Match</h4>
                                        <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis_result.experienceMatch.score)}`}>
                                            {selectedAnalysis.analysis_result.experienceMatch.score}%
                                        </div>
                                    </div>
                                </div>

                                {/* Improvement Areas */}
                                {selectedAnalysis.analysis_result.improvementAreas.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Improvement Areas</h3>
                                        <div className="space-y-3">
                                            {selectedAnalysis.analysis_result.improvementAreas.map((area, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-medium text-gray-900">{area.area}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                            area.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                            {area.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{area.description}</p>
                                                    {area.actionItems && area.actionItems.length > 0 && (
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-900 mb-1">Action Items:</h5>
                                                            <ul className="text-sm text-gray-600 space-y-1">
                                                                {area.actionItems.map((item, itemIndex) => (
                                                                    <li key={itemIndex} className="flex items-start">
                                                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                                        {item}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Analysis</h3>
                                <p className="text-gray-600">Choose an analysis from the list to view detailed results.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage; 