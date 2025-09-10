import { fetchUserInterviews } from '@/services/firebaseInterviewService';
import { RootState } from '@/store';
import { loadUserProgressFromFirebase } from '@/store/firebaseThunks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface ProgressStatsProps {
  style?: any;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ style }) => {
  const dispatch = useDispatch();
  const progressStats = useSelector((state: RootState) => state.progress.stats);
  const isLoading = useSelector((state: RootState) => state.progress.isLoading);
  const userData = useSelector((state: RootState) => state.auth.user);
  const [hasInterviews, setHasInterviews] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Debug logging
  // console.log('ProgressStats - isLoading:', isLoading);
  // console.log('ProgressStats - progressStats:', progressStats);

  // Check if user has interviews when progress stats are null
  useEffect(() => {
    const checkForInterviews = async () => {
      if (!progressStats && userData?.uid && !isLoading) {
        try {
          const interviews = await fetchUserInterviews(userData.uid);
          setHasInterviews(interviews.length > 0);
          // console.log('Found interviews:', interviews.length);
        } catch (error) {
          console.error('Error checking for interviews:', error);
          setHasInterviews(false);
        }
      }
    };

    checkForInterviews();
  }, [progressStats, userData?.uid, isLoading]);

  // Auto-retry mechanism
  useEffect(() => {
    if (!progressStats && hasInterviews === true && !isLoading && retryCount < 3) {
      const timer = setTimeout(() => {
        // console.log('Auto-retrying progress load...');
        handleRetry();
      }, 3000); // Retry after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [hasInterviews, isLoading, retryCount]);

  const handleRetry = () => {
    // console.log('Retrying progress load...');
    setRetryCount(prev => prev + 1);
    dispatch(loadUserProgressFromFirebase() as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (!progressStats && hasInterviews === false) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noDataText}>Complete your first interview to see progress!</Text>
      </View>
    );
  }

  if (!progressStats && hasInterviews === null) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  // If we have progress stats, use them; otherwise show a message that progress is being calculated
  if (!progressStats && hasInterviews === true) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Calculating your progress...</Text>
        {retryCount > 0 && (
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry ({retryCount})</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FF9800';
    return '#F44336';
  };

  // const getScoreLabel = (score: number) => {
  //   if (score >= 8) return 'Excellent';
  //   if (score >= 6) return 'Good';
  //   return 'Needs Improvement';
  // };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Your Progress</Text>
      
      <View style={styles.statsGrid}>
        {/* Total Interviews */}
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="briefcase" size={24} color="#5b22eb" />
          </View>
          <Text style={styles.statValue}>{progressStats?.totalInterviews ?? '-'}</Text>
          <Text style={styles.statLabel}>Interviews</Text>
        </View>

        {/* Average Score */}
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons
              name="trending-up"
              size={24}
              color={progressStats ? getScoreColor(progressStats.averageScore) : '#666'}
            />
          </View>
          <Text style={[
            styles.statValue,
            { color: progressStats ? getScoreColor(progressStats.averageScore) : '#666' }
          ]}>
            {progressStats ? progressStats.averageScore.toFixed(1) : '-'}
          </Text>
          <Text style={styles.statLabel}>Average Score</Text>
        </View>

        {/* Best Score */}
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
          </View>
          <Text style={[styles.statValue, { color: '#FFD700' }]}>
            {progressStats ? progressStats.bestScore.toFixed(1) : '-'}
          </Text>
          <Text style={styles.statLabel}>Best Score</Text>
        </View>

        {/* Current Streak */}
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="flame" size={24} color="#FF6B35" />
          </View>
          <Text style={[styles.statValue, { color: '#FF6B35' }]}>
            {progressStats?.currentStreak ?? '-'}
          </Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.additionalStat}>
          <Ionicons name="help-circle" size={16} color="#666" />
          <Text style={styles.additionalStatText}>
            {progressStats ? progressStats.totalQuestions : '-'} questions answered
          </Text>
        </View>
        
        <View style={styles.additionalStat}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.additionalStatText}>
            Longest streak: {progressStats ? progressStats.longestStreak : '-'} days
          </Text>
        </View>
      </View>

      {/* Domain Progress */}
      {progressStats && progressStats.domainStats.length > 0 && (
        <View style={styles.domainSection}>
          <Text style={styles.sectionTitle}>Domain Progress</Text>
          {progressStats.domainStats.map((domain, index) => (
            <View key={index} style={styles.domainItem}>
              <Text style={styles.domainName}>{domain.domain}</Text>
              <View style={styles.domainStats}>
                <Text style={styles.domainStat}>{domain.interviews} interviews</Text>
                <Text style={[styles.domainScore, { color: getScoreColor(domain.averageScore) }]}>
                  {domain.averageScore.toFixed(1)} avg
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  additionalStats: {
    marginBottom: 16,
  },
  additionalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalStatText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  domainSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  domainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  domainName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  domainStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainStat: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  domainScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#5ca0ffff',
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProgressStats;
