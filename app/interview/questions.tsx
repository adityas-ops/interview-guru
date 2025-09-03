import AnimateView from "@/components/AnimateView";
import { RootState } from "@/store";
import { nextQuestion, previousQuestion } from "@/store/interviewSlice";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const QuestionsScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { questions, currentQuestionIndex, isLoading } = useSelector(
    (state: RootState) => state.interview
  );

  console.log("questions list ",questions)

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (!isLoading && questions.length === 0) {
      Alert.alert(
        "No Questions",
        "No questions available. Please go back and generate questions first.",
        [
          {
            text: "Go Back",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [questions.length, isLoading, router]);

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      dispatch(previousQuestion());
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      dispatch(nextQuestion());
    } else {
      Alert.alert(
        "Interview Complete",
        "You have completed all questions! Great job!",
        [
          {
            text: "Finish Interview",
            onPress: () => router.push("/(tabs)/report"),
          },
        ]
      );
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "#FF6B6B";
      case "behavioral":
        return "#4ECDC4";
      case "scenario":
        return "#45B7D1";
      case "conceptual":
        return "#96CEB4";
      default:
        return "#95A5A6";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#2ECC71";
      case "medium":
        return "#F39C12";
      case "hard":
        return "#E74C3C";
      default:
        return "#95A5A6";
    }
  };

  if (isLoading || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AnimateView>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            {/* Question Type and Difficulty */}
            <View style={styles.questionMeta}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: getQuestionTypeColor(currentQuestion.type) },
                ]}
              >
                <Text style={styles.badgeText}>
                  {currentQuestion.type.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(currentQuestion.difficulty) },
                ]}
              >
                <Text style={styles.badgeText}>
                  {currentQuestion.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Category */}
            <Text style={styles.categoryText}>{currentQuestion.category}</Text>

            {/* Question */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Expected Answer (if available) */}
            {currentQuestion.expectedAnswer && (
              <View style={styles.answerSection}>
                <Text style={styles.answerTitle}>Expected Answer:</Text>
                <Text style={styles.answerText}>
                  {currentQuestion.expectedAnswer}
                </Text>
              </View>
            )}

            {/* Hints (if available) */}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <View style={styles.hintsSection}>
                <Text style={styles.hintsTitle}>Hints:</Text>
                {currentQuestion.hints.map((hint, index) => (
                  <Text key={index} style={styles.hintText}>
                    • {hint}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.previousButton,
                isFirstQuestion && styles.disabledButton,
              ]}
              onPress={handlePrevious}
              disabled={isFirstQuestion}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isFirstQuestion ? "#999" : "#007AFF"}
              />
              <Text
                style={[
                  styles.navButtonText,
                  isFirstQuestion && styles.disabledButtonText,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>
                {isLastQuestion ? "Finish" : "Next"}
              </Text>
              {!isLastQuestion && (
                <Ionicons name="chevron-forward" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AnimateView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    gap: 15,
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e1e5e9",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 28,
    marginBottom: 20,
  },
  answerSection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  hintsSection: {
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
    marginBottom: 4,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  previousButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  nextButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default QuestionsScreen;
