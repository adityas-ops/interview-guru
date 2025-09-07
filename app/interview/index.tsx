import AnimateView from "@/components/AnimateView";
import Loader from "@/components/Loader";
import { AppDispatch, RootState } from "@/store";
import {
  clearAllData,
  setLevel,
  setNumberOfQuestions
} from "@/store/interviewSlice";
import { generateInterviewQuestions } from "@/store/interviewThunks";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Index = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { level, numberOfQuestions, isLoading, error } = useSelector(
    (state: RootState) => state.interview
  );

  const [selectedLevel, setSelectedLevel] = useState<
    "easy" | "medium" | "hard" | null
  >(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number>(0);

  const levels = [
    { key: "easy", label: "Easy", locked: false },
    { key: "medium", label: "Medium", locked: false },
    { key: "hard", label: "Hard", locked: true },
  ];

  const questionCounts = [
     { count: 1, locked: false },
    { count: 10, locked: false },
    { count: 15, locked: false },
    { count: 25, locked: true },
    { count: 35, locked: true },
    { count: 50, locked: true },
  ];

  const handleLevelSelect = (
    levelKey: "easy" | "medium" | "hard" | null,
    locked: boolean
  ) => {
    if (locked) {
      Alert.alert(
        "Coming Soon",
        "This difficulty level will be available in a future update!",
        [{ text: "OK" }]
      );
      return;
    }

    setSelectedLevel(levelKey);
    if (levelKey !== null) {
      dispatch(setLevel(levelKey));
    }
  };

  const handleQuestionCountSelect = (count: number, locked: boolean) => {
    if (locked) {
      Alert.alert(
        "Coming Soon",
        "This question count will be available in a future update!",
        [{ text: "OK" }]
      );
      return;
    }

    setSelectedQuestions(count);
    dispatch(setNumberOfQuestions(count));
  };

  const handleContinue = async () => {
    if (selectedLevel !== null && selectedQuestions > 0) {
      try {
        // Generate questions using AI
        const resultAction = await dispatch(generateInterviewQuestions());
        if (generateInterviewQuestions.rejected.match(resultAction)) {
          throw new Error(resultAction.payload as string);
        }

        // Navigate to interview questions screen
        router.replace("/interview/questions");
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Failed to generate questions. Please try again.",
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Selection Required",
        "Please select both difficulty level and number of questions.",
        [{ text: "OK" }]
      );
    }
  };

  //   first clear all selected data
  useEffect(() => {
    dispatch(clearAllData());
  }, []);

  const [loading, setLoading] = useState(isLoading);

  useEffect(()=>{
    if(isLoading === true){
      setLoading(true)
    }else{
      setLoading(false)
    }
  },[isLoading])

  return (
    <SafeAreaView style={styles.container}>
      <AnimateView>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Interview Setup</Text>
            <Text style={styles.subtitle}>
              Choose your interview preferences
            </Text>
          </View>

          {/* Difficulty Level Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Level</Text>
            <View style={styles.optionsContainer}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.optionButton,
                    selectedLevel === level.key &&
                      !level.locked &&
                      styles.selectedOption,
                    level.locked && styles.lockedOption,
                  ]}
                  onPress={() =>
                    handleLevelSelect(
                      level.key as "easy" | "medium" | "hard",
                      level.locked
                    )
                  }
                  disabled={level.locked}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedLevel === level.key &&
                        !level.locked &&
                        styles.selectedOptionText,
                      level.locked && styles.lockedOptionText,
                    ]}
                  >
                    {level.label}
                  </Text>
                  {level.locked && (
                    <Ionicons
                      name="lock-closed"
                      size={16}
                      color="#999"
                      style={styles.lockIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Question Count Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Questions</Text>
            <View style={styles.optionsContainer}>
              {questionCounts.map((option) => (
                <TouchableOpacity
                  key={option.count}
                  style={[
                    styles.optionButton,
                    selectedQuestions === option.count &&
                      !option.locked &&
                      styles.selectedOption,
                    option.locked && styles.lockedOption,
                  ]}
                  onPress={() =>
                    handleQuestionCountSelect(option.count, option.locked)
                  }
                  //   disabled={option.locked}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedQuestions === option.count &&
                        !option.locked &&
                        styles.selectedOptionText,
                      option.locked && styles.lockedOptionText,
                    ]}
                  >
                    {option.count}
                  </Text>
                  {option.locked && (
                    <Ionicons
                      name="lock-closed"
                      size={16}
                      color="#999"
                      style={styles.lockIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (selectedLevel === null ||
                selectedQuestions === 0 ||
                isLoading) &&
                styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={
              selectedLevel === null || selectedQuestions === 0 || isLoading
            }
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.continueButtonText}>
                  Generating Questions...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.continueButtonText,
                  (selectedLevel === null || selectedQuestions === 0) &&
                    styles.disabledButtonText,
                ]}
              >
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </AnimateView>
      <Modal
        visible={loading}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLoading(false)}
      >
          <Pressable
                // onPress={() => setIsEdit(false)}
                // className="flex-1 justify-end items-center bg-[#000000cc]"
                style={{
                  flex:1,
                  backgroundColor:"white"
                }}
              >
                <TouchableWithoutFeedback>
                  <View style={{flex:1}}>
                    <Loader/>
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
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#5d5c5cff",
    shadowOffset: {
      height: 0.5,
      width: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 5,
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  lockedOption: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  selectedOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  lockedOptionText: {
    color: "#999",
  },
  lockIcon: {
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
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
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButtonText: {
    color: "#999",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default Index;
