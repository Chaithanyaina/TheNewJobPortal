import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

// PDF.js worker configuration
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


const ResumeAnalyzerPage = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [analysis, setAnalysis] = useState(null);

    const mutation = useMutation({
        mutationFn: (resumeText) => axiosInstance.post('/ai/analyze-resume', { resumeText }),
        onSuccess: ({ data }) => {
            setAnalysis(data.data.analysis);
            toast.success("Analysis complete!");
        },
        onError: () => {
            toast.error("Failed to analyze resume. Please try again.");
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            setFileName(file.name);
            setAnalysis(null); // Reset previous analysis
        } else {
            toast.error("Please select a PDF file.");
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile) {
            toast.error("Please upload a resume first.");
            return;
        }
        
        const reader = new FileReader();
        reader.readAsArrayBuffer(resumeFile);
        reader.onload = async (event) => {
            try {
                const pdf = await pdfjsLib.getDocument(event.target.result).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(' ');
                }
                mutation.mutate(fullText);
            } catch (error) {
                toast.error("Could not read text from PDF.");
                console.error("PDF parsing error:", error);
            }
        };
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold">AI Resume Analyzer</h1>
                <p className="text-lg text-text-secondary mt-2">Get instant feedback on your resume to stand out to recruiters.</p>
            </div>

            <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-gray-200">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400"/>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PDF only (MAX. 5MB)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                </div>
                {fileName && <p className="text-center mt-4 text-text-secondary">Selected: <span className="font-semibold">{fileName}</span></p>}
                
                <Button onClick={handleAnalyze} isLoading={mutation.isPending} className="mt-6">
                    {mutation.isPending ? 'Analyzing...' : 'Analyze My Resume'}
                </Button>
            </div>

            {mutation.isSuccess && analysis && (
                <div className="max-w-4xl mx-auto mt-10 space-y-8">
                    {/* Strengths */}
                    <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-3"><CheckCircle className="text-green-500"/> Strengths</h2>
                        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700 bg-green-50 p-6 rounded-lg">
                            {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    {/* Weaknesses */}
                    <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-3"><XCircle className="text-red-500"/> Areas for Improvement</h2>
                        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700 bg-red-50 p-6 rounded-lg">
                            {analysis.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     {/* Suggestions */}
                    <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-3"><Lightbulb className="text-yellow-500"/> Suggestions</h2>
                        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700 bg-yellow-50 p-6 rounded-lg">
                            {analysis.suggestions.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzerPage;