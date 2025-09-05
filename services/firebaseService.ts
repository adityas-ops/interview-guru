import { db } from '@/firebase/config';
import { UserAnswer } from '@/store/interviewSlice';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface InterviewResult {
  userId: string;
  userAnswers: UserAnswer[];
  completedAt: any; // Firestore timestamp
  totalQuestions: number;
  level: string;
}

export const saveInterviewResult = async (interviewResult: InterviewResult): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'interviewResults'), {
      ...interviewResult,
      completedAt: serverTimestamp(),
    });
    console.log('Interview result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving interview result:', error);
    throw error;
  }
};
