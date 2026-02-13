import { Tabs } from 'expo-router';
import { Package, ShoppingBag, Store } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // 1. Taller Tab Bar for easier tapping with busy hands
        tabBarStyle: { 
          height: 70, 
          paddingBottom: 12, 
          paddingTop: 12,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          elevation: 0, // Clean look (removes default Android shadow)
        },
        // 2. Professional Colors (Green = Active)
        tabBarActiveTintColor: '#16A34A', 
        tabBarInactiveTintColor: '#9CA3AF', 
        // 3. Readable Text Labels
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
        },
      }}
    >
      {/* TAB 1: LIVE ORDERS */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Live Orders',
          tabBarIcon: ({ color, focused }) => (
            // The "Pill" Effect: Green background when active
            <View className={`p-1.5 rounded-xl ${focused ? 'bg-green-50' : 'bg-transparent'}`}>
              <ShoppingBag size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* TAB 2: INVENTORY (Stock) */}
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-1.5 rounded-xl ${focused ? 'bg-green-50' : 'bg-transparent'}`}>
              <Package size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />

      {/* TAB 3: SHOP (Profile/Settings) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Shop',
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-1.5 rounded-xl ${focused ? 'bg-green-50' : 'bg-transparent'}`}>
              <Store size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}