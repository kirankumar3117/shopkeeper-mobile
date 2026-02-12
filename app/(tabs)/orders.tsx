import { OrderCard } from '@/src/components/OrderCard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Keep your MOCK_ORDERS data here (same as before)
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
      <SafeAreaView className="flex-1">
        
        {/* Header - The "Smart Kirana" Green/White look */}
        <View className="px-6 py-4 bg-white shadow-sm flex-row justify-between items-center z-10">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Live Orders</Text>
            <View className="flex-row items-center mt-1">
              <View className="h-2 w-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-gray-500 font-medium text-sm">Store is Online</Text>
            </View>
          </View>
          <View className="h-10 w-10 bg-green-50 rounded-full items-center justify-center">
            <Text className="text-xl">🔔</Text>
          </View>
        </View>

        {/* Tabs - Green Pills */}
        <View className="flex-row px-4 py-6 space-x-3">
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

        {/* List */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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
          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}