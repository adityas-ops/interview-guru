import AnimateView from "@/components/AnimateView";
import Loader from "@/components/Loader";
import { RootState } from "@/store";
import { loadUserDataFromFirebase, loadUserReportsFromFirebase, saveInterviewToFirebase, updateUserProgressInFirebase } from "@/store/firebaseThunks";
import {
  clearAllData,
  initializeUserAnswers,
  nextQuestion,
  previousQuestion,
  saveAnswer,
  setSaving,
} from "@/store/interviewSlice";
import { generateInterviewReport } from "@/store/interviewThunks";
import { Ionicons } from "@expo/vector-icons";
import { usePreventRemove } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const QuestionsScreen = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    questions,
    currentQuestionIndex,
    isLoading,
    userAnswers,
    isSaving,
    isGeneratingReport,
  } = useSelector((state: RootState) => state.interview);
  const { user } = useSelector((state: RootState) => state.auth);
  const domainData = useSelector((state: RootState) => state.domain.currentDomain);
  const interviewReport = useSelector((state: RootState) => state.interview.report);

  // Ensure userAnswers is always an array
  const safeUserAnswers = userAnswers || [];
  const [recognizing, setRecognizing] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isTypingRef = useRef(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isLoading && questions.length === 0) {
    }
  }, [questions.length, isLoading, router]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: any) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);



   const handleBackPress = useCallback(() => {
    if (!isSubmitted) {
      Alert.alert(
        "Cannot Go Back",
        "You cannot go back without answering all questions. Please complete the interview to proceed.",
        [
          {
            text: "Continue Interview",
            style: "default",
          },
        ]
      );
      return true;
    }
    return false;
  }, [isSubmitted]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);



  // Prevent screen removal when quiz is not completed
  usePreventRemove(!isSubmitted, ({ data }) => {
    Alert.alert(
      "Cannot Go Back",
      "You cannot go back without answering all questions. Please complete the interview to proceed.",
      [
        {
          text: "Continue Interview",
          style: "default",
        },
      ]
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


    useSpeechRecognitionEvent("start", () => setRecognizing(true));
    useSpeechRecognitionEvent("end", () => setRecognizing(false));
    useSpeechRecognitionEvent("result", (event) => {
      setAnswerText(event.results[0]?.transcript);
    });
    useSpeechRecognitionEvent("error", (event) => {
      console.log("error code:", event.error, "error message:", event.message);
    });

  const handleStartSpeechToText = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    
    // Check if continuous mode is supported (Android 13+)
    const supportsContinuous = Platform.OS === 'ios' || Platform.OS === 'web' || 
      (Platform.OS === 'android' && Platform.Version >= 33); // Android 13+ (API level 33)
    
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: supportsContinuous, // Enable continuous recording if supported
      // Android-specific options for better continuous recognition
      ...(Platform.OS === 'android' && {
        androidIntentOptions: {
          EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 10000, // 10 seconds of silence before stopping
          EXTRA_MASK_OFFENSIVE_WORDS: false,
        },
      }),
    });
  };

  const handleSaveAndNext = async () => {
    // console.log("Save and Next clicked");
    // console.log("Current question index:", currentQuestionIndex);
    // console.log("Is last question:", isLastQuestion);
    // console.log("Answer text:", answerText);

    if (!answerText.trim()) {
      Alert.alert(
        "Answer Required",
        "Please provide an answer before proceeding."
      );
      return;
    }

    try {
      // Ensure userAnswers is initialized before saving
      if (userAnswers === undefined) {
        dispatch(initializeUserAnswers());
      }

      // Save the answer
      dispatch(
        saveAnswer({
          questionIndex: currentQuestionIndex,
          answer: answerText.trim(),
        })
      );
      // console.log("Answer saved successfully");

      if (!isLastQuestion) {
        // console.log("Moving to next question");
        dispatch(nextQuestion());
        // Don't clear answerText here - let useEffect handle it when question changes
        // console.log("Next question dispatched");
      } else {
        // Complete interview and generate report
        dispatch(setSaving(true));
        setIsSubmitted(true);

        if (!user?.uid) {
          throw new Error("User not authenticated");
        }

        // Generate AI report first
        try {
          const reportResult = await dispatch(generateInterviewReport() as any);
          setLoadingModal(false);
          
          // Save complete interview data to Firebase (including report)
          await dispatch(saveInterviewToFirebase() as any);
          
          // Update user progress in Firebase
          if (domainData && interviewReport) {
            const progressUpdate = {
              interviewScore: interviewReport.overallScore,
              questionsAnswered: questions.length,
              domain: domainData.field,
              difficulty: questions[0]?.difficulty || 'easy',
              completedAt: new Date().toISOString()
            };
            
            // console.log('Updating progress with data:', progressUpdate);
            const progressResult = await dispatch(updateUserProgressInFirebase(progressUpdate) as any);
            console.log('Progress update result:', progressResult);
          } else {
            // console.log('Missing data for progress update:', { domainData, interviewReport });
          }
          
          await dispatch(loadUserDataFromFirebase() as any);
          await dispatch(loadUserReportsFromFirebase() as any);
          
          dispatch(setSaving(false));
          
          // Clear all interview data after successful completion
          dispatch(clearAllData());
          router.replace({
            pathname: "/(tabs)",
            params: {
              index: 1,
            },
          });
        } catch (error) {
          console.error("Error generating report:", error);
          dispatch(setSaving(false));
          // Clear all interview data even if report generation fails
          dispatch(clearAllData());
          Alert.alert(
            "Interview Complete",
            "You have completed all questions! Great job!",
            [
              {
                text: "View Report",
                onPress: () =>
                  router.replace({
                    pathname: "/(tabs)",
                    params: {
                      index: 0,
                    },
                  }),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error in handleSaveAndNext:", error);
      Alert.alert("Error", "Something went wrong. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const [loadingModal, setLoadingModal] = useState(isGeneratingReport);
  useEffect(() => {
    if (isGeneratingReport === true) {
      setLoadingModal(true);
    } else {
      setLoadingModal(false);
    }
  }, [isGeneratingReport]);

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
      <SafeAreaView edges={['top']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <AnimateView>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollViewContent,
              isKeyboardVisible && { paddingBottom: keyboardHeight + 20 }
            ]}
          >
          {/* Header */}
          <View style={styles.header}>
     
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
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
                  {
                    backgroundColor: getQuestionTypeColor(currentQuestion.type),
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {currentQuestion.type.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor: getDifficultyColor(
                      currentQuestion.difficulty
                    ),
                  },
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
                {/* <TouchableOpacity
                  style={[
                    styles.speechButton,
                    isRecording && styles.speechButtonActive,
                  ]}
                  onPress={handleStartSpeechToText}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={24}
                    color={isRecording ? "#fff" : "#667eea"}
                  />
                </TouchableOpacity> */}
                {
                  !recognizing ? (
                    <TouchableOpacity
                     style={[
                    styles.speechButton,
                    isRecording && styles.speechButtonActive,
                  ]}
                     onPress={handleStartSpeechToText}>
                      <Ionicons
                        name="mic"
                        size={24}
                        color="#667eea"
                      />
                    </TouchableOpacity>

                  )
                  :(
                    <TouchableOpacity 
                     style={[
                    styles.speechButton,
                    isRecording && styles.speechButtonActive,
                  ]}
                    onPress={() => ExpoSpeechRecognitionModule.stop()}>
                      <Ionicons
                        name="stop"
                        size={24}
                        color="#fc3434ff"
                      />
                    </TouchableOpacity>
                  )
                }
 
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
              style={[
                styles.navButton,
                styles.nextButton,
                (isSaving || isGeneratingReport) && styles.disabledButton,
              ]}
              onPress={handleSaveAndNext}
              disabled={isSaving || isGeneratingReport}
            >
              <Text
                style={[
                  styles.navButtonText,
                  styles.nextButtonText,
                  (isSaving || isGeneratingReport) && styles.disabledButtonText,
                ]}
              >
                {isSaving
                  ? "Saving..."
                  : isGeneratingReport
                  ? "Generating Report..."
                  : isLastQuestion
                  ? "Save & Finish"
                  : "Save & Next"}
              </Text>
              {!isLastQuestion && !isSaving && !isGeneratingReport && (
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
          </ScrollView>
        </AnimateView>
      </KeyboardAvoidingView>
      {/* loading model */}
      <Modal
        visible={loadingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLoadingModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "white",
          }}
        >
          <TouchableWithoutFeedback>
            <View style={{ flex: 1 }}>
              <Loader />
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
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
    backgroundColor: "#007AFF",
    borderRadius: 3,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  questionCard: {
    marginTop: 20,
    marginBottom: 32,
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
    padding: 15,
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
    borderColor: "#071d3aff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#2d3748",
    minHeight: 140,
    maxHeight: 250,
    height: "auto",
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
    paddingVertical: 14,
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
    backgroundColor: "#007AFF",
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
