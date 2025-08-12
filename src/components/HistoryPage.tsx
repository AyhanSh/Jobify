import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AnalysisResult } from '../types';
import { Calendar, FileText, Eye, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface SavedAnalysis {
    id: string;
    user_id: string;
    cv_file_name: string;
    analysis_result: AnalysisResult;
    created_at: string;
    target_position?: string;
    industry?: string;
    user_preferences?: {
        targetPosition?: string;
        age?: number;
        highestDegree?: string;
        hasOngoingDegree?: boolean;
        ongoingDegree?: string;
        experienceYears?: number;
        industry?: string;
    };
    cv_content?: string;
    detailed_analysis?: {
        atsCompatibility: {
            score: number;
            issues: string[];
            recommendations: string[];
        };
        skillMatch: {
            score: number;
            matchedSkills: string[];
            missingSkills: string[];
            recommendations: string[];
        };
        experienceMatch: {
            score: number;
            strengths: string[];
            gaps: string[];
            recommendations: string[];
        };
        overallScore: number;
        improvementAreas: {
            priority: 'high' | 'medium' | 'low';
            area: string;
            description: string;
            actionItems: string[];
        }[];
    };
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

    const downloadPdf = (analysis: SavedAnalysis) => {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const marginX = 40;
        let cursorY = 50;

        const writeHeader = (text: string, size = 18) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(size);
            doc.text(text, marginX, cursorY);
            cursorY += 24;
        };
        const writeSubheader = (text: string, size = 13) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(size);
            doc.text(text, marginX, cursorY);
            cursorY += 18;
        };
        const writeParagraph = (text: string, size = 11) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(size);
            const lines = doc.splitTextToSize(text, 515);
            doc.text(lines, marginX, cursorY);
            cursorY += 16 + (lines.length - 1) * 14;
        };
        const writeList = (items: string[]) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            items.forEach((item) => {
                const lines = doc.splitTextToSize(`• ${item}`, 515);
                doc.text(lines, marginX, cursorY);
                cursorY += 14 + (lines.length - 1) * 12;
            });
        };
        const addSpacer = (h = 12) => { cursorY += h; };
        const addDivider = () => {
            doc.setDrawColor(220);
            doc.line(marginX, cursorY, 555, cursorY);
            cursorY += 12;
        };
        const ensurePageSpace = (minSpace = 80) => {
            if (cursorY > doc.internal.pageSize.getHeight() - minSpace) {
                doc.addPage();
                cursorY = 50;
            }
        };

        // Title
        writeHeader('CV Analysis Report');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`${analysis.cv_file_name}  |  ${formatDate(analysis.created_at)}`, marginX, cursorY);
        cursorY += 22;
        addDivider();

        // Overview
        writeSubheader('Overview');
        writeParagraph(`Overall Score: ${analysis.analysis_result.overallScore}%`);
        writeParagraph(`Target Position: ${analysis.target_position || 'N/A'}`);
        writeParagraph(`Industry: ${analysis.industry || 'N/A'}`);
        addSpacer();

        // Metrics
        writeSubheader('Key Metrics');
        writeParagraph(`ATS Compatibility: ${analysis.analysis_result.atsCompatibility.score}%`);
        writeParagraph(`Skill Match: ${analysis.analysis_result.skillMatch.score}%`);
        writeParagraph(`Experience Match: ${analysis.analysis_result.experienceMatch.score}%`);
        addDivider();

        // ATS Details
        ensurePageSpace();
        writeSubheader('ATS Compatibility');
        if (analysis.analysis_result.atsCompatibility.issues?.length) {
            writeParagraph('Issues Found:');
            writeList(analysis.analysis_result.atsCompatibility.issues);
            addSpacer();
        }
        if (analysis.analysis_result.atsCompatibility.recommendations?.length) {
            writeParagraph('Recommendations:');
            writeList(analysis.analysis_result.atsCompatibility.recommendations);
            addSpacer();
        }
        addDivider();

        // Skill Match
        ensurePageSpace();
        writeSubheader('Skill Match');
        if (analysis.analysis_result.skillMatch.matchedSkills?.length) {
            writeParagraph('Matched Skills:');
            writeList(analysis.analysis_result.skillMatch.matchedSkills);
            addSpacer();
        }
        if (analysis.analysis_result.skillMatch.missingSkills?.length) {
            writeParagraph('Missing Skills:');
            writeList(analysis.analysis_result.skillMatch.missingSkills);
            addSpacer();
        }
        addDivider();

        // Experience Match
        ensurePageSpace();
        writeSubheader('Experience Match');
        if (analysis.analysis_result.experienceMatch.strengths?.length) {
            writeParagraph('Strengths:');
            writeList(analysis.analysis_result.experienceMatch.strengths);
            addSpacer();
        }
        if (analysis.analysis_result.experienceMatch.gaps?.length) {
            writeParagraph('Gaps:');
            writeList(analysis.analysis_result.experienceMatch.gaps);
            addSpacer();
        }
        if (analysis.analysis_result.experienceMatch.recommendations?.length) {
            writeParagraph('Recommendations:');
            writeList(analysis.analysis_result.experienceMatch.recommendations);
            addSpacer();
        }
        addDivider();

        // Improvement Areas
        ensurePageSpace();
        if (analysis.analysis_result.improvementAreas?.length) {
            writeSubheader('Priority Improvement Areas');
            analysis.analysis_result.improvementAreas.forEach((area, idx) => {
                ensurePageSpace(100);
                writeParagraph(`${idx + 1}. ${area.area} [${area.priority.toUpperCase()}]`);
                writeParagraph(area.description);
                if (area.actionItems?.length) {
                    writeList(area.actionItems);
                }
                addSpacer();
            });
        }

        doc.save(`${analysis.cv_file_name.replace(/\.[^/.]+$/, '')}_analysis.pdf`);
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
        <div className="max-w-8xl pl-4 pr-8 py-6">
            <div className="mb-10">
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
                <div className="grid lg:grid-cols-3 gap-6 xl:gap-8">
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
                    <div className="lg:col-span-2 xl:col-span-2">
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
                                        onClick={() => downloadPdf(selectedAnalysis)}
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

                                {/* Detailed Analysis Breakdown */}
                                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                                    {/* ATS Compatibility Details */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">ATS Compatibility</h3>
                                                <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis_result.atsCompatibility.score)}`}>
                                                    {selectedAnalysis.analysis_result.atsCompatibility.score}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {selectedAnalysis.analysis_result.atsCompatibility.issues.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        Issues Found
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {selectedAnalysis.analysis_result.atsCompatibility.issues.map((issue, index) => (
                                                            <li key={index} className="text-sm text-gray-600 flex items-start">
                                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                                {issue}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {selectedAnalysis.analysis_result.atsCompatibility.recommendations.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                        </svg>
                                                        Recommendations
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {selectedAnalysis.analysis_result.atsCompatibility.recommendations.map((rec, index) => (
                                                            <li key={index} className="text-sm text-gray-600 flex items-start">
                                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                                {rec}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skill Match Details */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Skill Match</h3>
                                                <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis_result.skillMatch.score)}`}>
                                                    {selectedAnalysis.analysis_result.skillMatch.score}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {selectedAnalysis.analysis_result.skillMatch.matchedSkills.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Matched Skills
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedAnalysis.analysis_result.skillMatch.matchedSkills.map((skill, index) => (
                                                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedAnalysis.analysis_result.skillMatch.missingSkills.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        Missing Skills
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedAnalysis.analysis_result.skillMatch.missingSkills.map((skill, index) => (
                                                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Experience Match Details */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="p-3 bg-green-100 rounded-lg mr-4">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Experience Match</h3>
                                                <div className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.analysis_result.experienceMatch.score)}`}>
                                                    {selectedAnalysis.analysis_result.experienceMatch.score}%
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {selectedAnalysis.analysis_result.experienceMatch.strengths.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Strengths
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {selectedAnalysis.analysis_result.experienceMatch.strengths.map((strength, index) => (
                                                            <li key={index} className="text-sm text-gray-600 flex items-start">
                                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                                {strength}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {selectedAnalysis.analysis_result.experienceMatch.gaps.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                        </svg>
                                                        Experience Gaps
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {selectedAnalysis.analysis_result.experienceMatch.gaps.map((gap, index) => (
                                                            <li key={index} className="text-sm text-gray-600 flex items-start">
                                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                                {gap}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis Context */}
                                {selectedAnalysis.user_preferences && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Context</h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Target Position</h4>
                                                    <p className="text-gray-600">{selectedAnalysis.user_preferences.targetPosition || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Industry</h4>
                                                    <p className="text-gray-600">{selectedAnalysis.user_preferences.industry || 'Not specified'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
                                                    <p className="text-gray-600">{selectedAnalysis.user_preferences.experienceYears || 0} years</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                                                    <p className="text-gray-600">
                                                        {selectedAnalysis.user_preferences.highestDegree || 'Not specified'}
                                                        {selectedAnalysis.user_preferences.hasOngoingDegree && selectedAnalysis.user_preferences.ongoingDegree &&
                                                            ` (Currently pursuing: ${selectedAnalysis.user_preferences.ongoingDegree})`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

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