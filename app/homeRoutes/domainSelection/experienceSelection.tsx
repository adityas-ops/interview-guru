import { RootState } from '@/store';
import { completeDomainSelection, setExperience } from '@/store/domainSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const ExperienceSelection = () => {
  const dispatch = useDispatch();
  const domainData = useSelector((state: RootState) => state.domain.currentDomain);
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  // Pre-select existing experience when in edit mode
  React.useEffect(() => {
    if (domainData?.experience) {
      setSelectedExperience(domainData.experience);
    }
  }, [domainData]);

  const experienceLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: '0-1 years of experience',
      details: 'Just starting out, learning the basics'
    },
    {
      id: 'junior',
      title: 'Junior',
      description: '1-3 years of experience',
      details: 'Some experience, working on smaller projects'
    },
    {
      id: 'mid',
      title: 'Mid-Level',
      description: '3-5 years of experience',
      details: 'Comfortable with most tasks, can work independently'
    },
    {
      id: 'senior',
      title: 'Senior',
      description: '5-8 years of experience',
      details: 'Expert level, can mentor others and lead projects'
    },
    {
      id: 'lead',
      title: 'Lead/Principal',
      description: '8+ years of experience',
      details: 'Technical leadership, architecture decisions'
    }
  ];

  const handleExperienceSelection = (experienceId: string) => {
    setSelectedExperience(experienceId);
  };

  const handleComplete = () => {
    dispatch(setExperience(selectedExperience));
    dispatch(completeDomainSelection());
    
    // Navigate back to home screen
    router.push('/(tabs)');
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Experience Level</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 3 of 3</Text>
        </View>

        <Text style={styles.subtitle}>
          What&apos;s your experience level as a {getFieldDisplayName(domainData?.field || '')}?
        </Text>

        <View style={styles.experienceContainer}>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.experienceCard,
                selectedExperience === level.id && styles.experienceCardSelected
              ]}
              onPress={() => handleExperienceSelection(level.id)}
              activeOpacity={0.7}
            >
              <View style={styles.experienceHeader}>
                <View style={[
                  styles.experienceIcon,
                  selectedExperience === level.id && styles.experienceIconSelected
                ]}>
                  <MaterialIcons 
                    name="work" 
                    size={24} 
                    color={selectedExperience === level.id ? 'white' : '#5b22eb'} 
                  />
                </View>
                <View style={styles.experienceContent}>
                  <Text style={[
                    styles.experienceTitle,
                    selectedExperience === level.id && styles.experienceTitleSelected
                  ]}>
                    {level.title}
                  </Text>
                  <Text style={[
                    styles.experienceDescription,
                    selectedExperience === level.id && styles.experienceDescriptionSelected
                  ]}>
                    {level.description}
                  </Text>
                </View>
                {selectedExperience === level.id && (
                  <MaterialIcons name="check-circle" size={24} color="#5b22eb" />
                )}
              </View>
              <Text style={[
                styles.experienceDetails,
                selectedExperience === level.id && styles.experienceDetailsSelected
              ]}>
                {level.details}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            !selectedExperience && styles.completeButtonDisabled
          ]}
          onPress={handleComplete}
          disabled={!selectedExperience}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
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
    marginBottom: 25,
    textAlign: 'center',
  },
  experienceContainer: {
    gap: 15,
  },
  experienceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  experienceCardSelected: {
    borderColor: '#5b22eb',
    backgroundColor: '#f8f6ff',
  },
  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  experienceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  experienceIconSelected: {
    backgroundColor: '#5b22eb',
  },
  experienceContent: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  experienceTitleSelected: {
    color: '#5b22eb',
  },
  experienceDescription: {
    fontSize: 14,
    color: '#666',
  },
  experienceDescriptionSelected: {
    color: '#5b22eb',
  },
  experienceDetails: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginLeft: 65,
  },
  experienceDetailsSelected: {
    color: '#5b22eb',
  },
  completeButton: {
    backgroundColor: '#5b22eb',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExperienceSelection;
