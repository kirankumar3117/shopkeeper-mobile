import { OrderCard } from '@/src/components/OrderCard';
import { OrderTabs } from '@/src/components/OrderTabs';
import { ShopHeader } from '@/src/components/ShopHeader';
import { useOrderStore } from '@/src/core/orderStore'; // 👈 IMPORT STORE
import { useRouter } from 'expo-router';
import { Moon, Power, Store } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('all');
  const [isStoreOnline, setStoreOnline] = useState(true);

  // 👇 REPLACE LOCAL STATE WITH GLOBAL STORE
  const { orders, acceptOrder, markReady, completeOrder } = useOrderStore();

  // --- FILTER & SORT LOGIC ---
  const getSortedOrders = () => {
    let filteredOrders = [];
    if (activeTab === 'all') {
      filteredOrders = [...orders];
    } else {
      // Logic: If I am in 'preparing', show only 'preparing' + 'new'
      filteredOrders = orders.filter(o => o.status === activeTab || o.status === 'new');
    }
    const statusOrder = { 'new': 1, 'preparing': 2, 'ready': 3 };
    filteredOrders.sort((a, b) => {
      // Sort by status priority
      const scoreA = statusOrder[a.status as keyof typeof statusOrder] || 99;
      const scoreB = statusOrder[b.status as keyof typeof statusOrder] || 99;
      return scoreA - scoreB;
    });
    return filteredOrders;
  };

  const displayedOrders = getSortedOrders();

  const getCounts = () => ({
    all: orders.length, 
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  });

  // Wrapper for Store Actions to match OrderCard expectations
  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    if (currentStatus === 'preparing') markReady(orderId);
    if (currentStatus === 'ready') completeOrder(orderId);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1" edges={['top']}>

        <ShopHeader
          title="Live Orders"
          isStoreOnline={isStoreOnline}
          onToggleStore={setStoreOnline}
          notificationCount={3}
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
            <View className="flex-1 justify-center items-center bg-gray-50 px-8">
  
  {/* 1. Pulse Animation / Icon Container */}
  <View className="items-center justify-center mb-8">
    {/* Outer Ring */}
    <View className="w-40 h-40 bg-gray-200 rounded-full items-center justify-center opacity-50 absolute" />
    {/* Inner Circle */}
    <View className="w-32 h-32 bg-white rounded-full items-center justify-center shadow-sm elevation-5">
      <Store size={56} color="#9CA3AF" />
      {/* Status Badge */}
      <View className="absolute bottom-2 right-2 bg-gray-500 w-8 h-8 rounded-full border-4 border-white items-center justify-center">
        <Moon size={14} color="white" strokeWidth={3} />
      </View>
    </View>
  </View>

  {/* 2. Status Text */}
  <Text className="text-3xl font-bold text-gray-900 mb-3">
    You're Offline
  </Text>
  <Text className="text-gray-500 text-center text-base mb-10 leading-6 px-4">
    Your shop is currently closed to customers. Go online to start receiving new orders.
  </Text>

  {/* 3. "Go Online" Button */}
  <TouchableOpacity 
    onPress={() => setStoreOnline(true)}
    activeOpacity={0.8}
    className="w-full bg-green-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-green-200"
    style={{ 
      elevation: 6, 
      shadowColor: '#10B981', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.3, 
      shadowRadius: 8 
    }}
  >
    <Power size={22} color="white" strokeWidth={2.5} />
    <Text className="text-white font-bold text-lg ml-3 tracking-wide">
      GO ONLINE
    </Text>
  </TouchableOpacity>

</View>
          ) : displayedOrders.length === 0 ? (
             <View className="flex-1 justify-center items-center pb-20"> 
               <Text className="text-2xl font-bold text-gray-900">All Caught Up!</Text>
             </View>
          ) : (
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
                    onExpand={() => router.push({
                      pathname: "/order-details/[id]",
                      params: { id: order.id } 
                    })}
                    // 👇 USING STORE ACTIONS HERE
                    onAccept={() => acceptOrder(order.id)}
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