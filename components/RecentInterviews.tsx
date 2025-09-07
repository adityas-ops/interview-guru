import { FirebaseInterviewData, fetchUserInterviews } from '@/services/firebaseInterviewService';
import { RootState } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

interface RecentInterviewsProps {
  style?: any;
}

const RecentInterviews: React.FC<RecentInterviewsProps> = ({ style }) => {
  const [interviews, setInterviews] = useState<FirebaseInterviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const userData = useSelector((state: RootState) => state.auth.user);
  const firebaseDataLoaded = useSelector((state: RootState) => state.firebase.isDataLoaded);

  // Function to clean up duplicate answers
  const cleanDuplicateAnswers = (interview: FirebaseInterviewData) => {
    if (!interview.userAnswers || interview.userAnswers.length === 0) {
      return interview;
    }

    const uniqueAnswers = [];
    const seenQuestions = new Set();

    for (const answer of interview.userAnswers) {
      const normalizedQuestion = answer.question.trim();
      if (!seenQuestions.has(normalizedQuestion)) {
        seenQuestions.add(normalizedQuestion);
        uniqueAnswers.push(answer);
      }
    }

    return {
      ...interview,
      userAnswers: uniqueAnswers
    };
  };

  const loadInterviews = useCallback(async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const userInterviews = await fetchUserInterviews(userData.uid);
      console.log('Loaded interviews:', userInterviews);
      userInterviews.forEach((interview, index) => {
        console.log(`Interview ${index}:`, {
          id: interview.id,
          questionsCount: interview.questions?.length || 0,
          answersCount: interview.userAnswers?.length || 0,
          questions: interview.questions?.map(q => q.question).slice(0, 3), // First 3 questions
          answers: interview.userAnswers?.map(a => a.question).slice(0, 3), // First 3 answers
          allAnswers: interview.userAnswers?.map(a => ({
            question: a.question,
            answer: a.humanAnswer?.substring(0, 50) + '...' // First 50 chars of answer
          }))
        });
        
        // Check for duplicate questions in answers
        if (interview.userAnswers && interview.userAnswers.length > 0) {
          const questionCounts: { [key: string]: number } = {};
          interview.userAnswers.forEach(answer => {
            const question = answer.question.trim();
            questionCounts[question] = (questionCounts[question] || 0) + 1;
          });
          
          const duplicates = Object.entries(questionCounts).filter(([_, count]) => (count as number) > 1);
          if (duplicates.length > 0) {
            console.warn(`Found duplicate answers for questions:`, duplicates);
          }
        }
      });
      
      // Clean up duplicate answers and show only last 3 interviews
      const cleanedInterviews = userInterviews.map(cleanDuplicateAnswers);
      setInterviews(cleanedInterviews.slice(0, 3));
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.uid && firebaseDataLoaded) {
      loadInterviews();
    }
  }, [userData?.uid, firebaseDataLoaded, loadInterviews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const handleInterviewPress = (interview: FirebaseInterviewData) => {
    router.push({
      pathname: '/interviewDetails',
      params: {
        interviewId: interview.id
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Interviews</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#5ca0ffff" />
          <Text style={styles.loadingText}>Loading interviews...</Text>
        </View>
      </View>
    );
  }

  if (interviews.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Interviews</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons name="quiz" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No interviews completed yet</Text>
          <Text style={styles.emptySubtext}>Complete your first interview to see it here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Interviews</Text>
        {/* <TouchableOpacity onPress={() => router.push('/(tabs)/report')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity> */}
      </View>

      <View
      >
        {interviews.map((interview, index) => (
          <View
            key={interview.id}
            style={styles.interviewCard}
            // onPress={() => handleInterviewPress(interview)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.interviewTitle}>
                {interview.domainData?.field ? 
                  interview.domainData.field.charAt(0).toUpperCase() + interview.domainData.field.slice(1) + ' Interview' :
                  'Interview Session'
                }
              </Text>
              <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(interview.report.overallScore) + '20' }]}>
                <Text style={[styles.scoreText, { color: getScoreColor(interview.report.overallScore) }]}>
                  {interview.report.overallScore}/10
                </Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <MaterialIcons name="schedule" size={16} color="#6B7280" />
                <Text style={styles.infoText}>{formatDate(interview.completedAt)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MaterialIcons name="quiz" size={16} color="#6B7280" />
                <Text style={styles.infoText}>{interview.questions.length} questions</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MaterialIcons name="check-circle" size={16} color="#6B7280" />
                <Text style={styles.infoText}>{interview.userAnswers.length} answered</Text>
              </View>
            </View>

            <TouchableOpacity 
               onPress={() => handleInterviewPress(interview)}
             style={styles.cardFooter}>
              <Text style={styles.tapToViewText}>Tap to view details</Text>
              <MaterialIcons name="arrow-forward-ios" size={14} color="#1b30f6ff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'white',
    // borderRadius: 12,
    // padding: 20,
    // marginBottom: 20,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginTop:20
  },
  viewAllText: {
    fontSize: 14,
    color: '#5ca0ffff',
    fontWeight: '600',
  },
  scrollContent: {
    paddingRight: 20,
    width:"100%",
    flex:1
  },
  interviewCard: {
    width: "100%",
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom:15
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  interviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    marginBottom: 12,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    gap:15
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tapToViewText: {
    fontSize: 14,
    color: '#1b30f6ff',
    fontWeight:600
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RecentInterviews;
