import { Stack } from 'expo-router';

export default function DomainSelectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="fieldSelection" />
      <Stack.Screen name="skillsSelection" />
      <Stack.Screen name="experienceSelection" />
      <Stack.Screen name="editDomain" />
    </Stack>
  );
}
