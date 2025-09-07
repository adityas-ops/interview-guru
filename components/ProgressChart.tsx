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
  
  const firebaseReports = useSelector((state: RootState) => state.firebase.userData?.reports || [], (left, right) => {
    if (left.length !== right.length) return false;
    return left.every((report, index) => 
      report.overallScore === right[index]?.overallScore &&
      report.completedAt === right[index]?.completedAt
    );
  });
  
  const interviewReport = useSelector((state: RootState) => state.interview.report);
  const firebaseDataLoaded = useSelector((state: RootState) => state.firebase.isDataLoaded);

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

  const reports = useMemo(() => {
    if (firebaseReports.length > 0) {
      return firebaseReports;
    }
    if (asyncStorageReports.length > 0) {
      return asyncStorageReports;
    }
    return interviewReport ? [interviewReport] : [];
  }, [firebaseReports, asyncStorageReports, interviewReport]);

  const progressData = useMemo(() => {
    if (reports.length === 0) {
      return {
        averageScore: 0,
        totalInterviews: 0,
        improvementTrend: 0,
        lastScore: 0,
      };
    }

    const sortedReports = [...reports].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const totalScore = sortedReports.reduce((sum, report) => sum + report.overallScore, 0);
    const averageScore = totalScore / sortedReports.length;
    const lastScore = sortedReports[0]?.overallScore || 0;

    let improvementTrend = 0;
    if (sortedReports.length >= 6) {
      const recent3 = sortedReports.slice(0, 3);
      const previous3 = sortedReports.slice(3, 6);
      const recentAvg = recent3.reduce((sum, r) => sum + r.overallScore, 0) / 3;
      const previousAvg = previous3.reduce((sum, r) => sum + r.overallScore, 0) / 3;
      improvementTrend = recentAvg - previousAvg;
    } else if (sortedReports.length >= 2) {
      improvementTrend = sortedReports[0].overallScore - sortedReports[1].overallScore;
    }

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      totalInterviews: sortedReports.length,
      improvementTrend: Math.round(improvementTrend * 10) / 10,
      lastScore: Math.round(lastScore * 10) / 10,
    };
  }, [reports]);

  // New score colors with no yellow: teal, purple, red
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#14B8A6'; // Teal-500
    if (score >= 6) return '#8B5CF6'; // Purple-500
    return '#EF4444'; // Red-600
  };

  const getTrendIcon = () => {
    if (progressData.improvementTrend > 0) return '⬆️';
    if (progressData.improvementTrend < 0) return '⬇️';
    return '➖';
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
          <Text style={[styles.trendIcon, { color: getScoreColor(progressData.improvementTrend >= 0 ? 8 : 4) }]}>
            {getTrendIcon()}
          </Text>
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
              colors={['#14B8A6', '#3B82F6']} // teal to blue gradient
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
    backgroundColor: '#fff', // white background
    borderRadius: 14,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b', // dark slate
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b', // slate gray
    fontWeight: '500',
  },
  progressContainer: {
    gap: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#64748b', // slate gray
    marginBottom: 6,
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  trendIcon: {
    fontSize: 22,
  },
  trendText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155', // dark slate
  },
  trendValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b', // slate gray
  },
  progressBarContainer: {
    gap: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e2e8f0', // light slate
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressBarText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#64748b', // slate gray
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 17,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default ProgressChart;
