import catchAsync from '../../utils/catchAsync.js';
import { analyzeResumeWithGemini } from '../../services/ai.service.js';
import AppError from '../../utils/AppError.js';

export const analyzeResume = catchAsync(async (req, res, next) => {
    // Now accepts both resumeText and an optional userQuery
    const { resumeText, userQuery } = req.body;

    if (!resumeText) {
        return next(new AppError('Resume text is required for analysis.', 400));
    }

    const analysis = await analyzeResumeWithGemini(resumeText, userQuery);
    
    res.status(200).json({
        status: 'success',
        data: {
            analysis,
        },
    });
});