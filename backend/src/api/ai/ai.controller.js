import catchAsync from '../../utils/catchAsync.js';
import { analyzeResumeWithGemini } from '../../services/ai.service.js';

export const analyzeResume = catchAsync(async (req, res, next) => {
    const { resumeText } = req.body;
    if (!resumeText) {
        return next(new AppError('Resume text is required for analysis.', 400));
    }

    const analysis = await analyzeResumeWithGemini(resumeText);
    
    res.status(200).json({
        status: 'success',
        data: {
            analysis,
        },
    });
});