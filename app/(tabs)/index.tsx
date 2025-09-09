import ProgressStats from "@/components/ProgressStats";
import RecentInterviews from "@/components/RecentInterviews";
import { RootState } from "@/store";
import { loadUserProgressFromFirebase } from "@/store/firebaseThunks";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
const HomeScreen = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.auth.user);
  const domainData = useSelector((state: RootState) => state.domain.currentDomain);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const myDate = new Date();
  const hours = myDate.getHours();
  let greet;

  if (hours < 12) {
    greet = "morning";
  } else if (hours >= 12 && hours <= 17) {
    greet = "afternoon";
  } else if (hours >= 17 && hours <= 24) {
    greet = "evening";
  }
  const firstName = userData?.displayName || "User";

  // console.log("domain data",domainData)

  const getFieldDisplayName = (field: string) => {
    const fieldNames: { [key: string]: string } = {
      frontend: 'Frontend Developer',
      backend: 'Backend Developer',
      fullstack: 'Full Stack Developer',
      mobile: 'Mobile Developer',
      devops: 'DevOps Engineer',
      data: 'Data Scientist',
      uiux: 'UI/UX Designer',
      qa: 'QA Engineer'
    };
    return fieldNames[field] || 'Developer';
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Force refresh of RecentInterviews component
      setRefreshKey(prev => prev + 1);
      // Load progress data
      console.log('Home screen focused, loading progress data...');
      dispatch(loadUserProgressFromFirebase() as any);
    }, [dispatch])
  );

  const handleStartInterview = () => {
    if (!domainData || !domainData.field) {
      Alert.alert(
        'Domain Required',
        'Please choose your domain first before starting an interview.',
        [
          {
            text: 'Choose Domain',
            onPress: () => router.push('/homeRoutes/chooseDomain')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }
    router.push("/interview");
  };
  return (
    <View style={styles.container}>
      {/* // gradient start from  left top and reach to bottom right */}
      <LinearGradient
        colors={["rgba(53, 91, 161, 1)", "#5ca0ffff"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 1]}
      >
        <SafeAreaView style={styles.safeAreaStyle}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.greatHeaderText}>good {greet},</Text>
              <Text style={styles.greatHeaderText2}>
                {userData?.displayName ? firstName : "User"}!
              </Text>
              <Text style={styles.greatDescriptionText}>
                Ready for you next interview?
              </Text>
            </View>
            <View style={styles.greatContainer}>
              <Image
                source={require("@/assets/images/cat.gif")}
                style={{
                  width: 100,
                  height: 100,
                }}
                contentFit="cover"
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleStartInterview}
              activeOpacity={0.3}
              style={styles.buttonContainer}
              
            >
              <Ionicons name="play-outline" size={28} color="#3275d3ff" />
              <Text style={styles.buttonText}>Start Interview</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <ScrollView
        style={{ flex: 1, padding: 15 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* document upload */}
        {/*
         <TouchableOpacity onPress={()=>{
          router.push("/interview/questions");
        }} activeOpacity={0.6} style={styles.resumeContainer}>
          <View style={styles.iconContainer}>
            <AntDesign name="upload" size={20} color="#04a256ff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.resumeTextHeader}>Upload Resume</Text>
            <Text style={styles.resumeSecondaryText}>
              Get Personalized questions
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <MaterialIcons
              name="arrow-forward-ios"
              size={14}
              color="#939090ff"
            />
          </View>
        </TouchableOpacity> 
        */}
        {/* choose domain */}


        <TouchableOpacity onPress={()=>router.push(domainData ? "/homeRoutes/domainSelection/editDomain" : "/homeRoutes/chooseDomain")} activeOpacity={0.6} style={styles.resumeContainer}>
          <View style={styles.SkillIconContainer}>
            {/* <AntDesign name="upload" size={20} color="#04a256ff" /> */}
            <FontAwesome5 name="suitcase" size={20} color="#5b22ebff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.resumeTextHeader}>
              {domainData ? 'Your Domain' : 'Choose Domain'}
            </Text>
            <Text style={styles.resumeSecondaryText}>
              {domainData ? getFieldDisplayName(domainData.field) : 'Select your expertise'}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <MaterialIcons
              name={domainData ? "edit" : "arrow-forward-ios"}
              size={24}
              color="#3707e5ff"
            />
          </View>
        </TouchableOpacity>
        
        {/* Progress Stats */}
        <ProgressStats />
        
        {/* Progress Chart */}
        {/* <ProgressChart /> */}
        
        {/* Recent Interviews */}
        <RecentInterviews key={refreshKey} />
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  background: {
    height: 270,
  },
  safeAreaStyle: {
    height: "100%",
    padding: 20,
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  welcomeTextContainer: {
    flexGrow: 1,
    marginTop: 20,
  },
  greatContainer: {
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
  },
  greatHeaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: 500,
    textTransform: "capitalize",
    // letterSpacing: 1,
  },
  greatHeaderText2: {
    color: "white",
    fontSize: 28,
    fontWeight: 700,
    textTransform: "capitalize",
    letterSpacing: 1,
    marginTop: 1,
  },
  greatDescriptionText: {
    color: "#f3f3f3ff",
    fontSize: 18,
    fontWeight: 500,
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  buttonContainer: {
    // maxWidth: "85%",
    width: "100%",
    marginHorizontal: "auto",
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    backgroundColor: "white",
    marginVertical: 20,
    display: "flex",
    flexDirection: "row",
    gap: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#3275d3ff",
  },
  resumeContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderWidth: 0.4,
    borderColor: "#777777ff",
    boxShadow: "#000",
    shadowColor: "#5d5c5cff",
    shadowOffset: {
      height: 0.5,
      width: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    padding: 15,
    backgroundColor: "#ccf8e1ff",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  SkillIconContainer: {
    padding: 15,
    backgroundColor: "#dfd9f7ff",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    flexGrow: 1,
    paddingLeft: 20,
  },
  arrowContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  resumeTextHeader: {
    fontSize: 18,
    color: "#000",
    fontWeight: 600,
  },
  resumeSecondaryText: {
    fontSize: 15,
    color: "#838282ff",
    fontWeight: 400,
    marginTop: 5,
  },
  headingText: {
    fontWeight: 700,
    color: "#212020ff",
    fontSize: 20,
    marginBottom: 20,
  },
  reportContainer: {
    width: "100%",
    padding: 20,
    backgroundColor: "white",
    borderWidth: 0.4,
    borderColor: "#777777ff",
    boxShadow: "#000",
    shadowColor: "#5d5c5cff",
    shadowOffset: {
      height: 0.5,
      width: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    borderRadius: 8,
    marginBottom: 20,
  },
  reportHeadingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportHeadingOne: {
    fontSize: 18,
    color: "#000",
    fontWeight: 500,
  },
  reportHeadingScore: {
    fontWeight: 800,
    color: "#09935aff",
  },
  reportSecondaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop:7
  },
  reportSeconarysubContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  reportSeconarysubContainerDate: {
    fontSize: 15,
    fontWeight: 400,
    color: "#5e5d5dff",
  },
  reportSeconarysubContainerOverAllText: {
    fontSize: 14,
    fontWeight: 400,
    color: "#5e5d5dff",
  },
});

export default HomeScreen;
