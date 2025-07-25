import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This is our new, more intelligent prompt.
// It instructs the AI on how to behave differently if a user query is provided.
const resumeAnalysisPrompt = `
You are an expert technical recruiter and career coach with 20 years of experience.
Your task is to analyze the following resume text.

**Analysis Context:**
{{ANALYSIS_CONTEXT}}

**Instructions:**
Return your feedback ONLY as a valid JSON object. Do not include any text or markdown before or after the JSON.
The JSON object must have these three properties:
1.  "strengths": An array of 3 to 5 strings, highlighting what the resume does well in relation to the provided context.
2.  "weaknesses": An array of 3 to 5 strings, identifying areas for improvement based on the context.
3.  "suggestions": An array of 3 to 5 strings, offering concrete, actionable advice to better align the resume with the context.

Here is the resume text to analyze:
---
{{RESUME_TEXT}}
---
`;

export const analyzeResumeWithGemini = async (resumeText, userQuery) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Dynamically create the context for the prompt.
        let analysisContext;
        if (userQuery && userQuery.trim() !== '') {
            analysisContext = `The user has provided a specific query. Analyze the resume based on this job description or question: "${userQuery}"`;
        } else {
            analysisContext = "The user has not provided a specific query. Perform a general analysis of the resume's overall quality, clarity, and impact.";
        }

        // Populate the prompt with the resume text and the context.
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