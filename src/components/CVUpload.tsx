import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { CVData } from '../types';

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
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // For demo purposes, we'll use the raw text
        // In production, you'd want to use a proper PDF/DOC parser
        resolve(text || `CV Content from ${file.name}\n\nThis is a demo implementation. In production, the actual CV content would be extracted from the PDF/DOC file using appropriate parsing libraries.`);
      };
      reader.readAsText(file);
    });
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your CV</h2>
        <p className="text-lg text-gray-600">
          Upload your CV to get started with AI-powered ChatGPT analysis
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
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
                {uploading ? 'Processing your CV...' : 'Drop your CV here'}
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
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Continue to Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVUpload;