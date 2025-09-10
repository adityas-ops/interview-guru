import ReportCard from '@/components/ReportCard';
import { InterviewReport } from '@/services/aiService';
import { RootState } from '@/store';
import { addReport } from '@/store/firebaseSlice';
import { loadUserReportsFromFirebase } from '@/store/firebaseThunks';
import { clearReport } from '@/store/interviewSlice';
import { generateInterviewReport, saveInterviewToFirebase } from '@/store/interviewThunks';
import { useRouter } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const ReportScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { report, isGeneratingReport, reportError } = useSelector((state: RootState) => state.interview);
  const firebaseReports = useSelector((state: RootState) => state.firebase.reports || []);
  const firebaseDataLoaded = useSelector((state: RootState) => state.firebase.isDataLoaded);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.firebase.isLoading);

  // Load reports from Firebase when component mounts or user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !firebaseDataLoaded) {
      console.log('Loading reports from Firebase...');
      dispatch(loadUserReportsFromFirebase() as any);
    }
  }, [isAuthenticated, firebaseDataLoaded, dispatch]);

  // Add new report to the list when generated
  useEffect(() => {
    if (report) {
      // Save to Firebase
      dispatch(saveInterviewToFirebase() as any);
      // Add report to Firebase state
      dispatch(addReport(report));
      // Clear the report from Redux state to prevent duplicates
      dispatch(clearReport());
      
      // Reload reports from Firebase after saving
      setTimeout(() => {
        dispatch(loadUserReportsFromFirebase() as any);
      }, 1000); // Small delay to ensure Firebase save is complete
    }
  }, [report, dispatch]);

  const deleteReport = async (reportToDelete: InterviewReport) => {
    try {
      // Note: For now, we'll just show an alert since we need to implement Firebase deletion
      Alert.alert(
        'Delete Report',
        'Report deletion from Firebase is not yet implemented. This feature will be added soon.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error deleting report:', error);
      Alert.alert('Error', 'Failed to delete report. Please try again.');
    }
  };

  const handleDeleteReport = (reportToDelete: InterviewReport) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReport(reportToDelete),
        },
      ]
    );
  };

  const handleGenerateReport = async () => {
    try {
      await dispatch(generateInterviewReport() as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    }
  };

  const handleReportPress = (report: InterviewReport) => {
    // Navigate to the report details screen with the report data
    router.push({
      pathname: '/reportDetails',
      params: {
        reportData: JSON.stringify(report)
      }
    });
    };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview Reports</Text>
        <Text style={styles.subtitle}>Track your progress and improve your skills</Text>
      </View>

      {isGeneratingReport && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating your report...</Text>
        </View>
      )}

      {reportError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{reportError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleGenerateReport}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : firebaseReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyText}>
              Complete an interview to see your detailed performance report and learning suggestions.
            </Text>
            <TouchableOpacity style={styles.startInterviewButton} onPress={() => {
              router.push({
                pathname:"/(tabs)",
                params:{
                  index:0
                }
              })
            }}>
              <Text style={styles.startInterviewButtonText}>Start Interview</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reportsContainer}>
            {firebaseReports.map((report, index) => (
              <ReportCard
                key={`${report.completedAt}-${index}`}
                report={report}
                onPress={() => handleReportPress(report)}
                onDelete={() => handleDeleteReport(report)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <StatusBar style='dark'/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  loadingText: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  startInterviewButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startInterviewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  reportsContainer: {
    paddingVertical: 20,
  },
});

export default ReportScreen;
