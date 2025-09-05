import LearningWebView from '@/components/LearningWebView';
import { InterviewReport } from '@/services/aiService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReportDetailsScreen = () => {
  const router = useRouter();
  const { reportData } = useLocalSearchParams<{ reportData: string }>();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  // Parse the report data from the route params
  const report: InterviewReport = reportData ? JSON.parse(reportData) : null;

  if (!report) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Report not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const handleLinkPress = (url: string, title: string) => {
    setSelectedUrl(url);
    setSelectedTitle(title);
  };

  const handleCloseWebView = () => {
    setSelectedUrl(null);
    setSelectedTitle('');
  };

  if (selectedUrl) {
    return (
      <LearningWebView
        url={selectedUrl}
        title={selectedTitle}
      />
    );
  }

  const renderSuggestion = (suggestion: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.suggestionCard}
      onPress={() => handleLinkPress(suggestion.learningUrl, suggestion.urlTitle)}
    >
      <View style={styles.suggestionHeader}>
        <Text style={styles.suggestionTopic}>{suggestion.topic}</Text>
        <Ionicons name="open-outline" size={16} color="#667eea" />
      </View>
      <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
      <Text style={styles.suggestionUrl}>{suggestion.urlTitle}</Text>
    </TouchableOpacity>
  );

  return (
   <SafeAreaView edges={['top']} style={styles.container}>
     <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overall Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overall Performance</Text>
            <View style={[styles.overallScore, { backgroundColor: getScoreColor(report.overallScore) }]}>
              <Text style={styles.overallScoreText}>{report.overallScore.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.overallScoreLabel}>{getScoreLabel(report.overallScore)}</Text>
          <Text style={styles.overallFeedback}>{report.overallFeedback}</Text>
        </View>

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          {report.strengths.map((strength, index) => (
            <View key={index} style={styles.strengthItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.strengthText}>{strength}</Text>
            </View>
          ))}
        </View>

        {/* Areas for Improvement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas for Improvement</Text>
          {report.areasForImprovement.map((area, index) => (
            <View key={index} style={styles.improvementItem}>
              <Ionicons name="alert-circle" size={16} color="#F59E0B" />
              <Text style={styles.improvementText}>{area}</Text>
            </View>
          ))}
        </View>

        {/* Question Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Question Analysis</Text>
          {report.questionAnalysis.map((analysis, index) => (
            <View key={index} style={styles.questionAnalysisCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                <View style={[styles.questionScore, { backgroundColor: getScoreColor(analysis.score) }]}>
                  <Text style={styles.questionScoreText}>{analysis.score.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.questionText}>{analysis.question}</Text>
              <Text style={styles.feedbackText}>{analysis.feedback}</Text>
              
              {analysis.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Learning Resources:</Text>
                  {analysis.suggestions.map((suggestion, suggestionIndex) => 
                    renderSuggestion(suggestion, suggestionIndex)
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* General Suggestions */}
        {report.generalSuggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Learning Resources</Text>
            {report.generalSuggestions.map((suggestion, index) => 
              renderSuggestion(suggestion, index)
            )}
          </View>
        )}
      </ScrollView>
    </View>
   </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  overallScore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallScoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  overallScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  overallFeedback: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  strengthText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  improvementText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  questionAnalysisCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  questionScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTopic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  suggestionDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  suggestionUrl: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportDetailsScreen;
