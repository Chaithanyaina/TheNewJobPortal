import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Upload, CheckCircle, XCircle, Lightbulb, Bot } from 'lucide-react';
import Button from '../components/common/Button';

// PDF.js worker configuration
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


const ResumeAnalyzerPage = () => {
    const [resumeFile, setResumeFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [userQuery, setUserQuery] = useState(''); // State for the user's custom query

    const mutation = useMutation({
        mutationFn: ({ resumeText, query }) => axiosInstance.post('/ai/analyze-resume', { resumeText, userQuery: query }),
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
            setAnalysis(null);
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
                mutation.mutate({ resumeText: fullText, query: userQuery });
            } catch (error) {
                toast.error("Could not read text from PDF.");
            }
        };
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <Bot size={48} className="mx-auto text-primary"/>
                <h1 className="text-4xl font-bold mt-4">AI-Powered Career Coach</h1>
                <p className="text-lg text-text-secondary mt-2">Get instant, personalized feedback on your resume.</p>
            </div>

            <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2">1. Upload Your Resume</h2>
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-gray-200">
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="w-8 h-8 mb-2 text-gray-400"/>
                            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                    {fileName && <p className="text-center mt-2 text-sm text-text-secondary">Selected: <span className="font-semibold">{fileName}</span></p>}
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold mb-2">2. Add Context (Optional)</h2>
                    <textarea 
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Paste a job description or ask a question, like 'Is my resume strong for a junior developer role?'"
                        className="w-full h-32 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                <Button onClick={handleAnalyze} isLoading={mutation.isPending} className="w-full">
                    {mutation.isPending ? 'Analyzing...' : 'Analyze My Resume'}
                </Button>
            </div>

            {mutation.isSuccess && analysis && (
                <div className="max-w-4xl mx-auto mt-10 space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-3"><CheckCircle className="text-green-500"/> Strengths</h2>
                        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700 bg-green-50 p-6 rounded-lg">
                            {analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold flex items-center gap-3"><XCircle className="text-red-500"/> Areas for Improvement</h2>
                        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700 bg-red-50 p-6 rounded-lg">
                            {analysis.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
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