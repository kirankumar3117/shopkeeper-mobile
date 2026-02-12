import { OrderCard } from '@/src/components/OrderCard';
import { OrderTabs } from '@/src/components/OrderTabs';
import { ShopHeader } from '@/src/components/ShopHeader';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// MOCK DATA
const MOCK_ORDERS = [
  {
    id: '#ORD-4921',
    status: 'new',
    time: '2min ago',
    payment: 'Cash On Delivery',
    total: '845.00',
    items: [
      { name: 'Aashirvaad Atta', qty: '5kg' },
      { name: 'Freedom Oil', qty: '2L' },
    ]
  },
  {
    id: '#ORD-4922',
    status: 'preparing',
    time: '15min ago',
    payment: 'UPI Paid',
    total: '120.00',
    items: [
      { name: 'Milk', qty: '2 pkts' },
      { name: 'Bread', qty: '1 pkt' },
    ]
  },
  {
    id: '#ORD-4920',
    status: 'ready',
    time: '45min ago',
    payment: 'Cash',
    total: '350.00',
    items: [
      { name: 'Rice', qty: '10kg' },
    ]
  }
];

export default function OrdersScreen() {
  const router = useRouter();
  // Changed default state to 'all'
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('all');
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [isStoreOnline, setStoreOnline] = useState(true);

  // --- FILTER & SORT LOGIC ---
  const getSortedOrders = () => {
    let filteredOrders = [];

    if (activeTab === 'all') {
      // Show EVERYTHING
      filteredOrders = [...orders];
    } else {
      // Show Selected Tab AND 'new' orders (New orders must always show)
      filteredOrders = orders.filter(o => o.status === activeTab || o.status === 'new');
    }

    // Sort Order: New (1) -> Preparing (2) -> Ready (3)
    const statusOrder = { 'new': 1, 'preparing': 2, 'ready': 3 };
    filteredOrders.sort((a, b) => {
      return (statusOrder[a.status as keyof typeof statusOrder] || 99) - 
             (statusOrder[b.status as keyof typeof statusOrder] || 99);
    });

    return filteredOrders;
  };

  const displayedOrders = getSortedOrders();

  // Updated Counts Logic (New -> All)
  const getCounts = () => ({
    all: orders.length, // Total count of all orders
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

        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
          {displayedOrders.length === 0 ? (
            <View className="mt-20 items-center opacity-50">
              <Text className="text-5xl mb-4">🥗</Text>
              <Text className="text-gray-500 font-medium">No orders found</Text>
            </View>
          ) : (
            displayedOrders.map((order, index) => {
              // Header Logic: Show if this is the first item OR if status changed from previous item
              const showHeader = index === 0 || order.status !== displayedOrders[index - 1].status;
              
              return (
                <View key={order.id}>
                  
                  {/* DYNAMIC HEADER */}
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