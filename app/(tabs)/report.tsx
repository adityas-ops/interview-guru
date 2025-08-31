import { StatusBar } from "expo-status-bar";
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReportScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Your Interview Analytics</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Overview</Text>
          <Text style={styles.cardText}>
            Track your interview performance and identify areas for improvement.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progress Tracking</Text>
          <Text style={styles.cardText}>
            Monitor your learning progress and skill development over time.
          </Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Analytics Dashboard</Text>
          <Text style={styles.cardText}>
            Detailed insights into your interview preparation journey.
          </Text>
        </View>
      </ScrollView>
        <StatusBar style='dark'/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ReportScreen;
