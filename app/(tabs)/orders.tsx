import { OrderCard } from '@/src/components/OrderCard';
import { ShopHeader } from '@/src/components/ShopHeader';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
      { name: 'Tata Salt', qty: '3 pkts' },
      { name: 'Maggi', qty: '2 pkts' }, 
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
  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready'>('new');
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [isStoreOnline, setStoreOnline] = useState(true);

  // Filter orders
  const filteredOrders = orders.filter(o => o.status === activeTab);

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
      <SafeAreaView className="flex-1" edges={['top']}> {/* Optimized Safe Area */}

        {/* 1. Header */}
        <ShopHeader
          title="Live Orders"
          isStoreOnline={isStoreOnline}
          onToggleStore={setStoreOnline}
          notificationCount={3}
          onNotificationPress={() => alert('Notifications coming soon!')}
        />

        {/* 2. Tabs (Improved Spacing) */}
        <View className="flex-row px-4 pt-4 pb-2 space-x-3 bg-gray-50">
          {['new', 'preparing', 'ready'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-full border shadow-sm ${
                activeTab === tab 
                  ? 'bg-green-600 border-green-600' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`font-bold capitalize ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. Orders List */}
        <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
          {filteredOrders.length === 0 ? (
            <View className="mt-20 items-center opacity-50">
              <Text className="text-5xl mb-4">🥗</Text>
              <Text className="text-gray-500 font-medium">No orders in {activeTab}</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard 
                key={order.id}
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
            ))
          )}
          
          {/* Bottom spacer so content doesn't get hidden behind tabs */}
          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}