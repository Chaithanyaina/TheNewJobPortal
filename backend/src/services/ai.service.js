import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The prompt is the "brain" of our AI feature. We instruct it to act as a career coach
// and to return a specific JSON structure, which makes it easy to use on the frontend.
const resumeAnalysisPrompt = `
You are an expert technical recruiter and career coach with 20 years of experience.
Your task is to analyze the following resume text and provide feedback.
Return your feedback ONLY as a valid JSON object. Do not include any text or markdown before or after the JSON.
The JSON object must have these three properties:
1.  "strengths": An array of 3 to 5 strings, highlighting what the resume does well (e.g., "Excellent use of action verbs," "Clear, quantifiable achievements").
2.  "weaknesses": An array of 3 to 5 strings, identifying areas for improvement (e.g., "The summary is a bit generic," "Lacks specific metrics for project impacts").
3.  "suggestions": An array of 3 to 5 strings, offering concrete, actionable advice (e.g., "Add a 'Projects' section to showcase your work," "Quantify your achievements, for example, 'improved performance by 20%' instead of just 'improved performance'").

Here is the resume text:
---
{{RESUME_TEXT}}
---
`;

export const analyzeResumeWithGemini = async (resumeText) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const promptWithText = resumeAnalysisPrompt.replace('{{RESUME_TEXT}}', resumeText);

        const result = await model.generateContent(promptWithText);
        const response = await result.response;
        const text = await response.text();

        // Clean the response to ensure it's valid JSON
        const jsonResponse = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''));
        return jsonResponse;

    } catch (error) {
        console.error("Error analyzing resume with Gemini:", error);
        throw new Error("Failed to get analysis from AI service.");
    }
};