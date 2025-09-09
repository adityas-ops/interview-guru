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

// Progress Data Interfaces
export interface UserProgress {
  userId: string;
  totalInterviews: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  lastInterviewDate: string | null;
  domainProgress: {
    [domain: string]: {
      interviewsCompleted: number;
      averageScore: number;
      lastInterviewDate: string;
    };
  };
  difficultyProgress: {
    easy: { completed: number; averageScore: number };
    medium: { completed: number; averageScore: number };
    hard: { completed: number; averageScore: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  interviewScore: number;
  questionsAnswered: number;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completedAt: string;
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

  // Progress Management Methods
  
  // Get user progress data
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progressDocRef = doc(db, 'progress', userId);
      const progressDocSnap = await getDoc(progressDocRef);
      
      if (progressDocSnap.exists()) {
        return progressDocSnap.data() as UserProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  // Initialize user progress (called when user first completes an interview)
  async initializeUserProgress(userId: string): Promise<void> {
    try {
      const initialProgress: UserProgress = {
        userId,
        totalInterviews: 0,
        totalQuestionsAnswered: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastInterviewDate: null,
        domainProgress: {},
        difficultyProgress: {
          easy: { completed: 0, averageScore: 0 },
          medium: { completed: 0, averageScore: 0 },
          hard: { completed: 0, averageScore: 0 }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const progressDocRef = doc(db, 'progress', userId);
      await setDoc(progressDocRef, initialProgress);
      console.log('User progress initialized');
    } catch (error) {
      console.error('Error initializing user progress:', error);
      throw error;
    }
  }

  // Update user progress after completing an interview
  async updateUserProgress(userId: string, progressUpdate: ProgressUpdate): Promise<void> {
    try {
      console.log('updateUserProgress called with:', { userId, progressUpdate });
      const progressDocRef = doc(db, 'progress', userId);
      const progressDocSnap = await getDoc(progressDocRef);
      
      let currentProgress: UserProgress;
      
      if (progressDocSnap.exists()) {
        currentProgress = progressDocSnap.data() as UserProgress;
      } else {
        // Initialize progress if it doesn't exist
        await this.initializeUserProgress(userId);
        const newProgressDocSnap = await getDoc(progressDocRef);
        currentProgress = newProgressDocSnap.data() as UserProgress;
      }

      // Calculate new values
      const newTotalInterviews = currentProgress.totalInterviews + 1;
      const newTotalQuestions = currentProgress.totalQuestionsAnswered + progressUpdate.questionsAnswered;
      const newAverageScore = ((currentProgress.averageScore * currentProgress.totalInterviews) + progressUpdate.interviewScore) / newTotalInterviews;
      const newBestScore = Math.max(currentProgress.bestScore, progressUpdate.interviewScore);
      
      // Calculate streak (simplified - assumes interviews are completed on consecutive days)
      const lastInterviewDate = currentProgress.lastInterviewDate ? new Date(currentProgress.lastInterviewDate) : null;
      const currentDate = new Date(progressUpdate.completedAt);
      const daysDifference = lastInterviewDate ? Math.floor((currentDate.getTime() - lastInterviewDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      let newCurrentStreak = currentProgress.currentStreak;
      if (daysDifference === 1) {
        newCurrentStreak += 1;
      } else if (daysDifference > 1) {
        newCurrentStreak = 1;
      }
      // If daysDifference === 0, keep current streak (same day)
      
      const newLongestStreak = Math.max(currentProgress.longestStreak, newCurrentStreak);

      // Update domain progress
      const domainKey = progressUpdate.domain;
      const currentDomainProgress = currentProgress.domainProgress[domainKey] || {
        interviewsCompleted: 0,
        averageScore: 0,
        lastInterviewDate: progressUpdate.completedAt
      };
      
      const newDomainInterviews = currentDomainProgress.interviewsCompleted + 1;
      const newDomainAverage = ((currentDomainProgress.averageScore * currentDomainProgress.interviewsCompleted) + progressUpdate.interviewScore) / newDomainInterviews;

      // Update difficulty progress
      const difficultyKey = progressUpdate.difficulty;
      const currentDifficultyProgress = currentProgress.difficultyProgress[difficultyKey];
      const newDifficultyCompleted = currentDifficultyProgress.completed + 1;
      const newDifficultyAverage = ((currentDifficultyProgress.averageScore * currentDifficultyProgress.completed) + progressUpdate.interviewScore) / newDifficultyCompleted;

      // Create updated progress
      const updatedProgress: UserProgress = {
        ...currentProgress,
        totalInterviews: newTotalInterviews,
        totalQuestionsAnswered: newTotalQuestions,
        averageScore: Math.round(newAverageScore * 10) / 10, // Round to 1 decimal place
        bestScore: newBestScore,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastInterviewDate: progressUpdate.completedAt,
        domainProgress: {
          ...currentProgress.domainProgress,
          [domainKey]: {
            interviewsCompleted: newDomainInterviews,
            averageScore: Math.round(newDomainAverage * 10) / 10,
            lastInterviewDate: progressUpdate.completedAt
          }
        },
        difficultyProgress: {
          ...currentProgress.difficultyProgress,
          [difficultyKey]: {
            completed: newDifficultyCompleted,
            averageScore: Math.round(newDifficultyAverage * 10) / 10
          }
        },
        updatedAt: new Date().toISOString()
      };

      await setDoc(progressDocRef, updatedProgress);
      console.log('User progress updated successfully:', updatedProgress);
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  // Get progress statistics for dashboard
  async getProgressStats(userId: string): Promise<{
    totalInterviews: number;
    averageScore: number;
    bestScore: number;
    currentStreak: number;
    longestStreak: number;
    totalQuestions: number;
    domainStats: Array<{
      domain: string;
      interviews: number;
      averageScore: number;
    }>;
    difficultyStats: {
      easy: { completed: number; averageScore: number };
      medium: { completed: number; averageScore: number };
      hard: { completed: number; averageScore: number };
    };
  } | null> {
    try {
      const progress = await this.getUserProgress(userId);
      
      if (!progress) {
        // If no progress data exists, try to calculate from existing interviews
        console.log('No progress data found, calculating from existing interviews...');
        return await this.calculateProgressFromInterviews(userId);
      }

      const domainStats = Object.entries(progress.domainProgress).map(([domain, stats]) => ({
        domain,
        interviews: stats.interviewsCompleted,
        averageScore: stats.averageScore
      }));

      return {
        totalInterviews: progress.totalInterviews,
        averageScore: progress.averageScore,
        bestScore: progress.bestScore,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        totalQuestions: progress.totalQuestionsAnswered,
        domainStats,
        difficultyStats: progress.difficultyProgress
      };
    } catch (error) {
      console.error('Error getting progress stats:', error);
      throw error;
    }
  }

  // Calculate progress stats from existing interviews
  async calculateProgressFromInterviews(userId: string): Promise<{
    totalInterviews: number;
    averageScore: number;
    bestScore: number;
    currentStreak: number;
    longestStreak: number;
    totalQuestions: number;
    domainStats: Array<{
      domain: string;
      interviews: number;
      averageScore: number;
    }>;
    difficultyStats: {
      easy: { completed: number; averageScore: number };
      medium: { completed: number; averageScore: number };
      hard: { completed: number; averageScore: number };
    };
  } | null> {
    try {
      // Import fetchUserInterviews here to avoid circular dependency
      const { fetchUserInterviews } = await import('./firebaseInterviewService');
      const interviews = await fetchUserInterviews(userId);
      
      if (interviews.length === 0) {
        return null;
      }

      // Calculate basic stats
      const totalInterviews = interviews.length;
      const totalQuestions = interviews.reduce((sum, interview) => sum + (interview.userAnswers?.length || 0), 0);
      const scores = interviews.map(interview => interview.report?.overallScore || 0);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const bestScore = Math.max(...scores);

      // Calculate domain stats
      const domainMap = new Map<string, { interviews: number; totalScore: number }>();
      interviews.forEach(interview => {
        const domain = interview.domainData?.field || 'unknown';
        const score = interview.report?.overallScore || 0;
        
        if (domainMap.has(domain)) {
          const existing = domainMap.get(domain)!;
          existing.interviews += 1;
          existing.totalScore += score;
        } else {
          domainMap.set(domain, { interviews: 1, totalScore: score });
        }
      });

      const domainStats = Array.from(domainMap.entries()).map(([domain, stats]) => ({
        domain,
        interviews: stats.interviews,
        averageScore: stats.totalScore / stats.interviews
      }));

      // Calculate streaks (simplified - consecutive days with interviews)
      const sortedDates = interviews
        .map(interview => new Date(interview.completedAt))
        .sort((a, b) => b.getTime() - a.getTime());
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const daysDiff = Math.floor((sortedDates[i-1].getTime() - sortedDates[i].getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            tempStreak += 1;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      currentStreak = tempStreak;

      // Default difficulty stats (since we don't have difficulty data in interviews)
      const difficultyStats = {
        easy: { completed: 0, averageScore: 0 },
        medium: { completed: 0, averageScore: 0 },
        hard: { completed: 0, averageScore: 0 }
      };

      return {
        totalInterviews,
        averageScore,
        bestScore,
        currentStreak,
        longestStreak,
        totalQuestions,
        domainStats,
        difficultyStats
      };
    } catch (error) {
      console.error('Error calculating progress from interviews:', error);
      return null;
    }
  }
}

// Export singleton instance
export const firebaseDataService = FirebaseDataService.getInstance();
