import { FirebaseInterviewData, fetchInterviewById } from '@/services/firebaseInterviewService';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const InterviewDetailsScreen = () => {
  const { interviewId } = useLocalSearchParams();
  const [interview, setInterview] = useState<FirebaseInterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInterview = useCallback(async () => {
    try {
      setLoading(true);
      const interviewData = await fetchInterviewById(interviewId as string);
      if (interviewData) {
        setInterview(interviewData);
      } else {
        Alert.alert('Error', 'Interview not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading interview:', error);
      Alert.alert('Error', 'Failed to load interview details');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    if (interviewId) {
      loadInterview();
    }
  }, [interviewId, loadInterview]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5ca0ffff" />
          <Text style={styles.loadingText}>Loading interview details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!interview) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Interview not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Interview Details</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.interviewInfo}>
            <Text style={styles.interviewTitle}>
              {interview.domainData?.field ? 
                interview.domainData.field.charAt(0).toUpperCase() + interview.domainData.field.slice(1) + ' Interview' :
                'Interview Session'
              }
            </Text>
            <Text style={styles.interviewDate}>{formatDate(interview.completedAt)}</Text>
          </View>
        </View>

        {/* Score Summary */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(interview.report.overallScore) }]}>
              {interview.report.overallScore}/10
            </Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Questions</Text>
            <Text style={styles.scoreValue}>{interview.questions.length}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Answered</Text>
            <Text style={styles.scoreValue}>{interview.userAnswers.length}</Text>
          </View>
        </View>

        {/* Questions and Answers */}
        <View style={styles.questionsContainer}>
          <Text style={styles.sectionTitle}>Questions & Answers</Text>
          {interview.questions.map((question, index) => {
            const userAnswer = interview.userAnswers.find(
              answer => answer.question === question.question
            );
            
            return (
              <View key={index} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Q{index + 1}</Text>
                  <View style={styles.questionMeta}>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) + '20' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
                        {question.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.questionType}>{question.type}</Text>
                  </View>
                </View>
                
                <Text style={styles.questionText}>{question.question}</Text>
                
                {userAnswer ? (
                  <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Your Answer:</Text>
                    <Text style={styles.answerText}>{userAnswer.humanAnswer}</Text>
                  </View>
                ) : (
                  <View style={styles.noAnswerSection}>
                    <MaterialIcons name="help-outline" size={20} color="#9CA3AF" />
                    <Text style={styles.noAnswerText}>No answer provided</Text>
                  </View>
                )}
                
                {question.expectedAnswer && (
                  <View style={styles.expectedAnswerSection}>
                    <Text style={styles.expectedAnswerLabel}>Expected Answer:</Text>
                    <Text style={styles.expectedAnswerText}>{question.expectedAnswer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  interviewInfo: {
    alignItems: 'center',
  },
  interviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  interviewDate: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  questionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5ca0ffff',
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  questionText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  answerSection: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  noAnswerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noAnswerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  expectedAnswerSection: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
  },
  expectedAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  expectedAnswerText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
});

export default InterviewDetailsScreen;
