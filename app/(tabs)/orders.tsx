import { OrderCard } from '@/src/components/OrderCard';
import { OrderTabs } from '@/src/components/OrderTabs';
import { ShopHeader } from '@/src/components/ShopHeader';
import { useOrderStore } from '@/src/core/orderStore'; // 👈 IMPORT STORE
import { useRouter } from 'expo-router';
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
             <View className="flex-1 justify-center items-center pb-20">
               <Text>Store Offline</Text>
               <TouchableOpacity onPress={() => setStoreOnline(true)}><Text>Go Online</Text></TouchableOpacity>
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