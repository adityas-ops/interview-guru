import { InterviewQuestion, InterviewReport } from "@/services/aiService";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { generateInterviewQuestions, generateInterviewReport } from "./interviewThunks";

export interface UserAnswer {
    question: string;
    humanAnswer: string;
}

export interface QuestionsDetails {
    level: "easy" | "medium" | "hard";
    numberOfQuestions: number;
    questions: InterviewQuestion[];
    isLoading: boolean;
    error: string | null;
    currentQuestionIndex: number;
    userAnswers: UserAnswer[];
    isSaving: boolean;
    report: InterviewReport | null;
    isGeneratingReport: boolean;
    reportError: string | null;
}

const initialState: QuestionsDetails = {
    level: "easy",
    numberOfQuestions: 0,
    questions: [],
    isLoading: false,
    error: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    isSaving: false,
    report: null,
    isGeneratingReport: false,
    reportError: null
}


const interviewSlice = createSlice({
    name: "interview",
    initialState,
    reducers: {
        setLevel: (state, action: PayloadAction<"easy" | "medium" | "hard">) => {
            state.level = action.payload;
        },
        setNumberOfQuestions: (state, action: PayloadAction<number>) => {
            state.numberOfQuestions = action.payload;
        },
        clearLevel: (state) => {
            state.level = "easy";
        },
        clearNumberOfQuestions: (state) => {
            state.numberOfQuestions = 0;
        },
        setQuestions: (state, action: PayloadAction<InterviewQuestion[]>) => {
            state.questions = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
            state.currentQuestionIndex = action.payload;
        },
        clearQuestions: (state) => {
            state.questions = [];
            state.currentQuestionIndex = 0;
            state.error = null;
        },
        nextQuestion: (state) => {
            if (state.currentQuestionIndex < state.questions.length - 1) {
                state.currentQuestionIndex += 1;
            }
        },
        previousQuestion: (state) => {
            if (state.currentQuestionIndex > 0) {
                state.currentQuestionIndex -= 1;
            }
        },
        saveAnswer: (state, action: PayloadAction<{ questionIndex: number; answer: string }>) => {
            const { questionIndex, answer } = action.payload;
            const question = state.questions[questionIndex];
            if (question) {
                // Ensure userAnswers is initialized as an array
                if (!state.userAnswers) {
                    state.userAnswers = [];
                }
                
                // Remove existing answer for this question if it exists
                // Use trim() and normalize whitespace for better comparison
                const normalizedQuestion = question.question.trim();
                state.userAnswers = state.userAnswers.filter(
                    (userAnswer) => userAnswer.question.trim() !== normalizedQuestion
                );
                
                // Add new answer
                state.userAnswers.push({
                    question: question.question,
                    humanAnswer: answer
                });
                
                // Debug logging to track answer count
                console.log(`Answer saved for question ${questionIndex + 1}/${state.questions.length}. Total answers: ${state.userAnswers.length}`);
            }
        },
        setSaving: (state, action: PayloadAction<boolean>) => {
            state.isSaving = action.payload;
        },
        clearUserAnswers: (state) => {
            state.userAnswers = [];
        },
        initializeUserAnswers: (state) => {
            if (!state.userAnswers) {
                state.userAnswers = [];
            }
        },
        setReport: (state, action: PayloadAction<InterviewReport | null>) => {
            state.report = action.payload;
        },
        setGeneratingReport: (state, action: PayloadAction<boolean>) => {
            state.isGeneratingReport = action.payload;
        },
        setReportError: (state, action: PayloadAction<string | null>) => {
            state.reportError = action.payload;
        },
        clearReport: (state) => {
            state.report = null;
            state.reportError = null;
        },
        clearAllData: (state) => {
            state.level = "easy";
            state.numberOfQuestions = 0;
            state.questions = [];
            state.isLoading = false;
            state.error = null;
            state.currentQuestionIndex = 0;
            state.userAnswers = [];
            state.isSaving = false;
            state.report = null;
            state.isGeneratingReport = false;
            state.reportError = null;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(generateInterviewQuestions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generateInterviewQuestions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.questions = action.payload;
                state.currentQuestionIndex = 0;
                state.error = null;
            })
            .addCase(generateInterviewQuestions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(generateInterviewReport.pending, (state) => {
                state.isGeneratingReport = true;
                state.reportError = null;
            })
            .addCase(generateInterviewReport.fulfilled, (state, action) => {
                state.isGeneratingReport = false;
                state.report = action.payload;
                state.reportError = null;
            })
            .addCase(generateInterviewReport.rejected, (state, action) => {
                state.isGeneratingReport = false;
                state.reportError = action.payload as string;
            });
    }
})

export const { 
    setLevel, 
    setNumberOfQuestions, 
    clearLevel, 
    clearNumberOfQuestions,
    setQuestions,
    setLoading,
    setError,
    setCurrentQuestionIndex,
    clearQuestions,
    nextQuestion,
    previousQuestion,
    saveAnswer,
    setSaving,
    clearUserAnswers,
    initializeUserAnswers,
    setReport,
    setGeneratingReport,
    setReportError,
    clearReport,
    clearAllData
} = interviewSlice.actions;

export default interviewSlice.reducer;
