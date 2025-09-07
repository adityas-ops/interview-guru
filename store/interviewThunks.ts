import { db } from '@/firebase/config';
import AIService from '@/services/aiService';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { addDoc, collection } from 'firebase/firestore';
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

export const saveInterviewToFirebase = createAsyncThunk(
  'interview/saveToFirebase',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { domain, interview, auth } = state;
      
      if (!auth.user?.uid) {
        throw new Error('User not authenticated');
      }
      
      if (!domain.currentDomain) {
        throw new Error('Domain data is required');
      }
      
      if (!interview.questions || interview.questions.length === 0) {
        throw new Error('No questions available');
      }

      if (!interview.report) {
        throw new Error('No report available');
      }

      const interviewData = {
        userId: auth.user.uid,
        domainData: domain.currentDomain,
        questions: interview.questions,
        userAnswers: interview.userAnswers || [],
        report: interview.report,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      console.log('Saving interview to Firebase:', {
        questionsCount: interviewData.questions?.length || 0,
        answersCount: interviewData.userAnswers?.length || 0,
        questions: interviewData.questions?.map(q => q.question).slice(0, 3),
        answers: interviewData.userAnswers?.map(a => a.question).slice(0, 3)
      });

      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      
      return { id: docRef.id, ...interviewData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save interview to Firebase';
      return rejectWithValue(errorMessage);
    }
  }
);
