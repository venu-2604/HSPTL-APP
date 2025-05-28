import { Tabs } from 'expo-router';
import { UserPlus, ClipboardList } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4299e1',
        tabBarInactiveTintColor: '#4a5568',
        tabBarStyle: {
          display: 'none',
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins_400Regular',
          fontSize: 12,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: 'Register',
          href: null,
          tabBarIcon: ({ color, size }) => <UserPlus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          href: null,
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="success"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}