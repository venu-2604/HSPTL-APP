import { Redirect } from 'expo-router';

export default function TabIndex() {
  // Redirect to the register screen when accessing the tabs root
  return <Redirect href="/(tabs)/register" />;
}