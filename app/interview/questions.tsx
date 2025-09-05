import AnimateView from "@/components/AnimateView";
import { RootState } from "@/store";
import { initializeUserAnswers, nextQuestion, previousQuestion, saveAnswer, setSaving } from "@/store/interviewSlice";
import { generateInterviewReport } from "@/store/interviewThunks";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, usePreventRemove } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import * as Speech from 'expo-speech'; // Uncomment when expo-speech is installed
import { saveInterviewResult } from "@/services/firebaseService";

const QuestionsScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { questions, currentQuestionIndex, isLoading, userAnswers, isSaving, isGeneratingReport } = useSelector(
    (state: RootState) => state.interview
  );
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Ensure userAnswers is always an array
  const safeUserAnswers = userAnswers || [];
  
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const isTypingRef = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  console.log("questions list ",questions)
  console.log("userAnswers:", userAnswers)
  console.log("safeUserAnswers:", safeUserAnswers)
  console.log("currentQuestionIndex:", currentQuestionIndex)
  console.log("isLastQuestion:", isLastQuestion)
  console.log("questions.length:", questions.length)

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

  // Handle back navigation with confirmation
  const handleBackPress = useCallback(() => {
    console.log("Back button pressed - showing confirmation alert");
    Alert.alert(
      "Exit Interview",
      "Are you sure you want to go back? You haven't completed the interview. Please complete the interview.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("User cancelled back navigation"),
        },
        {
          text: "Yes, Go Back",
          style: "destructive",
          onPress: () => {
            console.log("User confirmed back navigation");
            router.back();
          },
        },
      ],
      { cancelable: false }
    );
    return true; // Prevent default back behavior
  }, [router]);

  // Handle mobile back button - using both useEffect and useFocusEffect for reliability
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Additional focus effect to ensure back handler is active when screen is focused
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      return () => backHandler.remove();
    }, [handleBackPress])
  );

  // Use usePreventRemove hook for proper back navigation handling
  usePreventRemove(true, ({ data }) => {
    // Show confirmation alert when user tries to go back
    Alert.alert(
      "Exit Interview",
      "Are you sure you want to go back? You haven't completed the interview. Please complete the interview.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("User cancelled back navigation"),
        },
        {
          text: "Yes, Go Back",
          style: "destructive",
          onPress: () => {
            console.log("User confirmed back navigation");
            // Allow navigation to proceed
            navigation.dispatch(data.action);
          },
        },
      ],
      { cancelable: false }
    );
  });

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      dispatch(previousQuestion());
    }
  };

  // Initialize userAnswers if undefined
  useEffect(() => {
    if (userAnswers === undefined) {
      dispatch(initializeUserAnswers());
    }
  }, [userAnswers, dispatch]);

  // Load existing answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      isTypingRef.current = false; // Reset typing state for new question
      const existingAnswer = safeUserAnswers.find(
        (answer) => answer.question === currentQuestion.question
      );
      setAnswerText(existingAnswer?.humanAnswer || "");
      setShowHints(false); // Reset hints visibility for new question
    }
  }, [currentQuestionIndex]); // Only run when question index changes, not when userAnswers changes

  const handleTextChange = (text: string) => {
    isTypingRef.current = true;
    setAnswerText(text);
  };

  const handleTextFocus = () => {
    isTypingRef.current = true;
  };

  const handleTextBlur = () => {
    isTypingRef.current = false;
  };

  const handleSpeechToText = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Speech.stop(); // Uncomment when expo-speech is installed
    } else {
      // Start recording
      setIsRecording(true);
      try {
        // Note: For actual speech-to-text, you would need to use a library like expo-speech
        // or integrate with a speech recognition service
        // For now, we'll simulate it with a placeholder
        Alert.alert(
          "Speech to Text",
          "Speech-to-text functionality would be implemented here. For now, please type your answer.",
          [{ text: "OK" }]
        );
        setIsRecording(false);
      } catch (error) {
        console.error("Speech recognition error:", error);
        setIsRecording(false);
      }
    }
  };

  const handleSaveAndNext = async () => {
    console.log("Save and Next clicked");
    console.log("Current question index:", currentQuestionIndex);
    console.log("Is last question:", isLastQuestion);
    console.log("Answer text:", answerText);
    
    if (!answerText.trim()) {
      Alert.alert("Answer Required", "Please provide an answer before proceeding.");
      return;
    }

    try {
      // Ensure userAnswers is initialized before saving
      if (userAnswers === undefined) {
        dispatch(initializeUserAnswers());
      }
      
      // Save the answer
      dispatch(saveAnswer({ 
        questionIndex: currentQuestionIndex, 
        answer: answerText.trim() 
      }));
      console.log("Answer saved successfully");

      if (!isLastQuestion) {
        console.log("Moving to next question");
        dispatch(nextQuestion());
        // Don't clear answerText here - let useEffect handle it when question changes
        console.log("Next question dispatched");
      } else {
        // Save to Firebase and complete interview
        dispatch(setSaving(true));
        
        if (!user?.uid) {
          throw new Error("User not authenticated");
        }

        await saveInterviewResult({
          userId: user.uid,
          userAnswers: [...safeUserAnswers, {
            question: currentQuestion.question,
            humanAnswer: answerText.trim()
          }],
          totalQuestions: questions.length,
          level: questions[0]?.difficulty || "easy",
          completedAt: new Date()
        });

        dispatch(setSaving(false));
        
        // Generate AI report
        try {
          const reportResult = await dispatch(generateInterviewReport() as any);
          
          Alert.alert(
            "Interview Complete",
            "You have completed all questions! Your detailed report with learning suggestions is ready.",
            [
              {
                text: "View Report",
                onPress: () => {
                  // Navigate to report details with the generated report
                  router.push({
                    pathname: '/reportDetails',
                    params: {
                      reportData: JSON.stringify(reportResult.payload)
                    }
                  });
                },
              },
            ]
          );
        } catch (error) {
          console.error("Error generating report:", error);
          Alert.alert(
            "Interview Complete",
            "You have completed all questions! Great job!",
            [
              {
                text: "View Report",
                onPress: () => router.push("/(tabs)/report"),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error in handleSaveAndNext:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Please try again.",
        [{ text: "OK" }]
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

  if (isLoading || !currentQuestion || !questions || questions.length === 0) {
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
              onPress={handleBackPress}
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

            {/* Answer Input Section */}
            <View style={styles.answerInputSection}>
              <Text style={styles.answerInputTitle}>Your Answer:</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.answerInput}
                  value={answerText}
                  onChangeText={handleTextChange}
                  onFocus={handleTextFocus}
                  onBlur={handleTextBlur}
                  placeholder="Type your answer here..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={true}
                  selectTextOnFocus={true}
                  autoCorrect={true}
                  autoCapitalize="sentences"
                />
                <TouchableOpacity
                  style={[styles.speechButton, isRecording && styles.speechButtonActive]}
                  onPress={handleSpeechToText}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={24}
                    color={isRecording ? "#fff" : "#667eea"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hints Toggle Button */}
            {currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <View style={styles.hintsContainer}>
                <TouchableOpacity
                  style={styles.hintToggleButton}
                  onPress={() => setShowHints(!showHints)}
                >
                  <Ionicons
                    name={showHints ? "eye-off" : "eye"}
                    size={20}
                    color="#c05621"
                  />
                  <Text style={styles.hintToggleText}>
                    {showHints ? "Hide Hints" : "Show Hints"}
                  </Text>
                </TouchableOpacity>
                
                {showHints && (
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
              style={[styles.navButton, styles.nextButton, (isSaving || isGeneratingReport) && styles.disabledButton]}
              onPress={handleSaveAndNext}
              disabled={isSaving || isGeneratingReport}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText, (isSaving || isGeneratingReport) && styles.disabledButtonText]}>
                {isSaving ? "Saving..." : isGeneratingReport ? "Generating Report..." : isLastQuestion ? "Save & Finish" : "Save & Next"}
              </Text>
              {!isLastQuestion && !isSaving && !isGeneratingReport && (
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
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
    backgroundColor: "#f0f4f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  loadingText: {
    fontSize: 18,
    color: "#4a5568",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingTop: 16,
    gap: 16,
    backgroundColor: "#ffffff",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#667eea",
    borderRadius: 3,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  questionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    marginTop: 20,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  questionMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 15,
    color: "#718096",
    marginBottom: 20,
    fontStyle: "italic",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    lineHeight: 28,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  answerInputSection: {
    backgroundColor: "#f7fafc",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4299e1",
  },
  answerInputTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 12,
  },
  inputContainer: {
    position: "relative",
  },
  answerInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2d3748",
    minHeight: 100,
    textAlignVertical: "top",
  },
  speechButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speechButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  hintsContainer: {
    marginBottom: 20,
  },
  hintToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef5e7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f6ad55",
    marginBottom: 12,
  },
  hintToggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#c05621",
    marginLeft: 8,
  },
  hintsSection: {
    backgroundColor: "#fef5e7",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f6ad55",
  },
  hintsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#c05621",
    marginBottom: 12,
  },
  hintText: {
    fontSize: 15,
    color: "#c05621",
    lineHeight: 24,
    marginBottom: 6,
    fontWeight: "500",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 16,
    paddingHorizontal: 4,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  previousButton: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  nextButton: {
    backgroundColor: "#667eea",
  },
  disabledButton: {
    backgroundColor: "#f7fafc",
    borderColor: "#cbd5e0",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#667eea",
    letterSpacing: 0.2,
  },
  nextButtonText: {
    color: "#ffffff",
  },
  disabledButtonText: {
    color: "#a0aec0",
  },
});

export default QuestionsScreen;
