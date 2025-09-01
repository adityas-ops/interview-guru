import Avatar from "@/components/Avatar";
import { RootState } from "@/store";
import { authPersistence } from "@/store/authPersistence";
import { clearUser } from "@/store/authSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
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

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await authPersistence.clearUserData();
      dispatch(clearUser());
      router.replace("/auth/log-in");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  const handleProfileEdit = () => {
    Alert.alert("Profile Edit", "Profile editing feature coming soon!");
  };

  const handleNotifications = () => {
    Alert.alert("Notifications", "Notification settings coming soon!");
  };

  const handlePrivacy = () => {
    Alert.alert("Privacy", "Privacy settings coming soon!");
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
          icon={<MaterialIcons name="edit" size={24} color="#fff" />}
          iconBackground="#5ca0ffff"
          routePath="/settings/editProfile"
        />
        <RouteCard
          title="Notifications"
          subtitle="Manage your notification preferences"
          icon={<MaterialIcons name="notifications" size={24} color="#fff" />}
          iconBackground="#5ca0ffff"
          routePath="/settings/notification"
        />
        <RouteCard
          title="Privacy"
          subtitle="Adjust your privacy settings"
          icon={<MaterialIcons name="lock" size={24} color="#fff" />}
          iconBackground="#5ca0ffff"
          routePath="/settings/privacy"
        />
      </ScrollView>
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
  return (
    <TouchableOpacity
      style={styles.resumeContainer}
      onPress={() => router.push(routePath)}
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
    shadowRadius: 1,
    elevation: 5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scrollview:{
    padding: 10,
  },
});

export default SettingsScreen;
