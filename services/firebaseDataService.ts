import { db } from '@/firebase/config';
import { DomainData } from '@/store/domainSlice';
import { ResumeData } from '@/store/resumeSlice';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { InterviewReport } from './aiService';

// User Data Interfaces
export interface FirebaseUserData {
  userId: string;
  domainData: DomainData | null;
  resumeData: ResumeData | null;
  reports: InterviewReport[];
  lastUpdated: string;
}

export interface FirebaseInterviewData {
  id: string;
  userId: string;
  domainData: DomainData;
  questions: any[];
  userAnswers: any[];
  report: InterviewReport;
  completedAt: string;
  createdAt: string;
}

export interface FirebaseReportData {
  id: string;
  userId: string;
  report: InterviewReport;
  interviewId: string;
  completedAt: string;
  createdAt: string;
}

// Main Firebase Data Service
export class FirebaseDataService {
  private static instance: FirebaseDataService;

  private constructor() {}

  public static getInstance(): FirebaseDataService {
    if (!FirebaseDataService.instance) {
      FirebaseDataService.instance = new FirebaseDataService();
    }
    return FirebaseDataService.instance;
  }

  // Save complete user data
  async saveUserData(userId: string, userData: Partial<FirebaseUserData>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDataToSave = {
        ...userData,
        userId,
        lastUpdated: new Date().toISOString()
      };
      
      await setDoc(userDocRef, userDataToSave, { merge: true });
      console.log('User data saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving user data to Firebase:', error);
      throw error;
    }
  }

  // Load complete user data
  async loadUserData(userId: string): Promise<FirebaseUserData | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        return {
          userId: data.userId || userId,
          domainData: data.domainData || null,
          resumeData: data.resumeData || null,
          reports: data.reports || [],
          lastUpdated: data.lastUpdated || new Date().toISOString()
        } as FirebaseUserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user data from Firebase:', error);
      return null;
    }
  }

  // Save interview data
  async saveInterview(userId: string, interviewData: Omit<FirebaseInterviewData, 'id' | 'userId'>): Promise<string> {
    try {
      const interviewsRef = collection(db, 'interviews');
      const interviewToSave = {
        ...interviewData,
        userId,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(interviewsRef, interviewToSave);
      console.log('Interview saved to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving interview to Firebase:', error);
      throw error;
    }
  }

  // Load user interviews
  async loadUserInterviews(userId: string): Promise<FirebaseInterviewData[]> {
    try {
      const interviewsRef = collection(db, 'interviews');
      const q = query(
        interviewsRef,
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
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
      
      return interviews;
    } catch (error) {
      console.error('Error loading user interviews from Firebase:', error);
      return [];
    }
  }

  // Save report data
  async saveReport(userId: string, reportData: Omit<FirebaseReportData, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const reportsRef = collection(db, 'reports');
      const reportToSave = {
        ...reportData,
        userId,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(reportsRef, reportToSave);
      console.log('Report saved to Firebase with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error saving report to Firebase:', error);
      throw error;
    }
  }

  // Load user reports
  async loadUserReports(userId: string): Promise<FirebaseReportData[]> {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reports: FirebaseReportData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          reports.push({
            id: doc.id,
            ...data
          } as FirebaseReportData);
        }
      });
      
      return reports;
    } catch (error) {
      console.error('Error loading user reports from Firebase:', error);
      return [];
    }
  }

  // Update user domain data
  async updateUserDomain(userId: string, domainData: DomainData): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        domainData,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log('User domain data updated in Firebase');
    } catch (error) {
      console.error('Error updating user domain in Firebase:', error);
      throw error;
    }
  }

  // Update user resume data
  async updateUserResume(userId: string, resumeData: ResumeData): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        resumeData,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      console.log('User resume data updated in Firebase');
    } catch (error) {
      console.error('Error updating user resume in Firebase:', error);
      throw error;
    }
  }

  // Add report to user's reports array
  async addReportToUser(userId: string, report: InterviewReport): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      let reports: InterviewReport[] = [];
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        reports = data.reports || [];
      }
      
      // Add new report to the beginning of the array
      reports.unshift(report);
      
      // Keep only last 50 reports to prevent document from getting too large
      if (reports.length > 50) {
        reports = reports.slice(0, 50);
      }
      
      await setDoc(userDocRef, {
        reports,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log('Report added to user data in Firebase');
    } catch (error) {
      console.error('Error adding report to user data in Firebase:', error);
      throw error;
    }
  }

  // Clear all user data (for logout)
  async clearUserData(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete user document
      const userDocRef = doc(db, 'users', userId);
      batch.delete(userDocRef);
      
      // Delete all user interviews
      const interviews = await this.loadUserInterviews(userId);
      interviews.forEach(interview => {
        const interviewDocRef = doc(db, 'interviews', interview.id);
        batch.delete(interviewDocRef);
      });
      
      // Delete all user reports
      const reports = await this.loadUserReports(userId);
      reports.forEach(report => {
        const reportDocRef = doc(db, 'reports', report.id);
        batch.delete(reportDocRef);
      });
      
      await batch.commit();
      console.log('All user data cleared from Firebase');
    } catch (error) {
      console.error('Error clearing user data from Firebase:', error);
      throw error;
    }
  }

  // Migrate data from AsyncStorage to Firebase
  async migrateFromAsyncStorage(userId: string, asyncStorageData: any): Promise<void> {
    try {
      console.log('Starting migration from AsyncStorage to Firebase...');
      
      // Migrate domain data
      if (asyncStorageData.domain?.currentDomain) {
        await this.updateUserDomain(userId, asyncStorageData.domain.currentDomain);
      }
      
      // Migrate resume data
      if (asyncStorageData.resume?.currentResume) {
        await this.updateUserResume(userId, asyncStorageData.resume.currentResume);
      }
      
      // Migrate reports
      if (asyncStorageData.interview?.reports && Array.isArray(asyncStorageData.interview.reports)) {
        for (const report of asyncStorageData.interview.reports) {
          await this.addReportToUser(userId, report);
        }
      }
      
      console.log('Migration from AsyncStorage to Firebase completed');
    } catch (error) {
      console.error('Error migrating data from AsyncStorage to Firebase:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseDataService = FirebaseDataService.getInstance();
