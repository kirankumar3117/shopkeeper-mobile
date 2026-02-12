import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

// Simple Icon Component (Since we might not have vector icons set up yet)
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View className={`items-center justify-center h-10 w-10 rounded-full ${focused ? 'bg-green-100' : ''}`}>
      <Text className="text-xl">{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#16A34A', // Green
        tabBarInactiveTintColor: '#9CA3AF', // Gray
      }}
    >
      <Tabs.Screen
        name="orders" // This points to orders.tsx
        options={{
          title: 'Live Orders',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏪" focused={focused} />,
        }}
      />
    </Tabs>
  );
}