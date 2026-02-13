import { OrderCard } from '@/src/components/OrderCard';
import { OrderTabs } from '@/src/components/OrderTabs';
import { ShopHeader } from '@/src/components/ShopHeader';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// MOCK DATA
const MOCK_ORDERS = [
  // 1. NEW ORDER - Big Monthly Grocery (UPI)
  {
    id: '#ORD-5501',
    status: 'new',
    time: 'Just now',
    payment: 'UPI Paid',
    total: '1,240.00',
    items: [
      { name: 'India Gate Basmati Rice', qty: '5kg' },
      { name: 'Toor Dal (Premium)', qty: '1kg' },
      { name: 'Fortune Sunflower Oil', qty: '1L' },
      { name: 'Tata Salt', qty: '1pkt' },
      { name: 'Everest Chicken Masala', qty: '100g' },
    ]
  },
  
  // 2. NEW ORDER - Handwritten List (Image) -> items array is empty
  {
    id: '#ORD-IMG-02',
    status: 'new',
    time: '2min ago',
    payment: 'Cash On Delivery',
    total: 'Calculating...', 
    items: [] 
  },

  // 3. NEW ORDER - Small Snack Run (Cash)
  {
    id: '#ORD-5498',
    status: 'new',
    time: '5min ago',
    payment: 'Cash On Delivery',
    total: '85.00',
    items: [
      { name: 'Lays Magic Masala', qty: '2 pkts' },
      { name: 'Coke (500ml)', qty: '1 btl' },
    ]
  },

  // 4. PREPARING - Morning Essentials
  {
    id: '#ORD-5490',
    status: 'preparing',
    time: '12min ago',
    payment: 'UPI Paid',
    total: '145.00',
    items: [
      { name: 'Amul Gold Milk', qty: '2 pkts' },
      { name: 'Modern Bread (Brown)', qty: '1 pkt' },
      { name: 'Eggs (Dozen)', qty: '1 box' },
    ]
  },

  // 5. READY - Heavy Item Pickup
  {
    id: '#ORD-5485',
    status: 'ready',
    time: '35min ago',
    payment: 'Cash On Delivery',
    total: '1,350.00',
    items: [
      { name: 'Kurnool Sona Masoori (25kg)', qty: '1 bag' },
    ]
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('all');
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [isStoreOnline, setStoreOnline] = useState(true);

  // --- FILTER & SORT LOGIC ---
  const getSortedOrders = () => {
    let filteredOrders = [];
    if (activeTab === 'all') {
      filteredOrders = [...orders];
    } else {
      filteredOrders = orders.filter(o => o.status === activeTab || o.status === 'new');
    }
    const statusOrder = { 'new': 1, 'preparing': 2, 'ready': 3 };
    filteredOrders.sort((a, b) => {
      return (statusOrder[a.status as keyof typeof statusOrder] || 99) - 
             (statusOrder[b.status as keyof typeof statusOrder] || 99);
    });
    return filteredOrders;
  };

  const displayedOrders = getSortedOrders();

  const getCounts = () => ({
    all: orders.length, 
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  });

  const handleAccept = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'preparing' } : o));
  };

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'preparing' ? 'ready' : 'completed';
    if(nextStatus === 'completed') {
      setOrders(orders.filter(o => o.id !== orderId));
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus as any } : o));
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1" edges={['top']}>

        <ShopHeader
          title="Live Orders"
          isStoreOnline={isStoreOnline}
          onToggleStore={setStoreOnline}
          notificationCount={3}
          onNotificationPress={() => alert('Notifications coming soon!')}
        />

        <OrderTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={getCounts()} 
        />

        <ScrollView 
          className="flex-1 px-4 pt-2" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }} 
        >
          {!isStoreOnline ? (
            // === 🔴 STORE CLOSED VIEW ===
            <View className="flex-1 justify-center items-center pb-20">
              <View className="bg-gray-100 p-8 rounded-full mb-6 border border-gray-200">
                <Text className="text-6xl grayscale opacity-50">🔒</Text> 
              </View>
              <Text className="text-2xl font-bold text-gray-900 tracking-tight">Store is Offline</Text>
              <Text className="text-gray-400 text-center mt-2 px-10 leading-relaxed font-medium mb-8">
                You are not receiving new orders. {"\n"}Go online to start selling.
              </Text>
              <TouchableOpacity 
                onPress={() => setStoreOnline(true)}
                activeOpacity={0.8}
                className="bg-green-600 px-8 py-4 rounded-full shadow-lg shadow-green-200 flex-row items-center"
              >
                <Text className="text-white font-bold text-lg mr-2">Go Online Now</Text>
                <Text className="text-white text-lg">🚀</Text>
              </TouchableOpacity>
            </View>

          ) : displayedOrders.length === 0 ? (
            // === 🟢 ONLINE BUT EMPTY VIEW ===
            <View className="flex-1 justify-center items-center pb-20"> 
              <View className="bg-green-50 p-8 rounded-full mb-6 border border-green-100 shadow-sm">
                <Text className="text-6xl">🥗</Text> 
              </View>
              <Text className="text-2xl font-bold text-gray-900 tracking-tight">All Caught Up!</Text>
              <Text className="text-gray-400 text-center mt-2 px-10 leading-relaxed font-medium">
                No active orders in <Text className="text-green-600 font-bold capitalize">{activeTab}</Text> right now.
                {"\n"}Time to organize the shelves?
              </Text>
            </View>

          ) : (
            // === 🟢 ORDER LIST VIEW ===
            displayedOrders.map((order, index) => {
              const showHeader = index === 0 || order.status !== displayedOrders[index - 1].status;
              return (
                <View key={order.id}>
                  {showHeader && (
                    <View className="flex-row items-center py-4 mt-2">
                      <View className="flex-1 h-[1px] bg-gray-300" />
                      <Text className={`mx-3 text-xs font-bold uppercase tracking-widest ${
                        order.status === 'new' ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {order.status === 'new' ? '⚡ New Arrivals' : 
                         order.status === 'preparing' ? 'Preparing' : 'Ready for Pickup'}
                      </Text>
                      <View className="flex-1 h-[1px] bg-gray-300" />
                    </View>
                  )}
                  
                  <OrderCard 
                    id={order.id}
                    status={order.status as any}
                    time={order.time}
                    paymentMode={order.payment}
                    total={order.total}
                    items={order.items}
                    // 👇 This function navigates to details page
                    onExpand={() => router.push({
                      pathname: "/order-details/[id]",
                      params: { id: order.id } 
                    })}
                    onAccept={() => handleAccept(order.id)}
                    onStatusUpdate={() => handleStatusUpdate(order.id, order.status)}
                  />
                </View>
              );
            })
          )}
          
          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}