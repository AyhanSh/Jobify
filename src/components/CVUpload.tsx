import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { CVData } from '../types';
import { useAuth } from '../contexts/AuthContext';

import * as pdfjsLib from 'pdfjs-dist/build/pdf';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

interface CVUploadProps {
  onCVUpload: (cvData: CVData) => void;
  onNext: () => void;
}

const CVUpload: React.FC<CVUploadProps> = ({ onCVUpload, onNext }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<CVData | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const { signInWithGoogle, loading, user } = useAuth();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  }, []);

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      // Extract text from PDF using pdfjs-dist
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    } else {
      // Fallback for text and doc files (existing logic)
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text || `CV Content from ${file.name}\n\nThis is a demo implementation. In production, the actual CV content would be extracted from the PDF/DOC file using appropriate parsing libraries.`);
        };
        reader.readAsText(file);
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain') {

      setUploading(true);

      try {
        // Extract text content from file
        const content = await extractTextFromFile(file);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        const cvData: CVData = {
          fileName: file.name,
          content: content,
          uploadDate: new Date()
        };

        setUploadedFile(cvData);
        onCVUpload(cvData);
        setUploading(false);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please try again.');
        setUploading(false);
      }
    } else {
      alert('Please upload a PDF, Word document, or text file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your CV ✅</h2>
        <p className="text-lg text-gray-600">
          Upload your CV so we can know how to save you from unemployment
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 w-full">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {uploading ? 'Processing your CV...' : 'Drop your CV here ⬇️'}
              </h3>
              <p className="text-gray-600">
                {uploading ? 'Please wait while we process your document' : 'or click to browse files'}
              </p>
            </div>

            {uploading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer transition-all duration-200 transform hover:scale-105"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">CV Uploaded Successfully!</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-gray-700">
                <FileText className="w-5 h-5 mr-2" />
                <span className="font-medium">{uploadedFile.fileName}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Uploaded on {uploadedFile.uploadDate.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onNext}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Continue to Preferences ➡️
            </button>
          </div>
        )}
      </div>

      {/* OR separator and Google sign-in button */}
      {!uploadedFile && !user && (
        <>
          <div className="flex items-center w-full my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-400 font-medium">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </>
      )}
    </div>
  );
};

export default CVUpload;