import Avatar from "@/components/Avatar";
import { logoutUser } from "@/services/logoutService";
import { RootState } from "@/store";
import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.auth.user);
  const [warningModelLogout, setWarningModelLogout] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      setWarningModelLogout(!warningModelLogout);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const submitLogout = async () => {
    try {
      await logoutUser(dispatch);
      router.replace("/auth/onBoarding");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#5ca0ffff", "rgba(53, 91, 161, 1)"]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 1]}
      >
        <SafeAreaView style={styles.safeAreaStyle}>
          <View style={styles.innerContainer}>
            <Avatar
              name={userData?.displayName ? userData.displayName : ""}
              size={80}
            />
            <Text style={styles.titleText}>
              {userData?.displayName ? userData.displayName : "Unknown"}
            </Text>
            <Text style={styles.emailText}>{userData?.email}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
      <ScrollView style={styles.scrollview}>
        <RouteCard
          title="Edit Profile"
          subtitle="Update your profile information"
          // icon={<MaterialIcons name="edit" size={24} color="#5ca0ffff" />}
          icon={<FontAwesome5 name="user-edit" size={20} color="#066bf7ff" />}
          iconBackground="#bed7fbff"
          routePath="/settings/editProfile"
        />
        <RouteCard
          title="Notifications"
          subtitle="Manage your notification preferences"
          icon={
            <MaterialIcons name="notifications" size={24} color="#206840ff" />
          }
          iconBackground="#b8ebd0ff"
          routePath="/settings/notification"
        />
        <RouteCard
          title="Privacy"
          subtitle="Adjust your privacy settings"
          icon={<MaterialIcons name="lock" size={24} color="#860c8fff" />}
          iconBackground="#d9badbff"
          routePath="/settings/privacy"
        />
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={() => {
              handleLogout();
            }}
            style={styles.logoutButtonStyle}
          >
            <MaterialIcons name="logout" size={20} color="black" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal

        visible={warningModelLogout}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout? This will clear all your data including interview reports and progress.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  submitLogout();
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setWarningModelLogout(false);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface RouteCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBackground: string;
  routePath: string;
}

const RouteCard: React.FC<RouteCardProps> = ({
  title,
  subtitle,
  icon,
  iconBackground,
  routePath,
}) => {
    const warningHandle = ()=>{
    Alert.alert("Alert", "This feature will coming soon.🤗")
    // router.replace({
    //   pathname:"/",
    //   params:{
    //     index:1
    //   }
    // })
  }
  return (
    <TouchableOpacity
      style={styles.resumeContainer}
      // onPress={() => router.push(routePath)}
      onPress={()=>{
        warningHandle()
      }}
    >
      <View
        style={[styles.SkillIconContainer, { backgroundColor: iconBackground }]}
      >
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.resumeTextHeader}>{title}</Text>
        <Text style={styles.resumeSecondaryText}>{subtitle}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <MaterialIcons name="arrow-forward-ios" size={14} color="#939090ff" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  background: {
    height: 230,
  },
  safeAreaStyle: {
    height: "100%",
    padding: 20,
  },
  innerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emailText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "400",
    color: "white",
  },
  titleText: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    letterSpacing: 1.1,
  },
  SkillIconContainer: {
    padding: 15,
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
  resumeContainer: {
    width: "100%",
    padding: 12,
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
    shadowRadius: 1,
    elevation: 5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scrollview: {
    padding: 15,
  },
  logoutContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonStyle: {
    height: 45,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#9e9191ff",
    backgroundColor: "white",
    gap: 5,
    flexDirection: "row",
  },
  logoutText: {
    color: "#161111ff",
    fontSize: 18,
    fontWeight: 500,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalMessage: {
    fontSize: 16,
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#007bff",
  },
});

export default SettingsScreen;
