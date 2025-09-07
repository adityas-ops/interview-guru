import { RootState } from "@/store";
import { setProgrammingLanguages, setSkills } from "@/store/domainSlice";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

const SkillsSelection = () => {
  const dispatch = useDispatch();
  const selectedField = useSelector(
    (state: RootState) => state.domain.currentDomain?.field
  );
  const currentDomain = useSelector(
    (state: RootState) => state.domain.currentDomain
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Pre-select existing skills when in edit mode
  React.useEffect(() => {
    if (currentDomain?.skills) {
      setSelectedSkills(currentDomain.skills.map((skill) => skill.id));
    }
    if (currentDomain?.programmingLanguages) {
      setSelectedLanguages(currentDomain.programmingLanguages);
    }
  }, [currentDomain]);

  const skillsData = {
    frontend: {
      skills: [
        { id: "react", name: "React", category: "Framework" },
        { id: "vue", name: "Vue.js", category: "Framework" },
        { id: "angular", name: "Angular", category: "Framework" },
        { id: "html", name: "HTML5", category: "Markup" },
        { id: "css", name: "CSS3", category: "Styling" },
        { id: "sass", name: "Sass/SCSS", category: "Styling" },
        { id: "tailwind", name: "Tailwind CSS", category: "Styling" },
        { id: "webpack", name: "Webpack", category: "Build Tool" },
        { id: "vite", name: "Vite", category: "Build Tool" },
        { id: "nextjs", name: "Next.js", category: "Framework" },
        { id: "nuxt", name: "Nuxt.js", category: "Framework" },
        { id: "typescript", name: "TypeScript", category: "Language" },
        { id: "bootstrap", name: "Bootstrap", category: "Framework" },
        {
          id: "materialui",
          name: "Material-UI",
          category: "Component Library",
        },
        {
          id: "styledcomponents",
          name: "Styled Components",
          category: "Styling",
        },
        { id: "emotion", name: "Emotion", category: "Styling" },
        { id: "storybook", name: "Storybook", category: "Development Tool" },
        { id: "parcel", name: "Parcel", category: "Build Tool" },
        { id: "eslint", name: "ESLint", category: "Linting" },
        { id: "prettier", name: "Prettier", category: "Code Formatter" },
        { id: "pwa", name: "Progressive Web Apps", category: "Technology" },
        { id: "webassembly", name: "WebAssembly", category: "Technology" },
        { id: "graphql", name: "GraphQL", category: "API" },
        { id: "apollo", name: "Apollo Client", category: "State Management" },
      ],
      languages: ["JavaScript", "TypeScript", "python", "C/C++"],
    },
    backend: {
      skills: [
        { id: "nodejs", name: "Node.js", category: "Runtime" },
        { id: "express", name: "Express.js", category: "Framework" },
        { id: "django", name: "Django", category: "Framework" },
        { id: "flask", name: "Flask", category: "Framework" },
        { id: "spring", name: "Spring Boot", category: "Framework" },
        { id: "laravel", name: "Laravel", category: "Framework" },
        { id: "rails", name: "Ruby on Rails", category: "Framework" },
        { id: "mysql", name: "MySQL", category: "Database" },
        { id: "postgresql", name: "PostgreSQL", category: "Database" },
        { id: "mongodb", name: "MongoDB", category: "Database" },
        { id: "redis", name: "Redis", category: "Database" },
        { id: "docker", name: "Docker", category: "DevOps" },
        { id: "fastapi", name: "FastAPI", category: "Framework" },
        { id: "nestjs", name: "NestJS", category: "Framework" },

        { id: "koa", name: "Koa.js", category: "Framework" },
        { id: "hapi", name: "Hapi.js", category: "Framework" },
        { id: "graphql", name: "GraphQL", category: "API" },
        { id: "rest", name: "REST APIs", category: "API" },
        {
          id: "microservices",
          name: "Microservices",
          category: "Architecture",
        },
        { id: "serverless", name: "Serverless", category: "Architecture" },
        { id: "lambda", name: "AWS Lambda", category: "Cloud Function" },
        { id: "nginx", name: "Nginx", category: "Web Server" },
        { id: "apache", name: "Apache", category: "Web Server" },
        { id: "rabbitmq", name: "RabbitMQ", category: "Message Queue" },
        { id: "kafka", name: "Apache Kafka", category: "Message Queue" },
        {
          id: "elasticsearch",
          name: "Elasticsearch",
          category: "Search Engine",
        },
        { id: "sqlite", name: "SQLite", category: "Database" },
        { id: "cassandra", name: "Cassandra", category: "Database" },
      ],
      languages: [
        "JavaScript",
        "Python",
        "Java",
        "C#",
        "PHP",
        "Ruby",
        "Go",
        "Rust",
        "Elixir",
        "Haskell",
        "Clojure",
      ],
    },
    fullstack: {
      skills: [
        { id: "react", name: "React", category: "Frontend" },
        { id: "nodejs", name: "Node.js", category: "Backend" },
        { id: "express", name: "Express.js", category: "Backend" },
        { id: "mongodb", name: "MongoDB", category: "Database" },
        { id: "postgresql", name: "PostgreSQL", category: "Database" },
        { id: "nextjs", name: "Next.js", category: "Full Stack" },
        { id: "typescript", name: "TypeScript", category: "Language" },
        { id: "docker", name: "Docker", category: "DevOps" },
        { id: "aws", name: "AWS", category: "Cloud" },
        { id: "graphql", name: "GraphQL", category: "API" },
        { id: "rest", name: "REST APIs", category: "API" },
        { id: "git", name: "Git", category: "Version Control" },
      ],
      languages: ["JavaScript", "TypeScript", "Python", "Java", "C#", "Go"],
    },
    mobile: {
      skills: [
        { id: "reactnative", name: "React Native", category: "Framework" },
        { id: "flutter", name: "Flutter", category: "Framework" },
        { id: "swift", name: "Swift", category: "iOS" },
        { id: "kotlin", name: "Kotlin", category: "Android" },
        { id: "java", name: "Java", category: "Android" },
        { id: "xcode", name: "Xcode", category: "iOS" },
        { id: "androidstudio", name: "Android Studio", category: "Android" },
        { id: "expo", name: "Expo", category: "Framework" },
        { id: "firebase", name: "Firebase", category: "Backend" },
        { id: "redux", name: "Redux", category: "State Management" },
        { id: "navigation", name: "Navigation", category: "Framework" },
        { id: "testing", name: "Mobile Testing", category: "Testing" },
        { id: "ionic", name: "Ionic", category: "Framework" },
        { id: "cordova", name: "Cordova", category: "Framework" },
        { id: "xamarin", name: "Xamarin", category: "Framework" },
        {
          id: "reactnavigation",
          name: "React Navigation",
          category: "Navigation",
        },
        { id: "flipper", name: "Flipper", category: "Debugging" },
        { id: "fastlane", name: "Fastlane", category: "Deployment" },
        { id: "appstore", name: "App Store Connect", category: "Publishing" },
        {
          id: "playstore",
          name: "Google Play Console",
          category: "Publishing",
        },
        {
          id: "pushnotifications",
          name: "Push Notifications",
          category: "Feature",
        },
        { id: "biometric", name: "Biometric Auth", category: "Security" },
        { id: "asyncstorage", name: "AsyncStorage", category: "Storage" },
        { id: "sqlite", name: "SQLite", category: "Database" },
        { id: "realm", name: "Realm Database", category: "Database" },
        { id: "mobx", name: "MobX", category: "State Management" },
      ],
      languages: [
        "JavaScript",
        "TypeScript",
        "Dart",
        "Swift",
        "Kotlin",
        "Java",
        "C++",
      ],
    },
    devops: {
      skills: [
        { id: "aws", name: "AWS", category: "Cloud" },
        { id: "azure", name: "Azure", category: "Cloud" },
        { id: "gcp", name: "Google Cloud", category: "Cloud" },
        { id: "docker", name: "Docker", category: "Containerization" },
        { id: "kubernetes", name: "Kubernetes", category: "Orchestration" },
        { id: "jenkins", name: "Jenkins", category: "CI/CD" },
        { id: "gitlab", name: "GitLab CI", category: "CI/CD" },
        { id: "terraform", name: "Terraform", category: "Infrastructure" },
        { id: "ansible", name: "Ansible", category: "Automation" },
        { id: "monitoring", name: "Monitoring", category: "Observability" },
        { id: "linux", name: "Linux", category: "OS" },
        { id: "bash", name: "Bash Scripting", category: "Scripting" },
        { id: "prometheus", name: "Prometheus", category: "Monitoring" },
        { id: "grafana", name: "Grafana", category: "Visualization" },
        { id: "elk", name: "ELK Stack", category: "Logging" },
        { id: "nagios", name: "Nagios", category: "Monitoring" },
        { id: "chef", name: "Chef", category: "Configuration" },
        { id: "puppet", name: "Puppet", category: "Configuration" },
        { id: "circleci", name: "CircleCI", category: "CI/CD" },
        { id: "githubactions", name: "GitHub Actions", category: "CI/CD" },
        { id: "travisci", name: "Travis CI", category: "CI/CD" },
        { id: "helm", name: "Helm", category: "Package Manager" },
        { id: "istio", name: "Istio", category: "Service Mesh" },
        { id: "consul", name: "Consul", category: "Service Discovery" },
        {
          id: "vault",
          name: "HashiCorp Vault",
          category: "Secrets Management",
        },
        { id: "sonarqube", name: "SonarQube", category: "Code Quality" },
      ],
      languages: ["Python", "Bash", "YAML", "Go", "JavaScript"],
    },
    data: {
      skills: [
        { id: "python", name: "Python", category: "Language" },
        { id: "r", name: "R", category: "Language" },
        { id: "pandas", name: "Pandas", category: "Library" },
        { id: "numpy", name: "NumPy", category: "Library" },
        { id: "tensorflow", name: "TensorFlow", category: "ML Framework" },
        { id: "pytorch", name: "PyTorch", category: "ML Framework" },
        { id: "scikit", name: "Scikit-learn", category: "ML Library" },
        { id: "jupyter", name: "Jupyter", category: "Environment" },
        { id: "sql", name: "SQL", category: "Database" },
        { id: "tableau", name: "Tableau", category: "Visualization" },
        { id: "powerbi", name: "Power BI", category: "Visualization" },
        { id: "spark", name: "Apache Spark", category: "Big Data" },
        { id: "matplotlib", name: "Matplotlib", category: "Visualization" },
        { id: "seaborn", name: "Seaborn", category: "Visualization" },
        { id: "plotly", name: "Plotly", category: "Visualization" },
        { id: "hadoop", name: "Apache Hadoop", category: "Big Data" },
        { id: "snowflake", name: "Snowflake", category: "Data Warehouse" },
        {
          id: "databricks",
          name: "Databricks",
          category: "Analytics Platform",
        },
        { id: "mlflow", name: "MLflow", category: "ML Ops" },
        { id: "airflow", name: "Apache Airflow", category: "Workflow" },
        { id: "dbt", name: "dbt", category: "Data Transformation" },
        { id: "looker", name: "Looker", category: "BI Tool" },
        { id: "keras", name: "Keras", category: "ML Framework" },
        { id: "opencv", name: "OpenCV", category: "Computer Vision" },
        { id: "nltk", name: "NLTK", category: "NLP Library" },
        { id: "spacy", name: "spaCy", category: "NLP Library" },
      ],
      languages: ["Python", "R", "SQL", "Scala", "Julia", "MATLAB", "SAS"],
    },
    uiux: {
      skills: [
        { id: "figma", name: "Figma", category: "Design Tool" },
        { id: "adobexd", name: "Adobe XD", category: "Design Tool" },
        { id: "sketch", name: "Sketch", category: "Design Tool" },
        { id: "photoshop", name: "Photoshop", category: "Design Tool" },
        { id: "illustrator", name: "Illustrator", category: "Design Tool" },
        { id: "prototyping", name: "Prototyping", category: "Process" },
        { id: "usertesting", name: "User Testing", category: "Research" },
        { id: "wireframing", name: "Wireframing", category: "Process" },
        { id: "designsystems", name: "Design Systems", category: "Process" },
        { id: "accessibility", name: "Accessibility", category: "Process" },
        { id: "usability", name: "Usability", category: "Research" },
        { id: "research", name: "User Research", category: "Research" },
        { id: "invision", name: "InVision", category: "Design Tool" },
        { id: "principle", name: "Principle", category: "Animation" },
        { id: "framer", name: "Framer", category: "Design Tool" },
        { id: "miro", name: "Miro", category: "Collaboration" },
        { id: "figjam", name: "FigJam", category: "Collaboration" },
        { id: "aftereffects", name: "After Effects", category: "Animation" },
        { id: "zeplin", name: "Zeplin", category: "Handoff Tool" },
        { id: "marvel", name: "Marvel", category: "Prototyping" },
        { id: "axure", name: "Axure", category: "Prototyping" },
        { id: "balsamiq", name: "Balsamiq", category: "Wireframing" },
        { id: "userinterviews", name: "User Interviews", category: "Research" },
        { id: "hotjar", name: "Hotjar", category: "Analytics" },
        {
          id: "googleanalytics",
          name: "Google Analytics",
          category: "Analytics",
        },
        { id: "maze", name: "Maze", category: "User Testing" },
      ],
      languages: ["HTML", "CSS", "JavaScript"],
    },
    qa: {
      skills: [
        { id: "selenium", name: "Selenium", category: "Automation" },
        { id: "cypress", name: "Cypress", category: "Testing Framework" },
        { id: "jest", name: "Jest", category: "Testing Framework" },
        { id: "junit", name: "JUnit", category: "Testing Framework" },
        { id: "testng", name: "TestNG", category: "Testing Framework" },
        { id: "postman", name: "Postman", category: "API Testing" },
        { id: "manual", name: "Manual Testing", category: "Testing Type" },
        { id: "automation", name: "Test Automation", category: "Testing Type" },
        {
          id: "performance",
          name: "Performance Testing",
          category: "Testing Type",
        },
        { id: "security", name: "Security Testing", category: "Testing Type" },
        { id: "bugtracking", name: "Bug Tracking", category: "Process" },
        { id: "ci", name: "CI/CD Integration", category: "Process" },
        { id: "playwright", name: "Playwright", category: "Automation" },
        { id: "appium", name: "Appium", category: "Mobile Testing" },
        { id: "loadrunner", name: "LoadRunner", category: "Performance" },
        { id: "jmeter", name: "Apache JMeter", category: "Performance" },
        { id: "soapui", name: "SoapUI", category: "API Testing" },
        { id: "katalon", name: "Katalon", category: "Automation" },
        {
          id: "robotframework",
          name: "Robot Framework",
          category: "Automation",
        },
        { id: "cucumber", name: "Cucumber", category: "BDD Framework" },
        { id: "mocha", name: "Mocha", category: "Testing Framework" },
        { id: "chai", name: "Chai", category: "Assertion Library" },
        { id: "webdriverio", name: "WebDriverIO", category: "Automation" },
        { id: "k6", name: "k6", category: "Performance" },
        { id: "newman", name: "Newman", category: "API Testing" },
        { id: "supertest", name: "SuperTest", category: "API Testing" },
      ],
      languages: ["JavaScript", "Python", "Java", "C#", "Groovy", "PowerShell"],
    },
  };

  const currentSkillsData =
    skillsData[selectedField as keyof typeof skillsData] || skillsData.frontend;

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language]
    );
  };

  const handleContinue = () => {
    const selectedSkillsData = currentSkillsData.skills.filter((skill) =>
      selectedSkills.includes(skill.id)
    );

    dispatch(setSkills(selectedSkillsData));
    dispatch(setProgrammingLanguages(selectedLanguages));
    router.push("/homeRoutes/domainSelection/experienceSelection");
  };

  const getFieldDisplayName = (field: string) => {
    const fieldNames: { [key: string]: string } = {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      fullstack: "Full Stack Developer",
      mobile: "Mobile Developer",
      devops: "DevOps Engineer",
      data: "Data Scientist",
      uiux: "UI/UX Designer",
      qa: "QA Engineer",
    };
    return fieldNames[field] || "Developer";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Skills</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "66%" }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 3</Text>
        </View>

        <Text style={styles.subtitle}>
          Choose your skills for {getFieldDisplayName(selectedField || "")}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          <View style={styles.skillsGrid}>
            {currentSkillsData.skills.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={[
                  styles.skillChip,
                  selectedSkills.includes(skill.id) && styles.skillChipSelected,
                ]}
                onPress={() => toggleSkill(skill.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.skillText,
                    selectedSkills.includes(skill.id) &&
                      styles.skillTextSelected,
                  ]}
                >
                  {skill.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programming Languages</Text>
          <View style={styles.skillsGrid}>
            {currentSkillsData.languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.skillChip,
                  selectedLanguages.includes(language) &&
                    styles.skillChipSelected,
                ]}
                onPress={() => toggleLanguage(language)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.skillText,
                    selectedLanguages.includes(language) &&
                      styles.skillTextSelected,
                  ]}
                >
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedSkills.length === 0 || selectedLanguages.length === 0) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={
            selectedSkills.length === 0 || selectedLanguages.length === 0
          }
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#333",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5b22eb",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
    textAlign: "center",
    fontWeight: 600,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  skillChipSelected: {
    backgroundColor: "#5b22eb",
    borderColor: "#5b22eb",
  },
  skillText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  skillTextSelected: {
    color: "white",
  },
  continueButton: {
    backgroundColor: "#5b22eb",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  continueButtonDisabled: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SkillsSelection;
