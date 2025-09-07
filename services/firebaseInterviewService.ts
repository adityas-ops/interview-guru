import { db } from '@/firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { InterviewReport } from './aiService';

export interface FirebaseInterviewData {
  id: string;
  userId: string;
  domainData: any;
  questions: any[];
  userAnswers: any[];
  report: InterviewReport;
  completedAt: string;
  createdAt: string;
}

export const fetchUserInterviews = async (userId: string): Promise<FirebaseInterviewData[]> => {
  try {
    if (!userId) {
      console.warn('No userId provided to fetchUserInterviews');
      return [];
    }

    const interviewsRef = collection(db, 'interviews');
    const q = query(
      interviewsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const interviews: FirebaseInterviewData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        interviews.push({
          id: doc.id,
          ...data
        } as FirebaseInterviewData);
      }
    });
    
    // Sort by completedAt in descending order (newest first)
    return interviews.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching user interviews:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

export const fetchInterviewById = async (interviewId: string): Promise<FirebaseInterviewData | null> => {
  try {
    if (!interviewId) {
      console.warn('No interviewId provided to fetchInterviewById');
      return null;
    }

    const interviewRef = doc(db, 'interviews', interviewId);
    const interviewSnap = await getDoc(interviewRef);
    
    if (interviewSnap.exists()) {
      const data = interviewSnap.data();
      if (data) {
        return {
          id: interviewSnap.id,
          ...data
        } as FirebaseInterviewData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching interview by ID:', error);
    return null; // Return null instead of throwing to prevent app crashes
  }
};
