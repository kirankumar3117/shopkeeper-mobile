import { OrderCard } from '@/src/components/OrderCard';
import { OrderTabs } from '@/src/components/OrderTabs';
import { ShopHeader } from '@/src/components/ShopHeader';
import { useOrders } from '@/src/core/hooks/useOrders';
import { useShopStatus } from '@/src/core/hooks/useShopStatus';
import { useOrderStore } from '@/src/core/orderStore';
import { useRouter, useFocusEffect } from 'expo-router';
import { Moon, Power, RefreshCw, Store } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('all');

  // Shop online/offline — wired to real API
  const { isOnline: isStoreOnline, isToggling, toggleStatus } = useShopStatus();

  // Real API hook
  const { loading, error, fetchOrders, accept, markReady, complete, reject } = useOrders();

  // Global store for reading orders
  const { orders } = useOrderStore();

  // 1. Get exact counts so the UI knows exactly what is left
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  // 2. The dynamic Offline UI trigger
  const showOfflineUI = !isStoreOnline && (
    activeTab === 'all' ||
    (activeTab === 'preparing' && preparingCount === 0) ||
    (activeTab === 'ready' && readyCount === 0)
  );

  // Fetch on mount and focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- FILTER & SORT LOGIC ---
  const getSortedOrders = () => {
    // Filter out picked_up and rejected from active view
    let filteredOrders = orders.filter(o => o.status !== 'picked_up' && o.status !== 'rejected');

    if (activeTab !== 'all') {
      filteredOrders = filteredOrders.filter(o => o.status === activeTab || o.status === 'pending' || o.status === 'confirmed');
    }
    const statusOrder = { 'pending': 1, 'confirmed': 2, 'preparing': 3, 'ready': 4, 'picked_up': 5 };
    filteredOrders.sort((a, b) => {
      const scoreA = statusOrder[a.status as keyof typeof statusOrder] || 99;
      const scoreB = statusOrder[b.status as keyof typeof statusOrder] || 99;
      return scoreA - scoreB;
    });
    return filteredOrders;
  };

  const displayedOrders = getSortedOrders();

  const activeOrders = orders.filter(o => o.status !== 'picked_up' && o.status !== 'rejected');
  const getCounts = () => ({
    all: activeOrders.length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
  });

  // Handlers
  const handleAccept = (orderId: string) => {
    accept(orderId);
  };

  const handleReject = (orderId: string) => {
    reject(orderId);
  };

  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    if (currentStatus === 'preparing') markReady(orderId);
    if (currentStatus === 'ready') complete(orderId);
  };

  // --- SWIPE GESTURE HANDLERS ---
  const TABS = ['all', 'preparing', 'ready'] as const;

  const handleSwipeLeft = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="flex-1" edges={['top']}>

        <ShopHeader
          title="Live Orders"
          isStoreOnline={isStoreOnline}
          isToggling={isToggling}
          onToggleStore={toggleStatus}
        />

        <OrderTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={getCounts()}
        />

        <FlingGestureHandler
          direction={Directions.LEFT}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              handleSwipeLeft();
            }
          }}
        >
          <FlingGestureHandler
            direction={Directions.RIGHT}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.ACTIVE) {
                handleSwipeRight();
              }
            }}
          >
            <View className="flex-1">
              <ScrollView
                className="flex-1 px-4 pt-2"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {showOfflineUI ? (
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
                onPress={() => toggleStatus(true)}
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
          ) : loading && orders.length === 0 ? (
            <View className="flex-1 justify-center items-center pb-20">
              <ActivityIndicator size="large" color="#16A34A" />
              <Text className="text-gray-500 mt-4 font-medium">Loading orders...</Text>
            </View>
          ) : error && orders.length === 0 ? (
            <View className="flex-1 justify-center items-center pb-20 px-8">
              <Text className="text-xl font-bold text-gray-900 mb-2">Failed to load</Text>
              <Text className="text-gray-500 text-center mb-6">{error}</Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-green-600 px-6 py-3 rounded-xl flex-row items-center"
              >
                <RefreshCw size={18} color="white" />
                <Text className="text-white font-bold ml-2">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : displayedOrders.length === 0 ? (
            <View className="flex-1 justify-center items-center pb-20">
              <Text className="text-2xl font-bold text-gray-900">All Caught Up!</Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="mt-4 bg-gray-100 px-4 py-2 rounded-xl flex-row items-center"
              >
                <RefreshCw size={16} color="#6B7280" />
                <Text className="text-gray-600 font-medium ml-2">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {loading && (
                <View className="py-2 items-center">
                  <ActivityIndicator size="small" color="#16A34A" />
                </View>
              )}
              {displayedOrders.map((order, index) => {
                const showHeader = index === 0 || order.status !== displayedOrders[index - 1].status;
                return (
                  <View key={order.id}>
                    {showHeader && (
                      <View className="flex-row items-center py-4 mt-2">
                        <View className="flex-1 h-[1px] bg-gray-300" />
                        <Text className={`mx-3 text-xs font-bold uppercase tracking-widest ${order.status === 'pending' ? 'text-green-700' : 'text-gray-500'
                          }`}>
                          {order.status === 'pending' ? '⚡ New Arrivals' :
                            order.status === 'preparing' ? 'Preparing' :
                              order.status === 'confirmed' ? 'Confirmed' : 'Ready for Pickup'}
                        </Text>
                        <View className="flex-1 h-[1px] bg-gray-300" />
                      </View>
                    )}

                    <OrderCard
                      id={order.id}
                      order_number={order.order_number || order.id.slice(0, 8).toUpperCase()}
                      status={order.status as any}
                      time={order.created_at || 'Just now'}
                      paymentMode={'Cash on Delivery'}
                      total={order.total_amount?.toString() || '0'}
                      items={order.items}
                      listImageUrls={order.list_image_urls}
                      onExpand={() => router.push(`/order-details/${order.id}` as any)}
                      onAccept={() => handleAccept(order.id)}
                      onReject={() => handleReject(order.id)}
                      onStatusUpdate={() => handleStatusUpdate(order.id, order.status)}
                    />
                  </View>
                );
              })}
            </>
          )}
          <View className="h-24" />
          </ScrollView>
            </View>
          </FlingGestureHandler>
        </FlingGestureHandler>
      </SafeAreaView>
    </View>
  );
}