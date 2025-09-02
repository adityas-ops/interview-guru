import { RootState } from '@/store';
import { clearDomainData, resetDomainSelection } from '@/store/domainSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const EditDomain = () => {
  const dispatch = useDispatch();
  const domainData = useSelector((state: RootState) => state.domain.currentDomain);
  const isCompleted = useSelector((state: RootState) => state.domain.isCompleted);

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

  const getExperienceDisplayName = (experience: string) => {
    const experienceNames: { [key: string]: string } = {
      beginner: 'Beginner (0-1 years)',
      junior: 'Junior (1-3 years)',
      mid: 'Mid-Level (3-5 years)',
      senior: 'Senior (5-8 years)',
      lead: 'Lead/Principal (8+ years)'
    };
    return experienceNames[experience] || experience;
  };

  const handleEditField = () => {
    dispatch(resetDomainSelection());
    router.push('/homeRoutes/domainSelection/fieldSelection');
  };

  const handleEditSkills = () => {
    router.push('/homeRoutes/domainSelection/skillsSelection');
  };

  const handleEditExperience = () => {
    router.push('/homeRoutes/domainSelection/experienceSelection');
  };

  const handleResetAll = () => {
    Alert.alert(
      'Reset Domain Selection',
      'Are you sure you want to reset all your domain selections? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(clearDomainData());
            router.push('/homeRoutes/domainSelection/fieldSelection');
          },
        },
      ]
    );
  };

  if (!domainData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Domain</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="domain-disabled" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No domain selection found</Text>
          <TouchableOpacity style={styles.startButton} onPress={() => router.push('/homeRoutes/domainSelection/fieldSelection')}>
            <Text style={styles.startButtonText}>Start Selection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Domain</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Update your domain selection and skills
        </Text>

        {/* Current Field */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Field</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Field</Text>
              <Text style={styles.infoValue}>{getFieldDisplayName(domainData.field)}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditField}>
              <MaterialIcons name="edit" size={20} color="#5b22eb" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Skills</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Technical Skills</Text>
              <View style={styles.skillsContainer}>
                {domainData.skills.length > 0 ? (
                  domainData.skills.map((skill) => (
                    <View key={skill.id} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{skill.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No skills selected</Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditSkills}>
              <MaterialIcons name="edit" size={20} color="#5b22eb" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Programming Languages</Text>
              <View style={styles.skillsContainer}>
                {domainData.programmingLanguages.length > 0 ? (
                  domainData.programmingLanguages.map((language) => (
                    <View key={language} style={styles.skillTag}>
                      <Text style={styles.skillTagText}>{language}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No languages selected</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Current Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Experience</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Experience Level</Text>
              <Text style={styles.infoValue}>
                {domainData.experience ? getExperienceDisplayName(domainData.experience) : 'Not selected'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={handleEditExperience}>
              <MaterialIcons name="edit" size={20} color="#5b22eb" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Completion Status */}
        {isCompleted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusCard}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statusText}>Domain selection completed</Text>
              <Text style={styles.statusDate}>
                {domainData.completedAt ? new Date(domainData.completedAt).toLocaleDateString() : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetAll}>
          <MaterialIcons name="refresh" size={20} color="#ff4444" />
          <Text style={styles.resetButtonText}>Reset All Selections</Text>
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
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  infoContent: {
    flex: 1,
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  skillTagText: {
    fontSize: 12,
    color: '#5b22eb',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0ff',
  },
  editButtonText: {
    fontSize: 14,
    color: '#5b22eb',
    fontWeight: '500',
    marginLeft: 4,
  },
  statusCard: {
    backgroundColor: '#f0fff0',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0ffe0',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  statusDate: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe0e0',
    marginTop: 20,
    marginBottom: 30,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#5b22eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditDomain;
