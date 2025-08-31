import { RootState } from '@/store';
import { authPersistence } from '@/store/authPersistence';
import { clearUser } from '@/store/authSlice';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await authPersistence.clearUserData();
      dispatch(clearUser());
      router.replace("/auth/log-in");
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleProfileEdit = () => {
    Alert.alert('Profile Edit', 'Profile editing feature coming soon!');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Notification settings coming soon!');
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.profileSection}>
          <Text style={styles.profileTitle}>Profile Information</Text>
          <Text style={styles.profileText}>Name: {userData?.displayName || 'N/A'}</Text>
          <Text style={styles.profileText}>Email: {userData?.email || 'N/A'}</Text>
        </View>

        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingItem} onPress={handleProfileEdit}>
            <Text style={styles.settingText}>Edit Profile</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  profileText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
