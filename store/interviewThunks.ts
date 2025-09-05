import AIService from '@/services/aiService';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './index';

export const generateInterviewQuestions = createAsyncThunk(
  'interview/generateQuestions',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as RootState;
      const { domain, interview } = state;
      
      if (!domain.currentDomain) {
        throw new Error('Domain data is required to generate questions');
      }
      
      if (!interview.level || !interview.numberOfQuestions) {
        throw new Error('Interview level and number of questions are required');
      }

      const aiService = AIService.getInstance();
      
      const questions = await aiService.generateQuestions({
        domainData: domain.currentDomain,
        questionLevel: interview.level,
        numberOfQuestions: interview.numberOfQuestions,
      });

      return questions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions';
      return rejectWithValue(errorMessage);
    }
  }
);

export const generateInterviewReport = createAsyncThunk(
  'interview/generateReport',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { domain, interview } = state;
      
      if (!domain.currentDomain) {
        throw new Error('Domain data is required to generate report');
      }
      
      if (!interview.questions || interview.questions.length === 0) {
        throw new Error('No questions available for report generation');
      }

      if (!interview.userAnswers || interview.userAnswers.length === 0) {
        throw new Error('No user answers available for report generation');
      }

      const aiService = AIService.getInstance();
      
      const report = await aiService.generateInterviewReport({
        questions: interview.questions,
        userAnswers: interview.userAnswers,
        domainData: domain.currentDomain,
        completedAt: new Date(),
      });

      return report;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      return rejectWithValue(errorMessage);
    }
  }
);
