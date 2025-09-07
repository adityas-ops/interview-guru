import { InterviewReport } from '@/services/aiService';
import { RootState } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

interface ProgressChartProps {
  style?: any;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ style }) => {
  const [asyncStorageReports, setAsyncStorageReports] = useState<InterviewReport[]>([]);
  
  // Get reports from Firebase state - use shallow equality to prevent re-renders
  const firebaseReports = useSelector((state: RootState) => state.firebase.userData?.reports || [], (left, right) => {
    if (left.length !== right.length) return false;
    return left.every((report, index) => 
      report.overallScore === right[index]?.overallScore &&
      report.completedAt === right[index]?.completedAt
    );
  });
  
  const interviewReport = useSelector((state: RootState) => state.interview.report);
  const firebaseDataLoaded = useSelector((state: RootState) => state.firebase.isDataLoaded);

  // Load reports from AsyncStorage
  useEffect(() => {
    const loadReports = async () => {
      try {
        const storedReports = await AsyncStorage.getItem('interview_reports');
        if (storedReports) {
          setAsyncStorageReports(JSON.parse(storedReports));
        }
      } catch (error) {
        console.error('Error loading reports from AsyncStorage:', error);
      }
    };
    
    loadReports();
  }, []);

  console.log('firebaseReports', firebaseReports);
  console.log('interviewReport', interviewReport);
  console.log('firebaseDataLoaded', firebaseDataLoaded);
  console.log('asyncStorageReports', asyncStorageReports);

  // Memoize reports to prevent infinite re-renders - check all sources
  const reports = useMemo(() => {
    // Priority: Firebase reports > AsyncStorage reports > current interview report
    if (firebaseReports.length > 0) {
      return firebaseReports;
    }
    if (asyncStorageReports.length > 0) {
      return asyncStorageReports;
    }
    return interviewReport ? [interviewReport] : [];
  }, [firebaseReports, asyncStorageReports, interviewReport]);

  // Memoize the progress data calculation - this is now the only state
  const progressData = useMemo(() => {
    if (reports.length === 0) {
      return {
        averageScore: 0,
        totalInterviews: 0,
        improvementTrend: 0,
        lastScore: 0,
      };
    }

    // Sort reports by completion date (newest first)
    const sortedReports = [...reports].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const totalScore = sortedReports.reduce((sum, report) => sum + report.overallScore, 0);
    const averageScore = totalScore / sortedReports.length;
    const lastScore = sortedReports[0]?.overallScore || 0;

    // Calculate improvement trend (compare last 3 vs previous 3)
    let improvementTrend = 0;
    if (sortedReports.length >= 6) {
      const recent3 = sortedReports.slice(0, 3);
      const previous3 = sortedReports.slice(3, 6);
      const recentAvg = recent3.reduce((sum, r) => sum + r.overallScore, 0) / 3;
      const previousAvg = previous3.reduce((sum, r) => sum + r.overallScore, 0) / 3;
      improvementTrend = recentAvg - previousAvg;
    } else if (sortedReports.length >= 2) {
      const recent = sortedReports[0].overallScore;
      const previous = sortedReports[1].overallScore;
      improvementTrend = recent - previous;
    }

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalInterviews: sortedReports.length,
      improvementTrend: Math.round(improvementTrend * 10) / 10,
      lastScore: Math.round(lastScore * 10) / 10,
    };
  }, [reports]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981'; // Green
    if (score >= 6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getTrendIcon = () => {
    if (progressData.improvementTrend > 0) return '📈';
    if (progressData.improvementTrend < 0) return '📉';
    return '➡️';
  };

  const getTrendText = () => {
    if (progressData.improvementTrend > 0) return 'Improving';
    if (progressData.improvementTrend < 0) return 'Declining';
    return 'Stable';
  };

  if (reports.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Complete your first interview to see your progress!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>{progressData.totalInterviews} interview{progressData.totalInterviews !== 1 ? 's' : ''} completed</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Average Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(progressData.averageScore) }]}>
              {progressData.averageScore}/10
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Latest Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(progressData.lastScore) }]}>
              {progressData.lastScore}/10
            </Text>
          </View>
        </View>

        <View style={styles.trendContainer}>
          <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
          <Text style={styles.trendText}>{getTrendText()}</Text>
          {progressData.improvementTrend !== 0 && (
            <Text style={styles.trendValue}>
              {progressData.improvementTrend > 0 ? '+' : ''}{progressData.improvementTrend}
            </Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={[getScoreColor(progressData.averageScore), getScoreColor(progressData.averageScore) + '80']}
              style={[styles.progressBarFill, { width: `${(progressData.averageScore / 10) * 100}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressBarText}>
            {Math.round((progressData.averageScore / 10) * 100)}% Complete
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    gap: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  trendIcon: {
    fontSize: 20,
  },
  trendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default ProgressChart;
