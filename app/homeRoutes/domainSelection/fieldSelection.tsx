import { setField } from '@/store/domainSlice';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

const FieldSelection = () => {
  const dispatch = useDispatch();

  const fields = [
    {
      id: 'frontend',
      name: 'Frontend Developer',
      icon: 'desktop',
      description: 'React, Vue, Angular, HTML, CSS, JavaScript'
    },
    {
      id: 'backend',
      name: 'Backend Developer',
      icon: 'server',
      description: 'Node.js, Python, Java, C#, Database, APIs'
    },
    {
      id: 'fullstack',
      name: 'Full Stack Developer',
      icon: 'layer-group',
      description: 'Frontend + Backend technologies'
    },
    {
      id: 'mobile',
      name: 'Mobile Developer',
      icon: 'mobile-alt',
      description: 'React Native, Flutter, iOS, Android'
    },
    {
      id: 'devops',
      name: 'DevOps Engineer',
      icon: 'cogs',
      description: 'AWS, Docker, Kubernetes, CI/CD'
    },
    {
      id: 'data',
      name: 'Data Scientist',
      icon: 'chart-line',
      description: 'Python, R, Machine Learning, Analytics'
    },
    {
      id: 'uiux',
      name: 'UI/UX Designer',
      icon: 'paint-brush',
      description: 'Figma, Adobe XD, User Research, Prototyping'
    },
    {
      id: 'qa',
      name: 'QA Engineer',
      icon: 'bug',
      description: 'Testing, Automation, Selenium, Jest'
    }
  ];

  const handleFieldSelection = (fieldId: string) => {
    dispatch(setField(fieldId));
    router.push('/homeRoutes/domainSelection/skillsSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Field</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>
        </View>

        <Text style={styles.subtitle}>
          Select the field that best describes your expertise
        </Text>

        <View style={styles.fieldsContainer}>
          {fields.map((field) => (
            <TouchableOpacity
              key={field.id}
              style={styles.fieldCard}
              onPress={() => handleFieldSelection(field.id)}
              activeOpacity={0.7}
            >
              <View style={styles.fieldIcon}>
                <FontAwesome5 name={field.icon} size={24} color="#5b22eb" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldName}>{field.name}</Text>
                <Text style={styles.fieldDescription}>{field.description}</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#333',

  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5b22eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight:500
  },
  fieldsContainer: {
    gap: 15,
  },
  fieldCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fieldContent: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default FieldSelection;
