import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// ai.service.js

const resumeAnalysisPrompt = `
You are a career advisor and expert ATS evaluator.

{{ANALYSIS_CONTEXT}}

Analyze the resume text below:

---
{{RESUME_TEXT}}
---

Tasks:
1. List strengths
2. List weaknesses
3. Suggest improvements
4. Give a matchScore if applicable

Respond only in JSON:
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": ["..."],
  "matchScore": 0
}
`;

// This is the new, robust function for scoring a resume PDF against a job description.
// It uses the Gemini Vision model, which is designed for file analysis.
export const scoreResumePdfWithGemini = async (resumeUrl, jobDescription) => {
    try {
        console.log("Downloading resume from:", resumeUrl);
        const response = await axios.get(resumeUrl, {
            responseType: 'arraybuffer',
        });

        const base64Resume = Buffer.from(response.data).toString('base64');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI-powered Applicant Tracking System (ATS).

Your job is to check how well the attached resume matches the job description below.

If the resume is relevant to the role, give it a higher score.

If it’s unrelated, give it a low score.

Example Response: {"score": 85}


Job Description:
---
${jobDescription}
---`;

        const filePart = {
            inlineData: {
                data: base64Resume,
                mimeType: 'application/pdf',
            },
        };

        const result = await model.generateContent([ { text: prompt }, filePart ]);
        const text = await result.response.text();
        const json = JSON.parse(text.replace(/```json|```/g, '').trim());
        return json.score;

    } catch (err) {
        console.error('AI Screening failed:', err);
        return 0;
    }
};

/**
 * Function to analyze a resume and give strengths, weaknesses, suggestions.
 * If a user query (job description or role) is provided, it will tailor the feedback.
 */
export const analyzeResumeWithGemini = async (resumeText, userQuery) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const analysisContext = userQuery && userQuery.trim() !== ''
            ? `The user has provided a specific query. Analyze the resume based on this job description or question: "${userQuery}"`
            : "The user has not provided a specific query. Perform a general analysis of the resume's overall quality, clarity, and impact.";

        const populatedPrompt = resumeAnalysisPrompt
            .replace('{{ANALYSIS_CONTEXT}}', analysisContext)
            .replace('{{RESUME_TEXT}}', resumeText);

        const result = await model.generateContent(populatedPrompt);
        const response = await result.response;
        const text = await response.text();

        const jsonResponse = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
        return jsonResponse;

    } catch (error) {
        console.error("Error analyzing resume with Gemini:", error);
        throw new Error("Failed to get analysis from AI service.");
    }
};
