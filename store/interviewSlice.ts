import { InterviewQuestion } from "@/services/aiService";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { generateInterviewQuestions } from "./interviewThunks";

export interface QuestionsDetails {
    level: "easy" | "medium" | "hard";
    numberOfQuestions: number;
    questions: InterviewQuestion[];
    isLoading: boolean;
    error: string | null;
    currentQuestionIndex: number;
}

const initialState: QuestionsDetails = {
    level: "easy",
    numberOfQuestions: 0,
    questions: [],
    isLoading: false,
    error: null,
    currentQuestionIndex: 0
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
    previousQuestion
} = interviewSlice.actions;

export default interviewSlice.reducer;
