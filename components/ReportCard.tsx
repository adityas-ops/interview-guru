import { InterviewReport } from '@/services/aiService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReportCardProps {
  report: InterviewReport;
  onPress: () => void;
  onDelete: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onPress, onDelete }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981'; // Green
    if (score >= 6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Interview Report</Text>
            <Text style={styles.date}>{formatDate(report.completedAt)}</Text>
          </View>
          <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(report.overallScore) }]}>
            <Text style={styles.score}>{report.overallScore.toFixed(1)}</Text>
          </View>
        </View>
      
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{report.totalQuestions} Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={16} color="#6B7280" />
            <Text style={styles.statText}>{getScoreLabel(report.overallScore)}</Text>
          </View>
        </View>
        
        <Text style={styles.feedback} numberOfLines={2}>
          {report.overallFeedback}
        </Text>
        
        <View style={styles.strengthsContainer}>
          <Text style={styles.strengthsLabel}>Key Strengths:</Text>
          {
            report.strengths.length > 0 ?
              <Text style={styles.strengthsText} numberOfLines={1}>
            {report.strengths.slice(0, 2).join(', ')}
            {report.strengths.length > 2 && '...'}
          </Text>
          :
           <Text style={styles.strengthsText} numberOfLines={1}>
            None
           </Text>
          }
        
        </View>
      </View>
      
      <TouchableOpacity onPress={onPress} style={styles.footer}>
        <Text style={styles.viewDetails}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#06a453ff" />
      </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  scoreContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  content: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  feedback: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  strengthsContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  strengthsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  strengthsText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewDetails: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06a453ff',
  },
});

export default ReportCard;
